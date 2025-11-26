/**
 * Smart Logistics Calculator - Feature Enhancements
 * Part 2: Budget, LEAN, Dashboard, Compare
 */

// ============================================
// BUDGET ENHANCEMENTS
// ============================================

const BudgetEnhancements = {
    // Sparkline trends (tiny inline charts)
    sparklines: {
        render(values, options = {}) {
            // Support both (values, width, height) and (values, {width, height, color})
            let width = 60, height = 20, color = null;
            if (typeof options === 'object') {
                width = options.width || 60;
                height = options.height || 20;
                color = options.color || null;
            } else if (typeof options === 'number') {
                width = options;
                height = arguments[2] || 20;
            }
            
            if (!values || values.length < 2) return '';
            
            const min = Math.min(...values);
            const max = Math.max(...values);
            const range = max - min || 1;
            
            const points = values.map((v, i) => {
                const x = (i / (values.length - 1)) * width;
                const y = height - ((v - min) / range) * height;
                return `${x},${y}`;
            }).join(' ');
            
            // Use provided color or calculate trend color
            const trend = color || (values[values.length - 1] > values[0] ? '#22c55e' : values[values.length - 1] < values[0] ? '#ef4444' : '#6b7280');
            
            return `
                <svg class="sparkline inline-block ml-2" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
                    <polyline fill="none" stroke="${trend}" stroke-width="1.5" points="${points}"/>
                    <circle cx="${width}" cy="${height - ((values[values.length - 1] - min) / range) * height}" r="2" fill="${trend}"/>
                </svg>
            `;
        }
    },

    // Month-over-month highlight
    monthOverMonth: {
        calculateChange(current, previous) {
            if (!previous || previous === 0) return 0;
            return ((current - previous) / Math.abs(previous)) * 100;
        },
        
        getHighlightClass(changePercent) {
            if (changePercent > 10) return 'bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500';
            if (changePercent < -10) return 'bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500';
            return '';
        },
        
        getBadge(changePercent) {
            if (Math.abs(changePercent) <= 10) return '';
            const color = changePercent > 0 ? 'text-green-600' : 'text-red-600';
            const arrow = changePercent > 0 ? '↑' : '↓';
            return `<span class="text-xs ${color} ml-1">${arrow}${Math.abs(changePercent).toFixed(0)}%</span>`;
        }
    }
};

// ============================================
// LEAN ENHANCEMENTS  
// ============================================

const LEANEnhancements = {
    // World-class benchmarks
    benchmarks: {
        OEE: {
            worldClass: 85,
            good: 70,
            average: 55
        },
        availability: { worldClass: 90, good: 85, average: 75 },
        performance: { worldClass: 95, good: 90, average: 80 },
        quality: { worldClass: 99.9, good: 98, average: 95 },
        
        getBenchmarkLines() {
            const lang = window.currentLanguage || 'da';
            return [
                { value: 85, label: lang === 'da' ? 'Verdensklasse' : 'World Class', color: '#22c55e' },
                { value: 70, label: lang === 'da' ? 'God' : 'Good', color: '#eab308' },
                { value: 55, label: lang === 'da' ? 'Gennemsnit' : 'Average', color: '#f97316' }
            ];
        },
        
        getStatus(oee) {
            const lang = window.currentLanguage || 'da';
            if (oee >= 85) return { status: 'world-class', color: '#22c55e', label: lang === 'da' ? 'Verdensklasse' : 'World Class' };
            if (oee >= 70) return { status: 'good', color: '#84cc16', label: lang === 'da' ? 'God' : 'Good' };
            if (oee >= 55) return { status: 'average', color: '#eab308', label: lang === 'da' ? 'Gennemsnit' : 'Average' };
            return { status: 'below', color: '#ef4444', label: lang === 'da' ? 'Under gennemsnit' : 'Below Average' };
        }
    },

    // 7 Wastes pie chart
    wastesPieChart: {
        wastes: {
            da: ['Transport', 'Lager', 'Bevægelse', 'Ventetid', 'Overproduktion', 'Overforarbejdning', 'Defekter'],
            en: ['Transport', 'Inventory', 'Motion', 'Waiting', 'Overproduction', 'Over-processing', 'Defects']
        },
        colors: ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#06b6d4', '#8b5cf6'],
        
        render(values, containerId) {
            const lang = window.currentLanguage || 'da';
            const labels = this.wastes[lang];
            
            const data = [{
                values: values,
                labels: labels,
                type: 'pie',
                marker: { colors: this.colors },
                textinfo: 'label+percent',
                textposition: 'outside',
                hovertemplate: '%{label}: %{value}<br>%{percent}<extra></extra>'
            }];
            
            const layout = {
                title: lang === 'da' ? '7 Spildtyper Fordeling' : '7 Wastes Distribution',
                showlegend: true,
                legend: { orientation: 'h', y: -0.2 },
                margin: { t: 50, b: 80, l: 20, r: 20 },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                font: { color: document.documentElement.classList.contains('dark') ? '#fff' : '#333' }
            };
            
            if (window.Plotly) {
                Plotly.newPlot(containerId, data, layout, { responsive: true });
            }
        }
    }
};

