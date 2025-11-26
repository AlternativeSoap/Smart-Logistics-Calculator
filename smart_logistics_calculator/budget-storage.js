// ===================================================================
// Budget Storage Manager - Excel-like Home Budget
// Simple monthly tracking with actual amounts and planned payments
// ===================================================================

class BudgetStorage {
    constructor() {
        this.storageKey = 'homeBudgetData';
        this.historyKey = 'homeBudgetHistory';
        this.varianceKey = 'homeBudgetVariance';
        this.maxHistorySize = 20;
        this.autoSaveDelay = 500;
        this.autoSaveTimer = null;
        this.data = this.loadData();
        this.history = [];
        this.historyIndex = -1;
        this.varianceData = this.loadVarianceData();
    }

    // ===================================================================
    // Data Structure - Excel-like Monthly View
    // Each row: { name, type, faktiske, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec }
    // Each month value: { mdr: 0, dag14: 0 }
    // ===================================================================
    getDefaultData() {
        const currentYear = new Date().getFullYear();
        return {
            year: currentYear,
            currency: 'kr.',
            income: [
                { 
                    name: '', 
                    account: 'daily',
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
                }
            ],
            expenses: [
                { 
                    name: '', 
                    account: 'daily',
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
                }
            ],
            metadata: {
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString()
            }
        };
    }

    // ===================================================================
    // Load & Save
    // ===================================================================
    loadData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (!stored) {
                return this.getDefaultData();
            }
            
            const parsed = JSON.parse(stored);
            // Validate structure
            if (!parsed.income || !parsed.expenses) {
                console.warn('Invalid budget data structure, using defaults');
                return this.getDefaultData();
            }
            
