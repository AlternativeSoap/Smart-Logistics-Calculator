/**
 * lean-extensions.js
 * Supply Chain Flow Builder (Logistikkæde) + SMART Goals
 * Part of Smart Logistics Calculator
 */

// ============================================================
//  SUPPLY CHAIN FLOW BUILDER
// ============================================================
const SupplyChainManager = (() => {
    const STORAGE_KEY = 'lean_supply_chain';
    let nodes = [];
    let editingId = null;

    const nodeTypes = {
        supplier:     { emoji: '🏭', color: 'amber',  defaultName: 'Leverandør' },
        transport:    { emoji: '🚛', color: 'blue',   defaultName: 'Transport' },
        warehouse:    { emoji: '🏢', color: 'green',  defaultName: 'Lager' },
        production:   { emoji: '⚙️', color: 'purple', defaultName: 'Produktion' },
        quality:      { emoji: '✅', color: 'red',    defaultName: 'Kvalitetskontrol' },
        distribution: { emoji: '📤', color: 'teal',   defaultName: 'Distribution' },
        retail:       { emoji: '🏪', color: 'indigo', defaultName: 'Detailhandel' },
        customer:     { emoji: '👤', color: 'pink',   defaultName: 'Kunde' }
    };

    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
        } catch (e) { console.warn('SC save error:', e); }
    }

    function load() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) nodes = JSON.parse(data);
        } catch (e) { nodes = []; }
        render();
    }

    function addNode(type) {
        const info = nodeTypes[type] || nodeTypes.warehouse;
        const t = typeof translations !== 'undefined' && translations[currentLanguage || 'da'];
        const defaultName = t ? (t['sc-' + type] || info.defaultName) : info.defaultName;
        const node = {
            id: Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            type,
            name: defaultName,
            time: 0,
            cost: 0,
            risk: 'low',
            notes: ''
        };
        nodes.push(node);
        save();
        render();
        if (typeof showToast === 'function') {
            const t2 = typeof translations !== 'undefined' && translations[currentLanguage || 'da'];
            showToast((t2 && t2['sc-node-added']) || 'Trin tilføjet til kæden', 'success');
        }
    }

    function removeNode(id) {
        nodes = nodes.filter(n => n.id !== id);
        if (editingId === id) cancelEdit();
        save();
        render();
    }

    function moveNode(id, direction) {
        const idx = nodes.findIndex(n => n.id === id);
        if (idx < 0) return;
        const newIdx = idx + direction;
        if (newIdx < 0 || newIdx >= nodes.length) return;
        [nodes[idx], nodes[newIdx]] = [nodes[newIdx], nodes[idx]];
        save();
        render();
    }

    function editNode(id) {
        const node = nodes.find(n => n.id === id);
        if (!node) return;
        editingId = id;
        const panel = document.getElementById('scEditPanel');
        if (!panel) return;
        panel.classList.remove('hidden');
        document.getElementById('scEditNodeId').value = id;
        document.getElementById('scEditName').value = node.name;
        document.getElementById('scEditTime').value = node.time;
        document.getElementById('scEditCost').value = node.cost;
        document.getElementById('scEditRisk').value = node.risk;
        document.getElementById('scEditNotes').value = node.notes || '';
        const nameSpan = document.getElementById('scEditNodeName');
        if (nameSpan) {
            const info = nodeTypes[node.type] || {};
            nameSpan.textContent = `${info.emoji || ''} ${node.name}`;
        }
        panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function saveNode() {
        if (!editingId) return;
        const node = nodes.find(n => n.id === editingId);
        if (!node) return;
        node.name = document.getElementById('scEditName').value.trim() || node.name;
        node.time = parseFloat(document.getElementById('scEditTime').value) || 0;
        node.cost = parseFloat(document.getElementById('scEditCost').value) || 0;
        node.risk = document.getElementById('scEditRisk').value || 'low';
        node.notes = document.getElementById('scEditNotes').value.trim();
        editingId = null;
        document.getElementById('scEditPanel').classList.add('hidden');
        save();
        render();
        if (typeof showToast === 'function') showToast('Trin opdateret', 'success');
    }

    function cancelEdit() {
        editingId = null;
        const panel = document.getElementById('scEditPanel');
        if (panel) panel.classList.add('hidden');
    }

    function clearAll() {
        const t = typeof translations !== 'undefined' && translations[currentLanguage || 'da'];
        const msg = (t && t['sc-confirm-clear']) || 'Er du sikker på, at du vil rydde hele kæden?';
        if (!confirm(msg)) return;
        nodes = [];
        cancelEdit();
        save();
        render();
    }

    function loadExample() {
        nodes = [
            { id: 'ex1', type: 'supplier', name: 'Råvareleverandør', time: 2, cost: 50000, risk: 'medium', notes: 'Primær leverandør af råmaterialer' },
            { id: 'ex2', type: 'transport', name: 'Indgående Transport', time: 1.5, cost: 8000, risk: 'low', notes: 'Lastbiltransport fra leverandør' },
            { id: 'ex3', type: 'warehouse', name: 'Råvarelager', time: 0.5, cost: 12000, risk: 'low', notes: 'Modtagelse og kvalitetsgodkendelse' },
            { id: 'ex4', type: 'production', name: 'Samling & Produktion', time: 3, cost: 85000, risk: 'high', notes: 'Hovedproduktionslinje - flaskehals' },
            { id: 'ex5', type: 'quality', name: 'QC Inspektion', time: 0.5, cost: 5000, risk: 'medium', notes: '100% inspektion af kritiske mål' },
            { id: 'ex6', type: 'warehouse', name: 'Færdigvarelager', time: 1, cost: 15000, risk: 'low', notes: 'Pick & pack afdeling' },
            { id: 'ex7', type: 'distribution', name: 'Distributionscenter', time: 1, cost: 20000, risk: 'medium', notes: 'Regional fordeling' },
            { id: 'ex8', type: 'transport', name: 'Udgående Transport', time: 2, cost: 12000, risk: 'medium', notes: 'Last-mile levering' },
            { id: 'ex9', type: 'customer', name: 'Slutkunde', time: 0, cost: 0, risk: 'low', notes: '' }
        ];
        save();
        render();
        if (typeof showToast === 'function') showToast('Eksempel indlæst', 'info');
    }

    function render() {
        const container = document.getElementById('scNodesList');
        const empty = document.getElementById('scEmptyState');
        if (!container || !empty) return;

        if (nodes.length === 0) {
            empty.classList.remove('hidden');
            container.classList.add('hidden');
            updateMetrics();
            return;
        }
        empty.classList.add('hidden');
        container.classList.remove('hidden');

        const riskColors = {
            low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        };
        const riskLabels = { low: 'Lav', medium: 'Middel', high: 'Høj' };

        let html = '<div class="flex flex-wrap items-center gap-2">';
        nodes.forEach((node, idx) => {
            const info = nodeTypes[node.type] || {};
            const colorClass = `border-${info.color || 'gray'}-300 dark:border-${info.color || 'gray'}-700`;
            const bgClass = `from-${info.color || 'gray'}-50 to-${info.color || 'gray'}-100 dark:from-${info.color || 'gray'}-900/20 dark:to-${info.color || 'gray'}-800/20`;
            const isEditing = node.id === editingId;
            
            html += `
                <div class="relative flex-shrink-0 bg-gradient-to-br ${bgClass} rounded-xl border-2 ${colorClass} p-4 min-w-[180px] max-w-[220px] group ${isEditing ? 'ring-2 ring-blue-500' : ''} hover:shadow-lg transition-all cursor-pointer" onclick="scEditNode('${node.id}')">
                    <div class="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        ${idx > 0 ? `<button onclick="event.stopPropagation();scMoveNode('${node.id}',-1)" class="w-6 h-6 bg-white dark:bg-gray-700 rounded-full shadow text-xs hover:bg-gray-100 flex items-center justify-center" title="Flyt venstre">◀</button>` : ''}
                        ${idx < nodes.length - 1 ? `<button onclick="event.stopPropagation();scMoveNode('${node.id}',1)" class="w-6 h-6 bg-white dark:bg-gray-700 rounded-full shadow text-xs hover:bg-gray-100 flex items-center justify-center" title="Flyt højre">▶</button>` : ''}
                        <button onclick="event.stopPropagation();scRemoveNode('${node.id}')" class="w-6 h-6 bg-red-500 text-white rounded-full shadow text-xs hover:bg-red-600 flex items-center justify-center" title="Fjern">✕</button>
                    </div>
                    <div class="text-center">
                        <span class="text-3xl block mb-1">${info.emoji || '📦'}</span>
                        <h5 class="font-bold text-gray-800 dark:text-white text-sm truncate">${escapeHtml(node.name)}</h5>
                        <div class="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                            ${node.time > 0 ? `<p>⏱ ${node.time} dage</p>` : ''}
                            ${node.cost > 0 ? `<p>💰 ${node.cost.toLocaleString('da-DK')} kr</p>` : ''}
                        </div>
                        <span class="inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${riskColors[node.risk] || riskColors.low}">${riskLabels[node.risk] || 'Lav'}</span>
                    </div>
                </div>`;

            // Arrow between nodes
            if (idx < nodes.length - 1) {
                html += `<div class="flex-shrink-0 text-2xl text-gray-400 dark:text-gray-600 font-bold">→</div>`;
            }
        });
        html += '</div>';
        container.innerHTML = html;
        updateMetrics();
    }

    function updateMetrics() {
        const stepsEl = document.getElementById('scMetricSteps');
        const timeEl = document.getElementById('scMetricTime');
        const costEl = document.getElementById('scMetricCost');
        const bnEl = document.getElementById('scMetricBottleneck');

        if (stepsEl) stepsEl.textContent = nodes.length;

        const totalTime = nodes.reduce((s, n) => s + (n.time || 0), 0);
        if (timeEl) {
            const daysLabel = (typeof translations !== 'undefined' && translations[currentLanguage || 'da'] && translations[currentLanguage || 'da']['sc-days']) || 'dage';
            timeEl.innerHTML = `${totalTime} <span class="text-sm font-normal">${daysLabel}</span>`;
        }

        const totalCost = nodes.reduce((s, n) => s + (n.cost || 0), 0);
        if (costEl) costEl.textContent = totalCost.toLocaleString('da-DK') + ' kr';

        if (bnEl) {
            if (nodes.length === 0) {
                bnEl.textContent = '-';
            } else {
                const bottleneck = nodes.reduce((max, n) => (n.time || 0) > (max.time || 0) ? n : max, nodes[0]);
                bnEl.textContent = bottleneck.name || '-';
            }
        }
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Export as PNG
    function exportPNG() {
        const container = document.getElementById('scFlowContainer');
        if (!container || nodes.length === 0) {
            if (typeof showToast === 'function') showToast('Ingen data at eksportere', 'warning');
            return;
        }
        // Use html2canvas-style approach via canvas
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const nodeWidth = 180;
            const nodeHeight = 120;
            const arrowWidth = 40;
            const padding = 30;
            const totalWidth = nodes.length * nodeWidth + (nodes.length - 1) * arrowWidth + padding * 2;
            const totalHeight = nodeHeight + padding * 2 + 60;

            canvas.width = totalWidth;
            canvas.height = totalHeight;

            // Background
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(0, 0, totalWidth, totalHeight);

            // Title
            ctx.fillStyle = '#1e293b';
            ctx.font = 'bold 18px system-ui, sans-serif';
            ctx.textAlign = 'center';
            const t = typeof translations !== 'undefined' && translations[currentLanguage || 'da'];
            ctx.fillText((t && t['lean-sc-title']) || 'Logistikkæde (Supply Chain Flow)', totalWidth / 2, 24);

            const colorMap = {
                supplier: '#fef3c7', transport: '#dbeafe', warehouse: '#d1fae5', production: '#ede9fe',
                quality: '#fee2e2', distribution: '#ccfbf1', retail: '#e0e7ff', customer: '#fce7f3'
            };
            const borderMap = {
                supplier: '#f59e0b', transport: '#3b82f6', warehouse: '#10b981', production: '#8b5cf6',
                quality: '#ef4444', distribution: '#14b8a6', retail: '#6366f1', customer: '#ec4899'
            };

            nodes.forEach((node, idx) => {
                const x = padding + idx * (nodeWidth + arrowWidth);
                const y = 40;
                const info = nodeTypes[node.type] || {};

                // Node box
                ctx.fillStyle = colorMap[node.type] || '#f3f4f6';
                ctx.strokeStyle = borderMap[node.type] || '#9ca3af';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(x, y, nodeWidth, nodeHeight, 10);
                ctx.fill();
                ctx.stroke();

                // Emoji
                ctx.font = '28px system-ui';
                ctx.textAlign = 'center';
                ctx.fillText(info.emoji || '📦', x + nodeWidth / 2, y + 35);

                // Name
                ctx.fillStyle = '#1e293b';
                ctx.font = 'bold 12px system-ui, sans-serif';
                const truncName = node.name.length > 18 ? node.name.slice(0, 16) + '…' : node.name;
                ctx.fillText(truncName, x + nodeWidth / 2, y + 55);

                // Info
                ctx.fillStyle = '#64748b';
                ctx.font = '10px system-ui, sans-serif';
                if (node.time > 0) ctx.fillText(`⏱ ${node.time} dage`, x + nodeWidth / 2, y + 75);
                if (node.cost > 0) ctx.fillText(`💰 ${node.cost.toLocaleString('da-DK')} kr`, x + nodeWidth / 2, y + 90);

                // Risk badge
                const riskColors2 = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };
                ctx.fillStyle = riskColors2[node.risk] || '#22c55e';
                ctx.font = '9px system-ui, sans-serif';
                ctx.fillText(`● ${node.risk === 'high' ? 'Høj' : node.risk === 'medium' ? 'Middel' : 'Lav'} risiko`, x + nodeWidth / 2, y + 108);

                // Arrow
                if (idx < nodes.length - 1) {
                    const ax = x + nodeWidth + 5;
                    const ay = y + nodeHeight / 2;
                    ctx.strokeStyle = '#94a3b8';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(ax, ay);
                    ctx.lineTo(ax + arrowWidth - 10, ay);
                    ctx.stroke();
                    // Arrowhead
                    ctx.fillStyle = '#94a3b8';
                    ctx.beginPath();
                    ctx.moveTo(ax + arrowWidth - 10, ay - 6);
                    ctx.lineTo(ax + arrowWidth - 2, ay);
                    ctx.lineTo(ax + arrowWidth - 10, ay + 6);
                    ctx.fill();
                }
            });

            // Metrics footer
            const totalTime2 = nodes.reduce((s, n) => s + (n.time || 0), 0);
            const totalCost2 = nodes.reduce((s, n) => s + (n.cost || 0), 0);
            ctx.fillStyle = '#475569';
            ctx.font = '11px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`Trin: ${nodes.length}  |  Samlet tid: ${totalTime2} dage  |  Samlet omkostning: ${totalCost2.toLocaleString('da-DK')} kr`, totalWidth / 2, totalHeight - 12);

            // Download
            const link = document.createElement('a');
            link.download = 'logistikkaede_supply_chain.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            if (typeof showToast === 'function') showToast('PNG eksporteret', 'success');
        } catch (e) {
            console.error('SC PNG export error:', e);
            if (typeof showToast === 'function') showToast('Fejl ved PNG eksport', 'error');
        }
    }

    // Export as Excel
    function exportExcel() {
        if (nodes.length === 0) {
            if (typeof showToast === 'function') showToast('Ingen data at eksportere', 'warning');
            return;
        }
        try {
            const wb = XLSX.utils.book_new();
            const wsData = [
                ['Trin', 'Type', 'Navn', 'Gennemløbstid (dage)', 'Omkostning (kr)', 'Risikoniveau', 'Noter']
            ];
            nodes.forEach((n, i) => {
                const riskLabel = n.risk === 'high' ? 'Høj' : n.risk === 'medium' ? 'Middel' : 'Lav';
                wsData.push([i + 1, n.type, n.name, n.time, n.cost, riskLabel, n.notes]);
            });
            // Summary row
            const totalTime = nodes.reduce((s, n) => s + (n.time || 0), 0);
            const totalCost = nodes.reduce((s, n) => s + (n.cost || 0), 0);
            wsData.push([]);
            wsData.push(['', '', 'TOTAL', totalTime, totalCost, '', '']);

            const ws = XLSX.utils.aoa_to_sheet(wsData);
            ws['!cols'] = [{ wch: 6 }, { wch: 14 }, { wch: 25 }, { wch: 20 }, { wch: 16 }, { wch: 14 }, { wch: 35 }];
            XLSX.utils.book_append_sheet(wb, ws, 'Supply Chain');
            XLSX.writeFile(wb, 'logistikkaede_supply_chain.xlsx');
            if (typeof showToast === 'function') showToast('Excel eksporteret', 'success');
        } catch (e) {
            console.error('SC Excel export error:', e);
            if (typeof showToast === 'function') showToast('Fejl ved Excel eksport', 'error');
        }
    }

    // Export as PDF
    function exportPDF() {
        if (nodes.length === 0) {
            if (typeof showToast === 'function') showToast('Ingen data at eksportere', 'warning');
            return;
        }
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('landscape', 'mm', 'a4');

            doc.setFontSize(18);
            doc.text('Logistikkæde (Supply Chain Flow)', 148, 15, { align: 'center' });
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Genereret: ${new Date().toLocaleDateString('da-DK')}`, 148, 22, { align: 'center' });

            const tableData = nodes.map((n, i) => {
                const riskLabel = n.risk === 'high' ? 'Høj' : n.risk === 'medium' ? 'Middel' : 'Lav';
                return [i + 1, n.type, n.name, n.time, n.cost.toLocaleString('da-DK'), riskLabel, n.notes || ''];
            });

            const totalTime = nodes.reduce((s, n) => s + (n.time || 0), 0);
            const totalCost = nodes.reduce((s, n) => s + (n.cost || 0), 0);
            tableData.push(['', '', 'TOTAL', totalTime, totalCost.toLocaleString('da-DK'), '', '']);

            doc.autoTable({
                startY: 28,
                head: [['#', 'Type', 'Navn', 'Tid (dage)', 'Omkostning (kr)', 'Risiko', 'Noter']],
                body: tableData,
                styles: { fontSize: 9 },
                headStyles: { fillColor: [16, 185, 129] }
            });

            doc.save('logistikkaede_supply_chain.pdf');
            if (typeof showToast === 'function') showToast('PDF eksporteret', 'success');
        } catch (e) {
            console.error('SC PDF export error:', e);
            if (typeof showToast === 'function') showToast('Fejl ved PDF eksport', 'error');
        }
    }

    // Print
    function print() {
        if (nodes.length === 0) return;
        const printWin = window.open('', '_blank');
        let html = `<html><head><title>Logistikkæde</title><style>
            body{font-family:system-ui,sans-serif;padding:20px;color:#1e293b}
            h1{text-align:center;margin-bottom:20px}
            table{width:100%;border-collapse:collapse;margin-top:10px}
            th,td{border:1px solid #e2e8f0;padding:8px 12px;text-align:left}
            th{background:#10b981;color:white}
            .summary{margin-top:20px;font-weight:bold}
        </style></head><body>
        <h1>🔗 Logistikkæde (Supply Chain Flow)</h1>
        <table><thead><tr><th>#</th><th>Type</th><th>Navn</th><th>Tid (dage)</th><th>Omkostning (kr)</th><th>Risiko</th><th>Noter</th></tr></thead><tbody>`;
        nodes.forEach((n, i) => {
            const r = n.risk === 'high' ? 'Høj' : n.risk === 'medium' ? 'Middel' : 'Lav';
            html += `<tr><td>${i + 1}</td><td>${n.type}</td><td>${n.name}</td><td>${n.time}</td><td>${n.cost.toLocaleString('da-DK')}</td><td>${r}</td><td>${n.notes || ''}</td></tr>`;
        });
        const totalTime = nodes.reduce((s, n) => s + (n.time || 0), 0);
        const totalCost = nodes.reduce((s, n) => s + (n.cost || 0), 0);
        html += `</tbody></table>
        <p class="summary">Trin: ${nodes.length} | Samlet gennemløbstid: ${totalTime} dage | Samlet omkostning: ${totalCost.toLocaleString('da-DK')} kr</p>
        </body></html>`;
        printWin.document.write(html);
        printWin.document.close();
        printWin.onload = () => { printWin.print(); };
    }

    function getNodes() { return nodes; }

    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', load);
    } else {
        load();
    }

    return { addNode, removeNode, moveNode, editNode, saveNode, cancelEdit, clearAll, loadExample, render, exportPNG, exportExcel, exportPDF, print, getNodes, load };
})();