// ============================================
// DASHBOARD ENHANCEMENTS
// ============================================

const DashboardEnhancements = {
    // Smart suggestions
    suggestions: {
        getFrequentFeatures() {
            const usage = JSON.parse(localStorage.getItem('feature_usage') || '{}');
            return Object.entries(usage)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([feature]) => feature);
        },
        
        trackUsage(feature) {
            const usage = JSON.parse(localStorage.getItem('feature_usage') || '{}');
            usage[feature] = (usage[feature] || 0) + 1;
            localStorage.setItem('feature_usage', JSON.stringify(usage));
        },
        
        getSuggestionHTML() {
            const frequent = this.getFrequentFeatures();
            const lang = window.currentLanguage || 'da';
            
            if (frequent.length === 0) return '';
            
            return `
                <div class="suggestions-bar bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
                    <p class="text-sm text-blue-700 dark:text-blue-300 mb-2">
                        <svg class="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"/>
                        </svg>
                        ${lang === 'da' ? 'Foreslåede handlinger baseret på din brug:' : 'Suggested actions based on your usage:'}
                    </p>
                    <div class="flex flex-wrap gap-2">
                        ${frequent.map(f => `<button onclick="DashboardEnhancements.suggestions.goToFeature('${f}')" class="px-3 py-1 text-xs bg-white dark:bg-gray-700 rounded-full shadow hover:shadow-md transition-shadow">${f}</button>`).join('')}
                    </div>
                </div>
            `;
        },
        
        goToFeature(feature) {
            // Map feature names to tab IDs
            const featureMap = {
                'ABC Analysis': 'abc', 'ABC Analyse': 'abc',
                'Wilson EOQ': 'wilson',
                'Inventory': 'inventory', 'Lagerstyring': 'inventory',
                'Budget': 'budget',
                'LEAN': 'lean',
                'Compare': 'compare', 'Sammenlign': 'compare'
            };
            const tabId = featureMap[feature] || feature.toLowerCase();
            if (typeof switchTab === 'function') switchTab(tabId);
        }
    },

    // Keyboard shortcuts
    shortcuts: {
        mapping: {},
        
        init() {
            document.addEventListener('keydown', (e) => {
                // Only trigger if not in input field
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                
                const key = e.key;
                if (key >= '1' && key <= '9') {
                    e.preventDefault();
                    this.triggerShortcut(parseInt(key));
                }
            });
        },
        
        setShortcuts(quickActions) {
            this.mapping = {};
            quickActions.slice(0, 9).forEach((action, index) => {
                this.mapping[index + 1] = action;
            });
        },
        
        triggerShortcut(num) {
            const action = this.mapping[num];
            if (action && action.onClick) {
                action.onClick();
            }
        },
        
        getShortcutBadge(num) {
            return `<kbd class="ml-2 px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 rounded">${num}</kbd>`;
        }
    }
};

// ============================================
// COMPARE ENHANCEMENTS
// ============================================

