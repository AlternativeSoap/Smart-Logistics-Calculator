// ===================================================================
// Budget Editor - Excel-like Home Budget
// Simple, clean monthly tracking interface with full undo/redo
// ===================================================================

class BudgetEditor {
    constructor() {
        this.storage = new BudgetStorage();
        this.exporter = new BudgetExporter(this.storage);
        this.currentData = this.storage.getData();
        this.monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        this.monthNamesFull = currentLanguage === 'da'
            ? ['Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'December']
            : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.editingCell = null;
        this.debounceTimers = {};
        this.viewMode = 'full'; // full, month, compare, quarter, vertical
        this.selectedMonths = [];
        this.sidebarVisible = false;
        this.recurringExpenses = new Set();
        this.searchTerm = '';
        
        // Auto-calculation settings for 14.Dag column
        this.autoCalc14Dag = true; // always enabled
        this.autoCalcType = localStorage.getItem('budget-auto-calc-type') || 'divide'; // 'copy', 'divide', 'none'
        this.show14DagColumns = localStorage.getItem('budget-show-14dag') !== 'false'; // shown by default
        
        // Number formatting settings
        this.currency = localStorage.getItem('budget-currency') || 'kr.';
        this.numberFormat = localStorage.getItem('budget-number-format') || 'danish'; // danish, us, space, indian
        
        // Expense sharing settings
        this.expenseSplitEnabled = localStorage.getItem('budget-expense-split') === 'true';
        this.expenseSplitRatio = parseFloat(localStorage.getItem('budget-expense-split-ratio')) || 0.5; // 0.5 = 50%
        this.safetyBufferEnabled = localStorage.getItem('budget-safety-buffer') === 'true';
        this.safetyBufferPercent = parseFloat(localStorage.getItem('budget-safety-buffer-percent')) || 5; // 5%
        
        this.init();
    }

    // ===================================================================
    // Translation Helper
    // ===================================================================
    t(key, fallback) {
        // Safe translation function that never shows machine-like keys
        if (typeof window.translate === 'function') {
            const result = window.translate(key);
            // If translate returns the key itself (untranslated), use fallback
            if (result === key) return fallback;
            return result;
        }
        return fallback;
    }

    // ===================================================================
    // Initialization
    // ===================================================================
    init() {
        this.setupEventListeners();
        this.setupCellEditing(); // Initialize cell editing and action button handlers
        
        // Set current month as default
        const currentDate = new Date();
        const currentMonthIndex = currentDate.getMonth(); // 0-11
        const currentMonth = this.monthNames[currentMonthIndex];
        this.viewMode = 'month';
        this.selectedMonths = [currentMonth];
        
        // Sync checkbox state with stored setting
        const show14DagCheckbox = document.getElementById('budget-show-14dag');
        if (show14DagCheckbox) {
            show14DagCheckbox.checked = this.show14DagColumns;
        }
        
        this.render(true);
        this.updateUndoRedoButtons();
        
        // Apply current month view and 14-day column visibility after render
        setTimeout(() => {
            this.setViewMode('month');
            this.selectMonth(currentMonth);
            this.toggle14DagColumns(this.show14DagColumns);
        }, 100);
        
        console.log('Budget Editor initialized (Excel-like mode) - Current month:', currentMonth);
        
        // Initialize focus mode state
        this.focusModeActive = false;
        
        // Initialize month indicator tracking
        this.initMonthIndicator();
    }

    // ===================================================================
    // Focus Mode Toggle
    // ===================================================================
    initMonthIndicator() {
        // Track scroll position to update month indicator
        const tableContainer = document.querySelector('#budget-table-container');
        if (tableContainer) {
            tableContainer.addEventListener('scroll', () => {
                this.updateMonthIndicator();
            });
        }
        
        // Initial update
        this.updateMonthIndicator();
    }
    
    updateMonthIndicator() {
        const monthIndicator = document.getElementById('currentMonthName');
        if (!monthIndicator) return;
        
        const tableContainer = document.querySelector('#budget-table-container');
        if (!tableContainer) return;
        
        // Get scroll position
        const scrollLeft = tableContainer.scrollLeft;
        
        // Calculate which month is in view based on scroll position
        // Each month column is approximately 150px wide (month + 14.Dag)
        const columnWidth = 150;
        const monthIndex = Math.floor(scrollLeft / columnWidth);
        
        // Update indicator (clamp to 0-11)
        const displayMonth = Math.min(11, Math.max(0, monthIndex));
        monthIndicator.textContent = this.monthNamesFull[displayMonth];
    }

    // ===================================================================
    // Event Listeners
    // ===================================================================
    setupEventListeners() {
        // Year selector
        const yearSelect = document.getElementById('budget-year-select');
        if (yearSelect) {
            yearSelect.addEventListener('change', (e) => {
                this.currentData.year = parseInt(e.target.value);
                this.storage.saveData(this.currentData);
                this.render(true);
            });
        }

        // Budget template selector
        const templateSelect = document.getElementById('budget-template-select');
        if (templateSelect) {
            templateSelect.addEventListener('change', (e) => {
                const templateId = e.target.value;
                if (templateId) {
                    this.loadBudgetTemplate(templateId);
                    // Reset selection after loading
                    e.target.value = '';
                }
            });
        }

        // Action buttons
        document.getElementById('budget-add-income-btn')?.addEventListener('click', () => this.addIncomeRow());
        document.getElementById('budget-add-expense-btn')?.addEventListener('click', () => this.addExpenseRow());
        document.getElementById('budget-add-income-category-btn')?.addEventListener('click', () => this.addCategoryRow('income'));
        document.getElementById('budget-add-expense-category-btn')?.addEventListener('click', () => this.addCategoryRow('expense'));
        document.getElementById('budget-undo-btn')?.addEventListener('click', () => this.undo());
        document.getElementById('budget-redo-btn')?.addEventListener('click', () => this.redo());
        document.getElementById('budget-clear-btn')?.addEventListener('click', () => this.clearAll());
        
        // Export buttons
        document.getElementById('budget-export-excel-btn')?.addEventListener('click', () => this.exportExcel());
        document.getElementById('budget-export-csv-btn')?.addEventListener('click', () => this.exportCSV());
        document.getElementById('budget-export-json-btn')?.addEventListener('click', () => this.exportJSON());
        document.getElementById('budget-export-btn')?.addEventListener('click', () => this.showExportMenu());
        
        // Import button
        document.getElementById('budget-import-btn')?.addEventListener('click', () => this.showImportDialog());
        
        // Help button and modal
        document.getElementById('budget-help-btn')?.addEventListener('click', () => this.showHelpModal());
        document.getElementById('budget-help-close')?.addEventListener('click', () => this.hideHelpModal());
        document.getElementById('budget-help-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'budget-help-modal') {
                this.hideHelpModal();
            }
        });