            return parsed;
        } catch (error) {
            console.error('Error loading budget data:', error);
            return this.getDefaultData();
        }
    }

    saveData(data = this.data, skipHistory = false) {
        try {
            // Update metadata
            data.metadata = data.metadata || {};
            data.metadata.lastModified = new Date().toISOString();
            
            // Save to localStorage
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            this.data = data;
            
            // Add to history for undo/redo
            if (!skipHistory) {
                this.addToHistory(data);
            }
            
            this.showSaveIndicator(true);
            return true;
        } catch (error) {
            console.error('Error saving budget data:', error);
            this.showSaveIndicator(false);
            return false;
        }
    }

    autoSave(data) {
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setTimeout(() => {
            this.saveData(data);
        }, this.autoSaveDelay);
    }

    // ===================================================================
    // Undo/Redo System
    // ===================================================================
    addToHistory(data) {
        // Remove any future history if we're not at the end
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        // Add new state
        this.history.push(JSON.parse(JSON.stringify(data)));
        
        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
        
        this.saveHistory();
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const previousState = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
            this.saveData(previousState, true);
            return previousState;
        }
        return null;
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const nextState = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
            this.saveData(nextState, true);
            return nextState;
        }
        return null;
    }

    canUndo() {
        return this.historyIndex > 0;
    }

    canRedo() {
        return this.historyIndex < this.history.length - 1;
    }

    loadHistory() {
        try {
            const stored = localStorage.getItem(this.historyKey);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading history:', error);
        }
        return [];
    }

    saveHistory() {
        try {
            localStorage.setItem(this.historyKey, JSON.stringify(this.history));
        } catch (error) {
            console.error('Error saving history:', error);
        }
    }

    // ===================================================================
    // Save Indicator
    // ===================================================================
    showSaveIndicator(success) {
        if (!this.saveIndicator) {
            this.saveIndicator = document.getElementById('budget-save-indicator');
        }
        
        if (this.saveIndicator) {
            if (success) {
                this.saveIndicator.innerHTML = '✓'; // Checkmark
                this.saveIndicator.style.color = '#22c55e';
            } else {
                this.saveIndicator.innerHTML = '✗'; // X mark
                this.saveIndicator.style.color = '#ef4444';
            }
            
            // Animate in with scale
            this.saveIndicator.style.opacity = '1';
            this.saveIndicator.style.transform = 'scale(1)';
            
            setTimeout(() => {
                if (this.saveIndicator) {
                    this.saveIndicator.style.opacity = '0';
                    this.saveIndicator.style.transform = 'scale(0.8)';
                }
            }, 1500);
        }
    }

    // ===================================================================
    // Helper Methods
    // ===================================================================
    getData() {
        return this.data;
    }

    getYear() {
        return this.data.year || new Date().getFullYear();
    }

    setYear(year) {
        this.data.year = year;
        this.saveData(this.data);
    }

    addIncomeRow() {
        const newRow = {
            name: '',
            account: 'daily',
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
        this.data.income.push(newRow);
        this.autoSave(this.data);
        return newRow;
    }

    addExpenseRow() {
        const newRow = {
            name: '',
            account: 'daily',
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
        this.data.expenses.push(newRow);
        this.autoSave(this.data);
        return newRow;
    }

    deleteRow(type, index) {
        if (type === 'income' && this.data.income[index]) {
            this.data.income.splice(index, 1);
            this.autoSave(this.data);
            return true;
        } else if (type === 'expense' && this.data.expenses[index]) {
            this.data.expenses.splice(index, 1);
            this.autoSave(this.data);
            return true;
        }
        return false;
    }

    updateCell(type, rowIndex, field, value) {
        const row = type === 'income' ? this.data.income[rowIndex] : this.data.expenses[rowIndex];
        if (!row) return false;
        
        row[field] = value;
        this.autoSave(this.data);
        return true;
    }

    clearAll() {
        this.data = this.getDefaultData();
        this.history = [];
        this.historyIndex = -1;
        this.saveData(this.data);
        return this.data;
    }

    exportData() {
        return JSON.parse(JSON.stringify(this.data));
    }

    importData(data) {
        if (data && data.income && data.expenses) {
            this.data = data;
            this.saveData(this.data);
            return true;
        }
        return false;
    }

    // ===================================================================
    // Historical Variance Tracking for Advised Amounts
    // ===================================================================
    loadVarianceData() {
        try {
            const stored = localStorage.getItem(this.varianceKey);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading variance data:', error);
        }
        return {
            years: {} // Format: { 2025: { jan: { income: [...], expenses: [...] }, feb: {...}, ... } }
        };
    }

    saveVarianceData() {
        try {
            localStorage.setItem(this.varianceKey, JSON.stringify(this.varianceData));
        } catch (error) {
            console.error('Error saving variance data:', error);
        }
    }

    recordVariance(year, month) {
        // Record variance for each item: actual - budgeted
        if (!this.varianceData.years[year]) {
            this.varianceData.years[year] = {};
        }
        if (!this.varianceData.years[year][month]) {
            this.varianceData.years[year][month] = { income: [], expenses: [] };
        }

        const monthData = this.varianceData.years[year][month];
        
        // Record income variances
        monthData.income = this.data.income.map(row => {
            if (row.isCategory) return null;
            const budgeted = (row[month]?.mdr || 0) + (row[month]?.dag14 || 0);
            const actual = row.faktiske || 0;
            return {
                name: row.name,
                account: row.account,
                budgeted: budgeted,
                actual: actual,
                variance: actual - budgeted,
                timestamp: new Date().toISOString()
            };
        }).filter(v => v !== null);

        // Record expense variances
        monthData.expenses = this.data.expenses.map(row => {
            if (row.isCategory) return null;
            const budgeted = (row[month]?.mdr || 0) + (row[month]?.dag14 || 0);
            const actual = row.faktiske || 0;
            return {
                name: row.name,
                account: row.account,
                budgeted: budgeted,
                actual: actual,
                variance: actual - budgeted,
                timestamp: new Date().toISOString()
            };
        }).filter(v => v !== null);

        this.saveVarianceData();
    }

    getHistoricalVariances(account = null, limit = 12) {
        // Get last N months of variance data
        const variances = [];
        const years = Object.keys(this.varianceData.years).sort().reverse();
        const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        
        for (const year of years) {
            for (const month of monthNames.reverse()) {
                if (variances.length >= limit) break;
                
                const monthData = this.varianceData.years[year]?.[month];
                if (!monthData) continue;

                // Calculate total variance for this month
                let totalVariance = 0;
                
                [...monthData.income, ...monthData.expenses].forEach(item => {
                    if (account === null || item.account === account) {
                        totalVariance += item.variance;
                    }
                });

                variances.push({
                    year: year,
                    month: month,
                    variance: totalVariance
                });
            }
            if (variances.length >= limit) break;
        }

        return variances;
    }

    calculate90thPercentileVariance(account = null) {
        const variances = this.getHistoricalVariances(account, 12);
        if (variances.length === 0) return null;

        // Extract variance values and sort
        const values = variances.map(v => v.variance).sort((a, b) => a - b);
        
        // Calculate 90th percentile index
        const index = Math.ceil(values.length * 0.9) - 1;
        return values[index];
    }

    getAdvisedAmount(budgetedAmount, account = null) {
        const variance = this.calculate90thPercentileVariance(account);
        if (variance === null) {
            return null; // No historical data
        }
        return budgetedAmount + Math.abs(variance);
    }
}