const CompareEnhancements = {
    // Trend arrows
    trendArrows: {
        getArrow(oldClass, newClass) {
            const classOrder = { 'A': 1, 'B': 2, 'C': 3 };
            const oldVal = classOrder[oldClass] || 0;
            const newVal = classOrder[newClass] || 0;
            
            // Labels are kept in English for internal comparison logic
            if (newVal < oldVal) return { arrow: '↑', color: 'text-green-600', label: 'upgraded' };
            if (newVal > oldVal) return { arrow: '↓', color: 'text-red-600', label: 'downgraded' };
            return { arrow: '→', color: 'text-gray-500', label: 'stable' };
        },
        
        renderArrow(oldClass, newClass) {
            const { arrow, color } = this.getArrow(oldClass, newClass);
            return `<span class="text-xl ${color} font-bold">${arrow}</span>`;
        }
    },

    // Change summary cards
    changeSummary: {
        calculate(comparisons) {
            const summary = { upgraded: 0, downgraded: 0, stable: 0 };
            
            comparisons.forEach(item => {
                const { label } = CompareEnhancements.trendArrows.getArrow(item.oldClass, item.newClass);
                if (label === 'upgraded') summary.upgraded++;
                else if (label === 'downgraded') summary.downgraded++;
                else summary.stable++;
            });
            
            return summary;
        },
        
        render(summary) {
            const lang = window.currentLanguage || 'da';
            const labels = {
                da: { upgraded: 'Opgraderet', downgraded: 'Nedgraderet', stable: 'Stabil', total: 'Total' },
                en: { upgraded: 'Upgraded', downgraded: 'Downgraded', stable: 'Stable', total: 'Total' }
            };
            const t = labels[lang];
            const total = summary.upgraded + summary.downgraded + summary.stable;
            
            return `
                <div class="change-summary-cards grid grid-cols-4 gap-4 mb-6">
                    <div class="summary-card bg-green-50 dark:bg-green-900/30 p-4 rounded-lg text-center">
                        <p class="text-3xl font-bold text-green-600">${summary.upgraded}</p>
                        <p class="text-sm text-green-700 dark:text-green-300">${t.upgraded}</p>
                        <p class="text-xs text-gray-500">${((summary.upgraded/total)*100).toFixed(1)}%</p>
                    </div>
                    <div class="summary-card bg-red-50 dark:bg-red-900/30 p-4 rounded-lg text-center">
                        <p class="text-3xl font-bold text-red-600">${summary.downgraded}</p>
                        <p class="text-sm text-red-700 dark:text-red-300">${t.downgraded}</p>
                        <p class="text-xs text-gray-500">${((summary.downgraded/total)*100).toFixed(1)}%</p>
                    </div>
                    <div class="summary-card bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                        <p class="text-3xl font-bold text-gray-600 dark:text-gray-300">${summary.stable}</p>
                        <p class="text-sm text-gray-700 dark:text-gray-300">${t.stable}</p>
                        <p class="text-xs text-gray-500">${((summary.stable/total)*100).toFixed(1)}%</p>
                    </div>
                    <div class="summary-card bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg text-center">
                        <p class="text-3xl font-bold text-blue-600">${total}</p>
                        <p class="text-sm text-blue-700 dark:text-blue-300">${t.total}</p>
                        <p class="text-xs text-gray-500">100%</p>
                    </div>
                </div>
            `;
        }
    }
};

// ============================================
// UPLOAD ENHANCEMENTS
// ============================================

