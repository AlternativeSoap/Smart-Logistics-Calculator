// ========================================
// KPI Dashboard + Trend Arrows
// ========================================
//
// Enhances the Dashboard tab with:
// - 8 KPI cards pulling data from all modules
// - SVG sparkline mini-charts per card
// - Trend arrows (↑ ↓ →) with % change
// - History tracking for snapshots
// - Click-to-jump navigation
// ========================================

const KPIDashboard = (function () {
    'use strict';

    const HISTORY_KEY = 'kpi_history';
    const MAX_HISTORY = 30;

    // ─── Helpers ──────────────────────────
    function isDa() {
        return typeof currentLanguage !== 'undefined' && currentLanguage === 'da';
    }

    function fmtNum(n, decimals) {
        if (n === null || n === undefined || isNaN(n)) return '—';
        if (decimals === undefined) decimals = n >= 1000 ? 0 : 1;
        return n.toLocaleString(isDa() ? 'da-DK' : 'en-US', { maximumFractionDigits: decimals, minimumFractionDigits: 0 });
    }

    // ─── KPI Definitions ──────────────────
    // Each KPI: { id, icon, titleDA, titleEN, getValue, getUnit, color, jumpTab }
    const KPI_DEFS = [
        {
            id: 'kpi-total-items',
            icon: '📦',
            titleDA: 'Antal varer',
            titleEN: 'Total Items',
            getValue: () => {
                if (typeof abcResults !== 'undefined' && abcResults && abcResults.length) return abcResults.length;
                return null;
            },
            getUnit: () => isDa() ? 'varer' : 'items',
            color: 'blue',
            jumpTab: 'abc',
        },
        {
            id: 'kpi-total-value',
            icon: '💰',
            titleDA: 'Total værdi',
            titleEN: 'Total Value',
            getValue: () => {
                if (typeof abcResults !== 'undefined' && abcResults && abcResults.length) {
                    return abcResults.reduce((s, r) => s + (r.value || 0), 0);
                }
                return null;
            },
            getUnit: () => 'DKK',
            color: 'green',
            jumpTab: 'abc',
        },
        {
            id: 'kpi-a-items',
            icon: '⭐',
            titleDA: 'A-varer',
            titleEN: 'A-Items',
            getValue: () => {
                if (typeof abcResults !== 'undefined' && abcResults && abcResults.length) {
                    return abcResults.filter(r => r.group === 'A').length;
                }
                return null;
            },
            getUnit: () => isDa() ? 'varer' : 'items',
            color: 'emerald',
            jumpTab: 'abc',
        },
        {
            id: 'kpi-eoq',
            icon: '📐',
            titleDA: 'Gns. EOQ',
            titleEN: 'Avg EOQ',
            getValue: () => {
                if (typeof abcResults !== 'undefined' && abcResults && abcResults.length) {
                    const eoqs = abcResults.filter(r => r.eoq > 0).map(r => r.eoq);
                    if (eoqs.length) return Math.round(eoqs.reduce((a, b) => a + b, 0) / eoqs.length);
                }
                return null;
            },
            getUnit: () => isDa() ? 'enheder' : 'units',
            color: 'orange',
            jumpTab: 'wilson',
        },
        {
            id: 'kpi-rop',
            icon: '🎯',
            titleDA: 'Genbestillingspunkt',
            titleEN: 'Reorder Point',
            getValue: () => {
                const el = document.getElementById('ropResult');
                if (el && el.textContent && el.textContent !== '—') return parseFloat(el.textContent.replace(/[^\d.-]/g, ''));
                return null;
            },
            getUnit: () => isDa() ? 'enheder' : 'units',
            color: 'purple',
            jumpTab: 'inventory',
        },
        {
            id: 'kpi-safety',
            icon: '🛡️',
            titleDA: 'Sikkerhedslager',
            titleEN: 'Safety Stock',
            getValue: () => {
                const el = document.getElementById('ropSafetyStock');
                if (el && el.textContent && el.textContent !== '—') return parseFloat(el.textContent.replace(/[^\d.-]/g, ''));
                return null;
            },
            getUnit: () => isDa() ? 'enheder' : 'units',
            color: 'cyan',
            jumpTab: 'inventory',
        },
        {
            id: 'kpi-eoq-savings',
            icon: '💵',
            titleDA: 'Total EOQ-besparelse',
            titleEN: 'Total EOQ Savings',
            getValue: () => {
                if (typeof abcResults !== 'undefined' && abcResults && abcResults.length) {
                    const savings = abcResults.reduce((s, r) => s + (r.eoqSavings || 0), 0);
                    if (savings > 0) return Math.round(savings);
                }
                return null;
            },
            getUnit: () => 'DKK',
            color: 'teal',
            jumpTab: 'wilson',
        },
        {
            id: 'kpi-warehouse',
            icon: '🏭',
            titleDA: 'Lagerelementer',
            titleEN: 'Warehouse Items',
            getValue: () => {
                try {
                    const d = JSON.parse(localStorage.getItem('warehouse_layout') || '{}');
                    return d.elements ? d.elements.length : null;
                } catch { return null; }
            },
            getUnit: () => isDa() ? 'elementer' : 'elements',
            color: 'indigo',
            jumpTab: 'warehouse',
        },
    ];

    // ─── History ──────────────────────────
    function loadHistory() {
        try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
    }
    function saveHistory(h) {
        try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(-MAX_HISTORY))); } catch { /* quota */ }
    }

    function takeSnapshot() {
        const snap = { ts: Date.now() };
        KPI_DEFS.forEach(k => {
            snap[k.id] = k.getValue();
        });
        const hist = loadHistory();
        // Only add if last snapshot is > 5 min old or values changed
        const last = hist[hist.length - 1];
        if (last) {
            const age = snap.ts - last.ts;
            const same = KPI_DEFS.every(k => snap[k.id] === last[k.id]);
            if (age < 300000 && same) return;
        }
        hist.push(snap);
        saveHistory(hist);
    }

    // ─── Trend Calculation ────────────────
    function getTrend(kpiId) {
        const hist = loadHistory();
        if (hist.length < 2) return { arrow: '→', pct: 0, cls: 'text-gray-400' };
        const prev = hist[hist.length - 2];
        const curr = hist[hist.length - 1];
        const oldVal = prev[kpiId];
        const newVal = curr[kpiId];
        if (oldVal == null || newVal == null || oldVal === 0) return { arrow: '→', pct: 0, cls: 'text-gray-400' };
        const change = ((newVal - oldVal) / Math.abs(oldVal)) * 100;
        if (Math.abs(change) < 0.5) return { arrow: '→', pct: 0, cls: 'text-gray-400' };
        if (change > 0) return { arrow: '↑', pct: change.toFixed(1), cls: 'text-green-600 dark:text-green-400' };
        return { arrow: '↓', pct: Math.abs(change).toFixed(1), cls: 'text-red-600 dark:text-red-400' };
    }

    // ─── Mini Sparkline SVG ───────────────
    function sparklineSVG(kpiId, color) {
        const hist = loadHistory();
        const vals = hist.map(h => h[kpiId]).filter(v => v != null);
        if (vals.length < 2) return '';

        const w = 80, h = 24;
        const max = Math.max(...vals);
        const min = Math.min(...vals);
        const range = max - min || 1;
        const pts = vals.slice(-12).map((v, i, arr) => {
            const x = (i / (arr.length - 1)) * w;
            const y = h - ((v - min) / range) * (h - 4) - 2;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        });

        const colorMap = {
            blue: '#3b82f6', green: '#22c55e', emerald: '#10b981', orange: '#f59e0b',
            purple: '#a855f7', cyan: '#06b6d4', teal: '#14b8a6', indigo: '#6366f1',
        };
        const stroke = colorMap[color] || '#6b7280';

        return `<svg viewBox="0 0 ${w} ${h}" class="w-20 h-6 inline-block ml-2 opacity-70">
            <polyline fill="none" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" points="${pts.join(' ')}"/>
        </svg>`;
    }

    // ─── Render KPI Cards ─────────────────
    function renderCards() {
        const container = document.getElementById('kpiCardsContainer');
        if (!container) return;

        container.innerHTML = '';

        KPI_DEFS.forEach(kpi => {
            const val = kpi.getValue();
            const trend = getTrend(kpi.id);
            const spark = sparklineSVG(kpi.id, kpi.color);
            const displayVal = val != null ? fmtNum(val) : '—';
            const unit = kpi.getUnit();
            const title = isDa() ? kpi.titleDA : kpi.titleEN;

            const card = document.createElement('div');
            card.className = `kpi-card p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer group`;
            card.onclick = () => {
                if (typeof switchTab === 'function') switchTab(kpi.jumpTab);
            };
            card.title = isDa() ? `Klik for at gå til ${title}` : `Click to go to ${title}`;

            card.innerHTML = `
                <div class="flex items-center justify-between mb-2">
                    <span class="text-lg">${kpi.icon}</span>
                    <span class="kpi-trend ${trend.cls} text-xs font-semibold flex items-center gap-0.5">
                        ${trend.arrow} ${trend.pct ? trend.pct + '%' : ''}
                    </span>
                </div>
                <p class="text-2xl font-bold text-${kpi.color}-600 dark:text-${kpi.color}-400 leading-tight">${displayVal}</p>
                <div class="flex items-center justify-between mt-1">
                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate">${title}</p>
                    ${spark}
                </div>
                <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">${unit}</p>
            `;
            container.appendChild(card);
        });
    }

    // ─── Top Movers Table ─────────────────
    function renderMovers() {
        const el = document.getElementById('kpiMoversBody');
        if (!el) return;

        const hist = loadHistory();
        if (hist.length < 2) {
            el.innerHTML = `<tr><td colspan="4" class="text-center text-gray-400 dark:text-gray-500 py-4 text-sm">${isDa() ? 'Ikke nok data endnu...' : 'Not enough data yet...'}</td></tr>`;
            return;
        }

        const prev = hist[hist.length - 2];
        const curr = hist[hist.length - 1];
        const movers = KPI_DEFS.map(kpi => {
            const oldV = prev[kpi.id];
            const newV = curr[kpi.id];
            if (oldV == null || newV == null || oldV === 0) return null;
            const pct = ((newV - oldV) / Math.abs(oldV)) * 100;
            return { kpi, pct, newV };
        }).filter(Boolean).sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct)).slice(0, 5);

        if (!movers.length) {
            el.innerHTML = `<tr><td colspan="4" class="text-center text-gray-400 dark:text-gray-500 py-4 text-sm">${isDa() ? 'Ingen ændringer' : 'No changes'}</td></tr>`;
            return;
        }

        el.innerHTML = movers.map(m => {
            const arrow = m.pct > 0 ? '↑' : m.pct < 0 ? '↓' : '→';
            const cls = m.pct > 0 ? 'text-green-600' : m.pct < 0 ? 'text-red-600' : 'text-gray-500';
            const title = isDa() ? m.kpi.titleDA : m.kpi.titleEN;
            return `<tr class="border-b border-gray-100 dark:border-gray-700/50">
                <td class="py-2 text-sm">${m.kpi.icon} ${title}</td>
                <td class="py-2 text-sm font-medium text-right">${fmtNum(m.newV)}</td>
                <td class="py-2 text-sm text-right ${cls} font-semibold">${arrow} ${Math.abs(m.pct).toFixed(1)}%</td>
            </tr>`;
        }).join('');
    }

    // ─── Public ───────────────────────────
    function refresh() {
        takeSnapshot();
        renderCards();
        renderMovers();
    }

    function init() {
        // Insert KPI cards container if not exists
        insertKPIHTML();
        refresh();
    }

    function insertKPIHTML() {
        // Check if container already exists
        if (document.getElementById('kpiCardsContainer')) return;

        const dashSection = document.getElementById('dashboard-section');
        if (!dashSection) return;

        // Find the existing 4-card grid and replace it with our 8-card grid
        const existingGrid = dashSection.querySelector('.grid.grid-cols-1.md\\:grid-cols-4');
        if (existingGrid) {
            // Create new container
            const wrapper = document.createElement('div');
            wrapper.innerHTML = `
                <!-- KPI Dashboard Cards -->
                <div id="kpiCardsContainer" class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <!-- Cards rendered by JS -->
                </div>

                <!-- Top Movers -->
                <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
                    <div class="flex items-center justify-between mb-3">
                        <h4 class="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                            <span>📈</span>
                            <span data-i18n="kpi-top-movers">Top ændringer</span>
                        </h4>
                        <span class="text-xs text-gray-400 dark:text-gray-500" data-i18n="kpi-since-last">Siden sidst</span>
                    </div>
                    <table class="w-full">
                        <tbody id="kpiMoversBody"></tbody>
                    </table>
                </div>
            `;

            existingGrid.replaceWith(wrapper.firstElementChild.nextElementSibling ? wrapper : wrapper.firstElementChild);
            
            // Actually we need both elements. Let's do it properly:
            const frag = document.createDocumentFragment();
            while (wrapper.firstChild) frag.appendChild(wrapper.firstChild);
            
            // Re-query since we replaced
            const spot = dashSection.querySelector('#kpiCardsContainer') || dashSection.firstElementChild;
            if (!document.getElementById('kpiCardsContainer')) {
                existingGrid.parentNode.insertBefore(frag, existingGrid);
                existingGrid.remove();
            }
        }
    }

    // Init on DOM ready
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(init, 300);
    });

    return { init, refresh, takeSnapshot };
})();