// Global functions for HTML onclick handlers
function scAddNode(type) { SupplyChainManager.addNode(type); }
function scRemoveNode(id) { SupplyChainManager.removeNode(id); }
function scMoveNode(id, dir) { SupplyChainManager.moveNode(id, dir); }
function scEditNode(id) { SupplyChainManager.editNode(id); }
function scSaveNode() { SupplyChainManager.saveNode(); }
function scCancelEdit() { SupplyChainManager.cancelEdit(); }
function scClearAll() { SupplyChainManager.clearAll(); }
function scLoadExample() { SupplyChainManager.loadExample(); }
function scExportPNG() { SupplyChainManager.exportPNG(); }
function scExportExcel() { SupplyChainManager.exportExcel(); }
function scExportPDF() { SupplyChainManager.exportPDF(); }
function scPrint() { SupplyChainManager.print(); }


// ============================================================
//  SMART GOALS
// ============================================================
const SmartGoalsManager = (() => {
    const STORAGE_KEY = 'lean_smart_goals';
    let goals = [];

    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
        } catch (e) { console.warn('SMART save error:', e); }
    }

    function load() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) goals = JSON.parse(data);
        } catch (e) { goals = []; }
        render();
    }

    function addGoal() {
        const s = document.getElementById('smartInputS')?.value.trim();
        const m = document.getElementById('smartInputM')?.value.trim();
        const a = document.getElementById('smartInputA')?.value.trim();
        const r = document.getElementById('smartInputR')?.value.trim();
        const t = document.getElementById('smartInputT')?.value;
        const progress = parseInt(document.getElementById('smartInputProgress')?.value) || 0;

        if (!s) {
            if (typeof showToast === 'function') showToast('Udfyld venligst "Specifik" feltet', 'warning');
            return;
        }

        const goal = {
            id: Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            s, m: m || '', a: a || '', r: r || '', t: t || '',
            progress: Math.max(0, Math.min(100, progress)),
            createdAt: new Date().toISOString(),
            status: progress >= 100 ? 'completed' : 'active'
        };

        goals.push(goal);
        save();
        render();

        // Clear form
        ['smartInputS', 'smartInputM', 'smartInputA', 'smartInputR', 'smartInputT'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const progEl = document.getElementById('smartInputProgress');
        if (progEl) progEl.value = '0';

        if (typeof showToast === 'function') showToast('SMART-mål oprettet!', 'success');
    }

    function removeGoal(id) {
        goals = goals.filter(g => g.id !== id);
        save();
        render();
    }

    function updateProgress(id, value) {
        const goal = goals.find(g => g.id === id);
        if (!goal) return;
        goal.progress = Math.max(0, Math.min(100, parseInt(value) || 0));
        goal.status = goal.progress >= 100 ? 'completed' : 'active';
        save();
        render();
    }

    function render() {
        const container = document.getElementById('smartGoalsList');
        const empty = document.getElementById('smartGoalsEmpty');
        if (!container) return;

        if (goals.length === 0) {
            if (empty) empty.classList.remove('hidden');
            // Remove non-empty cards
            container.querySelectorAll('.smart-goal-card').forEach(el => el.remove());
            return;
        }
        if (empty) empty.classList.add('hidden');

        let html = '';
        goals.forEach(goal => {
            const isComplete = goal.progress >= 100;
            const progressColor = isComplete ? 'bg-green-500' : goal.progress >= 50 ? 'bg-blue-500' : goal.progress >= 25 ? 'bg-amber-500' : 'bg-red-500';
            const daysLeft = goal.t ? Math.ceil((new Date(goal.t) - new Date()) / (1000 * 60 * 60 * 24)) : null;
            const deadlineClass = daysLeft !== null && daysLeft < 0 ? 'text-red-600 dark:text-red-400' : daysLeft !== null && daysLeft < 7 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400';
            const deadlineText = daysLeft !== null ? (daysLeft < 0 ? `${Math.abs(daysLeft)} dage overskredet` : daysLeft === 0 ? 'Deadline i dag!' : `${daysLeft} dage tilbage`) : '';

            html += `
                <div class="smart-goal-card bg-white dark:bg-gray-700 rounded-xl p-5 border-2 ${isComplete ? 'border-green-300 dark:border-green-700' : 'border-gray-200 dark:border-gray-600'} shadow-sm hover:shadow-md transition-all">
                    <div class="flex items-start justify-between mb-3">
                        <div class="flex items-center gap-2">
                            <span class="text-2xl">${isComplete ? '🏆' : '🎯'}</span>
                            <div>
                                <h4 class="font-bold text-gray-900 dark:text-white text-sm">${escapeHtml(goal.s)}</h4>
                                ${deadlineText ? `<span class="text-xs ${deadlineClass}">${deadlineText}</span>` : ''}
                            </div>
                        </div>
                        <button onclick="smartRemoveGoal('${goal.id}')" class="text-gray-400 hover:text-red-500 transition-colors text-lg" title="Slet mål">&times;</button>
                    </div>
                    <!-- Progress Bar -->
                    <div class="mb-3">
                        <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <span>Fremgang</span>
                            <span class="font-bold">${goal.progress}%</span>
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                            <div class="${progressColor} h-2.5 rounded-full transition-all" style="width: ${goal.progress}%"></div>
                        </div>
                        <input type="range" min="0" max="100" value="${goal.progress}" onchange="smartUpdateProgress('${goal.id}', this.value)" class="w-full mt-1 h-1 accent-blue-500 cursor-pointer">
                    </div>
                    <!-- SMART Details -->
                    <div class="grid grid-cols-5 gap-2 text-xs">
                        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2"><span class="font-bold text-blue-600 block">S</span><span class="text-gray-600 dark:text-gray-400">${escapeHtml(goal.s)}</span></div>
                        <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-2"><span class="font-bold text-green-600 block">M</span><span class="text-gray-600 dark:text-gray-400">${escapeHtml(goal.m || '-')}</span></div>
                        <div class="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2"><span class="font-bold text-amber-600 block">A</span><span class="text-gray-600 dark:text-gray-400">${escapeHtml(goal.a || '-')}</span></div>
                        <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2"><span class="font-bold text-purple-600 block">R</span><span class="text-gray-600 dark:text-gray-400">${escapeHtml(goal.r || '-')}</span></div>
                        <div class="bg-red-50 dark:bg-red-900/20 rounded-lg p-2"><span class="font-bold text-red-600 block">T</span><span class="text-gray-600 dark:text-gray-400">${goal.t ? new Date(goal.t).toLocaleDateString('da-DK') : '-'}</span></div>
                    </div>
                </div>`;
        });
        // Keep the empty state element, replace everything else
        const emptyEl = container.querySelector('#smartGoalsEmpty');
        container.innerHTML = html;
        if (emptyEl) container.appendChild(emptyEl);
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str || '';
        return div.innerHTML;
    }

    // Export to Excel
    function exportExcel() {
        if (goals.length === 0) {
            if (typeof showToast === 'function') showToast('Ingen mål at eksportere', 'warning');
            return;
        }
        try {
            const wb = XLSX.utils.book_new();
            const wsData = [['#', 'Specifik (S)', 'Målbar (M)', 'Opnåelig (A)', 'Relevant (R)', 'Deadline (T)', 'Fremgang (%)', 'Status', 'Oprettet']];
            goals.forEach((g, i) => {
                wsData.push([
                    i + 1, g.s, g.m, g.a, g.r,
                    g.t ? new Date(g.t).toLocaleDateString('da-DK') : '',
                    g.progress, g.status === 'completed' ? 'Fuldført' : 'Aktiv',
                    new Date(g.createdAt).toLocaleDateString('da-DK')
                ]);
            });
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            ws['!cols'] = [{ wch: 4 }, { wch: 35 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 12 }];
            XLSX.utils.book_append_sheet(wb, ws, 'SMART Goals');
            XLSX.writeFile(wb, 'smart_goals.xlsx');
            if (typeof showToast === 'function') showToast('Excel eksporteret', 'success');
        } catch (e) {
            console.error('SMART Excel export error:', e);
        }
    }

    // Export to PDF
    function exportPDF() {
        if (goals.length === 0) {
            if (typeof showToast === 'function') showToast('Ingen mål at eksportere', 'warning');
            return;
        }
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('landscape', 'mm', 'a4');

            doc.setFontSize(18);
            doc.text('SMART Mål - Oversigt', 148, 15, { align: 'center' });
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Genereret: ${new Date().toLocaleDateString('da-DK')}`, 148, 22, { align: 'center' });

            const tableData = goals.map((g, i) => [
                i + 1, g.s, g.m || '', g.a || '', g.r || '',
                g.t ? new Date(g.t).toLocaleDateString('da-DK') : '-',
                g.progress + '%',
                g.status === 'completed' ? 'Fuldført' : 'Aktiv'
            ]);

            doc.autoTable({
                startY: 28,
                head: [['#', 'Specifik', 'Målbar', 'Opnåelig', 'Relevant', 'Deadline', 'Fremgang', 'Status']],
                body: tableData,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [16, 185, 129] },
                columnStyles: {
                    0: { cellWidth: 8 },
                    1: { cellWidth: 50 },
                    6: { cellWidth: 18 },
                    7: { cellWidth: 18 }
                }
            });

            doc.save('smart_goals.pdf');
            if (typeof showToast === 'function') showToast('PDF eksporteret', 'success');
        } catch (e) {
            console.error('SMART PDF export error:', e);
        }
    }

    // Export as text
    function exportText() {
        if (goals.length === 0) {
            if (typeof showToast === 'function') showToast('Ingen mål at eksportere', 'warning');
            return;
        }
        let text = '=== SMART MÅL - OVERSIGT ===\n';
        text += `Genereret: ${new Date().toLocaleDateString('da-DK')}\n`;
        text += `Antal mål: ${goals.length}\n\n`;

        goals.forEach((g, i) => {
            text += `--- Mål ${i + 1} ---\n`;
            text += `S (Specifik):  ${g.s}\n`;
            text += `M (Målbar):    ${g.m || '-'}\n`;
            text += `A (Opnåelig):  ${g.a || '-'}\n`;
            text += `R (Relevant):  ${g.r || '-'}\n`;
            text += `T (Deadline):  ${g.t ? new Date(g.t).toLocaleDateString('da-DK') : '-'}\n`;
            text += `Fremgang:      ${g.progress}%\n`;
            text += `Status:        ${g.status === 'completed' ? 'Fuldført' : 'Aktiv'}\n\n`;
        });

        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'smart_goals.txt';
        link.click();
        URL.revokeObjectURL(link.href);
        if (typeof showToast === 'function') showToast('Tekst eksporteret', 'success');
    }

    function getGoals() { return goals; }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', load);
    } else {
        load();
    }

    return { addGoal, removeGoal, updateProgress, render, exportExcel, exportPDF, exportText, getGoals, load };
})();

// Global functions for HTML onclick handlers
function smartAddGoal() { SmartGoalsManager.addGoal(); }
function smartRemoveGoal(id) { SmartGoalsManager.removeGoal(id); }
function smartUpdateProgress(id, val) { SmartGoalsManager.updateProgress(id, val); }
function smartExportExcel() { SmartGoalsManager.exportExcel(); }
function smartExportPDF() { SmartGoalsManager.exportPDF(); }
function smartExportText() { SmartGoalsManager.exportText(); }

// ============================================================
//  SUPPLY CHAIN ENHANCEMENTS (Drag-Drop + Risk Heatmap)
// ============================================================
(function enhanceSupplyChain() {
    let riskHeatmapOn = false;
    let dragSrcId = null;

    // Override render to add drag-and-drop attributes + heatmap colouring
    const _origRender = SupplyChainManager.render.bind(SupplyChainManager);

    SupplyChainManager.render = function () {
        _origRender();
        // Post-process rendered cards to add drag + heatmap
        const container = document.getElementById('scNodesList');
        if (!container) return;

        const cards = container.querySelectorAll('[onclick*="scEditNode"]');
        cards.forEach(card => {
            // Enable drag
            card.setAttribute('draggable', 'true');
            const idMatch = card.getAttribute('onclick')?.match(/'([^']+)'/);
            if (!idMatch) return;
            const nodeId = idMatch[1];
            card.dataset.nodeId = nodeId;

            card.addEventListener('dragstart', (e) => {
                dragSrcId = nodeId;
                card.classList.add('opacity-50');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', nodeId);
            });
            card.addEventListener('dragend', () => {
                card.classList.remove('opacity-50');
                dragSrcId = null;
                container.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
            });
            card.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                card.classList.add('drag-over');
            });
            card.addEventListener('dragleave', () => {
                card.classList.remove('drag-over');
            });
            card.addEventListener('drop', (e) => {
                e.preventDefault();
                card.classList.remove('drag-over');
                const fromId = e.dataTransfer.getData('text/plain');
                if (fromId && fromId !== nodeId) {
                    scDragReorder(fromId, nodeId);
                }
            });

            // Risk heatmap overlay
            if (riskHeatmapOn) {
                const node = (SupplyChainManager._getNodes ? SupplyChainManager._getNodes() : [])
                    .find(n => n.id === nodeId);
                if (node) {
                    const heatColors = { low: 'rgba(34,197,94,0.15)', medium: 'rgba(245,158,11,0.25)', high: 'rgba(239,68,68,0.3)' };
                    const borderColors = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };
                    card.style.boxShadow = `inset 0 0 0 3px ${borderColors[node.risk] || borderColors.low}`;
                    card.style.backgroundColor = heatColors[node.risk] || heatColors.low;
                }
            }
        });
    };

    // Expose internal nodes array for heatmap access
    SupplyChainManager._getNodes = function () {
        try {
            const data = localStorage.getItem('lean_supply_chain');
            return data ? JSON.parse(data) : [];
        } catch { return []; }
    };

    window.scDragReorder = function (fromId, toId) {
        try {
            let nodes = JSON.parse(localStorage.getItem('lean_supply_chain') || '[]');
            const fromIdx = nodes.findIndex(n => n.id === fromId);
            const toIdx = nodes.findIndex(n => n.id === toId);
            if (fromIdx < 0 || toIdx < 0) return;
            const [moved] = nodes.splice(fromIdx, 1);
            nodes.splice(toIdx, 0, moved);
            localStorage.setItem('lean_supply_chain', JSON.stringify(nodes));
            // Reload from storage
            SupplyChainManager.load();
            if (typeof showToast === 'function') {
                const isDa = typeof currentLanguage !== 'undefined' && currentLanguage === 'da';
                showToast(isDa ? 'Trin omplaceret' : 'Step reordered', 'success');
            }
        } catch (e) { console.warn('SC reorder error:', e); }
    };

    window.scToggleRiskHeatmap = function () {
        riskHeatmapOn = !riskHeatmapOn;
        const btn = document.getElementById('scHeatmapBtn');
        if (btn) {
            btn.classList.toggle('bg-red-200', riskHeatmapOn);
            btn.classList.toggle('dark:bg-red-900/50', riskHeatmapOn);
        }
        SupplyChainManager.render();
    };
})();


// ============================================================
//  SMART GOALS ENHANCEMENTS (Milestones + Timeline + Auto-link)
// ============================================================
(function enhanceSmartGoals() {
    const MILESTONES_KEY = 'smart_goals_milestones';

    function loadMilestones() {
        try { return JSON.parse(localStorage.getItem(MILESTONES_KEY) || '{}'); } catch { return {}; }
    }
    function saveMilestones(data) {
        try { localStorage.setItem(MILESTONES_KEY, JSON.stringify(data)); } catch { /* quota */ }
    }

    // ─── Milestone management ─────────────
    window.smartAddMilestone = function (goalId) {
        const data = loadMilestones();
        if (!data[goalId]) data[goalId] = [];
        const isDa = typeof currentLanguage !== 'undefined' && currentLanguage === 'da';
        data[goalId].push({
            id: Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            text: isDa ? 'Ny milepæl' : 'New milestone',
            done: false,
            date: '',
        });
        saveMilestones(data);
        renderMilestones(goalId);
    };

    window.smartRemoveMilestone = function (goalId, msId) {
        const data = loadMilestones();
        if (data[goalId]) {
            data[goalId] = data[goalId].filter(m => m.id !== msId);
            saveMilestones(data);
            renderMilestones(goalId);
        }
    };

    window.smartToggleMilestone = function (goalId, msId) {
        const data = loadMilestones();
        if (data[goalId]) {
            const ms = data[goalId].find(m => m.id === msId);
            if (ms) ms.done = !ms.done;
            saveMilestones(data);
            renderMilestones(goalId);
            // Auto-update goal progress
            const total = data[goalId].length;
            const done = data[goalId].filter(m => m.done).length;
            if (total > 0) {
                const pct = Math.round((done / total) * 100);
                SmartGoalsManager.updateProgress(goalId, pct);
            }
        }
    };

    window.smartUpdateMilestoneText = function (goalId, msId, text) {
        const data = loadMilestones();
        if (data[goalId]) {
            const ms = data[goalId].find(m => m.id === msId);
            if (ms) ms.text = text;
            saveMilestones(data);
        }
    };

    window.smartUpdateMilestoneDate = function (goalId, msId, date) {
        const data = loadMilestones();
        if (data[goalId]) {
            const ms = data[goalId].find(m => m.id === msId);
            if (ms) ms.date = date;
            saveMilestones(data);
        }
    };

    function renderMilestones(goalId) {
        const container = document.getElementById(`milestones-${goalId}`);
        if (!container) return;
        const data = loadMilestones();
        const milestones = data[goalId] || [];

        if (milestones.length === 0) {
            container.innerHTML = `<p class="text-xs text-gray-400 italic">${typeof currentLanguage !== 'undefined' && currentLanguage === 'da' ? 'Ingen milepæle endnu' : 'No milestones yet'}</p>`;
            return;
        }

        container.innerHTML = milestones.map(ms => `
            <div class="flex items-center gap-2 py-1 group">
                <input type="checkbox" ${ms.done ? 'checked' : ''} onchange="smartToggleMilestone('${goalId}','${ms.id}')" class="w-3.5 h-3.5 rounded text-green-500 flex-shrink-0">
                <input type="text" value="${(ms.text || '').replace(/"/g, '&quot;')}" onchange="smartUpdateMilestoneText('${goalId}','${ms.id}',this.value)" class="flex-1 bg-transparent border-b border-gray-200 dark:border-gray-700 text-xs py-0.5 focus:border-blue-400 outline-none ${ms.done ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}">
                <input type="date" value="${ms.date || ''}" onchange="smartUpdateMilestoneDate('${goalId}','${ms.id}',this.value)" class="text-[10px] bg-transparent border-b border-gray-200 dark:border-gray-700 py-0.5 w-28">
                <button onclick="smartRemoveMilestone('${goalId}','${ms.id}')" class="text-red-400 hover:text-red-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
            </div>
        `).join('');
    }

    // ─── Override render to inject milestones section ──
    const _origRender = SmartGoalsManager.render.bind(SmartGoalsManager);
    SmartGoalsManager.render = function () {
        _origRender();
        // Post-process: inject milestones containers
        const goals = SmartGoalsManager.getGoals();
        if (!goals) return;

        goals.forEach(goal => {
            // Find the goal card and inject milestones section
            const progressBar = document.querySelector(`input[oninput*="smartUpdateProgress('${goal.id}'"]`);
            if (!progressBar) return;
            const card = progressBar.closest('.bg-gradient-to-br, .bg-white, [class*="rounded"]');
            if (!card) return;

            // Check if milestones already injected
            if (card.querySelector(`#milestones-${goal.id}`)) {
                renderMilestones(goal.id);
                return;
            }

            // Create milestones section
            const msSection = document.createElement('div');
            msSection.className = 'mt-3 pt-3 border-t border-gray-200 dark:border-gray-700';
            const isDa = typeof currentLanguage !== 'undefined' && currentLanguage === 'da';
            msSection.innerHTML = `
                <div class="flex items-center justify-between mb-2">
                    <h6 class="text-xs font-semibold text-gray-600 dark:text-gray-400">${isDa ? '🏁 Milepæle' : '🏁 Milestones'}</h6>
                    <button onclick="smartAddMilestone('${goal.id}')" class="text-[10px] px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200">+ ${isDa ? 'Tilføj' : 'Add'}</button>
                </div>
                <div id="milestones-${goal.id}" class="space-y-1"></div>
            `;
            card.appendChild(msSection);
            renderMilestones(goal.id);
        });
    };

    // ─── LEAN Auto-link badges ────────────
    window.smartGetLEANLinks = function (goalId) {
        // Try to detect which LEAN tools are relevant based on goal text
        const goals = SmartGoalsManager.getGoals();
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return [];

        const text = (goal.s + ' ' + (goal.m || '') + ' ' + (goal.r || '')).toLowerCase();
        const links = [];
        if (/oee|effective|effektiv|udstyr/.test(text)) links.push({ label: 'OEE', icon: '⚙️' });
        if (/takt|cycle|cyklus/.test(text)) links.push({ label: 'Takt Time', icon: '⏱️' });
        if (/spild|waste|muda/.test(text)) links.push({ label: '7 Wastes', icon: '🗑️' });
        if (/smed|setup|omstilling/.test(text)) links.push({ label: 'SMED', icon: '🔧' });
        if (/kaizen|forbedring|improve/.test(text)) links.push({ label: 'Kaizen', icon: '📈' });
        if (/vsm|value.stream/.test(text)) links.push({ label: 'VSM', icon: '🗺️' });
        if (/swot|styrke|weakness/.test(text)) links.push({ label: 'SWOT', icon: '🎯' });
        return links;
    };

    // ─── Timeline Chart ───────────────────
    window.smartRenderTimeline = function () {
        const container = document.getElementById('smartTimeline');
        if (!container) return;

        const goals = SmartGoalsManager.getGoals();
        if (!goals || goals.length === 0) {
            container.innerHTML = '';
            return;
        }

        const isDa = typeof currentLanguage !== 'undefined' && currentLanguage === 'da';
        const goalsWithDates = goals.filter(g => g.t);
        if (goalsWithDates.length === 0) {
            container.innerHTML = `<p class="text-sm text-gray-400 italic text-center py-4">${isDa ? 'Tilføj deadlines til mål for at se tidslinjen' : 'Add deadlines to goals to see the timeline'}</p>`;
            return;
        }

        // Build a simple horizontal timeline using HTML
        const now = Date.now();
        const dates = goalsWithDates.map(g => new Date(g.t).getTime());
        const minDate = Math.min(now, ...dates);
        const maxDate = Math.max(now, ...dates);
        const range = maxDate - minDate || 86400000;

        let html = '<div class="relative py-6">';
        // Timeline line
        html += '<div class="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 dark:bg-gray-600"></div>';
        // Now marker
        const nowPct = ((now - minDate) / range) * 100;
        html += `<div class="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800 z-10" style="left:${nowPct}%" title="${isDa ? 'Nu' : 'Now'}"></div>`;

        goalsWithDates.forEach((goal, i) => {
            const dt = new Date(goal.t).getTime();
            const pct = Math.max(2, Math.min(98, ((dt - minDate) / range) * 100));
            const isOverdue = dt < now && goal.progress < 100;
            const color = goal.progress >= 100 ? 'green' : isOverdue ? 'red' : 'indigo';
            const top = i % 2 === 0 ? '-top-8' : 'top-6';

            html += `
                <div class="absolute ${top}" style="left:${pct}%">
                    <div class="w-4 h-4 rounded-full bg-${color}-500 border-2 border-white dark:border-gray-800 shadow absolute -left-2 top-1/2 -translate-y-1/2"></div>
                    <div class="absolute -left-12 w-24 text-center ${i % 2 === 0 ? '-top-6' : 'top-6'} text-[10px] text-gray-600 dark:text-gray-400">
                        <p class="font-medium truncate text-${color}-600 dark:text-${color}-400">${(goal.s || '').slice(0, 20)}</p>
                        <p>${new Date(goal.t).toLocaleDateString(isDa ? 'da-DK' : 'en-US')}</p>
                        <p class="font-bold">${goal.progress}%</p>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    };

    // Auto-render timeline after goals render
    const _origRender2 = SmartGoalsManager.render;
    SmartGoalsManager.render = function () {
        _origRender2.call(SmartGoalsManager);
        setTimeout(smartRenderTimeline, 50);
    };
})();

// ============================================================
//  KOTTER'S 8-STEP CHANGE MODEL
// ============================================================
const KotterManager = (() => {
    const STORAGE_KEY = 'lean_kotter';
    const NOTES_KEY   = 'lean_kotter_notes';

    // The 8 steps grouped into 3 phases
    const PHASES = [
        {
            id: 1,
            title: 'Fase 1 — Skab klima for forandring',
            color: 'orange',
            steps: [
                { id: 1, title: 'Skab en følelse af nødvendighed', emoji: '🔥',
                  desc: 'Identificer trusler og muligheder. Vis hvorfor forandring er uundgåelig — brug data, konkurrentanalyser og kundehistorier.',
                  checklist: [
                      'Vi har identificeret eksterne trusler/muligheder',
                      'Ledelsen anerkender behovet for forandring',
                      'Der er delt fakta og data med organisationen',
                      'Vi har skabt dialog om konsekvenserne af status quo'
                  ]},
                { id: 2, title: 'Skab en styrende koalition', emoji: '🤝',
                  desc: 'Sammensæt et team af indflydelsesrige ledere og medarbejdere med magt, ekspertise, troværdighed og lederskab.',
                  checklist: [
                      'Koalitionen repræsenterer alle nøgleområder',
                      'Teamet har opbakning fra topledelsen',
                      'Roller og ansvar er defineret',
                      'Teamet mødes regelmæssigt'
                  ]},
                { id: 3, title: 'Udvikl en vision og strategi', emoji: '🎯',
                  desc: 'Formuler en klar og inspirerende vision der guider forandringsinitiativet, samt en strategi for at realisere visionen.',
                  checklist: [
                      'Visionen er klar og let at kommunikere (< 5 min)',
                      'Strategien er konkret med milepæle',
                      'Visionen er forankret i organisationens værdier',
                      'Alle i koalitionen kan forklare visionen'
                  ]}
            ]
        },
        {
            id: 2,
            title: 'Fase 2 — Engagér og muliggør hele organisationen',
            color: 'blue',
            steps: [
                { id: 4, title: 'Kommuniker forandringsvisionen', emoji: '📢',
                  desc: 'Brug enhver mulighed til at kommunikere visionen. Ledere skal "walk the talk" og agere som rollemodeller.',
                  checklist: [
                      'Visionen er kommunikeret bredt og ofte',
                      'Ledere demonstrerer ny adfærd',
                      'Feedback-kanaler er åbne og aktive',
                      'Kommunikation er tilpasset forskellige målgrupper'
                  ]},
                { id: 5, title: 'Fjern barrierer — styrk handlekraft', emoji: '💪',
                  desc: 'Identificer og fjern forhindringer for forandring: forældede strukturer, systemer, kompetencemangler eller modstand.',
                  checklist: [
                      'Strukturelle barrierer er identificeret',
                      'Medarbejdere har fået nødvendig træning',
                      'Systemer/processer er opdateret',
                      'Modstandere er hørt og adresseret'
                  ]},
                { id: 6, title: 'Skab hurtige gevinster (quick wins)', emoji: '🏆',
                  desc: 'Planlæg og fejr synlige, kortsigtede succeser der viser at forandringen virker og motiverer videre indsats.',
                  checklist: [
                      'Quick wins er planlagt og tidsbestemt',
                      'Resultater er målbare og synlige',
                      'Succeser er kommunikeret og fejret',
                      'Bidragydere er anerkendt'
                  ]}
            ]
        },
        {
            id: 3,
            title: 'Fase 3 — Implementér og fasthold forandringen',
            color: 'green',
            steps: [
                { id: 7, title: 'Konsolidér og byg videre', emoji: '📈',
                  desc: 'Brug momentum fra quick wins til at tackle større forandringer. Undgå at erklære sejr for tidligt.',
                  checklist: [
                      'Nye, større projekter er igangsat',
                      'Nye forandringsagenter er rekrutteret',
                      'Vi undgår at falde tilbage til gamle vaner',
                      'Forbedringer er dokumenteret og delt'
                  ]},
                { id: 8, title: 'Forankre forandringen i kulturen', emoji: '🏛️',
                  desc: 'Gør den nye tilgang til "måden vi gør tingene på". Indlejr forandringer i normer, værdier, rekruttering og onboarding.',
                  checklist: [
                      'Nye metoder er standard-procedurer',
                      'Onboarding inkluderer nye arbejdsmetoder',
                      'KPI\'er afspejler den nye tilgang',
                      'Lederskabsudvikling understøtter kulturen'
                  ]}
            ]
        }
    ];

    let data = { checks: {}, notes: '' };
    let activePhase = 1;

    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) { data.checks = JSON.parse(raw); }
            data.notes = localStorage.getItem(NOTES_KEY) || '';
        } catch(e) { console.warn('Kotter load error:', e); }
    }

    function saveChecks() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data.checks)); } catch(e) {}
    }

    function saveNotes() {
        const ta = document.getElementById('kotterActionPlan');
        if (ta) { data.notes = ta.value; }
        try { localStorage.setItem(NOTES_KEY, data.notes); } catch(e) {}
    }

    function getStepProgress(stepId) {
        const c = data.checks[stepId];
        if (!c) return 0;
        const step = PHASES.flatMap(p => p.steps).find(s => s.id === stepId);
        if (!step) return 0;
        const done = step.checklist.filter((_, i) => c[i]).length;
        return Math.round((done / step.checklist.length) * 100);
    }

    function getOverallProgress() {
        const allSteps = PHASES.flatMap(p => p.steps);
        const total = allSteps.reduce((s, st) => s + st.checklist.length, 0);
        let done = 0;
        allSteps.forEach(st => {
            const c = data.checks[st.id];
            if (c) { st.checklist.forEach((_, i) => { if (c[i]) done++; }); }
        });
        return total ? Math.round((done / total) * 100) : 0;
    }

    function updateOverallBar() {
        const pct = getOverallProgress();
        const bar = document.getElementById('kotterOverallBar');
        const txt = document.getElementById('kotterOverallPct');
        if (bar) bar.style.width = pct + '%';
        if (txt) txt.textContent = pct + '%';
    }

    function toggleCheck(stepId, idx) {
        if (!data.checks[stepId]) data.checks[stepId] = {};
        data.checks[stepId][idx] = !data.checks[stepId][idx];
        saveChecks();
        render();
    }

    function showPhase(phaseId) {
        activePhase = phaseId;
        // Update buttons
        for (let i = 1; i <= 3; i++) {
            const btn = document.getElementById('kotterPhaseBtn' + i);
            if (!btn) continue;
            if (i === phaseId) {
                btn.className = 'kotter-phase-btn px-4 py-2 rounded-lg text-sm font-bold transition-colors bg-orange-600 text-white';
            } else {
                btn.className = 'kotter-phase-btn px-4 py-2 rounded-lg text-sm font-bold transition-colors bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600';
            }
        }
        render();
    }

    function render() {
        const container = document.getElementById('kotterStepsContainer');
        if (!container) return;

        const phase = PHASES.find(p => p.id === activePhase);
        if (!phase) return;

        const colorMap = { orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-300 dark:border-orange-700', bar: 'bg-orange-500', text: 'text-orange-700 dark:text-orange-400', check: 'text-orange-600' },
                          blue:   { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-300 dark:border-blue-700', bar: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-400', check: 'text-blue-600' },
                          green:  { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-300 dark:border-green-700', bar: 'bg-green-500', text: 'text-green-700 dark:text-green-400', check: 'text-green-600' }};
        const c = colorMap[phase.color] || colorMap.orange;

        let html = `<div class="mb-3"><h4 class="font-bold ${c.text} text-lg">${phase.title}</h4></div>`;

        phase.steps.forEach(step => {
            const pct = getStepProgress(step.id);
            const checks = data.checks[step.id] || {};

            html += `
            <div class="rounded-xl border ${c.border} ${c.bg} p-4 shadow-sm">
                <div class="flex items-center justify-between mb-2">
                    <h5 class="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <span class="text-xl">${step.emoji}</span>
                        <span>Trin ${step.id}: ${step.title}</span>
                    </h5>
                    <span class="text-sm font-bold ${c.text}">${pct}%</span>
                </div>
                <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-3 overflow-hidden">
                    <div class="h-full ${c.bar} rounded-full transition-all duration-300" style="width:${pct}%"></div>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">${step.desc}</p>
                <div class="space-y-2">`;

            step.checklist.forEach((item, idx) => {
                const checked = checks[idx];
                html += `
                    <label class="flex items-start gap-2 cursor-pointer group" onclick="KotterManager.toggleCheck(${step.id}, ${idx})">
                        <span class="mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${checked ? c.bar + ' border-transparent text-white' : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400'}">
                            ${checked ? '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>' : ''}
                        </span>
                        <span class="text-sm ${checked ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}">${item}</span>
                    </label>`;
            });

            html += `</div></div>`;
        });

        container.innerHTML = html;
        updateOverallBar();
    }

    function exportPlan() {
        const isDa = (typeof currentLanguage !== 'undefined' && currentLanguage === 'da');
        let text = '=== Kotter\'s 8-Step Change Model ===\n';
        text += isDa ? 'Eksporteret: ' : 'Exported: ';
        text += new Date().toLocaleString(isDa ? 'da-DK' : 'en-US') + '\n';
        text += `Samlet fremskridt: ${getOverallProgress()}%\n\n`;

        PHASES.forEach(phase => {
            text += `── ${phase.title} ──\n`;
            phase.steps.forEach(step => {
                const pct = getStepProgress(step.id);
                text += `\n  ${step.emoji} Trin ${step.id}: ${step.title}  [${pct}%]\n`;
                text += `     ${step.desc}\n`;
                const checks = data.checks[step.id] || {};
                step.checklist.forEach((item, idx) => {
                    text += `     ${checks[idx] ? '☑' : '☐'} ${item}\n`;
                });
            });
            text += '\n';
        });

        if (data.notes) {
            text += `── Handlingsplan ──\n${data.notes}\n`;
        }

        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url;
        a.download = `kotter_plan_${new Date().toISOString().slice(0,10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        if (typeof showToast === 'function') showToast(isDa ? 'Kotter-plan eksporteret' : 'Kotter plan exported', 'success');
    }

    function resetAll() {
        const isDa = (typeof currentLanguage !== 'undefined' && currentLanguage === 'da');
        if (!confirm(isDa ? 'Nulstil alle Kotter-data? Dette kan ikke fortrydes.' : 'Reset all Kotter data? This cannot be undone.')) return;
        data.checks = {};
        data.notes = '';
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(NOTES_KEY);
        const ta = document.getElementById('kotterActionPlan');
        if (ta) ta.value = '';
        render();
        if (typeof showToast === 'function') showToast(isDa ? 'Kotter-data nulstillet' : 'Kotter data reset', 'success');
    }

    function init() {
        load();
        const ta = document.getElementById('kotterActionPlan');
        if (ta) ta.value = data.notes;
        render();
    }

    // Auto-init when Kotter section is opened
    document.addEventListener('DOMContentLoaded', () => {
        // Observe the kotter-content div becoming visible
        const target = document.getElementById('kotter-content');
        if (target) {
            const obs = new MutationObserver(() => {
                if (target.style.display !== 'none') { init(); obs.disconnect(); }
            });
            obs.observe(target, { attributes: true, attributeFilter: ['style'] });
        }
    });

    return { showPhase, toggleCheck, saveNotes, exportPlan, resetAll, init };
})();