const UploadEnhancements = {
    // Data quality score
    qualityScore: {
        calculate(data) {
            if (!data || !data.length) return { score: 0, issues: [] };
            
            const issues = [];
            let deductions = 0;
            
            // Check for empty values
            const totalCells = data.length * Object.keys(data[0]).length;
            let emptyCells = 0;
            data.forEach(row => {
                Object.values(row).forEach(val => {
                    if (val === null || val === undefined || val === '') emptyCells++;
                });
            });
            const emptyPercent = (emptyCells / totalCells) * 100;
            if (emptyPercent > 5) {
                issues.push({ type: 'empty', percent: emptyPercent.toFixed(1), severity: 'warning' });
                deductions += Math.min(20, emptyPercent);
            }
            
            // Check for outliers in numeric columns
            const numericCols = Object.keys(data[0]).filter(key => {
                return data.some(row => typeof row[key] === 'number' && !isNaN(row[key]));
            });
            
            numericCols.forEach(col => {
                const values = data.map(r => r[col]).filter(v => typeof v === 'number' && !isNaN(v));
                if (values.length < 3) return;
                
                const mean = values.reduce((a, b) => a + b, 0) / values.length;
                const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
                const outliers = values.filter(v => Math.abs(v - mean) > 3 * std).length;
                
                if (outliers > 0) {
                    issues.push({ type: 'outlier', column: col, count: outliers, severity: 'info' });
                    deductions += outliers * 2;
                }
            });
            
            // Check for duplicates
            const seen = new Set();
            let duplicates = 0;
            data.forEach(row => {
                const key = JSON.stringify(row);
                if (seen.has(key)) duplicates++;
                seen.add(key);
            });
            if (duplicates > 0) {
                issues.push({ type: 'duplicate', count: duplicates, severity: 'warning' });
                deductions += duplicates * 5;
            }
            
            const score = Math.max(0, 100 - deductions);
            return { score, issues };
        },
        
        render(quality) {
            const lang = window.currentLanguage || 'da';
            const { score, issues } = quality;
            
            let color, label;
            if (score >= 90) { color = '#22c55e'; label = lang === 'da' ? 'Fremragende' : 'Excellent'; }
            else if (score >= 70) { color = '#84cc16'; label = lang === 'da' ? 'God' : 'Good'; }
            else if (score >= 50) { color = '#eab308'; label = lang === 'da' ? 'Acceptabel' : 'Acceptable'; }
            else { color = '#ef4444'; label = lang === 'da' ? 'Dårlig' : 'Poor'; }
            
            const issueLabels = {
                da: { empty: 'Tomme felter', outlier: 'Outliers', duplicate: 'Duplikater' },
                en: { empty: 'Empty cells', outlier: 'Outliers', duplicate: 'Duplicates' }
            };
            
            return `
                <div class="quality-score-card bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mt-4">
                    <div class="flex items-center gap-4">
                        <div class="score-circle relative w-16 h-16">
                            <svg viewBox="0 0 100 100" class="transform -rotate-90">
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" stroke-width="8"/>
                                <circle cx="50" cy="50" r="40" fill="none" stroke="${color}" stroke-width="8"
                                    stroke-dasharray="${score * 2.51} 251"/>
                            </svg>
                            <div class="absolute inset-0 flex items-center justify-center">
                                <span class="text-sm font-bold" style="color: ${color}">${score}%</span>
                            </div>
                        </div>
                        <div>
                            <p class="font-semibold" style="color: ${color}">${lang === 'da' ? 'Datakvalitet' : 'Data Quality'}: ${label}</p>
                            ${issues.length ? `<ul class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                ${issues.map(i => `<li>• ${issueLabels[lang][i.type]}: ${i.percent || i.count}${i.column ? ` (${i.column})` : ''}</li>`).join('')}
                            </ul>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }
    },

    // Remember column mappings
    columnMappings: {
        save(filePattern, mappings) {
            const key = 'column_mappings_' + this.getPatternKey(filePattern);
            localStorage.setItem(key, JSON.stringify(mappings));
        },
        
        load(filePattern) {
            const key = 'column_mappings_' + this.getPatternKey(filePattern);
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        },
        
        getPatternKey(filename) {
            // Extract pattern: remove numbers and keep structure
            return filename.replace(/\d+/g, '#').replace(/[^a-zA-Z#_-]/g, '').toLowerCase();
        }
    }
};

// ============================================
// CROSS-FEATURE ENHANCEMENTS
// ============================================

const CrossFeatureEnhancements = {
    // Track actions for analytics
    trackAction(action, data = {}) {
        // Optional: Log to console in dev mode
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log(`[Track] ${action}:`, data);
        }
        // Store in session for potential debugging
        const actions = JSON.parse(sessionStorage.getItem('tracked_actions') || '[]');
        actions.push({ action, data, timestamp: new Date().toISOString() });
        sessionStorage.setItem('tracked_actions', JSON.stringify(actions.slice(-50)));
    },
    
    // Results linking
    resultsLinking: {
        createLinkButton(sourceFeature, targetFeature, data) {
            const lang = window.currentLanguage || 'da';
            const labels = {
                'abc-to-eoq': lang === 'da' ? 'Beregn EOQ for A-varer' : 'Calculate EOQ for A-items',
                'eoq-to-inventory': lang === 'da' ? 'Til Lagerstyring' : 'To Inventory Management'
            };
            const defaultLabel = lang === 'da' ? 'Fortsæt' : 'Continue';
            
            return `
                <button onclick="CrossFeatureEnhancements.resultsLinking.navigate('${targetFeature}', ${JSON.stringify(data).replace(/"/g, '&quot;')})" 
                    class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow hover:shadow-lg">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                    </svg>
                    ${labels[sourceFeature + '-to-' + targetFeature] || defaultLabel}
                </button>
            `;
        },
        
        navigate(targetFeature, data) {
            // Store data for target feature
            sessionStorage.setItem('linked_data', JSON.stringify({ target: targetFeature, data }));
            if (typeof switchTab === 'function') switchTab(targetFeature);
        }
    },

    // Session history
    sessionHistory: {
        maxItems: 20,
        
        add(type, data, label) {
            const history = this.getAll();
            history.unshift({
                id: Date.now(),
                timestamp: new Date().toISOString(),
                type,
                label,
                data
            });
            
            // Keep only last N items
            localStorage.setItem('session_history', JSON.stringify(history.slice(0, this.maxItems)));
        },
        
        getAll() {
            return JSON.parse(localStorage.getItem('session_history') || '[]');
        },
        
        restore(id) {
            const history = this.getAll();
            const item = history.find(h => h.id === id);
            if (item) {
                sessionStorage.setItem('restore_data', JSON.stringify(item));
                if (typeof switchTab === 'function') switchTab(item.type);
            }
        },
        
        renderPanel() {
            const lang = window.currentLanguage || 'da';
            const history = this.getAll();
            
            if (history.length === 0) {
                return `<p class="text-gray-500 text-sm">${lang === 'da' ? 'Ingen historik endnu' : 'No history yet'}</p>`;
            }
            
            return `
                <div class="history-panel max-h-64 overflow-y-auto">
                    ${history.map(item => {
                        const date = new Date(item.timestamp);
                        const timeStr = date.toLocaleTimeString(lang === 'da' ? 'da-DK' : 'en-US', { hour: '2-digit', minute: '2-digit' });
                        return `
                            <div class="history-item flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer" onclick="CrossFeatureEnhancements.sessionHistory.restore(${item.id})">
                                <div>
                                    <p class="text-sm font-medium">${item.label}</p>
                                    <p class="text-xs text-gray-500">${timeStr}</p>
                                </div>
                                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                                </svg>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }
    }
};

// ============================================
// CUSTOM PAGES ENHANCEMENTS
// ============================================

const CustomPagesEnhancements = {
    // Formula autocomplete
    autocomplete: {
        variables: ['demand', 'orderCost', 'holdingCost', 'leadTime', 'safetyStock', 'price', 'quantity', 'value', 'total'],
        functions: ['sqrt', 'pow', 'abs', 'round', 'floor', 'ceil', 'min', 'max'],
        
        getSuggestions(input) {
            const lastWord = input.split(/[\s+\-*/()]+/).pop().toLowerCase();
            if (!lastWord) return [];
            
            const allItems = [...this.variables, ...this.functions.map(f => f + '(')];
            return allItems.filter(item => item.toLowerCase().startsWith(lastWord));
        },
        
        renderDropdown(suggestions, onSelect) {
            if (!suggestions.length) return '';
            
            return `
                <div class="autocomplete-dropdown absolute z-50 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                    ${suggestions.map(s => `
                        <div class="autocomplete-item px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer text-sm" onclick="${onSelect}('${s}')">
                            ${s}
                        </div>
                    `).join('')}
                </div>
            `;
        }
    },

    // Live validation
    validation: {
        validate(formula) {
            try {
                // Replace variable names with 1 for testing
                const testFormula = formula.replace(/[a-zA-Z_][a-zA-Z0-9_]*/g, '1');
                new Function('return ' + testFormula)();
                return { valid: true };
            } catch (e) {
                return { valid: false, error: e.message };
            }
        },
        
        getBadge(isValid) {
            if (isValid) {
                return '<span class="inline-flex items-center text-green-600"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg></span>';
            }
            return '<span class="inline-flex items-center text-red-600"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg></span>';
        }
    }
};

// Export for global access
window.BudgetEnhancements = BudgetEnhancements;
window.LEANEnhancements = LEANEnhancements;
window.DashboardEnhancements = DashboardEnhancements;
window.CompareEnhancements = CompareEnhancements;
window.UploadEnhancements = UploadEnhancements;
window.CrossFeatureEnhancements = CrossFeatureEnhancements;
window.CustomPagesEnhancements = CustomPagesEnhancements;

// Initialize dashboard shortcuts
document.addEventListener('DOMContentLoaded', () => {
    DashboardEnhancements.shortcuts.init();
});
