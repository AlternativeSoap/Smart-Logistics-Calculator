/**
 * export-center.js
 * Universal Export Center, Project Backup/Restore, PDF Reports
 * Part of Smart Logistics Calculator
 */

// ============================================================
//  EXPORT CENTER – Modal Controls
// ============================================================
function openExportCenter() {
    const modal = document.getElementById('exportCenterModal');
    if (modal) {
        modal.classList.remove('hidden');
        switchExportTab('quick');
        refreshExportStatus();
    }
}

function closeExportCenter() {
    const modal = document.getElementById('exportCenterModal');
    if (modal) modal.classList.add('hidden');
}

function switchExportTab(tab) {
    document.querySelectorAll('.ec-tab-btn').forEach(btn => {
        btn.classList.remove('border-emerald-500', 'text-emerald-600', 'dark:text-emerald-400');
        btn.classList.add('border-transparent', 'text-gray-500');
    });
    document.querySelectorAll('.ec-tab-content').forEach(c => c.classList.add('hidden'));

    const tabBtn = document.getElementById('ecTab' + tab.charAt(0).toUpperCase() + tab.slice(1));
    const content = document.getElementById('ecContent' + tab.charAt(0).toUpperCase() + tab.slice(1));
    if (tabBtn) {
        tabBtn.classList.add('border-emerald-500', 'text-emerald-600', 'dark:text-emerald-400');
        tabBtn.classList.remove('border-transparent', 'text-gray-500');
    }
    if (content) content.classList.remove('hidden');

    if (tab === 'backup') refreshBackupInfo();
}

// ============================================================
//  DATA STATUS
// ============================================================
function refreshExportStatus() {
    const grid = document.getElementById('ecStatusGrid');
    if (!grid) return;

    const sections = [
        { key: 'abc', label: 'ABC', count: (typeof abcResults !== 'undefined' ? abcResults.length : 0), icon: '📊' },
        { key: 'doubleAbc', label: 'Dobbelt ABC', count: (typeof doubleABCResults !== 'undefined' ? doubleABCResults.length : 0), icon: '📈' },
        { key: 'wilson', label: 'Wilson EOQ', count: countWilsonData(), icon: '🧮' },
        { key: 'inventory', label: 'Lagerstyring', count: countInventoryData(), icon: '📦' },
        { key: 'lean', label: 'LEAN', count: countLeanData(), icon: '🏭' },
        { key: 'budget', label: 'Budget', count: countBudgetData(), icon: '💰' },
        { key: 'supplychain', label: 'Logistikkæde', count: typeof SupplyChainManager !== 'undefined' ? SupplyChainManager.getNodes().length : 0, icon: '🔗' },
        { key: 'smart', label: 'SMART Mål', count: typeof SmartGoalsManager !== 'undefined' ? SmartGoalsManager.getGoals().length : 0, icon: '🎯' }
    ];

    grid.innerHTML = sections.map(s => `
        <div class="bg-white dark:bg-gray-800 rounded-lg p-3 border ${s.count > 0 ? 'border-green-200 dark:border-green-700' : 'border-gray-200 dark:border-gray-700'}">
            <div class="flex items-center gap-2">
                <span class="text-lg">${s.icon}</span>
                <div>
                    <p class="text-xs font-medium text-gray-600 dark:text-gray-400">${s.label}</p>
                    <p class="font-bold ${s.count > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}">${s.count > 0 ? s.count + ' poster' : 'Ingen data'}</p>
                </div>
            </div>
        </div>
    `).join('');

    // Update individual export counts
    const countEls = {
        ecAbcCount: sections[0].count,
        ecDoubleAbcCount: sections[1].count,
        ecWilsonCount: sections[2].count,
        ecInventoryCount: sections[3].count,
        ecLeanCount: sections[4].count,
        ecBudgetCount: sections[5].count,
        ecCustomCount: countCustomPages()
    };
    for (const [id, count] of Object.entries(countEls)) {
        const el = document.getElementById(id);
        if (el) el.textContent = count > 0 ? `${count} poster` : 'Ingen data';
    }
}

function countWilsonData() {
    try {
        const el = document.getElementById('wilsonResult');
        if (el && el.innerHTML.trim().length > 10) return 1;
        const batch = document.getElementById('batchResultsBody');
        if (batch && batch.children.length > 0) return batch.children.length;
    } catch (e) {}
    return 0;
}