        // Month filter modal
        document.getElementById('budget-month-filter')?.addEventListener('click', () => this.showMonthModal());
        document.getElementById('budget-month-close')?.addEventListener('click', () => this.hideMonthModal());
        document.getElementById('budget-month-select')?.addEventListener('change', (e) => this.updateMonthSummary(e.target.value));
        document.getElementById('budget-apply-filter')?.addEventListener('click', () => this.applyMonthFilter());
        document.getElementById('budget-show-preview')?.addEventListener('click', () => this.showPreviewModal());
        document.getElementById('budget-month-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'budget-month-modal') {
                this.hideMonthModal();
            }
        });

        // Preview modal
        document.getElementById('budget-preview-close')?.addEventListener('click', () => this.hidePreviewModal());
        document.getElementById('budget-preview-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'budget-preview-modal') {
                this.hidePreviewModal();
            }
        });

        // View toggle button
        document.getElementById('budget-view-toggle')?.addEventListener('click', () => this.toggleSplitView());

        // Year input - change to number input
        const yearInput = document.getElementById('budget-year-select');
        if (yearInput) {
            yearInput.addEventListener('change', (e) => {
                const year = parseInt(e.target.value);
                if (year >= 2000 && year <= 2100) {
                    this.currentData.year = year;
                    this.storage.saveData(this.currentData);
                }
            });
        }

        // Search functionality
        const searchInput = document.getElementById('budget-search');
        const searchClear = document.getElementById('budget-search-clear');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.applySearch();
                searchClear.style.display = this.searchTerm ? 'block' : 'none';
            });
        }
        if (searchClear) {
            searchClear.addEventListener('click', () => {
                searchInput.value = '';
                this.searchTerm = '';
                this.applySearch();
                searchClear.style.display = 'none';
            });
        }

        // Currency and format selectors
        const currencySelect = document.getElementById('budget-currency-select');
        const formatSelect = document.getElementById('budget-number-format-select');
        
        if (currencySelect) {
            currencySelect.value = this.currency;
            currencySelect.addEventListener('change', (e) => {
                this.setCurrency(e.target.value);
            });
        }
        
        if (formatSelect) {
            formatSelect.value = this.numberFormat;
            formatSelect.addEventListener('change', (e) => {
                this.setNumberFormat(e.target.value);
            });
        }

        // View mode toggles (simplified to just month vs full year)
        document.getElementById('view-mode-month')?.addEventListener('click', () => this.setViewMode('month'));
        document.getElementById('view-mode-full')?.addEventListener('click', () => this.setViewMode('full'));

        // 14.Dag column settings
        const show14DagCheckbox = document.getElementById('budget-show-14dag');
        const autoCalcCheckbox = document.getElementById('budget-auto-calc-14dag');
        const autoCalcTypeSelect = document.getElementById('budget-auto-calc-type');
        
        if (show14DagCheckbox) {
            show14DagCheckbox.addEventListener('change', (e) => {
                this.show14DagColumns = e.target.checked;
                localStorage.setItem('budget-show-14dag', e.target.checked);
                this.toggle14DagColumns(e.target.checked);
            });
        }
        
        // Auto-calc type selector removed - always use divide by 2

        // Sidebar toggle
        document.getElementById('budget-sidebar-toggle')?.addEventListener('click', () => this.toggleSidebar());
        document.getElementById('budget-sidebar-close')?.addEventListener('click', () => this.toggleSidebar());

        // Month tab navigation
        document.querySelectorAll('.budget-month-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const month = e.target.dataset.month;
                this.selectMonth(month);
            });
        });

        // Removed unused smart features (Copy Forward, Quick Fill, Recurring Detection)
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (this.isInBudgetTab()) {
                // Ctrl shortcuts
                if (e.ctrlKey && !e.shiftKey && !e.altKey) {
                    if (e.key === 'z') {
                        e.preventDefault();
                        this.undo();
                    } else if (e.key === 'y') {
                        e.preventDefault();
                        this.redo();
                    } else if (e.key === 'n') {
                        e.preventDefault();
                        this.addIncomeRow();
                    } else if (e.key === 'e') {
                        e.preventDefault();
                        this.addExpenseRow();
                    } else if (e.key === 's') {
                        e.preventDefault();
                        this.storage.saveData(this.currentData);
                        this.showMessage(currentLanguage === 'da' ? '✓ Budget gemt' : '✓ Budget saved', 'success');
                    }
                }
                // Ctrl+Shift shortcuts
                else if (e.ctrlKey && e.shiftKey && !e.altKey) {
                    if (e.key === 'E' || e.key === 'e') {
                        e.preventDefault();
                        this.exportExcel();
                    } else if (e.key === 'I' || e.key === 'i') {
                        e.preventDefault();
                        this.showImportDialog();
                    } else if (e.key === 'C' || e.key === 'c') {
                        e.preventDefault();
                        this.addCategoryRow('income');
                    } else if (e.key === 'X' || e.key === 'x') {
                        e.preventDefault();
                        this.addCategoryRow('expense');
                    }
                }
                // Alt shortcuts  
                else if (e.altKey && !e.ctrlKey && !e.shiftKey) {
                    if (e.key === 'm' || e.key === 'M') {
                        e.preventDefault();
                        this.setViewMode('month');
                    } else if (e.key === 'f' || e.key === 'F') {
                        e.preventDefault();
                        this.setViewMode('full');
                    } else if (e.key === 's' || e.key === 'S') {
                        e.preventDefault();
                        const searchInput = document.getElementById('budget-search');
                        if (searchInput) searchInput.focus();
                    }
                }
                // Function keys
                else if (!e.ctrlKey && !e.shiftKey && !e.altKey) {
                    if (e.key === 'F1') {
                        e.preventDefault();
                        this.showHelpModal();
                    } else if (e.key === 'Escape') {
                        this.hideHelpModal();
                        this.hideMonthModal();
                        this.hidePreviewModal();
                    }
                    // Arrow key cell navigation (Step I)
                    else if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
                        const active = document.activeElement;
                        if (active && active.classList.contains('budget-cell-input') && active.dataset.row !== undefined) {
                            const type  = active.dataset.type;
                            const field = active.dataset.field;
                            const row   = parseInt(active.dataset.row, 10);
                            const delta = e.key === 'ArrowDown' ? 1 : -1;
                            const target = document.querySelector(
                                `.budget-cell-input[data-type="${type}"][data-row="${row + delta}"][data-field="${field}"]`
                            );
                            if (target) {
                                e.preventDefault();
                                target.focus();
                                target.select();
                            }
                        }
                    }
                }
            }
        });
    }

    showHelpModal() {
        const modal = document.getElementById('budget-help-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    hideHelpModal() {
        const modal = document.getElementById('budget-help-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    showMonthModal() {
        const modal = document.getElementById('budget-month-modal');
        if (modal) {
            modal.classList.remove('hidden');
            const select = document.getElementById('budget-month-select');
            if (select) {
                this.updateMonthSummary(select.value);
            }
        }
    }

    hideMonthModal() {
        const modal = document.getElementById('budget-month-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    updateMonthSummary(monthKey) {
        const data = this.currentData;
        let totalIncome = 0;
        let totalExpenses = 0;

        if (monthKey === 'all') {
            // Calculate totals across all months
            this.monthNames.forEach(month => {
                data.income.forEach(row => {
                    totalIncome += (row[month]?.mdr || 0) + (row[month]?.dag14 || 0);
                });
                data.expenses.forEach(row => {
                    totalExpenses += (row[month]?.mdr || 0) + (row[month]?.dag14 || 0);
                });
            });
        } else {
            // Calculate for specific month
            data.income.forEach(row => {
                totalIncome += (row[monthKey]?.mdr || 0) + (row[monthKey]?.dag14 || 0);
            });
            data.expenses.forEach(row => {
                totalExpenses += (row[monthKey]?.mdr || 0) + (row[monthKey]?.dag14 || 0);
            });
        }

        const net = totalIncome - totalExpenses;

        document.getElementById('month-total-income').textContent = `${totalIncome.toFixed(2)} kr.`;
        document.getElementById('month-total-expenses').textContent = `${totalExpenses.toFixed(2)} kr.`;
        const netEl = document.getElementById('month-net');
        netEl.textContent = `${net.toFixed(2)} kr.`;
        netEl.className = net >= 0 ? 'font-bold text-xl text-green-600' : 'font-bold text-xl text-red-600';
    }

    applyMonthFilter() {
        const select = document.getElementById('budget-month-select');
        const monthKey = select?.value || 'all';
        
        if (monthKey === 'all') {
            // Show all columns
            this.showAllMonths();
        } else {
            // Hide all columns except selected month
            this.filterToMonth(monthKey);
        }
        
        this.hideMonthModal();
    }

    showAllMonths() {
        const table = document.querySelector('.budget-table');
        if (!table) return;

        // Show all month columns, but respect 14.Dag visibility setting
        const ths = table.querySelectorAll('th');
        const tds = table.querySelectorAll('td');
        
        ths.forEach(th => {
            // If it's a 14.Dag header, respect the show14DagColumns setting
            if (th.classList.contains('budget-14dag-header')) {
                th.style.display = this.show14DagColumns ? '' : 'none';
            } else {
                th.style.display = '';
            }
        });
        
        tds.forEach(td => {
            // If it's a 14.Dag cell, respect the show14DagColumns setting
            if (td.classList.contains('budget-14dag-col')) {
                td.style.display = this.show14DagColumns ? '' : 'none';
            } else {
                td.style.display = '';
            }
        });
    }

    filterToMonth(monthKey) {
        const monthIndex = this.monthNames.indexOf(monthKey);
        if (monthIndex === -1) return;

        const table = document.querySelector('.budget-table');
        if (!table) return;

        // Hide all month columns except the selected one
        // Column structure: Name (0), Faktiske (1), then 12 months × 2 columns each (2-25), Actions (26)
        const selectedColStart = 2 + (monthIndex * 2);
        const selectedColEnd = selectedColStart + 1;

        // Header rows
        const headerRow1 = table.querySelector('thead tr:first-child');
        const headerRow2 = table.querySelector('thead tr:nth-child(2)');
        
        if (headerRow1) {
            const ths = Array.from(headerRow1.children);
            ths.forEach((th, idx) => {
                if (idx > 1 && idx < ths.length - 1) {
                    // Month headers (have colspan="2")
                    const monthIdx = idx - 2;
                    th.style.display = monthIdx === monthIndex ? '' : 'none';
                }
            });
        }

        if (headerRow2) {
            const ths = Array.from(headerRow2.children);
            ths.forEach((th, idx) => {
                if (idx >= 0 && idx < 24) {
                    const monthIdx = Math.floor(idx / 2);
                    th.style.display = monthIdx === monthIndex ? '' : 'none';
                }
            });
        }

        // Data rows
        const rows = table.querySelectorAll('tbody tr:not(.section-header)');
        rows.forEach(row => {
            const tds = Array.from(row.children);
            tds.forEach((td, idx) => {
                if (idx >= 2 && idx < 26) {
                    const colMonthIdx = Math.floor((idx - 2) / 2);
                    td.style.display = colMonthIdx === monthIndex ? '' : 'none';
                }
            });
        });
    }

    showPreviewModal() {
        const modal = document.getElementById('budget-preview-modal');
        const content = document.getElementById('budget-preview-content');
        if (!modal || !content) return;

        // Generate comprehensive overview
        content.innerHTML = this.generatePreviewHTML();
        modal.classList.remove('hidden');
        this.hideMonthModal();
    }

    hidePreviewModal() {
        const modal = document.getElementById('budget-preview-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    generatePreviewHTML() {
        const data = this.currentData;
        const monthNamesFull = currentLanguage === 'da'
            ? ['Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'December']
            : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        
        let html = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">';

        this.monthNames.forEach((month, idx) => {
            let monthIncome = 0;
            let monthExpenses = 0;

            data.income.forEach(row => {
                monthIncome += (row[month]?.mdr || 0) + (row[month]?.dag14 || 0);
            });
            data.expenses.forEach(row => {
                monthExpenses += (row[month]?.mdr || 0) + (row[month]?.dag14 || 0);
            });

            const net = monthIncome - monthExpenses;
            const netClass = net >= 0 ? 'text-green-600' : 'text-red-600';

            html += `
                <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border-2 ${net >= 0 ? 'border-green-200' : 'border-red-200'}">
                    <h4 class="font-bold text-lg mb-3 text-gray-900 dark:text-white">${monthNamesFull[idx]}</h4>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-600 dark:text-gray-400">${this.t('budget-month-income', 'Income:')}</span>
                            <span class="text-green-600 font-semibold">${monthIncome.toFixed(2)} kr.</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600 dark:text-gray-400">${this.t('budget-month-expenses', 'Expenses:')}</span>
                            <span class="text-red-600 font-semibold">${monthExpenses.toFixed(2)} kr.</span>
                        </div>
                        <div class="border-t border-gray-300 dark:border-gray-700 pt-2 flex justify-between">
                            <span class="font-bold text-gray-900 dark:text-white">${this.t('budget-month-net', 'Net:')}</span>
                            <span class="font-bold ${netClass}">${net.toFixed(2)} kr.</span>
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';

        // Add yearly summary
        let yearlyIncome = 0;
        let yearlyExpenses = 0;
        this.monthNames.forEach(month => {
            data.income.forEach(row => {
                yearlyIncome += (row[month]?.mdr || 0) + (row[month]?.dag14 || 0);
            });
            data.expenses.forEach(row => {
                yearlyExpenses += (row[month]?.mdr || 0) + (row[month]?.dag14 || 0);
            });
        });

        const yearlyNet = yearlyIncome - yearlyExpenses;
        const yearlyNetClass = yearlyNet >= 0 ? 'text-green-600' : 'text-red-600';

        html += `
            <div class="mt-6 bg-purple-50 dark:bg-purple-900 rounded-lg p-6 border-2 border-purple-300">
                <h4 class="font-bold text-xl mb-4 text-gray-900 dark:text-white">📊 ${this.t('budget-year-overview-title', 'Annual Overview')} ${data.year || 2025}</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                        <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">${this.t('budget-total-income-yr', 'Total income')}</div>
                        <div class="text-2xl font-bold text-green-600">${yearlyIncome.toFixed(2)} kr.</div>
                    </div>
                    <div>
                        <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">${this.t('budget-total-expenses-yr', 'Total expenses')}</div>
                        <div class="text-2xl font-bold text-red-600">${yearlyExpenses.toFixed(2)} kr.</div>
                    </div>
                    <div>
                        <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">${this.t('budget-yearly-net', 'Yearly net')}</div>
                        <div class="text-3xl font-bold ${yearlyNetClass}">${yearlyNet.toFixed(2)} kr.</div>
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    toggleSplitView() {
        // Toggle between full table and split view
        const tableContainer = document.querySelector('.budget-table').closest('.bg-white');
        
        if (tableContainer.style.display === 'none') {
            // Show table, hide split view
            tableContainer.style.display = '';
            const splitView = document.getElementById('budget-split-view');
            if (splitView) splitView.remove();
        } else {
            // Show split view
            this.createSplitView();
        }
    }

    createSplitView() {
        // This creates a side-by-side view with preview on left, editor on right
        const content = document.getElementById('budget-content');
        const tableContainer = document.querySelector('.budget-table').closest('.bg-white');
        
        tableContainer.style.display = 'none';

        const splitView = document.createElement('div');
        splitView.id = 'budget-split-view';
        splitView.className = 'grid grid-cols-1 lg:grid-cols-2 gap-4';
        
        // Left: Preview
        splitView.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">${currentLanguage === 'da' ? '📊 Oversigt' : '📊 Overview'}</h3>
                ${this.generatePreviewHTML()}
            </div>
            
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">${currentLanguage === 'da' ? '✏️ Rediger' : '✏️ Edit'}</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-4">${currentLanguage === 'da' ? 'Klik på "Skift visning" igen for at vende tilbage til fuld tabelvisning.' : 'Click "Toggle view" again to return to full table view.'}</p>
                <button onclick="budgetEditor.toggleSplitView()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">${currentLanguage === 'da' ? '← Tilbage til tabel' : '← Back to table'}</button>
            </div>
        `;

        content.appendChild(splitView);
    }

    isInBudgetTab() {
        const budgetTab = document.getElementById('budget-content');
        return budgetTab && budgetTab.classList.contains('active');
    }

    // ===================================================================
    // Focus Mode
    // ===================================================================
    toggleBudgetFocusMode() {
        this.focusModeActive = !this.focusModeActive;
        const btn = document.getElementById('budgetFocusMode');

        if (this.focusModeActive) {
            // Activate via body class (CSS handles all hide/show)
            document.body.classList.add('budget-focus-active');

            // Populate the focus strip with current totals
            this._updateFocusStrip();

            // Update button
            if (btn) {
                btn.innerHTML = currentLanguage === 'da' ? '✖️ Afslut fokus' : '✖️ Exit Focus';
                btn.classList.remove('bg-purple-600', 'hover:bg-purple-700');
                btn.classList.add('bg-red-600', 'hover:bg-red-700');
            }
        } else {
            // Deactivate
            document.body.classList.remove('budget-focus-active');

            // Restore button
            if (btn) {
                btn.innerHTML = currentLanguage === 'da' ? '🎯 Fokus' : '🎯 Focus';
                btn.classList.remove('bg-red-600', 'hover:bg-red-700');
                btn.classList.add('bg-purple-600', 'hover:bg-purple-700');
            }
        }
    }

    _updateFocusStrip() {
        // Copy current totals from existing elements
        const monthName = document.getElementById('currentMonthName');
        const income = document.getElementById('budget-total-income');
        const expenses = document.getElementById('budget-total-expenses');
        const net = document.getElementById('budget-net-income');

        const stripMonth = document.getElementById('focus-strip-month');
        const stripIncome = document.getElementById('focus-strip-income');
        const stripExpense = document.getElementById('focus-strip-expense');
        const stripNet = document.getElementById('focus-strip-net');

        if (stripMonth && monthName) stripMonth.textContent = monthName.textContent;
        if (stripIncome && income) stripIncome.textContent = income.textContent;
        if (stripExpense && expenses) stripExpense.textContent = expenses.textContent;
        if (stripNet && net) stripNet.textContent = net.textContent;
    }

    // ===================================================================
    // Budget Templates
    // ===================================================================
    loadBudgetTemplate(templateId) {
        if (!confirm(currentLanguage === 'da' ? `Vil du indlæse skabelonen "${this.getTemplateName(templateId)}"?\n\nDette vil tilføje kategorier og eksempler til dit budget.` : `Load template "${this.getTemplateName(templateId)}"?\n\nThis will add categories and examples to your budget.`)) {
            return;
        }

        const template = this.getBudgetTemplate(templateId);
        if (!template) {
            this.showMessage(currentLanguage === 'da' ? '❌ Skabelon ikke fundet' : '❌ Template not found', 'error');
            return;
        }

        // Add template income rows
        template.income.forEach(item => {
            this.currentData.income.push({
                name: item.name,
                account: 'budget',
                faktiske: 0,
                isCategory: item.isCategory || false,
                ...this.createEmptyMonthData()
            });
        });

        // Add template expense rows
        template.expenses.forEach(item => {
            this.currentData.expenses.push({
                name: item.name,
                account: 'budget',
                faktiske: 0,
                isCategory: item.isCategory || false,
                ...this.createEmptyMonthData()
            });
        });

        this.storage.saveData(this.currentData);
        this.render(true);
        this.showMessage(currentLanguage === 'da' ? `✓ Skabelon "${this.getTemplateName(templateId)}" indlæst` : `✓ Template "${this.getTemplateName(templateId)}" loaded`, 'success');
    }

    getTemplateName(templateId) {
        const names = {
            'household-basic': currentLanguage === 'da' ? 'Husholdning Basis' : 'Household Basic',
            'household-full': currentLanguage === 'da' ? 'Husholdning Komplet' : 'Household Complete',
            'student': currentLanguage === 'da' ? 'Studerende' : 'Student',
            'single': currentLanguage === 'da' ? 'Enlig' : 'Single',
            'family': currentLanguage === 'da' ? 'Familie' : 'Family'
        };
        return names[templateId] || templateId;
    }

    getBudgetTemplate(templateId) {
        const templates = {
            'household-basic': {
                income: [
                    { name: currentLanguage === 'da' ? '💼 Løn' : '💼 Salary', isCategory: false },
                    { name: currentLanguage === 'da' ? '🎁 Anden indtægt' : '🎁 Other income', isCategory: false }
                ],
                expenses: [
                    { name: currentLanguage === 'da' ? '🏠 Bolig' : '🏠 Housing', isCategory: true },
                    { name: currentLanguage === 'da' ? 'Husleje/Boliglån' : 'Rent/Mortgage', isCategory: false },
                    { name: currentLanguage === 'da' ? 'El og vand' : 'Electricity and water', isCategory: false },
                    { name: 'Internet/TV', isCategory: false },
                    { name: currentLanguage === 'da' ? '🚗 Transport' : '🚗 Transport', isCategory: true },
                    { name: currentLanguage === 'da' ? 'Bil (forsikring, benzin)' : 'Car (insurance, gas)', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Offentlig transport' : 'Public transport', isCategory: false },
                    { name: currentLanguage === 'da' ? '🍕 Mad' : '🍕 Food', isCategory: true },
                    { name: currentLanguage === 'da' ? 'Dagligvarer' : 'Groceries', isCategory: false },
                    { name: 'Restaurant/Takeaway', isCategory: false },
                    { name: currentLanguage === 'da' ? '📱 Telefon & Abonnementer' : '📱 Phone & Subscriptions', isCategory: true },
                    { name: currentLanguage === 'da' ? 'Mobil' : 'Mobile', isCategory: false },
                    { name: 'Streaming (Netflix etc.)', isCategory: false }
                ]
            },
            'household-full': {
                income: [
                    { name: currentLanguage === 'da' ? '💼 Indtægter' : '💼 Income', isCategory: true },
                    { name: currentLanguage === 'da' ? 'Løn (efter skat)' : 'Salary (after tax)', isCategory: false },
                    { name: 'Pension', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Freelance/Biindtægt' : 'Freelance/Side income', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Investeringer' : 'Investments', isCategory: false }
                ],
                expenses: [
                    { name: currentLanguage === 'da' ? '🏠 Bolig' : '🏠 Housing', isCategory: true },
                    { name: currentLanguage === 'da' ? 'Husleje/Realkreditlån' : 'Rent/Mortgage', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Ejendomsskat' : 'Property tax', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Boligforsikring' : 'Home insurance', isCategory: false },
                    { name: currentLanguage === 'da' ? 'El, vand, varme' : 'Electricity, water, heating', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Internet/TV/Telefon' : 'Internet/TV/Phone', isCategory: false },
                    { name: currentLanguage === 'da' ? '🚗 Transport' : '🚗 Transport', isCategory: true },
                    { name: currentLanguage === 'da' ? 'Bilforsikring' : 'Car insurance', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Brændstof' : 'Fuel', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Vedligeholdelse/Reparation' : 'Maintenance/Repair', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Parkering/Vej' : 'Parking/Road', isCategory: false },
                    { name: currentLanguage === 'da' ? '🍕 Mad & Dagligvarer' : '🍕 Food & Groceries', isCategory: true },
                    { name: currentLanguage === 'da' ? 'Dagligvarer' : 'Groceries', isCategory: false },
                    { name: 'Restaurant/Cafe', isCategory: false },
                    { name: 'Takeaway', isCategory: false },
                    { name: currentLanguage === 'da' ? '💊 Sundhed' : '💊 Health', isCategory: true },
                    { name: currentLanguage === 'da' ? 'Læge/Tandlæge' : 'Doctor/Dentist', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Medicin' : 'Medicine', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Fitness/Træning' : 'Fitness/Training', isCategory: false },
                    { name: currentLanguage === 'da' ? '🎮 Fritid & Underholdning' : '🎮 Leisure & Entertainment', isCategory: true },
                    { name: currentLanguage === 'da' ? 'Streaming tjenester' : 'Streaming services', isCategory: false },
                    { name: 'Hobby', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Sport/Aktiviteter' : 'Sports/Activities', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Ferie' : 'Vacation', isCategory: false },
                    { name: currentLanguage === 'da' ? '👕 Tøj & Personlig pleje' : '👕 Clothing & Personal care', isCategory: true },
                    { name: currentLanguage === 'da' ? 'Tøj/Sko' : 'Clothing/Shoes', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Frisør' : 'Hairdresser', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Kosmetik' : 'Cosmetics', isCategory: false },
                    { name: currentLanguage === 'da' ? '💰 Opsparing & Gæld' : '💰 Savings & Debt', isCategory: true },
                    { name: 'Pension', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Opsparing' : 'Savings', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Lån/Kreditkort' : 'Loan/Credit card', isCategory: false }
                ]
            },
            'student': {
                income: [
                    { name: currentLanguage === 'da' ? '🎓 SU' : '🎓 Student grant', isCategory: false },
                    { name: currentLanguage === 'da' ? '💼 Studiejob' : '💼 Student job', isCategory: false },
                    { name: currentLanguage === 'da' ? '👨‍👩‍👧 Støtte fra forældre' : '👨‍👩‍👧 Support from parents', isCategory: false }
                ],
                expenses: [
                    { name: currentLanguage === 'da' ? '🏠 Bolig' : '🏠 Housing', isCategory: true },
                    { name: currentLanguage === 'da' ? 'Husleje' : 'Rent', isCategory: false },
                    { name: currentLanguage === 'da' ? 'El og internet' : 'Electricity and internet', isCategory: false },
                    { name: currentLanguage === 'da' ? '🍕 Mad' : '🍕 Food', isCategory: true },
                    { name: currentLanguage === 'da' ? 'Dagligvarer' : 'Groceries', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Mensa/Kantinen' : 'Canteen', isCategory: false },
                    { name: currentLanguage === 'da' ? '🚲 Transport' : '🚲 Transport', isCategory: true },
                    { name: currentLanguage === 'da' ? 'Offentlig transport' : 'Public transport', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Cykel vedligehold' : 'Bicycle maintenance', isCategory: false },
                    { name: currentLanguage === 'da' ? '📚 Studie' : '📚 Studies', isCategory: true },
                    { name: currentLanguage === 'da' ? 'Bøger' : 'Books', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Print/Kopier' : 'Print/Copies', isCategory: false },
                    { name: currentLanguage === 'da' ? '📱 Telefon & Abonnementer' : '📱 Phone & Subscriptions', isCategory: true },
                    { name: currentLanguage === 'da' ? 'Mobil' : 'Mobile', isCategory: false },
                    { name: 'Streaming', isCategory: false },
                    { name: currentLanguage === 'da' ? '🎉 Fritid' : '🎉 Leisure', isCategory: true },
                    { name: currentLanguage === 'da' ? 'Sociale arrangementer' : 'Social events', isCategory: false },
                    { name: 'Sport/Fitness', isCategory: false }
                ]
            },
            'single': {
                income: [
                    { name: currentLanguage === 'da' ? '💼 Løn' : '💼 Salary', isCategory: false },
                    { name: currentLanguage === 'da' ? '📈 Anden indtægt' : '📈 Other income', isCategory: false }
                ],
                expenses: [
                    { name: currentLanguage === 'da' ? '🏠 Bolig' : '🏠 Housing', isCategory: true },
                    { name: currentLanguage === 'da' ? 'Husleje/Boliglån' : 'Rent/Mortgage', isCategory: false },
                    { name: currentLanguage === 'da' ? 'El, vand, varme' : 'Electricity, water, heating', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Forsikring' : 'Insurance', isCategory: false },
                    { name: currentLanguage === 'da' ? '🚗 Transport' : '🚗 Transport', isCategory: true },
                    { name: currentLanguage === 'da' ? 'Bil/Transport' : 'Car/Transport', isCategory: false },
                    { name: currentLanguage === 'da' ? '🍕 Mad' : '🍕 Food', isCategory: true },
                    { name: currentLanguage === 'da' ? 'Dagligvarer' : 'Groceries', isCategory: false },
                    { name: 'Restaurant', isCategory: false },
                    { name: currentLanguage === 'da' ? '📱 Telefon & Internet' : '📱 Phone & Internet', isCategory: true },
                    { name: currentLanguage === 'da' ? 'Mobil' : 'Mobile', isCategory: false },
                    { name: 'Internet/TV', isCategory: false },
                    { name: currentLanguage === 'da' ? '💪 Sundhed' : '💪 Health', isCategory: true },
                    { name: 'Fitness', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Medicin' : 'Medicine', isCategory: false },
                    { name: currentLanguage === 'da' ? '🎮 Fritid' : '🎮 Leisure', isCategory: true },
                    { name: currentLanguage === 'da' ? 'Underholdning' : 'Entertainment', isCategory: false },
                    { name: 'Hobby', isCategory: false },
                    { name: currentLanguage === 'da' ? '💰 Opsparing' : '💰 Savings', isCategory: true },
                    { name: currentLanguage === 'da' ? 'Månedlig opsparing' : 'Monthly savings', isCategory: false }
                ]
            },
            'family': {
                income: [
                    { name: currentLanguage === 'da' ? '👔 Indtægter' : '👔 Income', isCategory: true },
                    { name: currentLanguage === 'da' ? 'Løn partner 1' : 'Salary partner 1', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Løn partner 2' : 'Salary partner 2', isCategory: false },
                    { name: currentLanguage === 'da' ? '👶 Børnepenge' : '👶 Child benefits', isCategory: false }
                ],
                expenses: [
                    { name: currentLanguage === 'da' ? '🏠 Bolig' : '🏠 Housing', isCategory: true },
                    { name: currentLanguage === 'da' ? 'Husleje/Realkreditlån' : 'Rent/Mortgage', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Ejendomsskat' : 'Property tax', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Forsikringer' : 'Insurance', isCategory: false },
                    { name: currentLanguage === 'da' ? 'El, vand, varme' : 'Electricity, water, heating', isCategory: false },
                    { name: 'Internet/TV', isCategory: false },
                    { name: currentLanguage === 'da' ? '🚗 Transport' : '🚗 Transport', isCategory: true },
                    { name: currentLanguage === 'da' ? 'Bil 1' : 'Car 1', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Bil 2' : 'Car 2', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Offentlig transport' : 'Public transport', isCategory: false },
                    { name: currentLanguage === 'da' ? '🍕 Mad & Dagligvarer' : '🍕 Food & Groceries', isCategory: true },
                    { name: currentLanguage === 'da' ? 'Dagligvarer' : 'Groceries', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Restaurant/Familie udflugter' : 'Restaurant/Family outings', isCategory: false },
                    { name: currentLanguage === 'da' ? '👶 Børn' : '👶 Children', isCategory: true },
                    { name: currentLanguage === 'da' ? 'Vuggestue/Børnehave' : 'Daycare/Kindergarten', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Skole/SFO' : 'School/After-school care', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Fritidsaktiviteter' : 'Extracurricular activities', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Tøj til børn' : "Children's clothing", isCategory: false },
                    { name: currentLanguage === 'da' ? '💊 Sundhed' : '💊 Health', isCategory: true },
                    { name: currentLanguage === 'da' ? 'Læge/Tandlæge' : 'Doctor/Dentist', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Medicin' : 'Medicine', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Forsikringer' : 'Insurance', isCategory: false },
                    { name: currentLanguage === 'da' ? '🎮 Fritid & Ferie' : '🎮 Leisure & Vacation', isCategory: true },
                    { name: currentLanguage === 'da' ? 'Familie aktiviteter' : 'Family activities', isCategory: false },
                    { name: 'Streaming', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Ferie/Rejser' : 'Vacation/Travel', isCategory: false },
                    { name: currentLanguage === 'da' ? '📱 Telefon' : '📱 Phone', isCategory: true },
                    { name: currentLanguage === 'da' ? 'Mobil partner 1' : 'Mobile partner 1', isCategory: false },
                    { name: currentLanguage === 'da' ? 'Mobil partner 2' : 'Mobile partner 2', isCategory: false },
                    { name: currentLanguage === 'da' ? '💰 Opsparing' : '💰 Savings', isCategory: true },
                    { name: currentLanguage === 'da' ? 'Børneopsparing' : "Children's savings", isCategory: false },
                    { name: currentLanguage === 'da' ? 'Familie opsparing' : 'Family savings', isCategory: false },
                    { name: 'Pension', isCategory: false }
                ]
            }
        };

        return templates[templateId];
    }

    // ===================================================================
    // Rendering
    // ===================================================================
    render(applyMonthView = false) {
        this.currentData = this.storage.getData();
        this.renderIncomeTable();
        this.renderExpenseTable();
        this.renderSummary();
        this.updateYearSelect();
        
        // Apply month selection to hide/show columns in month view
        // Only apply when explicitly requested (not on every input change)
        if (applyMonthView && this.viewMode === 'month') {
            setTimeout(() => this.applyMonthSelection(), 50);
        }
        
        // Apply budget vs actual colors after render
        setTimeout(() => this.applyBudgetVsActualColors(), 100);
        
        // Update sidebar if visible
        if (this.sidebarVisible) {
            this.renderSidebar();
        }

        // Update focus mode strip if active
        if (this.focusModeActive) {
            setTimeout(() => this._updateFocusStrip(), 150);
        }
    }

    updateYearSelect() {
        const yearInput = document.getElementById('budget-year-select');
        if (yearInput) {
            yearInput.value = this.currentData.year || 2025;
        }
    }

    renderIncomeTable() {
        const tbody = document.getElementById('budget-income-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.currentData.income.forEach((row, index) => {
            const tr = this.createTableRow(row, 'income', index);
            tbody.appendChild(tr);
        });
        
        // Render total row for income
        this.renderTotalRow('income');
        
        // Apply month view if active
        this.applyMonthSelection();
    }

    renderExpenseTable() {
        const tbody = document.getElementById('budget-expense-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.currentData.expenses.forEach((row, index) => {
            const tr = this.createTableRow(row, 'expense', index);
            tbody.appendChild(tr);
        });
        
        // Render total row for expenses
        this.renderTotalRow('expense');
        
        // Apply month view if active
        this.applyMonthSelection();
    }

    renderTotalRow(type) {
        const totalRow = document.getElementById(`budget-${type}-total-row`);
        if (!totalRow) {
            console.warn(`Total row not found: budget-${type}-total-row`);
            return;
        }
        
        const data = type === 'income' ? this.currentData.income : this.currentData.expenses;
        
        // Calculate totals
        let totalFaktiske = 0;
        const monthTotals = {};
        
        this.monthNames.forEach(month => {
            monthTotals[month] = { mdr: 0, dag14: 0 };
        });
        
        data.forEach(row => {
            if (row.isCategory) return; // Skip category rows
            totalFaktiske += parseFloat(row.faktiske) || 0;
            this.monthNames.forEach(month => {
                if (row[month]) {
                    monthTotals[month].mdr += parseFloat(row[month].mdr) || 0;
                    monthTotals[month].dag14 += parseFloat(row[month].dag14) || 0;
                }
            });
        });
        
        // If row is empty, create it; otherwise update existing cells
        if (totalRow.children.length === 0) {
            // Create total row cells (first time only)
            const nameTd = document.createElement('td');
            nameTd.textContent = 'TOTAL';
            nameTd.style.cssText = 'text-align: left; font-weight: bold;';
            totalRow.appendChild(nameTd);
            
            const faktiskeTd = document.createElement('td');
            faktiskeTd.textContent = this.formatCurrency(totalFaktiske);
            totalRow.appendChild(faktiskeTd);
            
            // Add month totals - always create all columns, visibility controlled by applyMonthSelection
            this.monthNames.forEach(month => {
                const mdrTd = document.createElement('td');
                mdrTd.textContent = this.formatCurrency(monthTotals[month].mdr);
                totalRow.appendChild(mdrTd);
                
                // Always create 14.Dag cell but set initial visibility
                const dag14Td = document.createElement('td');
                dag14Td.className = 'budget-14dag-col';
                dag14Td.textContent = this.formatCurrency(monthTotals[month].dag14);
                dag14Td.style.display = this.show14DagColumns ? '' : 'none';
                totalRow.appendChild(dag14Td);
            });
            
            // Actions column (empty)
            const actionsTd = document.createElement('td');
            totalRow.appendChild(actionsTd);
            
            // Apply month selection if in month view to hide non-selected months
            if (this.viewMode === 'month') {
                setTimeout(() => this.applyMonthSelection(), 10);
            }
        } else {
            // Update existing cells (no blinking)
            totalRow.children[1].textContent = this.formatCurrency(totalFaktiske);
            
            // Update month totals (skip first 2 cells: name and faktiske)
            let cellIndex = 2;
            this.monthNames.forEach(month => {
                if (totalRow.children[cellIndex]) {
                    totalRow.children[cellIndex].textContent = this.formatCurrency(monthTotals[month].mdr);
                }
                cellIndex++;
                
                if (totalRow.children[cellIndex]) {
                    totalRow.children[cellIndex].textContent = this.formatCurrency(monthTotals[month].dag14);
                }
                cellIndex++;
            });
        }
    }

    createTableRow(rowData, type, rowIndex) {
        const tr = document.createElement('tr');
        
        // Check if this is a category/header row
        if (rowData.isCategory) {
            tr.className = 'budget-category-row';
            const td = document.createElement('td');
            td.colSpan = 100; // Span all columns
            td.style.cssText = 'background: linear-gradient(90deg, #3b82f6 0%, #1e40af 100%); color: white; font-weight: bold; padding: 12px; font-size: 16px; position: relative;';
            
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.value = rowData.name || '';
            nameInput.placeholder = this.t('budget-category-name', 'Category Name');
            nameInput.className = 'budget-cell-input';
            nameInput.dataset.type = type;
            nameInput.dataset.row = rowIndex;
            nameInput.dataset.field = 'name';
            nameInput.style.cssText = 'background: transparent; color: white; font-weight: bold; font-size: 16px; border: none; width: calc(100% - 200px);';
            nameInput.setAttribute('autocomplete', 'off');
            
            // Action buttons container
            const actionsContainer = document.createElement('div');
            actionsContainer.style.cssText = 'position: absolute; right: 10px; top: 50%; transform: translateY(-50%); display: flex; gap: 4px;';
            
            const moveUpBtn = document.createElement('button');
            moveUpBtn.className = 'budget-action-btn budget-move-btn';
            moveUpBtn.innerHTML = '↑';
            moveUpBtn.title = currentLanguage === 'da' ? 'Flyt op' : 'Move up';
            moveUpBtn.dataset.type = type;
            moveUpBtn.dataset.row = rowIndex;
            moveUpBtn.dataset.action = 'up';
            moveUpBtn.style.cssText = 'color: white; font-size: 18px; background: rgba(255,255,255,0.2); border-radius: 4px; padding: 2px 6px; cursor: pointer; border: none;';
            
            const moveDownBtn = document.createElement('button');
            moveDownBtn.className = 'budget-action-btn budget-move-btn';
            moveDownBtn.innerHTML = '↓';
            moveDownBtn.title = currentLanguage === 'da' ? 'Flyt ned' : 'Move down';
            moveDownBtn.dataset.type = type;
            moveDownBtn.dataset.row = rowIndex;
            moveDownBtn.dataset.action = 'down';
            moveDownBtn.style.cssText = 'color: white; font-size: 18px; background: rgba(255,255,255,0.2); border-radius: 4px; padding: 2px 6px; cursor: pointer; border: none;';
            
            const duplicateBtn = document.createElement('button');
            duplicateBtn.className = 'budget-action-btn budget-duplicate-btn';
            duplicateBtn.innerHTML = '⎘';
            duplicateBtn.title = currentLanguage === 'da' ? 'Duplikér kategori' : 'Duplicate category';
            duplicateBtn.dataset.type = type;
            duplicateBtn.dataset.row = rowIndex;
            duplicateBtn.style.cssText = 'color: white; font-size: 18px; background: rgba(255,255,255,0.2); border-radius: 4px; padding: 2px 6px; cursor: pointer; border: none;';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'budget-action-btn budget-delete-btn';
            deleteBtn.innerHTML = '×';
            deleteBtn.title = currentLanguage === 'da' ? 'Slet kategori' : 'Delete category';
            deleteBtn.dataset.type = type;
            deleteBtn.dataset.row = rowIndex;
            deleteBtn.style.cssText = 'color: white; font-size: 24px; background: rgba(255,255,255,0.2); border-radius: 4px; padding: 0 8px; cursor: pointer; border: none;';
            
            actionsContainer.appendChild(moveUpBtn);
            actionsContainer.appendChild(moveDownBtn);
            actionsContainer.appendChild(duplicateBtn);
            actionsContainer.appendChild(deleteBtn);
            
            td.appendChild(nameInput);
            td.appendChild(actionsContainer);
            tr.appendChild(td);
            return tr;
        }
        
        tr.className = 'budget-row';
        
        // Name cell with icon indicator
        const nameTd = document.createElement('td');
        const nameWrapper = document.createElement('div');
        nameWrapper.style.cssText = 'display: flex; align-items: center; gap: 6px; width: 100%;';
        
        const nameIcon = document.createElement('span');
        nameIcon.textContent = type === 'income' ? '💰' : '💸';
        nameIcon.style.cssText = 'font-size: 14px; opacity: 0.6; flex-shrink: 0;';
        nameIcon.title = type === 'income' ? this.t('budget-income-section', 'Income') : this.t('budget-expense-section', 'Expense');
        
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'budget-cell-input';
        nameInput.value = rowData.name || '';
        nameInput.placeholder = type === 'income' ? this.t('budget-income-name', 'Income Name') : this.t('budget-expense-name', 'Expense Name');
        nameInput.dataset.type = type;
        nameInput.dataset.row = rowIndex;
        nameInput.dataset.field = 'name';
        nameInput.setAttribute('autocomplete', 'off');
        nameInput.style.cssText = 'flex: 1; border: none; background: transparent; min-width: 150px;';
        
        nameWrapper.appendChild(nameIcon);
        nameWrapper.appendChild(nameInput);
        nameTd.appendChild(nameWrapper);
        tr.appendChild(nameTd);

        // Faktiske cell
        const faktiskeTd = document.createElement('td');
        const faktiskeInput = document.createElement('input');
        faktiskeInput.type = 'number';
        faktiskeInput.className = 'budget-cell-input budget-cell-number';
        faktiskeInput.value = rowData.faktiske || '';
        faktiskeInput.placeholder = '0';
        faktiskeInput.dataset.type = type;
        faktiskeInput.dataset.row = rowIndex;
        faktiskeInput.dataset.field = 'faktiske';
        faktiskeInput.step = '0.01';
        faktiskeTd.appendChild(faktiskeInput);
        tr.appendChild(faktiskeTd);

        // Month cells - always render ALL months, then hide/show with CSS via applyMonthSelection()
        // This ensures consistent table structure regardless of view mode
        this.monthNames.forEach(month => {
            // Mdr. cell
            const mdrTd = document.createElement('td');
            const mdrInput = document.createElement('input');
            mdrInput.type = 'number';
            mdrInput.className = 'budget-cell-input budget-cell-number';
            mdrInput.value = rowData[month].mdr || '';
            mdrInput.placeholder = '0';
            mdrInput.dataset.type = type;
            mdrInput.dataset.row = rowIndex;
            mdrInput.dataset.field = `${month}.mdr`;
            mdrInput.step = '0.01';
            mdrTd.appendChild(mdrInput);
            tr.appendChild(mdrTd);

            // 14. Dag cell - always create it, but hide with CSS if show14DagColumns is false
            const dag14Td = document.createElement('td');
            dag14Td.className = 'budget-14dag-col';
            dag14Td.style.display = this.show14DagColumns ? '' : 'none';
            const dag14Input = document.createElement('input');
            dag14Input.type = 'number';
            dag14Input.className = 'budget-cell-input budget-cell-number budget-14dag-cell';
            dag14Input.value = rowData[month].dag14 || '';
            dag14Input.placeholder = '0';
            dag14Input.dataset.type = type;
            dag14Input.dataset.row = rowIndex;
            dag14Input.dataset.field = `${month}.dag14`;
            dag14Input.step = '0.01';
            dag14Td.appendChild(dag14Input);
            tr.appendChild(dag14Td);
        });

        // Store row data for move operations
        tr.dataset.type = type;
        tr.dataset.rowIndex = rowIndex;

        // Actions cell with buttons
        const actionsTd = document.createElement('td');
        actionsTd.className = 'budget-actions-cell';
        
        const moveUpBtn = document.createElement('button');
        moveUpBtn.className = 'budget-action-btn budget-move-btn';
        moveUpBtn.innerHTML = '↑';
        moveUpBtn.title = currentLanguage === 'da' ? 'Flyt op' : 'Move up';
        moveUpBtn.dataset.type = type;
        moveUpBtn.dataset.row = rowIndex;
        moveUpBtn.dataset.action = 'up';
        
        const moveDownBtn = document.createElement('button');
        moveDownBtn.className = 'budget-action-btn budget-move-btn';
        moveDownBtn.innerHTML = '↓';
        moveDownBtn.title = currentLanguage === 'da' ? 'Flyt ned' : 'Move down';
        moveDownBtn.dataset.type = type;
        moveDownBtn.dataset.row = rowIndex;
        moveDownBtn.dataset.action = 'down';
        
        const fillAllBtn = document.createElement('button');
        fillAllBtn.className = 'budget-action-btn budget-fill-all-btn';
        fillAllBtn.innerHTML = '⇉';
        fillAllBtn.title = currentLanguage === 'da' ? 'Udfyld alle måneder med samme værdi' : 'Fill all months with same value';
        fillAllBtn.dataset.type = type;
        fillAllBtn.dataset.row = rowIndex;
        
        const duplicateBtn = document.createElement('button');
        duplicateBtn.className = 'budget-action-btn budget-duplicate-btn';
        duplicateBtn.innerHTML = '⎘';
        duplicateBtn.title = currentLanguage === 'da' ? 'Duplikér række' : 'Duplicate row';
        duplicateBtn.dataset.type = type;
        duplicateBtn.dataset.row = rowIndex;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'budget-action-btn budget-delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.title = currentLanguage === 'da' ? 'Slet række' : 'Delete row';
        deleteBtn.dataset.type = type;
        deleteBtn.dataset.row = rowIndex;
        
        // Quick-Notes button (Step J)
        const notesBtn = document.createElement('button');
        notesBtn.className = 'budget-action-btn budget-notes-btn';
        notesBtn.innerHTML = rowData.notes ? '📝' : '🗒️';
        notesBtn.title = rowData.notes ? `Note: ${rowData.notes}` : (currentLanguage === 'da' ? 'Tilføj note' : 'Add Note');
        notesBtn.dataset.type = type;
        notesBtn.dataset.row = rowIndex;
        notesBtn.style.cssText = rowData.notes ? 'opacity:1;' : 'opacity:0.45;';
        
        actionsTd.appendChild(moveUpBtn);
        actionsTd.appendChild(moveDownBtn);
        actionsTd.appendChild(fillAllBtn);
        actionsTd.appendChild(duplicateBtn);
        actionsTd.appendChild(notesBtn);
        actionsTd.appendChild(deleteBtn);
        tr.appendChild(actionsTd);

        return tr;
    }

    renderSummary() {
        const totalIncomeEl = document.getElementById('budget-total-income');
        const totalExpenseEl = document.getElementById('budget-total-expenses');
        const netIncomeEl = document.getElementById('budget-net-income');

        if (!totalIncomeEl || !totalExpenseEl || !netIncomeEl) return;

        // Calculate totals from all rows (Faktiske + all month columns), skip category rows
        let totalIncome = 0;
        this.currentData.income.forEach(row => {
            if (row.isCategory) return; // Skip category rows
            totalIncome += parseFloat(row.faktiske) || 0;
            this.monthNames.forEach(month => {
                totalIncome += (parseFloat(row[month].mdr) || 0) + (parseFloat(row[month].dag14) || 0);
            });
        });
        
        let totalExpense = 0;
        this.currentData.expenses.forEach(row => {
            if (row.isCategory) return; // Skip category rows
            totalExpense += parseFloat(row.faktiske) || 0;
            this.monthNames.forEach(month => {
                totalExpense += (parseFloat(row[month].mdr) || 0) + (parseFloat(row[month].dag14) || 0);
            });
        });
        
        const netIncome = totalIncome - totalExpense;

        totalIncomeEl.textContent = this.formatCurrency(totalIncome);
        totalExpenseEl.textContent = this.formatCurrency(totalExpense);
        netIncomeEl.textContent = this.formatCurrency(netIncome);
        netIncomeEl.style.color = netIncome >= 0 ? '#22c55e' : '#ef4444';
        
        // Update account transfer dashboard
        this.renderAccountDashboard();
        
        // Render budget sparklines if enhancement is available
        this.renderBudgetSparklines();
    }
    
    // Render mini sparklines for budget trends
    renderBudgetSparklines() {
        if (!window.BudgetEnhancements || !window.BudgetEnhancements.sparklines) return;
        
        // Calculate monthly totals for sparklines
        const monthlyIncome = [];
        const monthlyExpense = [];
        const monthlyNet = [];
        
        this.monthNames.forEach(month => {
            let monthIncome = 0;
            let monthExpense = 0;
            
            this.currentData.income.forEach(row => {
                if (row.isCategory) return;
                if (row[month]) {
                    monthIncome += (parseFloat(row[month].mdr) || 0) + (parseFloat(row[month].dag14) || 0);
                }
            });
            
            this.currentData.expenses.forEach(row => {
                if (row.isCategory) return;
                if (row[month]) {
                    monthExpense += (parseFloat(row[month].mdr) || 0) + (parseFloat(row[month].dag14) || 0);
                }
            });
            
            monthlyIncome.push(monthIncome);
            monthlyExpense.push(monthExpense);
            monthlyNet.push(monthIncome - monthExpense);
        });
        
        // Render inline sparklines next to totals
        const incomeSparkline = document.getElementById('budget-income-sparkline');
        const expenseSparkline = document.getElementById('budget-expense-sparkline');
        const netSparkline = document.getElementById('budget-net-sparkline');
        
        if (incomeSparkline && monthlyIncome.some(v => v > 0)) {
            incomeSparkline.innerHTML = window.BudgetEnhancements.sparklines.render(monthlyIncome, {
                width: 60,
                height: 20,
                color: '#22c55e'
            });
        }
        
        if (expenseSparkline && monthlyExpense.some(v => v > 0)) {
            expenseSparkline.innerHTML = window.BudgetEnhancements.sparklines.render(monthlyExpense, {
                width: 60,
                height: 20,
                color: '#ef4444'
            });
        }
        
        if (netSparkline && monthlyNet.some(v => v !== 0)) {
            const netColor = monthlyNet[monthlyNet.length - 1] >= 0 ? '#22c55e' : '#ef4444';
            netSparkline.innerHTML = window.BudgetEnhancements.sparklines.render(monthlyNet, {
                width: 60,
                height: 20,
                color: netColor
            });
        }
    }

    renderAccountDashboard() {
        const transferRec = this.calculateTransferRecommendation();
        
        // Decide which amount to show (with buffer if enabled, otherwise just your share)
        const recommendedAmount = transferRec.bufferEnabled ? transferRec.withBuffer : transferRec.required;
        
        // Budget Account Summary
        const budgetIncomeEl = document.getElementById('budget-budget-income');
        const budgetExpensesEl = document.getElementById('budget-budget-expenses');
        const budgetBalanceEl = document.getElementById('budget-budget-balance');
        
        if (budgetIncomeEl) {
            budgetIncomeEl.textContent = this.formatCurrency(transferRec.accountTotals.budget.income);
        }
        if (budgetExpensesEl) {
            budgetExpensesEl.textContent = this.formatCurrency(transferRec.accountTotals.budget.expenses);
        }
        if (budgetBalanceEl) {
            const balance = transferRec.accountTotals.budget.income - transferRec.accountTotals.budget.expenses;
            budgetBalanceEl.textContent = this.formatCurrency(balance);
            budgetBalanceEl.style.color = balance >= 0 ? '#22c55e' : '#ef4444';
        }
        
        // Periodic Transfer Recommendations - use recommended amount
        const monthlyTransferEl = document.getElementById('budget-monthly-transfer');
        const biweeklyTransferEl = document.getElementById('budget-biweekly-transfer');
        
        if (monthlyTransferEl && biweeklyTransferEl) {
            // Calculate how much to transfer per month (divide yearly total by 12)
            const monthlyAmount = recommendedAmount / 12;
            // Calculate how much to transfer every 14 days (divide yearly total by 26)
            const biweeklyAmount = recommendedAmount / 26;
            
            monthlyTransferEl.textContent = this.formatCurrency(monthlyAmount);
            biweeklyTransferEl.textContent = this.formatCurrency(biweeklyAmount);
        }
        
        // Update explanation panel data
        this.updateExplanationPanel(transferRec);
        
        // Setup explanation toggle if not already done
        if (!this.explanationToggleSetup) {
            this.setupExplanationToggle();
            this.explanationToggleSetup = true;
        }
        
        // Setup settings toggle if not already done
        if (!this.settingsToggleSetup) {
            this.setupSettingsToggle();
            this.settingsToggleSetup = true;
        }
    }
    
    updateExplanationPanel(transferRec) {
        const totalIncome = transferRec.accountTotals.budget.income;
        const totalExpenses = transferRec.accountTotals.budget.expenses;
        const required = transferRec.required;
        
        // Determine recommended amount (with buffer if enabled)
        const recommendedAmount = transferRec.bufferEnabled ? transferRec.withBuffer : transferRec.required;
        const monthlyAmount = recommendedAmount / 12;
        const biweeklyAmount = recommendedAmount / 26;
        
        // Update explanation values
        document.getElementById('explain-total-income').textContent = this.formatCurrency(totalIncome);
        document.getElementById('explain-total-expenses').textContent = this.formatCurrency(totalExpenses);
        document.getElementById('explain-required-yearly').textContent = this.formatCurrency(recommendedAmount);
        document.getElementById('explain-monthly-amount').textContent = this.formatCurrency(monthlyAmount);
        document.getElementById('explain-biweekly-amount').textContent = this.formatCurrency(biweeklyAmount);
        
        // Build calculation text with split and buffer info
        let calcText = '';
        
        // Show base amount
        if (transferRec.splitEnabled || transferRec.bufferEnabled) {
            calcText += `${this.t('budget-total-expenses-label', 'Total Expenses')}: ${this.formatCurrency(transferRec.baseRequired)}/${this.t('budget-year', 'year')}<br>`;
        }
        
        // Show split calculation
        if (transferRec.splitEnabled) {
            const splitPercent = Math.round(transferRec.splitRatio * 100);
            calcText += `${this.t('budget-your-share', 'Your share:')} (${splitPercent}%): ${this.formatCurrency(transferRec.required)}/${this.t('budget-year', 'year')}<br>`;
        }
        
        // Show buffer calculation
        if (transferRec.bufferEnabled) {
            const baseAmount = transferRec.splitEnabled ? transferRec.required : transferRec.baseRequired;
            calcText += `${this.t('budget-add-buffer', 'Safety buffer')} (+${transferRec.bufferPercent}%): +${this.formatCurrency(transferRec.bufferAmount)}/${this.t('budget-year', 'year')}<br>`;
            calcText += `${this.t('budget-with-buffer', 'With buffer')}: ${this.formatCurrency(transferRec.withBuffer)}/${this.t('budget-year', 'year')}<br><br>`;
        }
        
        // Add monthly calculation
        calcText += `${this.formatCurrency(recommendedAmount)} ÷ 12 ${this.t('budget-months', 'months')} = ${this.formatCurrency(monthlyAmount)} ${this.t('budget-per-month', 'per month')}`;
        document.getElementById('explain-monthly-calc').innerHTML = calcText;
        
        // Add bi-weekly calculation
        document.getElementById('explain-biweekly-calc').textContent = 
            `${this.formatCurrency(recommendedAmount)} ÷ 26 ${this.t('budget-periods', 'periods')} = ${this.formatCurrency(biweeklyAmount)} ${this.t('budget-per-14days', 'per 14 days')}`;
        
        // Update income note with detailed explanation
        const balance = totalIncome - totalExpenses;
        const incomeNote = document.getElementById('explain-income-note');
        if (incomeNote) {
            // Calculate average monthly income and expenses
            const avgMonthlyIncome = totalIncome / 12;
            const avgMonthlyExpenses = totalExpenses / 12;
            
            if (balance >= 0) {
                incomeNote.innerHTML = `
                    ${this.t('budget-avg-per-month', 'Your budget shows the following average per month:')}<br>
                    &bull; <strong class="text-green-600">${this.t('budget-month-income', 'Income:')}</strong> ${this.formatCurrency(avgMonthlyIncome)}/${this.t('budget-month', 'month')}<br>
                    &bull; <strong class="text-red-600">${this.t('budget-month-expenses', 'Expenses:')}</strong> ${this.formatCurrency(avgMonthlyExpenses)}/${this.t('budget-month', 'month')}<br>
                    &bull; <strong class="text-blue-600">${this.t('budget-surplus', 'Surplus:')}</strong> ${this.formatCurrency(balance / 12)}/${this.t('budget-month', 'month')}<br><br>
                    ${this.t('budget-can-afford', 'With this plan you can afford to save')} ${this.formatCurrency(monthlyAmount)} ${this.t('budget-per-month', 'per month')} ${this.t('budget-or', 'or')} ${this.formatCurrency(biweeklyAmount)} ${this.t('budget-every-14-days', 'every 14 days')}.
                `;
            } else {
                incomeNote.innerHTML = `
                    <strong class="text-red-600">⚠️ ${this.t('budget-warning-deficit', 'Warning - Budget Deficit:')}</strong><br><br>
                    ${this.t('budget-avg-per-month', 'Your budget shows the following average per month:')}<br>
                    &bull; <strong class="text-green-600">${this.t('budget-month-income', 'Income:')}</strong> ${this.formatCurrency(avgMonthlyIncome)}/${this.t('budget-month', 'month')}<br>
                    &bull; <strong class="text-red-600">${this.t('budget-month-expenses', 'Expenses:')}</strong> ${this.formatCurrency(avgMonthlyExpenses)}/${this.t('budget-month', 'month')}<br>
                    &bull; <strong class="text-red-600">${this.t('budget-deficit', 'Deficit:')}</strong> ${this.formatCurrency(Math.abs(balance / 12))}/${this.t('budget-month', 'month')}<br><br>
                    ${this.t('budget-shortfall', 'You are')} ${this.formatCurrency(Math.abs(balance))} ${this.t('budget-shortfall2', 'short over the year. Consider:')}:<br>
                    1. ${this.t('budget-reduce-expenses', 'Reduce your expenses')}<br>
                    2. ${this.t('budget-increase-income', 'Increase your income')}<br>
                    3. ${this.t('budget-review-budget', 'Review your budget for unrealistic figures')}
                `;
            }
        }
    }
    
    setupExplanationToggle() {
        const toggleBtn = document.getElementById('budget-explain-toggle');
        const closeBtn = document.getElementById('budget-explain-close');
        const panel = document.getElementById('budget-explanation-panel');
        
        if (toggleBtn && panel) {
            toggleBtn.addEventListener('click', () => {
                const isHidden = panel.style.display === 'none' || !panel.style.display;
                panel.style.display = isHidden ? 'block' : 'none';
                
                // Scroll to panel if opening
                if (isHidden) {
                    setTimeout(() => {
                        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, 100);
                }
            });
        }
        
        if (closeBtn && panel) {
            closeBtn.addEventListener('click', () => {
                panel.style.display = 'none';
            });
        }
    }

    setupSettingsToggle() {
        const settingsBtn = document.getElementById('budget-settings-toggle');
        const settingsPanel = document.getElementById('budget-settings-panel');
        
        if (settingsBtn && settingsPanel) {
            settingsBtn.addEventListener('click', () => {
                const isHidden = settingsPanel.style.display === 'none' || !settingsPanel.style.display;
                settingsPanel.style.display = isHidden ? 'block' : 'none';
                
                // Scroll to panel if opening
                if (isHidden) {
                    setTimeout(() => {
                        settingsPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, 100);
                }
            });
        }
        
        // Setup checkbox handlers
        const splitCheckbox = document.getElementById('budget-split-enabled');
        const bufferCheckbox = document.getElementById('budget-buffer-enabled');
        
        if (splitCheckbox) {
            splitCheckbox.checked = this.expenseSplitEnabled;
            splitCheckbox.addEventListener('change', (e) => {
                this.expenseSplitEnabled = e.target.checked;
                localStorage.setItem('budget-expense-split', e.target.checked);
                this.renderAccountDashboard();
            });
        }
        
        if (bufferCheckbox) {
            bufferCheckbox.checked = this.safetyBufferEnabled;
            bufferCheckbox.addEventListener('change', (e) => {
                this.safetyBufferEnabled = e.target.checked;
                localStorage.setItem('budget-safety-buffer', e.target.checked);
                this.renderAccountDashboard();
            });
        }
        
        // Setup slider handlers
        const splitSlider = document.getElementById('budget-split-ratio');
        const splitValue = document.getElementById('budget-split-value');
        
        if (splitSlider && splitValue) {
            splitSlider.value = this.expenseSplitRatio * 100;
            splitValue.textContent = Math.round(this.expenseSplitRatio * 100) + '%';
            
            splitSlider.addEventListener('input', (e) => {
                const percent = parseInt(e.target.value);
                splitValue.textContent = percent + '%';
                this.expenseSplitRatio = percent / 100;
                localStorage.setItem('budget-expense-split-ratio', this.expenseSplitRatio);
                this.renderAccountDashboard();
            });
        }
        
        const bufferSlider = document.getElementById('budget-buffer-percent');
        const bufferValue = document.getElementById('budget-buffer-value');
        
        if (bufferSlider && bufferValue) {
            bufferSlider.value = this.safetyBufferPercent;
            bufferValue.textContent = this.safetyBufferPercent + '%';
            
            bufferSlider.addEventListener('input', (e) => {
                const percent = parseInt(e.target.value);
                bufferValue.textContent = percent + '%';
                this.safetyBufferPercent = percent;
                localStorage.setItem('budget-safety-buffer-percent', percent);
                this.renderAccountDashboard();
            });
        }
    }

    // ===================================================================
    // Cell Editing
    // ===================================================================
    setupCellEditing() {
        // Prevent multiple registrations
        if (this.editingSetup) return;
        this.editingSetup = true;
        
        // Event delegation for cell inputs
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('budget-cell-input')) {
                this.handleCellChange(e.target);
            }
        });
        
        // Trigger calculation on Enter key press
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.classList.contains('budget-cell-input')) {
                this.handleCellChange(e.target);
                this.renderSummary();
            }
        });

        // Focus/blur for visual feedback
        document.addEventListener('focus', (e) => {
            if (e.target.classList.contains('budget-cell-input')) {
                e.target.classList.add('cell-editing');
                this.editingCell = e.target;
            }
        }, true);

        document.addEventListener('blur', (e) => {
            if (e.target.classList.contains('budget-cell-input')) {
                e.target.classList.remove('cell-editing');
                if (this.editingCell === e.target) {
                    this.editingCell = null;
                }
            }
        }, true);

        // Event delegation for action buttons (using document to ensure it works after re-render)
        document.addEventListener('click', (e) => {
            // Only process if click is within budget table area
            if (!e.target.closest('.budget-table')) return;
            
                // Check if clicked element or its parent is a delete button
                const deleteBtn = e.target.closest('.budget-delete-btn');
                if (deleteBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    const type = deleteBtn.dataset.type;
                    const rowIndex = parseInt(deleteBtn.dataset.row);
                    if (confirm(this.t('confirm-delete-row', 'Are you sure you want to delete this row?'))) {
                        this.deleteRow(type, rowIndex);
                    }
                    return;
                }
                
                // Check for duplicate button
                const duplicateBtn = e.target.closest('.budget-duplicate-btn');
                if (duplicateBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    const type = duplicateBtn.dataset.type;
                    const rowIndex = parseInt(duplicateBtn.dataset.row);
                    this.duplicateRow(type, rowIndex);
                    return;
                }
                
                // Check for fill-all button
                const fillAllBtn = e.target.closest('.budget-fill-all-btn');
                if (fillAllBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    const type = fillAllBtn.dataset.type;
                    const rowIndex = parseInt(fillAllBtn.dataset.row);
                    this.showFillAllMonthsDialog(type, rowIndex);
                    return;
                }
                
                // Check for move buttons
                const moveBtn = e.target.closest('.budget-move-btn');
                if (moveBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    const type = moveBtn.dataset.type;
                    const rowIndex = parseInt(moveBtn.dataset.row);
                    const action = moveBtn.dataset.action;
                    if (action === 'up') {
                        this.moveRowUp(type, rowIndex);
                    } else if (action === 'down') {
                        this.moveRowDown(type, rowIndex);
                    }
                    return;
                }

                // Check for Quick-Notes button (Step J)
                const notesBtn = e.target.closest('.budget-notes-btn');
                if (notesBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    const type = notesBtn.dataset.type;
                    const rowIndex = parseInt(notesBtn.dataset.row);
                    this.toggleRowNotes(type, rowIndex, notesBtn);
                    return;
                }
        });

        // Keyboard navigation (Tab, Enter, Arrow keys)
        document.addEventListener('keydown', (e) => {
            if (e.target.classList.contains('budget-cell-input')) {
                this.handleKeyboardNav(e);
            }
        });
    }

    handleCellChange(input) {
        const type = input.dataset.type;
        const rowIndex = parseInt(input.dataset.row);
        const field = input.dataset.field;
        const value = input.type === 'number' ? parseFloat(input.value) || 0 : input.value;

        // Update data
        const row = type === 'income' ? this.currentData.income[rowIndex] : this.currentData.expenses[rowIndex];
        if (!row) return;

        // Handle nested month fields (e.g., "jan.mdr")
        if (field.includes('.')) {
            const [month, subField] = field.split('.');
            row[month][subField] = value;
            
            // Auto-calculate 14.Dag when Mdr. changes
            if (subField === 'mdr' && this.autoCalc14Dag && this.show14DagColumns) {
                let calculatedValue = 0;
                
                if (this.autoCalcType === 'copy') {
                    calculatedValue = value;
                } else if (this.autoCalcType === 'divide') {
                    calculatedValue = value / 2;
                }
                
                // Update data
                row[month].dag14 = calculatedValue;
                
                // Update UI input if it exists
                const dag14Input = document.querySelector(
                    `.budget-cell-input[data-type="${type}"][data-row="${rowIndex}"][data-field="${month}.dag14"]`
                );
                if (dag14Input) {
                    dag14Input.value = calculatedValue || '';
                }
            }
        } else {
            row[field] = value;
        }

        // Per-cell debounce with individual history tracking
        // This ensures EVERY cell edit creates its own undo point
        const cellKey = `${type}-${rowIndex}-${field}`;
        
        // Clear existing timer for this specific cell
        if (this.debounceTimers[cellKey]) {
            clearTimeout(this.debounceTimers[cellKey]);
        }

        // Visual feedback - highlight recently edited cell
        input.classList.add('recently-edited');
        setTimeout(() => input.classList.remove('recently-edited'), 1500);

        // Update summary and total rows immediately for any value change
        this.renderSummary();
        this.renderTotalRow('income');
        this.renderTotalRow('expense');
        
        // Set new timer - creates individual history snapshot per cell
        this.debounceTimers[cellKey] = setTimeout(() => {
            // Save with history (not autoSave which skips history)
            this.storage.saveData(this.currentData);
            this.updateUndoRedoButtons();
            delete this.debounceTimers[cellKey];
        }, 400);
    }

    // ===================================================================
    // Row Management
    // ===================================================================
    addIncomeRow() {
        this.storage.addIncomeRow();
        this.renderIncomeTable();
        this.renderSummary();
        this.updateUndoRedoButtons();
    }

    addExpenseRow() {
        this.storage.addExpenseRow();
        this.renderExpenseTable();
        this.renderSummary();
        this.updateUndoRedoButtons();
    }

    addCategoryRow(type) {
        const categoryRow = {
            name: '',
            isCategory: true,
            faktiske: 0,
            jan: { mdr: 0, dag14: 0 },
            feb: { mdr: 0, dag14: 0 },
            mar: { mdr: 0, dag14: 0 },
            apr: { mdr: 0, dag14: 0 },
            may: { mdr: 0, dag14: 0 },
            jun: { mdr: 0, dag14: 0 },
            jul: { mdr: 0, dag14: 0 },
            aug: { mdr: 0, dag14: 0 },
            sep: { mdr: 0, dag14: 0 },
            oct: { mdr: 0, dag14: 0 },
            nov: { mdr: 0, dag14: 0 },
            dec: { mdr: 0, dag14: 0 }
        };
        
        if (type === 'income') {
            this.currentData.income.push(categoryRow);
        } else {
            this.currentData.expenses.push(categoryRow);
        }
        
        this.storage.saveData(this.currentData);
        this.renderIncomeTable();
        this.renderExpenseTable();
        this.renderSummary();
        this.updateUndoRedoButtons();
    }

    deleteRow(type, rowIndex) {
        const tbody = document.getElementById(`budget-${type}-tbody`);
        const row = tbody?.children[rowIndex];
        
        if (row) {
            // Quick fade out animation
            row.style.transition = 'opacity 0.15s';
            row.style.opacity = '0';
            
            setTimeout(() => {
                this.storage.deleteRow(type, rowIndex);
                this.renderIncomeTable();
                this.renderExpenseTable();
                this.renderSummary();
                this.updateUndoRedoButtons();
            }, 150);
        } else {
            this.storage.deleteRow(type, rowIndex);
            this.renderIncomeTable();
            this.renderExpenseTable();
            this.renderSummary();
            this.updateUndoRedoButtons();
        }
    }

    duplicateRow(type, rowIndex) {
        const sourceRow = type === 'income' ? this.currentData.income[rowIndex] : this.currentData.expenses[rowIndex];
        if (!sourceRow) return;

        // Deep clone the row
        const newRow = JSON.parse(JSON.stringify(sourceRow));
        newRow.name = `${newRow.name} ${currentLanguage === 'da' ? '(kopi)' : '(copy)'}`;

        // Add to data
        if (type === 'income') {
            this.currentData.income.splice(rowIndex + 1, 0, newRow);
        } else {
            this.currentData.expenses.splice(rowIndex + 1, 0, newRow);
        }

        // Save and re-render just the tables
        this.storage.saveData(this.currentData);
        this.renderIncomeTable();
        this.renderExpenseTable();
        this.renderSummary();
        this.updateUndoRedoButtons();
        
        // Highlight the new row
        setTimeout(() => {
            const tbody = document.getElementById(`budget-${type}-tbody`);
            if (tbody && tbody.children[rowIndex + 1]) {
                const newRowEl = tbody.children[rowIndex + 1];
                newRowEl.style.transition = 'background-color 0.5s';
                newRowEl.style.backgroundColor = '#dbeafe';
                setTimeout(() => {
                    newRowEl.style.backgroundColor = '';
                }, 500);
            }
        }, 50);
    }

    showFillAllMonthsDialog(type, rowIndex) {
        const row = type === 'income' ? this.currentData.income[rowIndex] : this.currentData.expenses[rowIndex];
        if (!row) return;

        const value = prompt(currentLanguage === 'da' ? `Udfyld alle måneder for "${row.name}"\n\nIndtast værdi (dette vil udfylde Mdr. kolonnen, 14.Dag beregnes automatisk):` : `Fill all months for "${row.name}"\n\nEnter value (this will fill the Monthly column, 14-Day is calculated automatically):`);
        
        if (value === null) return; // User cancelled
        
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
            alert(currentLanguage === 'da' ? 'Ugyldig værdi. Indtast venligst et tal.' : 'Invalid value. Please enter a number.');
            return;
        }

        // Fill all months with the value (mdr column only)
        this.monthNames.forEach(month => {
            if (row[month]) {
                row[month].mdr = numValue;
                // Auto-calculate dag14 if enabled
                if (this.autoCalc14Dag) {
                    row[month].dag14 = this.autoCalcType === 'divide' ? numValue / 2 : (this.autoCalcType === 'copy' ? numValue : 0);
                }
            }
        });

        // Save and re-render
        this.storage.saveData(this.currentData);
        this.renderIncomeTable();
        this.renderExpenseTable();
        this.renderSummary();
        this.updateUndoRedoButtons();
        
        // Show success message
        this.showMessage(currentLanguage === 'da' ? `✓ Alle måneder udfyldt med ${this.formatCurrency(numValue)}` : `✓ All months filled with ${this.formatCurrency(numValue)}`, 'success');
    }

    moveRowUp(type, rowIndex) {
        if (rowIndex === 0) return; // Already at top
        
        const arr = type === 'income' ? this.currentData.income : this.currentData.expenses;
        const row = arr[rowIndex];
        arr.splice(rowIndex, 1);
        arr.splice(rowIndex - 1, 0, row);
        this.storage.saveData(this.currentData);
        
        // Re-render tables only
        this.renderIncomeTable();
        this.renderExpenseTable();
        this.renderSummary();
        this.updateUndoRedoButtons();
        
        // Highlight moved row
        setTimeout(() => {
            const tbody = document.getElementById(`budget-${type}-tbody`);
            if (tbody && tbody.children[rowIndex - 1]) {
                const movedRow = tbody.children[rowIndex - 1];
                movedRow.style.transition = 'background-color 0.3s';
                movedRow.style.backgroundColor = '#dbeafe';
                setTimeout(() => {
                    movedRow.style.backgroundColor = '';
                }, 300);
            }
        }, 50);
    }

    moveRowDown(type, rowIndex) {
        const arr = type === 'income' ? this.currentData.income : this.currentData.expenses;
        if (rowIndex === arr.length - 1) return; // Already at bottom
        
        const row = arr[rowIndex];
        arr.splice(rowIndex, 1);
        arr.splice(rowIndex + 1, 0, row);
        this.storage.saveData(this.currentData);
        
        // Re-render tables only
        this.renderIncomeTable();
        this.renderExpenseTable();
        this.renderSummary();
        this.updateUndoRedoButtons();
        
        // Highlight moved row
        setTimeout(() => {
            const tbody = document.getElementById(`budget-${type}-tbody`);
            if (tbody && tbody.children[rowIndex + 1]) {
                const movedRow = tbody.children[rowIndex + 1];
                movedRow.style.transition = 'background-color 0.3s';
                movedRow.style.backgroundColor = '#dbeafe';
                setTimeout(() => {
                    movedRow.style.backgroundColor = '';
                }, 300);
            }
        }, 50);
    }

    moveRow(type, fromIndex, toIndex) {
        if (fromIndex === toIndex) return;
        const arr = type === 'income' ? this.currentData.income : this.currentData.expenses;
        const row = arr[fromIndex];
        arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, row);
        this.storage.saveData(this.currentData);
        this.renderIncomeTable();
        this.renderExpenseTable();
        this.renderSummary();
        this.updateUndoRedoButtons();
    }

    // Quick-Notes per row (Step J)
    toggleRowNotes(type, rowIndex, triggerBtn) {
        // Check for existing inline note row
        const existingNoteRow = document.getElementById(`budget-note-row-${type}-${rowIndex}`);
        if (existingNoteRow) {
            existingNoteRow.remove();
            return;
        }

        const data = type === 'income' ? this.currentData.income : this.currentData.expenses;
        const row = data[rowIndex];
        if (!row) return;

        // Find the actual TR element for this row
        const tbody = document.getElementById(`budget-${type}-tbody`);
        if (!tbody) return;
        const trs = tbody.querySelectorAll('tr.budget-row');
        let targetTr = null;
        trs.forEach(tr => {
            if (parseInt(tr.dataset.rowIndex) === rowIndex) targetTr = tr;
        });
        if (!targetTr) return;

        const colCount = targetTr.children.length || 28;
        const noteTr = document.createElement('tr');
        noteTr.id = `budget-note-row-${type}-${rowIndex}`;
        noteTr.style.cssText = 'background: #fefce8;';
        const noteTd = document.createElement('td');
        noteTd.colSpan = colCount;
        noteTd.style.cssText = 'padding: 6px 12px; border-top: 1px dashed #f59e0b;';

        const textarea = document.createElement('textarea');
        textarea.placeholder = currentLanguage === 'da' ? '📝 Tilføj en note til denne række...' : '📝 Add a note for this row...';
        textarea.value = row.notes || '';
        textarea.style.cssText = 'width: 100%; min-height: 48px; padding: 6px; font-size: 12px; border: 1px solid #f59e0b; border-radius: 4px; background: white; resize: vertical;';
        textarea.addEventListener('input', () => {
            row.notes = textarea.value.trim();
            this.storage.saveData(this.currentData);
            if (triggerBtn) {
                triggerBtn.innerHTML = row.notes ? '📝' : '🗒️';
                triggerBtn.title = row.notes ? `Note: ${row.notes}` : (currentLanguage === 'da' ? 'Tilføj note' : 'Add Note');
                triggerBtn.style.opacity = row.notes ? '1' : '0.45';
            }
        });

        const closeBtn = document.createElement('button');
        closeBtn.textContent = currentLanguage === 'da' ? '✕ Luk note' : '✕ Close note';
        closeBtn.style.cssText = 'margin-left: 8px; font-size: 11px; color: #92400e; background: none; border: none; cursor: pointer; text-decoration: underline;';
        closeBtn.addEventListener('click', () => noteTr.remove());

        noteTd.appendChild(textarea);
        noteTd.appendChild(closeBtn);
        noteTr.appendChild(noteTd);
        targetTr.insertAdjacentElement('afterend', noteTr);
        textarea.focus();
    }

    handleKeyboardNav(e) {
        const input = e.target;
        const allInputs = Array.from(document.querySelectorAll('.budget-cell-input'));
        const currentIndex = allInputs.indexOf(input);

        if (e.key === 'Enter' && !e.shiftKey) {
            // Move to same column, next row (Excel behavior)
            e.preventDefault();
            const field = input.dataset.field;
            const type = input.dataset.type;
            const rowIndex = parseInt(input.dataset.row);
            
            // Find next row with same field
            const nextInput = allInputs.find((inp, idx) => 
                idx > currentIndex && 
                inp.dataset.field === field && 
                inp.dataset.type === type
            );
            
            if (nextInput) {
                nextInput.focus();
                nextInput.select();
            }
        } else if (e.key === 'Tab' && !e.shiftKey) {
            // Default Tab behavior, but select content
            setTimeout(() => {
                if (document.activeElement && document.activeElement.classList.contains('budget-cell-input')) {
                    document.activeElement.select();
                }
            }, 10);
        } else if (e.key === 'Escape') {
            // Blur and revert to saved value
            input.blur();
            this.render(); // Re-render to restore original value
        }
    }

    // ===================================================================
    // Undo/Redo
    // ===================================================================
    undo() {
        const previousState = this.storage.undo();
        if (previousState) {
            this.renderIncomeTable();
            this.renderExpenseTable();
            this.renderSummary();
            this.updateUndoRedoButtons();
        }
    }

    redo() {
        const nextState = this.storage.redo();
        if (nextState) {
            this.renderIncomeTable();
            this.renderExpenseTable();
            this.renderSummary();
            this.updateUndoRedoButtons();
        }
    }

    updateUndoRedoButtons() {
        const undoBtn = document.getElementById('budget-undo-btn');
        const redoBtn = document.getElementById('budget-redo-btn');

        if (undoBtn) {
            undoBtn.disabled = !this.storage.canUndo();
        }
        if (redoBtn) {
            redoBtn.disabled = !this.storage.canRedo();
        }
    }

    // ===================================================================
    // Clear All
    // ===================================================================
    clearAll() {
        this.currentData = this.storage.clearAll();
        this.renderIncomeTable();
        this.renderExpenseTable();
        this.renderSummary();
        this.updateUndoRedoButtons();
    }

    // ===================================================================
    // Export Functions
    // ===================================================================
    exportExcel() {
        const filename = this.exporter.exportToExcel();
        this.showMessage(this.t('budget-message-exported', 'Exported to {filename}').replace('{filename}', filename));
    }

    exportCSV() {
        const filename = this.exporter.exportToCSV();
        this.showMessage(this.t('budget-message-exported', 'Exported to {filename}').replace('{filename}', filename));
    }

    exportJSON() {
        const filename = this.exporter.exportJSON();
        this.showMessage(this.t('budget-message-exported', 'Exported to {filename}').replace('{filename}', filename));
    }

    // ===================================================================
    // Import Dialog
    // ===================================================================
    showExportMenu() {
        // Directly export to Excel
        this.exportExcel();
    }

    showImportDialog() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls,.csv,.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const ext = file.name.split('.').pop().toLowerCase();
                
                if (ext === 'xlsx' || ext === 'xls') {
                    await this.exporter.importFromExcel(file);
                } else if (ext === 'csv') {
                    await this.exporter.importFromCSV(file);
                } else if (ext === 'json') {
                    await this.exporter.importJSON(file);
                }
                
                this.renderIncomeTable();
                this.renderExpenseTable();
                this.renderSummary();
                this.showMessage(this.t('budget-message-imported', 'Imported {count} items').replace('{count}', 
                    this.currentData.income.length + this.currentData.expenses.length));
            } catch (error) {
                console.error('Import error:', error);
                this.showMessage(`${this.t('budget-message-error', 'Error')}: ${error.message}`, true);
            }
        };
        
        input.click();
    }

    // ===================================================================
    // Helpers
    // ===================================================================
    formatNumber(amount) {
        if (typeof amount !== 'number' || isNaN(amount)) {
            amount = 0;
        }
        
        const absAmount = Math.abs(amount);
        const isNegative = amount < 0;
        
        let formattedNumber = '';
        
        switch (this.numberFormat) {
            case 'danish':
                // Danish: 20.000,00
                formattedNumber = absAmount.toFixed(2)
                    .replace('.', ',')
                    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                break;
                
            case 'us':
                // US: 20,000.00
                formattedNumber = absAmount.toFixed(2)
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                break;
                
            case 'space':
                // Space: 20 000,00
                formattedNumber = absAmount.toFixed(2)
                    .replace('.', ',')
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
                break;
                
            case 'indian':
                // Indian: 20,00,000.00
                const parts = absAmount.toFixed(2).split('.');
                const intPart = parts[0];
                const decPart = parts[1];
                
                if (intPart.length <= 3) {
                    formattedNumber = intPart + '.' + decPart;
                } else {
                    const lastThree = intPart.slice(-3);
                    const remaining = intPart.slice(0, -3);
                    const formatted = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
                    formattedNumber = formatted + ',' + lastThree + '.' + decPart;
                }
                break;
                
            default:
                formattedNumber = absAmount.toFixed(2);
        }
        
        return isNegative ? '-' + formattedNumber : formattedNumber;
    }
    
    formatCurrency(amount) {
        return `${this.formatNumber(amount)} ${this.currency}`;
    }

    setCurrency(currency) {
        this.currency = currency;
        this.currentData.currency = currency;
        localStorage.setItem('budget-currency', currency);
        this.storage.saveData(this.currentData);
        this.render();
        this.showMessage(this.t('budget-message-saved', 'Saved'));
    }
    
    setNumberFormat(format) {
        this.numberFormat = format;
        localStorage.setItem('budget-number-format', format);
        this.render();
        this.showMessage(this.t('budget-message-saved', 'Saved'));
    }
    
    showMessage(message, isError = false) {
        const messageEl = document.getElementById('budget-message');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.style.color = isError ? '#ef4444' : '#22c55e';
            messageEl.style.opacity = '1';
            
            setTimeout(() => {
                messageEl.style.opacity = '0';
            }, 3000);
        }
    }

    // ===================================================================
    // SMART FEATURES
    // ===================================================================

    // Search functionality
    applySearch() {
        const rows = document.querySelectorAll('.budget-row');
        rows.forEach(row => {
            const nameInput = row.querySelector('input[data-field="name"]');
            if (nameInput) {
                const name = nameInput.value.toLowerCase();
                if (this.searchTerm && name.includes(this.searchTerm)) {
                    row.classList.remove('hidden');
                    row.classList.add('budget-row-highlight');
                    setTimeout(() => row.classList.remove('budget-row-highlight'), 2000);
                    nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else if (this.searchTerm) {
                    row.classList.add('hidden');
                } else {
                    row.classList.remove('hidden');
                }
            }
        });
    }

    // View mode management
    setViewMode(mode) {
        this.viewMode = mode;
        
        // Update button states
        const monthBtn = document.getElementById('view-mode-month');
        const fullBtn = document.getElementById('view-mode-full');
        
        if (monthBtn && fullBtn) {
            if (mode === 'month') {
                monthBtn.classList.add('bg-blue-600', 'text-white');
                monthBtn.classList.remove('hover:bg-gray-200', 'dark:hover:bg-gray-600');
                fullBtn.classList.remove('bg-blue-600', 'text-white');
                fullBtn.classList.add('hover:bg-gray-200', 'dark:hover:bg-gray-600');
            } else {
                fullBtn.classList.add('bg-blue-600', 'text-white');
                fullBtn.classList.remove('hover:bg-gray-200', 'dark:hover:bg-gray-600');
                monthBtn.classList.remove('bg-blue-600', 'text-white');
                monthBtn.classList.add('hover:bg-gray-200', 'dark:hover:bg-gray-600');
            }
        }

        const tabsContainer = document.getElementById('budget-month-tabs');
        
        if (mode === 'full') {
            // Show all months (original view)
            if (tabsContainer) tabsContainer.style.display = 'none';
            this.showAllMonths();
        } else if (mode === 'month') {
            // Single month mode (default to current month if not set)
            if (tabsContainer) tabsContainer.style.display = 'flex';
            if (this.selectedMonths.length === 0) {
                const currentDate = new Date();
                const currentMonth = this.monthNames[currentDate.getMonth()];
                this.selectedMonths = [currentMonth];
            }
            this.selectMonth(this.selectedMonths[0]);
        }
    }

    selectMonth(month) {
        if (this.viewMode === 'month') {
            this.selectedMonths = [month];
        } else if (this.viewMode === 'compare' && this.selectedMonths.length < 2) {
            this.selectedMonths.push(month);
        }
        
        // Update tab states
        document.querySelectorAll('.budget-month-tab').forEach(tab => {
            if (this.selectedMonths.includes(tab.dataset.month)) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        this.applyMonthSelection();
    }

    applyMonthSelection() {
        const table = document.querySelector('.budget-table');
        if (!table) return;

        // Hide all month columns
        this.monthNames.forEach((month, idx) => {
            const colStart = 2 + (idx * 2);
            const colEnd = colStart + 1;
            
            const isVisible = this.selectedMonths.includes(month);
            
            // Headers
            const headerRow1 = table.querySelector('thead tr:first-child');
            const headerRow2 = table.querySelector('thead tr:nth-child(2)');
            
            if (headerRow1) {
                const th = headerRow1.children[idx + 2];
                if (th) th.style.display = isVisible ? '' : 'none';
            }
            
            if (headerRow2) {
                // Mdr. column (even index)
                const mdrHeader = headerRow2.children[idx * 2];
                if (mdrHeader) mdrHeader.style.display = isVisible ? '' : 'none';
                
                // 14.Dag column (odd index) - respect show14DagColumns setting
                const dag14Header = headerRow2.children[idx * 2 + 1];
                if (dag14Header && dag14Header.classList.contains('budget-14dag-header')) {
                    dag14Header.style.display = (isVisible && this.show14DagColumns) ? '' : 'none';
                }
            }
            
            // Data cells
            table.querySelectorAll('tbody tr').forEach(row => {
                // Mdr. column
                const mdrCell = row.children[colStart];
                if (mdrCell) mdrCell.style.display = isVisible ? '' : 'none';
                
                // 14.Dag column - respect show14DagColumns setting
                const dag14Cell = row.children[colEnd];
                if (dag14Cell && dag14Cell.classList.contains('budget-14dag-col')) {
                    dag14Cell.style.display = (isVisible && this.show14DagColumns) ? '' : 'none';
                }
            });
        });
    }

    createVerticalLayout() {
        // This would create a completely new vertical layout
        // For now, just show all months
        this.showAllMonths();
    }

    // Sidebar management
    toggle14DagColumns(show) {
        // Store the setting
        this.show14DagColumns = show;
        
        const table = document.querySelector('.budget-table');
        if (!table) return;
        
        // Update month header colspan (2 when showing 14.Dag, 1 when hiding)
        const monthHeaders = table.querySelectorAll('thead tr:first-child th[colspan]');
        monthHeaders.forEach(header => {
            if (header.hasAttribute('rowspan')) return; // Skip Name and Faktiske
            header.setAttribute('colspan', show ? '2' : '1');
        });
        
        // Show/hide ALL 14.Dag subheader cells using class selector
        const dag14Headers = table.querySelectorAll('.budget-14dag-header');
        dag14Headers.forEach(header => {
            header.style.display = show ? '' : 'none';
        });
        
        // Show/hide ALL 14.Dag data cells in all rows using class selector
        const dag14Cells = table.querySelectorAll('.budget-14dag-col');
        dag14Cells.forEach(cell => {
            cell.style.display = show ? '' : 'none';
        });
        
        // Reapply month selection if in month view to ensure correct columns are visible
        if (this.viewMode === 'month') {
            this.applyMonthSelection();
        }
    }

    toggleSidebar() {
        this.sidebarVisible = !this.sidebarVisible;
        const sidebar = document.getElementById('budget-sidebar');
        if (sidebar) {
            sidebar.style.display = this.sidebarVisible ? 'block' : 'none';
            if (this.sidebarVisible) {
                this.renderSidebar();
            }
        }
    }

    renderSidebar() {
        const content = document.getElementById('budget-sidebar-content');
        if (!content) return;

        const data = this.currentData;
        let html = `<div class="mb-4"><h4 class="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-2">${this.t('budget-sidebar-income', 'INCOME')}</h4>`;
        
        data.income.forEach((row, idx) => {
            const yearTotal = this.calculateYearTotal(row);
            html += `
                <div class="sidebar-row text-sm" data-type="income" data-index="${idx}">
                    <div class="font-medium">${row.name || this.t('budget-unnamed', 'Unnamed')}</div>
                    <div class="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                        <span>${this.t('budget-actual-label', 'Actual:')} ${row.faktiske.toFixed(2)} kr</span>
                        <span class="font-semibold text-green-600">${yearTotal.toFixed(2)} kr</span>
                    </div>
                </div>
            `;
        });
        
        html += `</div><div><h4 class="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-2">${this.t('budget-sidebar-expenses', 'EXPENSES')}</h4>`;
        
        data.expenses.forEach((row, idx) => {
            const yearTotal = this.calculateYearTotal(row);
            const isRecurring = this.recurringExpenses.has(`expense-${idx}`);
            html += `
                <div class="sidebar-row text-sm ${isRecurring ? 'budget-row-recurring' : ''}" data-type="expense" data-index="${idx}">
                    <div class="font-medium">${row.name || this.t('budget-unnamed', 'Unnamed')}</div>
                    <div class="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                        <span>${this.t('budget-actual-label', 'Actual:')} ${row.faktiske.toFixed(2)} kr</span>
                        <span class="font-semibold text-red-600">${yearTotal.toFixed(2)} kr</span>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        content.innerHTML = html;

        // Add click handlers
        content.querySelectorAll('.sidebar-row').forEach(row => {
            row.addEventListener('click', () => {
                const type = row.dataset.type;
                const index = parseInt(row.dataset.index);
                this.highlightRow(type, index);
            });
        });
    }

    calculateYearTotal(row) {
        let total = 0;
        this.monthNames.forEach(month => {
            total += (row[month]?.mdr || 0) + (row[month]?.dag14 || 0);
        });
        return total;
    }

    highlightRow(type, index) {
        const tbody = type === 'income' ? 
            document.getElementById('budget-income-tbody') : 
            document.getElementById('budget-expense-tbody');
        
        if (tbody && tbody.children[index]) {
            tbody.children[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
            tbody.children[index].classList.add('budget-row-highlight');
            setTimeout(() => tbody.children[index].classList.remove('budget-row-highlight'), 2000);
        }
    }

    // Copy forward feature
    showCopyForwardModal() {
        const modal = document.getElementById('budget-copy-forward-modal');
        if (modal) modal.classList.remove('hidden');
    }

    hideCopyForwardModal() {
        const modal = document.getElementById('budget-copy-forward-modal');
        if (modal) modal.classList.add('hidden');
    }

    setCopyTargetNext() {
        this.copyTarget = 'next';
    }

    setCopyTargetAllForward() {
        this.copyTarget = 'all-forward';
    }

    executeCopyForward() {
        const fromMonth = document.getElementById('copy-from-month')?.value;
        const adjustment = parseFloat(document.getElementById('copy-adjustment')?.value) || 0;
        const adjustmentType = document.getElementById('copy-adjustment-type')?.value;
        
        if (!fromMonth) return;

        const fromIdx = this.monthNames.indexOf(fromMonth);
        if (fromIdx === -1) return;

        const targetMonths = this.copyTarget === 'next' ? 
            [this.monthNames[fromIdx + 1]] : 
            this.monthNames.slice(fromIdx + 1);

        // Copy data
        [...this.currentData.income, ...this.currentData.expenses].forEach(row => {
            const sourceValue = {
                mdr: row[fromMonth].mdr,
                dag14: row[fromMonth].dag14
            };

            targetMonths.forEach(toMonth => {
                if (!toMonth) return;
                
                let mdr = sourceValue.mdr;
                let dag14 = sourceValue.dag14;

                if (adjustment !== 0) {
                    if (adjustmentType === 'percent') {
                        mdr = mdr * (1 + adjustment / 100);
                        dag14 = dag14 * (1 + adjustment / 100);
                    } else {
                        mdr = mdr + adjustment;
                        dag14 = dag14 + adjustment;
                    }
                }

                row[toMonth] = { mdr, dag14 };
            });
        });

        this.storage.saveData(this.currentData);
        this.renderIncomeTable();
        this.renderExpenseTable();
        this.renderSummary();
        this.hideCopyForwardModal();
        this.showMessage(currentLanguage === 'da' ? `Kopieret fra ${this.monthNamesFull[fromIdx]} til ${targetMonths.length} måned(er)` : `Copied from ${this.monthNamesFull[fromIdx]} to ${targetMonths.length} month(s)`);
    }

    // Recurring expense detection
    detectRecurringExpenses() {
        this.recurringExpenses.clear();
        
        this.currentData.expenses.forEach((row, idx) => {
            const values = this.monthNames.map(m => (row[m]?.mdr || 0) + (row[m]?.dag14 || 0));
            const nonZero = values.filter(v => v > 0);
            
            if (nonZero.length >= 3) {
                const avg = nonZero.reduce((a, b) => a + b, 0) / nonZero.length;
                const variance = nonZero.map(v => Math.abs(v - avg)).reduce((a, b) => a + b, 0) / nonZero.length;
                
                // If variance is less than 10% of average, it's recurring
                if (variance < avg * 0.1) {
                    this.recurringExpenses.add(`expense-${idx}`);
                }
            }
        });

        this.showMessage(`${this.t('budget-found-recurring', 'Found')} ${this.recurringExpenses.size} ${this.t('budget-fixed-expenses', 'recurring expenses')}`);
        this.renderSidebar();
    }

    // Quick fill from Faktiske
    showQuickFillModal() {
        const modal = document.getElementById('budget-quick-fill-modal');
        if (modal) modal.classList.remove('hidden');
    }

    hideQuickFillModal() {
        const modal = document.getElementById('budget-quick-fill-modal');
        if (modal) modal.classList.add('hidden');
    }

    executeQuickFill() {
        const multiplier = parseFloat(document.getElementById('quick-fill-multiplier')?.value) || 1.4;
        const target = document.querySelector('input[name="quick-fill-target"]:checked')?.value || 'all';

        let count = 0;

        [...this.currentData.income, ...this.currentData.expenses].forEach(row => {
            if (row.faktiske > 0) {
                const shouldFill = target === 'all' || 
                    (target === 'empty' && this.isRowEmpty(row));
                
                if (shouldFill) {
                    const fillValue = row.faktiske * multiplier;
                    this.monthNames.forEach(month => {
                        if (target === 'empty' && ((row[month]?.mdr || 0) > 0 || (row[month]?.dag14 || 0) > 0)) {
                            return;
                        }
                        row[month] = { 
                            mdr: fillValue, 
                            dag14: 0 
                        };
                    });
                    count++;
                }
            }
        });

        this.storage.saveData(this.currentData);
        this.renderIncomeTable();
        this.renderExpenseTable();
        this.renderSummary();
        this.hideQuickFillModal();
        this.showMessage(currentLanguage === 'da' ? `Udfyldt ${count} rækker med Faktiske × ${multiplier}` : `Filled ${count} rows with Actual × ${multiplier}`);
    }

    isRowEmpty(row) {
        return this.monthNames.every(m => 
            (row[m]?.mdr || 0) === 0 && (row[m]?.dag14 || 0) === 0
        );
    }

    // Budget vs Actual comparison
    applyBudgetVsActualColors() {
        const rows = document.querySelectorAll('.budget-row');
        rows.forEach(row => {
            const faktiskeInput = row.querySelector('input[data-field="faktiske"]');
            if (!faktiskeInput) return;
            
            const faktiske = parseFloat(faktiskeInput.value) || 0;
            
            // Compare each month to faktiske
            this.monthNames.forEach(month => {
                const mdrInput = row.querySelector(`input[data-field="${month}.mdr"]`);
                const dag14Input = row.querySelector(`input[data-field="${month}.dag14"]`);
                
                if (mdrInput && dag14Input) {
                    const monthTotal = (parseFloat(mdrInput.value) || 0) + (parseFloat(dag14Input.value) || 0);
                    
                    if (faktiske > 0 && monthTotal > 0) {
                        const diff = monthTotal - faktiske;
                        const percentDiff = (diff / faktiske) * 100;
                        
                        // Remove existing classes
                        mdrInput.parentElement.classList.remove('budget-cell-under', 'budget-cell-over', 'budget-cell-warning');
                        dag14Input.parentElement.classList.remove('budget-cell-under', 'budget-cell-over', 'budget-cell-warning');
                        
                        if (percentDiff < -5) {
                            // Budgeted less than actual - Green (good, under budget)
                            mdrInput.parentElement.classList.add('budget-cell-under');
                            dag14Input.parentElement.classList.add('budget-cell-under');
                        } else if (percentDiff > 5) {
                            // Budgeted more than actual - Red (over budget)
                            mdrInput.parentElement.classList.add('budget-cell-over');
                            dag14Input.parentElement.classList.add('budget-cell-over');
                        } else if (Math.abs(percentDiff) > 2) {
                            // Close but not exact - Yellow warning
                            mdrInput.parentElement.classList.add('budget-cell-warning');
                            dag14Input.parentElement.classList.add('budget-cell-warning');
                        }
                    }
                }
            });
        });
    }

    // ===================================================================
    // Account-Based Calculations for Transfer Recommendations
    // ===================================================================
    calculateAccountTotals(month = null) {
        const result = {
            budget: { income: 0, expenses: 0 }
        };

        // Calculate income per account
        this.currentData.income.forEach(row => {
            if (row.isCategory) return;
            const account = 'budget';
            
            // Only include faktiske if we're calculating for a SPECIFIC month (not yearly totals)
            // The faktiske column is actual data for comparison, not part of yearly budget
            if (month === 'faktiske') {
                const faktiskeValue = parseFloat(row.faktiske) || 0;
                result[account].income += faktiskeValue;
            } else if (month) {
                // Single month calculation
                const total = (parseFloat(row[month]?.mdr) || 0) + (parseFloat(row[month]?.dag14) || 0);
                result[account].income += total;
            } else {
                // All months - only sum the 12 month columns, NOT faktiske
                this.monthNames.forEach(m => {
                    const total = (parseFloat(row[m]?.mdr) || 0) + (parseFloat(row[m]?.dag14) || 0);
                    result[account].income += total;
                });
            }
        });

        // Calculate expenses per account
        this.currentData.expenses.forEach(row => {
            if (row.isCategory) return;
            const account = 'budget';
            
            // Only include faktiske if we're calculating for a SPECIFIC month (not yearly totals)
            if (month === 'faktiske') {
                const faktiskeValue = parseFloat(row.faktiske) || 0;
                result[account].expenses += faktiskeValue;
            } else if (month) {
                // Single month calculation
                const total = (parseFloat(row[month]?.mdr) || 0) + (parseFloat(row[month]?.dag14) || 0);
                result[account].expenses += total;
            } else {
                // All months - only sum the 12 month columns, NOT faktiske
                this.monthNames.forEach(m => {
                    const total = (parseFloat(row[m]?.mdr) || 0) + (parseFloat(row[m]?.dag14) || 0);
                    result[account].expenses += total;
                });
            }
        });

        return result;
    }

    calculateTransferRecommendation(month = null) {
        const accountTotals = this.calculateAccountTotals(month);
        
        // Base required amount = Budget account expenses
        let baseRequired = accountTotals.budget.expenses;
        
        // Apply expense splitting if enabled (e.g., split with partner)
        let yourShare = baseRequired;
        if (this.expenseSplitEnabled) {
            yourShare = baseRequired * this.expenseSplitRatio;
        }
        
        // Apply safety buffer if enabled
        let withBuffer = yourShare;
        if (this.safetyBufferEnabled) {
            const bufferAmount = yourShare * (this.safetyBufferPercent / 100);
            withBuffer = yourShare + bufferAmount;
        }
        
        // Advised amount = Required + 90th percentile variance (historical data)
        const advisedVariance = this.storage.calculate90thPercentileVariance('budget');
        const advised = advisedVariance !== null ? baseRequired + Math.abs(advisedVariance) : null;
        
        // Net balance = Budget income - Budget expenses
        const budgetNet = accountTotals.budget.income - accountTotals.budget.expenses;
        
        return {
            required: yourShare, // Your share after splitting
            baseRequired: baseRequired, // Total expenses before splitting
            withBuffer: withBuffer, // Your share + safety buffer
            bufferAmount: withBuffer - yourShare, // The buffer amount added
            advised: advised, // Historical-based recommendation
            remaining: budgetNet,
            hasHistoricalData: advisedVariance !== null,
            accountTotals: accountTotals,
            // Settings used
            splitEnabled: this.expenseSplitEnabled,
            splitRatio: this.expenseSplitRatio,
            bufferEnabled: this.safetyBufferEnabled,
            bufferPercent: this.safetyBufferPercent
        };
    }
}


// Note: Budget Editor is now initialized by script.js in the main DOMContentLoaded handler
// to ensure proper load order with other dashboard components
