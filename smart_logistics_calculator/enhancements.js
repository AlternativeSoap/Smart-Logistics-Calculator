/**
 * Smart Logistics Calculator - Feature Enhancements
 * Part 1: ABC Analysis Enhancements
 */

// ============================================
// ABC ANALYSIS ENHANCEMENTS
// ============================================

const ABCEnhancements = {
    // Store thresholds per dataset
    thresholdMemory: {
        save(filename, thresholds) {
            const key = 'abc_thresholds_' + this.hashFilename(filename);
            localStorage.setItem(key, JSON.stringify(thresholds));
        },
        
        load(filename) {
            const key = 'abc_thresholds_' + this.hashFilename(filename);
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        },
        
        hashFilename(filename) {
            let hash = 0;
            for (let i = 0; i < filename.length; i++) {
                const char = filename.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return Math.abs(hash).toString(16);
        }
    },

    // Matrix drill-down functionality
    matrixDrillDown: {
        currentFilter: null,
        
        init() {
            // Add click listeners to matrix cells after matrix is rendered
            document.addEventListener('click', (e) => {
                const cell = e.target.closest('.matrix-cell-clickable');
                if (cell) {
                    const volumeClass = cell.dataset.volumeClass;
                    const valueClass = cell.dataset.valueClass;
                    this.filterByCell(volumeClass, valueClass);
                }
            });
        },
        
        filterByCell(volumeClass, valueClass) {
            if (!window.currentABCData) return;
            
            const filtered = window.currentABCData.filter(item => 
                item.volumeClass === volumeClass && item.valueClass === valueClass
            );
            
            this.currentFilter = { volumeClass, valueClass };
            this.showFilteredModal(filtered, volumeClass, valueClass);
        },
        
        showFilteredModal(items, volumeClass, valueClass) {
            const lang = window.currentLanguage || 'da';
            const title = lang === 'da' 
                ? `Varer i ${volumeClass}/${valueClass} (${items.length} varer)`
                : `Items in ${volumeClass}/${valueClass} (${items.length} items)`;
            
            let tableHTML = `
                <div class="overflow-x-auto max-h-96">
                    <table class="min-w-full text-sm">
                        <thead class="bg-gray-100 dark:bg-gray-700 sticky top-0">
                            <tr>
                                <th class="px-3 py-2 text-left">${lang === 'da' ? 'Varenr' : 'Item'}</th>
                                <th class="px-3 py-2 text-right">${lang === 'da' ? 'Værdi' : 'Value'}</th>
                                <th class="px-3 py-2 text-right">${lang === 'da' ? 'Antal' : 'Quantity'}</th>
                                <th class="px-3 py-2 text-center">${lang === 'da' ? 'Konfidensgrad' : 'Confidence'}</th>
                            </tr>
                        </thead>
                        <tbody>`;
            
            items.forEach(item => {
                const confidence = item.confidence || 100;
                const confidenceColor = confidence >= 80 ? 'text-green-600' : confidence >= 50 ? 'text-yellow-600' : 'text-red-600';
                tableHTML += `
                    <tr class="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td class="px-3 py-2">${item.name || item.id}</td>
                        <td class="px-3 py-2 text-right">${formatNumber(item.value)}</td>
                        <td class="px-3 py-2 text-right">${formatNumber(item.quantity || 0)}</td>
                        <td class="px-3 py-2 text-center ${confidenceColor}">${confidence.toFixed(0)}%</td>
                    </tr>`;
            });
            
            tableHTML += '</tbody></table></div>';
            
            showEnhancedModal(title, tableHTML);
        },
        
        clearFilter() {
            this.currentFilter = null;
        }
    },

    // Classification confidence scores
    confidenceScores: {
        calculate(item, thresholdA, thresholdB, totalValue) {
            const percentage = (item.cumulativeValue / totalValue) * 100;
            let confidence = 100;
            let classification = '';
            
            if (percentage <= thresholdA) {
                classification = 'A';
                // How close to threshold B boundary?
                const distanceToB = thresholdA - percentage;
                const range = thresholdA;
                confidence = Math.min(100, (distanceToB / range) * 100 + 50);
            } else if (percentage <= thresholdB) {
                classification = 'B';
                // Distance from both A and C boundaries
                const distanceToA = percentage - thresholdA;
                const distanceToC = thresholdB - percentage;
                const range = thresholdB - thresholdA;
                const minDistance = Math.min(distanceToA, distanceToC);
                confidence = Math.min(100, (minDistance / (range / 2)) * 50 + 50);
            } else {
                classification = 'C';
                const distanceToB = percentage - thresholdB;
                const range = 100 - thresholdB;
                confidence = Math.min(100, (distanceToB / range) * 100 + 50);
            }
            
            return { classification, confidence: Math.round(confidence) };
        },
        
        getBadgeHTML(confidence) {
            const lang = window.currentLanguage || 'da';
            const titleText = lang === 'da' ? 'Konfidensgrad' : 'Confidence';
            let color, label;
            if (confidence >= 80) {
                color = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
                label = '●';
            } else if (confidence >= 50) {
                color = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
                label = '◐';
            } else {
                color = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
                label = '○';
            }
            return `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}" title="${titleText}: ${confidence}%">${label} ${confidence}%</span>`;
        }
    }
};

// ============================================
// EOQ ENHANCEMENTS
// ============================================

const EOQEnhancements = {
    // Sensitivity analysis
    sensitivityAnalysis: {
        calculate(baseEOQ, demand, orderCost, holdingCost) {
            const variations = [-20, -10, 0, 10, 20];
            const results = [];
            
            variations.forEach(demandVar => {
                const row = { demandVar };
                variations.forEach(costVar => {
                    const adjDemand = demand * (1 + demandVar / 100);
                    const adjOrderCost = orderCost * (1 + costVar / 100);
                    const eoq = Math.sqrt((2 * adjDemand * adjOrderCost) / holdingCost);
                    row[`cost_${costVar}`] = Math.round(eoq);
                });
                results.push(row);
            });
            
            return results;
        },
        
        renderTable(results, baseEOQ) {
            const lang = window.currentLanguage || 'da';
            const demandLabel = lang === 'da' ? 'Efterspørgsel' : 'Demand';
            const costLabel = lang === 'da' ? 'Ordreomk.' : 'Order Cost';
            
            let html = `
                <div class="sensitivity-table-container mt-4">
                    <h4 class="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        ${lang === 'da' ? 'Følsomhedsanalyse' : 'Sensitivity Analysis'}
                    </h4>
                    <div class="overflow-x-auto">
                        <table class="min-w-full text-xs border-collapse">
                            <thead>
                                <tr class="bg-gray-100 dark:bg-gray-700">
                                    <th class="p-2 border dark:border-gray-600">${demandLabel} \\ ${costLabel}</th>
                                    <th class="p-2 border dark:border-gray-600">-20%</th>
                                    <th class="p-2 border dark:border-gray-600">-10%</th>
                                    <th class="p-2 border dark:border-gray-600">0%</th>
                                    <th class="p-2 border dark:border-gray-600">+10%</th>
                                    <th class="p-2 border dark:border-gray-600">+20%</th>
                                </tr>
                            </thead>
                            <tbody>`;
            
            results.forEach(row => {
                html += `<tr>
                    <td class="p-2 border dark:border-gray-600 font-medium bg-gray-50 dark:bg-gray-700">${row.demandVar >= 0 ? '+' : ''}${row.demandVar}%</td>`;
                
                [-20, -10, 0, 10, 20].forEach(costVar => {
                    const value = row[`cost_${costVar}`];
                    const diff = ((value - baseEOQ) / baseEOQ * 100).toFixed(1);
                    const isBase = row.demandVar === 0 && costVar === 0;
                    const bgClass = isBase ? 'bg-blue-100 dark:bg-blue-900 font-bold' : '';
                    const textClass = diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : '';
                    
                    html += `<td class="p-2 border dark:border-gray-600 text-center ${bgClass}">
                        ${formatNumber(value)}
                        ${!isBase ? `<span class="block text-xs ${textClass}">(${diff > 0 ? '+' : ''}${diff}%)</span>` : ''}
                    </td>`;
                });
                
                html += '</tr>';
            });
            
            html += '</tbody></table></div></div>';
            return html;
        }
    },

    // Real-time slider mode
    realtimeSliders: {
        enabled: false,
        debounceTimer: null,
        
        init() {
            // Will be called after DOM is ready
        },
        
        toggle(enabled) {
            this.enabled = enabled;
            localStorage.setItem('eoq_realtime_sliders', enabled ? '1' : '0');
        },
        
        isEnabled() {
            return localStorage.getItem('eoq_realtime_sliders') === '1';
        },
        
        attachToSlider(slider, calculateFn) {
            slider.addEventListener('input', () => {
                if (!this.enabled) return;
                
                clearTimeout(this.debounceTimer);
                this.debounceTimer = setTimeout(() => {
                    calculateFn();
                }, 150);
            });
        }
    }
};

// ============================================
// INVENTORY ENHANCEMENTS
// ============================================

const InventoryEnhancements = {
    // Unified dashboard card
    unifiedDashboard: {
        render(ropData, periodicData, minMaxData) {
            const lang = window.currentLanguage || 'da';
            
            const labels = {
                da: {
                    title: 'Sammenligning af Lagerstyringsmetoder',
                    rop: 'Genbestillingspunkt',
                    periodic: 'Periodisk Gennemgang',
                    minmax: 'Min/Max System',
                    safetyStock: 'Sikkerhedslager',
                    orderQty: 'Ordremængde',
                    reviewPeriod: 'Gennemgangsperiode'
                },
                en: {
                    title: 'Inventory Method Comparison',
                    rop: 'Reorder Point',
                    periodic: 'Periodic Review',
                    minmax: 'Min/Max System',
                    safetyStock: 'Safety Stock',
                    orderQty: 'Order Quantity',
                    reviewPeriod: 'Review Period'
                }
            };
            const t = labels[lang];
            
            return `
                <div class="unified-inventory-card bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-6">
                    <h3 class="text-lg font-bold mb-4 text-gray-800 dark:text-white">${t.title}</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="method-card p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-l-4 border-blue-500">
                            <h4 class="font-semibold text-blue-700 dark:text-blue-300">${t.rop}</h4>
                            <div class="mt-2 space-y-1 text-sm">
                                <p><span class="text-gray-600 dark:text-gray-400">${t.safetyStock}:</span> <strong>${formatNumber(ropData?.safetyStock || 0)}</strong></p>
                                <p><span class="text-gray-600 dark:text-gray-400">ROP:</span> <strong>${formatNumber(ropData?.rop || 0)}</strong></p>
                            </div>
                        </div>
                        <div class="method-card p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border-l-4 border-green-500">
                            <h4 class="font-semibold text-green-700 dark:text-green-300">${t.periodic}</h4>
                            <div class="mt-2 space-y-1 text-sm">
                                <p><span class="text-gray-600 dark:text-gray-400">${t.reviewPeriod}:</span> <strong>${periodicData?.period || 0} ${lang === 'da' ? 'dage' : 'days'}</strong></p>
                                <p><span class="text-gray-600 dark:text-gray-400">${t.orderQty}:</span> <strong>${formatNumber(periodicData?.orderQty || 0)}</strong></p>
                            </div>
                        </div>
                        <div class="method-card p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg border-l-4 border-purple-500">
                            <h4 class="font-semibold text-purple-700 dark:text-purple-300">${t.minmax}</h4>
                            <div class="mt-2 space-y-1 text-sm">
                                <p><span class="text-gray-600 dark:text-gray-400">Min:</span> <strong>${formatNumber(minMaxData?.min || 0)}</strong></p>
                                <p><span class="text-gray-600 dark:text-gray-400">Max:</span> <strong>${formatNumber(minMaxData?.max || 0)}</strong></p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    },

    // Safety stock gauge
    safetyStockGauge: {
        render(currentStock, safetyStock, maxStock) {
            const ratio = safetyStock > 0 ? currentStock / safetyStock : 0;
            let color, status, statusText;
            const lang = window.currentLanguage || 'da';
            
            if (ratio >= 1.5) {
                color = '#22c55e'; // green
                status = 'excellent';
                statusText = lang === 'da' ? 'Udmærket' : 'Excellent';
            } else if (ratio >= 1) {
                color = '#84cc16'; // lime
                status = 'good';
                statusText = lang === 'da' ? 'God' : 'Good';
            } else if (ratio >= 0.7) {
                color = '#eab308'; // yellow
                status = 'warning';
                statusText = lang === 'da' ? 'Advarsel' : 'Warning';
            } else {
                color = '#ef4444'; // red
                status = 'critical';
                statusText = lang === 'da' ? 'Kritisk' : 'Critical';
            }
            
            const percentage = Math.min(100, ratio * 100);
            
            return `
                <div class="safety-stock-gauge flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div class="gauge-visual relative w-24 h-24">
                        <svg viewBox="0 0 100 100" class="transform -rotate-90">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" stroke-width="12"/>
                            <circle cx="50" cy="50" r="40" fill="none" stroke="${color}" stroke-width="12"
                                stroke-dasharray="${percentage * 2.51} 251" stroke-linecap="round"/>
                        </svg>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <span class="text-lg font-bold" style="color: ${color}">${Math.round(percentage)}%</span>
                        </div>
                    </div>
                    <div class="gauge-info">
                        <p class="text-sm text-gray-600 dark:text-gray-400">${lang === 'da' ? 'Sikkerhedslager Status' : 'Safety Stock Status'}</p>
                        <p class="text-xl font-bold" style="color: ${color}">${statusText}</p>
                        <p class="text-xs text-gray-500">${formatNumber(currentStock)} / ${formatNumber(safetyStock)} ${lang === 'da' ? 'enheder' : 'units'}</p>
                    </div>
                </div>
            `;
        },
        
        // Update method called from script.js
        update(data) {
            // This is called from updateSafetyStockGauge in script.js
            // The actual gauge update is handled in that function
            // This method can be used for additional processing if needed
            console.log('Safety stock gauge data:', data);
        }
    }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatNumber(num) {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    const lang = window.currentLanguage || 'da';
    const locale = lang === 'da' ? 'da-DK' : 'en-US';
    return num.toLocaleString(locale, { maximumFractionDigits: 2 });
}

function showEnhancedModal(title, content, actions = []) {
    // Remove existing modal
    const existing = document.getElementById('enhanced-modal');
    if (existing) existing.remove();
    
    const lang = window.currentLanguage || 'da';
    const closeText = lang === 'da' ? 'Luk' : 'Close';
    
    const modal = document.createElement('div');
    modal.id = 'enhanced-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50';
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div class="flex items-center justify-between p-4 border-b dark:border-gray-700">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-white">${title}</h3>
                <button onclick="closeEnhancedModal()" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            <div class="p-4 overflow-y-auto max-h-[60vh]">${content}</div>
            <div class="flex justify-end gap-2 p-4 border-t dark:border-gray-700">
                ${actions.map(a => `<button onclick="${a.action}" class="px-4 py-2 ${a.class || 'bg-gray-200 dark:bg-gray-700'} rounded-lg hover:opacity-80">${a.label}</button>`).join('')}
                <button onclick="closeEnhancedModal()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">${closeText}</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeEnhancedModal();
    });
}

function closeEnhancedModal() {
    const modal = document.getElementById('enhanced-modal');
    if (modal) modal.remove();
}

// ============================================
// INITIALIZATION
// ============================================

function initEnhancements() {
    console.log('Initializing Smart Logistics Calculator Enhancements...');
    
    // Initialize ABC enhancements
    ABCEnhancements.matrixDrillDown.init();
    
    // Initialize EOQ real-time sliders
    EOQEnhancements.realtimeSliders.enabled = EOQEnhancements.realtimeSliders.isEnabled();
    
    console.log('Enhancements initialized successfully!');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEnhancements);
} else {
    initEnhancements();
}

// Export for global access
window.ABCEnhancements = ABCEnhancements;
window.EOQEnhancements = EOQEnhancements;
window.InventoryEnhancements = InventoryEnhancements;
window.showEnhancedModal = showEnhancedModal;
window.closeEnhancedModal = closeEnhancedModal;