function countInventoryData() {
    try {
        const keys = ['inventoryItems', 'ropCalculations'];
        let count = 0;
        keys.forEach(k => {
            const d = localStorage.getItem(k);
            if (d) {
                const arr = JSON.parse(d);
                if (Array.isArray(arr)) count += arr.length;
            }
        });
        return count;
    } catch (e) { return 0; }
}

function countLeanData() {
    let count = 0;
    const keys = ['lean_oee_data', 'lean_smed_data', 'lean_7wastes_data', 'lean_swot_analysis',
        'lean_takt_data', 'lean_cycle_data', 'lean_lead_data', 'lean_improvements',
        'lean_vsm_data', 'lean_kaizen_data'];
    keys.forEach(k => { if (localStorage.getItem(k)) count++; });
    return count;
}

function countBudgetData() {
    try {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('budget_'));
        return keys.length;
    } catch (e) { return 0; }
}

function countCustomPages() {
    try {
        const d = localStorage.getItem('customPages');
        if (d) {
            const arr = JSON.parse(d);
            return Array.isArray(arr) ? arr.length : 0;
        }
    } catch (e) {}
    return 0;
}

// ============================================================
//  INDIVIDUAL EXPORTS (ecExport dispatcher)
// ============================================================
function ecExport(section, format) {
    try {
        switch (section) {
            case 'abc':
                if (format === 'csv') { if (typeof downloadResultsCSV === 'function') downloadResultsCSV(); }
                else if (format === 'excel') { if (typeof exportToExcel === 'function') exportToExcel(); }
                else if (format === 'pdf') { generatePDFReport('abc'); }
                break;
            case 'doubleAbc':
                if (format === 'excel') { if (typeof exportDoubleABCExcel === 'function') exportDoubleABCExcel(); }
                else if (format === 'pdf') { generatePDFReport('abc'); }
                break;
            case 'wilson':
                if (format === 'csv') { if (typeof exportBatchEOQ === 'function') exportBatchEOQ(); }
                else if (format === 'excel') { if (typeof exportBatchToExcel === 'function') exportBatchToExcel(); }
                else if (format === 'pdf') { generatePDFReport('wilson'); }
                break;
            case 'inventory':
                if (format === 'csv' || format === 'excel') { ecExportInventory(format); }
                else if (format === 'pdf') { generatePDFReport('dashboard'); }
                break;
            case 'lean':
                if (format === 'text') { if (typeof exportLEANReport === 'function') exportLEANReport(); }
                else if (format === 'excel') { ecExportLeanExcel(); }
                else if (format === 'pdf') { generatePDFReport('lean'); }
                break;
            case 'budget':
                if (format === 'csv') { if (typeof BudgetExporter !== 'undefined') BudgetExporter.exportToCSV(); }
                else if (format === 'excel') { if (typeof BudgetExporter !== 'undefined') BudgetExporter.exportToExcel(); }
                else if (format === 'pdf') { generatePDFReport('budget'); }
                break;
            case 'custom':
                if (format === 'json') { if (typeof exportCustomPages === 'function') exportCustomPages(); }
                break;
            default:
                showToast('Ukendt sektion', 'warning');
        }
    } catch (e) {
        console.error('Export error:', e);
        showToast('Fejl ved eksport: ' + e.message, 'error');
    }
}

function ecExportInventory(format) {
    try {
        const data = localStorage.getItem('inventoryItems');
        if (!data) { showToast('Ingen lagerdata', 'warning'); return; }
        const items = JSON.parse(data);
        if (format === 'csv') {
            const headers = Object.keys(items[0] || {});
            let csv = headers.join(',') + '\n';
            items.forEach(item => {
                csv += headers.map(h => `"${(item[h] || '').toString().replace(/"/g, '""')}"`).join(',') + '\n';
            });
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'inventory_data.csv';
            link.click();
            showToast('CSV eksporteret', 'success');
        } else {
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(items);
            XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
            XLSX.writeFile(wb, 'inventory_data.xlsx');
            showToast('Excel eksporteret', 'success');
        }
    } catch (e) {
        showToast('Fejl: ' + e.message, 'error');
    }
}

function ecExportLeanExcel() {
    try {
        const wb = XLSX.utils.book_new();
        let hasData = false;

        // OEE
        const oee = localStorage.getItem('lean_oee_data');
        if (oee) {
            const d = JSON.parse(oee);
            const ws = XLSX.utils.json_to_sheet([d]);
            XLSX.utils.book_append_sheet(wb, ws, 'OEE');
            hasData = true;
        }
        // SWOT
        const swot = localStorage.getItem('lean_swot_analysis');
        if (swot) {
            const d = JSON.parse(swot);
            const rows = [];
            ['strengths', 'weaknesses', 'opportunities', 'threats'].forEach(cat => {
                (d[cat] || []).forEach(item => rows.push({ Category: cat, Item: item }));
            });
            if (rows.length) {
                const ws = XLSX.utils.json_to_sheet(rows);
                XLSX.utils.book_append_sheet(wb, ws, 'SWOT');
                hasData = true;
            }
        }
        // Supply Chain
        if (typeof SupplyChainManager !== 'undefined') {
            const scNodes = SupplyChainManager.getNodes();
            if (scNodes.length) {
                const ws = XLSX.utils.json_to_sheet(scNodes.map((n, i) => ({
                    Step: i + 1, Type: n.type, Name: n.name, Time: n.time, Cost: n.cost, Risk: n.risk, Notes: n.notes
                })));
                XLSX.utils.book_append_sheet(wb, ws, 'Supply Chain');
                hasData = true;
            }
        }
        // SMART Goals
        if (typeof SmartGoalsManager !== 'undefined') {
            const goals = SmartGoalsManager.getGoals();
            if (goals.length) {
                const ws = XLSX.utils.json_to_sheet(goals.map((g, i) => ({
                    '#': i + 1, Specifik: g.s, Målbar: g.m, Opnåelig: g.a, Relevant: g.r, Deadline: g.t, Fremgang: g.progress + '%'
                })));
                XLSX.utils.book_append_sheet(wb, ws, 'SMART Goals');
                hasData = true;
            }
        }

        if (!hasData) { showToast('Ingen LEAN-data at eksportere', 'warning'); return; }
        XLSX.writeFile(wb, 'lean_data.xlsx');
        showToast('LEAN Excel eksporteret', 'success');
    } catch (e) {
        console.error('LEAN Excel error:', e);
        showToast('Fejl: ' + e.message, 'error');
    }
}

// ============================================================
//  EXPORT ALL (Multi-sheet workbook or JSON)
// ============================================================
function exportAllWorkbook() {
    try {
        const wb = XLSX.utils.book_new();
        let sheetCount = 0;

        // ABC
        if (typeof abcResults !== 'undefined' && abcResults.length > 0) {
            const data = abcResults.map(r => ({
                Name: r.name || r.item, Value: r.value, CumulativePercent: r.cumulativePercent, Group: r.group
            }));
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'ABC Analysis');
            sheetCount++;
        }

        // Double ABC
        if (typeof doubleABCResults !== 'undefined' && doubleABCResults.length > 0) {
            const data = doubleABCResults.map(r => ({ ...r }));
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Double ABC');
            sheetCount++;
        }

        // Inventory
        try {
            const invData = localStorage.getItem('inventoryItems');
            if (invData) {
                const items = JSON.parse(invData);
                if (items.length) {
                    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(items), 'Inventory');
                    sheetCount++;
                }
            }
        } catch (e) {}

        // LEAN data
        const leanKeys = ['lean_oee_data', 'lean_smed_data', 'lean_takt_data', 'lean_swot_analysis'];
        const leanSheetNames = ['LEAN OEE', 'LEAN SMED', 'LEAN Takt', 'LEAN SWOT'];
        leanKeys.forEach((key, i) => {
            try {
                const d = localStorage.getItem(key);
                if (d) {
                    const parsed = JSON.parse(d);
                    if (key === 'lean_swot_analysis') {
                        const rows = [];
                        ['strengths', 'weaknesses', 'opportunities', 'threats'].forEach(cat => {
                            (parsed[cat] || []).forEach(item => rows.push({ Category: cat, Item: item }));
                        });
                        if (rows.length) { XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), leanSheetNames[i]); sheetCount++; }
                    } else {
                        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([parsed]), leanSheetNames[i]);
                        sheetCount++;
                    }
                }
            } catch (e) {}
        });

        // Supply Chain
        if (typeof SupplyChainManager !== 'undefined') {
            const scNodes = SupplyChainManager.getNodes();
            if (scNodes.length) {
                XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(scNodes.map((n, i) => ({
                    Step: i + 1, Type: n.type, Name: n.name, Time: n.time, Cost: n.cost, Risk: n.risk, Notes: n.notes
                }))), 'Supply Chain');
                sheetCount++;
            }
        }

        // SMART Goals
        if (typeof SmartGoalsManager !== 'undefined') {
            const goals = SmartGoalsManager.getGoals();
            if (goals.length) {
                XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(goals.map((g, i) => ({
                    '#': i + 1, Specifik: g.s, Målbar: g.m, Opnåelig: g.a, Relevant: g.r, Deadline: g.t, Fremgang: g.progress + '%'
                }))), 'SMART Goals');
                sheetCount++;
            }
        }

        // Budget
        try {
            const budgetKeys = Object.keys(localStorage).filter(k => k.startsWith('budget_'));
            if (budgetKeys.length) {
                const allBudget = [];
                budgetKeys.forEach(k => {
                    try { const d = JSON.parse(localStorage.getItem(k)); allBudget.push({ key: k, ...d }); } catch (e) {}
                });
                if (allBudget.length) {
                    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(allBudget), 'Budget');
                    sheetCount++;
                }
            }
        } catch (e) {}

        if (sheetCount === 0) {
            showToast('Ingen data at eksportere', 'warning');
            return;
        }

        XLSX.writeFile(wb, `smart_logistics_all_${new Date().toISOString().split('T')[0]}.xlsx`);
        showToast(`Eksporteret ${sheetCount} sektioner til Excel`, 'success');
        updateLastExport();
    } catch (e) {
        console.error('Export all error:', e);
        showToast('Fejl ved eksport: ' + e.message, 'error');
    }
}

function exportAllJSON() {
    try {
        const backup = gatherAllData();
        const json = JSON.stringify(backup, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `smart_logistics_all_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(link.href);
        showToast('JSON eksporteret', 'success');
        updateLastExport();
    } catch (e) {
        console.error('JSON export error:', e);
        showToast('Fejl: ' + e.message, 'error');
    }
}

// ============================================================
//  PROJECT BACKUP & RESTORE
// ============================================================
function gatherAllData() {
    const data = {
        _meta: {
            version: '4.0',
            app: 'Smart Logistics Calculator',
            exportDate: new Date().toISOString(),
            type: 'full-backup'
        },
        localStorage: {},
        memory: {}
    };

    // Save all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
            data.localStorage[key] = localStorage.getItem(key);
        } catch (e) {}
    }

    // Save in-memory data
    if (typeof abcResults !== 'undefined' && abcResults.length) {
        data.memory.abcResults = abcResults.map(r => {
            const clean = { ...r };
            delete clean._original; // Too large for backup
            return clean;
        });
    }
    if (typeof doubleABCResults !== 'undefined' && doubleABCResults.length) {
        data.memory.doubleABCResults = doubleABCResults;
    }
    if (typeof uploadedData !== 'undefined' && uploadedData.length) {
        data.memory.uploadedData = uploadedData;
    }

    return data;
}

function createFullBackup() {
    try {
        const data = gatherAllData();
        const json = JSON.stringify(data, null, 2);
        const sizeKB = Math.round(json.length / 1024);

        const blob = new Blob([json], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `SLC_backup_${new Date().toISOString().split('T')[0]}.slcbackup`;
        link.click();
        URL.revokeObjectURL(link.href);

        showToast(`Backup oprettet (${sizeKB} KB)`, 'success');
        updateLastExport();
    } catch (e) {
        console.error('Backup error:', e);
        showToast('Fejl ved backup: ' + e.message, 'error');
    }
}

let pendingBackupData = null;

function handleBackupRestore(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);

            // Validate
            if (!data._meta || !data.localStorage) {
                showToast('Ugyldig backup-fil', 'error');
                return;
            }

            pendingBackupData = data;

            // Show preview
            const preview = document.getElementById('ecRestorePreview');
            const content = document.getElementById('ecRestoreContent');
            if (!preview || !content) return;

            const lsKeys = Object.keys(data.localStorage || {});
            const memKeys = Object.keys(data.memory || {});

            let html = `<div class="space-y-2">`;
            html += `<p class="text-xs text-gray-500">Version: ${data._meta.version || '?'} | Dato: ${new Date(data._meta.exportDate).toLocaleDateString('da-DK')}</p>`;
            html += `<p class="text-sm"><span class="font-bold">${lsKeys.length}</span> gemte nøgler</p>`;
            if (memKeys.length) html += `<p class="text-sm"><span class="font-bold">${memKeys.length}</span> hukommelsesdata</p>`;

            // Categorize keys
            const cats = {
                'ABC Data': lsKeys.filter(k => k.includes('abc')).length,
                'LEAN Data': lsKeys.filter(k => k.includes('lean')).length,
                'Budget': lsKeys.filter(k => k.includes('budget')).length,
                'Supply Chain': lsKeys.filter(k => k.includes('supply_chain')).length,
                'SMART Goals': lsKeys.filter(k => k.includes('smart_goals')).length,
                'Inventory': lsKeys.filter(k => k.includes('inventory')).length,
                'Custom Pages': lsKeys.filter(k => k.includes('custom')).length,
                'Settings': lsKeys.filter(k => k.includes('theme') || k.includes('language') || k.includes('setting')).length
            };

            html += '<div class="grid grid-cols-2 gap-2 mt-2">';
            for (const [cat, count] of Object.entries(cats)) {
                if (count > 0) {
                    html += `<div class="bg-gray-50 dark:bg-gray-800 rounded p-2 text-xs"><span class="font-bold">${cat}:</span> ${count} poster</div>`;
                }
            }
            html += '</div></div>';

            content.innerHTML = html;
            preview.classList.remove('hidden');
        } catch (err) {
            showToast('Kunne ikke læse backup-fil: ' + err.message, 'error');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function confirmRestore(doRestore) {
    const preview = document.getElementById('ecRestorePreview');
    if (preview) preview.classList.add('hidden');

    if (!doRestore || !pendingBackupData) {
        pendingBackupData = null;
        return;
    }

    try {
        const data = pendingBackupData;

        // Restore localStorage
        if (data.localStorage) {
            for (const [key, value] of Object.entries(data.localStorage)) {
                try { localStorage.setItem(key, value); } catch (e) {}
            }
        }

        // Restore memory data
        if (data.memory) {
            if (data.memory.abcResults && typeof abcResults !== 'undefined') {
                abcResults = data.memory.abcResults;
            }
            if (data.memory.doubleABCResults && typeof doubleABCResults !== 'undefined') {
                doubleABCResults = data.memory.doubleABCResults;
            }
            if (data.memory.uploadedData && typeof uploadedData !== 'undefined') {
                uploadedData = data.memory.uploadedData;
            }
        }

        pendingBackupData = null;
        showToast('Backup gendannet! Genindlæser side...', 'success');
        setTimeout(() => location.reload(), 1500);
    } catch (e) {
        console.error('Restore error:', e);
        showToast('Fejl ved gendannelse: ' + e.message, 'error');
    }
}

function clearAllData() {
    const msg = currentLanguage === 'en'
        ? 'WARNING: This will delete ALL saved data. This cannot be undone.\n\nType "DELETE" to confirm:'
        : 'ADVARSEL: Dette sletter ALLE gemte data. Det kan ikke fortrydes.\n\nSkriv "SLET" for at bekræfte:';

    const answer = prompt(msg);
    if (answer !== 'SLET' && answer !== 'DELETE') {
        showToast('Sletning annulleret', 'info');
        return;
    }

    localStorage.clear();
    showToast('Alle data er slettet. Genindlæser...', 'success');
    setTimeout(() => location.reload(), 1500);
}

function refreshBackupInfo() {
    const sizeEl = document.getElementById('ecBackupSize');
    if (sizeEl) {
        let totalSize = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            totalSize += (localStorage.getItem(key) || '').length;
        }
        const kb = Math.round(totalSize / 1024);
        sizeEl.textContent = `Estimeret størrelse: ~${kb} KB`;
    }
}

function updateLastExport() {
    const el = document.getElementById('ecLastExport');
    if (el) {
        el.textContent = `Seneste eksport: ${new Date().toLocaleString('da-DK')}`;
    }
}

// ============================================================
//  PDF REPORT GENERATOR
// ============================================================
function generatePDFReport(type) {
    try {
        if (!window.jspdf) {
            showToast('PDF-bibliotek indlæses ikke korrekt. Prøv at genindlæse siden.', 'error');
            return;
        }

        const { jsPDF } = window.jspdf;

        switch (type) {
            case 'dashboard': return generateDashboardPDF(jsPDF);
            case 'abc':       return generateABCPDF(jsPDF);
            case 'wilson':    return generateWilsonPDF(jsPDF);
            case 'lean':      return generateLEANPDF(jsPDF);
            case 'budget':    return generateBudgetPDF(jsPDF);
            case 'full':      return generateFullPDF(jsPDF);
            default:
                showToast('Ukendt rapporttype', 'warning');
        }
    } catch (e) {
        console.error('PDF generation error:', e);
        showToast('Fejl ved PDF-generering: ' + e.message, 'error');
    }
}

function pdfHeader(doc, title, subtitle) {
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text(title, 14, 14);
    doc.setFontSize(10);
    doc.text(subtitle || `Smart Logistics Calculator | ${new Date().toLocaleDateString('da-DK')}`, 14, 22);
    doc.setTextColor(0, 0, 0);
    return 38;
}

function generateDashboardPDF(jsPDF) {
    const doc = new jsPDF('portrait', 'mm', 'a4');
    let y = pdfHeader(doc, 'Dashboard Rapport', 'Overblik over alle data');

    doc.setFontSize(12);
    doc.text('Dataoversigt', 14, y);
    y += 8;

    const summaryData = [
        ['ABC Analyse', `${typeof abcResults !== 'undefined' ? abcResults.length : 0} poster`],
        ['Dobbelt ABC', `${typeof doubleABCResults !== 'undefined' ? doubleABCResults.length : 0} poster`],
        ['LEAN Moduler', `${countLeanData()} aktive`],
        ['Budget Poster', `${countBudgetData()} poster`],
        ['Logistikkæde', `${typeof SupplyChainManager !== 'undefined' ? SupplyChainManager.getNodes().length : 0} trin`],
        ['SMART Mål', `${typeof SmartGoalsManager !== 'undefined' ? SmartGoalsManager.getGoals().length : 0} mål`]
    ];

    doc.autoTable({
        startY: y,
        head: [['Modul', 'Status']],
        body: summaryData,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [16, 185, 129] }
    });

    doc.save('dashboard_rapport.pdf');
    showToast('Dashboard PDF eksporteret', 'success');
    updateLastExport();
}

function generateABCPDF(jsPDF) {
    if (typeof abcResults === 'undefined' || abcResults.length === 0) {
        showToast('Ingen ABC-data at eksportere', 'warning');
        return;
    }

    const doc = new jsPDF('portrait', 'mm', 'a4');
    let y = pdfHeader(doc, 'ABC Analyse Rapport');

    // Summary
    const groups = { A: 0, B: 0, C: 0 };
    abcResults.forEach(r => { if (r.group) groups[r.group] = (groups[r.group] || 0) + 1; });

    doc.setFontSize(12);
    doc.text('Klassificering', 14, y);
    y += 6;
    doc.autoTable({
        startY: y,
        head: [['Gruppe', 'Antal Varer', 'Andel']],
        body: [
            ['A', groups.A, `${Math.round(groups.A / abcResults.length * 100)}%`],
            ['B', groups.B, `${Math.round(groups.B / abcResults.length * 100)}%`],
            ['C', groups.C, `${Math.round(groups.C / abcResults.length * 100)}%`],
            ['Total', abcResults.length, '100%']
        ],
        styles: { fontSize: 9 },
        headStyles: { fillColor: [59, 130, 246] }
    });

    y = doc.lastAutoTable.finalY + 10;
    doc.text('Detaljer (top 50)', 14, y);
    y += 6;

    const details = abcResults.slice(0, 50).map((r, i) => [
        i + 1, r.name || r.item || '', r.value ? r.value.toFixed(0) : '', r.cumulativePercent ? r.cumulativePercent.toFixed(1) + '%' : '', r.group || ''
    ]);

    doc.autoTable({
        startY: y,
        head: [['#', 'Varenavn', 'Værdi', 'Kumulativ %', 'Gruppe']],
        body: details,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save('abc_analyse_rapport.pdf');
    showToast('ABC PDF eksporteret', 'success');
    updateLastExport();
}

function generateWilsonPDF(jsPDF) {
    const doc = new jsPDF('portrait', 'mm', 'a4');
    let y = pdfHeader(doc, 'Wilson EOQ Rapport');

    doc.setFontSize(11);
    doc.text('Wilson EOQ-beregninger er baseret på data fra batch-beregninger.', 14, y);
    y += 8;

    // Try to get batch results from the DOM
    const tbody = document.getElementById('batchResultsBody');
    if (tbody && tbody.children.length > 0) {
        const rows = [];
        Array.from(tbody.children).forEach(tr => {
            const cells = Array.from(tr.children).map(td => td.textContent.trim());
            rows.push(cells);
        });

        const headers = [];
        const thead = document.querySelector('#batchResultsTable thead tr, #batchWilsonTable thead tr');
        if (thead) {
            Array.from(thead.children).forEach(th => headers.push(th.textContent.trim()));
        }

        doc.autoTable({
            startY: y,
            head: headers.length ? [headers] : undefined,
            body: rows,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [139, 92, 246] }
        });
    } else {
        doc.text('Ingen batch-resultater fundet. Kør batch-beregning først.', 14, y);
    }

    doc.save('wilson_eoq_rapport.pdf');
    showToast('Wilson PDF eksporteret', 'success');
    updateLastExport();
}

function generateLEANPDF(jsPDF) {
    const doc = new jsPDF('portrait', 'mm', 'a4');
    let y = pdfHeader(doc, 'LEAN Værktøjer Rapport');

    // OEE
    const oeeData = localStorage.getItem('lean_oee_data');
    if (oeeData) {
        const oee = JSON.parse(oeeData);
        doc.setFontSize(14);
        doc.text('OEE (Overall Equipment Effectiveness)', 14, y);
        y += 6;
        doc.autoTable({
            startY: y,
            head: [['Parameter', 'Værdi']],
            body: [
                ['Tilgængelighed', (oee.availability || 0) + '%'],
                ['Ydelse', (oee.performance || 0) + '%'],
                ['Kvalitet', (oee.quality || 0) + '%'],
                ['OEE', (oee.oee || 0) + '%']
            ],
            styles: { fontSize: 9 },
            headStyles: { fillColor: [16, 185, 129] }
        });
        y = doc.lastAutoTable.finalY + 10;
    }

    // SWOT
    const swotData = localStorage.getItem('lean_swot_analysis');
    if (swotData) {
        const swot = JSON.parse(swotData);
        doc.setFontSize(14);
        doc.text('SWOT Analyse', 14, y);
        y += 6;
        const swotRows = [];
        ['strengths', 'weaknesses', 'opportunities', 'threats'].forEach(cat => {
            const label = { strengths: 'Styrker', weaknesses: 'Svagheder', opportunities: 'Muligheder', threats: 'Trusler' }[cat];
            (swot[cat] || []).forEach(item => swotRows.push([label, item]));
        });
        if (swotRows.length) {
            doc.autoTable({
                startY: y,
                head: [['Kategori', 'Element']],
                body: swotRows,
                styles: { fontSize: 9 },
                headStyles: { fillColor: [245, 158, 11] }
            });
            y = doc.lastAutoTable.finalY + 10;
        }
    }

    // Supply Chain
    if (typeof SupplyChainManager !== 'undefined') {
        const scNodes = SupplyChainManager.getNodes();
        if (scNodes.length) {
            if (y > 240) { doc.addPage(); y = 20; }
            doc.setFontSize(14);
            doc.text('Logistikkæde (Supply Chain)', 14, y);
            y += 6;
            doc.autoTable({
                startY: y,
                head: [['#', 'Type', 'Navn', 'Tid (dage)', 'Omkostning', 'Risiko']],
                body: scNodes.map((n, i) => [i + 1, n.type, n.name, n.time, n.cost.toLocaleString('da-DK') + ' kr', n.risk === 'high' ? 'Høj' : n.risk === 'medium' ? 'Middel' : 'Lav']),
                styles: { fontSize: 9 },
                headStyles: { fillColor: [20, 184, 166] }
            });
            y = doc.lastAutoTable.finalY + 10;
        }
    }

    // SMART Goals
    if (typeof SmartGoalsManager !== 'undefined') {
        const goals = SmartGoalsManager.getGoals();
        if (goals.length) {
            if (y > 240) { doc.addPage(); y = 20; }
            doc.setFontSize(14);
            doc.text('SMART Mål', 14, y);
            y += 6;
            doc.autoTable({
                startY: y,
                head: [['Specifik', 'Målbar', 'Opnåelig', 'Relevant', 'Deadline', 'Fremgang']],
                body: goals.map(g => [g.s, g.m || '-', g.a || '-', g.r || '-', g.t ? new Date(g.t).toLocaleDateString('da-DK') : '-', g.progress + '%']),
                styles: { fontSize: 8 },
                headStyles: { fillColor: [234, 88, 12] }
            });
        }
    }

    doc.save('lean_rapport.pdf');
    showToast('LEAN PDF eksporteret', 'success');
    updateLastExport();
}

function generateBudgetPDF(jsPDF) {
    const doc = new jsPDF('portrait', 'mm', 'a4');
    let y = pdfHeader(doc, 'Budget Rapport');

    try {
        const budgetKeys = Object.keys(localStorage).filter(k => k.startsWith('budget_'));
        if (budgetKeys.length === 0) {
            doc.text('Ingen budgetdata fundet.', 14, y);
        } else {
            const rows = [];
            budgetKeys.forEach(k => {
                try {
                    const d = JSON.parse(localStorage.getItem(k));
                    rows.push([k.replace('budget_', ''), d.category || '', d.amount || 0, d.type || '', d.description || '']);
                } catch (e) {
                    rows.push([k, '', '', '', 'Parse error']);
                }
            });

            doc.autoTable({
                startY: y,
                head: [['Nøgle', 'Kategori', 'Beløb', 'Type', 'Beskrivelse']],
                body: rows,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [234, 179, 8] }
            });
        }
    } catch (e) {
        doc.text('Fejl ved indlæsning af budgetdata.', 14, y);
    }

    doc.save('budget_rapport.pdf');
    showToast('Budget PDF eksporteret', 'success');
    updateLastExport();
}

function generateFullPDF(jsPDF) {
    const doc = new jsPDF('portrait', 'mm', 'a4');

    // Title page
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(36);
    doc.text('Smart Logistics', 105, 100, { align: 'center' });
    doc.text('Calculator', 105, 118, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Komplet Rapport', 105, 145, { align: 'center' });
    doc.setFontSize(12);
    doc.text(new Date().toLocaleDateString('da-DK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), 105, 165, { align: 'center' });

    // Dashboard page
    doc.addPage();
    doc.setTextColor(0, 0, 0);
    let y = pdfHeader(doc, 'Dashboard Overblik');

    const summaryData = [
        ['ABC Analyse', `${typeof abcResults !== 'undefined' ? abcResults.length : 0} poster`],
        ['LEAN Moduler', `${countLeanData()} aktive`],
        ['Budget Poster', `${countBudgetData()} poster`],
        ['Logistikkæde', `${typeof SupplyChainManager !== 'undefined' ? SupplyChainManager.getNodes().length : 0} trin`],
        ['SMART Mål', `${typeof SmartGoalsManager !== 'undefined' ? SmartGoalsManager.getGoals().length : 0} mål`]
    ];

    doc.autoTable({
        startY: y,
        head: [['Modul', 'Status']],
        body: summaryData,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [16, 185, 129] }
    });

    // ABC page
    if (typeof abcResults !== 'undefined' && abcResults.length > 0) {
        doc.addPage();
        y = pdfHeader(doc, 'ABC Analyse');
        const top20 = abcResults.slice(0, 20).map((r, i) => [
            i + 1, r.name || r.item || '', r.value ? r.value.toFixed(0) : '', r.group || ''
        ]);
        doc.autoTable({
            startY: y,
            head: [['#', 'Varenavn', 'Værdi', 'Gruppe']],
            body: top20,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [59, 130, 246] }
        });
    }

    // LEAN page
    doc.addPage();
    y = pdfHeader(doc, 'LEAN Værktøjer');
    const oeeData = localStorage.getItem('lean_oee_data');
    if (oeeData) {
        const oee = JSON.parse(oeeData);
        doc.autoTable({
            startY: y,
            head: [['OEE Parameter', 'Værdi']],
            body: [
                ['Tilgængelighed', (oee.availability || 0) + '%'],
                ['Ydelse', (oee.performance || 0) + '%'],
                ['Kvalitet', (oee.quality || 0) + '%'],
                ['OEE', (oee.oee || 0) + '%']
            ],
            styles: { fontSize: 9 },
            headStyles: { fillColor: [16, 185, 129] }
        });
    } else {
        doc.setFontSize(10);
        doc.text('Ingen OEE-data registreret.', 14, y);
    }

    doc.save('smart_logistics_komplet_rapport.pdf');
    showToast('Komplet PDF eksporteret', 'success');
    updateLastExport();
}

// ============================================================
//  REPLACE EXISTING PDF STUBS
// ============================================================
// Override the existing placeholder PDF export functions
if (typeof window !== 'undefined') {
    window.exportDashboardToPDF = function() { generatePDFReport('dashboard'); };
    window.exportABCToPDF = function() { generatePDFReport('abc'); };
    window.exportWilsonToPDF = function() { generatePDFReport('wilson'); };
    window.exportBatchToPDF = function() { generatePDFReport('wilson'); };
    window.exportSectionToPDF = function(sectionId) {
        const sectionMap = {
            'dashboard-section': 'dashboard',
            'abc-section': 'abc',
            'wilson-section': 'wilson',
            'lean-section': 'lean',
            'budget-section': 'budget'
        };
        generatePDFReport(sectionMap[sectionId] || 'dashboard');
    };
}
