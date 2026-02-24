// ========================================
// ABC & EOQ Dashboard - Main JavaScript
// ========================================

// Global Variables
let uploadedData = [];
let abcResults = [];
let currentChart = null;
let currentLanguage = 'da';
let currentTheme = 'light';
let educationMode = false;
let visibleColumns = []; // Track which columns to display
let allColumnNames = [];
let originalColumnNames = { consumption: '', price: '' };

// ========================================
// IMPORT PREVIEW MODULE
// ========================================
const ImportPreview = {
    // State
    rawData: [],
    previewData: [],
    columnInfo: [],
    columnMappings: {},
    currentStep: 1,
    currentPage: 1,
    rowsPerPage: 50,
    editedCells: new Set(),
    skippedRows: new Set(),
    originalData: [],
    fileName: '',
    
    // Open the import preview modal
    open(data, fileName) {
        this.rawData = data;
        this.originalData = JSON.parse(JSON.stringify(data));
        this.previewData = JSON.parse(JSON.stringify(data));
        this.fileName = fileName;
        this.currentStep = 1;
        this.currentPage = 1;
        this.editedCells.clear();
        this.skippedRows.clear();
        this.columnMappings = {};
        
        // Analyze columns
        this.analyzeColumns();
        
        // Show modal
        document.getElementById('importPreviewModal').classList.remove('hidden');
        document.getElementById('importPreviewFileName').textContent = fileName;
        
        // Render step 1
        this.renderStep1();
        this.updateStepIndicators();
        this.updateButtons();
    },
    
    // Analyze column types and detect issues
    analyzeColumns() {
        if (!this.rawData || this.rawData.length === 0) return;
        
        const firstRow = this.rawData[0];
        const columns = Object.keys(firstRow);
        
        this.columnInfo = columns.map(colName => {
            const values = this.rawData.map(row => row[colName]);
            const analysis = this.analyzeColumnValues(values, colName);
            
            return {
                name: colName,
                ...analysis,
                mapping: this.autoDetectMapping(colName)
            };
        });
        
        document.getElementById('detectedColumnCount').textContent = this.columnInfo.length;
    },
    
    // Analyze values in a column
    analyzeColumnValues(values, colName) {
        let numberCount = 0;
        let textCount = 0;
        let emptyCount = 0;
        let issues = [];
        const sampleValues = [];
        
        values.forEach((val, idx) => {
            if (val === null || val === undefined || val === '') {
                emptyCount++;
                if (emptyCount <= 3) {
                    issues.push({ row: idx + 1, type: 'empty', message: 'Empty value' });
                }
            } else if (typeof val === 'number' || (!isNaN(parseFloat(val)) && isFinite(val))) {
                numberCount++;
                if (sampleValues.length < 3) sampleValues.push(val);
            } else {
                textCount++;
                if (sampleValues.length < 3) sampleValues.push(val);
                
                // Check if this looks like a number but is text
                const cleaned = String(val).replace(/[,.\s]/g, '');
                if (!isNaN(parseFloat(cleaned)) && numberCount > textCount) {
                    issues.push({ row: idx + 1, type: 'format', message: `"${val}" looks like a number but is text` });
                }
            }
        });
        
        // Determine primary type
        let detectedType = 'mixed';
        if (numberCount > 0 && textCount === 0) {
            detectedType = 'number';
        } else if (textCount > 0 && numberCount === 0) {
            detectedType = 'text';
        } else if (numberCount > textCount * 2) {
            detectedType = 'number';
            // Add issues for text values in a number column
            values.forEach((val, idx) => {
                if (val !== null && val !== undefined && val !== '' && 
                    typeof val !== 'number' && isNaN(parseFloat(val))) {
                    issues.push({ row: idx + 1, type: 'type-mismatch', message: `"${val}" is text in a number column` });
                }
            });
        } else if (textCount > numberCount * 2) {
            detectedType = 'text';
        }
        
        // Limit issues shown
        if (issues.length > 5) {
            const moreCount = issues.length - 5;
            issues = issues.slice(0, 5);
            issues.push({ row: null, type: 'info', message: `...and ${moreCount} more issues` });
        }
        
        return {
            detectedType,
            numberCount,
            textCount,
            emptyCount,
            totalCount: values.length,
            sampleValues,
            issues
        };
    },
    
    // Auto-detect column mapping based on name
    autoDetectMapping(colName) {
        const normalized = colName.toLowerCase().trim();
        
        if (normalized.includes('vare') || normalized.includes('item') || 
            normalized.includes('name') || normalized.includes('produkt') || normalized.includes('navn')) {
            return 'name';
        }
        if (normalized.includes('forbrug') || normalized.includes('consumption') || 
            normalized.includes('demand') || normalized.includes('årsforbrug') || normalized.includes('antal')) {
            return 'consumption';
        }
        if (normalized.includes('pris') || normalized.includes('price') || 
            normalized.includes('stykpris') || normalized.includes('kostpris')) {
            return 'price';
        }
        if (normalized.includes('ordre') && normalized.includes('omk')) {
            return 'orderCost';
        }
        if (normalized.includes('rente') || normalized.includes('interest')) {
            return 'interestRate';
        }
        
        return 'extra'; // Keep as additional data
    },
    
    // Render Step 1: Column Mapping
    renderStep1() {
        const tbody = document.getElementById('columnMappingBody');
        
        tbody.innerHTML = this.columnInfo.map((col, idx) => {
            // Store original detected type if not already stored
            if (!col.originalDetectedType) {
                col.originalDetectedType = col.detectedType;
            }
            
            // Use user-selected type or fall back to detected type
            const currentType = col.userSelectedType || col.detectedType;
            
            const typeColors = {
                'number': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
                'text': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
                'mixed': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
            };
            
            const issueCount = col.issues.length;
            const issueColor = issueCount === 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400';
            
            // Show indicator if type was manually changed
            const typeChanged = col.userSelectedType && col.userSelectedType !== col.originalDetectedType;
            const typeChangeIndicator = typeChanged 
                ? `<span class="ml-1 text-xs text-orange-500" title="${currentLanguage === 'da' ? 'Manuelt ændret' : 'Manually changed'}">✎</span>` 
                : '';
            
            return `
                <tr class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td class="p-3 font-medium text-gray-800 dark:text-gray-200">${col.name}</td>
                    <td class="p-3 text-center">
                        <div class="flex items-center justify-center gap-1">
                            <select id="colType_${idx}" onchange="ImportPreview.updateColumnType(${idx}, this.value)" 
                                class="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs font-medium bg-white dark:bg-gray-800 ${typeColors[currentType]}" 
                                style="min-width: 90px;">
                                <option value="number" ${currentType === 'number' ? 'selected' : ''}>🔢 Number</option>
                                <option value="text" ${currentType === 'text' ? 'selected' : ''}>📝 Text</option>
                                <option value="mixed" ${currentType === 'mixed' ? 'selected' : ''}>🔀 Mixed</option>
                            </select>
                            ${typeChangeIndicator}
                        </div>
                        <div class="text-xs text-gray-400 mt-1">Auto: ${col.originalDetectedType}</div>
                    </td>
                    <td class="p-3 text-center text-sm text-gray-600 dark:text-gray-400">
                        ${col.sampleValues.slice(0, 2).map(v => `<span class="bg-gray-100 dark:bg-gray-700 px-1 rounded">${v}</span>`).join(', ')}
                    </td>
                    <td class="p-3 text-center">
                        <span class="${issueColor} font-medium">${issueCount === 0 ? '✓ OK' : `⚠️ ${issueCount}`}</span>
                    </td>
                    <td class="p-3 text-center">
                        <select id="colMap_${idx}" onchange="ImportPreview.updateMapping(${idx}, this.value)" 
                            class="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                            <option value="name" ${col.mapping === 'name' ? 'selected' : ''}>📝 Name (required)</option>
                            <option value="consumption" ${col.mapping === 'consumption' ? 'selected' : ''}>📦 Consumption (required)</option>
                            <option value="price" ${col.mapping === 'price' ? 'selected' : ''}>💰 Price (required)</option>
                            <option value="orderCost" ${col.mapping === 'orderCost' ? 'selected' : ''}>📋 Order Cost</option>
                            <option value="interestRate" ${col.mapping === 'interestRate' ? 'selected' : ''}>📈 Interest Rate</option>
                            <option value="extra" ${col.mapping === 'extra' ? 'selected' : ''}>➕ Extra Data</option>
                            <option value="ignore" ${col.mapping === 'ignore' ? 'selected' : ''}>🚫 Ignore</option>
                        </select>
                    </td>
                </tr>
            `;
        }).join('');
        
        this.updateRequiredFieldsStatus();
    },
    
    // Update column type (user override)
    updateColumnType(idx, newType) {
        this.columnInfo[idx].userSelectedType = newType;
        this.columnInfo[idx].detectedType = newType;
        
        // Re-analyze issues based on new type
        this.reanalyzeColumnIssues(idx);
        
        // Re-render to update styling
        this.renderStep1();
        
        showToast(currentLanguage === 'da' 
            ? `Kolonne "${this.columnInfo[idx].name}" sat til ${newType}` 
            : `Column "${this.columnInfo[idx].name}" set to ${newType}`, 'info');
    },
    
    // Re-analyze column issues after type change
    reanalyzeColumnIssues(idx) {
        const col = this.columnInfo[idx];
        const values = this.previewData.map(row => row[col.name]);
        const newType = col.userSelectedType || col.detectedType;
        
        let issues = [];
        
        values.forEach((val, rowIdx) => {
            if (val === null || val === undefined || val === '') {
                if (issues.filter(i => i.type === 'empty').length < 3) {
                    issues.push({ row: rowIdx + 1, type: 'empty', message: 'Empty value' });
                }
            } else if (newType === 'number') {
                // Check if value can be converted to number
                const numVal = typeof val === 'number' ? val : parseFloat(String(val).replace(/[,\s]/g, '.').replace(/[^\d.\-]/g, ''));
                if (isNaN(numVal)) {
                    issues.push({ row: rowIdx + 1, type: 'type-mismatch', message: `"${val}" cannot be converted to number` });
                }
            }
            // Text type accepts everything, so no type-mismatch issues
        });
        
        // Limit issues shown
        if (issues.length > 5) {
            const moreCount = issues.length - 5;
            issues = issues.slice(0, 5);
            issues.push({ row: null, type: 'info', message: `...and ${moreCount} more issues` });
        }
        
        col.issues = issues;
    },
    
    // Update column mapping
    updateMapping(idx, value) {
        this.columnInfo[idx].mapping = value;
        this.updateRequiredFieldsStatus();
    },
    
    // Check if required fields are mapped
    updateRequiredFieldsStatus() {
        const required = ['name', 'consumption', 'price'];
        const mapped = {};
        
        this.columnInfo.forEach(col => {
            if (required.includes(col.mapping)) {
                mapped[col.mapping] = col.name;
            }
        });
        
        const statusDiv = document.getElementById('requiredFieldsStatus');
        const allMapped = required.every(r => mapped[r]);
        
        if (allMapped) {
            statusDiv.className = 'mt-4 p-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800';
            statusDiv.innerHTML = `
                <div class="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <span class="text-xl">✅</span>
                    <span class="font-medium">${currentLanguage === 'da' ? 'Alle påkrævede felter tildelt!' : 'All required fields mapped!'}</span>
                </div>
                <div class="mt-2 text-sm text-green-600 dark:text-green-400">
                    <span class="font-medium">${currentLanguage === 'da' ? 'Varenavn:' : 'Name:'}</span> ${mapped.name} • 
                    <span class="font-medium">${currentLanguage === 'da' ? 'Forbrug:' : 'Consumption:'}</span> ${mapped.consumption} • 
                    <span class="font-medium">${currentLanguage === 'da' ? 'Pris:' : 'Price:'}</span> ${mapped.price}
                </div>
            `;
        } else {
            const missing = required.filter(r => !mapped[r]);
            statusDiv.className = 'mt-4 p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800';
            statusDiv.innerHTML = `
                <div class="flex items-center gap-2 text-red-700 dark:text-red-300">
                    <span class="text-xl">⚠️</span>
                    <span class="font-medium">${currentLanguage === 'da' ? `Manglende påkrævede felter: ${missing.join(', ')}` : `Missing required fields: ${missing.join(', ')}`}</span>
                </div>
                <p class="mt-1 text-sm text-red-600 dark:text-red-400">
                    ${currentLanguage === 'da' ? 'Tildel venligst kolonner til alle påkrævede felter før du fortsætter.' : 'Please assign columns to all required fields before continuing.'}
                </p>
            `;
        }
        
        // Store mappings
        this.columnMappings = mapped;
    },
    
    // Render Step 2: Data Validation
    renderStep2() {
        const allIssues = [];
        
        this.columnInfo.forEach(col => {
            col.issues.forEach(issue => {
                if (issue.row !== null) {
                    allIssues.push({
                        column: col.name,
                        ...issue
                    });
                }
            });
        });
        
        // Check for rows with missing required data
        const requiredCols = this.columnInfo.filter(c => ['name', 'consumption', 'price'].includes(c.mapping));
        this.previewData.forEach((row, idx) => {
            requiredCols.forEach(col => {
                const val = row[col.name];
                if (val === null || val === undefined || val === '') {
                    allIssues.push({
                        row: idx + 1,
                        column: col.name,
                        type: 'missing-required',
                        message: `Missing required value for ${col.mapping}`
                    });
                }
            });
        });
        
        const issuesContainer = document.getElementById('validationIssues');
        const summaryEl = document.getElementById('validationSummary');
        
        if (allIssues.length === 0) {
            summaryEl.innerHTML = currentLanguage === 'da' ? '✅ <strong>Ingen problemer fundet!</strong> Dine data ser rene ud og er klar til import.' : '✅ <strong>No issues found!</strong> Your data looks clean and ready to import.';
            summaryEl.parentElement.className = 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4';
            issuesContainer.innerHTML = '';
        } else {
            summaryEl.innerHTML = currentLanguage === 'da' ? `Fundet <strong>${allIssues.length}</strong> problemer i dine data. Du kan rette dem manuelt eller bruge hurtighandlingerne nedenfor.` : `Found <strong>${allIssues.length}</strong> issues in your data. You can fix them manually or use the quick actions below.`;
            
            // Group issues by type
            const grouped = {};
            allIssues.forEach(issue => {
                if (!grouped[issue.type]) grouped[issue.type] = [];
                grouped[issue.type].push(issue);
            });
            
            issuesContainer.innerHTML = Object.entries(grouped).map(([type, issues]) => {
                const typeLabels = {
                    'empty': currentLanguage === 'da' ? '📭 Tomme værdier' : '📭 Empty Values',
                    'type-mismatch': currentLanguage === 'da' ? '🔄 Type uoverensstemmelser' : '🔄 Type Mismatches',
                    'format': currentLanguage === 'da' ? '📝 Formatproblemer' : '📝 Format Issues',
                    'missing-required': currentLanguage === 'da' ? '❗ Manglende påkrævede data' : '❗ Missing Required Data'
                };
                
                return `
                    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                        <div class="flex items-center justify-between mb-2">
                            <h5 class="font-medium text-gray-800 dark:text-gray-200">${typeLabels[type] || type}</h5>
                            <span class="text-sm text-gray-500">${issues.length} issues</span>
                        </div>
                        <ul class="space-y-1 text-sm text-gray-600 dark:text-gray-400 max-h-32 overflow-auto">
                            ${issues.slice(0, 10).map(i => `
                                <li class="flex items-center gap-2">
                                    <span class="text-gray-400">Row ${i.row}:</span>
                                    <span class="font-medium">${i.column}</span> - ${i.message}
                                </li>
                            `).join('')}
                            ${issues.length > 10 ? `<li class="text-gray-400">...and ${issues.length - 10} more</li>` : ''}
                        </ul>
                    </div>
                `;
            }).join('');
        }
    },
    
    // Render Step 3: Preview & Edit
    renderStep3() {
        this.renderEditableTable();
        this.updatePreviewStats();
    },
    
    // Render editable preview table
    renderEditableTable() {
        const thead = document.getElementById('editablePreviewHead');
        const tbody = document.getElementById('editablePreviewBody');
        
        // Get columns to show (not ignored)
        const visibleCols = this.columnInfo.filter(c => c.mapping !== 'ignore');
        
        // Header
        thead.innerHTML = `
            <th class="p-2 text-center text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">#</th>
            <th class="p-2 text-center text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Status</th>
            ${visibleCols.map(col => `
                <th class="p-2 text-left text-gray-700 dark:text-gray-300 font-medium border-b border-gray-200 dark:border-gray-700">
                    ${col.name}
                    <span class="text-xs text-gray-400 block">${col.mapping}</span>
                </th>
            `).join('')}
            <th class="p-2 text-center text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Actions</th>
        `;
        
        // Paginate data
        const start = (this.currentPage - 1) * this.rowsPerPage;
        const end = start + this.rowsPerPage;
        let dataToShow = this.previewData;
        
        // Filter if showing only issues
        const showOnlyIssues = document.getElementById('showOnlyIssues')?.checked;
        if (showOnlyIssues) {
            dataToShow = this.previewData.filter((row, idx) => this.hasIssues(idx));
        }
        
        const pageData = dataToShow.slice(start, end);
        
        // Body
        tbody.innerHTML = pageData.map((row, pageIdx) => {
            const globalIdx = showOnlyIssues 
                ? this.previewData.indexOf(row) 
                : start + pageIdx;
            
            const isSkipped = this.skippedRows.has(globalIdx);
            const hasIssue = this.hasIssues(globalIdx);
            const rowClass = isSkipped 
                ? 'bg-gray-100 dark:bg-gray-700 opacity-50' 
                : hasIssue 
                    ? 'bg-red-50 dark:bg-red-900/20' 
                    : '';
            
            return `
                <tr class="${rowClass} hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" data-row="${globalIdx}">
                    <td class="p-2 text-center text-gray-500 dark:text-gray-400 text-sm border-b border-gray-100 dark:border-gray-700">${globalIdx + 1}</td>
                    <td class="p-2 text-center border-b border-gray-100 dark:border-gray-700">
                        ${isSkipped ? '<span class="text-gray-400">⏭️</span>' : hasIssue ? '<span class="text-red-500">⚠️</span>' : '<span class="text-green-500">✓</span>'}
                    </td>
                    ${visibleCols.map(col => {
                        const val = row[col.name];
                        const cellKey = `${globalIdx}_${col.name}`;
                        const isEdited = this.editedCells.has(cellKey);
                        const cellClass = isEdited ? 'bg-yellow-100 dark:bg-yellow-900/30' : '';
                        
                        return `
                            <td class="p-1 border-b border-gray-100 dark:border-gray-700 ${cellClass}">
                                <input type="text" 
                                    value="${val !== null && val !== undefined ? val : ''}"
                                    data-row="${globalIdx}" 
                                    data-col="${col.name}"
                                    onchange="ImportPreview.cellEdited(${globalIdx}, '${col.name}', this.value)"
                                    class="w-full px-2 py-1 text-sm border border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded bg-transparent dark:text-gray-200 ${isSkipped ? 'line-through' : ''}"
                                    ${isSkipped ? 'disabled' : ''}>
                            </td>
                        `;
                    }).join('')}
                    <td class="p-2 text-center border-b border-gray-100 dark:border-gray-700">
                        ${isSkipped 
                            ? `<button onclick="ImportPreview.unskipRow(${globalIdx})" class="text-xs px-2 py-1 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">Restore</button>`
                            : `<button onclick="ImportPreview.skipRow(${globalIdx})" class="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">Skip</button>`
                        }
                    </td>
                </tr>
            `;
        }).join('');
        
        // Update pagination info
        const totalRows = showOnlyIssues ? dataToShow.length : this.previewData.length;
        document.getElementById('previewShowingFrom').textContent = totalRows > 0 ? start + 1 : 0;
        document.getElementById('previewShowingTo').textContent = Math.min(end, totalRows);
        document.getElementById('previewShowingTotal').textContent = totalRows;
        document.getElementById('previewPageInfo').textContent = currentLanguage === 'da' ? `Side ${this.currentPage} af ${Math.ceil(totalRows / this.rowsPerPage) || 1}` : `Page ${this.currentPage} of ${Math.ceil(totalRows / this.rowsPerPage) || 1}`;
    },
    
    // Check if row has issues
    hasIssues(rowIdx) {
        const row = this.previewData[rowIdx];
        if (!row) return false;
        
        const requiredCols = this.columnInfo.filter(c => ['name', 'consumption', 'price'].includes(c.mapping));
        
        for (const col of requiredCols) {
            const val = row[col.name];
            if (val === null || val === undefined || val === '') return true;
            if (col.mapping !== 'name' && isNaN(parseFloat(val))) return true;
        }
        
        return false;
    },
    
    // Update preview stats
    updatePreviewStats() {
        const total = this.previewData.length;
        const skipped = this.skippedRows.size;
        const valid = this.previewData.filter((_, idx) => !this.skippedRows.has(idx) && !this.hasIssues(idx)).length;
        const issues = this.previewData.filter((_, idx) => !this.skippedRows.has(idx) && this.hasIssues(idx)).length;
        
        document.getElementById('previewTotalRows').textContent = total;
        document.getElementById('previewValidRows').textContent = valid;
        document.getElementById('previewEditedCells').textContent = this.editedCells.size;
        document.getElementById('previewIssueRows').textContent = issues;
    },
    
    // Cell edited
    cellEdited(rowIdx, colName, newValue) {
        const oldValue = this.previewData[rowIdx][colName];
        if (oldValue !== newValue) {
            this.previewData[rowIdx][colName] = newValue;
            this.editedCells.add(`${rowIdx}_${colName}`);
            this.updatePreviewStats();
        }
    },
    
    // Skip row
    skipRow(rowIdx) {
        this.skippedRows.add(rowIdx);
        this.renderEditableTable();
        this.updatePreviewStats();
    },
    
    // Unskip row
    unskipRow(rowIdx) {
        this.skippedRows.delete(rowIdx);
        this.renderEditableTable();
        this.updatePreviewStats();
    },
    
    // Toggle issue filter
    toggleIssueFilter() {
        this.currentPage = 1;
        this.renderEditableTable();
    },
    
    // Auto-fix issues
    autoFixIssues() {
        let fixed = 0;
        
        this.previewData.forEach((row, idx) => {
            this.columnInfo.forEach(col => {
                if (['consumption', 'price'].includes(col.mapping)) {
                    const val = row[col.name];
                    if (val !== null && val !== undefined && val !== '') {
                        // Try to parse as number
                        const cleaned = String(val).replace(/[^\d.,\-]/g, '').replace(',', '.');
                        const num = parseFloat(cleaned);
                        if (!isNaN(num) && row[col.name] !== num) {
                            row[col.name] = num;
                            this.editedCells.add(`${idx}_${col.name}`);
                            fixed++;
                        }
                    }
                }
            });
        });
        
        showToast(currentLanguage === 'da' 
            ? `🔧 ${fixed} værdier rettet automatisk` 
            : `🔧 ${fixed} values auto-fixed`, 'success');
        
        this.renderEditableTable();
        this.updatePreviewStats();
    },
    
    // Skip all invalid rows
    skipInvalidRows() {
        let skipped = 0;
        
        this.previewData.forEach((_, idx) => {
            if (this.hasIssues(idx)) {
                this.skippedRows.add(idx);
                skipped++;
            }
        });
        
        showToast(currentLanguage === 'da' 
            ? `⏭️ ${skipped} rækker sprunget over` 
            : `⏭️ ${skipped} rows skipped`, 'info');
        
        this.renderEditableTable();
        this.updatePreviewStats();
    },
    
    // Reset to original data
    resetToOriginal() {
        this.previewData = JSON.parse(JSON.stringify(this.originalData));
        this.editedCells.clear();
        this.skippedRows.clear();
        
        showToast(currentLanguage === 'da' 
            ? '↩️ Data nulstillet til original' 
            : '↩️ Data reset to original', 'info');
        
        this.renderEditableTable();
        this.updatePreviewStats();
    },
    
    // Pagination
    nextPage() {
        const showOnlyIssues = document.getElementById('showOnlyIssues')?.checked;
        const totalRows = showOnlyIssues 
            ? this.previewData.filter((_, idx) => this.hasIssues(idx)).length 
            : this.previewData.length;
        const maxPage = Math.ceil(totalRows / this.rowsPerPage);
        
        if (this.currentPage < maxPage) {
            this.currentPage++;
            this.renderEditableTable();
        }
    },
    
    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderEditableTable();
        }
    },
    
    // Step navigation
    nextStep() {
        if (this.currentStep === 1) {
            // Validate required fields
            const required = ['name', 'consumption', 'price'];
            const mapped = this.columnInfo.filter(c => required.includes(c.mapping)).map(c => c.mapping);
            const missing = required.filter(r => !mapped.includes(r));
            
            if (missing.length > 0) {
                showToast(currentLanguage === 'da' 
                    ? `⚠️ Mangler påkrævede felter: ${missing.join(', ')}` 
                    : `⚠️ Missing required fields: ${missing.join(', ')}`, 'error');
                return;
            }
        }
        
        if (this.currentStep < 3) {
            this.currentStep++;
            this.updateStepIndicators();
            this.updateButtons();
            
            if (this.currentStep === 2) {
                this.renderStep2();
            } else if (this.currentStep === 3) {
                this.renderStep3();
            }
        }
    },
    
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepIndicators();
            this.updateButtons();
        }
    },
    
    // Update step indicators
    updateStepIndicators() {
        for (let i = 1; i <= 3; i++) {
            const indicator = document.getElementById(`step${i}Indicator`);
            const stepContent = document.getElementById(`importStep${i}`);
            
            if (i === this.currentStep) {
                indicator.className = 'flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500 text-white';
                indicator.querySelector('span:first-child').className = 'w-6 h-6 rounded-full bg-white text-blue-500 flex items-center justify-center text-sm font-bold';
                stepContent.classList.remove('hidden');
            } else if (i < this.currentStep) {
                indicator.className = 'flex items-center gap-2 px-4 py-2 rounded-full bg-green-500 text-white';
                indicator.querySelector('span:first-child').className = 'w-6 h-6 rounded-full bg-white text-green-500 flex items-center justify-center text-sm font-bold';
                stepContent.classList.add('hidden');
            } else {
                indicator.className = 'flex items-center gap-2 px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
                indicator.querySelector('span:first-child').className = 'w-6 h-6 rounded-full bg-gray-400 text-white flex items-center justify-center text-sm font-bold';
                stepContent.classList.add('hidden');
            }
        }
    },
    
    // Update buttons
    updateButtons() {
        const prevBtn = document.getElementById('importPrevBtn');
        const nextBtn = document.getElementById('importNextBtn');
        const confirmBtn = document.getElementById('importConfirmBtn');
        
        if (this.currentStep === 1) {
            prevBtn.classList.add('hidden');
            nextBtn.classList.remove('hidden');
            confirmBtn.classList.add('hidden');
        } else if (this.currentStep === 2) {
            prevBtn.classList.remove('hidden');
            nextBtn.classList.remove('hidden');
            confirmBtn.classList.add('hidden');
        } else {
            prevBtn.classList.remove('hidden');
            nextBtn.classList.add('hidden');
            confirmBtn.classList.remove('hidden');
        }
    },
    
    // Confirm import
    confirmImport() {
        // Filter out skipped rows
        const dataToImport = this.previewData.filter((_, idx) => !this.skippedRows.has(idx));
        
        if (dataToImport.length === 0) {
            showToast(currentLanguage === 'da' 
                ? '⚠️ Ingen data at importere' 
                : '⚠️ No data to import', 'error');
            return;
        }
        
        // Build mapping
        const mapping = {};
        this.columnInfo.forEach(col => {
            if (col.mapping !== 'ignore' && col.mapping !== 'extra') {
                mapping[col.mapping] = col.name;
            }
        });
        
        // Transform data according to mappings
        const transformedData = dataToImport.map(row => {
            const transformed = { _original: row };
            
            if (mapping.name) transformed.name = row[mapping.name];
            if (mapping.consumption) transformed.consumption = parseFloat(row[mapping.consumption]) || 0;
            if (mapping.price) transformed.price = parseFloat(row[mapping.price]) || 0;
            if (mapping.orderCost) transformed.orderCost = parseFloat(row[mapping.orderCost]) || 0;
            if (mapping.interestRate) transformed.interestRate = parseFloat(row[mapping.interestRate]) || 0;
            
            return transformed;
        }).filter(row => row.name && row.consumption && row.price);
        
        if (transformedData.length === 0) {
            showToast(currentLanguage === 'da' 
                ? '⚠️ Ingen gyldige rækker efter transformation' 
                : '⚠️ No valid rows after transformation', 'error');
            return;
        }
        
        // Close modal
        closeImportPreview();
        
        // Store original column names
        originalColumnNames = {
            name: mapping.name || 'Item Name',
            consumption: mapping.consumption || 'Consumption',
            price: mapping.price || 'Price',
            nameSet: true,
            consumptionSet: true,
            priceSet: true
        };
        
        // Store all column names
        allColumnNames = Object.keys(dataToImport[0] || {});
        
        // Set global data
        uploadedData = transformedData;
        
        console.log(`✅ Imported ${transformedData.length} rows via Import Preview`);
        console.log('📋 Column mappings:', mapping);
        
        showToast(currentLanguage === 'da' 
            ? `✅ ${transformedData.length} rækker importeret!` 
            : `✅ ${transformedData.length} rows imported!`, 'success');
        
        // Show file info
        const fileInfoDiv = document.getElementById('fileInfo');
        const fileNameSpan = document.getElementById('fileName');
        const fileRowsSpan = document.getElementById('fileRows');
        const processBtn = document.getElementById('processBtn');
        
        if (fileInfoDiv) fileInfoDiv.classList.remove('hidden');
        if (fileNameSpan) fileNameSpan.textContent = this.fileName;
        if (fileRowsSpan) fileRowsSpan.textContent = transformedData.length;
        if (processBtn) processBtn.disabled = false;
        
        // Minimize upload section
        minimizeUploadSection();
        
        // Initialize column visibility
        initializeColumnVisibility();
        
        // Display preview
        displayPreview();
    }
};

// Close import preview modal
function closeImportPreview() {
    document.getElementById('importPreviewModal').classList.add('hidden');
}

// Quick Actions Default Configuration
const defaultQuickActions = [
    { id: 'new-abc', icon: '📊', title: 'new-abc-analysis', desc: 'new-abc-desc', action: "switchTab('abc', this)", color: 'blue', enabled: true },
    { id: 'view-data', icon: '👁️', title: 'view-data', desc: 'view-data-desc', action: "viewUploadedData()", color: 'indigo', enabled: true },
    { id: 'export-csv', icon: '📥', title: 'export-csv', desc: 'export-csv-desc', action: "downloadResultsCSV()", color: 'emerald', enabled: true },
    { id: 'export-excel', icon: '📊', title: 'export-excel', desc: 'export-excel-desc', action: "exportToExcel()", color: 'teal', enabled: true },
    { id: 'compare', icon: '📈', title: 'compare-data', desc: 'compare-data-desc', action: "switchTab('compare', this)", color: 'purple', enabled: true },
    { id: 'print', icon: '🖨️', title: 'print-report', desc: 'print-report-desc', action: "openPrintMenu()", color: 'pink', enabled: true }
];

// Translations Object
const translations = {
    da: {
        'abc-tab': 'ABC-analyse',
        'wilson-tab': 'Wilson-beregning',
        'inventory-tab': 'Lagerstyring',
        'settings-tab': 'Indstillinger',
        'abc-title': 'ABC-analyse',
        'upload-label': 'Upload datafil (CSV eller Excel)',
        'process-btn': 'Analyser Data',
        'upload-hint': 'Understøtter CSV og Excel filer. Kolonner detekteres automatisk - vælg derefter hvilke kolonner der skal bruges til analyse.',
        'preview-title': 'Data Preview',
        'results-title': 'ABC-analyse Resultater',
        'download-btn': '📥 Download CSV',
        'chart-type': 'Vælg graftype:',
        'pareto-option': 'Pareto-diagram',
        'pie-option': 'Pie Chart',
        'wilson-title': 'Wilson-formel (EOQ) Beregning',
        'demand-label': 'D - Årligt forbrug',
        'order-cost-label': 'S - Ordreomkostning',
        'holding-cost-label': 'H - Lageromkostning/år',
        'calculate-btn': '🧮 Beregn EOQ',
        'eoq-label': 'Optimal ordremængde (Q*)',
        'orders-per-year-label': 'Ordrer pr. år',
        'holding-total-label': 'Lageromkostning',
        'order-total-label': 'Ordreomkostning',
        'total-cost-label': 'Totalomkostning',
        'settings-title': 'Indstillinger',
        'theme-setting': 'Tema',
        'theme-description': 'Vælg mellem lys og mørk tilstand',
        'light-theme': 'Lys',
        'dark-theme': 'Mørk',
        'language-setting': 'Sprog',
        'language-description': 'Skift applikationens sprog',
        'chart-setting': 'Standard graftype',
        'chart-description': 'Vælg standardgraf for ABC-analyse',
        'footer-text': 'Alt kører lokalt i din browser',
        'reset': 'Reset App',
        'item-name': 'Varenavn',
        'consumption': 'Forbrug',
        'price': 'Pris',
        'value': 'Værdi',
        'cumulative': 'Kumulativ %',
        'group': 'Gruppe',
        'pareto-title': 'ABC-analyse: Pareto-diagram',
        'pie-title': 'ABC-analyse: Fordeling pr. gruppe',
        'wilson-chart-title': 'Wilson EOQ Omkostningsanalyse',
        'quantity': 'Ordremængde (Q)',
        'cost': 'Omkostning',
        'holding-cost': 'Lageromkostning',
        'order-cost': 'Ordreomkostning',
        'total-cost-line': 'Totalomkostning',
        'optimal-point': 'Optimalt punkt (EOQ)',
        'dashboard-tab': 'Dashboard',
        'barcode-tab': 'Stregkoder & QR',
        'abc-subtab-analysis': 'ABC-analyse',
        'abc-subtab-compare': 'Sammenlign Perioder',
        'not-found-title': 'Side ikke fundet',
        'not-found-desc': 'Den side du leder efter eksisterer ikke eller er blevet fjernet.',
        'not-found-btn': 'G\u00e5 til Dashboard',
        'compare-tab': 'Sammenlign',
        'dashboard-title': 'Dashboard Oversigt',
        'total-items': 'Samlede Varer',
        'total-value': 'Samlet Værdi',
        'a-items': 'A-Varer',
        'last-analysis': 'Seneste Analyse',
        'quick-actions': 'Hurtige Handlinger',
        'view-data': 'Se Data',
        'export-excel': 'Eksporter til Excel',
        'new-analysis': 'Ny Analyse',
        'compare-periods': 'Sammenlign Perioder',
        'top-5-items': 'Top 5 Varer efter Værdi',
        'compare-title': 'Sammenlign ABC Analyser',
        'period-1': 'Periode 1 (Basis)',
        'period-2': 'Periode 2 (Sammenlign)',
        'drop-file-here': 'Træk fil hertil eller klik for at vælge',
        'select-file': '📂 Vælg Fil',
        'run-comparison': '🔄 Kør Sammenligning',
        'items-change': 'Ændring i Varer',
        'value-change': 'Værdiændring',
        'a-items-change': 'A-Varer Ændring',
        'change': 'Ændring',
        'trend': 'Trend',
        'abc-thresholds-setting': 'ABC Klassificering Tærskler',
        'abc-thresholds-description': 'Tilpas ABC grænser (værdi % kumulativ)',
        'preset-tight': '🎯 Stram (60/30/10)',
        'preset-standard': '📊 Standard (80/15/5)',
        'preset-relaxed': '🌊 Afslappet (70/20/10)',
        'a-class-threshold': 'A-Klasse %',
        'b-class-threshold': 'B-Klasse %',
        'c-class-threshold': 'C-Klasse %',
        'threshold-note': 'Note: Tallene skal summere til 100%. C beregnes automatisk.',
        'data-quality': 'Datakvalitet',
        'quality-score': 'Kvalitetsscore',
        'no-data-yet': 'Ingen analyse kørt endnu',
        'new-abc-analysis': 'Ny ABC-analyse',
        'new-abc-desc': 'Upload data og analyser',
        'calculate-eoq': 'Beregn EOQ',
        'calculate-eoq-desc': 'Wilson-formel',
        'view-data-desc': 'Vis uploadet data',
        'export-excel-desc': 'Download resultater',
        'compare-data': 'Sammenlign',
        'compare-data-desc': 'Sammenlign perioder',
        'drag-drop-text': 'Træk og slip fil her',
        'drag-drop-or': 'eller',
        'browse-file': 'Vælg fil',
        'rows': 'rækker',
        'reset': '🗑️ Ryd Data',
        'download-csv-btn': '📥 CSV',
        'download-excel-btn': '📊 Excel',
        'export-csv': 'Eksporter CSV',
        'export-csv-desc': 'Download CSV',
        'price-label': 'Pris pr. enhed',
        'interest-label': 'Rente (%)',
        'orders-per-year-label': 'Ordrer pr. år',
        'holding-total-label': 'Lageromkostning',
        'order-total-label': 'Ordreomkostning',
        'total-cost-label': 'Total årlig omkostning',
        'period-1-group': 'P1 Gruppe',
        'period-2-group': 'P2 Gruppe',
        'period-1-value': 'P1 Værdi',
        'period-2-value': 'P2 Værdi',
        'add-scenario-btn': '➕ Tilføj Scenarie',
        'clear-scenarios-btn': '🗑️ Ryd',
        'scenario-comparison-title': '📊 Scenarie Sammenligning',
        'scenario-name': 'Scenarie',
        'eoq-for-a-items': '🎯 EOQ for A-varer',
        'send-to-wilson': 'Send til Wilson',
        'send-wilson-hint': 'Åbn Wilson-beregner med valgte varer',
        'quick-preview': 'Hurtig Preview',
        'quick-eoq-preview-title': 'EOQ Hurtig Preview',
        'quick-preview-desc': 'Estimeret EOQ baseret på standardparametre. Klik 📊 for dybdegående analyse i Wilson.',
        'abc-items-loaded': 'Varer fra ABC-analyse',
        'select-item': 'Vælg vare...',
        'load-item': 'Indlæs',
        'calculate-all': 'Beregn alle',
        'abc-batch-results-title': 'EOQ Resultater for ABC Varer',
        'save-to-abc': 'Gem til ABC',
        'batch-params': 'Batch Parametre:',
        'recalculate': 'Genberegn',
        'avg-eoq': 'Gns. EOQ',
        'total-orders-year': 'Total Ordrer/År',
        'potential-savings': 'Potentiel Besparelse',
        'calculate-eoq': 'Beregn EOQ',
        'eoq-a-items': 'A-varer',
        'eoq-b-items': 'B-varer',
        'eoq-c-items': 'C-varer',
        'eoq-ab-items': 'A+B varer',
        'eoq-all-items': 'Alle varer',
        'batch-wilson-btn': '🧮 Beregn EOQ for Alle',
        'batch-wilson-title': 'EOQ Beregningsparametre',
        'wilson-result-title': 'Resultat',
        'wilson-optimal-order': 'Optimal indkøbsmængde (mest jævn)',
        'wilson-units-per-order': 'enheder pr. ordre',
        'wilson-orders-per-year': 'Ordrer pr. år',
        'wilson-holding-cost': 'Lageromkostning',
        'wilson-order-cost': 'Ordreomkostning',
        'wilson-total-cost': 'Total årlig omkostning',
        'print-report': 'Udskriv Rapport',
        'help-btn': 'Hjælp & Vejledning',
        'print-report-desc': 'Udskriftsklar format',
        'import-templates-title': 'Import Skabeloner',
        'show-more': 'Vis mere',
        'show-less': 'Vis mindre',
        'template-warehouse': 'Lager',
        'template-retail': 'Retail',
        'template-manufacturing': 'Produktion',
        'template-custom': 'Brugerdefineret',
        'download-samples': '📥 Download Eksempelfiler',
        'auto-column-mapping': '🔄 Automatisk Kolonnemapping',
        'learn-tab': 'Lær',
        'lean-tab': 'LEAN Værktøjer',
        'customize-dashboard': 'Tilpas Dashboard',
        'customize-dashboard-description': 'Vælg hvilke Quick Actions der vises på dashboard',
        'customize-btn': 'Tilpas',
        'education-mode': 'Uddannelsestilstand',
        'education-mode-description': 'Aktiver ekstra undervisningsressourcer og øvelsesdata til skolebrug',
        'education-mode-disabled-title': 'Uddannelsestilstand er deaktiveret',
        'education-mode-disabled-desc': 'Gå til Indstillinger og aktiver Uddannelsestilstand for at få adgang til alle læringsressourcer',
        'quick-start-guide': 'Hurtig Startguide',
        'custom-pages-title': 'Brugerdefinerede Sider',
        'custom-pages-desc': 'Opret og administrer dine brugerdefinerede beregningssider',
        'quick-start-step-1': 'Brug en Skabelon: Klik på "Skabelonbibliotek" for at starte med forhåndbyggede eksempler som EOQ, ROP, Break-Even, osv.',
        'quick-start-step-2': 'Eller Opret Fra Bunden: Klik på "Opret Ny Side" og tilføj dine egne input og formler',
        'quick-start-step-3': 'Forhåndsvisning Først: Brug altid Forhåndsvisning-knappen til at teste før lagring',
        'quick-start-step-4': 'Få Adgang Til Dine Sider: Brugerdefinerede sidefaner vises øverst når du gemmer dem',
        'quick-start-step-5': 'Del & Sikkerhedskopi: Eksporter sider som JSON-filer for at dele eller sikkerhedskopiere dit arbejde',
        'templates-available-badge': '💡 15+ Skabeloner Tilgængelige',
        'logistics-math-badge': '📚 Logistik & Matematik',
        'formula-validation-badge': '✅ Formelvalidering',
        'create-new-page-btn': '➕ Opret Ny Side',
        // Template library UI
        'template-inputs-label': 'input',
        'template-formulas-label': 'formler',
        'template-use-button': 'Brug Skabelon',
        'custom-calculate-btn': 'Beregn',
        'custom-simulate-btn': 'Kør Simulering',
        'custom-stop-btn': 'Stop',
        // Template translations - Logistics
        'template-logistics-eoq-name': 'EOQ (Wilson Formel)',
        'template-logistics-eoq-desc': 'Økonomisk ordremængde beregner',
        'template-logistics-rop-name': 'Genbestillingspunkt (ROP)',
        'template-logistics-rop-desc': 'Beregn hvornår lager skal genbestilles',
        'template-logistics-safety-name': 'Sikkerhedslager Beregner',
        'template-logistics-safety-desc': 'Bestem optimale sikkerhedslagerniveauer',
        'template-logistics-abc-name': 'ABC Klassificering Hjælper',
        'template-logistics-abc-desc': 'Beregn kumulative procenter for ABC-analyse',
        'template-logistics-minmax-name': 'Min/Max Lagermodel',
        'template-logistics-minmax-desc': 'Beregn minimum og maksimum lagerniveauer',
        'template-logistics-forecast-name': 'Efterspørgselsprognose (Simpelt Glidende Gennemsnit)',
        'template-logistics-forecast-desc': 'Forudsig fremtidig efterspørgsel ved hjælp af glidende gennemsnit',
        'template-logistics-breakeven-name': 'Break-Even Analyse',
        'template-logistics-breakeven-desc': 'Beregn break-even punkt for produkter',
        'template-logistics-turnover-name': 'Lageromsætningsgrad',
        'template-logistics-turnover-desc': 'Mål hvor hurtigt lager sælges',
        'template-logistics-tco-name': 'Total Cost of Ownership (TCO)',
        'template-logistics-tco-desc': 'Beregn den samlede ejeromkostning',
        'template-logistics-capacity-name': 'Kapacitetsplanlægning',
        'template-logistics-capacity-desc': 'Beregn produktionskapacitet og udnyttelse',
        'template-logistics-leadtime-name': 'Leveringstidsanalyse',
        'template-logistics-leadtime-desc': 'Analyser komponenter af leveringstid',
        'template-logistics-warehouse-name': 'Lagerplads Beregner',
        'template-logistics-warehouse-desc': 'Beregn nødvendig lagerplads',
        'template-logistics-pareto-name': 'Pareto Analyse (80/20)',
        'template-logistics-pareto-desc': 'Identificer de vigtigste 20% af varer',
        'template-logistics-truck-name': 'Lastbil Lastoptimering',
        'template-logistics-truck-desc': 'Optimer lastbilkapacitet og omkostninger',
        'template-logistics-cycle-name': 'Cyklustællings Planlægning',
        'template-logistics-cycle-desc': 'Planlæg lageroptællinger',
        'template-logistics-stockout-name': 'Udsolgt Omkostning Beregner',
        'template-logistics-stockout-desc': 'Beregn omkostninger ved at løbe tør for lager',
        'template-logistics-returns-name': 'Returstyring',
        'template-logistics-returns-desc': 'Analyser returfrekvenser og omkostninger',
        'template-logistics-kitting-name': 'Kitting Beregner',
        'template-logistics-kitting-desc': 'Beregn kit-samlingsomkostninger og krav',
        'template-logistics-variability-name': 'Efterspørgsels Variabilitetsanalyse',
        'template-logistics-variability-desc': 'Analyser efterspørgselsmønstre og variabilitet',
        'template-logistics-route-name': 'Ruteoptimering',
        'template-logistics-route-desc': 'Beregn optimal rute og leveringsomkostninger',
        'template-logistics-productivity-name': 'Produktivitets Beregner',
        'template-logistics-productivity-desc': 'Mål arbejdsstyrkens produktivitetsmetrikker',
        'template-logistics-supplier-name': 'Leverandør Præstationsscore',
        'template-logistics-supplier-desc': 'Evaluer leverandørpræstationsmetrikker',
        // Template translations - LEAN
        'template-lean-oee-name': 'OEE Beregner',
        'template-lean-oee-desc': 'Overall Equipment Effectiveness måling',
        'template-lean-smed-name': 'SMED Analyse',
        'template-lean-smed-desc': 'Single Minute Exchange of Die analyse',
        'template-lean-takt-name': 'Takt Tid Beregner',
        'template-lean-takt-desc': 'Beregn produktionstakttid',
        'template-lean-cycle-name': 'Cyklustidsanalyse',
        'template-lean-cycle-desc': 'Mål og analyser procescyklustid',
        'template-lean-vsm-name': 'Value Stream Mapping Metrikker',
        'template-lean-vsm-desc': 'Beregn værdistøm nøgletal',
        'template-lean-kaizen-name': 'Kaizen Event ROI',
        'template-lean-kaizen-desc': 'Mål forbedringsevent afkast',
        'template-lean-5s-name': '5S Score Beregner',
        'template-lean-5s-desc': 'Vurder 5S implementering',
        'template-lean-kanban-name': 'Kanban Kort Beregner',
        'template-lean-kanban-desc': 'Beregn optimalt antal kanban-kort',
        'template-lean-heijunka-name': 'Produktionsudjævning (Heijunka)',
        'template-lean-heijunka-desc': 'Planlæg jævn produktionsflow',
        'template-lean-standard-name': 'Standard Arbejde Beregner',
        'template-lean-standard-desc': 'Definer standardarbejdselementer',
        'template-lean-pull-name': 'Pull System Størrelse',
        'template-lean-pull-desc': 'Dimensioner pull-produktionssystem',
        'template-lean-changeover-name': 'Omstillingstids Reduktionsanalyse',
        'template-lean-changeover-desc': 'Analyser og reducer omstillingstider',
        'template-lean-visual-name': 'Visuel Styringsmetrikker',
        'template-lean-visual-desc': 'Spor visuel styringsindikatorer',
        'template-lean-gemba-name': 'Gemba Walk Metrikker',
        'template-lean-gemba-desc': 'Dokumenter gemba observationer',
        'template-lean-pokayoke-name': 'Poka-Yoke Design Beregner',
        'template-lean-pokayoke-desc': 'Design fejlsikringssystemer',
        // Template translations - Finance
        'template-finance-roi-name': 'ROI Beregner',
        'template-finance-roi-desc': 'Beregn investeringsafkast',
        'template-finance-npv-name': 'NPV Beregner',
        'template-finance-npv-desc': 'Nutidsværdi beregning',
        'template-finance-payback-name': 'Tilbagebetalingsperiode',
        'template-finance-payback-desc': 'Beregn investeringstilbagebetalingstid',
        'template-finance-depreciation-name': 'Afskrivnings Beregner',
        'template-finance-depreciation-desc': 'Beregn lineær afskrivning',
        'template-finance-working-name': 'Arbejdskapitalgrad',
        'template-finance-working-desc': 'Analyser arbejdskapitalforhold',
        'template-finance-profit-name': 'Overskudsgrad Analyse',
        'template-finance-profit-desc': 'Beregn rentabilitet og marginer',
        'template-finance-ebitda-name': 'EBITDA Beregner',
        'template-finance-ebitda-desc': 'Indtjening før renter, skat og afskrivninger',
        'template-finance-breakeven-name': 'Break-Even Punkt',
        'template-finance-breakeven-desc': 'Bestem nulpunktsvolumen',
        'template-finance-debt-name': 'Gældsgrad',
        'template-finance-debt-desc': 'Analyser gæld-til-egenkapital forhold',
        'template-finance-cashflow-name': 'Pengestrømsanalyse',
        'template-finance-cashflow-desc': 'Spor pengestrømme',
        'template-finance-variance-name': 'Budget Variansanalyse',
        'template-finance-variance-desc': 'Sammenlign faktiske vs. budgetterede tal',
        'template-finance-costbenefit-name': 'Cost-Benefit Analyse',
        'template-finance-costbenefit-desc': 'Vurder projekt nytte vs. omkostninger',
        'template-finance-elasticity-name': 'Priselasticitet',
        'template-finance-elasticity-desc': 'Mål efterspørgsels prisfølsomhed',
        'template-finance-eoq-name': 'Økonomisk Ordremængde (Finans Perspektiv)',
        'template-finance-eoq-desc': 'EOQ med finansielle nøgletal',
        // Template translations - Math/General
        'template-math-percentage-name': 'Procent Beregner',
        'template-math-percentage-desc': 'Beregn procenter og procentændringer',
        'template-math-linear-name': 'Lineær Ligningsløser',
        'template-math-linear-desc': 'Løs lineære ligninger',
        'template-math-compound-name': 'Renters Rente',
        'template-math-compound-desc': 'Beregn renters rente over tid',
        'template-math-profitmargin-name': 'Overskudsgrad Beregner',
        'template-math-profitmargin-desc': 'Beregn overskudsmarginer og avancer',
        'template-math-unitconversion-name': 'Enhedskonvertering',
        'template-math-unitconversion-desc': 'Konverter mellem forskellige enheder',
        'template-math-weightedaverage-name': 'Vægtet Gennemsnit',
        'template-math-weightedaverage-desc': 'Beregn vægtet gennemsnit',
        'template-math-loanpayment-name': 'Lånebetaling Beregner',
        'template-math-loanpayment-desc': 'Beregn månedlige lånebetalinger',
        'template-math-discount-name': 'Rabat Beregner',
        'template-math-discount-desc': 'Beregn rabatter og endelige priser',
        'template-math-distancespeedtime-name': 'Afstand Hastighed Tid',
        'template-math-distancespeedtime-desc': 'Beregn afstand, hastighed eller tid',
        'template-math-shippingcost-name': 'Forsendelsesomkostning Beregner',
        'template-math-shippingcost-desc': 'Beregn forsendelsesomkostninger med volumen/vægt niveauer',
        'template-math-orderfulfillment-name': 'Ordreudførelsestid',
        'template-math-orderfulfillment-desc': 'Beregn komplet ordreudførelsestidslinje',
        'template-math-bulkdiscount-name': 'Mængderabat Prissætning',
        'template-math-bulkdiscount-desc': 'Beregn trinvis mængderabat prissætning',
        'template-math-depreciation-name': 'Afskrivnings Beregner',
        'template-math-depreciation-desc': 'Beregn aktivafskrivning (lineær metode)',
        'template-math-workingcapital-name': 'Arbejdskapital Beregner',
        'template-math-workingcapital-desc': 'Beregn arbejdskapital og nøgletal',
        'template-math-servicelevel-name': 'Serviceniveau Beregner',
        'template-math-servicelevel-desc': 'Beregn serviceniveau og udsolgt sandsynlighed',
        'template-math-queuetime-name': 'Kø/Ventetid Beregner',
        'template-math-queuetime-desc': 'Beregn gennemsnitlige ventetider og kølængde',
        'template-math-carbonfootprint-name': 'CO2-fodaftryk Beregner',
        'template-math-carbonfootprint-desc': 'Beregn logistik CO2-udledninger',
        'template-math-temperature-name': 'Temperatur Konverter',
        'template-math-temperature-desc': 'Konverter mellem Celsius og Fahrenheit',
        'template-math-amortization-name': 'Låneamortiseringsplan',
        'template-math-amortization-desc': 'Beregn detaljeret lånebetaling opdeling',
        'template-math-retirement-name': 'Pensionsopsparingsplanlægger',
        'template-math-retirement-desc': 'Planlæg pensionsopsparing med renters rente vækst',
        'template-math-breakeven-name': 'Break-Even Punkt (Enheder & Omsætning)',
        'template-math-breakeven-desc': 'Beregn break-even i både enheder og kroner',
        'template-math-statistical-name': 'Statistisk Analyse',
        'template-math-statistical-desc': 'Beregn gennemsnit, median, standardafvigelse',
        'column-visibility': 'Kolonner',
        'select-all': 'Vælg Alle',
        'deselect-all': 'Fravælg Alle',
        'column-visibility-hint': 'Vælg hvilke kolonner der skal vises i tabeller og analyser. Skjulte kolonner bevares stadig i eksporter.',
        'template-library-btn': '📚 Skabelonbibliotek',
        'import-page-btn': '📥 Importer Side',
        'step-1-title': '1. Upload Data',
        'step-1-desc': 'Upload din CSV eller Excel fil med varer',
        'step-2-title': '2. Analyser',
        'step-2-desc': 'Klik på "Analyser Data" for at beregne ABC-klassificering',
        'step-3-title': '3. Visualiser',
        'step-3-desc': 'Se resultaterne som Pareto diagram eller cirkeldiagram',
        'step-4-title': '4. Beregn EOQ',
        'step-4-desc': 'Brug Wilson-formlen til at finde optimal ordremængde',
        'sample-datasets': 'Prøvedata',
        'sample-datasets-desc': 'Klik for at indlæse eksempeldata:',
        'retail-store': 'Detailbutik',
        'retail-store-desc': '15 varer, simpel struktur',
        'warehouse': 'Lager',
        'warehouse-desc': '50 varer, varieret kompleksitet',
        'manufacturing': 'Produktion',
        'action-type-label': 'Handling Type',
        'action-type-tab': 'Skift til fane',
        'action-type-function': 'Kør funktion',
        'action-type-url': 'Åbn URL',
        'action-type-sample': 'Indlæs eksempel data',
        'shortcut-tab-label': 'Fane',
        'shortcut-function-label': 'Funktion',
        'shortcut-url-label': 'URL',
        'shortcut-url-note': 'Åbnes i nyt vindue',
        'shortcut-url-new-window': 'Åbn i nyt vindue',
        'shortcut-sample-label': 'Eksempel Datasæt',
        'function-view-data': 'Vis Data',
        'function-export-csv': 'Eksporter CSV',
        'function-export-excel': 'Eksporter Excel',
        'function-print': 'Udskriv',
        'function-reset': 'Nulstil App',
        'function-abc-double': 'Kør ABC Dobbelt',
        'function-tutorial': 'Start Tutorial',
        'print-menu-title': 'Vælg hvad du vil udskrive',
        'print-option-dashboard': 'Dashboard Oversigt',
        'print-option-abc': 'ABC Analyse',
        'print-option-abc-double': 'ABC Dobbelt Analyse',
        'print-option-wilson': 'Wilson (EOQ) Beregning',
        'print-option-inventory': 'Lagerstyring',
        'print-no-data': 'Ingen data tilgængelig til udskrivning',
        'print-no-data-desc': 'Udfør beregninger eller analyser først, så kan du udskrive resultaterne.',
        'wilson-subtitle': 'Beregn den optimale indkøbsmængde for enkelt varer eller hele varelister',
        'wilson-single-mode': '📝 Enkelt Vare',
        'wilson-batch-mode': '📦 Batch Mode',
        'wilson-single-title': 'Enkelt Vare',
        'wilson-single-desc': 'Beregn EOQ for én vare med sliders og få detaljeret omkostningsanalyse',
        'wilson-batch-title': 'Batch Mode',
        'wilson-batch-desc': 'Upload CSV/Excel og beregn EOQ for alle varer på én gang',
        'ready-to-calculate': 'Klar til beregning',
        'batch-upload-title': '📤 Upload Batch Data',
        'batch-upload-desc': 'Filen skal indeholde kolonnerne: Varenavn, Årligt Forbrug, Ordreomkostning, Stykpris, Rentesats (%)',
        'load-sample-data': '🔄 Indlæs Eksempeldata',
        'batch-results-title': '📊 Batch EOQ Resultater',
        'export-pdf-btn': '📄 Eksporter PDF',
        'orders-per-year': 'Ordrer/År',
        'total-cost-all': 'Total Omkostning (Alle)',
        'avg-orders': 'Gns. Ordrer/År',
        'total-eoq': 'Total EOQ',
        'customize-quick-actions': 'Tilpas Quick Actions',
        'show-all': '✓ Vis Alle',
        'hide-all': '✕ Skjul Alle',
        'customize-description': 'Vælg hvilke genveje der skal vises på dit dashboard. Træk for at omarrangere rækkefølgen.',
        'create-shortcut-title': 'Tilføj Brugerdefineret Genvej',
        'shortcut-icon-label': 'Icon (Emoji)',
        'shortcut-title-label': 'Titel',
        'shortcut-desc-label': 'Beskrivelse',
        'shortcut-title-placeholder': 'Min Genvej',
        'shortcut-desc-placeholder': 'Beskrivelse af genvej',
        'shortcut-color-label': 'Farve Tema',
        'color-blue': 'Blå',
        'color-indigo': 'Indigo',
        'color-purple': 'Lilla',
        'color-pink': 'Pink',
        'color-red': 'Rød',
        'color-orange': 'Orange',
        'color-yellow': 'Gul',
        'color-green': 'Grøn',
        'color-teal': 'Teal',
        'color-cyan': 'Cyan',
        'cancel': 'Annuller',
        'save-shortcut': '💾 Gem Genvej',
        'add-custom-shortcut': 'Opret Genvej',
        'reset-defaults': '🔄 Nulstil',
        'save-changes': '💾 Gem Ændringer',
        'select-emoji': 'Vælg Emoji',
        'emoji-popular': '⭐ Populære',
        'emoji-work': '📦 Arbejde & Kontor',
        'emoji-tech': '💻 Teknologi',
        'emoji-charts': '📊 Grafer & Tabeller',
        'emoji-tools': '🛠️ Værktøjer',
        'emoji-symbols': '🎨 Symboler',
        'custom-page-modal-title': '✨ Opret Brugerdefineret Side',
        'custom-page-help-title': 'Hvordan opretter du en brugerdefineret side',
        'custom-page-help-1': '1️⃣ Navngiv din side - Giv den en beskrivende titel',
        'custom-page-help-2': '2️⃣ Tilføj Inputfelter - Definer hvilke værdier brugere kan indtaste (f.eks. pris, mængde, sats)',
        'custom-page-help-3': '3️⃣ Opret Formler - Brug matematiske udtryk med dine inputvariabelnavne (f.eks. pris * mængde)',
        'custom-page-help-4': '4️⃣ Forhåndsvisning - Test din side før lagring ved at bruge Forhåndsvisning-knappen nedenfor',
        'custom-page-help-5': '5️⃣ Valgfri Graf - Visualiser dine beregninger med diagrammer',
        'custom-page-tip': '💡 Tip: Brug Skabelonbiblioteket til forhåndbyggede eksempler for hurtigt at komme i gang!',
        'input-var-placeholder': 'Variabelnavn (f.eks. efterspørgsel)',
        'input-label-placeholder': 'Etiket der vises til brugeren',
        'input-default-placeholder': 'Standardværdi',
        'formula-var-placeholder': 'Resultatvariabelnavn',
        'formula-label-placeholder': 'Etiketnavn for resultat',
        'formula-expression-placeholder': 'Formel (f.eks. pris * mængde)',
        'input-var-name-hint': 'Brug kun små bogstaver, ingen mellemrum (f.eks. "pris", "antal", "omkostning")',
        'input-label-hint': 'Venligt navn der vises til brugeren (f.eks. "Enhedspris", "Bestillingsmængde")',
        'input-default-hint': 'Forindstillet værdi, der fyldes automatisk (valgfri)',
        'formula-name-hint': 'Navn på resultatet (kan bruges i andre formler)',
        'formula-label-hint': 'Overskrift der vises over resultatet',
        'formula-help-hover': 'Formel Hjælp (hold musen over for info)',
        'available-functions': 'Tilgængelige Funktioner',
        'available-operators': 'Operatorer',
        'no-description': 'Ingen beskrivelse',
        'no-custom-pages-yet': 'Ingen brugerdefinerede sider endnu',
        'click-create-to-start': 'Klik på "Opret Ny Side" for at komme i gang',
        'inputs': 'inputs',
        'formulas': 'formler',
        'open': 'Åbn',
        'page-name-label': 'Sidenavn *',
        'page-name-placeholder': 'Min Brugerdefinerede Beregner',
        'page-description-label': 'Beskrivelse',
        'page-description-placeholder': 'Hvad beregner denne side?',
        'page-icon-label': 'Ikon (Emoji)',
        'input-fields-title': '📝 Inputfelter',
        'input-fields-help-title': 'Inputfelter er de værdier brugere kan indtaste.',
        'input-fields-help-example': 'Eksempel: <code class="bg-gray-700 px-1 rounded">pris</code>, <code class="bg-gray-700 px-1 rounded">mængde</code>, <code class="bg-gray-700 px-1 rounded">sats</code>',
        'input-fields-help-tip': '💡 "Variabelnavn" vil blive brugt i formler!',
        'add-input-btn': '+ Tilføj Input',
        'formulas-title': '🧮 Formler & Output',
        'formulas-help-title': 'Formler beregner resultater ved brug af inputværdier.',
        'formulas-help-operators': 'Tilgængelige operatorer: <code class="bg-gray-700 px-1 rounded">+ - * / ^ sqrt() pow() sin() cos()</code>',
        'formulas-help-examples': 'Eksempler:',
        'formulas-help-example-1': '<code class="bg-gray-700 px-1 rounded">pris * mængde</code>',
        'formulas-help-example-2': '<code class="bg-gray-700 px-1 rounded">sqrt(2 * forbrug * omkostning)</code>',
        'formulas-help-example-3': '<code class="bg-gray-700 px-1 rounded">omsætning - omkostning</code>',
        'formulas-help-tip': '💡 Brug eksakte inputvariabelnavne i dine formler!',
        'add-formula-btn': '+ Tilføj Formel',
        'graph-config-title': '📈 Grafkonfiguration (Valgfri)',
        'graph-help-title': '<strong>Grafer</strong> visualiserer dine beregninger.',
        'graph-help-xaxis': 'X-akse: Normalt en inputvariabel eller område',
        'graph-help-yaxis': 'Y-akse: Formelresultater at plotte',
        'graph-help-tip': '💡 Super til at vise omkostningskurver eller tendenser!',
        'enable-graph': 'Aktivér Graf',
        'graph-type-label': 'Graftype',
        'graph-type-line': 'Linjediagram',
        'graph-type-bar': 'Søjlediagram',
        'graph-type-scatter': 'Punktdiagram',
        'graph-type-pie': 'Cirkeldiagram',
        'graph-type-radar': 'Radardiagram',
        'xaxis-variable': 'X-akse Variabel',
        'yaxis-variables': 'Y-akse Variabel(er)',
        'quick-formulas': '⚡ Hurtige Formler:',
        'snippet-percentage': '% Procent',
        'snippet-growth': '📈 Vækstrate',
        'snippet-average': '📊 Gennemsnit',
        'snippet-markup': '💰 Påslag',
        'snippet-margin': '💵 Margin',
        'snippet-compound': '📈 Renters Rente',
        'snippet-conditional': '🔀 Hvis/Så',
        'snippet-min': '⬇️ Min',
        'snippet-max': '⬆️ Max',
        'snippet-sqrt': '√ Kvadratrod',
        'advanced-options': '⚙️ Avancerede Indstillinger',
        'input-validation': '🛡️ Inputvalidering',
        'input-validation-desc': 'Tilføj min/max begrænsninger og påkrævede feltregler til dine inputs for bedre datakvalitet.',
        'enable-validation': 'Aktivér Inputvalidering',
        'validation-options': 'Valideringsindstillinger:',
        'require-all-inputs': 'Kræv alle inputfelter',
        'validate-numbers': 'Validér talområder',
        'per-input-validation': 'Per-Input Validering:',
        'validation-hint': '💡 Klik på et inputfelt nedenfor for at indstille min/max værdier for det specifikke input',
        'export-import': '💾 Eksport/Import',
        'export-import-desc': 'Gem dine brugerdefinerede sider som JSON-filer og del dem med andre.',
        'export-page': '📤 Eksportér Side',
        // Wizard translations
        'progress': 'Fremskridt',
        'step-basic': 'Grundlæggende Info',
        'step-inputs': 'Inputs',
        'step-formulas': 'Formler',
        'step-advanced': 'Avanceret',
        'step-preview': 'Forhåndsvisning',
        'step1-title': 'Grundlæggende Information',
        'step1-description': 'Giv din brugerdefinerede beregner et navn og beskrivelse',
        'step1-help-title': 'Hurtig Startguide',
        'step2-title': 'Inputfelter',
        'step2-description': 'Definer hvilke værdier brugere kan indtaste',
        'step3-title': 'Formler & Output',
        'step3-description': 'Definer beregninger og resultater',
        'step4-title': 'Avancerede Indstillinger',
        'step4-description': 'Konfigurer validering, grafer og simulering',
        'step5-title': 'Forhåndsvisning & Gem',
        'step5-description': 'Test din beregner og gem den',
        'next': 'Næste',
        'previous': 'Forrige',
        'preview-and-save': 'Forhåndsvisning & Gem',
        'templates': 'Skabeloner',
        'no-inputs-yet': 'Ingen inputs endnu',
        'add-first-input': 'Klik på knappen nedenfor for at tilføje dit første inputfelt',
        'add-another-input': 'Tilføj Endnu Et Input',
        'no-formulas-yet': 'Ingen formler endnu',
        'add-first-formula': 'Tilføj beregninger for at vise resultater',
        'add-another-formula': 'Tilføj Endnu En Formel',
        'quick-add-input': 'Tilføj Input',
        'quick-add-formula': 'Tilføj Formel',
        'import-page': 'Importér Side',
        'auto-save': 'Auto-Gem',
        'page-stats': 'Sidestatistikker',
        'inputs-count': 'Inputs:',
        'formulas-count': 'Formler:',
        'required-inputs': 'Påkrævet:',
        'available-variables': 'Tilgængelige Variabler',
        'no-variables-yet': 'Tilføj først inputs for at se tilgængelige variabler',
        'input-help-description': 'er de værdier brugere kan indtaste.',
        'formulas-help-description': 'beregner resultater ved brug af inputværdier.',
        'example': 'Eksempel:',
        'operators': 'Operatorer:',
        'examples': 'Eksempler:',
        'logistics-templates': 'Logistik',
        'business-templates': 'Forretning & Matematik',
        'all-templates': 'Alle Skabeloner',
        'live-preview': 'Live Forhåndsvisning',
        'preview-updates-auto': 'Opdateres automatisk',
        'auto-save-enabled': 'Auto-gem aktiveret',
        'changes-tracked': 'Ændringer sporet',
        'generating-preview': 'Genererer forhåndsvisning...',
        'preview-tips': 'Forhåndsvisningstips',
        'preview-tip-1': 'Indtast testværdier for at se hvordan din beregner virker',
        'preview-tip-2': 'Gå tilbage til tidligere trin hvis du har brug for at lave ændringer',
        'preview-tip-3': 'Din side vil blive gemt og tilgængelig i Brugerdefinerede Sider sektionen',
        'saved': 'Gemt',
        'draft-restored': 'Kladde gendannet',
        'restore-draft-prompt': 'Fundet auto-gemt kladde. Gendanne den?',
        'duplicate': 'Duplikér',
        'delete': 'Slet',
        'drag-to-reorder': 'Træk for at omarrangere',
        'input-duplicated': 'Input duplikeret',
        'formula-duplicated': 'Formel duplikeret',
        'valid-formula': 'Gyldig formel',
        'formula-help': 'Brug math funktioner: sqrt(), pow(), abs(), sin(), cos(), osv. Referer til input-variabler efter navn.',
        'import-page': '📥 Importér Side',
        'calc-types': '🧮 Beregningstyper',
        'calc-types-desc': 'Dine formler understøtter:',
        'calc-type-1': '✓ Betinget logik: værdi > 100 ? "Høj" : "Lav"',
        'calc-type-2': '✓ Min/Max: min(a, b, c) eller max(x, y, z)',
        'calc-type-3': '✓ Matematiske funktioner: sqrt(), pow(), abs(), round(), ceil(), floor()',
        'calc-type-4': '✓ Trigonometriske funktioner: sin(), cos(), tan(), asin(), acos(), atan()',
        'calc-type-5': '✓ Konstanter: pi, e (Eulers tal)',
        'simulation-mode-title': '⏱️ Simuleringstilstand (Valgfri)',
        'enable-simulation': 'Aktivér Simulering',
        'simulation-help': '💡 Simulering vil animere dine formler over tid. Nyttig til lagerniveauer, lagerudtømning og dynamiske processer.',
        'time-variable-label': 'Tidsvariabelnavn',
        'start-value-label': 'Startværdi',
        'end-value-label': 'Slutværdi',
        'use-template-btn': '📚 Brug Skabelon',
        'cancel-btn': 'Annuller',
        'preview-btn': '👁️ Forhåndsvisning',
        'save-page-btn': '💾 Gem Side',
        'preview-modal-title': '👁️ Live Forhåndsvisning',
        'preview-modal-subtitle': 'Test din brugerdefinerede side før du gemmer',
        'preview-tip': '💡 Lav ændringer i formularen og klik Forhåndsvisning igen for at opdatere',
        'close-preview-btn': 'Luk Forhåndsvisning',
        'manufacturing-desc': '100 varer, realistisk produktionsscenarie',
        'theory-concepts': 'Teori & Koncepter',
        'abc-theory-title': 'ABC-analyse',
        'abc-theory-text': 'ABC-analyse er en lagerstyringsmetode der klassificerer varer baseret på deres økonomiske betydning. A-varer (typisk 20% af varerne) står for 80% af værdien og kræver tæt overvågning. B-varer er moderate i betydning, mens C-varer er lave i værdi men ofte høje i antal.',
        'eoq-theory-title': 'Wilson EOQ-formel',
        'eoq-theory-text': 'Economic Order Quantity (EOQ) er den optimale ordremængde der minimerer de samlede lageromkostninger. Formlen balancerer ordreomkostninger (der falder med større ordrer) mod lageromkostninger (der stiger med større ordrer).',
        'eoq-formula': 'EOQ = √(2DS/H)',
        'eoq-formula-where': 'hvor:',
        'eoq-d': 'D = Årligt forbrug',
        'eoq-s': 'S = Ordreomkostning pr. ordre',
        'eoq-h': 'H = Lageromkostning pr. enhed pr. år',
        'eoq-benefit': 'Fordel: Finder balancen mellem ordreomkostninger (faldende med større ordrer) og lageromkostninger (stigende med større ordrer).',
        // Inventory Management Learn Section
        'inventory-tools-theory-title': 'Lagerstyring Værktøjer',
        'inventory-tools-intro': 'Værktøjssættet indeholder tre komplementære systemer til forskellige lagerstyringsscenarier:',
        'inventory-rop-when': 'Hvornår bruges det: Når du bestiller ved behov (kontinuerlig gennemgang). Ideel til A-varer med variabel efterspørgsel.',
        'inventory-rop-example': 'Eksempel: Dagligt forbrug 50 stk, leveringstid 5 dage, serviceniveau 95% → ROP = 250 + sikkerhedslager (baseret på efterspørgselsudsving)',
        'inventory-pr-when': 'Hvornår bruges det: Faste indkøbsintervaller (fx hver 14. dag). Perfekt når leverandøren kører faste ruter eller til konsolidering af ordrer.',
        'inventory-pr-example': 'Eksempel: Review hver 14. dag, dagligt forbrug 20 stk, leveringstid 7 dage → Målniveau = 20 × (14+7) + sikkerhedslager = 420 + sikkerhedslager',
        'inventory-pr-chart': '💡 Graf: Visualiserer hvordan lageret falder under gennemgangsperioden og stiger igen efter leverance. Hjælper med at sikre du aldrig løber tør.',
        'inventory-mm-when': 'Hvornår bruges det: Når du arbejder med faste lagergrænser (populært i warehouse management). Enkelt at forstå og implementere.',
        'inventory-mm-chart': '💡 Dashboard: Visuelt warehouse display viser lagerstatus med farvekodning. Perfekt til hurtig status-check på flere varer.',
        'inventory-tools-tip': '💡 Valg af model: ROP til høj-værdi varer med variabel efterspørgsel, Periodisk Review til faste indkøbsruter, Min/Max til simpel warehouse-styring med fast ordremængde.',
        'abc-theory-intro': 'ABC-analyse er en lagerstyring teknik baseret på Pareto-princippet (80/20 reglen), hvor varer klassificeres i tre kategorier baseret på deres værdi:',
        'abc-a-label': 'A-varer (typisk ~20% af varer, ~80% af værdi):',
        'abc-a-desc': 'Høj værdi, tight kontrol, hyppig genbestilling',
        'abc-b-label': 'B-varer (typisk ~30% af varer, ~15% af værdi):',
        'abc-b-desc': 'Medium værdi, moderat kontrol',
        'abc-c-label': 'C-varer (typisk ~50% af varer, ~5% af værdi):',
        'abc-c-desc': 'Lav værdi, simpel kontrol, periodisk gennemgang',
        'abc-double-theory-title': 'ABC Dobbelt Analyse',
        'abc-double-theory-intro': 'ABC Dobbelt Analyse kombinerer to dimensioner for en mere præcis klassificering af lagervarer: værdi (forbrug × pris) og forbrug (antal enheder). Dette skaber en 3×3 matrix med 9 mulige kategorier.',
        'abc-double-matrix-title': '3×3 Klassificerings Matrix',
        'abc-double-value-a': 'A Værdi',
        'abc-double-value-b': 'B Værdi',
        'abc-double-value-c': 'C Værdi',
        'abc-double-consumption-a': 'A Forbrug',
        'abc-double-consumption-b': 'B Forbrug',
        'abc-double-consumption-c': 'C Forbrug',
        'abc-double-critical': 'Kritisk',
        'abc-double-moderate': 'Moderat',
        'abc-double-low-priority': 'Lav prioritet',
        'abc-double-tip': '💡 Tip: Brug ABC Dobbelt til at identificere varer hvor standard ABC analyse ikke er tilstrækkelig. En AC-vare (høj værdi, lavt forbrug) styres anderledes end en CA-vare (lav værdi, højt forbrug).',
        'eoq-theory-intro': 'Wilson\'s formel beregner den optimale ordrestørrelse der minimerer de samlede lageromkostninger:',
        'practice-exercises': 'Praktiske Øvelser',
        'exercise-1-title': 'Øvelse 1: ABC Klassificering',
        'exercise-1-desc': 'Indlæs "Detailbutik" datasættet og identificer hvilke varer der er A-varer. Hvorfor er de vigtige for virksomheden?',
        'exercise-2-title': 'Øvelse 2: Wilson EOQ Beregning',
        'exercise-2-desc': 'Brug Wilson-beregneren til at finde optimal ordrestørrelse. Prøv med: Årsforbrug=5000, Ordreomkostning=200 kr, Pris=50 kr, Rente=5%',
        'exercise-3-title': 'Øvelse 3: Genbestillingspunkt',
        'exercise-3-desc': 'Beregn ROP for en vare med dagligt forbrug på 20 enheder, leveringstid 7 dage, og 95% serviceniveau. Hvornår skal du bestille?',
        'exercise-4-title': 'Øvelse 4: ABC Dobbelt Analyse',
        'exercise-4-desc': 'Indlæs et datasæt og brug ABC Dobbelt analysen til at identificere AA-varer (høj værdi OG højt forbrug). Hvordan adskiller de sig fra andre A-varer?',
        'exercise-5-title': 'Øvelse 5: OEE Beregning',
        'exercise-5-desc': 'Beregn OEE for en maskine: Tilgængelighed 90%, Ydelse 85%, Kvalitet 98%. Er det verdensklasse?',
        'exercise-6-title': 'Øvelse 6: Budget Planlægning',
        'exercise-6-desc': 'Opret et månedligt budget med faste udgifter (husleje, forsikring) og variable udgifter (dagligvarer, transport). Brug kontosystemet til at spore dem.',
        'start-exercise': 'Start Øvelse',
        'wilson-formula-title': 'Wilson Formel:',
        'wilson-formula-text': 'Q* = √[(2 × Årsforbrug × Ordreomkostninger) / (Pris × Rente)]',
        'wilson-step-1': 'Beregn tæller',
        'wilson-step-2': 'Beregn nævner',
        'wilson-step-3': 'Divider',
        'wilson-step-4': 'Tag kvadratrod',
        // Best Practices Guide
        'best-practices-title': 'Best Practices Guide',
        'best-practices-desc': 'Følg disse dokumenterede strategier for at optimere din lagerstyring',
        'when-use-abc': 'Hvornår skal du bruge ABC-analyse',
        'abc-use-1': 'Håndtering af stort lager (100+ varer) - fokuser indsatsen på højværdivarer',
        'abc-use-2': 'Begrænsede ressourcer - prioriter hvor du investerer tid og penge',
        'abc-use-3': 'Årlige revisioner - klassificer varer for det kommende år',
        'abc-use-4': 'Nye produktlanceringer - forstå værdifordeling hurtigt',
        'interpret-eoq': 'Sådan fortolkes EOQ-resultater',
        'eoq-less': 'Du bestiller for meget - reducer for at spare på lageromkostninger',
        'eoq-more': 'Du bestiller for lidt - øg for at spare på ordreomkostninger',
        'eoq-orders': 'Viser hvor ofte du vil genbestille - juster for leverandørminimum',
        'eoq-cost': 'Sammenlign med nuværende omkostninger for at se potentielle besparelser',
        'inventory-tips': 'Lagerstyringstips',
        'tip-a-items': 'A-varer',
        'tip-a-desc': 'Daglig overvågning, stram lagerstyring, nøjagtig behovsprognose',
        'tip-b-items': 'B-varer',
        'tip-b-desc': 'Ugentlig overvågning, automatiserede genbestillingspunkter, regelmæssige gennemgange',
        'tip-c-items': 'C-varer',
        'tip-c-desc': 'Månedlig overvågning, bulk-bestilling, simpelt to-beholder system',
        'tip-safety-stock': 'Sikkerhedslager',
        'tip-safety-desc': 'Tilføj 10-25% buffer til A-varer, 5-15% til B-varer, minimal til C-varer',
        'common-mistakes': 'Almindelige fejl at undgå',
        'mistake-1': 'At ignorere C-varer helt - de kan stadig forårsage lagermangel',
        'mistake-2': 'Brug af forældede data - kør analysen minimum kvartalsvis',
        'mistake-3': 'Blindt følge EOQ uden at overveje leverandørbegrænsninger',
        'mistake-4': 'Ikke justere for sæsonudsving - efterspørgslen varierer året rundt',
        'mistake-5': 'Glemme lagerkapacitetsgrænser - EOQ antager ubegrænset plads',
        'industry-specific': 'Branchespecifikke anbefalinger',
        'retail-rec': ' Fokuser på hurtigomsættelige varer (A), juster tærskler til 85/10/5 for sæsontoppe',
        'mfg-rec': ' Grupper efter produktionslinje, overvej leveringstider i EOQ, vedligehold sikkerhedslager til kritiske komponenter',
        'dist-rec': ' Brug strammere ABC-klassificering (70/25/5), optimer efter forsendelsesfrekvens, konsolider ordrer',
        'food-rec': ' Prioriter letfordærvelige varer som A-varer uanset pris, bestil ofte, minimer lageromkostninger',
        // Formula Explorer
        'formula-explorer-title': 'Formel Udforsker',
        'formula-explorer-desc': 'Udforsk hvordan ændring af EOQ-variabler påvirker den optimale ordremængde og omkostninger',
        'explorer-demand': 'Årlig Efterspørgsel (D)',
        'explorer-order-cost': 'Ordreomkostning (S)',
        'explorer-price': 'Enhedspris (P)',
        'explorer-interest': 'Rentesats (%)',
        'explorer-eoq-result': 'Optimal Ordremængde',
        'explorer-units': 'enheder',
        'explorer-orders-year': 'ordrer pr. år',
        'explorer-total-cost': 'Total Årlig Omkostning',
        'explorer-holding': 'Lager',
        'explorer-ordering': 'Ordrer',
        'explorer-cost-curve': 'Omkostningskurve Visualisering',
        'explorer-insights': 'Nøgleindsigt',
        // Data Management
        'data-management-title': 'Datahåndtering',
        'data-management-desc': 'Ryd data med forskellige omfang baseret på dine behov',
        'clear-data-title': 'Ryd Uploadede Data',
        'clear-data-desc': 'Rydder uploadede filer og alle analyseresultater (ABC, Wilson osv.)',
        'clear-data-btn': 'Ryd Data',
        'reset-dashboard-title': 'Nulstil Dashboard',
        'reset-dashboard-desc': 'Nulstiller Quick Actions tilpasning til standardtilstand',
        'reset-dashboard-btn': 'Nulstil Dashboard',
        'delete-pages-title': 'Slet Custom Pages',
        'delete-pages-desc': 'Fjerner alle custom beregningssider du har oprettet',
        'delete-pages-btn': 'Slet Alle Sider',
        'reset-all-title': 'Nulstil Alt',
        'reset-all-desc': 'Komplet nulstilling: data, dashboard, custom pages og indstillinger',
        'reset-all-btn': 'Nulstil Alt',
        // Data Encryption
        'data-encryption-title': 'Datakryptering',
        'data-encryption-desc': 'Beskyt dine data med adgangskodebaseret kryptering i browserlager',
        'encryption-disabled': 'Kryptering Deaktiveret',
        'encryption-disabled-desc': 'Data gemmes uden beskyttelse',
        'encryption-enabled': 'Kryptering Aktiveret',
        'encryption-enabled-desc': 'Data er beskyttet med adgangskode',
        'encryption-warning': '⚠️ Vigtigt:',
        'encryption-warning-text': 'Gem din adgangskode sikkert. Hvis du glemmer den, kan du ikke gendanne dine data.',
        'encryption-password-placeholder': 'Indtast krypteringsadgangskode',
        'encryption-password-confirm': 'Bekræft adgangskode',
        'encryption-enable': 'Aktiver Kryptering',
        'encryption-cancel': 'Annuller',
        'encryption-locked': '🔒 Data er krypteret. Indtast adgangskode for at låse op.',
        'unlock-password-placeholder': 'Indtast adgangskode',
        'unlock-data': 'Lås Data Op',
        'encryption-success': 'Kryptering aktiveret succesfuldt',
        'encryption-disabled-success': 'Kryptering deaktiveret',
        'encryption-unlock-success': 'Data ulåst',
        'encryption-password-mismatch': 'Adgangskoderne matcher ikke',
        'encryption-password-short': 'Adgangskode skal være mindst 8 tegn',
        'encryption-unlock-failed': 'Forkert adgangskode',
        // Reorder Point Calculator
        'reorder-point-title': 'Genbestillingspunkt Beregner',
        'reorder-point-desc': 'Beregn hvornår du skal genbestille varer baseret på leveringstid og ønsket serviceniveau',
        'rop-daily-demand': 'Daglig Efterspørgsel',
        'rop-daily-demand-hint': 'Enheder pr. dag',
        'rop-lead-time': 'Leveringstid (dage)',
        'rop-lead-time-hint': 'Dage til at modtage ordre',
        'rop-service-level': 'Serviceniveau (%)',
        'rop-service-level-hint': 'Målrettet serviceniveau',
        'rop-demand-std': 'Efterspørgsel Std Afv',
        'rop-std-hint': 'Daglig variation',
        'rop-calculate': 'Beregn Genbestillingspunkt',
        'rop-result-title': 'Genbestillingspunkt',
        'rop-safety-stock': 'Sikkerhedslager',
        'rop-avg-demand': 'Gns. Leveringstid Efterspørgsel',
        'rop-formula': 'Formel',
        'rop-explanation': 'Hvor Z-score repræsenterer ønsket serviceniveau (højere = mere sikkerhedslager)',
        // Inventory Management
        'inventory-title': 'Lagerstyring',
        'inventory-desc': 'Tre kraftfulde værktøjer til optimal lagerstyring: Beregn genbestillingspunkt, planlæg periodisk indkøb, og administrer min/max-lagerniveauer med visuelle dashboards',
        'reorder-point-title': 'Genbestillingspunkt (ROP)',
        'reorder-point-desc': 'Beregn det præcise lagerniveau hvor du skal genbestille for at undgå lagermangel. Tager højde for dagligt forbrug, leveringstid, efterspørgselsudsving og ønsket serviceniveau.',
        'periodic-review-title': 'Periodisk Gennemgang',
        'periodic-review-desc': 'Perfekt til virksomheder med faste indkøbsdage (fx hver 14. dag). Beregn hvor meget du skal bestille op til et målniveau baseret på forbrug, leveringstid og sikkerhedslager. Inkluderer visuel graf over forventet lagerniveau.',
        'pr-daily-demand': 'Dagligt Forbrug',
        'pr-review-period': 'Gennemgangsperiode (dage)',
        'pr-lead-time': 'Leveringstid (dage)',
        'pr-safety-stock': 'Sikkerhedslager',
        'pr-current-stock': 'Nuværende Lagerniveau',
        'pr-target-level': 'Målniveau',
        'pr-order-quantity': 'Bestil Nu',
        'pr-coverage': 'Dækningsperiode',
        'minmax-title': 'Min/Max Lagermodel',
        'minmax-desc': 'Komplet visuelt warehouse dashboard. Sæt minimum og maximum lagerniveauer, og få øjeblikkelig status (Kritisk/Lav/Normal/Overfyldt) med grafisk oversigt. Ideel til lagerbestyrelse der arbejder med faste grænser.',
        'mm-min-level': 'Min Niveau',
        'mm-max-level': 'Max Niveau',
        'mm-safety-stock': 'Sikkerhedslager',
        'mm-current-level': 'Nuværende Niveau',
        'mm-order-needed': 'Bestil Nu',
        'mm-capacity': 'Kapacitet Brugt',
        'mm-days-to-min': 'Dage til Min',
        'mm-chart-title': 'Lagerniveau Visualisering',
        'inventory-status': 'Lagerstatus',
        'mm-status-label': 'Status',
        'mm-status-critical': 'Kritisk',
        'mm-status-low': 'Lav',
        'mm-status-overfilled': 'Overfyldt',
        'mm-status-normal': 'Normal',
        'no-custom-pages-yet': 'Ingen brugerdefinerede sider endnu',
        'click-create-to-start': 'Klik "Opret Ny Side" ovenfor for at komme i gang',
        'create-first-page-btn': '✨ Opret Din Første Side',
        'site-title': 'Smart Logistics Calculator',
        'mm-legend-max-label': 'Max',
        'mm-legend-min-label': 'Min',
        'mm-legend-safety-label': 'Sikkerhedslager',
        'mm-legend-max': 'Bestil ikke mere når dette niveau er nået',
        'mm-legend-min': 'Bestil når lageret når dette punkt',
        'mm-legend-safety': 'Buffer mod udsving i efterspørgsel',
        'pr-chart-title': 'Periodisk Gennemgang - Lagerniveau over tid',
        'pr-dataset-stock': 'Lagerbeholdning',
        'pr-dataset-target': 'Målniveau',
        'pr-dataset-safety': 'Sikkerhedslager',
        'mm-chart-label': 'Lagerstatus',
        'mm-dataset-safety': 'Sikkerhedslager',
        'mm-dataset-min-current': 'Min → Aktuelt',
        'mm-dataset-current-max': 'Aktuelt → Max',
        'mm-min-hint': 'Laveste acceptabelt',
        'mm-max-hint': 'Højeste ønsket',
        'mm-eoq-hint': 'Optimal bestilling',
        'mm-safety-hint': 'Buffer',
        'mm-current-hint': 'På lager nu',
        'pr-current-hint': 'Enheder på lager nu',
        'day-abbr': 'Dag',
        'days-abbr': 'dage',
        'units': 'enheder',
        'no-analysis-yet': 'Ingen analyse endnu',
        // Advanced Filters
        'filters-search-title': 'Avancerede Filtre & Søgning',
        'filters-description': 'Søg, filtrer og sorter dine resultater',
        'filters-reset': 'Nulstil',
        'filter-search-placeholder': 'Søg varenavne...',
        'search-placeholder': 'Søg på varenavn...',
        'filter-all-classes': 'Alle Klasser',
        'sort-value-desc': 'Værdi (Høj-Lav)',
        'sort-value-asc': 'Værdi (Lav-Høj)',
        'sort-name-asc': 'Navn (A-Å)',
        'sort-name-desc': 'Navn (Å-A)',
        'sort-consumption-desc': 'Forbrug (Høj-Lav)',
        'filter-min-value': 'Min Værdi',
        'filter-max-value': 'Maks Værdi',
        'filter-showing': 'Viser',
        'filter-items': 'varer',
        // Wilson hints
        'demand-hint': 'Antal enheder pr. år',
        'order-cost-hint': 'Pris pr. ordre',
        'price-hint': 'Stykpris',
        'interest-hint': 'Lagerrentesats i procent',
        // Learn page
        'try-now': 'Prøv Det Nu!',
        'try-now-desc': 'Indlæs eksempel data og start analyse',
        'advanced-topics': 'Vil du lære mere? Udvid sektionerne nedenfor',
        // Pagination
        'showing': 'Viser',
        'of': 'af',
        'load-more': 'Indlæs Flere',
        'load-all': 'Indlæs Alle',
        'loaded': 'Indlæst',
        'more-items': 'flere varer',
        'items': 'varer',
        'search-items': 'Søg varer',
        'filter-by-category': 'Filtrer på kategori',
        'all-categories': 'Alle kategorier',
        'sort-by': 'Sorter efter',
        'sort-name-asc': 'Navn (A-Å)',
        'sort-name-desc': 'Navn (Å-A)',
        'reset-filters': 'Nulstil filtre',
        // Performance
        'perf-large-dataset': 'Stort Datasæt Detekteret',
        // ABC Double Analysis
        'abc-double-tab': 'ABC Dobbelt',
        'abc-double-title': 'ABC Dobbelt Analyse',
        'abc-double-desc': 'Analysér varer baseret på både værdi og forbrug for optimal lagerstyring',
        'double-abc-btn': 'Dobbelt ABC',
        'double-abc-info-title': 'Hvad er ABC Dobbelt Analyse?',
        'double-abc-info-text': 'Dobbelt ABC analyse klassificerer varer i en 3×3 matrix baseret på to kriterier: Værdi (Pris × Forbrug) og Forbrug. Dette giver 9 kategorier (AA, AB, AC, BA, BB, BC, CA, CB, CC) for mere præcis lagerstyring.',
        'double-matrix-title': '📊 Dobbelt ABC Matrix',
        'double-matrix-axes': 'Første bogstav: Værdi | Andet bogstav: Forbrug',
        'consumption-high': 'Forbrug A',
        'consumption-medium': 'Forbrug B',
        'consumption-low': 'Forbrug C',
        'value-high': 'Værdi A',
        'value-medium': 'Værdi B',
        'value-low': 'Værdi C',
        'aa-recommendation': 'Højeste prioritet: Nøje overvågning, daglig opfølgning, lave sikkerhedslagre',
        'bb-recommendation': 'Mellem prioritet: Ugentlig kontrol, moderate sikkerhedslagre',
        'cc-recommendation': 'Laveste prioritet: Månedlig eller kvartalsvis kontrol, høje sikkerhedslagre',
        'category-details': 'Kategori Detaljer:',
        'high-priority-items': 'Høj Prioritet (AA+AB+BA)',
        'medium-priority-items': 'Mellem Prioritet (BB+AC+CA)',
        'low-priority-items': 'Lav Prioritet (BC+CB+CC)',
        'all-items-table': '📋 Alle Varer med Dobbelt Klassificering',
        'value-class': 'Værdi Klasse',
        'consumption-class': 'Forbrug Klasse',
        'double-class': 'Dobbelt Klasse',
        'priority': 'Prioritet',
        'high': 'Høj',
        'medium': 'Mellem',
        'low': 'Lav',
        'no-items-category': 'Ingen varer i denne kategori',
        'value-percent': 'Værdi %',
        'customize-axes': 'Tilpas Akser',
        'horizontal-axis': 'Vandret Akse (Kolonne)',
        'vertical-axis': 'Lodret Akse (Række)',
        'detected-column': 'Detekteret:',
        'auto-calculated': 'Auto-beregnet:',
        'apply-labels': 'Anvend Ændringer',
        'double-abc-thresholds-setting': 'Dobbelt ABC Tærskler',
        'double-abc-thresholds-description': 'Tilpas tærskler for både værdi og forbrug dimensioner',
        'value-thresholds': 'Værdi Tærskler',
        'consumption-thresholds': 'Forbrug Tærskler',
        'double-threshold-note': 'Standard er 70/20/10 for begge dimensioner. C beregnes automatisk.',
        'exercise-4-title': 'Øvelse 4: ABC Dobbelt Analyse',
        'exercise-4-desc': 'Indlæs et datasæt og brug ABC Dobbelt analysen til at identificere AA-varer (høj værdi OG højt forbrug). Hvordan adskiller de sig fra andre A-varer?',
        // ABC Double category translations (Danish)
        'abc-double-categories-title': 'Eksempler på kategorier:',
        'abc-double-aa-label': 'AA-varer:',
        'abc-double-aa-desc': 'Høj værdi OG højt forbrug - Kræver tæt overvågning, præcis prognose, og stramme sikkerhedslagre',
        'abc-double-ab-ba-label': 'AB/BA-varer:',
        'abc-double-ab-ba-desc': 'En dimension er høj - Moderat opmærksomhed, fleksibel lagerstyring',
        'abc-double-bb-label': 'BB-varer:',
        'abc-double-bb-desc': 'Medium på begge dimensioner - Standard lagerprocedurer',
        'abc-double-cc-label': 'CC-varer:',
        'abc-double-cc-desc': 'Lav værdi OG lavt forbrug - Minimal kontrol, periodisk gennemgang, store ordremængder',
        'labels-applied': 'Etiketter anvendt succesfuldt',
        'double-abc-dimensions': 'Vælg Analyse Kolonner',
        'double-abc-config': 'Dobbelt ABC Indstillinger',
        'double-abc-config-desc': 'Vælg kolonner til analyse og tilpas ABC-tærskler',
        'quality-check-title': '📊 Datakvalitets Tjek',
        'select-column': 'Vælg kolonne...',
        'auto-calculated-column': 'Auto-beregnet (Pris × Forbrug)',
        'vertical-axis-first': 'Lodret Akse (Første Bogstav)',
        'horizontal-axis-second': 'Vandret Akse (Andet Bogstav)',
        'apply-columns': '✓ Anvend Kolonner',
        'default-service-level-setting': 'Standard Serviceniveau',
        'default-service-level-desc': 'Vælg standard serviceniveau for genbestillingspunkt beregninger',
        'auto-save-setting': 'Auto-gem Resultater',
        'auto-save-desc': 'Gem automatisk analyseresultater til næste session',
        'rop-formula-text-1': 'ROP = (Dagligt Forbrug × Leveringstid) + Sikkerhedslager',
        'rop-formula-text-2': 'Sikkerhedslager = Z-score × σ × √Leveringstid',
        'pr-formula-text-1': 'Målniveau = Dagligt Forbrug × (Gennemgangsperiode + Leveringstid) + Sikkerhedslager',
        'pr-formula-text-2': 'Bestillingsmængde = Målniveau - Nuværende Beholdning',
        'mm-formula-text-1': 'Min = Sikkerhedslager + (Dagligt Forbrug × Leveringstid)',
        'mm-formula-text-2': 'Max = Min + Optimal Ordremængde (EOQ)',
        'mm-status-critical': 'Kritisk:',
        'mm-status-low': 'Lav:',
        'mm-status-overfilled': 'Overfyldt:',
        'mm-status-normal': 'Normal:',
        'mm-status-critical-desc': 'Under sikkerhedslager',
        'mm-status-low-desc': 'Under min',
        'mm-status-normal-desc': 'Mellem min-max',
        'mm-status-overfilled-desc': 'Over max',
        'units': 'enheder',
        'days': 'dage',
        'days-abbr': 'dage',
        'mm-chart-subtitle': 'Aktuelt niveau',
        'mm-chart-label-safety': 'Sikkerhedslager',
        'mm-chart-label-min-current': 'Min → Aktuelt',
        'mm-chart-label-current-max': 'Aktuelt → Max',
        
        // LEAN Tools translations (Danish)
        'lean-title': 'LEAN Værktøjer',
        'lean-calculators-title': 'Interaktive Beregnere',
        'lean-oee-title': 'OEE Beregner',
        'lean-oee-subtitle': 'Samlet Udstyrs Effektivitet',
        'lean-oee-availability': 'Tilgængelighed (%)',
        'lean-oee-availability-hint': '= Driftstid / Planlagt Tid',
        'lean-oee-performance': 'Ydelse (%)',
        'lean-oee-performance-hint': '= Ideal Hastighed / Faktisk Hastighed',
        'lean-oee-quality': 'Kvalitet (%)',
        'lean-oee-quality-hint': '= Gode Enheder / Totale Enheder',
        'lean-oee-result': 'Overall Equipment Effectiveness',
        'lean-oee-poor': 'Dårlig - Behøver Forbedring',
        'lean-oee-average': 'Gennemsnitlig - Plads til Vækst',
        'lean-oee-good': 'God - Over Gennemsnittet',
        'lean-oee-world-class': 'World Class Excellence!',
        'lean-oee-benchmark-poor': 'Dårlig',
        'lean-oee-benchmark-avg': 'Gennemsnitlig',
        'lean-oee-benchmark-wc': 'World Class',
        'lean-waste-cost-placeholder': 'Omkostning',
        'lean-reset': 'Nulstil',
        'lean-copy': 'Kopiér',
        'lean-smed-title': 'SMED Besparelser',
        'lean-smed-subtitle': 'Single-Minute Exchange of Die',
        'lean-smed-current': 'Nuværende Opstillingstid (minutter)',
        'lean-smed-target': 'Målets Opstillingstid (minutter)',
        'lean-smed-frequency': 'Opstillinger pr. År',
        'lean-smed-hourly-cost': 'Timepris (kr/time)',
        'lean-smed-time-saved': 'Tid Sparet/Opstilling',
        'lean-smed-reduction': 'Reduktion',
        'lean-smed-annual-savings': 'Årlige Besparelser',
        'lean-smed-hours-saved': 'timer sparet',
        'lean-waste-title': '7 Spildtyper Omkostning',
        'lean-waste-subtitle': 'Muda Omkostningsberegner',
        'lean-waste-overproduction': 'Overproduktion',
        'lean-waste-overproduction-hint': '(Laver mere end nødvendigt)',
        'lean-waste-waiting': 'Ventetid',
        'lean-waste-waiting-hint': '(Stilstandstid)',
        'lean-waste-transport': 'Transport',
        'lean-waste-transport-hint': '(Flytning af materialer)',
        'lean-waste-processing': 'Overbearbejdning',
        'lean-waste-processing-hint': '(Gør mere end påkrævet)',
        'lean-waste-inventory': 'Lager',
        'lean-waste-inventory-hint': '(Overskydende lager)',
        'lean-waste-motion': 'Bevægelse',
        'lean-waste-motion-hint': '(Unødvendig bevægelse)',
        'lean-waste-defects': 'Defekter',
        'lean-waste-defects-hint': '(Omarbejdning/Spild)',
        'lean-waste-total': 'Total Spild Omkostning',
        'lean-waste-count': 'spildtyper valgt',
        'lean-swot-title': 'SWOT Analyse',
        'lean-swot-subtitle': 'Strategisk Planlægningsmatrix',
        'lean-swot-strengths': '💪 Styrker',
        'lean-swot-weaknesses': '⚠️ Svagheder',
        'lean-swot-opportunities': '🚀 Muligheder',
        'lean-swot-threats': '⚡ Trusler',
        'lean-swot-strengths-placeholder': 'Interne positive faktorer...',
        'lean-swot-weaknesses-placeholder': 'Interne negative faktorer...',
        'lean-swot-opportunities-placeholder': 'Eksterne positive faktorer...',
        'lean-swot-threats-placeholder': 'Eksterne negative faktorer...',
        'lean-swot-save': '💾 Gem',
        'lean-swot-export': '📥 Eksportér',
        'lean-swot-clear': '🗑️ Ryd',
        'lean-swot-export-markdown': '📄 Eksportér som Markdown',
        'lean-swot-export-png': '🖼️ Eksportér som Billede (PNG)',
        // LEAN Dashboard
        'lean-dashboard-title': 'LEAN Dashboard',
        'last-updated': 'Sidst opdateret:',
        'optimal': 'Optimal',
        'needs-attention': 'Opmærksomhed',
        'critical': 'Kritisk',
        'export-report': 'Eksporter',
        // Improvement Tracker
        'lean-tracker-title': 'Forbedringstracker',
        'lean-tracker-add': 'Tilføj Forbedring',
        'lean-tracker-area': 'Område',
        'lean-tracker-before': 'Før',
        'lean-tracker-after': 'Efter',
        'lean-tracker-notes': 'Noter',
        'lean-tracker-save': 'Gem Forbedring',
        'lean-tracker-empty': 'Ingen forbedringer registreret endnu',
        'lean-tracker-total': 'Total Forbedringer',
        'lean-tracker-avg': 'Gns. Forbedring',
        'lean-tracker-this-month': 'Denne Måned',
        // What-If Scenarios
        'lean-whatif-title': 'What-If Scenarier',
        'lean-whatif-params': 'Juster Parametre',
        'lean-whatif-results': 'Scenarie Resultater',
        'lean-whatif-impact': 'Samlet Forventet Gevinst',
        // Section Titles
        'lean-metrics-title': 'Præstationsmetrikker',
        'lean-improvement-title': 'Procesforbedring',
        'lean-planning-title': 'Strategisk Planlægning',
        'lean-reference-title': 'Reference Bibliotek',
        'lean-purpose': 'Formål:',
        'lean-5s-title': '5S System',
        'lean-5s-sort': '1. Sortér',
        'lean-5s-sort-desc': '(Seiri) - Fjern unødvendige ting',
        'lean-5s-order': '2. Sæt i Orden',
        'lean-5s-order-desc': '(Seiton) - Organisér arbejdsplads',
        'lean-5s-shine': '3. Skinnende',
        'lean-5s-shine-desc': '(Seiso) - Rengør grundigt',
        'lean-5s-standardize': '4. Standardisér',
        'lean-5s-standardize-desc': '(Seiketsu) - Opret standarder',
        'lean-5s-sustain': '5. Fasthold',
        'lean-5s-sustain-desc': '(Shitsuke) - Oprethold disciplin',
        'lean-5s-purpose': 'Arbejdspladsorganisationsmetode for effektivitet og sikkerhed',
        'lean-7r-title': '7R Principper',
        'lean-7r-product': 'Rigtigt Produkt',
        'lean-7r-product-desc': 'Korrekt vare',
        'lean-7r-quantity': 'Rigtig Mængde',
        'lean-7r-quantity-desc': 'Eksakt mængde',
        'lean-7r-condition': 'Rigtig Tilstand',
        'lean-7r-condition-desc': 'Perfekt kvalitet',
        'lean-7r-place': 'Rigtigt Sted',
        'lean-7r-place-desc': 'Korrekt placering',
        'lean-7r-time': 'Rigtig Tid',
        'lean-7r-time-desc': 'Når det er nødvendigt',
        'lean-7r-customer': 'Rigtig Kunde',
        'lean-7r-customer-desc': 'Korrekt modtager',
        'lean-7r-cost': 'Rigtig Pris',
        'lean-7r-cost-desc': 'Optimal pris',
        'lean-7r-purpose': 'Logistisk excellenceramme',
        'lean-3m-title': '3M - Spildtyper',
        'lean-3m-muda': 'Muda (Spild)',
        'lean-3m-muda-desc': 'Aktiviteter der forbruger ressourcer uden at tilføje værdi. De 7 spild.',
        'lean-3m-mura': 'Mura (Ujævnhed)',
        'lean-3m-mura-desc': 'Uoverensstemmelse i operationer som forårsager uregelmæssigt workflow og efterspørgselstoppe.',
        'lean-3m-muri': 'Muri (Overbebyr delse)',
        'lean-3m-muri-desc': 'Urimeligt arbejde pålagt medarbejdere eller udstyr ud over kapacitet.',
        'lean-3m-purpose': 'Rod årsager til operationel ineffektivitet',
        'lean-pdca-title': 'PDCA Cyklus',
        'lean-pdca-plan': 'Planlæg',
        'lean-pdca-plan-desc': 'Identificér og analysér problemet',
        'lean-pdca-do': 'Gør',
        'lean-pdca-do-desc': 'Udvikle og teste løsning',
        'lean-pdca-check': 'Tjek',
        'lean-pdca-check-desc': 'Studér resultater og mål effektivitet',
        'lean-pdca-act': 'Handl',
        'lean-pdca-act-desc': 'Standardisér og gentag',
        'lean-pdca-purpose': 'Kontinuerlig forbedringsmetodologi',
        'lean-jit-title': 'JIT & Kanban',
        'lean-jit-subtitle': 'Just-In-Time (JIT)',
        'lean-jit-produce': 'Producér kun det der er nødvendigt',
        'lean-jit-when': 'Når det er nødvendigt',
        'lean-jit-quantity': 'I den nødvendige mængde',
        'lean-jit-minimize': 'Minimér lageromkostninger',
        'lean-kanban-subtitle': 'Kanban System',
        'lean-kanban-visual': 'Visuel workflow-styring',
        'lean-kanban-pull': 'Pull-baseret produktion',
        'lean-kanban-signal': 'Signalkort udløser genopfyldning',
        'lean-kanban-wip': 'WIP (Work In Progress) grænser',
        'lean-jit-purpose': 'Flow-optimering og lagerreduktion',
        'lean-fifo-title': 'FIFO & Kaizen',
        'lean-fifo-subtitle': 'FIFO (First-In-First-Out)',
        'lean-fifo-oldest': 'Brug ældste lager først',
        'lean-fifo-prevent': 'Forebygger forældelse',
        'lean-fifo-critical': 'Kritisk for letfordærvelige varer',
        'lean-fifo-reduce': 'Reducerer spild og tab',
        'lean-kaizen-subtitle': 'Kaizen (Kontinuerlig Forbedring)',
        'lean-kaizen-small': 'Små, trinvise ændringer',
        'lean-kaizen-employee': 'Medarbejderinddragelse',
        'lean-kaizen-ongoing': 'Løbende forbedringskultur',
        'lean-kaizen-focus': 'Fokus på processer',
        'lean-fifo-purpose': 'Lagerdisciplin og kontinuerlig forbedring',
        // New Time Calculators
        'lean-time-title': 'Produktionstidsanalyse',
        'lean-time-subtitle': 'Takt, Cyklus & Gennemløbstid',
        'lean-takt-title': '⏰ Takt Tid',
        'lean-takt-available': 'Tilgængelig Tid (min/dag)',
        'lean-takt-demand': 'Kundeefterspørgsel (enheder/dag)',
        'lean-takt-result': 'Takt Tid',
        'lean-takt-desc': 'Påkrævet tempo for at møde efterspørgslen',
        'lean-cycle-title': '🔄 Cyklustid',
        'lean-cycle-units': 'Producerede Enheder',
        'lean-cycle-time': 'Total Tid (minutter)',
        'lean-cycle-result': 'Cyklustid',
        'lean-cycle-desc': 'Faktisk tid pr. enhed',
        'lean-lead-title': '📦 Gennemløbstid',
        'lean-lead-process': 'Proces (min)',
        'lean-lead-queue': 'Kø (min)',
        'lean-lead-transport': 'Transport (min)',
        'lean-lead-result': 'Total Gennemløbstid',
        'lean-lead-hours': 'Timer:',
        'lean-lead-days': 'Dage:',
        'lean-analysis-title': '📊 Produktionsanalyse',
        'lean-analysis-capacity': 'Kapacitetsudnyttelse',
        'lean-analysis-buffer': 'Buffer Tid',
        // VSM Tool
        'lean-vsm-title': 'Value Stream Mapping',
        'lean-vsm-subtitle': 'Visualisér Procesflow & Spild',
        'lean-vsm-clear': 'Ryd',
        'lean-vsm-export': 'Eksportér PNG',
        'lean-vsm-canvas': 'Procesflow Canvas',
        'lean-vsm-add': '+ Tilføj Proces',
        'lean-vsm-processes': 'Procestrin',
        'lean-vsm-empty': 'Klik "+ Tilføj Proces" for at starte kortlægning',
        'lean-vsm-total-time': 'Total Gennemløbstid',
        'lean-vsm-value-time': 'Værditilføjende Tid',
        'lean-vsm-waste-pct': 'Spild %',
        // Kaizen Event Planner
        'lean-kaizen-title': 'Kaizen Event Planner',
        'lean-kaizen-subtitle': 'Kontinuerlig Forbedringsbegivenhed',
        'lean-kaizen-save': '💾 Gem',
        'lean-kaizen-export': '📥 Eksportér',
        'lean-kaizen-problem': '🎯 Problembeskrivelse',
        'lean-kaizen-problem-placeholder': 'Beskriv problemet eller muligheden for forbedring...',
        'lean-kaizen-current': '📊 Nuværende Tilstand',
        'lean-kaizen-target': '🎯 Måltilstand',
        'lean-kaizen-metric': 'Metriknavn',
        'lean-kaizen-metric-placeholder': 'f.eks. Cyklustid, Defektrate',
        'lean-kaizen-value': 'Nuværende Værdi',
        'lean-kaizen-unit': 'Enhed',
        'lean-kaizen-target-value': 'Målværdi',
        'lean-kaizen-improvement': 'Forbedring',
        'lean-kaizen-roi': '💰 ROI Beregner',
        'lean-kaizen-cost': 'Implementeringsomkostning (kr)',
        'lean-kaizen-annual-savings': 'Årlige Besparelser (kr)',
        'lean-kaizen-payback': 'Tilbagebetalingsperiode',
        'lean-kaizen-roi-pct': 'ROI %',
        'lean-kaizen-actions': '✓ Handlingspunkter',
        'lean-kaizen-add-action': '+ Tilføj Handling',
        'lean-kaizen-empty': 'Ingen handlingspunkter endnu. Klik "+ Tilføj Handling" for at starte.',
        'lean-integration-title': 'Integration med Dit Dashboard',
        'lean-integration-eoq': 'Forbind EOQ til JIT',
        'lean-integration-eoq-desc': 'Brug dine EOQ-beregninger fra Wilson-fanen til at understøtte Just-In-Time bestillingsbeslutninger',
        'lean-integration-abc': 'ABC med Kanban',
        'lean-integration-abc-desc': 'Anvend Kanban-principper til A-varer for strammere kontrol og B/C-varer for enklere genopfyldning',
        'lean-integration-rop': 'ROP med FIFO',
        'lean-integration-rop-desc': 'Forbind genbestillingspunkter fra Lagerstyring til FIFO lagerorganisering',
        'template-library-title': '📚 Skabelonbibliotek',
        'template-search-placeholder': 'Søg skabeloner...',
        'template-category-all': 'Alle Kategorier',
        'template-category-logistics': '📦 Logistik',
        'template-category-lean': '🏭 LEAN Produktion',
        'template-category-finance': '💰 Finans',
        'template-category-math': '🔢 Matematik & Videnskab',
        'template-clear-filters': 'Ryd filtre',
        'template-no-results': 'Ingen skabeloner fundet',
        'template-try-different': 'Prøv en anden søgning eller kategori',
        'template-count': 'skabeloner',
        
        // Logistics Templates
        'template-logistics-eoq-name': 'EOQ (Wilson Formel)',
        'template-logistics-eoq-desc': 'Økonomisk ordremængde beregner',
        'template-logistics-rop-name': 'Genbestillingspunkt (ROP)',
        'template-logistics-rop-desc': 'Beregn hvornår du skal genbestille lager',
        'template-logistics-safety-name': 'Sikkerhedslager Beregner',
        'template-logistics-safety-desc': 'Bestem optimale sikkerhedslagerniveauer',
        'template-logistics-abc-name': 'ABC Klassificeringshjælper',
        'template-logistics-abc-desc': 'Beregn kumulative procenter til ABC-analyse',
        'template-logistics-minmax-name': 'Min/Max Lagermodel',
        'template-logistics-minmax-desc': 'Beregn minimum og maksimum lagerniveauer',
        'template-logistics-forecast-name': 'Efterspørgselsprognose (Glidende Gennemsnit)',
        'template-logistics-forecast-desc': 'Forudsig fremtidig efterspørgsel ved hjælp af glidende gennemsnit',
        'template-logistics-breakeven-name': 'Break-Even Analyse',
        'template-logistics-breakeven-desc': 'Find rentabilitetspunkt for produkter',
        'template-logistics-turnover-name': 'Lageromsætningsforhold',
        'template-logistics-turnover-desc': 'Mål lagereffektivitet',
        'template-logistics-tco-name': 'Totale Ejeromkostninger (TCO)',
        'template-logistics-tco-desc': 'Beregn den sande omkostning ved lagerføring',
        'template-logistics-capacity-name': 'Kapacitetsplanlægning',
        'template-logistics-capacity-desc': 'Planlæg produktionskapacitet og udnyttelse',
        'template-logistics-leadtime-name': 'Leveringstidsanalyse',
        'template-logistics-leadtime-desc': 'Analysér leveringstidskomponenter',
        'template-logistics-warehouse-name': 'Lagerplads Beregner',
        'template-logistics-warehouse-desc': 'Beregn nødvendig lagerplads',
        'template-logistics-pareto-name': 'Pareto-analyse (80/20)',
        'template-logistics-pareto-desc': 'Identificer kritiske få elementer',
        'template-logistics-truck-name': 'Lastbilbelastningsoptimering',
        'template-logistics-truck-desc': 'Maksimér lastbilkapacitetsudnyttelse',
        'template-logistics-cycle-name': 'Cyklusoptællingsplanlægning',
        'template-logistics-cycle-desc': 'Planlæg hyppighed for lagertælling',
        'template-logistics-stockout-name': 'Udsolgtomkostningsberegner',
        'template-logistics-stockout-desc': 'Beregn økonomisk indvirkning af mangler',
        
        // LEAN Templates
        'template-lean-oee-name': 'OEE Beregner',
        'template-lean-oee-desc': 'Beregn Samlet Udstyrseffektivitet',
        'template-lean-smed-name': 'SMED Analyse',
        'template-lean-smed-desc': 'Single-Minute Exchange of Die - Reduktion af omstillingstid',
        'template-lean-takt-name': 'Takttid Beregner',
        'template-lean-takt-desc': 'Beregn produktionstakten for at opfylde kundeefterspørgsel',
        'template-lean-cycle-name': 'Cyklustidsanalyse',
        'template-lean-cycle-desc': 'Sammenlign cyklustid med takttid',
        'template-lean-vsm-name': 'Value Stream Mapping Metrikker',
        'template-lean-vsm-desc': 'Beregn værditilvækstforhold og leveringstid',
        'template-lean-kaizen-name': 'Kaizen Event ROI',
        'template-lean-kaizen-desc': 'Beregn afkast på investering for forbedringsevents',
        'template-lean-5s-name': '5S Score Beregner',
        'template-lean-5s-desc': 'Evaluér 5S implementeringsmodenhed',
        'template-lean-kanban-name': 'Kanban Kortberegner',
        'template-lean-kanban-desc': 'Beregn antal nødvendige kanban-kort',
        'template-lean-heijunka-name': 'Produktionsnivellering (Heijunka)',
        'template-lean-heijunka-desc': 'Beregn produktionsnivelleringsplan',
        'template-lean-standard-name': 'Standardarbejdsberegner',
        'template-lean-standard-desc': 'Beregn standardarbejdskomponenter',
        'template-lean-pull-name': 'Pull-systemdimensionering',
        'template-lean-pull-desc': 'Beregn bufferstørrelser til pull-produktion',
        'template-lean-changeover-name': 'Omstillingsreduktionsanalyse',
        'template-lean-changeover-desc': 'Analysér omstillingstidskomponenter',
        'template-lean-visual-name': 'Visuel Styringsmetrikker',
        'template-lean-visual-desc': 'Beregn effektiviteten af visuel styring',
        'template-lean-gemba-name': 'Gemba Walk Metrikker',
        'template-lean-gemba-desc': 'Spor gemba walk-observationer og handlinger',
        'template-lean-pokayoke-name': 'Poka-Yoke Design Beregner',
        'template-lean-pokayoke-desc': 'Beregn fejlsikringseffektivitet',
        
        // Finance Templates
        'template-finance-roi-name': 'ROI Beregner',
        'template-finance-roi-desc': 'Beregn afkast på investering',
        'template-finance-npv-name': 'NPV Beregner',
        'template-finance-npv-desc': 'Beregn nutidsværdi',
        'template-finance-payback-name': 'Tilbagebetalingsperiode',
        'template-finance-payback-desc': 'Beregn tid til at genvinde investering',
        'template-finance-depreciation-name': 'Afskrivningsberegner',
        'template-finance-depreciation-desc': 'Beregn lineær og degressiv afskrivning',
        'template-finance-working-name': 'Arbejdskapitalforhold',
        'template-finance-working-desc': 'Mål kortsigtet likviditet',
        'template-finance-profit-name': 'Avanceanalyse',
        'template-finance-profit-desc': 'Beregn forskellige fortjenstmargener',
        'template-finance-ebitda-name': 'EBITDA Beregner',
        'template-finance-ebitda-desc': 'Beregn indtjening før renter, skat, afskrivninger',
        'template-finance-breakeven-name': 'Break-Even Point',
        'template-finance-breakeven-desc': 'Beregn break-even i enheder og omsætning',
        'template-finance-debt-name': 'Gæld-til-Egenkapital-forhold',
        'template-finance-debt-desc': 'Mål finansiel gearing',
        'template-finance-cashflow-name': 'Pengestrømsanalyse',
        'template-finance-cashflow-desc': 'Analysér driftspengestrøm',
        'template-finance-variance-name': 'Budgetafvigelsesanalyse',
        'template-finance-variance-desc': 'Sammenlign faktisk vs. budgetteret præstation',
        'template-finance-costbenefit-name': 'Omkostnings-Fordel-analyse',
        'template-finance-costbenefit-desc': 'Evaluér projektlevedygtighed',
        'template-finance-elasticity-name': 'Priselasticitet',
        'template-finance-elasticity-desc': 'Beregn efterspørgselspriselasticitet',
        'template-finance-eoq-name': 'Økonomisk Ordremængde (Finansvisning)',
        'template-finance-eoq-desc': 'Optimér ordremængder med finansielt fokus',
        
        // Math Templates
        'template-math-percentage-name': 'Procentberegner',
        'template-math-percentage-desc': 'Beregn procenter og ændringer',
        'template-math-linear-name': 'Lineær Ligningsløser',
        'template-math-linear-desc': 'Løs y = mx + b',
        'template-math-compound-name': 'Renters Rente',
        'template-math-compound-desc': 'Beregn renters rente over tid',
        
        // Cargo Securing
        'cargo-tab': 'Lastsikring',
        'cargo-title': 'Lastsikring',
        'cargo-intro-title': '📖 Om Lastsikring - Dansk Transportguide',
        'cargo-intro-text': 'Denne beregner er baseret på den danske guide "Lastsikring ved transport ad landevej" med standardværdier LC 1600 daN og STF 400 daN.',
        'cargo-friction-table-title': 'Friktionskoefficient (μ) - Referencetabel',
        'cargo-acceleration-title': 'Accelerationskræfter ved Transport',
        'cargo-tips-title': 'Vigtige Regler fra Lastsikringsguiden',
        'cargo-standards-title': '📏 Standardværdier',
        'cargo-standard-lc': 'Standard LC (Lashing Capacity)',
        'cargo-standard-stf': 'Standard STF (Standard Tension Force)',
        'cargo-actual-lc': 'Aktuel LC (daN)',
        'cargo-actual-stf': 'Aktuel STF (daN)',
        'cargo-formula': 'Formel:',
        'cargo-conversion-factor': 'Omregningsfaktor:',
        'cargo-type1-title': 'Loop-/Frictional-/Direkte Surring',
        'cargo-type2-title': 'Overfaldssurring',
        'cargo-sliding': 'Ved Glidning',
        'cargo-tipping': 'Ved Tipning',
        'cargo-tipping-rule': 'Regel:',
        'cargo-tipping-desc': 'Den laveste værdi af:',
        'cargo-tips-title': 'Gode Råd',
        'cargo-tip1': 'En omregningsfaktor > 1.0 betyder at dit surringsgrej er stærkere end standarden',
        'cargo-tip2': 'Hvis omregningsfaktoren er mindre end 1.0, skal du bruge flere surringer eller stærkere grej',
        'cargo-tip3': 'Ved overfaldssurring og tipning skal du altid bruge den laveste værdi for at være på den sikre side',
        'cargo-tip4': 'Husk at kontrollere dit surringsgrej regelmæssigt for slitage og skader',
        'cargo-reference-title': 'Hurtig Reference',
        'cargo-ref-type': 'Type',
        'cargo-ref-scenario': 'Scenarie',
        'cargo-ref-formula': 'Formel',
        'cargo-ref-loop': 'Loop Surring',
        'cargo-ref-frictional': 'Frictional Surring',
        'cargo-ref-direct': 'Direkte Surring',
        'cargo-ref-topover': 'Overfaldssurring',
        'cargo-ref-all': 'Alle',
        
        // Cargo Securing - Advanced
        'cargo-weight': 'Lastvægt (kg)',
        'cargo-weight-help': 'Total vægt af last',
        'cargo-lc-help': 'Lashing Capacity - maksimal bæreevne',
        'cargo-stf-help': 'Standard Tension Force - forspændingskraft',
        'cargo-accel-forward': 'Acceleration fremad (g)',
        'cargo-accel-forward-help': 'Standard: 0.8g (opbremsning)',
        'cargo-accel-backward': 'Acceleration bagud (g)',
        'cargo-accel-backward-help': 'Standard: 0.5g (acceleration)',
        'cargo-accel-sideways': 'Acceleration sideværts (g)',
        'cargo-accel-sideways-help': 'Standard: 0.5g (kurve)',
        'cargo-friction': 'Friktionskoefficient (μ)',
        'cargo-friction-help': 'Vælg baseret på kontaktflade',
        'cargo-angle': 'Surring vinkel (°)',
        'cargo-angle-help': '90° = lodret, < 90° = vinkel',
        'cargo-safety-factor': 'Sikkerhedsfaktor',
        'cargo-safety-help': 'Anbefalet: 1.5 (50% reserve)',
        'cargo-advanced-title': 'Avancerede Beregninger (EN 12195)',
        'cargo-force-forward': 'Kraft fremad (daN)',
        'cargo-force-backward': 'Kraft bagud (daN)',
        'cargo-force-sideways': 'Kraft sideværts (daN)',
        'cargo-friction-force': 'Friktionskraft (daN)',
        'cargo-friction-help-text': 'Naturlig modstand mod glidning',
        'cargo-lashings-forward': 'Antal surringer fremad',
        'cargo-lashings-backward': 'Antal surringer bagud',
        'cargo-lashings-sideways': 'Antal surringer sideværts',
        'cargo-lashings-braking': 'Ved opbremsning',
        'cargo-lashings-accel': 'Ved acceleration',
        'cargo-lashings-curve': 'Ved sving',
        'cargo-safety-recommendations': 'Sikkerhedsanbefalinger',
        'cargo-lashings-needed': 'Antal surringer nødvendigt:',
        'cargo-angle-warning-title': 'Advarsel om vinkel!',
        'cargo-sliding-title': 'Overfaldssurring - GLIDNING',
        'cargo-tipping-title': 'Overfaldssurring - TIPNING',
        'cargo-final-title': 'Samlet Anbefaling',
        'cargo-use-most': 'Brug det højeste antal:',
        'cargo-hb-ratio': 'H/B forhold (Sideretning)',
        'cargo-hb-help': 'Højde / Bredde (for tipning til siden)',
        'cargo-rows': 'Antal rækker surringer',
        'cargo-rows-help': 'Placér båndstrammere skiftevis på hver side',
        'cargo-calculate-btn': '⚡ Beregn Antal Surringer',
        
        // Section titles
        'cargo-section1-title': 'DEL 1: Omregningsfaktorer (Loop/Grime/Direkte Surring)',
        'cargo-section1-desc': 'Indtast din aktuelle LC-værdi for at beregne omregningsfaktoren i forhold til standard LC 1600 daN',
        'cargo-section2-title': 'DEL 2: Overfaldssurring - Beregning af Antal Surringer',
        'cargo-section2-desc': 'Baseret på danske transportstandarder - beregn hvor mange overfaldssurringer der skal bruges',
        
        // Loop/Frictional/Direct Lashing
        'cargo-lashing-types-title': 'Omregningsfaktorer for Forskellige Typer Surringer',
        'cargo-loop-lashing-title': 'Løkkesurring (Loop Lashing)',
        'cargo-loop-actual-lc': 'Aktuel LC (daN)',
        'cargo-loop-factor': 'Omregningsfaktor:',
        'cargo-loop-formula': 'Aktuel LC ÷ 1600',
        'cargo-frictional-lashing-title': 'Grimesurring (Frictional Lashing)',
        'cargo-frictional-actual-lc': 'Aktuel LC (daN)',
        'cargo-frictional-factor': 'Omregningsfaktor:',
        'cargo-frictional-formula': 'Aktuel LC ÷ 1600',
        'cargo-direct-lashing-title': 'Direkte Surring (Direct Lashing)',
        'cargo-direct-actual-lc': 'Aktuel LC (daN)',
        'cargo-direct-factor': 'Omregningsfaktor:',
        'cargo-direct-formula': 'Aktuel LC ÷ 1600',
        
        // Budget Editor
        'budget-tab': 'Budget',
        'budget-title': 'Budget',
        'budget-name': 'Navn',
        'budget-faktiske': 'Faktiske',
        'budget-mdr': 'Mdr.',
        'budget-dag14': '14. Dag',
        'budget-month-jan': 'Januar',
        'budget-month-feb': 'Februar',
        'budget-month-mar': 'Marts',
        'budget-month-apr': 'April',
        'budget-month-may': 'Maj',
        'budget-month-jun': 'Juni',
        'budget-month-jul': 'Juli',
        'budget-month-aug': 'August',
        'budget-month-sep': 'September',
        'budget-month-oct': 'Oktober',
        'budget-month-nov': 'November',
        'budget-month-dec': 'December',
        'budget-add-income': 'Tilføj Indtægt',
        'budget-add-expense': 'Tilføj Udgift',
        'budget-import': 'Importér',
        'budget-export-excel': 'Excel',
        'budget-export-csv': 'CSV',
        'budget-clear': 'Ryd',
        'budget-income-section': 'INDTÆGTER',
        'budget-expense-section': 'UDGIFTER',
        'budget-total-income': 'Total Indtægt',
        'budget-total-expenses': 'Total Udgifter',
        'budget-net': 'Netto',
        'budget-action-delete': 'Slet',
        'budget-message-saved': 'Gemt',
        'budget-message-saving': 'Gemmer...',
        'budget-message-error': 'Fejl ved gemning',
        'budget-message-imported': 'Importeret {count} emner',
        'budget-message-exported': 'Eksporteret til {filename}',
        
        // Budget View Modes
        'budget-view-month': 'Månedsvisning',
        'budget-view-full': 'Helt År',
        'budget-view-month-title': 'Vis én måned ad gangen',
        'budget-view-full-title': 'Vis alle 12 måneder',
        
        // Budget 14-Day Toggle
        'budget-show-14dag': 'Vis 14. Dag',
        'budget-show-14dag-title': 'Vis/skjul 14. dags kolonner',
        
        // Budget Formatting
        'budget-currency': 'Valuta',
        'budget-currency-description': 'Vælg hvilken valuta der skal bruges i budget',
        'budget-number-format': 'Talformat',
        'budget-number-format-description': 'Vælg hvordan tal skal formateres',
        'budget-format-danish': 'Dansk (20.000,00)',
        'budget-format-us': 'US (20,000.00)',
        'budget-format-space': 'Mellemrum (20 000,00)',
        'budget-format-indian': 'Indisk (20,00,000.00)',
        'budget-apply-format': 'Anvend Format',
        
        // Budget Accounts
        'budget-account-daily': 'Daglig Brug',
        'budget-account-budget': 'Budget',
        'budget-transfer-title': 'Konto Overførsel',
        'budget-account-budget-title': 'Budget Konto',
        'budget-account-daily-title': 'Daglig Brug Konto',
        'budget-account-summary': 'Oversigt',
        'budget-transfer-required': 'Påkrævet:',
        'budget-transfer-advised': 'Anbefalet:',
        'budget-transfer-based-on-history': 'Baseret på historiske data',
        'budget-transfer-no-history': 'Ingen historik endnu - tilføj egen buffer',
        'budget-daily-income': 'Indtægt:',
        'budget-daily-expenses': 'Udgifter:',
        'budget-daily-remaining': 'Tilbage:',
        'budget-budget-income': 'Budget Indtægt:',
        'budget-budget-expenses': 'Budget Udgifter:',
        'budget-budget-balance': 'Balance:',
        
        // Budget Placeholders
        'budget-income-name': 'Indtægt navn',
        'budget-expense-name': 'Udgift navn',
        'budget-category-name': 'Kategori navn',
        
        // Budget Help & Guide
        'budget-help-guide': 'Hjælp & Vejledning',
        'budget-help-title': 'Budget Editor Hjælp',
        'budget-help-intro': 'Budget Editoren hjælper dig med at planlægge og spore dine indtægter og udgifter på tværs af 12 måneder med support for 14-dages midt-måned sporing.',
        'budget-help-views-title': 'Visningstilstande',
        'budget-help-view-1': '<strong>Månedsvisning:</strong> Viser én måned ad gangen med faner til at skifte mellem måneder. Fantastisk til detaljeret månedlig planlægning.',
        'budget-help-view-2': '<strong>Helt År:</strong> Viser alle 12 måneder side om side. Perfekt til års-overblik.',
        'budget-help-view-3': '<strong>14. Dag:</strong> Slå 14-dages midt-måned kolonnerne til eller fra. Nyttigt til halvmånedlig budgetsporing.',
        'budget-help-features-title': 'Nøglefunktioner',
        'budget-help-feature-1': '<strong>Kategorier:</strong> Organiser indtægter og udgifter med brugerdefinerede kategorier. Tilføj rækker inden for hver kategori.',
        'budget-help-feature-2': '<strong>Auto-Gem:</strong> Dit budget gemmes automatisk mens du skriver.',
        'budget-help-feature-3': '<strong>Totaler:</strong> Automatisk beregning af totaler pr. måned, pr. kategori og samlet.',
        'budget-help-feature-4': '<strong>Eksport:</strong> Eksportér til Excel eller CSV med fuld formatering og styling.',
        'budget-help-shortcuts-title': 'Hurtige Tips',
        'budget-help-shortcut-1': 'Brug <kbd>Tab</kbd> til at bevæge dig hurtigt mellem celler',
        'budget-help-shortcut-2': 'Klik "Tilføj Kategori" for at oprette nye kategorier',
        'budget-help-shortcut-3': 'Brug "Ryd" til at nulstille alle data (med bekræftelse)',
        'budget-help-shortcut-4': 'Importér/Eksportér for at sikkerhedskopiere eller overføre dit budget',
        
        // LEAN Help & Guide
        'lean-help-guide': 'Hjælp & Vejledning',
        'lean-help-title': 'LEAN Værktøjer Hjælp',
        'lean-help-intro': 'LEAN værktøjer hjælper dig med at identificere spild, forbedre effektivitet og optimere dine operationer ved hjælp af dokumenterede produktions- og logistikprincipper.',
        'lean-help-calc-title': 'Beregnere',
        'lean-help-calc-1': '<strong>OEE (Overall Equipment Effectiveness):</strong> Måler hvor effektivt udstyr bruges. Beregnes fra Tilgængelighed × Ydelse × Kvalitet. World-class er 85%+.',
        'lean-help-calc-2': '<strong>SMED (Single-Minute Exchange of Die):</strong> Beregn tids- og omkostningsbesparelser fra reduktion af opstillings-/omstillingstider.',
        'lean-help-calc-3': '<strong>7 Spildtyper:</strong> Spor omkostninger forbundet med de 7 typer af Muda (spild): overproduktion, ventetid, transport, overbearbejdning, lager, bevægelse og defekter.',
        'lean-help-tips-title': 'Brug af LEAN Værktøjer',
        'lean-help-tip-1': '<strong>SWOT Analyse:</strong> Brug til strategisk planlægning for at identificere Styrker, Svagheder, Muligheder og Trusler.',
        'lean-help-tip-2': '<strong>Reference Bibliotek:</strong> Hurtig adgang til LEAN koncepter som 5S, 7R, 3M, PDCA, JIT, Kanban, FIFO og Kaizen.',
        'lean-help-tip-3': '<strong>Integration:</strong> Forbind LEAN principper med din ABC-analyse, EOQ-beregninger og lagerstyring for en holistisk tilgang.',
        
        // Budget Tooltips
        'budget-year-title': 'Vælg eller skriv et år',
        'budget-month-filter-title': 'Månedsoversigt',
        'budget-sidebar-title': 'Årsoversigt sidebar',
        'budget-saved-title': 'Gemt',
        'budget-undo-title': 'Fortryd (Ctrl+Z)',
        'budget-redo-title': 'Gentag (Ctrl+Y)',
        'budget-search-placeholder': '🔍 Søg efter navn...',
        
        // LEAN Tooltips
        'lean-oee-tooltip': 'Hvad er OEE?',
        'lean-smed-tooltip': 'Hvad er SMED?',
        'lean-waste-tooltip': 'Hvad er de 7 spildtyper?',
        
        // Modal/General
        'modal-close-title': 'Luk (Esc)',
        
        // Alert Messages
        'alert-invalid-numbers': 'Indtast venligst gyldige tal i alle felter.',
        'alert-positive-values': 'Alle værdier skal være positive tal større end nul.',
        'alert-interest-limit': 'Renten kan ikke være over 100%',
        'alert-upload-file-type': 'Upload venligst en CSV eller Excel fil',
        'alert-csv-parse-error': 'Fejl ved læsning af CSV fil',
        'alert-excel-parse-error': 'Fejl ved læsning af Excel fil',
        'alert-swot-exported-md': 'SWOT analyse eksporteret som Markdown!',
        'alert-swot-exported-png': 'SWOT analyse eksporteret som PNG billede!',
        
        // Confirm Messages
        'confirm-delete-row': 'Er du sikker på, at du vil slette denne række?',
        'confirm-reset-settings': 'Er du sikker på at du vil nulstille til standardindstillinger?',
        'confirm-delete-shortcut': 'Er du sikker på at du vil slette denne genvej?',
        'confirm-delete-page': 'Er du sikker på, at du vil slette "{name}"?',
        
        // Button Labels (Custom Pages)
        'edit': 'Rediger',
        'duplicate': 'Dupliker',
        'export': 'Eksporter',
        
        // Budget Category Buttons
        'budget-add-income-category': '+ Kategori (I)',
        'budget-add-expense-category': '+ Kategori (U)',
        'budget-add-income-category-title': 'Tilføj indtægtskategori',
        'budget-add-expense-category-title': 'Tilføj udgiftskategori',
        
        // Budget Sidebar & Modal Headings
        'budget-sidebar-heading': '📊 Årsoversigt',
        'budget-month-overview-heading': '📅 Månedsoversigt',
        'budget-select-month-label': 'Vælg måned at fokusere på:',
        
        // Budget Keyboard Shortcuts
        'budget-undo-label': 'Fortryd',
        'budget-redo-label': 'Gentag',
        
        // Budget Overview Dashboard
        'budget-transfer-main-title': 'Budget Oversigt',
        'budget-settings-btn': 'Indstillinger',
        'budget-how-btn': 'Hvordan?',
        'budget-total-income-label': 'Total Indtægt',
        'budget-total-expenses-label': 'Total Udgifter',
        'budget-balance-label': 'Balance',
        'budget-monthly-label': 'Månedlig',
        'budget-biweekly-label': 'Hver 14. dag',
        'budget-whole-year': 'Hele året',
        'budget-surplus-deficit': 'Overskud/Underskud',
        'budget-first-of-month': 'den 1. i måneden',
        'budget-every-other-week': 'Hver anden uge',
        'budget-monthly-trends': 'Månedlige Tendenser',
        'budget-calc-explanation': 'Beregningsforklaring',
        'budget-yearly-calc': 'Årsberegning',
        'budget-total-income-year': 'Total indtægt (hele året):',
        'budget-total-expenses-year': 'Total udgifter (hele året):',
        'budget-required-savings': 'Påkrævet opsparing (årligt):',
        'budget-monthly-breakdown': 'Månedlig opdeling',
        'budget-monthly-breakdown-desc': 'Hvis du overfører <strong>hver måned</strong> (12 gange om året):',
        'budget-monthly-math': 'Årligt beløb ÷ 12 måneder =',
        'budget-biweekly-breakdown': '14-dages opdeling',
        'budget-biweekly-breakdown-desc': 'Hvis du overfører <strong>hver 14. dag</strong> (26 gange om året):',
        'budget-biweekly-math': 'Årligt beløb ÷ 26 perioder =',
        'budget-why-it-works': 'Hvorfor dette virker',
        'budget-why-1': 'Ved at spare op <strong>regelmæssigt</strong>, har du altid penge klar til dine faste udgifter.',
        'budget-why-2': 'Automatiske overførsler betyder, at du <strong>ikke glemmer</strong> at spare op.',
        'budget-why-3': 'Mindre beløb oftere er <strong>lettere at håndtere</strong> end store beløb sjældent.',
        'budget-calc-settings': 'Beregningsindstillinger',
        'budget-split-partner': 'Del udgifter med partner',
        'budget-split-partner-desc': 'Hvis du deler husstandsudgifter med en partner, kan du beregne kun din andel',
        'budget-your-share': 'Din andel:',
        'budget-add-buffer': 'Tilføj sikkerhedsbuffer',
        'budget-add-buffer-desc': 'Tilføj ekstra procent til udgifter for uforudsete udgifter eller stigninger',
        'budget-buffer-pct-label': 'Buffer procent:',
        'budget-example': 'Eksempel',
        'budget-income-btn': 'Indtægt',
        'budget-expense-btn': 'Udgift',
        'budget-cat-income-short': 'Kat. (I)',
        'budget-cat-expense-short': 'Kat. (E)',
        'budget-sidebar-income': 'INDTÆGTER',
        'budget-sidebar-expenses': 'UDGIFTER',
        'budget-actual-label': 'Faktiske:',
        'budget-unnamed': 'Unavngivet',
        'budget-year-overview-title': 'Årsoversigt',
        'budget-total-income-yr': 'Total indtægter',
        'budget-total-expenses-yr': 'Total udgifter',
        'budget-yearly-net': 'Årligt netto',
        'budget-month-income': 'Indtægter:',
        'budget-month-expenses': 'Udgifter:',
        'budget-month-net': 'Netto:',
        'budget-year': 'år',
        'budget-month': 'måned',
        'budget-months': 'måneder',
        'budget-periods': 'perioder',
        'budget-per-month': 'per måned',
        'budget-per-14days': 'per 14. dag',
        'budget-with-buffer': 'Med buffer',
        'budget-surplus': 'Overskud:',
        'budget-deficit': 'Underskud:',
        'budget-or': 'eller',
        'budget-every-14-days': 'hver 14. dag',
        'budget-avg-per-month': 'Dit budget viser følgende gennemsnit per måned:',
        'budget-can-afford': 'Med denne plan har du råd til at spare',
        'budget-warning-deficit': 'Advarsel - Underskud i budgettet:',
        'budget-shortfall': 'Du mangler',
        'budget-shortfall2': 'over året. Overvej at:',
        'budget-reduce-expenses': 'Reducere dine udgifter',
        'budget-increase-income': 'Øge dine indtægter',
        'budget-review-budget': 'Gennemgå dit budget for urealistiske tal',
        'budget-found-recurring': 'Fundet',
        'budget-fixed-expenses': 'faste udgifter',
        'budget-info-columns-title': 'ℹ️ Om Budget Kolonner',
        'budget-info-col-1': '• <strong>"Faktiske"</strong> kolonne er kun til sammenligning og tælles IKKE med i årsberegningen',
        'budget-info-col-2': '• <strong>Måneds-kolonner</strong> (Jan, Feb, etc.) bruges til at beregne dit årlige budget',
        'budget-info-col-3': '• Systemet summerer kun de 12 måneders kolonner for at beregne hvor meget du skal spare',
        'budget-example-desc': 'Med disse indstillinger, hvis dine samlede udgifter er <strong>10.000 kr/måned</strong>:',
        'budget-example-step1': '1. <strong>Total udgifter:</strong> 10.000 kr',
        'budget-example-step2': '2. <strong>Din andel (50%):</strong> 5.000 kr',
        'budget-example-step3': '3. <strong>Med buffer (+5%):</strong> 5.250 kr <span class="text-green-600">← Anbefalet overførsel</span>',
        'budget-settings-note': '<strong>ℹ️ Bemærk:</strong> Ændringer træder i kraft med det samme og opdaterer alle beregninger automatisk.'
    },
    en: {
        'abc-tab': 'ABC Analysis',
        'wilson-tab': 'Wilson Calculation',
        'inventory-tab': 'Inventory Management',
        'settings-tab': 'Settings',
        'abc-title': 'ABC Analysis',
        'upload-label': 'Upload data file (CSV or Excel)',
        'process-btn': 'Analyze Data',
        'upload-hint': 'Supports CSV and Excel files. Columns are auto-detected - then choose which columns to use for analysis.',
        'preview-title': 'Data Preview',
        'results-title': 'ABC Analysis Results',
        'download-btn': '📥 Download CSV',
        'chart-type': 'Select chart type:',
        'pareto-option': 'Pareto Chart',
        'pie-option': 'Pie Chart',
        'wilson-title': 'Wilson Formula (EOQ) Calculation',
        'demand-label': 'D - Annual demand',
        'order-cost-label': 'S - Order cost',
        'holding-cost-label': 'H - Holding cost/year',
        'calculate-btn': '🧮 Calculate EOQ',
        'eoq-label': 'Optimal order quantity (Q*)',
        'orders-per-year-label': 'Orders per year',
        'holding-total-label': 'Holding Cost',
        'order-total-label': 'Order Cost',
        'total-cost-label': 'Total Cost',
        'settings-title': 'Settings',
        'theme-setting': 'Theme',
        'theme-description': 'Choose between light and dark mode',
        'light-theme': 'Light',
        'dark-theme': 'Dark',
        'language-setting': 'Language',
        'language-description': 'Change application language',
        'chart-setting': 'Default chart type',
        'chart-description': 'Select default chart for ABC analysis',
        'footer-text': 'Everything runs locally in your browser',
        'reset': 'Reset App',
        'item-name': 'Item Name',
        'consumption': 'Consumption',
        'price': 'Price',
        'value': 'Value',
        'cumulative': 'Cumulative %',
        'group': 'Group',
        'pareto-title': 'ABC Analysis: Pareto Chart',
        'pie-title': 'ABC Analysis: Distribution by Group',
        'wilson-chart-title': 'Wilson EOQ Cost Analysis',
        'quantity': 'Order Quantity (Q)',
        'cost': 'Cost',
        'holding-cost': 'Holding Cost',
        'order-cost': 'Order Cost',
        'total-cost-line': 'Total Cost',
        'optimal-point': 'Optimal Point (EOQ)',
        'dashboard-tab': 'Dashboard',
        'barcode-tab': 'Barcodes & QR',
        'abc-subtab-analysis': 'ABC Analysis',
        'abc-subtab-compare': 'Compare Periods',
        'not-found-title': 'Page not found',
        'not-found-desc': 'The page you are looking for does not exist or has been removed.',
        'not-found-btn': 'Go to Dashboard',
        'compare-tab': 'Compare',
        'dashboard-title': 'Dashboard Overview',
        'total-items': 'Total Items',
        'total-value': 'Total Value',
        'a-items': 'A-Items',
        'last-analysis': 'Last Analysis',
        'quick-actions': 'Quick Actions',
        'view-data': 'View Data',
        'export-excel': 'Export to Excel',
        'new-analysis': 'New Analysis',
        'compare-periods': 'Compare Periods',
        'top-5-items': 'Top 5 Items by Value',
        'compare-title': 'Compare ABC Analyses',
        'period-1': 'Period 1 (Base)',
        'period-2': 'Period 2 (Compare)',
        'drop-file-here': 'Drop file here or click to select',
        'select-file': '📂 Select File',
        'run-comparison': '🔄 Run Comparison',
        'items-change': 'Items Change',
        'value-change': 'Value Change',
        'a-items-change': 'A-Items Change',
        'change': 'Change',
        'trend': 'Trend',
        'abc-thresholds-setting': 'ABC Classification Thresholds',
        'abc-thresholds-description': 'Customize ABC boundaries (cumulative value %)',
        'preset-tight': '🎯 Tight (60/30/10)',
        'preset-standard': '📊 Standard (80/15/5)',
        'preset-relaxed': '🌊 Relaxed (70/20/10)',
        'a-class-threshold': 'A-Class %',
        'b-class-threshold': 'B-Class %',
        'c-class-threshold': 'C-Class %',
        'threshold-note': 'Note: Values must sum to 100%. C is calculated automatically.',
        'data-quality': 'Data Quality',
        'quality-score': 'Quality Score',
        'no-data-yet': 'No analysis run yet',
        'new-abc-analysis': 'New ABC Analysis',
        'new-abc-desc': 'Upload and analyze data',
        'calculate-eoq': 'Calculate EOQ',
        'calculate-eoq-desc': 'Wilson formula',
        'view-data-desc': 'View uploaded data',
        'export-excel-desc': 'Download results',
        'compare-data': 'Compare',
        'compare-data-desc': 'Compare periods',
        'drag-drop-text': 'Drag and drop file here',
        'drag-drop-or': 'or',
        'browse-file': 'Browse file',
        'rows': 'rows',
        'reset': '🗑️ Clear Data',
        'download-csv-btn': '📥 CSV',
        'download-excel-btn': '📊 Excel',
        'export-csv': 'Export CSV',
        'export-csv-desc': 'Download CSV',
        'price-label': 'Price per unit',
        'interest-label': 'Interest Rate (%)',
        'orders-per-year-label': 'Orders per year',
        'holding-total-label': 'Holding Cost',
        'order-total-label': 'Order Cost',
        'total-cost-label': 'Total Annual Cost',
        'period-1-group': 'P1 Group',
        'period-2-group': 'P2 Group',
        'period-1-value': 'P1 Value',
        'period-2-value': 'P2 Value',
        'add-scenario-btn': '➕ Add Scenario',
        'clear-scenarios-btn': '🗑️ Clear',
        'scenario-comparison-title': '📊 Scenario Comparison',
        'scenario-name': 'Scenario',
        'eoq-for-a-items': '🎯 EOQ for A-Items',
        'send-to-wilson': 'Send to Wilson',
        'send-wilson-hint': 'Open Wilson calculator with selected items',
        'quick-preview': 'Quick Preview',
        'quick-eoq-preview-title': 'EOQ Quick Preview',
        'quick-preview-desc': 'Estimated EOQ based on default parameters. Click 📊 for in-depth analysis in Wilson.',
        'abc-items-loaded': 'Items from ABC analysis',
        'select-item': 'Select item...',
        'load-item': 'Load',
        'calculate-all': 'Calculate all',
        'abc-batch-results-title': 'EOQ Results for ABC Items',
        'save-to-abc': 'Save to ABC',
        'batch-params': 'Batch Parameters:',
        'recalculate': 'Recalculate',
        'avg-eoq': 'Avg. EOQ',
        'total-orders-year': 'Total Orders/Year',
        'potential-savings': 'Potential Savings',
        'calculate-eoq': 'Calculate EOQ',
        'eoq-a-items': 'A-items',
        'eoq-b-items': 'B-items',
        'eoq-c-items': 'C-items',
        'eoq-ab-items': 'A+B items',
        'eoq-all-items': 'All items',
        'batch-wilson-btn': '🧮 Calculate EOQ for All',
        'batch-wilson-title': 'EOQ Calculation Parameters',
        'wilson-result-title': 'Result',
        'wilson-optimal-order': 'Optimal order quantity (most even)',
        'wilson-units-per-order': 'units per order',
        'wilson-orders-per-year': 'Orders per year',
        'wilson-holding-cost': 'Holding Cost',
        'wilson-order-cost': 'Order Cost',
        'wilson-total-cost': 'Total annual cost',
        'print-report': 'Print Report',
        'help-btn': 'Help & Guide',
        'print-report-desc': 'Printable format',
        'import-templates-title': 'Import Templates',
        'show-more': 'Show More',
        'show-less': 'Show Less',
        'template-warehouse': 'Warehouse',
        'template-retail': 'Retail',
        'template-manufacturing': 'Manufacturing',
        'template-custom': 'Custom',
        'download-samples': '📥 Download Sample Files',
        'auto-column-mapping': '🔄 Auto Column Mapping',
        'learn-tab': 'Learn',
        'customize-dashboard': 'Customize Dashboard',
        'customize-dashboard-description': 'Choose which Quick Actions appear on your dashboard',
        'customize-btn': 'Customize',
        'education-mode': 'Education Mode',
        'education-mode-description': 'Enable additional learning resources and practice datasets for educational use',
        'education-mode-disabled-title': 'Education Mode is Disabled',
        'education-mode-disabled-desc': 'Go to Settings and enable Education Mode to access all learning resources',
        'quick-start-guide': 'Quick Start Guide',
        'custom-pages-title': 'Custom Pages',
        'custom-pages-desc': 'Create and manage your custom calculation pages',
        'quick-start-step-1': 'Use a Template: Click "Template Library" to start with pre-built examples like EOQ, ROP, Break-Even, etc.',
        'quick-start-step-2': 'Or Create From Scratch: Click "Create New Page" and add your own inputs and formulas',
        'quick-start-step-3': 'Preview First: Always use the Preview button to test before saving',
        'quick-start-step-4': 'Access Your Pages: Custom page tabs appear at the top when you save them',
        'quick-start-step-5': 'Share & Backup: Export pages as JSON files to share or backup your work',
        'templates-available-badge': '💡 15+ Templates Available',
        'logistics-math-badge': '📚 Logistics & Math',
        'formula-validation-badge': '✅ Formula Validation',
        'create-new-page-btn': '➕ Create New Page',
        // Template library UI
        'template-inputs-label': 'inputs',
        'template-formulas-label': 'formulas',
        'template-use-button': 'Use Template',
        'custom-calculate-btn': 'Calculate',
        'custom-simulate-btn': 'Run Simulation',
        'custom-stop-btn': 'Stop',
        // Template translations - Logistics
        'template-logistics-eoq-name': 'EOQ (Wilson Formula)',
        'template-logistics-eoq-desc': 'Economic Order Quantity calculator',
        'template-logistics-rop-name': 'Reorder Point (ROP)',
        'template-logistics-rop-desc': 'Calculate when to reorder inventory',
        'template-logistics-safety-name': 'Safety Stock Calculator',
        'template-logistics-safety-desc': 'Determine optimal safety stock levels',
        'template-logistics-abc-name': 'ABC Classification Helper',
        'template-logistics-abc-desc': 'Calculate cumulative percentages for ABC analysis',
        'template-logistics-minmax-name': 'Min/Max Inventory Model',
        'template-logistics-minmax-desc': 'Calculate min and max inventory levels',
        'template-logistics-forecast-name': 'Demand Forecasting (Simple Moving Average)',
        'template-logistics-forecast-desc': 'Forecast future demand using moving average',
        'template-logistics-breakeven-name': 'Break-Even Analysis',
        'template-logistics-breakeven-desc': 'Calculate break-even point for products',
        'template-logistics-turnover-name': 'Inventory Turnover Ratio',
        'template-logistics-turnover-desc': 'Measure how quickly inventory sells',
        'template-logistics-tco-name': 'Total Cost of Ownership (TCO)',
        'template-logistics-tco-desc': 'Calculate total ownership costs',
        'template-logistics-capacity-name': 'Capacity Planning',
        'template-logistics-capacity-desc': 'Calculate production capacity and utilization',
        'template-logistics-leadtime-name': 'Lead Time Analysis',
        'template-logistics-leadtime-desc': 'Analyze lead time components',
        'template-logistics-warehouse-name': 'Warehouse Space Calculator',
        'template-logistics-warehouse-desc': 'Calculate required warehouse space',
        'template-logistics-pareto-name': 'Pareto Analysis (80/20)',
        'template-logistics-pareto-desc': 'Identify the vital 20% of items',
        'template-logistics-truck-name': 'Truck Load Optimization',
        'template-logistics-truck-desc': 'Optimize truck capacity and costs',
        'template-logistics-cycle-name': 'Cycle Count Planning',
        'template-logistics-cycle-desc': 'Plan inventory cycle counts',
        'template-logistics-stockout-name': 'Stockout Cost Calculator',
        'template-logistics-stockout-desc': 'Calculate costs of running out of stock',
        'template-logistics-returns-name': 'Returns Management',
        'template-logistics-returns-desc': 'Analyze return rates and costs',
        'template-logistics-kitting-name': 'Kitting Calculator',
        'template-logistics-kitting-desc': 'Calculate kit assembly costs and requirements',
        'template-logistics-variability-name': 'Demand Variability Analysis',
        'template-logistics-variability-desc': 'Analyze demand patterns and variability',
        'template-logistics-route-name': 'Route Optimization',
        'template-logistics-route-desc': 'Calculate optimal routing and delivery costs',
        'template-logistics-productivity-name': 'Productivity Calculator',
        'template-logistics-productivity-desc': 'Measure workforce productivity metrics',
        'template-logistics-supplier-name': 'Supplier Performance Score',
        'template-logistics-supplier-desc': 'Evaluate supplier performance metrics',
        // Template translations - LEAN
        'template-lean-oee-name': 'OEE Calculator',
        'template-lean-oee-desc': 'Overall Equipment Effectiveness measurement',
        'template-lean-smed-name': 'SMED Analysis',
        'template-lean-smed-desc': 'Single Minute Exchange of Die analysis',
        'template-lean-takt-name': 'Takt Time Calculator',
        'template-lean-takt-desc': 'Calculate production takt time',
        'template-lean-cycle-name': 'Cycle Time Analysis',
        'template-lean-cycle-desc': 'Measure and analyze process cycle time',
        'template-lean-vsm-name': 'Value Stream Mapping Metrics',
        'template-lean-vsm-desc': 'Calculate value stream key metrics',
        'template-lean-kaizen-name': 'Kaizen Event ROI',
        'template-lean-kaizen-desc': 'Measure improvement event returns',
        'template-lean-5s-name': '5S Score Calculator',
        'template-lean-5s-desc': 'Assess 5S implementation',
        'template-lean-kanban-name': 'Kanban Card Calculator',
        'template-lean-kanban-desc': 'Calculate optimal number of kanban cards',
        'template-lean-heijunka-name': 'Production Leveling (Heijunka)',
        'template-lean-heijunka-desc': 'Plan level production flow',
        'template-lean-standard-name': 'Standard Work Calculator',
        'template-lean-standard-desc': 'Define standard work elements',
        'template-lean-pull-name': 'Pull System Sizing',
        'template-lean-pull-desc': 'Size pull production system',
        'template-lean-changeover-name': 'Changeover Reduction Analysis',
        'template-lean-changeover-desc': 'Analyze and reduce changeover times',
        'template-lean-visual-name': 'Visual Management Metrics',
        'template-lean-visual-desc': 'Track visual management indicators',
        'template-lean-gemba-name': 'Gemba Walk Metrics',
        'template-lean-gemba-desc': 'Document gemba observations',
        'template-lean-pokayoke-name': 'Poka-Yoke Design Calculator',
        'template-lean-pokayoke-desc': 'Design error-proofing systems',
        // Template translations - Finance
        'template-finance-roi-name': 'ROI Calculator',
        'template-finance-roi-desc': 'Calculate return on investment',
        'template-finance-npv-name': 'NPV Calculator',
        'template-finance-npv-desc': 'Net present value calculation',
        'template-finance-payback-name': 'Payback Period',
        'template-finance-payback-desc': 'Calculate investment payback time',
        'template-finance-depreciation-name': 'Depreciation Calculator',
        'template-finance-depreciation-desc': 'Calculate straight-line depreciation',
        'template-finance-working-name': 'Working Capital Ratio',
        'template-finance-working-desc': 'Analyze working capital ratios',
        'template-finance-profit-name': 'Profit Margin Analysis',
        'template-finance-profit-desc': 'Calculate profitability and margins',
        'template-finance-ebitda-name': 'EBITDA Calculator',
        'template-finance-ebitda-desc': 'Earnings before interest, tax, depreciation',
        'template-finance-breakeven-name': 'Break-Even Point',
        'template-finance-breakeven-desc': 'Determine zero profit volume',
        'template-finance-debt-name': 'Debt-to-Equity Ratio',
        'template-finance-debt-desc': 'Analyze debt-to-equity ratios',
        'template-finance-cashflow-name': 'Cash Flow Analysis',
        'template-finance-cashflow-desc': 'Track cash flows',
        'template-finance-variance-name': 'Budget Variance Analysis',
        'template-finance-variance-desc': 'Compare actual vs. budgeted figures',
        'template-finance-costbenefit-name': 'Cost-Benefit Analysis',
        'template-finance-costbenefit-desc': 'Evaluate project benefits vs. costs',
        'template-finance-elasticity-name': 'Price Elasticity',
        'template-finance-elasticity-desc': 'Measure demand price sensitivity',
        'template-finance-eoq-name': 'Economic Order Quantity (Finance View)',
        'template-finance-eoq-desc': 'EOQ with financial metrics',
        // Template translations - Math/General
        'template-math-percentage-name': 'Percentage Calculator',
        'template-math-percentage-desc': 'Calculate percentages and percent changes',
        'template-math-linear-name': 'Linear Equation Solver',
        'template-math-linear-desc': 'Solve linear equations',
        'template-math-compound-name': 'Compound Interest',
        'template-math-compound-desc': 'Calculate compound interest over time',
        'template-math-profitmargin-name': 'Profit Margin Calculator',
        'template-math-profitmargin-desc': 'Calculate profit margins and markups',
        'template-math-unitconversion-name': 'Unit Conversion',
        'template-math-unitconversion-desc': 'Convert between different units',
        'template-math-weightedaverage-name': 'Weighted Average',
        'template-math-weightedaverage-desc': 'Calculate weighted average',
        'template-math-loanpayment-name': 'Loan Payment Calculator',
        'template-math-loanpayment-desc': 'Calculate monthly loan payments',
        'template-math-discount-name': 'Discount Calculator',
        'template-math-discount-desc': 'Calculate discounts and final prices',
        'template-math-distancespeedtime-name': 'Distance Speed Time',
        'template-math-distancespeedtime-desc': 'Calculate distance, speed, or time',
        'template-math-shippingcost-name': 'Shipping Cost Calculator',
        'template-math-shippingcost-desc': 'Calculate shipping costs with volume/weight tiers',
        'template-math-orderfulfillment-name': 'Order Fulfillment Time',
        'template-math-orderfulfillment-desc': 'Calculate complete order fulfillment timeline',
        'template-math-bulkdiscount-name': 'Bulk Discount Pricing',
        'template-math-bulkdiscount-desc': 'Calculate tiered bulk discount pricing',
        'template-math-depreciation-name': 'Depreciation Calculator',
        'template-math-depreciation-desc': 'Calculate asset depreciation (straight-line method)',
        'template-math-workingcapital-name': 'Working Capital Calculator',
        'template-math-workingcapital-desc': 'Calculate working capital and ratios',
        'template-math-servicelevel-name': 'Service Level Calculator',
        'template-math-servicelevel-desc': 'Calculate service level and stockout probability',
        'template-math-queuetime-name': 'Queue/Wait Time Calculator',
        'template-math-queuetime-desc': 'Calculate average wait times and queue length',
        'template-math-carbonfootprint-name': 'Carbon Footprint Calculator',
        'template-math-carbonfootprint-desc': 'Calculate logistics carbon emissions',
        'template-math-temperature-name': 'Temperature Converter',
        'template-math-temperature-desc': 'Convert between Celsius and Fahrenheit',
        'template-math-amortization-name': 'Loan Amortization Schedule',
        'template-math-amortization-desc': 'Calculate detailed loan payment breakdown',
        'template-math-retirement-name': 'Retirement Savings Planner',
        'template-math-retirement-desc': 'Plan for retirement with compound growth',
        'template-math-breakeven-name': 'Break-Even Point (Units & Revenue)',
        'template-math-breakeven-desc': 'Calculate break-even in both units and dollars',
        'template-math-statistical-name': 'Statistical Analysis',
        'template-math-statistical-desc': 'Calculate mean, median, standard deviation',
        'column-visibility': 'Columns',
        'select-all': 'Select All',
        'deselect-all': 'Deselect All',
        'column-visibility-hint': 'Select which columns to display in tables and analysis. Hidden columns are still preserved in exports.',
        'template-library-btn': '📚 Template Library',
        'import-page-btn': '📥 Import Page',
        'step-1-title': '1. Upload Data',
        'step-1-desc': 'Upload your CSV or Excel file with items',
        'step-2-title': '2. Analyze',
        'step-2-desc': 'Click "Analyze Data" to calculate ABC classification',
        'step-3-title': '3. Visualize',
        'step-3-desc': 'View results as Pareto chart or pie chart',
        'step-4-title': '4. Calculate EOQ',
        'step-4-desc': 'Use Wilson formula to find optimal order quantity',
        'sample-datasets': 'Sample Datasets',
        'sample-datasets-desc': 'Click to load example data:',
        'retail-store': 'Retail Store',
        'retail-store-desc': '15 items, simple structure',
        'warehouse': 'Warehouse',
        'warehouse-desc': '50 items, varied complexity',
        'manufacturing': 'Manufacturing',
        'manufacturing-desc': '100 items, realistic production scenario',
        'theory-concepts': 'Theory & Concepts',
        'abc-theory-title': 'ABC Analysis',
        'abc-theory-text': 'ABC analysis is an inventory management method that classifies items based on their economic significance. A-items (typically 20% of items) account for 80% of value and require close monitoring. B-items are moderate in importance, while C-items are low in value but often high in quantity.',
        'eoq-theory-title': 'Wilson EOQ Formula',
        'eoq-theory-text': 'Economic Order Quantity (EOQ) is the optimal order quantity that minimizes total inventory costs. The formula balances order costs (which decrease with larger orders) against holding costs (which increase with larger orders).',
        'eoq-formula': 'EOQ = √(2DS/H)',
        'eoq-formula-where': 'where:',
        'eoq-d': 'D = Annual demand',
        'eoq-s': 'S = Order cost per order',
        'eoq-h': 'H = Holding cost per unit per year',
        'eoq-benefit': 'Benefit: Finds the balance between ordering costs (decreasing with larger orders) and holding costs (increasing with larger orders).',
        'abc-theory-intro': 'ABC analysis is an inventory management technique based on the Pareto principle (80/20 rule), where items are classified into three categories based on their value:',
        'abc-a-label': 'A-items (typically ~20% of items, ~80% of value):',
        'abc-a-desc': 'High value, tight control, frequent reordering',
        'abc-b-label': 'B-items (typically ~30% of items, ~15% of value):',
        'abc-b-desc': 'Medium value, moderate control',
        'abc-c-label': 'C-items (typically ~50% of items, ~5% of value):',
        'abc-c-desc': 'Low value, simple control, periodic review',
        'abc-double-theory-title': 'ABC Double Analysis',
        'abc-double-theory-intro': 'ABC Double Analysis combines two dimensions for more precise inventory classification: <strong>value</strong> (consumption × price) and <strong>consumption</strong> (number of units). This creates a 3×3 matrix with 9 possible categories.',
        'abc-double-matrix-title': '3×3 Classification Matrix',
        'abc-double-value-a': 'A Value',
        'abc-double-value-b': 'B Value',
        'abc-double-value-c': 'C Value',
        'abc-double-consumption-a': 'A Consumption',
        'abc-double-consumption-b': 'B Consumption',
        'abc-double-consumption-c': 'C Consumption',
        'abc-double-critical': 'Critical',
        'abc-double-moderate': 'Moderate',
        'abc-double-low-priority': 'Low priority',
        'abc-double-tip': '💡 Tip: Use ABC Double to identify items where standard ABC analysis is insufficient. An AC-item (high value, low consumption) is managed differently than a CA-item (low value, high consumption).',
        'eoq-theory-intro': 'Wilson\'s formula calculates the optimal order size that minimizes total inventory costs:',
        // Inventory Management Learn Section
        'inventory-tools-theory-title': 'Inventory Management Tools',
        'inventory-tools-intro': 'The toolkit contains three complementary systems for different inventory management scenarios:',
        'inventory-rop-when': 'When to use: When you order on-demand (continuous review). Ideal for A-items with variable demand.',
        'inventory-rop-example': 'Example: Daily consumption 50 units, lead time 5 days, service level 95% → ROP = 250 + safety stock (based on demand variability)',
        'inventory-pr-when': 'When to use: Fixed purchase intervals (e.g., every 14 days). Perfect when supplier runs fixed routes or for order consolidation.',
        'inventory-pr-example': 'Example: Review every 14 days, daily consumption 20 units, lead time 7 days → Target level = 20 × (14+7) + safety stock = 420 + safety stock',
        'inventory-pr-chart': '💡 Chart: Visualizes how inventory drops during review period and rises again after delivery. Helps ensure you never run out.',
        'inventory-mm-when': 'When to use: When working with fixed inventory limits (popular in warehouse management). Simple to understand and implement.',
        'inventory-mm-chart': '💡 Dashboard: Visual warehouse display shows inventory status with color coding. Perfect for quick status check on multiple items.',
        'inventory-tools-tip': '💡 Model selection: ROP for high-value items with variable demand, Periodic Review for fixed purchase routes, Min/Max for simple warehouse management with fixed order quantity.',
        'abc-theory-intro': 'ABC analysis is an inventory management technique based on the Pareto principle (80/20 rule), where items are classified into three categories based on their value:',
        'abc-a-desc': 'High value, tight control, frequent reordering',
        'abc-b-desc': 'Medium value, moderate control',
        'abc-c-desc': 'Low value, simple control, periodic review',
        'abc-double-theory-title': 'ABC Double Analysis',
        'abc-double-theory-intro': 'ABC Double Analysis combines two dimensions for more precise inventory classification: <strong>value</strong> (consumption × price) and <strong>consumption</strong> (number of units). This creates a 3×3 matrix with 9 possible categories.',
        'eoq-theory-intro': 'Wilson\'s formula calculates the optimal order size that minimizes total inventory costs:',
        'practice-exercises': 'Practice Exercises',
        'exercise-1-title': 'Exercise 1: ABC Classification',
        'exercise-1-desc': 'Load the "Retail Store" dataset and identify which items are A-items. Why are they important for the business?',
        'exercise-2-title': 'Exercise 2: Wilson EOQ Calculation',
        'exercise-2-desc': 'Use the Wilson calculator to find optimal order quantity. Try with: Annual demand=5000, Order cost=200, Price=50, Interest=5%',
        'exercise-3-title': 'Exercise 3: Reorder Point',
        'exercise-3-desc': 'Calculate ROP for an item with daily consumption of 20 units, lead time 7 days, and 95% service level. When should you order?',
        'exercise-4-title': 'Exercise 4: ABC Double Analysis',
        'exercise-4-desc': 'Load a dataset and use ABC Double analysis to identify AA items (high value AND high consumption). How do they differ from other A items?',
        'exercise-5-title': 'Exercise 5: OEE Calculation',
        'exercise-5-desc': 'Calculate OEE for a machine: Availability 90%, Performance 85%, Quality 98%. Is it world class?',
        'exercise-6-title': 'Exercise 6: Budget Planning',
        'exercise-6-desc': 'Create a monthly budget with fixed expenses (rent, insurance) and variable expenses (groceries, transport). Use the account system to track them.',
        'start-exercise': 'Start Exercise',
        'wilson-formula-title': 'Wilson Formula:',
        'wilson-formula-text': 'Q* = √[(2 × Annual Demand × Order Cost) / (Price × Interest Rate)]',
        'wilson-step-1': 'Calculate numerator',
        'wilson-step-2': 'Calculate denominator',
        'wilson-step-3': 'Divide',
        'wilson-step-4': 'Take square root',
        // Best Practices Guide
        'best-practices-title': 'Best Practices Guide',
        'best-practices-desc': 'Follow these proven strategies to optimize your inventory management',
        'when-use-abc': 'When to Use ABC Analysis',
        'abc-use-1': 'Managing large inventory (100+ items) - focus efforts on high-value items',
        'abc-use-2': 'Limited resources - prioritize where to invest time and money',
        'abc-use-3': 'Annual review cycles - classify items for the upcoming year',
        'abc-use-4': 'New product launches - understand value distribution quickly',
        'interpret-eoq': 'How to Interpret EOQ Results',
        'eoq-less': 'You\'re ordering too much - reduce to save on holding costs',
        'eoq-more': 'You\'re ordering too little - increase to save on ordering costs',
        'eoq-orders': 'Shows how often you\'ll reorder - adjust for supplier minimums',
        'eoq-cost': 'Compare with current costs to see potential savings',
        'inventory-tips': 'Inventory Management Tips',
        'tip-a-items': 'A-Items',
        'tip-a-desc': 'Daily monitoring, tight inventory control, accurate demand forecasting',
        'tip-b-items': 'B-Items',
        'tip-b-desc': 'Weekly monitoring, automated reorder points, regular reviews',
        'tip-c-items': 'C-Items',
        'tip-c-desc': 'Monthly monitoring, bulk ordering, simple two-bin system',
        'tip-safety-stock': 'Safety Stock',
        'tip-safety-desc': 'Add 10-25% buffer for A-items, 5-15% for B-items, minimal for C-items',
        'common-mistakes': 'Common Mistakes to Avoid',
        'mistake-1': 'Ignoring C-items completely - they can still cause stockouts',
        'mistake-2': 'Using outdated data - rerun analysis quarterly minimum',
        'mistake-3': 'Blindly following EOQ without considering supplier constraints',
        'mistake-4': 'Not adjusting for seasonality - demand varies throughout the year',
        'mistake-5': 'Forgetting storage capacity limits - EOQ assumes unlimited space',
        'industry-specific': 'Industry-Specific Recommendations',
        'retail-rec': ' Focus on fast-moving items (A), adjust thresholds to 85/10/5 for seasonal peaks',
        'mfg-rec': ' Group by production line, consider lead times in EOQ, maintain safety stock for critical components',
        'dist-rec': ' Use tighter ABC classification (70/25/5), optimize by shipping frequency, consolidate orders',
        'food-rec': ' Prioritize perishables as A-items regardless of cost, order frequently, minimize holding costs',
        // Formula Explorer
        'formula-explorer-title': 'Formula Explorer',
        'formula-explorer-desc': 'Explore how changing EOQ variables affects the optimal order quantity and costs',
        'explorer-demand': 'Annual Demand (D)',
        'explorer-order-cost': 'Order Cost (S)',
        'explorer-price': 'Unit Price (P)',
        'explorer-interest': 'Interest Rate (%)',
        'explorer-eoq-result': 'Optimal Order Quantity',
        'explorer-units': 'units',
        'explorer-orders-year': 'orders per year',
        'explorer-total-cost': 'Total Annual Cost',
        'explorer-holding': 'Holding',
        'explorer-ordering': 'Ordering',
        'explorer-cost-curve': 'Cost Curve Visualization',
        'explorer-insights': 'Key Insights',
        // Data Management
        'data-management-title': 'Data Management',
        'data-management-desc': 'Clear data with different scopes based on your needs',
        'clear-data-title': 'Clear Uploaded Data',
        'clear-data-desc': 'Clears uploaded files and all analysis results (ABC, Wilson, etc.)',
        'clear-data-btn': 'Clear Data',
        'reset-dashboard-title': 'Reset Dashboard',
        'reset-dashboard-desc': 'Resets Quick Actions customization to default state',
        'reset-dashboard-btn': 'Reset Dashboard',
        'delete-pages-title': 'Delete Custom Pages',
        'delete-pages-desc': 'Removes all custom calculation pages you\'ve created',
        'delete-pages-btn': 'Delete All Pages',
        'reset-all-title': 'Reset Everything',
        'reset-all-desc': 'Complete reset: data, dashboard, custom pages, and settings',
        'reset-all-btn': 'Reset Everything',
        // Data Encryption
        'data-encryption-title': 'Data Encryption',
        'data-encryption-desc': 'Protect your data with password-based encryption in browser storage',
        'encryption-disabled': 'Encryption Disabled',
        'encryption-disabled-desc': 'Data is stored without protection',
        'encryption-enabled': 'Encryption Enabled',
        'encryption-enabled-desc': 'Data is protected with password',
        'encryption-warning': '⚠️ Important:',
        'encryption-warning-text': 'Store your password securely. If you forget it, you cannot recover your data.',
        'encryption-password-placeholder': 'Enter encryption password',
        'encryption-password-confirm': 'Confirm password',
        'encryption-enable': 'Enable Encryption',
        'encryption-cancel': 'Cancel',
        'encryption-locked': '🔒 Data is encrypted. Enter password to unlock.',
        'unlock-password-placeholder': 'Enter password',
        'unlock-data': 'Unlock Data',
        'encryption-success': 'Encryption enabled successfully',
        'encryption-disabled-success': 'Encryption disabled',
        'encryption-unlock-success': 'Data unlocked',
        'encryption-password-mismatch': 'Passwords do not match',
        'encryption-password-short': 'Password must be at least 8 characters',
        'encryption-unlock-failed': 'Incorrect password',
        // Reorder Point Calculator
        'reorder-point-title': 'Reorder Point Calculator',
        'reorder-point-desc': 'Calculate when to reorder items based on lead time and desired service level',
        'rop-daily-demand': 'Daily Demand',
        'rop-daily-demand-hint': 'Units per day',
        'rop-lead-time': 'Lead Time (days)',
        'rop-lead-time-hint': 'Days to receive order',
        'rop-service-level': 'Service Level (%)',
        'rop-service-level-hint': 'Target service level',
        'rop-demand-std': 'Demand Std Dev',
        'rop-std-hint': 'Daily variation',
        'rop-calculate': 'Calculate Reorder Point',
        'rop-result-title': 'Reorder Point',
        'rop-safety-stock': 'Safety Stock',
        'rop-avg-demand': 'Avg Lead Time Demand',
        'rop-formula': 'Formula',
        'rop-explanation': 'Where Z-score represents desired service level (higher = more safety stock)',
        // Inventory Management
        'inventory-title': 'Inventory Management',
        'inventory-desc': 'Three powerful tools for optimal inventory management: Calculate reorder points, plan periodic purchasing, and manage min/max inventory levels with visual dashboards',
        'reorder-point-title': 'Reorder Point (ROP)',
        'reorder-point-desc': 'Calculate the precise inventory level where you should reorder to avoid stockouts. Accounts for daily consumption, lead time, demand variability, and desired service level.',
        'periodic-review-title': 'Periodic Review',
        'periodic-review-desc': 'Perfect for companies with fixed purchase schedules (e.g., every 14 days). Calculate how much to order up to a target level based on consumption, lead time, and safety stock. Includes visual graph of expected inventory level.',
        'pr-daily-demand': 'Daily Consumption',
        'pr-review-period': 'Review Period (days)',
        'pr-lead-time': 'Lead Time (days)',
        'pr-safety-stock': 'Safety Stock',
        'pr-current-stock': 'Current Stock Level',
        'pr-target-level': 'Target Level',
        'pr-order-quantity': 'Order Now',
        'pr-coverage': 'Coverage Period',
        'minmax-title': 'Min/Max Inventory Model',
        'minmax-desc': 'Complete visual warehouse dashboard. Set minimum and maximum inventory levels, and get instant status (Critical/Low/Normal/Overfilled) with graphical overview. Ideal for warehouse management with fixed limits.',
        'mm-min-level': 'Min Level',
        'mm-max-level': 'Max Level',
        'mm-safety-stock': 'Safety Stock',
        'mm-current-level': 'Current Level',
        'mm-order-needed': 'Order Now',
        'mm-capacity': 'Capacity Used',
        'mm-days-to-min': 'Days to Min',
        'mm-chart-title': 'Inventory Level Visualization',
        'inventory-status': 'Inventory Status',
        'mm-status-label': 'Status',
        'mm-status-critical': 'Critical',
        'mm-status-low': 'Low',
        'mm-status-overfilled': 'Overfilled',
        'mm-status-normal': 'Normal',
        'no-custom-pages-yet': 'No custom pages yet',
        'click-create-to-start': 'Click "Create New Page" above to get started',
        'create-first-page-btn': '✨ Create Your First Page',
        'site-title': 'Smart Logistics Calculator',
        'mm-legend-max-label': 'Max',
        'mm-legend-min-label': 'Min',
        'mm-legend-safety-label': 'Safety Stock',
        'mm-legend-max': 'Do not order more when this level is reached',
        'mm-legend-min': 'Order when stock reaches this point',
        'mm-legend-safety': 'Buffer against demand variability',
        'pr-chart-title': 'Periodic Review - Inventory Level Over Time',
        'pr-dataset-stock': 'Stock Level',
        'pr-dataset-target': 'Target Level',
        'pr-dataset-safety': 'Safety Stock',
        'mm-chart-label': 'Inventory Status',
        'mm-dataset-safety': 'Safety Stock',
        'mm-dataset-min-current': 'Min → Current',
        'mm-dataset-current-max': 'Current → Max',
        'mm-min-hint': 'Lowest acceptable',
        'mm-max-hint': 'Highest desired',
        'mm-eoq-hint': 'Optimal order',
        'mm-safety-hint': 'Buffer',
        'mm-current-hint': 'In stock now',
        'pr-current-hint': 'Units in stock now',
        'day-abbr': 'Day',
        'days-abbr': 'days',
        'units': 'units',
        'no-analysis-yet': 'No analysis yet',
        // Advanced Filters
        'filters-search-title': 'Advanced Filters & Search',
        'filters-description': 'Search, filter and sort your results',
        'filters-reset': 'Reset',
        'filter-search-placeholder': 'Search item names...',
        'search-placeholder': 'Search by item name...',
        'filter-all-classes': 'All Classes',
        'sort-value-desc': 'Value (High-Low)',
        'sort-value-asc': 'Value (Low-High)',
        'sort-name-asc': 'Name (A-Z)',
        'sort-name-desc': 'Name (Z-A)',
        'sort-consumption-desc': 'Consumption (High-Low)',
        'filter-min-value': 'Min Value',
        'filter-max-value': 'Max Value',
        'filter-showing': 'Showing',
        'filter-items': 'items',
        // Wilson hints
        'demand-hint': 'Units per year',
        'order-cost-hint': 'Price per order',
        'price-hint': 'Unit price',
        'interest-hint': 'Inventory holding rate in percent',
        // Learn page
        'try-now': 'Try It Now!',
        'try-now-desc': 'Load sample data and start analyzing',
        'advanced-topics': 'Want to learn more? Expand the sections below',
        // Pagination
        'showing': 'Showing',
        'of': 'of',
        'load-more': 'Load More',
        'load-all': 'Load All',
        'loaded': 'Loaded',
        'more-items': 'more items',
        'items': 'items',
        'search-items': 'Search items',
        'filter-by-category': 'Filter by category',
        'all-categories': 'All categories',
        'sort-by': 'Sort by',
        'sort-name-asc': 'Name (A-Z)',
        'sort-name-desc': 'Name (Z-A)',
        'reset-filters': 'Reset filters',
        // Performance
        'perf-large-dataset': 'Large Dataset Detected',
        // ABC Double Analysis
        'abc-double-tab': 'ABC Double',
        'abc-double-title': 'ABC Double Analysis',
        'abc-double-desc': 'Analyze items based on both value and consumption for optimal inventory management',
        'double-abc-btn': 'Double ABC',
        'double-abc-info-title': 'What is ABC Double Analysis?',
        'double-abc-info-text': 'Double ABC analysis classifies items in a 3×3 matrix based on two criteria: Value (Price × Consumption) and Consumption. This provides 9 categories (AA, AB, AC, BA, BB, BC, CA, CB, CC) for more precise inventory management.',
        'double-matrix-title': '📊 Double ABC Matrix',
        'double-matrix-axes': 'First letter: Value | Second letter: Consumption',
        'consumption-high': 'Consumption A',
        'consumption-medium': 'Consumption B',
        'consumption-low': 'Consumption C',
        'value-high': 'Value A',
        'value-medium': 'Value B',
        'value-low': 'Value C',
        'aa-recommendation': 'Highest priority: Close monitoring, daily follow-up, low safety stocks',
        'bb-recommendation': 'Medium priority: Weekly review, moderate safety stocks',
        'cc-recommendation': 'Lowest priority: Monthly or quarterly review, high safety stocks',
        'category-details': 'Category Details:',
        'high-priority-items': 'High Priority (AA+AB+BA)',
        'medium-priority-items': 'Medium Priority (BB+AC+CA)',
        'low-priority-items': 'Low Priority (BC+CB+CC)',
        'all-items-table': '📋 All Items with Double Classification',
        'value-class': 'Value Class',
        'consumption-class': 'Consumption Class',
        'double-class': 'Double Class',
        'priority': 'Priority',
        'high': 'High',
        'medium': 'Medium',
        'low': 'Low',
        'no-items-category': 'No items in this category',
        'value-percent': 'Value %',
        'customize-axes': 'Customize Axes',
        'horizontal-axis': 'Horizontal Axis (Column)',
        'vertical-axis': 'Vertical Axis (Row)',
        'detected-column': 'Detected:',
        'action-type-label': 'Action Type',
        'action-type-tab': 'Switch to tab',
        'action-type-function': 'Run function',
        'action-type-url': 'Open URL',
        'action-type-sample': 'Load sample data',
        'shortcut-tab-label': 'Tab',
        'shortcut-function-label': 'Function',
        'shortcut-url-label': 'URL',
        'shortcut-url-note': 'Opens in new window',
        'shortcut-url-new-window': 'Open in new window',
        'shortcut-sample-label': 'Sample Dataset',
        'function-view-data': 'View Data',
        'function-export-csv': 'Export CSV',
        'function-export-excel': 'Export Excel',
        'function-print': 'Print',
        'function-reset': 'Reset App',
        'function-abc-double': 'Run ABC Double',
        'function-tutorial': 'Start Tutorial',
        'print-menu-title': 'Choose what to print',
        'print-option-dashboard': 'Dashboard Overview',
        'print-option-abc': 'ABC Analysis',
        'print-option-abc-double': 'ABC Double Analysis',
        'print-option-wilson': 'Wilson (EOQ) Calculation',
        'print-option-inventory': 'Inventory Management',
        'print-no-data': 'No data available to print',
        'print-no-data-desc': 'Perform calculations or analyses first, then you can print the results.',
        'wilson-subtitle': 'Calculate optimal order quantity for single items or entire inventory lists',
        'wilson-single-mode': '📝 Single Item',
        'wilson-batch-mode': '📦 Batch Mode',
        'wilson-single-title': 'Single Item',
        'wilson-single-desc': 'Calculate EOQ for one item with sliders and get detailed cost analysis',
        'wilson-batch-title': 'Batch Mode',
        'wilson-batch-desc': 'Upload CSV/Excel and calculate EOQ for all items at once',
        'ready-to-calculate': 'Ready to calculate',
        'batch-upload-title': '📤 Upload Batch Data',
        'batch-upload-desc': 'File must contain columns: Item Name, Annual Demand, Order Cost, Unit Price, Interest Rate (%)',
        'load-sample-data': '🔄 Load Sample Data',
        'batch-results-title': '📊 Batch EOQ Results',
        'export-pdf-btn': '📄 Export PDF',
        'orders-per-year': 'Orders/Year',
        'total-cost-all': 'Total Cost (All)',
        'avg-orders': 'Avg Orders/Year',
        'total-eoq': 'Total EOQ',
        'customize-quick-actions': 'Customize Quick Actions',
        'show-all': '✓ Show All',
        'hide-all': '✕ Hide All',
        'customize-description': 'Choose which shortcuts to display on your dashboard. Drag to rearrange order.',
        'create-shortcut-title': 'Add Custom Shortcut',
        'shortcut-icon-label': 'Icon (Emoji)',
        'shortcut-title-label': 'Title',
        'shortcut-desc-label': 'Description',
        'shortcut-title-placeholder': 'My Shortcut',
        'shortcut-desc-placeholder': 'Shortcut description',
        'shortcut-color-label': 'Color Theme',
        'color-blue': 'Blue',
        'color-indigo': 'Indigo',
        'color-purple': 'Purple',
        'color-pink': 'Pink',
        'color-red': 'Red',
        'color-orange': 'Orange',
        'color-yellow': 'Yellow',
        'color-green': 'Green',
        'color-teal': 'Teal',
        'color-cyan': 'Cyan',
        'cancel': 'Cancel',
        'save-shortcut': '💾 Save Shortcut',
        'add-custom-shortcut': 'Create Shortcut',
        'reset-defaults': '🔄 Reset',
        'save-changes': '💾 Save Changes',
        'select-emoji': 'Select Emoji',
        'emoji-popular': '⭐ Popular',
        'emoji-work': '📦 Work & Office',
        'emoji-tech': '💻 Technology',
        'emoji-charts': '📊 Charts & Tables',
        'emoji-tools': '🛠️ Tools',
        'emoji-symbols': '🎨 Symbols',
        'custom-page-modal-title': '✨ Create Custom Page',
        'custom-page-help-title': 'How to Create a Custom Page',
        'custom-page-help-1': '1️⃣ Name your page - Give it a descriptive title',
        'custom-page-help-2': '2️⃣ Add Input Fields - Define what values users can enter (e.g., price, quantity, rate)',
        'custom-page-help-3': '3️⃣ Create Formulas - Use math expressions with your input variable names (e.g., price * quantity)',
        'custom-page-help-4': '4️⃣ Preview - Test your page before saving using the Preview button below',
        'custom-page-help-5': '5️⃣ Optional Graph - Visualize your calculations with charts',
        'custom-page-tip': '💡 Tip: Use the Template Library for pre-built examples to get started quickly!',
        'input-var-placeholder': 'Variable name (e.g., demand)',
        'input-label-placeholder': 'Label shown to user',
        'input-default-placeholder': 'Default value',
        'formula-var-placeholder': 'Result variable name',
        'formula-label-placeholder': 'Label for result',
        'formula-expression-placeholder': 'Formula (e.g., price * quantity)',
        'input-var-name-hint': 'Use only lowercase letters, no spaces (e.g., "price", "quantity", "cost")',
        'input-label-hint': 'Friendly name shown to the user (e.g., "Unit Price", "Order Quantity")',
        'input-default-hint': 'Pre-filled value that appears automatically (optional)',
        'formula-name-hint': 'Name of the result (can be used in other formulas)',
        'formula-label-hint': 'Heading displayed above the result',
        'formula-help-hover': 'Formula Help (hover for info)',
        'available-functions': 'Available Functions',
        'available-operators': 'Operators',
        'no-description': 'No description',
        'no-custom-pages-yet': 'No custom pages yet',
        'click-create-to-start': 'Click "Create New Page" to get started',
        'inputs': 'inputs',
        'formulas': 'formulas',
        'open': 'Open',
        'page-name-label': 'Page Name *',
        'page-name-placeholder': 'My Custom Calculator',
        'page-description-label': 'Description',
        'page-description-placeholder': 'What does this page calculate?',
        'page-icon-label': 'Icon (Emoji)',
        'input-fields-title': '📝 Input Fields',
        'input-fields-help-title': 'Input Fields are the values users can enter.',
        'input-fields-help-example': 'Example: <code class="bg-gray-700 px-1 rounded">price</code>, <code class="bg-gray-700 px-1 rounded">quantity</code>, <code class="bg-gray-700 px-1 rounded">rate</code>',
        'input-fields-help-tip': '💡 The "Variable Name" will be used in formulas!',
        'add-input-btn': '+ Add Input',
        'formulas-title': '🧮 Formulas & Outputs',
        'formulas-help-title': 'Formulas calculate results using input values.',
        'formulas-help-operators': 'Available operators: <code class="bg-gray-700 px-1 rounded">+ - * / ^ sqrt() pow() sin() cos()</code>',
        'formulas-help-examples': 'Examples:',
        'formulas-help-example-1': '<code class="bg-gray-700 px-1 rounded">price * quantity</code>',
        'formulas-help-example-2': '<code class="bg-gray-700 px-1 rounded">sqrt(2 * demand * cost)</code>',
        'formulas-help-example-3': '<code class="bg-gray-700 px-1 rounded">revenue - cost</code>',
        'formulas-help-tip': '💡 Use exact input variable names in your formulas!',
        'add-formula-btn': '+ Add Formula',
        'graph-config-title': '📈 Graph Configuration (Optional)',
        'graph-help-title': '<strong>Graphs</strong> visualize your calculations.',
        'graph-help-xaxis': 'X-Axis: Usually an input variable or range',
        'graph-help-yaxis': 'Y-Axis: Formula results to plot',
        'graph-help-tip': '💡 Great for showing cost curves or trends!',
        'enable-graph': 'Enable Graph',
        'graph-type-label': 'Graph Type',
        'graph-type-line': 'Line Chart',
        'graph-type-bar': 'Bar Chart',
        'graph-type-scatter': 'Scatter Plot',
        'graph-type-pie': 'Pie Chart',
        'graph-type-radar': 'Radar Chart',
        'xaxis-variable': 'X-Axis Variable',
        'yaxis-variables': 'Y-Axis Variable(s)',
        'quick-formulas': '⚡ Quick Formulas:',
        'snippet-percentage': '% Percentage',
        'snippet-growth': '📈 Growth Rate',
        'snippet-average': '📊 Average',
        'snippet-markup': '💰 Markup',
        'snippet-margin': '💵 Margin',
        'snippet-compound': '📈 Compound',
        'snippet-conditional': '🔀 If/Then',
        'snippet-min': '⬇️ Min',
        'snippet-max': '⬆️ Max',
        'snippet-sqrt': '√ Square Root',
        'advanced-options': '⚙️ Advanced Options',
        'input-validation': '🛡️ Input Validation',
        'input-validation-desc': 'Add min/max constraints and required field rules to your inputs for better data quality.',
        'enable-validation': 'Enable Input Validation',
        'validation-options': 'Validation Options:',
        'require-all-inputs': 'Require all input fields',
        'validate-numbers': 'Validate number ranges',
        'per-input-validation': 'Per-Input Validation:',
        'validation-hint': '💡 Click on an input field below to set min/max values for that specific input',
        'export-import': '💾 Export/Import',
        'export-import-desc': 'Save your custom pages as JSON files and share them with others.',
        'export-page': '📤 Export Page',
        'import-page': '📥 Import Page',
        // Wizard translations
        'progress': 'Progress',
        'step-basic': 'Basic Info',
        'step-inputs': 'Inputs',
        'step-formulas': 'Formulas',
        'step-advanced': 'Advanced',
        'step-preview': 'Preview',
        'step1-title': 'Basic Information',
        'step1-description': 'Give your custom calculator a name and description',
        'step1-help-title': 'Quick Start Guide',
        'step2-title': 'Input Fields',
        'step2-description': 'Define what values users can enter',
        'step3-title': 'Formulas & Outputs',
        'step3-description': 'Define calculations and results',
        'step4-title': 'Advanced Options',
        'step4-description': 'Configure validation, graphs, and simulation',
        'step5-title': 'Preview & Save',
        'step5-description': 'Test your calculator and save it',
        'next': 'Next',
        'previous': 'Previous',
        'preview-and-save': 'Preview & Save',
        'templates': 'Templates',
        'no-inputs-yet': 'No inputs yet',
        'add-first-input': 'Click the button below to add your first input field',
        'add-another-input': 'Add Another Input',
        'no-formulas-yet': 'No formulas yet',
        'add-first-formula': 'Add calculations to show results',
        'add-another-formula': 'Add Another Formula',
        'quick-add-input': 'Add Input',
        'quick-add-formula': 'Add Formula',
        'auto-save': 'Auto-Save',
        'page-stats': 'Page Stats',
        'inputs-count': 'Inputs:',
        'formulas-count': 'Formulas:',
        'required-inputs': 'Required:',
        'available-variables': 'Available Variables',
        'no-variables-yet': 'Add inputs first to see available variables',
        'input-help-description': 'are the values users can enter.',
        'formulas-help-description': 'calculate results using input values.',
        'example': 'Example:',
        'operators': 'Operators:',
        'examples': 'Examples:',
        'logistics-templates': 'Logistics',
        'business-templates': 'Business & Math',
        'all-templates': 'All Templates',
        'live-preview': 'Live Preview',
        'preview-updates-auto': 'Updates automatically',
        'auto-save-enabled': 'Auto-save enabled',
        'changes-tracked': 'Changes tracked',
        'generating-preview': 'Generating preview...',
        'preview-tips': 'Preview Tips',
        'preview-tip-1': 'Enter test values to see how your calculator works',
        'preview-tip-2': 'Go back to previous steps if you need to make changes',
        'preview-tip-3': 'Your page will be saved and available in the Custom Pages section',
        'saved': 'Saved',
        'draft-restored': 'Draft restored',
        'restore-draft-prompt': 'Found auto-saved draft. Restore it?',
        'duplicate': 'Duplicate',
        'delete': 'Delete',
        'drag-to-reorder': 'Drag to reorder',
        'input-duplicated': 'Input duplicated',
        'formula-duplicated': 'Formula duplicated',
        'valid-formula': 'Valid formula',
        'formula-help': 'Use math functions: sqrt(), pow(), abs(), sin(), cos(), etc. Reference input variables by name.',
        'calc-types': '🧮 Calculation Types',
        'calc-types-desc': 'Your formulas support:',
        'calc-type-1': '✓ Conditional logic: value > 100 ? "High" : "Low"',
        'calc-type-2': '✓ Min/Max: min(a, b, c) or max(x, y, z)',
        'calc-type-3': '✓ Math functions: sqrt(), pow(), abs(), round(), ceil(), floor()',
        'calc-type-4': '✓ Trig functions: sin(), cos(), tan(), asin(), acos(), atan()',
        'calc-type-5': '✓ Constants: pi, e (Euler\'s number)',
        'simulation-mode-title': '⏱️ Simulation Mode (Optional)',
        'enable-simulation': 'Enable Simulation',
        'simulation-help': '💡 Simulation will animate your formulas over time. Useful for inventory levels, stock depletion, and dynamic processes.',
        'time-variable-label': 'Time Variable Name',
        'start-value-label': 'Start Value',
        'end-value-label': 'End Value',
        'use-template-btn': '📚 Use Template',
        'cancel-btn': 'Cancel',
        'preview-btn': '👁️ Preview',
        'save-page-btn': '💾 Save Page',
        'preview-modal-title': '👁️ Live Preview',
        'preview-modal-subtitle': 'Test your custom page before saving',
        'preview-tip': '💡 Make changes in the form and click Preview again to update',
        'close-preview-btn': 'Close Preview',
        'auto-calculated': 'Auto-calculated:',
        'apply-labels': 'Apply Changes',
        'double-abc-thresholds-setting': 'Double ABC Thresholds',
        'double-abc-thresholds-description': 'Customize thresholds for both value and consumption dimensions',
        'value-thresholds': 'Value Thresholds',
        'consumption-thresholds': 'Consumption Thresholds',
        'double-threshold-note': 'Default is 70/20/10 for both dimensions. C is calculated automatically.',
        'exercise-4-title': 'Exercise 4: ABC Double Analysis',
        'exercise-4-desc': 'Load a dataset and use ABC Double analysis to identify AA items (high value AND high consumption). How do they differ from other A items?',
        // ABC Double category translations
        'abc-double-categories-title': 'Category Examples:',
        'abc-double-aa-label': 'AA items:',
        'abc-double-aa-desc': 'High value AND high consumption - Requires close monitoring, precise forecasting, and tight safety stock',
        'abc-double-ab-ba-label': 'AB/BA items:',
        'abc-double-ab-ba-desc': 'One dimension is high - Moderate attention, flexible inventory management',
        'abc-double-bb-label': 'BB items:',
        'abc-double-bb-desc': 'Medium on both dimensions - Standard inventory procedures',
        'abc-double-cc-label': 'CC items:',
        'abc-double-cc-desc': 'Low value AND low consumption - Minimal control, periodic review, large order quantities',
        // Min/Max status descriptions
        'mm-status-critical-desc': 'Below safety stock',
        'mm-status-low-desc': 'Below min',
        'mm-status-normal-desc': 'Between min-max',
        'mm-status-overfilled-desc': 'Above max',
        'labels-applied': 'Labels applied successfully',
        'double-abc-dimensions': 'Select Analysis Columns',
        'double-abc-config': 'Double ABC Settings',
        'double-abc-config-desc': 'Select columns for analysis and customize ABC thresholds',
        'quality-check-title': '📊 Data Quality Check',
        'select-column': 'Select column...',
        'auto-calculated-column': 'Auto-calculated (Price × Consumption)',
        'vertical-axis-first': 'Vertical Axis (First Letter)',
        'horizontal-axis-second': 'Horizontal Axis (Second Letter)',
        'apply-columns': '✓ Apply Columns',
        'default-service-level-setting': 'Default Service Level',
        'default-service-level-desc': 'Choose default service level for reorder point calculations',
        'auto-save-setting': 'Auto-save Results',
        'auto-save-desc': 'Automatically save analysis results for next session',
        'rop-formula-text-1': 'ROP = (Daily Demand × Lead Time) + Safety Stock',
        'rop-formula-text-2': 'Safety Stock = Z-score × σ × √Lead Time',
        'pr-formula-text-1': 'Target Level = Daily Demand × (Review Period + Lead Time) + Safety Stock',
        'pr-formula-text-2': 'Order Quantity = Target Level - Current Stock',
        'mm-formula-text-1': 'Min = Safety Stock + (Daily Demand × Lead Time)',
        'mm-formula-text-2': 'Max = Min + Optimal Order Quantity (EOQ)',
        'mm-status-critical': 'Critical:',
        'mm-status-low': 'Low:',
        'mm-status-overfilled': 'Overfilled:',
        'mm-status-normal': 'Normal:',
        'units': 'units',
        'days': 'days',
        'days-abbr': 'days',
        'mm-chart-subtitle': 'Current level',
        'mm-chart-label-safety': 'Safety Stock',
        'mm-chart-label-min-current': 'Min → Current',
        'mm-chart-label-current-max': 'Current → Max',
        
        // LEAN Tools translations (English)
        'lean-tab': 'LEAN Tools',
        'lean-title': 'LEAN Tools',
        'lean-calculators-title': 'Interactive Calculators',
        'lean-oee-title': 'OEE Calculator',
        'lean-oee-subtitle': 'Overall Equipment Effectiveness',
        'lean-oee-availability': 'Availability (%)',
        'lean-oee-availability-hint': '= Runtime / Planned Time',
        'lean-oee-performance': 'Performance (%)',
        'lean-oee-performance-hint': '= Ideal Rate / Actual Rate',
        'lean-oee-quality': 'Quality (%)',
        'lean-oee-quality-hint': '= Good Units / Total Units',
        'lean-oee-result': 'Overall Equipment Effectiveness',
        'lean-oee-poor': 'Poor - Needs Improvement',
        'lean-oee-average': 'Average - Room for Growth',
        'lean-oee-good': 'Good - Above Average',
        'lean-oee-world-class': 'World Class Excellence!',
        'lean-oee-benchmark-poor': 'Poor',
        'lean-oee-benchmark-avg': 'Average',
        'lean-oee-benchmark-wc': 'World Class',
        'lean-waste-cost-placeholder': 'Cost',
        'lean-reset': 'Reset',
        'lean-copy': 'Copy',
        'lean-smed-title': 'SMED Savings',
        'lean-smed-subtitle': 'Single-Minute Exchange of Die',
        'lean-smed-current': 'Current Setup Time (minutes)',
        'lean-smed-target': 'Target Setup Time (minutes)',
        'lean-smed-frequency': 'Setups per Year',
        'lean-smed-hourly-cost': 'Hourly Cost (kr/hour)',
        'lean-smed-time-saved': 'Time Saved/Setup',
        'lean-smed-reduction': 'Reduction',
        'lean-smed-annual-savings': 'Annual Savings',
        'lean-smed-hours-saved': 'hours saved',
        'lean-waste-title': '7 Wastes Cost',
        'lean-waste-subtitle': 'Muda Cost Estimator',
        'lean-waste-overproduction': 'Overproduction',
        'lean-waste-overproduction-hint': '(Making more than needed)',
        'lean-waste-waiting': 'Waiting',
        'lean-waste-waiting-hint': '(Idle time)',
        'lean-waste-transport': 'Transportation',
        'lean-waste-transport-hint': '(Moving materials)',
        'lean-waste-processing': 'Over-Processing',
        'lean-waste-processing-hint': '(Doing more than required)',
        'lean-waste-inventory': 'Inventory',
        'lean-waste-inventory-hint': '(Excess stock)',
        'lean-waste-motion': 'Motion',
        'lean-waste-motion-hint': '(Unnecessary movement)',
        'lean-waste-defects': 'Defects',
        'lean-waste-defects-hint': '(Rework/Scrap)',
        'lean-waste-total': 'Total Waste Cost',
        'lean-swot-title': 'SWOT Analysis',
        'lean-swot-subtitle': 'Strategic Planning Matrix',
        'lean-waste-count': 'waste types selected',
        'lean-swot-strengths': '💪 Strengths',
        'lean-swot-weaknesses': '⚠️ Weaknesses',
        'lean-swot-opportunities': '🚀 Opportunities',
        'lean-swot-threats': '⚡ Threats',
        'lean-swot-strengths-placeholder': 'Internal positive factors...',
        'lean-swot-weaknesses-placeholder': 'Internal negative factors...',
        'lean-swot-opportunities-placeholder': 'External positive factors...',
        'lean-swot-threats-placeholder': 'External negative factors...',
        'lean-swot-save': '💾 Save',
        'lean-swot-export': '📥 Export',
        'lean-swot-clear': '🗑️ Clear',
        'lean-swot-export-markdown': '📄 Export as Markdown',
        'lean-swot-export-png': '🖼️ Export as Image (PNG)',
        // LEAN Dashboard
        'lean-dashboard-title': 'LEAN Dashboard',
        'last-updated': 'Last updated:',
        'optimal': 'Optimal',
        'needs-attention': 'Needs Attention',
        'critical': 'Critical',
        'export-report': 'Export',
        // Improvement Tracker
        'lean-tracker-title': 'Improvement Tracker',
        'lean-tracker-add': 'Add Improvement',
        'lean-tracker-area': 'Area',
        'lean-tracker-before': 'Before',
        'lean-tracker-after': 'After',
        'lean-tracker-notes': 'Notes',
        'lean-tracker-save': 'Save Improvement',
        'lean-tracker-empty': 'No improvements recorded yet',
        'lean-tracker-total': 'Total Improvements',
        'lean-tracker-avg': 'Avg. Improvement',
        'lean-tracker-this-month': 'This Month',
        // What-If Scenarios
        'lean-whatif-title': 'What-If Scenarios',
        'lean-whatif-params': 'Adjust Parameters',
        'lean-whatif-results': 'Scenario Results',
        'lean-whatif-impact': 'Total Expected Gain',
        // Section Titles
        'lean-metrics-title': 'Performance Metrics',
        'lean-improvement-title': 'Process Improvement',
        'lean-planning-title': 'Strategic Planning',
        'lean-reference-title': 'Reference Library',
        'lean-purpose': 'Purpose:',
        'lean-5s-title': '5S System',
        'lean-5s-sort': '1. Sort',
        'lean-5s-sort-desc': '(Seiri) - Remove unnecessary items',
        'lean-5s-order': '2. Set in Order',
        'lean-5s-order-desc': '(Seiton) - Organize workspace',
        'lean-5s-shine': '3. Shine',
        'lean-5s-shine-desc': '(Seiso) - Clean thoroughly',
        'lean-5s-standardize': '4. Standardize',
        'lean-5s-standardize-desc': '(Seiketsu) - Create standards',
        'lean-5s-sustain': '5. Sustain',
        'lean-5s-sustain-desc': '(Shitsuke) - Maintain discipline',
        'lean-5s-purpose': 'Workplace organization method for efficiency and safety',
        'lean-7r-title': '7R Principles',
        'lean-7r-product': 'Right Product',
        'lean-7r-product-desc': 'Correct item',
        'lean-7r-quantity': 'Right Quantity',
        'lean-7r-quantity-desc': 'Exact amount',
        'lean-7r-condition': 'Right Condition',
        'lean-7r-condition-desc': 'Perfect quality',
        'lean-7r-place': 'Right Place',
        'lean-7r-place-desc': 'Proper location',
        'lean-7r-time': 'Right Time',
        'lean-7r-time-desc': 'When needed',
        'lean-7r-customer': 'Right Customer',
        'lean-7r-customer-desc': 'Correct recipient',
        'lean-7r-cost': 'Right Cost',
        'lean-7r-cost-desc': 'Optimal price',
        'lean-7r-purpose': 'Logistics excellence framework',
        'lean-3m-title': '3M - Waste Types',
        'lean-3m-muda': 'Muda (Waste)',
        'lean-3m-muda-desc': 'Activities that consume resources without adding value. The 7 wastes.',
        'lean-3m-mura': 'Mura (Unevenness)',
        'lean-3m-mura-desc': 'Inconsistency in operations causing irregular workflow and demand spikes.',
        'lean-3m-muri': 'Muri (Overburden)',
        'lean-3m-muri-desc': 'Unreasonable work imposed on workers or equipment beyond capacity.',
        'lean-3m-purpose': 'Root causes of operational inefficiency',
        'lean-pdca-title': 'PDCA Cycle',
        'lean-pdca-plan': 'Plan',
        'lean-pdca-plan-desc': 'Identify and analyze the problem',
        'lean-pdca-do': 'Do',
        'lean-pdca-do-desc': 'Develop and test solution',
        'lean-pdca-check': 'Check',
        'lean-pdca-check-desc': 'Study results and measure effectiveness',
        'lean-pdca-act': 'Act',
        'lean-pdca-act-desc': 'Standardize and repeat',
        'lean-pdca-purpose': 'Continuous improvement methodology',
        'lean-jit-title': 'JIT & Kanban',
        'lean-jit-subtitle': 'Just-In-Time (JIT)',
        'lean-jit-produce': 'Produce only what is needed',
        'lean-jit-when': 'When it\'s needed',
        'lean-jit-quantity': 'In the quantity needed',
        'lean-jit-minimize': 'Minimize inventory costs',
        'lean-kanban-subtitle': 'Kanban System',
        'lean-kanban-visual': 'Visual workflow management',
        'lean-kanban-pull': 'Pull-based production',
        'lean-kanban-signal': 'Signal cards trigger replenishment',
        'lean-kanban-wip': 'WIP (Work In Progress) limits',
        'lean-jit-purpose': 'Flow optimization and inventory reduction',
        'lean-fifo-title': 'FIFO & Kaizen',
        'lean-fifo-subtitle': 'FIFO (First-In-First-Out)',
        'lean-fifo-oldest': 'Use oldest stock first',
        'lean-fifo-prevent': 'Prevents obsolescence',
        'lean-fifo-critical': 'Critical for perishables',
        'lean-fifo-reduce': 'Reduces waste and loss',
        'lean-kaizen-subtitle': 'Kaizen (Continuous Improvement)',
        'lean-kaizen-small': 'Small, incremental changes',
        'lean-kaizen-employee': 'Employee involvement',
        'lean-kaizen-ongoing': 'Ongoing improvement culture',
        'lean-kaizen-focus': 'Focus on processes',
        'lean-fifo-purpose': 'Inventory discipline and continuous improvement',
        // New Time Calculators (English)
        'lean-time-title': 'Production Time Analysis',
        'lean-time-subtitle': 'Takt, Cycle & Lead Time',
        'lean-takt-title': '⏰ Takt Time',
        'lean-takt-available': 'Available Time (min/day)',
        'lean-takt-demand': 'Customer Demand (units/day)',
        'lean-takt-result': 'Takt Time',
        'lean-takt-desc': 'Required pace to meet demand',
        'lean-cycle-title': '🔄 Cycle Time',
        'lean-cycle-units': 'Units Produced',
        'lean-cycle-time': 'Total Time (minutes)',
        'lean-cycle-result': 'Cycle Time',
        'lean-cycle-desc': 'Actual time per unit',
        'lean-lead-title': '📦 Lead Time',
        'lean-lead-process': 'Process (min)',
        'lean-lead-queue': 'Queue (min)',
        'lean-lead-transport': 'Transport (min)',
        'lean-lead-result': 'Total Lead Time',
        'lean-lead-hours': 'Hours:',
        'lean-lead-days': 'Days:',
        'lean-analysis-title': '📊 Production Analysis',
        'lean-analysis-capacity': 'Capacity Utilization',
        'lean-analysis-buffer': 'Buffer Time',
        // VSM Tool (English)
        'lean-vsm-title': 'Value Stream Mapping',
        'lean-vsm-subtitle': 'Visualize Process Flow & Waste',
        'lean-vsm-clear': 'Clear',
        'lean-vsm-export': 'Export PNG',
        'lean-vsm-canvas': 'Process Flow Canvas',
        'lean-vsm-add': '+ Add Process',
        'lean-vsm-processes': 'Process Steps',
        'lean-vsm-empty': 'Click "+ Add Process" to start mapping',
        'lean-vsm-total-time': 'Total Lead Time',
        'lean-vsm-value-time': 'Value-Add Time',
        'lean-vsm-waste-pct': 'Waste %',
        // Kaizen Event Planner (English)
        'lean-kaizen-title': 'Kaizen Event Planner',
        'lean-kaizen-subtitle': 'Continuous Improvement Event',
        'lean-kaizen-save': '💾 Save',
        'lean-kaizen-export': '📥 Export',
        'lean-kaizen-problem': '🎯 Problem Statement',
        'lean-kaizen-problem-placeholder': 'Describe the problem or opportunity for improvement...',
        'lean-kaizen-current': '📊 Current State',
        'lean-kaizen-target': '🎯 Target State',
        'lean-kaizen-metric': 'Metric Name',
        'lean-kaizen-metric-placeholder': 'e.g., Cycle Time, Defect Rate',
        'lean-kaizen-value': 'Current Value',
        'lean-kaizen-unit': 'Unit',
        'lean-kaizen-target-value': 'Target Value',
        'lean-kaizen-improvement': 'Improvement',
        'lean-kaizen-roi': '💰 ROI Calculator',
        'lean-kaizen-cost': 'Implementation Cost (kr)',
        'lean-kaizen-annual-savings': 'Annual Savings (kr)',
        'lean-kaizen-payback': 'Payback Period',
        'lean-kaizen-roi-pct': 'ROI %',
        'lean-kaizen-actions': '✓ Action Items',
        'lean-kaizen-add-action': '+ Add Action',
        'lean-kaizen-empty': 'No action items yet. Click "+ Add Action" to start.',
        'lean-integration-title': 'Integration with Your Dashboard',
        'lean-integration-eoq': 'Link EOQ to JIT',
        'lean-integration-eoq-desc': 'Use your EOQ calculations from Wilson tab to support Just-In-Time ordering decisions',
        'lean-integration-abc': 'ABC with Kanban',
        'lean-integration-abc-desc': 'Apply Kanban principles to A-items for tighter control and B/C items for simpler replenishment',
        'lean-integration-rop': 'ROP with FIFO',
        'lean-integration-rop-desc': 'Connect reorder points from Inventory Management to FIFO warehouse organization',
        'template-library-title': '📚 Template Library',
        'template-search-placeholder': 'Search templates...',
        'template-category-all': 'All Categories',
        'template-category-logistics': '📦 Logistics',
        'template-category-lean': '🏭 LEAN Manufacturing',
        'template-category-finance': '💰 Finance',
        'template-category-math': '🔢 Math & Science',
        'template-clear-filters': 'Clear filters',
        'template-no-results': 'No templates found',
        'template-try-different': 'Try a different search or category',
        'template-count': 'templates',
        
        // Logistics Templates
        'template-logistics-eoq-name': 'EOQ (Wilson Formula)',
        'template-logistics-eoq-desc': 'Economic Order Quantity calculator',
        'template-logistics-rop-name': 'Reorder Point (ROP)',
        'template-logistics-rop-desc': 'Calculate when to reorder inventory',
        'template-logistics-safety-name': 'Safety Stock Calculator',
        'template-logistics-safety-desc': 'Determine optimal safety stock levels',
        'template-logistics-abc-name': 'ABC Classification Helper',
        'template-logistics-abc-desc': 'Calculate cumulative percentages for ABC analysis',
        'template-logistics-minmax-name': 'Min/Max Inventory Model',
        'template-logistics-minmax-desc': 'Calculate min and max inventory levels',
        'template-logistics-forecast-name': 'Demand Forecasting (Simple Moving Average)',
        'template-logistics-forecast-desc': 'Forecast future demand using moving average',
        'template-logistics-breakeven-name': 'Break-Even Analysis',
        'template-logistics-breakeven-desc': 'Find profitability point for products',
        'template-logistics-turnover-name': 'Inventory Turnover Ratio',
        'template-logistics-turnover-desc': 'Measure inventory efficiency',
        'template-logistics-tco-name': 'Total Cost of Ownership (TCO)',
        'template-logistics-tco-desc': 'Calculate true cost of holding inventory',
        'template-logistics-capacity-name': 'Capacity Planning',
        'template-logistics-capacity-desc': 'Plan production capacity and utilization',
        'template-logistics-leadtime-name': 'Lead Time Analysis',
        'template-logistics-leadtime-desc': 'Analyze lead time components',
        'template-logistics-warehouse-name': 'Warehouse Space Calculator',
        'template-logistics-warehouse-desc': 'Calculate required warehouse space',
        'template-logistics-pareto-name': 'Pareto Analysis (80/20)',
        'template-logistics-pareto-desc': 'Identify critical few items',
        'template-logistics-truck-name': 'Truck Load Optimization',
        'template-logistics-truck-desc': 'Maximize truck capacity utilization',
        'template-logistics-cycle-name': 'Cycle Count Planning',
        'template-logistics-cycle-desc': 'Plan inventory counting frequency',
        'template-logistics-stockout-name': 'Stockout Cost Calculator',
        'template-logistics-stockout-desc': 'Calculate financial impact of shortages',
        
        // LEAN Templates
        'template-lean-oee-name': 'OEE Calculator',
        'template-lean-oee-desc': 'Calculate Overall Equipment Effectiveness',
        'template-lean-smed-name': 'SMED Analysis',
        'template-lean-smed-desc': 'Single-Minute Exchange of Die - Changeover time reduction',
        'template-lean-takt-name': 'Takt Time Calculator',
        'template-lean-takt-desc': 'Calculate the pace of production to meet customer demand',
        'template-lean-cycle-name': 'Cycle Time Analysis',
        'template-lean-cycle-desc': 'Compare cycle time to takt time',
        'template-lean-vsm-name': 'Value Stream Mapping Metrics',
        'template-lean-vsm-desc': 'Calculate value-add ratio and lead time',
        'template-lean-kaizen-name': 'Kaizen Event ROI',
        'template-lean-kaizen-desc': 'Calculate return on investment for improvement events',
        'template-lean-5s-name': '5S Score Calculator',
        'template-lean-5s-desc': 'Evaluate 5S implementation maturity',
        'template-lean-kanban-name': 'Kanban Card Calculator',
        'template-lean-kanban-desc': 'Calculate number of kanban cards needed',
        'template-lean-heijunka-name': 'Production Leveling (Heijunka)',
        'template-lean-heijunka-desc': 'Calculate production leveling schedule',
        'template-lean-standard-name': 'Standard Work Calculator',
        'template-lean-standard-desc': 'Calculate standard work components',
        'template-lean-pull-name': 'Pull System Sizing',
        'template-lean-pull-desc': 'Calculate buffer sizes for pull production',
        'template-lean-changeover-name': 'Changeover Reduction Analysis',
        'template-lean-changeover-desc': 'Analyze changeover time components',
        'template-lean-visual-name': 'Visual Management Metrics',
        'template-lean-visual-desc': 'Calculate visual management effectiveness',
        'template-lean-gemba-name': 'Gemba Walk Metrics',
        'template-lean-gemba-desc': 'Track gemba walk observations and actions',
        'template-lean-pokayoke-name': 'Poka-Yoke Design Calculator',
        'template-lean-pokayoke-desc': 'Calculate error-proofing effectiveness',
        
        // Finance Templates
        'template-finance-roi-name': 'ROI Calculator',
        'template-finance-roi-desc': 'Calculate Return on Investment',
        'template-finance-npv-name': 'NPV Calculator',
        'template-finance-npv-desc': 'Calculate Net Present Value',
        'template-finance-payback-name': 'Payback Period',
        'template-finance-payback-desc': 'Calculate time to recover investment',
        'template-finance-depreciation-name': 'Depreciation Calculator',
        'template-finance-depreciation-desc': 'Calculate straight-line and declining balance depreciation',
        'template-finance-working-name': 'Working Capital Ratio',
        'template-finance-working-desc': 'Measure short-term liquidity',
        'template-finance-profit-name': 'Profit Margin Analysis',
        'template-finance-profit-desc': 'Calculate various profit margins',
        'template-finance-ebitda-name': 'EBITDA Calculator',
        'template-finance-ebitda-desc': 'Calculate Earnings Before Interest, Taxes, Depreciation, and Amortization',
        'template-finance-breakeven-name': 'Break-Even Point',
        'template-finance-breakeven-desc': 'Calculate break-even in units and revenue',
        'template-finance-debt-name': 'Debt-to-Equity Ratio',
        'template-finance-debt-desc': 'Measure financial leverage',
        'template-finance-cashflow-name': 'Cash Flow Analysis',
        'template-finance-cashflow-desc': 'Analyze operating cash flow',
        'template-finance-variance-name': 'Budget Variance Analysis',
        'template-finance-variance-desc': 'Compare actual vs budgeted performance',
        'template-finance-costbenefit-name': 'Cost-Benefit Analysis',
        'template-finance-costbenefit-desc': 'Evaluate project viability',
        'template-finance-elasticity-name': 'Price Elasticity',
        'template-finance-elasticity-desc': 'Calculate demand price elasticity',
        'template-finance-eoq-name': 'Economic Order Quantity (Finance View)',
        'template-finance-eoq-desc': 'Optimize order quantities with financial focus',
        
        // Math Templates
        'template-math-percentage-name': 'Percentage Calculator',
        'template-math-percentage-desc': 'Calculate percentages and changes',
        'template-math-linear-name': 'Linear Equation Solver',
        'template-math-linear-desc': 'Solve y = mx + b',
        'template-math-compound-name': 'Compound Interest',
        'template-math-compound-desc': 'Calculate compound interest over time',
        
        // Cargo Securing
        'cargo-tab': 'Cargo Securing',
        'cargo-title': 'Cargo Securing',
        'cargo-intro-title': '📖 About Cargo Securing - Danish Transport Guide',
        'cargo-intro-text': 'This calculator is based on the Danish guide "Lastsikring ved transport ad landevej" with standard values LC 1600 daN and STF 400 daN.',
        'cargo-friction-table-title': 'Friction Coefficient (μ) - Reference Table',
        'cargo-acceleration-title': 'Acceleration Forces During Transport',
        'cargo-tips-title': 'Important Rules from the Cargo Securing Guide',
        'cargo-standards-title': '📏 Standard Values',
        'cargo-standard-lc': 'Standard LC (Lashing Capacity)',
        'cargo-standard-stf': 'Standard STF (Standard Tension Force)',
        'cargo-actual-lc': 'Actual LC (daN)',
        'cargo-actual-stf': 'Actual STF (daN)',
        'cargo-formula': 'Formula:',
        'cargo-conversion-factor': 'Conversion Factor:',
        'cargo-type1-title': 'Loop/Frictional/Direct Lashing',
        'cargo-type2-title': 'Top-Over Lashing',
        'cargo-sliding': 'Sliding',
        'cargo-tipping': 'Tipping',
        'cargo-tipping-rule': 'Rule:',
        'cargo-tipping-desc': 'The lowest value of:',
        'cargo-tips-title': 'Good Advice',
        'cargo-tip1': 'A conversion factor > 1.0 means your lashing equipment is stronger than the standard',
        'cargo-tip2': 'If the conversion factor is less than 1.0, you need more lashings or stronger equipment',
        'cargo-tip3': 'For top-over lashing and tipping, always use the lowest value to be on the safe side',
        'cargo-tip4': 'Remember to regularly check your lashing equipment for wear and damage',
        'cargo-reference-title': 'Quick Reference',
        'cargo-ref-type': 'Type',
        'cargo-ref-scenario': 'Scenario',
        'cargo-ref-formula': 'Formula',
        'cargo-ref-loop': 'Loop Lashing',
        'cargo-ref-frictional': 'Frictional Lashing',
        'cargo-ref-direct': 'Direct Lashing',
        'cargo-ref-topover': 'Top-Over Lashing',
        'cargo-ref-all': 'All',
        
        // Cargo Securing - Advanced
        'cargo-weight': 'Cargo Weight (kg)',
        'cargo-weight-help': 'Total weight of cargo',
        'cargo-lc-help': 'Lashing Capacity - maximum load capacity',
        'cargo-stf-help': 'Standard Tension Force - pre-tension force',
        'cargo-accel-forward': 'Forward Acceleration (g)',
        'cargo-accel-forward-help': 'Standard: 0.8g (braking)',
        'cargo-accel-backward': 'Backward Acceleration (g)',
        'cargo-accel-backward-help': 'Standard: 0.5g (acceleration)',
        'cargo-accel-sideways': 'Sideways Acceleration (g)',
        'cargo-accel-sideways-help': 'Standard: 0.5g (cornering)',
        'cargo-friction': 'Friction Coefficient (μ)',
        'cargo-friction-help': 'Select based on contact surface',
        'cargo-angle': 'Lashing Angle (°)',
        'cargo-angle-help': '90° = vertical, < 90° = angled',
        'cargo-safety-factor': 'Safety Factor',
        'cargo-safety-help': 'Recommended: 1.5 (50% reserve)',
        'cargo-advanced-title': 'Advanced Calculations (EN 12195)',
        'cargo-force-forward': 'Forward Force (daN)',
        'cargo-force-backward': 'Backward Force (daN)',
        'cargo-force-sideways': 'Sideways Force (daN)',
        'cargo-friction-force': 'Friction Force (daN)',
        'cargo-friction-help-text': 'Natural resistance to sliding',
        'cargo-lashings-forward': 'Forward Lashings Required',
        'cargo-lashings-backward': 'Backward Lashings Required',
        'cargo-lashings-sideways': 'Sideways Lashings Required',
        'cargo-lashings-braking': 'For braking',
        'cargo-lashings-accel': 'For acceleration',
        'cargo-lashings-curve': 'For cornering',
        'cargo-safety-recommendations': 'Safety Recommendations',
        'cargo-lashings-needed': 'Number of Lashings Required:',
        'cargo-angle-warning-title': 'Angle Warning!',
        'cargo-sliding-title': 'Top-Over Lashing - SLIDING',
        'cargo-tipping-title': 'Top-Over Lashing - TIPPING',
        'cargo-final-title': 'Final Recommendation',
        'cargo-use-most': 'Use the highest number:',
        'cargo-hb-ratio': 'H/B Ratio (Sideways)',
        'cargo-hb-help': 'Height / Width (for sideways tipping)',
        'cargo-rows': 'Number of lashing rows',
        'cargo-rows-help': 'Place tensioners alternately on each side',
        'cargo-calculate-btn': '⚡ Calculate Lashings',
        
        // Section titles
        'cargo-section1-title': 'PART 1: Conversion Factors (Loop/Frictional/Direct Lashing)',
        'cargo-section1-desc': 'Enter your actual LC value to calculate the conversion factor relative to standard LC 1600 daN',
        'cargo-section2-title': 'PART 2: Top-Over Lashing - Calculate Number of Lashings',
        'cargo-section2-desc': 'Based on Danish transport standards - calculate how many top-over lashings are needed',
        
        // Loop/Frictional/Direct Lashing
        'cargo-lashing-types-title': 'Conversion Factors for Different Types of Lashings',
        'cargo-loop-lashing-title': 'Loop Lashing',
        'cargo-loop-actual-lc': 'Actual LC (daN)',
        'cargo-loop-factor': 'Conversion Factor:',
        'cargo-loop-formula': 'Actual LC ÷ 1600',
        'cargo-frictional-lashing-title': 'Frictional Lashing',
        'cargo-frictional-actual-lc': 'Actual LC (daN)',
        'cargo-frictional-factor': 'Conversion Factor:',
        'cargo-frictional-formula': 'Actual LC ÷ 1600',
        'cargo-direct-lashing-title': 'Direct Lashing',
        'cargo-direct-actual-lc': 'Actual LC (daN)',
        'cargo-direct-factor': 'Conversion Factor:',
        'cargo-direct-formula': 'Actual LC ÷ 1600',
        
        // Budget Editor
        'budget-tab': 'Budget',
        'budget-title': 'Budget',
        'budget-name': 'Name',
        'budget-faktiske': 'Actual',
        'budget-mdr': 'Mth.',
        'budget-dag14': '14th Day',
        'budget-month-jan': 'January',
        'budget-month-feb': 'February',
        'budget-month-mar': 'March',
        'budget-month-apr': 'April',
        'budget-month-may': 'May',
        'budget-month-jun': 'June',
        'budget-month-jul': 'July',
        'budget-month-aug': 'August',
        'budget-month-sep': 'September',
        'budget-month-oct': 'October',
        'budget-month-nov': 'November',
        'budget-month-dec': 'December',
        'budget-add-income': 'Add Income',
        'budget-add-expense': 'Add Expense',
        'budget-import': 'Import',
        'budget-export-excel': 'Excel',
        'budget-export-csv': 'CSV',
        'budget-clear': 'Clear',
        'budget-income-section': 'INCOME',
        'budget-expense-section': 'EXPENSES',
        'budget-total-income': 'Total Income',
        'budget-total-expenses': 'Total Expenses',
        'budget-net': 'Net',
        'budget-action-delete': 'Delete',
        'budget-message-saved': 'Saved',
        'budget-message-saving': 'Saving...',
        'budget-message-error': 'Error saving',
        'budget-message-imported': 'Imported {count} items',
        'budget-message-exported': 'Exported to {filename}',
        
        // Budget View Modes
        'budget-view-month': 'Month View',
        'budget-view-full': 'Full Year',
        'budget-view-month-title': 'Show one month at a time',
        'budget-view-full-title': 'Show all 12 months',
        
        // Budget 14-Day Toggle
        'budget-show-14dag': 'Show 14th Day',
        'budget-show-14dag-title': 'Show/hide the 14th day columns',
        
        // Budget Formatting
        'budget-currency': 'Currency',
        'budget-currency-description': 'Select which currency to use in budget',
        'budget-number-format': 'Number Format',
        'budget-number-format-description': 'Choose how numbers should be formatted',
        'budget-format-danish': 'Danish (20.000,00)',
        'budget-format-us': 'US (20,000.00)',
        'budget-format-space': 'Space (20 000,00)',
        'budget-format-indian': 'Indian (20,00,000.00)',
        'budget-apply-format': 'Apply Format',
        
        // Budget Accounts
        'budget-account-daily': 'Daily Use',
        'budget-account-budget': 'Budget',
        'budget-transfer-title': 'Account Transfer',
        'budget-account-budget-title': 'Budget Account',
        'budget-account-daily-title': 'Daily Use Account',
        'budget-account-summary': 'Summary',
        'budget-transfer-required': 'Required:',
        'budget-transfer-advised': 'Advised:',
        'budget-transfer-based-on-history': 'Based on historical data',
        'budget-transfer-no-history': 'No history yet - add your own buffer',
        'budget-daily-income': 'Income:',
        'budget-daily-expenses': 'Expenses:',
        'budget-daily-remaining': 'Remaining:',
        'budget-budget-income': 'Budget Income:',
        'budget-budget-expenses': 'Budget Expenses:',
        'budget-budget-balance': 'Balance:',
        
        // Budget Placeholders
        'budget-income-name': 'Income name',
        'budget-expense-name': 'Expense name',
        'budget-category-name': 'Category name',
        
        // Budget Help & Guide
        'budget-help-guide': 'Help & Guide',
        'budget-help-title': 'Budget Editor Help',
        'budget-help-intro': 'The Budget Editor helps you plan and track your income and expenses across 12 months with support for 14-day mid-month tracking.',
        'budget-help-views-title': 'View Modes',
        'budget-help-view-1': '<strong>Month View:</strong> Shows one month at a time with tabs to switch between months. Great for detailed monthly planning.',
        'budget-help-view-2': '<strong>Full Year:</strong> Shows all 12 months side by side. Perfect for year-at-a-glance overview.',
        'budget-help-view-3': '<strong>14th Day:</strong> Toggle the 14-day mid-month columns on or off. Useful for bi-weekly budget tracking.',
        'budget-help-features-title': 'Key Features',
        'budget-help-feature-1': '<strong>Categories:</strong> Organize income and expenses with custom categories. Add rows within each category.',
        'budget-help-feature-2': '<strong>Auto-Save:</strong> Your budget is automatically saved as you type.',
        'budget-help-feature-3': '<strong>Totals:</strong> Automatic calculation of totals per month, per category, and overall.',
        'budget-help-feature-4': '<strong>Export:</strong> Export to Excel or CSV with full formatting and styling.',
        'budget-help-shortcuts-title': 'Quick Tips',
        'budget-help-shortcut-1': 'Use <kbd>Tab</kbd> to move between cells quickly',
        'budget-help-shortcut-2': 'Click "Add Category" to create new categories',
        'budget-help-shortcut-3': 'Use "Clear" to reset all data (with confirmation)',
        'budget-help-shortcut-4': 'Import/Export to backup or transfer your budget',
        
        // LEAN Help & Guide
        'lean-help-guide': 'Help & Guide',
        'lean-help-title': 'LEAN Tools Help',
        'lean-help-intro': 'LEAN tools help you identify waste, improve efficiency, and optimize your operations using proven manufacturing and logistics principles.',
        'lean-help-calc-title': 'Calculators',
        'lean-help-calc-1': '<strong>OEE (Overall Equipment Effectiveness):</strong> Measures how effectively equipment is used. Calculated from Availability × Performance × Quality. World-class is 85%+.',
        'lean-help-calc-2': '<strong>SMED (Single-Minute Exchange of Die):</strong> Calculate time and cost savings from reducing setup/changeover times.',
        'lean-help-calc-3': '<strong>7 Waste Types:</strong> Track costs associated with the 7 types of Muda (waste): overproduction, waiting, transport, overprocessing, inventory, motion, and defects.',
        'lean-help-tips-title': 'Using LEAN Tools',
        'lean-help-tip-1': '<strong>SWOT Analysis:</strong> Use for strategic planning to identify Strengths, Weaknesses, Opportunities, and Threats.',
        'lean-help-tip-2': '<strong>Reference Library:</strong> Quick access to LEAN concepts like 5S, 7R, 3M, PDCA, JIT, Kanban, FIFO, and Kaizen.',
        'lean-help-tip-3': '<strong>Integration:</strong> Connect LEAN principles with your ABC analysis, EOQ calculations, and inventory management for a holistic approach.',
        
        // Budget Tooltips
        'budget-year-title': 'Select or enter a year',
        'budget-month-filter-title': 'Month Overview',
        'budget-sidebar-title': 'Year Overview Sidebar',
        'budget-saved-title': 'Saved',
        'budget-undo-title': 'Undo (Ctrl+Z)',
        'budget-redo-title': 'Redo (Ctrl+Y)',
        'budget-search-placeholder': '🔍 Search by name...',
        
        // LEAN Tooltips
        'lean-oee-tooltip': 'What is OEE?',
        'lean-smed-tooltip': 'What is SMED?',
        'lean-waste-tooltip': 'What are the 7 Wastes?',
        
        // Modal/General
        'modal-close-title': 'Close (Esc)',
        
        // Alert Messages
        'alert-invalid-numbers': 'Please enter valid numbers in all fields.',
        'alert-positive-values': 'All values must be positive numbers greater than zero.',
        'alert-interest-limit': 'Interest rate cannot exceed 100%',
        'alert-upload-file-type': 'Please upload a CSV or Excel file',
        'alert-csv-parse-error': 'Error parsing CSV file',
        'alert-excel-parse-error': 'Error parsing Excel file',
        'alert-swot-exported-md': 'SWOT Analysis exported as Markdown!',
        'alert-swot-exported-png': 'SWOT Analysis exported as PNG image!',
        
        // Confirm Messages
        'confirm-delete-row': 'Are you sure you want to delete this row?',
        'confirm-reset-settings': 'Are you sure you want to reset to default settings?',
        'confirm-delete-shortcut': 'Are you sure you want to delete this shortcut?',
        'confirm-delete-page': 'Are you sure you want to delete "{name}"?',
        
        // Button Labels (Custom Pages)
        'edit': 'Edit',
        'duplicate': 'Duplicate',
        'export': 'Export',
        
        // Budget Category Buttons
        'budget-add-income-category': '+ Category (I)',
        'budget-add-expense-category': '+ Category (E)',
        'budget-add-income-category-title': 'Add income category',
        'budget-add-expense-category-title': 'Add expense category',
        
        // Budget Sidebar & Modal Headings
        'budget-sidebar-heading': '📊 Year Overview',
        'budget-month-overview-heading': '📅 Month Overview',
        'budget-select-month-label': 'Select month to focus on:',
        
        // Budget Keyboard Shortcuts
        'budget-undo-label': 'Undo',
        'budget-redo-label': 'Redo',
        
        // Budget Overview Dashboard
        'budget-transfer-main-title': 'Budget Overview',
        'budget-settings-btn': 'Settings',
        'budget-how-btn': 'How?',
        'budget-total-income-label': 'Total Income',
        'budget-total-expenses-label': 'Total Expenses',
        'budget-balance-label': 'Balance',
        'budget-monthly-label': 'Monthly',
        'budget-biweekly-label': 'Every 14 Days',
        'budget-whole-year': 'Full year',
        'budget-surplus-deficit': 'Surplus / Deficit',
        'budget-first-of-month': 'On the 1st',
        'budget-every-other-week': 'Every other week',
        'budget-monthly-trends': 'Monthly Trends',
        'budget-calc-explanation': 'Calculation Explanation',
        'budget-yearly-calc': 'Annual Calculation',
        'budget-total-income-year': 'Total income (full year):',
        'budget-total-expenses-year': 'Total expenses (full year):',
        'budget-required-savings': 'Required savings (yearly):',
        'budget-monthly-breakdown': 'Monthly Breakdown',
        'budget-monthly-breakdown-desc': 'If you transfer <strong>every month</strong> (12 times a year):',
        'budget-monthly-math': 'Annual amount ÷ 12 months =',
        'budget-biweekly-breakdown': '14-Day Breakdown',
        'budget-biweekly-breakdown-desc': 'If you transfer <strong>every 14 days</strong> (26 times a year):',
        'budget-biweekly-math': 'Annual amount ÷ 26 periods =',
        'budget-why-it-works': 'Why This Works',
        'budget-why-1': 'By saving <strong>regularly</strong>, you always have money ready for your fixed expenses.',
        'budget-why-2': 'Automatic transfers mean you <strong>never forget</strong> to save.',
        'budget-why-3': 'Smaller amounts more often are <strong>easier to manage</strong> than large amounts rarely.',
        'budget-calc-settings': 'Calculation Settings',
        'budget-split-partner': 'Split expenses with partner',
        'budget-split-partner-desc': 'If you share household expenses with a partner, you can calculate only your share',
        'budget-your-share': 'Your share:',
        'budget-add-buffer': 'Add safety buffer',
        'budget-add-buffer-desc': 'Add extra percentage to expenses for unexpected costs or increases',
        'budget-buffer-pct-label': 'Buffer percentage:',
        'budget-example': 'Example',
        'budget-income-btn': 'Income',
        'budget-expense-btn': 'Expense',
        'budget-cat-income-short': 'Cat. (I)',
        'budget-cat-expense-short': 'Cat. (E)',
        'budget-sidebar-income': 'INCOME',
        'budget-sidebar-expenses': 'EXPENSES',
        'budget-actual-label': 'Actual:',
        'budget-unnamed': 'Unnamed',
        'budget-year-overview-title': 'Annual Overview',
        'budget-total-income-yr': 'Total income',
        'budget-total-expenses-yr': 'Total expenses',
        'budget-yearly-net': 'Yearly net',
        'budget-month-income': 'Income:',
        'budget-month-expenses': 'Expenses:',
        'budget-month-net': 'Net:',
        'budget-year': 'year',
        'budget-month': 'month',
        'budget-months': 'months',
        'budget-periods': 'periods',
        'budget-per-month': 'per month',
        'budget-per-14days': 'per 14 days',
        'budget-with-buffer': 'With buffer',
        'budget-surplus': 'Surplus:',
        'budget-deficit': 'Deficit:',
        'budget-or': 'or',
        'budget-every-14-days': 'every 14 days',
        'budget-avg-per-month': 'Your budget shows the following average per month:',
        'budget-can-afford': 'With this plan you can afford to save',
        'budget-warning-deficit': 'Warning - Budget Deficit:',
        'budget-shortfall': 'You are',
        'budget-shortfall2': 'short over the year. Consider:',
        'budget-reduce-expenses': 'Reduce your expenses',
        'budget-increase-income': 'Increase your income',
        'budget-review-budget': 'Review your budget for unrealistic figures',
        'budget-found-recurring': 'Found',
        'budget-fixed-expenses': 'recurring expenses',
        'budget-info-columns-title': 'ℹ️ About Budget Columns',
        'budget-info-col-1': '• The <strong>"Actual"</strong> column is for comparison only and is NOT counted in the annual calculation',
        'budget-info-col-2': '• <strong>Month columns</strong> (Jan, Feb, etc.) are used to calculate your annual budget',
        'budget-info-col-3': '• The system sums only the 12 monthly columns to calculate how much you need to save',
        'budget-example-desc': 'With these settings, if your total expenses are <strong>10,000 kr/month</strong>:',
        'budget-example-step1': '1. <strong>Total expenses:</strong> 10,000 kr',
        'budget-example-step2': '2. <strong>Your share (50%):</strong> 5,000 kr',
        'budget-example-step3': '3. <strong>With buffer (+5%):</strong> 5,250 kr <span class="text-green-600">← Recommended transfer</span>',
        'budget-settings-note': '<strong>ℹ️ Note:</strong> Changes take effect immediately and update all calculations automatically.'
    }
};

// ========================================
// Initialization
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    preventGlobalFileDrop(); // Prevent browser from opening dragged files
    initializeApp();
    setupEventListeners();
    loadSettings();
    
    // Initialize Custom Pages System (if available)
    if (typeof initializeCustomPages === 'function') {
        initializeCustomPages();
    }
    
    // Initialize Budget Editor (if available)
    if (typeof BudgetEditor !== 'undefined') {
        window.budgetEditor = new BudgetEditor();
        console.log('Budget Editor initialized');
    }
});

function initializeApp() {
    console.log('ABC & EOQ Dashboard initialized');
    
    // Set initial theme and language from localStorage or defaults
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedLanguage = localStorage.getItem('language') || 'da';
    const savedChartType = localStorage.getItem('defaultChartType') || 'pareto';
    
    setTheme(savedTheme);
    setLanguage(savedLanguage);
    
    const defaultChartSelect = document.getElementById('defaultChartSelect');
    const chartTypeSelect = document.getElementById('chartTypeSelect');
    if (defaultChartSelect) defaultChartSelect.value = savedChartType;
    if (chartTypeSelect) chartTypeSelect.value = savedChartType;
    
    // Initialize new v2.0 features
    setupDragDrop();
    setupCompareDragDrop();
    setupKeyboardShortcuts();
    
    // Load saved thresholds
    const savedThresholds = localStorage.getItem('abcThresholds');
    if (savedThresholds) {
        const thresholds = JSON.parse(savedThresholds);
        const thresholdAEl = document.getElementById('thresholdASingle');
        const thresholdBEl = document.getElementById('thresholdBSingle');
        const thresholdCEl = document.getElementById('thresholdC');
        if (thresholdAEl) thresholdAEl.value = thresholds.A;
        if (thresholdBEl) thresholdBEl.value = thresholds.B;
        if (thresholdCEl) thresholdCEl.value = thresholds.C;
    }
    
    // Load education mode setting
    const savedEducationMode = localStorage.getItem('educationMode') === 'true';
    educationMode = savedEducationMode;
    const educationToggle = document.getElementById('educationModeToggle');
    const learningContent = document.getElementById('learningContent');
    const educationNotice = document.getElementById('educationModeNotice');
    const learnTabBtn = document.getElementById('learnTabBtn');
    if (educationToggle) educationToggle.checked = educationMode;
    if (learningContent) learningContent.classList.toggle('hidden', !educationMode);
    if (educationNotice) educationNotice.classList.toggle('hidden', educationMode);
    if (learnTabBtn) learnTabBtn.classList.toggle('hidden', !educationMode);
    
    // Initialize Quick Actions
    renderQuickActions();
    
    // Initialize threshold C values
    updateThresholdC('single');
    updateThresholdC('doubleValue');
    updateThresholdC('doubleConsumption');
    
    // Set ABC thresholds section to expanded by default
    const abcToggleIcon = document.getElementById('abcThresholdsToggleIcon');
    if (abcToggleIcon) {
        abcToggleIcon.style.transform = 'rotate(180deg)';
    }
    
    // Load persisted data
    loadPersistedData();
    
    // Check for first-time user and show tutorial
    checkFirstTimeUser();
}

// Data Persistence Functions
function saveDataToStorage() {
    try {
        const dataToSave = {
            uploadedData: uploadedData,
            abcResults: abcResults,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('abcDashboardData', JSON.stringify(dataToSave));
    } catch (error) {
        console.warn('Could not save data to localStorage:', error);
    }
}

function loadPersistedData() {
    try {
        const savedData = localStorage.getItem('abcDashboardData');
        if (savedData) {
            const data = JSON.parse(savedData);
            const savedDate = new Date(data.timestamp);
            const hoursSinceUpdate = (Date.now() - savedDate.getTime()) / (1000 * 60 * 60);
            
            // Only restore if data is less than 24 hours old
            if (hoursSinceUpdate < 24 && data.uploadedData && data.uploadedData.length > 0) {
                const message = currentLanguage === 'da'
                    ? `Tidligere data fundet (${savedDate.toLocaleString()}). Gendan?`
                    : `Previous data found (${savedDate.toLocaleString()}). Restore?`;
                
                if (confirm(message)) {
                    uploadedData = data.uploadedData;
                    abcResults = data.abcResults || [];
                    
                    if (abcResults.length > 0) {
                        displayResults();
                        updateDashboard();
                        showToast(currentLanguage === 'da' ? 'Data gendannet!' : 'Data restored!', 'success');
                    } else if (uploadedData.length > 0) {
                        displayPreview();
                        const fileInfoDiv = document.getElementById('fileInfo');
                        const fileRowsSpan = document.getElementById('fileRows');
                        if (fileInfoDiv && fileRowsSpan) {
                            fileRowsSpan.textContent = uploadedData.length;
                            fileInfoDiv.classList.remove('hidden');
                        }
                        showToast(currentLanguage === 'da' ? 'Data gendannet!' : 'Data restored!', 'success');
                    }
                }
            }
        }
    } catch (error) {
        console.warn('Could not load persisted data:', error);
    }
}

// Add print timestamp when printing
window.addEventListener('beforeprint', function() {
    const timestampEl = document.querySelector('.print-timestamp');
    if (timestampEl) {
        const now = new Date().toLocaleString();
        timestampEl.textContent = currentLanguage === 'da' ? `Genereret: ${now}` : `Generated: ${now}`;
    }
});

// Loading Spinner Functions
function showLoadingSpinner(message = (currentLanguage === 'da' ? 'Indlæser...' : 'Loading...')) {
    let spinner = document.getElementById('loadingSpinner');
    if (!spinner) {
        spinner = document.createElement('div');
        spinner.id = 'loadingSpinner';
        spinner.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        spinner.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
                <div class="flex items-center space-x-4">
                    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    <span class="text-lg font-medium text-gray-900 dark:text-white">${message}</span>
                </div>
            </div>
        `;
        document.body.appendChild(spinner);
    } else {
        spinner.querySelector('span').textContent = message;
        spinner.classList.remove('hidden');
    }
}

function hideLoadingSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.classList.add('hidden');
    }
}

// ========================================
// Interactive Tutorial
// ========================================

let tutorialStep = 0;
let tutorialSteps = [
    {
        element: '#fileDropZone',
        title: { da: '📂 Trin 1: Upload Data', en: '📂 Step 1: Upload Data' },
        message: { da: 'Start med at uploade din CSV eller Excel fil med lagerdata. Du kan også trække og slippe filen her.', en: 'Start by uploading your CSV or Excel file with inventory data. You can also drag and drop the file here.' },
        action: () => { const el = document.querySelector('#fileDropZone'); if (el) el.classList.add('ring-4', 'ring-blue-500'); }
    },
    {
        element: '#processBtn',
        title: { da: '🔍 Trin 2: Analysér Data', en: '🔍 Step 2: Analyze Data' },
        message: { da: 'Når data er uploaded, klik på "Analyser Data" for at køre ABC analysen.', en: 'Once data is uploaded, click "Analyze Data" to run the ABC analysis.' },
        action: () => {}
    },
    {
        element: '#resultsSection',
        title: { da: '📊 Trin 3: Se Resultater', en: '📊 Step 3: View Results' },
        message: { da: 'Resultaterne viser dine varer klassificeret i A, B, og C grupper baseret på værdi.', en: 'Results show your items classified into A, B, and C groups based on value.' },
        action: () => {}
    },
    {
        element: '[data-tab="wilson"]',
        title: { da: '🧮 Trin 4: Beregn EOQ', en: '🧮 Step 4: Calculate EOQ' },
        message: { da: 'Brug Wilson-beregneren til at beregne optimal ordrestørrelse (EOQ) for dine varer.', en: 'Use the Wilson calculator to calculate optimal order quantity (EOQ) for your items.' },
        action: () => {}
    },
    {
        element: '[data-tab="abc-double"]',
        title: { da: '📐 Trin 5: ABC Dobbelt Analyse', en: '📐 Step 5: ABC Double Analysis' },
        message: { da: 'ABC Dobbelt analyse klassificerer varer baseret på både værdi og forbrug i en 3×3 matrix.', en: 'ABC Double analysis classifies items based on both value and consumption in a 3×3 matrix.' },
        action: () => {}
    },
    {
        element: '[data-tab="dashboard"]',
        title: { da: '📈 Trin 6: Dashboard', en: '📈 Step 6: Dashboard' },
        message: { da: 'Dashboard giver et hurtigt overblik over dine lagerstatistikker og top varer.', en: 'Dashboard provides a quick overview of your inventory statistics and top items.' },
        action: () => {}
    }
];

function checkFirstTimeUser() {
    // Welcome popup disabled - users can access tutorial via Help button
    localStorage.setItem('hasVisitedBefore', 'true');
}

function startTutorial() {
    // Get current active tab
    const activeTab = document.querySelector('.tab-content:not(.hidden)');
    const currentPage = activeTab ? activeTab.id.replace('-section', '') : 'dashboard';
    
    // Load page-specific tutorial steps
    tutorialStep = 0;
    loadPageTutorial(currentPage);
    showTutorialStep();
}

function loadPageTutorial(pageName) {
    const pageTutorials = {
        'dashboard': [
            {
                element: '#dashboard-section',
                title: { da: '📊 Velkommen til Dashboard', en: '📊 Welcome to Dashboard' },
                message: { da: 'Dashboard er din kontrolcentral med hurtig adgang til alle vigtige funktioner. Lad os gennemgå hovedfunktionerne.', en: 'Dashboard is your control center with quick access to all important functions. Let\'s go through the main features.' },
                action: () => {}
            },
            {
                element: '#quickActionsGrid',
                title: { da: '🎯 Quick Actions', en: '🎯 Quick Actions' },
                message: { da: 'Her finder du genveje til ofte brugte funktioner: ABC-analyse, datavisning, eksport og print. Klik på enhver af dem for at udføre handlingen.', en: 'Here you find shortcuts to frequently used functions: ABC analysis, data viewing, export, and print. Click any of them to perform the action.' },
                action: () => {}
            },
            {
                element: '.result-card',
                title: { da: '📈 Statistik Oversigt', en: '📈 Statistics Overview' },
                message: { da: 'Se oversigt over totale varer, samlet værdi, antal A-varer og seneste analyse tidspunkt. Opdateres automatisk når du kører analyser.', en: 'View overview of total items, total value, number of A-items, and latest analysis time. Updates automatically when you run analyses.' },
                action: () => {}
            },
            {
                element: '#dashTopItems',
                title: { da: '🏆 Top 5 Varer', en: '🏆 Top 5 Items' },
                message: { da: 'Hurtigt overblik over dine mest værdifulde varer efter værdi (forbrug × pris). Perfekt til at identificere hvilke varer der kræver mest opmærksomhed.', en: 'Quick overview of your most valuable items by value (consumption × price). Perfect for identifying which items require the most attention.' },
                action: () => {}
            },
            {
                element: '#quickActionsCustomizer',
                title: { da: '🎨 Tilpas Dashboard', en: '🎨 Customize Dashboard' },
                message: { da: 'Gå til Indstillinger og klik "Tilpas" for at vælge hvilke genveje der vises og træk dem for at ændre rækkefølgen. Prøv at klikke på tandhjulet i øverste højre hjørne af Quick Actions for at åbne tilpasningsmenu.', en: 'Go to Settings and click "Customize" to choose which shortcuts are displayed and drag them to change their order. Try clicking the gear icon in the top right corner of Quick Actions to open the customization menu.' },
                action: () => {}
            }
        ],
        'abc': [
            {
                element: '#abc-section',
                title: { da: '📈 ABC-Analyse', en: '📈 ABC Analysis' },
                message: { da: 'ABC-analyse klassificerer dine lagervarer baseret på deres økonomiske betydning ved hjælp af Pareto-princippet (80/20-reglen). Lad os gennemgå processen.', en: 'ABC analysis classifies your inventory items based on their economic importance using the Pareto principle (80/20 rule). Let\'s go through the process.' },
                action: () => {}
            },
            {
                element: '#uploadSection',
                title: { da: '📤 Trin 1: Upload Data', en: '📤 Step 1: Upload Data' },
                message: { da: 'Upload din CSV eller Excel fil med kolonner: Varenavn, Forbrug, Pris. Du kan trække og slippe filen eller klikke for at vælge.', en: 'Upload your CSV or Excel file with columns: Item Name, Consumption, Price. You can drag and drop the file or click to select.' },
                action: () => {}
            },
            {
                element: '#processBtn',
                title: { da: '⚙️ Trin 2: Analyser Data', en: '⚙️ Step 2: Analyze Data' },
                message: { da: 'Klik "Analyser Data" for at beregne ABC-klassificering. Systemet sorterer varerne efter værdi og opdeler dem i A (høj), B (mellem) og C (lav) kategorier.', en: 'Click "Analyze Data" to calculate ABC classification. The system sorts items by value and divides them into A (high), B (medium), and C (low) categories.' },
                action: () => {}
            },
            {
                element: '#chartTypeSelect',
                title: { da: '📊 Trin 3: Se Resultater', en: '📊 Step 3: View Results' },
                message: { da: 'Vælg mellem Pareto-diagram (viser kumulativ værdi) eller Pie Chart (viser procentdel fordeling). Pareto er bedst til at visualisere 80/20-reglen.', en: 'Choose between Pareto chart (shows cumulative value) or Pie Chart (shows percentage distribution). Pareto is best for visualizing the 80/20 rule.' },
                action: () => {}
            },
            {
                element: '#resultsSection',
                title: { da: '📋 Trin 4: Eksporter Resultater', en: '📋 Step 4: Export Results' },
                message: { da: 'Download dine resultater som CSV eller Excel fil. Resultaterne inkluderer ABC-klassificering for hver vare, så du kan bruge dem i andre systemer.', en: 'Download your results as CSV or Excel file. Results include ABC classification for each item, so you can use them in other systems.' },
                action: () => {}
            },
            {
                element: '[data-tab="settings"]',
                title: { da: '⚙️ Avanceret: ABC-Tærskler', en: '⚙️ Advanced: ABC Thresholds' },
                message: { da: 'Gå til Indstillinger for at justere ABC-tærskelværdier. Standard er 80/15/5, men du kan tilpasse efter dine behov (f.eks. 70/20/10 for mere afslappet klassificering).', en: 'Go to Settings to adjust ABC threshold values. Default is 80/15/5, but you can customize to your needs (e.g., 70/20/10 for more relaxed classification).' },
                action: () => {}
            }
        ],
        'wilson': [
            {
                element: '#wilson-section',
                title: { da: '🧮 Wilson EOQ Beregning', en: '🧮 Wilson EOQ Calculation' },
                message: { da: 'Economic Order Quantity (EOQ) beregner den optimale ordremængde der minimerer dine samlede lageromkostninger. Formlen balancerer ordreomkostninger mod lageromkostninger.', en: 'Economic Order Quantity (EOQ) calculates the optimal order quantity that minimizes your total inventory costs. The formula balances order costs against holding costs.' },
                action: () => {}
            },
            {
                element: '#demandInput',
                title: { da: '📊 Årligt Forbrug (D)', en: '📊 Annual Demand (D)' },
                message: { da: 'Indtast hvor mange enheder du bruger per år. F.eks. hvis du sælger 1200 styk om året, indtast 1200.', en: 'Enter how many units you use per year. For example, if you sell 1200 pieces annually, enter 1200.' },
                action: () => {}
            },
            {
                element: '#orderCostInput',
                title: { da: '💰 Ordreomkostning (S)', en: '💰 Order Cost (S)' },
                message: { da: 'Indtast omkostningen ved at lave én ordre. Dette inkluderer administration, transport, modtagelse osv. F.eks. 500 kr per ordre.', en: 'Enter the cost of placing one order. This includes administration, transport, receiving, etc. For example, 500 kr per order.' },
                action: () => {}
            },
            {
                element: '#priceInput',
                title: { da: '💵 Pris & Rente', en: '💵 Price & Interest' },
                message: { da: 'Indtast pris per enhed og lagerrentesats (%). Disse bruges sammen til at beregne lageromkostningen: Holding Cost = Pris × Rente / 100. Standard rente er 5%.', en: 'Enter price per unit and holding cost interest rate (%). These are used together to calculate holding costs: Holding Cost = Price × Interest / 100. Default interest is 5%.' },
                action: () => {}
            },
            {
                element: '#calculateBtn',
                title: { da: '🧮 Beregn EOQ', en: '🧮 Calculate EOQ' },
                message: { da: 'Klik på Beregn EOQ knappen for at se den optimale ordremængde baseret på dine input. Du kan også tilføje flere scenarier for at sammenligne forskellige situationer.', en: 'Click the Calculate EOQ button to see the optimal order quantity based on your inputs. You can also add multiple scenarios to compare different situations.' },
                action: () => {}
            },
            {
                element: '#wilsonResults',
                title: { da: '📈 EOQ Resultater', en: '📈 EOQ Results' },
                message: { da: 'Se optimal ordremængde (Q*), antal ordrer per år, lageromkostning, ordreomkostning og totalomkostning. Q* er den mængde hvor de samlede omkostninger er lavest.', en: 'View optimal order quantity (Q*), orders per year, holding cost, order cost, and total cost. Q* is the quantity where total costs are lowest.' },
                action: () => {}
            }
        ],
        'inventory': [
            {
                element: '#inventory-section',
                title: { da: '📦 Lagerstyring', en: '📦 Inventory Management' },
                message: { da: 'Tre kraftfulde værktøjer til optimal lagerstyring: Genbestillingspunkt (ROP), Periodisk Gennemgang, og Min/Max-system. Lad os gennemgå hver funktion.', en: 'Three powerful tools for optimal inventory management: Reorder Point (ROP), Periodic Review, and Min/Max System. Let\'s go through each function.' },
                action: () => {}
            },
            {
                element: '#ropDailyDemand',
                title: { da: '🎯 ROP Beregner', en: '🎯 ROP Calculator' },
                message: { da: 'Genbestillingspunkt (ROP) fortæller dig præcis hvornår du skal genbestille. Formel: ROP = (Dagligt forbrug × Leveringstid) + Sikkerhedslager. Indtast dine værdier for at se resultatet.', en: 'Reorder Point (ROP) tells you exactly when to reorder. Formula: ROP = (Daily consumption × Lead time) + Safety stock. Enter your values to see the result.' },
                action: () => {}
            },
            {
                element: '#ropResults',
                title: { da: '🛡️ Sikkerhedslager', en: '🛡️ Safety Stock' },
                message: { da: 'Sikkerhedslager beskytter mod variation i efterspørgsel og leveringstid. Højere serviceniveau (95%, 99%) = større sikkerhedslager = færre stockouts. Vælg dit ønskede serviceniveau i dropdown.', en: 'Safety stock protects against variation in demand and lead time. Higher service level (95%, 99%) = larger safety stock = fewer stockouts. Choose your desired service level in the dropdown.' },
                action: () => {}
            },
            {
                element: '#prDailyDemand',
                title: { da: '🗓️ Periodisk Gennemgang', en: '🗓️ Periodic Review' },
                message: { da: 'Perfekt til faste indkøbsdage (fx hver 14. dag). Beregn hvor meget du skal bestille op til et målniveau. Inkluderer visuel graf over forventet lagerniveau over tid.', en: 'Perfect for fixed ordering days (e.g., every 14 days). Calculate how much to order up to a target level. Includes visual chart of expected inventory level over time.' },
                action: () => {}
            },
            {
                element: '#mmResults',
                title: { da: '📊 Min/Max System', en: '📊 Min/Max System' },
                message: { da: 'Min/Max-system med visuel dashboard. Sæt minimum og maksimum lagerniveauer, og systemet viser status, behærsknings-grad og om du skal bestille. Perfekt til enkel lageradministration.', en: 'Min/Max system with visual dashboard. Set minimum and maximum inventory levels, and the system shows status, capacity utilization, and whether you need to order. Perfect for simple inventory management.' },
                action: () => {}
            },
            {
                element: '#minMaxChart',
                title: { da: '📈 Lagerniveau Visualisering', en: '📈 Inventory Level Visualization' },
                message: { da: 'Grafen viser dit aktuelle lagerniveau i forhold til min, max og sikkerhedslager. Farver indikerer status: Grøn = OK, Gul = Lav, Rød = Kritisk. Opdateres automatisk når du ændrer værdier.', en: 'The chart shows your current inventory level relative to min, max, and safety stock. Colors indicate status: Green = OK, Yellow = Low, Red = Critical. Updates automatically when you change values.' },
                action: () => {}
            },
            {
                element: '[data-tab="settings"]',
                title: { da: '⚙️ Serviceniveau Indstillinger', en: '⚙️ Service Level Settings' },
                message: { da: 'Gå til Indstillinger for at vælge standard serviceniveau (90-99.5%) for alle ROP-beregninger. Højere serviceniveau betyder større sikkerhedslager men færre stockouts.', en: 'Go to Settings to choose default service level (90-99.5%) for all ROP calculations. Higher service level means larger safety stock but fewer stockouts.' },
                action: () => {}
            },
            {
                element: '[data-tab="wilson"]',
                title: { da: '💡 Kombiner med EOQ', en: '💡 Combine with EOQ' },
                message: { da: 'Brug ROP sammen med EOQ for komplet lagerstyring: EOQ fortæller dig hvor meget du skal bestille, ROP fortæller dig hvornår. Klik for at gå til Wilson-siden.', en: 'Use ROP together with EOQ for complete inventory management: EOQ tells you how much to order, ROP tells you when. Click to go to Wilson page.' },
                action: () => { switchTab('wilson'); }
            }
        ],
        'learn': [
            {
                element: '#learn-section',
                title: { da: '📚 Læringsressourcer', en: '📚 Learning Resources' },
                message: { da: 'Lær om ABC-analyse, EOQ og lagerstyring gennem teori, eksempler og øvelsesdata. Perfekt til studerende og dem der vil forstå teorien bag.', en: 'Learn about ABC analysis, EOQ, and inventory management through theory, examples, and practice data. Perfect for students and those who want to understand the theory.' },
                action: () => {}
            },
            {
                element: '#theory-content',
                title: { da: '📖 Teori & Koncepter', en: '📖 Theory & Concepts' },
                message: { da: 'Klik på "Theory & Concepts" overskriften for at åbne og læse om teorien bag ABC-analyse (Pareto-princippet), Wilson EOQ-formel og genbestillingspunkt. Forklaret med eksempler og praktiske anvendelser.', en: 'Click on the "Theory & Concepts" heading to expand and read about the theory behind ABC analysis (Pareto principle), Wilson EOQ formula, and reorder point. Explained with examples and practical applications.' },
                action: () => {
                    const theoryContent = document.getElementById('theory-content');
                    if (theoryContent && theoryContent.classList.contains('hidden')) {
                        document.querySelector('button[onclick="toggleLearnSection(\'theory\')"]')?.click();
                    }
                }
            },
            {
                element: 'button[onclick*="loadSampleDataset(\'retail\')"]',
                title: { da: '🎲 Prøvedata', en: '🎲 Sample Data' },
                message: { da: 'Klik for at indlæse eksempel-datasæt: Detailbutik (15 varer, simpel), Lager (50 varer, varieret), Produktion (100 varer, realistisk). Start med det lille!', en: 'Click to load example datasets: Retail Store (15 items, simple), Warehouse (50 items, varied), Manufacturing (100 items, realistic). Start with the small one!' },
                action: () => {}
            },
            {
                element: '[data-i18n="quick-start-guide"]',
                title: { da: '📝 Hurtig Startguide', en: '📝 Quick Start Guide' },
                message: { da: 'Følg den trinvise guide ovenfor gennem hele processen: upload data → analyser → beregn EOQ → eksporter. Perfekt til første gang brugere.', en: 'Follow the step-by-step guide above through the entire process: upload data → analyze → calculate EOQ → export. Perfect for first-time users.' },
                action: () => {
                    document.getElementById('learn-section')?.scrollTo(0, 0);
                }
            },
            {
                element: '[data-tab="settings"]',
                title: { da: '🎓 Uddannelsestilstand', en: '🎓 Education Mode' },
                message: { da: 'Gå til Indstillinger og aktiver Uddannelsestilstand for fuld adgang til alle læringsressourcer, øvelsesdatasæt og ekstra forklaringer.', en: 'Go to Settings and enable Education Mode for full access to all learning resources, practice datasets, and extra explanations.' },
                action: () => {}
            }
        ],
        'settings': [
            {
                element: '#settings-section',
                title: { da: '⚙️ Indstillinger', en: '⚙️ Settings' },
                message: { da: 'Tilpas applikationen til dine behov. Her kan du ændre sprog, tema, standardværdier, aktivere funktioner og meget mere.', en: 'Customize the application to your needs. Here you can change language, theme, default values, enable features, and much more.' },
                action: () => {}
            },
            {
                element: '#lightThemeBtn',
                title: { da: '🌓 Tema Indstillinger', en: '🌓 Theme Settings' },
                message: { da: 'Skift mellem lys og mørk tilstand. Mørkere tilstand reducerer øjenbelastning i mørke miljøer, mens lys tilstand er bedre ved dagslys.', en: 'Switch between light and dark mode. Dark mode reduces eye strain in low-light environments, while light mode is better in daylight.' },
                action: () => {}
            },
            {
                element: '#daBtn',
                title: { da: '🌍 Sprog', en: '🌍 Language' },
                message: { da: 'Skift mellem dansk og engelsk. Alle menuer, beskeder og hjælpetekster oversættes automatisk.', en: 'Switch between Danish and English. All menus, messages, and help texts are automatically translated.' },
                action: () => {}
            },
            {
                element: '#customPagesManagementGrid',
                title: { da: '🎨 Brugerdefinerede Sider', en: '🎨 Custom Pages' },
                message: { da: 'Opret dine egne beregningssider med formler, input, grafer og simulering. Brug skabeloner fra biblioteket eller byg fra bunden. Eksporter og del med andre.', en: 'Create your own calculation pages with formulas, inputs, charts, and simulation. Use templates from the library or build from scratch. Export and share with others.' },
                action: () => {}
            },
            {
                element: '#defaultChartSelect',
                title: { da: '📊 Standard Graftype', en: '📊 Default Chart Type' },
                message: { da: 'Vælg Pareto-diagram eller Pie Chart som standard for ABC-analyse. Pareto er bedst til at visualisere 80/20-reglen og kumulativ værdi.', en: 'Choose Pareto chart or Pie Chart as default for ABC analysis. Pareto is best for visualizing the 80/20 rule and cumulative value.' },
                action: () => {}
            },
            {
                element: '#defaultServiceLevelSelect',
                title: { da: '📈 Standard Serviceniveau', en: '📈 Default Service Level' },
                message: { da: 'Vælg standard serviceniveau for ROP-beregninger (90-99.5%). Højere serviceniveau = større sikkerhedslager = færre stockouts men højere lageromkostninger.', en: 'Choose default service level for ROP calculations (90-99.5%). Higher service level = larger safety stock = fewer stockouts but higher holding costs.' },
                action: () => {}
            },
            {
                element: '#autoSaveToggle',
                title: { da: '💾 Auto-gem', en: '💾 Auto-save' },
                message: { da: 'Når aktiveret, gemmes dine analyseresultater automatisk og gendannes når du åbner applikationen næste gang. Slå fra hvis du arbejder med følsomme data.', en: 'When enabled, your analysis results are automatically saved and restored when you open the application next time. Turn off if working with sensitive data.' },
                action: () => {}
            },
            {
                element: '#encryptionStatus',
                title: { da: '🔒 Datakryptering', en: '🔒 Data Encryption' },
                message: { da: 'Beskyt dine data med adgangskode-baseret kryptering. All data krypteres før lagring i browseren. VIGTIGT: Gem din adgangskode sikkert - den kan ikke gendannes!', en: 'Protect your data with password-based encryption. All data is encrypted before storage in the browser. IMPORTANT: Store your password securely - it cannot be recovered!' },
                action: () => {}
            },
            {
                element: '#thresholdASingle',
                title: { da: '📊 ABC-Tærskler', en: '📊 ABC Thresholds' },
                message: { da: 'Justér klassificeringsgrænser for ABC-analyse. Standard 80/15/5 (A/B/C), men du kan bruge presets som 60/30/10 (stram) eller 70/20/10 (afslappet). Gå til ABC-siden for at se tærsklerne.', en: 'Adjust classification boundaries for ABC analysis. Default 80/15/5 (A/B/C), but you can use presets like 60/30/10 (tight) or 70/20/10 (relaxed). Go to ABC page to see the thresholds.' },
                action: () => { switchTab('abc'); }
            }
        ],
        'budget': [
            {
                element: '#budget-section',
                title: { da: '💰 Budget Editor', en: '💰 Budget Editor' },
                message: { da: 'Budgetværktøjet hjælper dig med at planlægge og spore indtægter og udgifter på tværs af 12 måneder med support for 14-dages midt-måned sporing.', en: 'The Budget tool helps you plan and track income and expenses across 12 months with support for mid-month 14-day tracking.' },
                action: () => {}
            },
            {
                element: '#view-mode-month',
                title: { da: '📅 Visningstilstande', en: '📅 View Modes' },
                message: { da: 'Skift mellem Månedsvisning (én måned ad gangen) eller Helt År (alle 12 måneder side om side). Brug faner til at skifte mellem måneder i månedsvisning.', en: 'Switch between Month View (one month at a time) or Full Year (all 12 months side by side). Use tabs to switch between months in month view.' },
                action: () => {}
            },
            {
                element: '#budget-show-14dag',
                title: { da: '📆 14-Dages Kolonner', en: '📆 14-Day Columns' },
                message: { da: 'Slå 14-dages kolonnerne til eller fra. Nyttigt til halvmånedlig budgetsporing hvor du vil se både månedens start og midt-måned beløb.', en: 'Toggle the 14-day columns on or off. Useful for bi-weekly budget tracking where you want to see both month start and mid-month amounts.' },
                action: () => {}
            },
            {
                element: '#budget-add-income-btn',
                title: { da: '➕ Tilføj Rækker', en: '➕ Add Rows' },
                message: { da: 'Klik "+ Income" eller "+ Expense" for at tilføje enkelt rækker. Brug "+ Category" knapperne for at oprette kategorier der organiserer dine rækker.', en: 'Click "+ Income" or "+ Expense" to add individual rows. Use "+ Category" buttons to create categories that organize your rows.' },
                action: () => {}
            },
            {
                element: '#budget-undo-btn',
                title: { da: '↶ Fortryd/Gentag', en: '↶ Undo/Redo' },
                message: { da: 'Brug Fortryd (Ctrl+Z) og Gentag (Ctrl+Y) til at angre eller gendanne ændringer. Al redigering spores automatisk.', en: 'Use Undo (Ctrl+Z) and Redo (Ctrl+Y) to revert or restore changes. All editing is tracked automatically.' },
                action: () => {}
            },
            {
                element: '#budget-export-excel-btn',
                title: { da: '📊 Eksport', en: '📊 Export' },
                message: { da: 'Eksportér dit budget til Excel eller CSV med fuld formatering, farver, totaler og styling. Perfekt til rapportering eller backup.', en: 'Export your budget to Excel or CSV with full formatting, colors, totals, and styling. Perfect for reporting or backup.' },
                action: () => {}
            },
            {
                element: '#budget-search',
                title: { da: '🔍 Søgning', en: '🔍 Search' },
                message: { da: 'Brug søgefeltet til hurtigt at finde specifikke indtægter eller udgifter efter navn. Resultater fremhæves automatisk.', en: 'Use the search field to quickly find specific income or expenses by name. Results are highlighted automatically.' },
                action: () => {}
            }
        ],
        'lean': [
            {
                element: '#lean-section',
                title: { da: '🏭 LEAN Værktøjer', en: '🏭 LEAN Tools' },
                message: { da: 'LEAN værktøjer hjælper dig med at identificere spild, forbedre effektivitet og optimere dine operationer ved hjælp af dokumenterede produktions- og logistikprincipper.', en: 'LEAN tools help you identify waste, improve efficiency, and optimize your operations using proven manufacturing and logistics principles.' },
                action: () => {}
            },
            {
                element: '#oeeAvailability',
                title: { da: '📊 OEE Beregner', en: '📊 OEE Calculator' },
                message: { da: 'Overall Equipment Effectiveness (OEE) måler hvor effektivt udstyr bruges. Beregnes fra Tilgængelighed × Ydelse × Kvalitet. World-class niveau er 85%+.', en: 'Overall Equipment Effectiveness (OEE) measures how effectively equipment is used. Calculated from Availability × Performance × Quality. World-class level is 85%+.' },
                action: () => { toggleLEANSection('calculators'); }
            },
            {
                element: '#smedCurrent',
                title: { da: '⚡ SMED Analyse', en: '⚡ SMED Analysis' },
                message: { da: 'Single-Minute Exchange of Die - beregn tids- og omkostningsbesparelser fra reduktion af opstillings-/omstillingstider. Indtast nuværende og mål-tid for at se besparelser.', en: 'Single-Minute Exchange of Die - calculate time and cost savings from reducing setup/changeover times. Enter current and target time to see savings.' },
                action: () => { toggleLEANSection('calculators'); }
            },
            {
                element: '[data-i18n="lean-waste-title"]',
                title: { da: '♻️ 7 Spildtyper', en: '♻️ 7 Waste Types' },
                message: { da: 'Spor omkostninger forbundet med de 7 typer af Muda (spild): Overproduktion, Ventetid, Transport, Overbearbejdning, Lager, Bevægelse, og Defekter. Vælg hvilke typer af spild du oplever og indtast omkostningerne.', en: 'Track costs associated with the 7 types of Muda (waste): Overproduction, Waiting, Transport, Overprocessing, Inventory, Motion, and Defects. Select which waste types you experience and enter the costs.' },
                action: () => { 
                    const calcSection = document.getElementById('calculators-content');
                    if (calcSection && calcSection.style.display === 'none') {
                        toggleLEANSection('calculators');
                    }
                }
            },
            {
                element: '#swotStrengths',
                title: { da: '🎯 SWOT Analyse', en: '🎯 SWOT Analysis' },
                message: { da: 'Strategisk planlægningsværktøj til at identificere Styrker, Svagheder, Muligheder og Trusler. Gem og eksportér dine analyser som Markdown eller billede.', en: 'Strategic planning tool to identify Strengths, Weaknesses, Opportunities, and Threats. Save and export your analyses as Markdown or image.' },
                action: () => { toggleLEANSection('calculators'); }
            },
            {
                element: '[onclick*="toggleLEANSection(\'reference\')"]',
                title: { da: '📚 Reference Bibliotek', en: '📚 Reference Library' },
                message: { da: 'Hurtig adgang til LEAN koncepter som 5S (arbejdspladsorganisation), 7R (logistik principper), 3M (spildtyper), PDCA (forbedringscyklus), JIT, Kanban, FIFO og Kaizen.', en: 'Quick access to LEAN concepts like 5S (workplace organization), 7R (logistics principles), 3M (waste types), PDCA (improvement cycle), JIT, Kanban, FIFO, and Kaizen.' },
                action: () => {}
            },
            {
                element: '[onclick*="toggleLEANSection(\'integration\')"]',
                title: { da: '🔗 Integration', en: '🔗 Integration' },
                message: { da: 'Forbind LEAN principper med din ABC-analyse, EOQ-beregninger og lagerstyring for en holistisk tilgang til optimering.', en: 'Connect LEAN principles with your ABC analysis, EOQ calculations, and inventory management for a holistic approach to optimization.' },
                action: () => {}
            }
        ]
    };
    
    // Set tutorial steps based on current page
    tutorialSteps = pageTutorials[pageName] || pageTutorials['dashboard'];
}

// Legacy function kept for compatibility - now removed
function oldShowPageHelp(pageName) {
    const pageGuides = {
        'dashboard': {
            da: {
                title: '📊 Dashboard Hjælp',
                content: `
                    <h4 class="font-bold text-lg mb-3">Velkommen til Dashboard</h4>
                    <p class="mb-3">Dashboard er din kontrolcentral for hurtig adgang til alle vigtige funktioner og statistikker.</p>
                    
                    <h5 class="font-semibold mt-4 mb-2">🎯 Hvad kan du gøre her?</h5>
                    <ul class="list-disc ml-5 space-y-2 mb-3">
                        <li><strong>Quick Actions:</strong> Brug genveje til ofte brugte funktioner som ABC-analyse, datavisning, eksport og print</li>
                        <li><strong>Tilpas Dashboard:</strong> Klik på "Tilpas" for at vælge hvilke genveje der vises og deres rækkefølge</li>
                        <li><strong>Statistik:</strong> Se oversigt over totale varer, værdi, A-varer og seneste analyse</li>
                        <li><strong>Top 5 Varer:</strong> Hurtigt overblik over dine mest værdifulde varer</li>
                    </ul>
                    
                    <h5 class="font-semibold mt-4 mb-2">💡 Tip:</h5>
                    <p class="text-sm">Du kan trække og slippe genveje for at ændre deres rækkefølge i tilpasningstilstand.</p>
                `
            },
            en: {
                title: '📊 Dashboard Help',
                content: `
                    <h4 class="font-bold text-lg mb-3">Welcome to Dashboard</h4>
                    <p class="mb-3">The Dashboard is your control center for quick access to all important functions and statistics.</p>
                    
                    <h5 class="font-semibold mt-4 mb-2">🎯 What can you do here?</h5>
                    <ul class="list-disc ml-5 space-y-2 mb-3">
                        <li><strong>Quick Actions:</strong> Use shortcuts for frequently used functions like ABC analysis, data viewing, export, and print</li>
                        <li><strong>Customize Dashboard:</strong> Click "Customize" to choose which shortcuts are displayed and their order</li>
                        <li><strong>Statistics:</strong> View overview of total items, value, A-items, and latest analysis</li>
                        <li><strong>Top 5 Items:</strong> Quick overview of your most valuable items</li>
                    </ul>
                    
                    <h5 class="font-semibold mt-4 mb-2">💡 Tip:</h5>
                    <p class="text-sm">You can drag and drop shortcuts to change their order in customize mode.</p>
                `
            }
        },
        'abc': {
            da: {
                title: '📈 ABC-Analyse Hjælp',
                content: `
                    <h4 class="font-bold text-lg mb-3">ABC-Analyse Guide</h4>
                    <p class="mb-3">ABC-analyse klassificerer dine lagervarer baseret på deres økonomiske betydning ved hjælp af Pareto-princippet (80/20-reglen).</p>
                    
                    <h5 class="font-semibold mt-4 mb-2">📋 Sådan bruger du det:</h5>
                    <ol class="list-decimal ml-5 space-y-2 mb-3">
                        <li><strong>Upload Data:</strong> Upload en CSV eller Excel fil med kolonner: Varenavn, Forbrug, Pris</li>
                        <li><strong>Analyser:</strong> Klik "Analyser Data" for at beregne ABC-klassificering</li>
                        <li><strong>Se Resultater:</strong> Vælg mellem Pareto-diagram eller Pie Chart visualisering</li>
                        <li><strong>Eksporter:</strong> Download resultater som CSV eller Excel fil</li>
                    </ol>
                    
                    <h5 class="font-semibold mt-4 mb-2">🎯 Klassificering:</h5>
                    <ul class="list-disc ml-5 space-y-1 mb-3">
                        <li><strong>A-varer (højværdi):</strong> Typisk 20% af varer = 80% af værdi. Kræver tæt kontrol</li>
                        <li><strong>B-varer (mellemværdi):</strong> Moderat betydning og kontrol</li>
                        <li><strong>C-varer (lavværdi):</strong> Høj mængde men lav værdi. Periodisk kontrol</li>
                    </ul>
                    
                    <h5 class="font-semibold mt-4 mb-2">⚙️ Avanceret:</h5>
                    <p class="text-sm mb-2">Gå til Indstillinger for at justere ABC-tærskelværdier (Standard: 80/15/5).</p>
                `
            },
            en: {
                title: '📈 ABC Analysis Help',
                content: `
                    <h4 class="font-bold text-lg mb-3">ABC Analysis Guide</h4>
                    <p class="mb-3">ABC analysis classifies your inventory items based on their economic importance using the Pareto principle (80/20 rule).</p>
                    
                    <h5 class="font-semibold mt-4 mb-2">📋 How to use it:</h5>
                    <ol class="list-decimal ml-5 space-y-2 mb-3">
                        <li><strong>Upload Data:</strong> Upload a CSV or Excel file with columns: Item Name, Consumption, Price</li>
                        <li><strong>Analyze:</strong> Click "Analyze Data" to calculate ABC classification</li>
                        <li><strong>View Results:</strong> Choose between Pareto chart or Pie Chart visualization</li>
                        <li><strong>Export:</strong> Download results as CSV or Excel file</li>
                    </ol>
                    
                    <h5 class="font-semibold mt-4 mb-2">🎯 Classification:</h5>
                    <ul class="list-disc ml-5 space-y-1 mb-3">
                        <li><strong>A-items (high value):</strong> Typically 20% of items = 80% of value. Require close monitoring</li>
                        <li><strong>B-items (medium value):</strong> Moderate importance and control</li>
                        <li><strong>C-items (low value):</strong> High quantity but low value. Periodic review</li>
                    </ul>
                    
                    <h5 class="font-semibold mt-4 mb-2">⚙️ Advanced:</h5>
                    <p class="text-sm mb-2">Go to Settings to adjust ABC threshold values (Default: 80/15/5).</p>
                `
            }
        },
        'wilson': {
            da: {
                title: '🧮 Wilson EOQ Hjælp',
                content: `
                    <h4 class="font-bold text-lg mb-3">Economic Order Quantity (EOQ) Guide</h4>
                    <p class="mb-3">Wilson-formlen beregner den optimale ordremængde der minimerer dine samlede lageromkostninger.</p>
                    
                    <h5 class="font-semibold mt-4 mb-2">📊 Formlen: EOQ = √(2DS/H)</h5>
                    <ul class="list-disc ml-5 space-y-2 mb-3">
                        <li><strong>D (Demand):</strong> Årligt forbrug i enheder</li>
                        <li><strong>S (Setup cost):</strong> Ordreomkostning per ordre</li>
                        <li><strong>H (Holding cost):</strong> Lageromkostning per enhed per år</li>
                    </ul>
                    
                    <h5 class="font-semibold mt-4 mb-2">📋 Sådan bruger du det:</h5>
                    <ol class="list-decimal ml-5 space-y-2 mb-3">
                        <li>Indtast årligt forbrug (hvor mange enheder bruges per år)</li>
                        <li>Indtast ordreomkostning (hvad koster det at lave en ordre)</li>
                        <li>Indtast lageromkostning (hvad koster det at have en enhed på lager i et år)</li>
                        <li>Klik "Beregn EOQ" for at se optimal ordremængde</li>
                    </ol>
                    
                    <h5 class="font-semibold mt-4 mb-2">📈 Resultater:</h5>
                    <p class="text-sm mb-2">Du får optimal ordremængde (Q*), antal ordrer per år, lageromkostning, ordreomkostning og totalomkostning. Grafen viser hvor EOQ balancerer mellem de to omkostningstyper.</p>
                    
                    <h5 class="font-semibold mt-4 mb-2">💡 Tip:</h5>
                    <p class="text-sm">Brug EOQ-resultatet sammen med ABC-analyse for at prioritere dine A-varer.</p>
                `
            },
            en: {
                title: '🧮 Wilson EOQ Help',
                content: `
                    <h4 class="font-bold text-lg mb-3">Economic Order Quantity (EOQ) Guide</h4>
                    <p class="mb-3">The Wilson formula calculates the optimal order quantity that minimizes your total inventory costs.</p>
                    
                    <h5 class="font-semibold mt-4 mb-2">📊 Formula: EOQ = √(2DS/H)</h5>
                    <ul class="list-disc ml-5 space-y-2 mb-3">
                        <li><strong>D (Demand):</strong> Annual consumption in units</li>
                        <li><strong>S (Setup cost):</strong> Order cost per order</li>
                        <li><strong>H (Holding cost):</strong> Holding cost per unit per year</li>
                    </ul>
                    
                    <h5 class="font-semibold mt-4 mb-2">📋 How to use it:</h5>
                    <ol class="list-decimal ml-5 space-y-2 mb-3">
                        <li>Enter annual demand (how many units are used per year)</li>
                        <li>Enter order cost (what it costs to place one order)</li>
                        <li>Enter holding cost (what it costs to store one unit for a year)</li>
                        <li>Click "Calculate EOQ" to see optimal order quantity</li>
                    </ol>
                    
                    <h5 class="font-semibold mt-4 mb-2">📈 Results:</h5>
                    <p class="text-sm mb-2">You'll get optimal order quantity (Q*), orders per year, holding cost, order cost, and total cost. The chart shows where EOQ balances between the two cost types.</p>
                    
                    <h5 class="font-semibold mt-4 mb-2">💡 Tip:</h5>
                    <p class="text-sm">Use EOQ results together with ABC analysis to prioritize your A-items.</p>
                `
            }
        },
        'inventory': {
            da: {
                title: '📦 Lagerstyring Hjælp',
                content: `
                    <h4 class="font-bold text-lg mb-3">Lagerstyring & ROP Guide</h4>
                    <p class="mb-3">Beregn genbestillingspunkt (ROP), sikkerhedslager og optimale lagerniveauer for dine varer.</p>
                    
                    <h5 class="font-semibold mt-4 mb-2">📋 Funktioner:</h5>
                    <ul class="list-disc ml-5 space-y-2 mb-3">
                        <li><strong>ROP Beregner:</strong> Find ud af hvornår du skal genbestille baseret på leveringstid og forbrug</li>
                        <li><strong>Sikkerhedslager:</strong> Beregn buffer mod usikkerhed i efterspørgsel</li>
                        <li><strong>ABC Double:</strong> Klassificer varer på både værdi og forbrugshastighed</li>
                        <li><strong>Lagerniveau:</strong> Få overblik over optimal lagerbeholdning</li>
                    </ul>
                    
                    <h5 class="font-semibold mt-4 mb-2">🎯 ROP Formel:</h5>
                    <p class="mb-2 text-sm">ROP = (Dagligt forbrug × Leveringstid) + Sikkerhedslager</p>
                    
                    <h5 class="font-semibold mt-4 mb-2">📊 Serviceniveau:</h5>
                    <p class="text-sm mb-2">Vælg dit ønskede serviceniveau (90-99.5%) i Indstillinger. Højere serviceniveau = større sikkerhedslager = færre stockouts.</p>
                    
                    <h5 class="font-semibold mt-4 mb-2">💡 Tip:</h5>
                    <p class="text-sm">Kombiner ROP med EOQ for komplet lagerstyring: EOQ fortæller hvor meget, ROP fortæller hvornår.</p>
                `
            },
            en: {
                title: '📦 Inventory Management Help',
                content: `
                    <h4 class="font-bold text-lg mb-3">Inventory Management & ROP Guide</h4>
                    <p class="mb-3">Calculate reorder point (ROP), safety stock, and optimal inventory levels for your items.</p>
                    
                    <h5 class="font-semibold mt-4 mb-2">📋 Features:</h5>
                    <ul class="list-disc ml-5 space-y-2 mb-3">
                        <li><strong>ROP Calculator:</strong> Find out when to reorder based on lead time and consumption</li>
                        <li><strong>Safety Stock:</strong> Calculate buffer against demand uncertainty</li>
                        <li><strong>ABC Double:</strong> Classify items by both value and consumption rate</li>
                        <li><strong>Stock Level:</strong> Get overview of optimal inventory holdings</li>
                    </ul>
                    
                    <h5 class="font-semibold mt-4 mb-2">🎯 ROP Formula:</h5>
                    <p class="mb-2 text-sm">ROP = (Daily consumption × Lead time) + Safety stock</p>
                    
                    <h5 class="font-semibold mt-4 mb-2">📊 Service Level:</h5>
                    <p class="text-sm mb-2">Choose your desired service level (90-99.5%) in Settings. Higher service level = larger safety stock = fewer stockouts.</p>
                    
                    <h5 class="font-semibold mt-4 mb-2">💡 Tip:</h5>
                    <p class="text-sm">Combine ROP with EOQ for complete inventory management: EOQ tells you how much, ROP tells you when.</p>
                `
            }
        },
        'learn': {
            da: {
                title: '📚 Lær Hjælp',
                content: `
                    <h4 class="font-bold text-lg mb-3">Læringsressourcer</h4>
                    <p class="mb-3">Lær om ABC-analyse, EOQ og lagerstyring gennem teori, eksempler og øvelsesdata.</p>
                    
                    <h5 class="font-semibold mt-4 mb-2">📖 Indhold:</h5>
                    <ul class="list-disc ml-5 space-y-2 mb-3">
                        <li><strong>Teori & Koncepter:</strong> Forklaring af ABC-analyse, Wilson EOQ-formel og ROP</li>
                        <li><strong>Prøvedata:</strong> Klik for at indlæse eksempel-datasæt (Detailbutik, Lager, Produktion)</li>
                        <li><strong>Trinvise Guider:</strong> Følg vejledning gennem upload, analyse og visualisering</li>
                        <li><strong>Praktiske Eksempler:</strong> Se hvordan teorien anvendes i virkelige scenarier</li>
                    </ul>
                    
                    <h5 class="font-semibold mt-4 mb-2">🎓 Uddannelsestilstand:</h5>
                    <p class="text-sm mb-3">Aktiver i Indstillinger for fuld adgang til alle læringsressourcer og øvelsesdatasæt.</p>
                    
                    <h5 class="font-semibold mt-4 mb-2">💡 Tip:</h5>
                    <p class="text-sm">Start med et lille datasæt (Detailbutik - 15 varer) for at lære grundlæggende før du går videre til større.</p>
                `
            },
            en: {
                title: '📚 Learn Help',
                content: `
                    <h4 class="font-bold text-lg mb-3">Learning Resources</h4>
                    <p class="mb-3">Learn about ABC analysis, EOQ, and inventory management through theory, examples, and practice data.</p>
                    
                    <h5 class="font-semibold mt-4 mb-2">📖 Content:</h5>
                    <ul class="list-disc ml-5 space-y-2 mb-3">
                        <li><strong>Theory & Concepts:</strong> Explanation of ABC analysis, Wilson EOQ formula, and ROP</li>
                        <li><strong>Sample Data:</strong> Click to load example datasets (Retail Store, Warehouse, Manufacturing)</li>
                        <li><strong>Step-by-step Guides:</strong> Follow instructions through upload, analysis, and visualization</li>
                        <li><strong>Practical Examples:</strong> See how theory applies in real-world scenarios</li>
                    </ul>
                    
                    <h5 class="font-semibold mt-4 mb-2">🎓 Education Mode:</h5>
                    <p class="text-sm mb-3">Enable in Settings for full access to all learning resources and practice datasets.</p>
                    
                    <h5 class="font-semibold mt-4 mb-2">💡 Tip:</h5>
                    <p class="text-sm">Start with a small dataset (Retail Store - 15 items) to learn basics before moving to larger ones.</p>
                `
            }
        },
        'settings': {
            da: {
                title: '⚙️ Indstillinger Hjælp',
                content: `
                    <h4 class="font-bold text-lg mb-3">Indstillinger Guide</h4>
                    <p class="mb-3">Tilpas applikationen til dine behov med forskellige indstillinger og præferencer.</p>
                    
                    <h5 class="font-semibold mt-4 mb-2">🎨 Tilgængelige Indstillinger:</h5>
                    <ul class="list-disc ml-5 space-y-2 mb-3">
                        <li><strong>Brugerdefinerede Sider:</strong> Opret dine egne beregningssider med formler og input</li>
                        <li><strong>Standard Graftype:</strong> Vælg Pareto eller Pie Chart som standard</li>
                        <li><strong>Serviceniveau:</strong> Juster standardværdi for ROP-beregninger (90-99.5%)</li>
                        <li><strong>Auto-gem:</strong> Gem automatisk analyseresultater mellem sessioner</li>
                        <li><strong>Datakryptering:</strong> Beskyt dine data med adgangskode</li>
                        <li><strong>Uddannelsestilstand:</strong> Aktiver ekstra læringsressourcer</li>
                        <li><strong>Sprog:</strong> Skift mellem Dansk og English</li>
                        <li><strong>Tilpas Dashboard:</strong> Vælg hvilke genveje der vises</li>
                        <li><strong>ABC-tærskler:</strong> Justér klassificeringsgrænser</li>
                    </ul>
                    
                    <h5 class="font-semibold mt-4 mb-2">💡 Tip:</h5>
                    <p class="text-sm">Alle indstillinger gemmes lokalt i din browser, så de huskes næste gang du besøger.</p>
                `
            },
            en: {
                title: '⚙️ Settings Help',
                content: `
                    <h4 class="font-bold text-lg mb-3">Settings Guide</h4>
                    <p class="mb-3">Customize the application to your needs with various settings and preferences.</p>
                    
                    <h5 class="font-semibold mt-4 mb-2">🎨 Available Settings:</h5>
                    <ul class="list-disc ml-5 space-y-2 mb-3">
                        <li><strong>Custom Pages:</strong> Create your own calculation pages with formulas and inputs</li>
                        <li><strong>Default Chart Type:</strong> Choose Pareto or Pie Chart as default</li>
                        <li><strong>Service Level:</strong> Adjust default value for ROP calculations (90-99.5%)</li>
                        <li><strong>Auto-save:</strong> Automatically save analysis results between sessions</li>
                        <li><strong>Data Encryption:</strong> Protect your data with password</li>
                        <li><strong>Education Mode:</strong> Enable additional learning resources</li>
                        <li><strong>Language:</strong> Switch between Danish and English</li>
                        <li><strong>Customize Dashboard:</strong> Choose which shortcuts are displayed</li>
                        <li><strong>ABC Thresholds:</strong> Adjust classification boundaries</li>
                    </ul>
                    
                    <h5 class="font-semibold mt-4 mb-2">💡 Tip:</h5>
                    <p class="text-sm">All settings are saved locally in your browser, so they're remembered next time you visit.</p>
                `
            }
        }
    };
    
    const guide = pageGuides[pageName] || pageGuides['dashboard'];
    const content = guide[currentLanguage] || guide['en'];
    
    // Create help modal
    const helpModal = document.createElement('div');
    helpModal.id = 'pageHelpModal';
    helpModal.className = 'fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4';
    helpModal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            <div class="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-xl z-10">
                <div class="flex justify-between items-center">
                    <h3 class="text-2xl font-bold">${content.title}</h3>
                    <button onclick="closePageHelp()" class="text-white hover:text-gray-200 text-3xl font-bold leading-none">
                        ×
                    </button>
                </div>
            </div>
            <div class="p-6 text-gray-700 dark:text-gray-300">
                ${content.content}
            </div>
            <div class="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 rounded-b-xl">
                <button onclick="closePageHelp()" class="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
                    ${currentLanguage === 'da' ? 'Luk' : 'Close'}
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(helpModal);
    
    // Close on outside click
    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) closePageHelp();
    });
}

function closePageHelp() {
    const modal = document.getElementById('pageHelpModal');
    if (modal) modal.remove();
}

function showTutorialStep() {
    if (tutorialStep >= tutorialSteps.length) {
        endTutorial();
        return;
    }
    
    const step = tutorialSteps[tutorialStep];
    const element = document.querySelector(step.element);
    
    if (!element) {
        tutorialStep++;
        showTutorialStep();
        return;
    }
    
    // Remove previous highlights
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight', 'ring-4', 'ring-blue-500');
    });
    
    // Execute step action
    step.action();
    
    // Create tutorial overlay
    let overlay = document.getElementById('tutorialOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'tutorialOverlay';
        document.body.appendChild(overlay);
    }
    
    // Position and show tutorial box
    const rect = element.getBoundingClientRect();
    const title = step.title[currentLanguage];
    const message = step.message[currentLanguage];
    
    // Calculate optimal position for tutorial box
    const boxWidth = 400;
    const boxHeight = 250;
    const padding = 20;
    
    let top, left;
    
    // Check if element is in viewport
    const elementInView = rect.top >= 0 && rect.bottom <= window.innerHeight;
    
    if (!elementInView) {
        // Element is off-screen, center the box
        top = Math.max(padding, (window.innerHeight - boxHeight) / 2);
        left = Math.max(padding, (window.innerWidth - boxWidth) / 2);
    } else {
        // Element is visible, try to position near it
        // Try below first
        top = rect.bottom + padding;
        left = rect.left;
        
        // If box would go off bottom, try above
        if (top + boxHeight > window.innerHeight - padding) {
            top = rect.top - boxHeight - padding;
        }
        
        // If still off screen, center vertically
        if (top < padding || top + boxHeight > window.innerHeight - padding) {
            top = Math.max(padding, (window.innerHeight - boxHeight) / 2);
        }
        
        // Keep horizontally within viewport
        left = Math.max(padding, Math.min(left, window.innerWidth - boxWidth - padding));
    }
    
    overlay.innerHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-60 z-40" onclick="endTutorial()"></div>
        <div class="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-md" 
             style="top: ${top}px; left: ${left}px;">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">${title}</h3>
            <p class="text-gray-700 dark:text-gray-300 mb-4">${message}</p>
            <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500">${tutorialStep + 1} / ${tutorialSteps.length}</span>
                <div class="space-x-2">
                    <button onclick="endTutorial()" class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors">
                        ${currentLanguage === 'da' ? 'Spring over' : 'Skip'}
                    </button>
                    <button onclick="nextTutorialStep()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                        ${tutorialStep === tutorialSteps.length - 1 ? (currentLanguage === 'da' ? 'Afslut' : 'Finish') : (currentLanguage === 'da' ? 'Næste' : 'Next')}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    overlay.classList.remove('hidden');
    element.classList.add('tutorial-highlight');
    
    // Scroll element into view
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function nextTutorialStep() {
    tutorialStep++;
    showTutorialStep();
}

function endTutorial() {
    const overlay = document.getElementById('tutorialOverlay');
    if (overlay) {
        overlay.remove();
    }
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight', 'ring-4', 'ring-blue-500');
    });
}

// Toggle Learn section collapsibles
function toggleLearnSection(sectionId) {
    const content = document.getElementById(sectionId + '-content');
    const toggle = document.getElementById(sectionId + '-toggle');
    
    if (content && toggle) {
        const isHidden = content.classList.contains('hidden');
        content.classList.toggle('hidden');
        toggle.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
    }
}

function loadSampleData() {
    // Load sample data for tutorial
    uploadedData = [
        { name: 'Item A-1', consumption: 5000, price: 50 },
        { name: 'Item A-2', consumption: 4500, price: 45 },
        { name: 'Item B-1', consumption: 2000, price: 30 },
        { name: 'Item B-2', consumption: 1800, price: 25 },
        { name: 'Item C-1', consumption: 500, price: 10 },
        { name: 'Item C-2', consumption: 300, price: 8 },
        { name: 'Item C-3', consumption: 200, price: 5 }
    ];
    
    displayPreview();
    const fileInfoDiv = document.getElementById('fileInfo');
    const fileNameSpan = document.getElementById('fileName');
    const fileRowsSpan = document.getElementById('fileRows');
    
    if (fileInfoDiv && fileNameSpan && fileRowsSpan) {
        fileNameSpan.textContent = 'sample_data.csv (Tutorial)';
        fileRowsSpan.textContent = uploadedData.length;
        fileInfoDiv.classList.remove('hidden');
    }
    
    showToast(currentLanguage === 'da' ? '📚 Eksempeldata indlæst!' : '📚 Sample data loaded!', 'success');
}

function loadSettings() {
    // Update UI based on saved settings
    updateThemeButtons();
    updateLanguageButtons();
}

// ========================================
// Event Listeners
// ========================================

function setupEventListeners() {
    // Tab Navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(btn.dataset.tab, btn);
        });
    });
    
    // Theme Toggle (Header)
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    
    // Theme Buttons (Settings)
    const lightThemeBtn = document.getElementById('lightThemeBtn');
    const darkThemeBtn = document.getElementById('darkThemeBtn');
    if (lightThemeBtn) lightThemeBtn.addEventListener('click', () => setTheme('light'));
    if (darkThemeBtn) darkThemeBtn.addEventListener('click', () => setTheme('dark'));
    
    // Language Buttons
    const daBtn = document.getElementById('daBtn');
    const enBtn = document.getElementById('enBtn');
    if (daBtn) daBtn.addEventListener('click', () => setLanguage('da'));
    if (enBtn) enBtn.addEventListener('click', () => setLanguage('en'));
    
    // File Upload
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.addEventListener('change', handleFileUpload);
    
    // Process Button
    const processBtn = document.getElementById('processBtn');
    if (processBtn) processBtn.addEventListener('click', processABCAnalysis);
    
    // View Data Button
    const viewDataBtn = document.getElementById('viewDataBtn');
    if (viewDataBtn) viewDataBtn.addEventListener('click', viewUploadedData);
    
    // Download Buttons
    const downloadCsvBtn = document.getElementById('downloadCsvBtn');
    const downloadExcelBtn = document.getElementById('downloadExcelBtn');
    if (downloadCsvBtn) downloadCsvBtn.addEventListener('click', downloadResultsCSV);
    if (downloadExcelBtn) downloadExcelBtn.addEventListener('click', downloadResultsExcel);
    
    // Batch Wilson
    const batchWilsonBtn = document.getElementById('batchWilsonBtn');
    const runBatchWilsonBtn = document.getElementById('runBatchWilsonBtn');
    if (batchWilsonBtn) batchWilsonBtn.addEventListener('click', showBatchWilsonPanel);
    if (runBatchWilsonBtn) runBatchWilsonBtn.addEventListener('click', runBatchWilsonCalculation);
    
    // Chart Type Selection
    const chartTypeSelect = document.getElementById('chartTypeSelect');
    if (chartTypeSelect) {
        chartTypeSelect.addEventListener('change', (e) => {
            if (abcResults.length > 0) {
                renderABCChart(e.target.value);
            }
        });
    }
    
    // Default Chart Type Selection
    const defaultChartSelect = document.getElementById('defaultChartSelect');
    if (defaultChartSelect) {
        defaultChartSelect.addEventListener('change', (e) => {
            localStorage.setItem('defaultChartType', e.target.value);
            const chartType = document.getElementById('chartTypeSelect');
            if (chartType) chartType.value = e.target.value;
        });
    }
    
    // Wilson Calculation
    const calculateBtn = document.getElementById('calculateBtn');
    if (calculateBtn) calculateBtn.addEventListener('click', calculateWilson);
    
    const addScenarioBtn = document.getElementById('addScenarioBtn');
    if (addScenarioBtn) addScenarioBtn.addEventListener('click', addWilsonScenario);
    
    const clearScenariosBtn = document.getElementById('clearScenariosBtn');
    if (clearScenariosBtn) clearScenariosBtn.addEventListener('click', clearWilsonScenarios);
}

// ========================================
// Navigation
// ========================================

function switchTab(tabName, clickedButton) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // If clickedButton is provided, activate it; otherwise find by data-tab
    if (clickedButton && clickedButton.classList) {
        clickedButton.classList.add('active');
    } else {
        const targetBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
        if (targetBtn && targetBtn.classList) targetBtn.classList.add('active');
    }
    
    // Update tab content - remove both active and hidden, then add back appropriately
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        content.classList.add('hidden');
    });
    
    const targetSection = document.getElementById(`${tabName}-section`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.classList.add('active');
    } else {
        const notFound = document.getElementById('not-found-section');
        if (notFound) {
            notFound.classList.remove('hidden');
            notFound.classList.add('active');
        }
    }

    // Tab-specific initialization
    if (tabName === 'barcode') {
        setTimeout(() => {
            if (typeof initBarcodeTab === 'function') initBarcodeTab();
        }, 50);
    }
    if (tabName === 'warehouse') {
        setTimeout(() => {
            if (typeof WarehouseLayout !== 'undefined') WarehouseLayout.init();
        }, 50);
    }
    if (tabName === 'dashboard') {
        setTimeout(() => {
            if (typeof KPIDashboard !== 'undefined') KPIDashboard.refresh();
        }, 100);
    }
}

// ========================================
// Theme Management
// ========================================

function toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

// ========================================
// Quick Actions System
// ========================================

function renderQuickActions() {
    const grid = document.getElementById('quickActionsGrid');
    if (!grid) return;
    
    // Load configuration from localStorage or use defaults
    let config = localStorage.getItem('quickActionsConfig');
    let actions = config ? JSON.parse(config) : defaultQuickActions;
    
    // Clear grid
    grid.innerHTML = '';
    
    // Render enabled actions
    actions.filter(action => action.enabled).forEach(action => {
        const button = document.createElement('button');
        button.onclick = () => eval(action.action);
        button.className = `group p-5 bg-gradient-to-br from-${action.color}-50 to-${action.color}-100 dark:from-${action.color}-900/20 dark:to-${action.color}-800/30 hover:from-${action.color}-100 hover:to-${action.color}-200 dark:hover:from-${action.color}-900/30 dark:hover:to-${action.color}-800/40 rounded-xl transition-all duration-300 text-left border border-${action.color}-200 dark:border-${action.color}-800 shadow-sm hover:shadow-md transform hover:-translate-y-1`;
        
        button.innerHTML = `
            <div class="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">${action.icon}</div>
            <h3 class="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1" data-i18n="${action.title}">${translations[currentLanguage][action.title] || action.title}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400" data-i18n="${action.desc}">${translations[currentLanguage][action.desc] || action.desc}</p>
        `;
        
        grid.appendChild(button);
    });
}

function toggleQuickActionsCustomizer() {
    const customizer = document.getElementById('quickActionsCustomizer');
    if (!customizer) {
        console.error('quickActionsCustomizer element not found');
        return;
    }
    
    const isHidden = customizer.classList.contains('hidden');
    customizer.classList.toggle('hidden');
    
    if (isHidden) {
        // Show customizer - populate checkboxes with enhanced UI
        populateQuickActionsCheckboxes();
        
        // Scroll to customizer
        customizer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function populateQuickActionsCheckboxes() {
    const checkboxArea = document.getElementById('quickActionsCheckboxes');
    if (!checkboxArea) return;
    
    checkboxArea.innerHTML = '';
    
    let config = localStorage.getItem('quickActionsConfig');
    let actions = config ? JSON.parse(config) : [...defaultQuickActions];
    
    // Update counts
    const visibleCount = actions.filter(a => a.enabled).length;
    const totalCount = actions.length;
    const visibleCountEl = document.getElementById('visibleActionsCount');
    const totalCountEl = document.getElementById('totalActionsCount');
    if (visibleCountEl) visibleCountEl.textContent = visibleCount;
    if (totalCountEl) totalCountEl.textContent = totalCount;
    
    actions.forEach((action, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'flex items-center space-x-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 transition-all cursor-move';
        wrapper.setAttribute('data-action-id', action.id);
        wrapper.setAttribute('draggable', 'true');
        
        const customButtons = action.custom ? `
            <button onclick="editCustomShortcut('${action.id}')" 
                class="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs transition-colors"
                title="${currentLanguage === 'da' ? 'Rediger genvej' : 'Edit shortcut'}">
                ✏️
            </button>
            <button onclick="deleteCustomShortcut('${action.id}')" 
                class="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs transition-colors"
                title="${currentLanguage === 'da' ? 'Slet genvej' : 'Delete shortcut'}">
                🗑️
            </button>
        ` : '';
        
        wrapper.innerHTML = `
            <span class="text-gray-400 cursor-move">⋮⋮</span>
            <input type="checkbox" ${action.enabled ? 'checked' : ''} 
                onchange="updateQuickActionState('${action.id}', this.checked)"
                class="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer">
            <span class="text-2xl">${action.icon}</span>
            <div class="flex-1">
                <div class="flex items-center gap-2">
                    <span class="font-medium text-gray-900 dark:text-gray-100">${action.custom ? action.title : (translations[currentLanguage][action.title] || action.title)}</span>
                    ${action.custom ? '<span class="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded">Brugerdefineret</span>' : ''}
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400">${action.custom ? action.desc : (translations[currentLanguage][action.desc] || action.desc)}</p>
            </div>
            <span class="text-xs px-2 py-1 rounded ${action.enabled ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}">
                ${action.enabled ? (currentLanguage === 'da' ? 'Synlig' : 'Visible') : (currentLanguage === 'da' ? 'Skjult' : 'Hidden')}
            </span>
            <div class="flex gap-1">
                ${customButtons}
            </div>
        `;
        
        // Add drag and drop handlers
        wrapper.addEventListener('dragstart', handleDragStart);
        wrapper.addEventListener('dragover', handleDragOver);
        wrapper.addEventListener('dragleave', handleDragLeave);
        wrapper.addEventListener('drop', handleDrop);
        wrapper.addEventListener('dragend', handleDragEnd);
        
        checkboxArea.appendChild(wrapper);
    });
}

let draggedElement = null;

function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    
    e.dataTransfer.dropEffect = 'move';
    
    // Add visual feedback
    if (this !== draggedElement) {
        this.classList.add('drag-over');
    }
    
    return false;
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    // Remove drag-over styling from all elements
    document.querySelectorAll('.drag-over').forEach(el => {
        el.classList.remove('drag-over');
    });
    
    if (draggedElement !== this) {
        const checkboxArea = document.getElementById('quickActionsCheckboxes');
        const allItems = [...checkboxArea.children];
        const draggedIndex = allItems.indexOf(draggedElement);
        const targetIndex = allItems.indexOf(this);
        
        if (draggedIndex < targetIndex) {
            this.parentNode.insertBefore(draggedElement, this.nextSibling);
        } else {
            this.parentNode.insertBefore(draggedElement, this);
        }
        
        // Update order in config and re-render
        updateQuickActionsOrder();
        renderQuickActions();
        showToast(currentLanguage === 'da' ? '📌 Rækkefølge opdateret' : '📌 Order updated', 'info');
    }
    
    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    
    // Clean up any remaining drag-over styling
    document.querySelectorAll('.drag-over').forEach(el => {
        el.classList.remove('drag-over');
    });
}

function updateQuickActionsOrder() {
    const checkboxArea = document.getElementById('quickActionsCheckboxes');
    const items = [...checkboxArea.children];
    
    let config = localStorage.getItem('quickActionsConfig');
    let actions = config ? JSON.parse(config) : [...defaultQuickActions];
    
    const newOrder = items.map(item => {
        const actionId = item.getAttribute('data-action-id');
        return actions.find(a => a.id === actionId);
    }).filter(a => a);
    
    localStorage.setItem('quickActionsConfig', JSON.stringify(newOrder));
}

function updateQuickActionState(actionId, enabled) {
    let config = localStorage.getItem('quickActionsConfig');
    let actions = config ? JSON.parse(config) : [...defaultQuickActions];
    
    const action = actions.find(a => a.id === actionId);
    if (action) {
        action.enabled = enabled;
        localStorage.setItem('quickActionsConfig', JSON.stringify(actions));
        
        // Update the status badge
        const wrapper = document.querySelector(`[data-action-id="${actionId}"]`);
        if (wrapper) {
            const badge = wrapper.querySelector('span:last-child');
            if (badge) {
                badge.className = `text-xs px-2 py-1 rounded ${enabled ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`;
                badge.textContent = enabled ? (currentLanguage === 'da' ? 'Synlig' : 'Visible') : (currentLanguage === 'da' ? 'Skjult' : 'Hidden');
            }
        }
        
        // Live preview - update dashboard immediately
        renderQuickActions();
    }
}

function selectAllQuickActions(enable) {
    let config = localStorage.getItem('quickActionsConfig');
    let actions = config ? JSON.parse(config) : [...defaultQuickActions];
    
    actions.forEach(action => {
        action.enabled = enable;
    });
    
    localStorage.setItem('quickActionsConfig', JSON.stringify(actions));
    populateQuickActionsCheckboxes();
    showToast(enable ? (currentLanguage === 'da' ? 'Alle Quick Actions vist' : 'All Quick Actions shown') : (currentLanguage === 'da' ? 'Alle Quick Actions skjult' : 'All Quick Actions hidden'), 'info');
}

function saveQuickActionsConfig() {
    renderQuickActions();
    toggleQuickActionsCustomizer();
    showToast(currentLanguage === 'da' ? '💾 Quick Actions gemt og opdateret!' : '💾 Quick Actions saved and updated!', 'success');
}

function resetQuickActions() {
    if (confirm(translate('confirm-reset-settings') || (currentLanguage === 'da' ? 'Er du sikker på at du vil nulstille til standardindstillinger?' : 'Are you sure you want to reset to default settings?'))) {
        localStorage.removeItem('quickActionsConfig');
        populateQuickActionsCheckboxes();
        renderQuickActions();
        showToast(currentLanguage === 'da' ? '🔄 Quick Actions nulstillet til standard' : '🔄 Quick Actions reset to default', 'success');
    }
}

// ========================================
// Custom Shortcuts Management
// ========================================

function toggleCustomShortcutForm(skipReset = false) {
    const form = document.getElementById('customShortcutForm');
    const btn = document.getElementById('addShortcutBtn');
    const emojiPicker = document.getElementById('emojiPicker');
    
    if (form && btn) {
        const isHidden = form.classList.contains('hidden');
        form.classList.toggle('hidden');
        
        if (isHidden && !skipReset) {
            // Opening form - reset fields only if not editing
            document.getElementById('shortcutIcon').value = '📌';
            document.getElementById('shortcutTitle').value = '';
            document.getElementById('shortcutDesc').value = '';
            document.getElementById('shortcutActionType').value = 'tab';
            document.getElementById('shortcutColor').value = 'blue';
            updateShortcutActionFields();
            
            // Reset form state
            form.removeAttribute('data-editing-id');
            document.getElementById('customShortcutFormTitle').textContent = currentLanguage === 'da' ? 'Tilføj Brugerdefineret Genvej' : 'Add Custom Shortcut';
            document.getElementById('saveShortcutBtn').innerHTML = currentLanguage === 'da' ? '💾 Gem Genvej' : '💾 Save Shortcut';
        }
        
        if (isHidden) {
            // Update button text when opening
            btn.innerHTML = '<span>✖</span><span>' + (currentLanguage === 'da' ? 'Luk Formular' : 'Close Form') + '</span>';
            btn.className = 'w-full px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all flex items-center justify-center gap-2 font-semibold';
        } else {
            // Closing form - cleanup
            form.removeAttribute('data-editing-id');
            document.getElementById('customShortcutFormTitle').textContent = currentLanguage === 'da' ? 'Tilføj Brugerdefineret Genvej' : 'Add Custom Shortcut';
            document.getElementById('saveShortcutBtn').innerHTML = currentLanguage === 'da' ? '💾 Gem Genvej' : '💾 Save Shortcut';
            
            // Close emoji picker if open
            if (emojiPicker && !emojiPicker.classList.contains('hidden')) {
                emojiPicker.classList.add('hidden');
            }
            
            btn.innerHTML = '<span>➕</span><span data-i18n="add-custom-shortcut">' + (currentLanguage === 'da' ? 'Opret Brugerdefineret Genvej' : 'Create Custom Shortcut') + '</span>';
            btn.className = 'w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all flex items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg';
        }
    }
}

// Toggle emoji picker visibility
function toggleEmojiPicker() {
    const picker = document.getElementById('emojiPicker');
    if (picker) {
        picker.classList.toggle('hidden');
    }
}

// Set icon from emoji picker and close menu
function setShortcutIcon(icon) {
    const iconInput = document.getElementById('shortcutIcon');
    if (iconInput) {
        iconInput.value = icon;
    }
    // Close emoji picker after selection
    const picker = document.getElementById('emojiPicker');
    if (picker && !picker.classList.contains('hidden')) {
        picker.classList.add('hidden');
    }
}

function updateShortcutActionFields() {
    const actionType = document.getElementById('shortcutActionType').value;
    const fieldsContainer = document.getElementById('shortcutActionFields');
    
    if (!fieldsContainer) return;
    
    let html = '';
    
    switch(actionType) {
        case 'tab':
            html = `
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" data-i18n="shortcut-tab-label">Fane</label>
                <select id="shortcutTabName" class="input-field w-full">
                    <option value="dashboard">Dashboard</option>
                    <option value="abc">ABC Analyse</option>
                    <option value="abc-double">ABC Dobbelt</option>
                    <option value="wilson">Wilson (EOQ)</option>
                    <option value="batch-wilson">Batch Wilson</option>
                    <option value="compare" data-i18n="compare-tab">Sammenlign</option>
                    <option value="learn" data-i18n="learn-tab">Lær</option>
                    <option value="settings" data-i18n="settings-tab">Indstillinger</option>
                </select>
            `;
            break;
        case 'function':
            html = `
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" data-i18n="shortcut-function-label">Funktion</label>
                <select id="shortcutFunctionName" class="input-field w-full">
                    <option value="viewUploadedData()" data-i18n="function-view-data">Vis Data</option>
                    <option value="downloadResultsCSV()" data-i18n="function-export-csv">Eksporter CSV</option>
                    <option value="exportToExcel()" data-i18n="function-export-excel">Eksporter Excel</option>
                    <option value="openPrintMenu()" data-i18n="function-print">Udskriv</option>
                    <option value="resetApp()" data-i18n="function-reset">Nulstil App</option>
                    <option value="performDoubleABCAnalysis()" data-i18n="function-abc-double">Kør ABC Dobbelt</option>
                    <option value="startTutorial()" data-i18n="function-tutorial">Start Tutorial</option>
                </select>
            `;
            break;
        case 'url':
            html = `
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" data-i18n="shortcut-url-label">URL</label>
                <input type="url" id="shortcutUrl" placeholder="${currentLanguage === 'da' ? 'https://example.com eller www.example.com' : 'https://example.com or www.example.com'}" class="input-field w-full mb-2">
                <label class="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                    <input type="checkbox" id="shortcutUrlNewWindow" checked class="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500">
                    <span data-i18n="shortcut-url-new-window">Åbn i nyt vindue</span>
                </label>
            `;
            break;
        case 'sample':
            html = `
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" data-i18n="shortcut-sample-label">Eksempel Datasæt</label>
                <select id="shortcutSampleData" class="input-field w-full">
                    <option value="retail">Detailbutik (15 varer)</option>
                    <option value="warehouse">Lager (50 varer)</option>
                    <option value="manufacturing">Produktion (100 varer)</option>
                </select>
            `;
            break;
    }
    
    fieldsContainer.innerHTML = html;
}

// Toggle help tooltip visibility
function toggleHelpTooltip(tooltipId) {
    const tooltip = document.getElementById(tooltipId);
    if (tooltip) {
        tooltip.classList.toggle('hidden');
    }
}

// Toggle quality check details visibility
function toggleQualityDetails() {
    const container = document.getElementById('qualityIssuesContainer');
    const icon = document.getElementById('qualityToggleIcon');
    const text = document.getElementById('qualityToggleText');
    
    if (container && icon && text) {
        const isHidden = container.classList.contains('hidden');
        container.classList.toggle('hidden');
        icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
        text.textContent = isHidden 
            ? (currentLanguage === 'da' ? 'Skjul Detaljer' : 'Hide Details')
            : (currentLanguage === 'da' ? 'Vis Detaljer' : 'View Details');
    }
}

// Smart Print Menu System
function openPrintMenu() {
    const hasAbcData = abcResults && abcResults.length > 0;
    const hasAbcDouble = doubleABCResults && doubleABCResults.length > 0;
    const hasWilson = document.getElementById('wilsonResults') && !document.getElementById('wilsonResults').classList.contains('hidden');
    
    // Build options dynamically - Always add dashboard first
    let options = [];
    options.push({ key: 'dashboard', label: currentLanguage === 'da' ? translations.da['print-option-dashboard'] : translations.en['print-option-dashboard'] });
    
    if (hasAbcData) options.push({ key: 'abc', label: currentLanguage === 'da' ? translations.da['print-option-abc'] : translations.en['print-option-abc'] });
    if (hasAbcDouble) options.push({ key: 'abc-double', label: currentLanguage === 'da' ? translations.da['print-option-abc-double'] : translations.en['print-option-abc-double'] });
    if (hasWilson) options.push({ key: 'wilson', label: currentLanguage === 'da' ? translations.da['print-option-wilson'] : translations.en['print-option-wilson'] });
    
    // Always show inventory management (it's merged with Wilson and always available)
    options.push({ key: 'inventory', label: currentLanguage === 'da' ? (translations.da['print-option-inventory'] || 'Lagerstyring') : (translations.en['print-option-inventory'] || 'Inventory Management') });
    
    // Show modal with options
    showPrintOptionsModal(options);
}

function showPrintOptionsModal(options) {
    const title = currentLanguage === 'da' ? translations.da['print-menu-title'] : translations.en['print-menu-title'];
    const subtitle = currentLanguage === 'da' ? 'Vælg hvilke sektioner du vil printe' : 'Select which sections to print';
    
    let modalHtml = `
        <div id="printOptionsModal" class="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onclick="if(event.target === this) closePrintOptionsModal()">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
                <div class="p-6">
                    <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">🖨️ ${title}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">${subtitle}</p>
                    <div class="space-y-2 mb-4">
    `;
    
    options.forEach(opt => {
        modalHtml += `
            <label class="flex items-center px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg cursor-pointer transition-colors group">
                <input type="checkbox" class="print-section-checkbox w-5 h-5 text-blue-600 rounded mr-3 cursor-pointer" value="${opt.key}" checked>
                <span class="text-gray-800 dark:text-white font-medium">${opt.label}</span>
            </label>
        `;
    });
    
    modalHtml += `
                    </div>
                    <div class="flex gap-2">
                        <button onclick="printSelectedSections()" class="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors shadow-lg hover:shadow-xl">
                            ${currentLanguage === 'da' ? '🖨️ Print Valgte' : '🖨️ Print Selected'}
                        </button>
                        <button onclick="closePrintOptionsModal()" class="px-4 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white rounded-lg font-medium transition-colors">
                            ${currentLanguage === 'da' ? translations.da['cancel'] : translations.en['cancel']}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closePrintOptionsModal() {
    const modal = document.getElementById('printOptionsModal');
    if (modal) modal.remove();
}

function printSelectedSections() {
    const checkboxes = document.querySelectorAll('.print-section-checkbox:checked');
    const selectedSections = Array.from(checkboxes).map(cb => cb.value);
    
    if (selectedSections.length === 0) {
        showToast(currentLanguage === 'da' ? 'Vælg mindst én sektion' : 'Select at least one section', 'warning');
        return;
    }
    
    closePrintOptionsModal();
    
    // Remove print-this class from all sections
    const allSections = document.querySelectorAll('.tab-content');
    allSections.forEach(sec => {
        sec.classList.remove('print-this');
    });
    
    // Add print-this class to selected sections
    selectedSections.forEach(sectionKey => {
        let targetSection = null;
        switch(sectionKey) {
            case 'dashboard':
                targetSection = document.getElementById('dashboard-section');
                break;
            case 'abc':
                targetSection = document.getElementById('abc-section');
                break;
            case 'abc-double':
                targetSection = document.getElementById('abc-double-section');
                break;
            case 'wilson':
                targetSection = document.getElementById('wilson-section');
                break;
            case 'inventory':
                targetSection = document.getElementById('inventory-section');
                break;
        }
        
        if (targetSection) {
            console.log('Adding print-this to:', sectionKey, targetSection.id);
            targetSection.classList.add('print-this');
        }
    });
    
    // Print
    setTimeout(() => {
        window.print();
        
        // Clean up after print
        setTimeout(() => {
            allSections.forEach(sec => {
                sec.classList.remove('print-this');
            });
        }, 100);
    }, 300);
}

function printSection(section) {
    closePrintOptionsModal();
    
    // Remove print-this class from all sections
    const allSections = document.querySelectorAll('.tab-content');
    allSections.forEach(sec => {
        sec.classList.remove('print-this');
    });
    
    // Add print-this class only to the selected section
    let targetSection = null;
    switch(section) {
        case 'dashboard':
            targetSection = document.getElementById('dashboard-section');
            break;
        case 'abc':
            targetSection = document.getElementById('abc-section');
            break;
        case 'abc-double':
            targetSection = document.getElementById('abc-double-section');
            break;
        case 'wilson':
            targetSection = document.getElementById('wilson-section');
            break;
        case 'inventory':
            targetSection = document.getElementById('inventory-section');
            break;
    }
    
    if (targetSection) {
        console.log('Printing section:', section, 'Element ID:', targetSection.id);
        targetSection.classList.add('print-this');
        
        // Verify the class was added
        console.log('Has print-this class:', targetSection.classList.contains('print-this'));
    } else {
        console.error('Target section not found for:', section);
    }
    
    // Print
    setTimeout(() => {
        window.print();
        
        // Clean up after print
        setTimeout(() => {
            allSections.forEach(sec => {
                sec.classList.remove('print-this');
            });
        }, 100);
    }, 300);
}

function saveCustomShortcut() {
    // Check if we're editing an existing shortcut
    const form = document.getElementById('customShortcutForm');
    const editingId = form.getAttribute('data-editing-id');
    const isEditing = !!editingId;
    
    const icon = document.getElementById('shortcutIcon')?.value || '📌';
    const title = document.getElementById('shortcutTitle')?.value?.trim();
    const desc = document.getElementById('shortcutDesc')?.value?.trim();
    const actionType = document.getElementById('shortcutActionType')?.value;
    const color = document.getElementById('shortcutColor')?.value || 'blue';
    
    // Validation
    if (!title) {
        showToast(currentLanguage === 'da' ? '⚠️ Angiv venligst en titel' : '⚠️ Please enter a title', 'warning');
        return;
    }
    
    // Build action based on type
    let action = '';
    switch(actionType) {
        case 'tab':
            const tabName = document.getElementById('shortcutTabName')?.value;
            action = `switchTab('${tabName}')`;
            break;
        case 'function':
            action = document.getElementById('shortcutFunctionName')?.value || (currentLanguage === 'da' ? 'alert("Ingen funktion valgt")' : 'alert("No function selected")');
            break;
        case 'url':
            let url = document.getElementById('shortcutUrl')?.value?.trim();
            console.log('Saving URL - Raw value:', url);
            if (!url) {
                showToast(currentLanguage === 'da' ? '⚠️ Angiv venligst en URL' : '⚠️ Please enter a URL', 'warning');
                return;
            }
            // Add protocol if missing
            if (!url.match(/^https?:\/\//i)) {
                url = 'https://' + url;
                console.log('Added protocol, new URL:', url);
            }
            // Validate URL format
            try {
                new URL(url);
                console.log('URL validation passed');
            } catch (e) {
                console.error('URL validation failed:', e);
                showToast(currentLanguage === 'da' ? '⚠️ Ugyldig URL format' : '⚠️ Invalid URL format', 'warning');
                return;
            }
            const openInNewWindow = document.getElementById('shortcutUrlNewWindow')?.checked !== false;
            if (openInNewWindow) {
                action = `window.open('${url}', '_blank')`;
            } else {
                action = `window.location.href='${url}'`;
            }
            console.log('Final action string:', action);
            break;
        case 'sample':
            const sampleData = document.getElementById('shortcutSampleData')?.value;
            action = `loadSampleDataset('${sampleData}'); switchTab('abc')`;
            break;
    }
    
    // Load existing config
    let config = localStorage.getItem('quickActionsConfig');
    let actions = config ? JSON.parse(config) : [...defaultQuickActions];
    
    if (isEditing) {
        // Update existing shortcut
        const index = actions.findIndex(a => a.id === editingId);
        if (index !== -1) {
            actions[index] = {
                ...actions[index],
                icon: icon,
                title: title,
                desc: desc || (currentLanguage === 'da' ? 'Brugerdefineret genvej' : 'Custom shortcut'),
                action: action,
                color: color
            };
        }
        
        // Remove editing state
        form.removeAttribute('data-editing-id');
        
        // Reset form UI
        document.getElementById('customShortcutFormTitle').textContent = currentLanguage === 'da' ? 'Tilføj Brugerdefineret Genvej' : 'Add Custom Shortcut';
        document.getElementById('saveShortcutBtn').innerHTML = currentLanguage === 'da' ? '💾 Gem Genvej' : '💾 Save Shortcut';
        
        showToast((currentLanguage === 'da' ? '✅ Genvej opdateret: ' : '✅ Shortcut updated: ') + title, 'success');
    } else {
        // Create new shortcut
        const customShortcut = {
            id: 'custom-' + Date.now(),
            icon: icon,
            title: title,
            desc: desc || (currentLanguage === 'da' ? 'Brugerdefineret genvej' : 'Custom shortcut'),
            action: action,
            color: color,
            enabled: true,
            custom: true
        };
        
        actions.push(customShortcut);
        
        showToast((currentLanguage === 'da' ? '✅ Genvej oprettet: ' : '✅ Shortcut created: ') + title, 'success');
    }
    
    // Save and update UI
    localStorage.setItem('quickActionsConfig', JSON.stringify(actions));
    populateQuickActionsCheckboxes();
    renderQuickActions();
    
    // Close form and reset state
    if (form && !form.classList.contains('hidden')) {
        toggleCustomShortcutForm(); // Close the form
    }
}

function deleteCustomShortcut(actionId) {
    if (confirm(translate('confirm-delete-shortcut') || (currentLanguage === 'da' ? 'Er du sikker på at du vil slette denne genvej?' : 'Are you sure you want to delete this shortcut?'))) {
        let config = localStorage.getItem('quickActionsConfig');
        let actions = config ? JSON.parse(config) : [...defaultQuickActions];
        
        actions = actions.filter(a => a.id !== actionId);
        
        localStorage.setItem('quickActionsConfig', JSON.stringify(actions));
        populateQuickActionsCheckboxes();
        renderQuickActions();
        
        showToast(currentLanguage === 'da' ? '🗑️ Genvej slettet' : '🗑️ Shortcut deleted', 'info');
    }
}

// Edit custom shortcut
function editCustomShortcut(actionId) {
    console.log('Editing shortcut:', actionId);
    
    // Load configuration
    let config = localStorage.getItem('quickActionsConfig');
    let actions = config ? JSON.parse(config) : [...defaultQuickActions];
    const shortcut = actions.find(a => a.id === actionId);
    
    console.log('Found shortcut:', shortcut);
    
    if (!shortcut || !shortcut.custom) {
        showToast(currentLanguage === 'da' ? '⚠️ Genvej ikke fundet' : '⚠️ Shortcut not found', 'warning');
        return;
    }
    
    // Open form if closed (skip reset to preserve values we're about to set)
    const form = document.getElementById('customShortcutForm');
    if (form.classList.contains('hidden')) {
        toggleCustomShortcutForm(true); // Skip reset
    }
    
    // Determine action type and value FIRST
    let actionType = 'function'; // default
    let actionValue = '';
    let openInNewWindow = true;
    
    console.log('Parsing action string:', shortcut.action);
    
    if (shortcut.action.includes('switchTab(')) {
        actionType = 'tab';
        const match = shortcut.action.match(/switchTab\(['"]([^'"]+)['"]\)/);
        actionValue = match ? match[1] : '';
        console.log('Tab action:', actionValue);
    } else if (shortcut.action.includes('window.open(') || shortcut.action.includes('window.location.href')) {
        actionType = 'url';
        if (shortcut.action.includes('window.open(')) {
            // Match both single and double quotes, handle any URL characters
            const match = shortcut.action.match(/window\.open\(['"]([^'"]+)['"],?\s*['"]_blank['"]\)/);
            actionValue = match ? match[1] : '';
            openInNewWindow = true;
            console.log('URL (new window) - Raw action:', shortcut.action);
            console.log('URL (new window) - Match result:', match);
            console.log('URL (new window) - Extracted value:', actionValue);
        } else {
            // Match both single and double quotes
            const match = shortcut.action.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/);
            actionValue = match ? match[1] : '';
            openInNewWindow = false;
            console.log('URL (same window) - Raw action:', shortcut.action);
            console.log('URL (same window) - Match result:', match);
            console.log('URL (same window) - Extracted value:', actionValue);
        }
    } else if (shortcut.action.includes('loadSampleData')) {
        actionType = 'sample';
        const match = shortcut.action.match(/loadSampleDataset\(['"]([^'"]+)['"]\)/);
        actionValue = match ? match[1] : '';
        console.log('Sample action:', actionValue);
    } else {
        actionType = 'function';
        actionValue = shortcut.action;
        console.log('Function action:', actionValue);
    }
    
    // Store editing ID FIRST
    form.setAttribute('data-editing-id', actionId);
    
    // Set basic fields BEFORE changing action type
    document.getElementById('shortcutIcon').value = shortcut.icon || '📌';
    document.getElementById('shortcutTitle').value = shortcut.title || '';
    document.getElementById('shortcutDesc').value = shortcut.desc || '';
    document.getElementById('shortcutColor').value = shortcut.color || 'blue';
    
    console.log('Set basic fields - Icon:', shortcut.icon, 'Title:', shortcut.title, 'Desc:', shortcut.desc, 'Color:', shortcut.color);
    
    // Set action type which triggers field rebuild
    document.getElementById('shortcutActionType').value = actionType;
    updateShortcutActionFields();
    
    console.log('Set action type:', actionType);
    
    // Use requestAnimationFrame to ensure DOM updates are complete
    requestAnimationFrame(() => {
        setTimeout(() => {
            // Set action-specific value
            if (actionType === 'tab') {
                const tabField = document.getElementById('shortcutTabName');
                if (tabField) {
                    tabField.value = actionValue;
                    console.log('Set tab field:', actionValue);
                }
            } else if (actionType === 'function') {
                const funcField = document.getElementById('shortcutFunctionName');
                if (funcField) {
                    funcField.value = actionValue;
                    console.log('Set function field:', actionValue);
                }
            } else if (actionType === 'url') {
                const urlField = document.getElementById('shortcutUrl');
                const checkboxField = document.getElementById('shortcutUrlNewWindow');
                if (urlField) {
                    urlField.value = actionValue;
                    console.log('Set URL field:', actionValue);
                }
                if (checkboxField) {
                    checkboxField.checked = openInNewWindow;
                    console.log('Set checkbox:', openInNewWindow);
                }
            } else if (actionType === 'sample') {
                const sampleField = document.getElementById('shortcutSampleData');
                if (sampleField) {
                    sampleField.value = actionValue;
                    console.log('Set sample field:', actionValue);
                }
            }
            
            // Update UI text
            document.getElementById('customShortcutFormTitle').textContent = currentLanguage === 'da' ? 'Rediger Genvej' : 'Edit Shortcut';
            document.getElementById('saveShortcutBtn').innerHTML = currentLanguage === 'da' ? '✏️ Opdater Genvej' : '✏️ Update Shortcut';
            
            // Scroll to form
            form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            showToast((currentLanguage === 'da' ? '✏️ Redigerer: ' : '✏️ Editing: ') + shortcut.title, 'info');
        }, 150);
    });
}

// ========================================
// Upload Section Toggle
// ========================================

function toggleUploadSection() {
    const dropZone = document.getElementById('fileDropZone');
    const toggleBtn = document.getElementById('toggleUploadBtn');
    const toggleText = document.getElementById('uploadToggleText');
    
    if (dropZone && toggleBtn && toggleText) {
        const isMinimized = dropZone.classList.contains('hidden');
        
        if (isMinimized) {
            dropZone.classList.remove('hidden');
            toggleText.textContent = currentLanguage === 'da' ? '🔽 Minimer' : '🔽 Minimize';
            toggleText.setAttribute('data-i18n', 'minimize-upload');
        } else {
            dropZone.classList.add('hidden');
            toggleText.textContent = currentLanguage === 'da' ? '📂 Udvid' : '📂 Expand';
            toggleText.setAttribute('data-i18n', 'expand-upload');
        }
    }
}

function minimizeUploadSection() {
    const dropZone = document.getElementById('fileDropZone');
    const toggleBtn = document.getElementById('toggleUploadBtn');
    const toggleText = document.getElementById('uploadToggleText');
    
    if (dropZone && toggleBtn && toggleText) {
        dropZone.classList.add('hidden');
        toggleBtn.classList.remove('hidden');
        toggleText.textContent = currentLanguage === 'da' ? '📂 Udvid' : '📂 Expand';
        toggleText.setAttribute('data-i18n', 'expand-upload');
    }
}

// ========================================
// Threshold Auto-Calculation
// ========================================

function updateThresholdC(type) {
    if (type === 'single') {
        const thresholdA = parseFloat(document.getElementById('thresholdASingle')?.value || 80);
        const thresholdB = parseFloat(document.getElementById('thresholdBSingle')?.value || 15);
        const thresholdC = document.getElementById('thresholdCSingle');
        
        if (thresholdC) {
            const calculatedC = Math.max(0, 100 - thresholdA - thresholdB);
            thresholdC.value = calculatedC.toFixed(0);
        }
    } else if (type === 'doubleValue') {
        const thresholdA = parseFloat(document.getElementById('doubleThresholdValueA')?.value || 80);
        const thresholdB = parseFloat(document.getElementById('doubleThresholdValueB')?.value || 15);
        const thresholdC = document.getElementById('doubleThresholdValueC');
        
        if (thresholdC) {
            const calculatedC = Math.max(0, 100 - thresholdA - thresholdB);
            thresholdC.value = calculatedC.toFixed(0);
        }
    } else if (type === 'doubleConsumption') {
        const thresholdA = parseFloat(document.getElementById('doubleThresholdConsumptionA')?.value || 80);
        const thresholdB = parseFloat(document.getElementById('doubleThresholdConsumptionB')?.value || 15);
        const thresholdC = document.getElementById('doubleThresholdConsumptionC');
        
        if (thresholdC) {
            const calculatedC = Math.max(0, 100 - thresholdA - thresholdB);
            thresholdC.value = calculatedC.toFixed(0);
        }
    }
}

// ========================================
// Theme & Settings
// ========================================

function setTheme(theme) {
    currentTheme = theme;
    
    const mainElement = document.querySelector('main');
    
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        if (mainElement) mainElement.classList.add('dark');
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) themeIcon.textContent = '🌙';
    } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        if (mainElement) mainElement.classList.remove('dark');
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) themeIcon.textContent = '🌞';
    }
    
    localStorage.setItem('theme', theme);
    updateThemeButtons();

    // Apply dark/light palette to all Chart.js instances (Step M)
    applyChartPalette(theme === 'dark');
    
    // Refresh charts if they exist
    if (abcResults.length > 0) {
        const chartTypeSelect = document.getElementById('chartTypeSelect');
        if (chartTypeSelect) {
            renderABCChart(chartTypeSelect.value);
        }
    }
}

// Step M: Update Chart.js global defaults for dark / light mode
function applyChartPalette(isDark) {
    if (typeof Chart === 'undefined') return;
    const textColor  = isDark ? '#e5e7eb' : '#374151';
    const gridColor  = isDark ? '#374151' : '#e5e7eb';
    const tickColor  = isDark ? '#9ca3af' : '#6b7280';

    // Global defaults — affects all charts that don't override explicitly
    Chart.defaults.color = textColor;
    Chart.defaults.borderColor = gridColor;

    // Update scale defaults
    if (Chart.defaults.scales) {
        ['linear', 'logarithmic', 'category', 'time'].forEach(scaleType => {
            const scale = Chart.defaults.scales[scaleType];
            if (scale) {
                if (scale.ticks) scale.ticks.color = tickColor;
                if (scale.grid) scale.grid.color = gridColor;
                if (scale.title) scale.title.color = textColor;
            }
        });
    }

    // Re-render any visible charts that don't auto-update
    [window.periodicReviewChartInstance, window.minMaxChartInstance].forEach(chart => {
        if (chart) {
            try {
                // Update axis colors on existing chart instances
                chart.options.plugins.title = chart.options.plugins.title || {};
                chart.options.plugins.title.color = textColor;
                chart.options.plugins.legend = chart.options.plugins.legend || {};
                chart.options.plugins.legend.labels = chart.options.plugins.legend.labels || {};
                chart.options.plugins.legend.labels.color = textColor;
                ['x', 'y', 'x1', 'y1'].forEach(axis => {
                    if (chart.options.scales && chart.options.scales[axis]) {
                        const s = chart.options.scales[axis];
                        if (!s.ticks) s.ticks = {};
                        if (!s.grid) s.grid = {};
                        if (!s.title) s.title = {};
                        s.ticks.color = tickColor;
                        s.grid.color = gridColor;
                        s.title.color = textColor;
                    }
                });
                chart.update('none'); // 'none' = no animation, just re-paint
            } catch(e) { /* chart may be partially destroyed */ }
        }
    });
}

function updateThemeButtons() {
    const lightThemeBtn = document.getElementById('lightThemeBtn');
    const darkThemeBtn = document.getElementById('darkThemeBtn');
    if (lightThemeBtn) lightThemeBtn.classList.toggle('active', currentTheme === 'light');
    if (darkThemeBtn) darkThemeBtn.classList.toggle('active', currentTheme === 'dark');
}

// ========================================
// Language Management
// ========================================

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    
    // Update all translatable elements
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
    
    // Update all translatable HTML elements (supports markup like <strong>)
    document.querySelectorAll('[data-i18n-html]').forEach(element => {
        const key = element.getAttribute('data-i18n-html');
        if (translations[lang][key]) {
            element.innerHTML = translations[lang][key];
        }
    });
    
    // Update all translatable titles (tooltips)
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        if (translations[lang][key]) {
            element.title = translations[lang][key];
        }
    });
    
    // Update all translatable placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) {
            element.placeholder = translations[lang][key];
        }
    });
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
    
    updateLanguageButtons();
    
    // Refresh charts if they exist
    if (abcResults.length > 0) {
        const chartTypeSelect = document.getElementById('chartTypeSelect');
        if (chartTypeSelect) {
            renderABCChart(chartTypeSelect.value);
        }
    }
    
    // Refresh inventory management calculations and charts if values exist
    // Recalculate Reorder Point if values exist
    const ropDailyDemand = document.getElementById('ropDailyDemand');
    if (ropDailyDemand && ropDailyDemand.value) {
        calculateReorderPoint();
    }
    
    // Recalculate Periodic Review if values exist
    const prDailyDemand = document.getElementById('prDailyDemand');
    if (prDailyDemand && prDailyDemand.value) {
        calculatePeriodicReview();
    }
    
    // Recalculate Min/Max if values exist
    const mmMinLevel = document.getElementById('mmMinLevel');
    if (mmMinLevel && mmMinLevel.value) {
        calculateMinMax();
    }
    
    // Retranslate custom pages from templates
    if (typeof retranslateCustomPages === 'function') {
        retranslateCustomPages();
    }
}

function updateLanguageButtons() {
    const daBtn = document.getElementById('daBtn');
    const enBtn = document.getElementById('enBtn');
    if (daBtn) daBtn.classList.toggle('active', currentLanguage === 'da');
    if (enBtn) enBtn.classList.toggle('active', currentLanguage === 'en');
}

function t(key) {
    return translations[currentLanguage][key] || key;
}

// Alias for translate function
function translate(key) {
    const translated = translations[currentLanguage][key];
    
    // If translation exists, return it
    if (translated) return translated;
    
    // Fallback: Convert key to human-readable text
    // budget-income-name → Income Name
    // budget-expense-name → Expense Name
    return key
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// ========================================
// Sample File Downloads
// ========================================

function downloadSampleFile(type) {
    switch(type) {
        case 'basic':
            downloadExistingSample('sample_data_basic.csv');
            break;
        case 'warehouse':
            downloadExistingSample('sample_data_warehouse.csv');
            break;
        case 'medium':
            downloadExistingSample('sample_data_medium.csv');
            break;
        case 'large':
            downloadExistingSample('sample_data_large_1000.csv');
            break;
        case 'warehouse-excel':
            generateWarehouseExcel();
            break;
        case 'template-excel':
            generateTemplateExcel();
            break;
        case 'logistics-excel':
            generateLogisticsOperatorExcel();
            break;
    }
}

function downloadExistingSample(filename) {
    // Download existing CSV files
    const link = document.createElement('a');
    link.href = filename;
    link.download = filename;
    link.click();
    
    showToast(
        currentLanguage === 'da' ? `📥 Downloader ${filename}...` : `📥 Downloading ${filename}...`,
        'success'
    );
}

// Generate Warehouse Excel with multiple sheets
function generateWarehouseExcel() {
    if (typeof XLSX === 'undefined') {
        showToast(currentLanguage === 'da' ? 'Excel bibliotek ikke indlæst' : 'Excel library not loaded', 'error');
        return;
    }
    
    // Sheet 1: Lager Data (main inventory data)
    const lagerData = [
        ['Varenr', 'Varenavn', 'Kategori', 'Årsforbrug', 'Pris', 'Lagerværdi', 'Lokation'],
        ['SKU-001', 'Industri Palle EUR 120x80cm', 'Paller', 12500, 145, 1812500, 'A-01'],
        ['SKU-002', 'Industri Palle DK 100x120cm', 'Paller', 8900, 165, 1468500, 'A-02'],
        ['SKU-003', 'Stretchfilm 500mm x 300m Klar', 'Emballage', 5600, 285, 1596000, 'B-01'],
        ['SKU-004', 'Stretchfilm 500mm x 300m Sort', 'Emballage', 3200, 295, 944000, 'B-02'],
        ['SKU-005', 'Tape Pakke 50mm x 66m Brun', 'Emballage', 8400, 22, 184800, 'B-03'],
        ['SKU-006', 'Papkasse 40x30x30cm Enkelt', 'Kasser', 15200, 18, 273600, 'C-01'],
        ['SKU-007', 'Papkasse 60x40x40cm Dobbelt', 'Kasser', 9800, 32, 313600, 'C-02'],
        ['SKU-008', 'Bobleplast 1500mm x 100m', 'Beskyttelse', 2100, 850, 1785000, 'D-01'],
        ['SKU-009', 'Hjørnebeskytter Pap L-form', 'Beskyttelse', 12400, 8, 99200, 'D-02'],
        ['SKU-010', 'Plastbakke Stabelbar 60x40x22cm', 'Opbevaring', 2400, 185, 444000, 'E-01'],
        ['SKU-011', 'Palleløfter Manuel 2500kg', 'Udstyr', 85, 4500, 382500, 'F-01'],
        ['SKU-012', 'Adressemærkat 105x148mm 1000stk', 'Labels', 2800, 145, 406000, 'G-01'],
        ['SKU-013', 'Sikkerhedslak Transparent', 'Sikkerhed', 3200, 125, 400000, 'G-02'],
        ['SKU-014', 'Industri Affaldssæk 240L Sort', 'Renovation', 18500, 12, 222000, 'H-01'],
        ['SKU-015', 'Håndtruck Aluminium 250kg', 'Udstyr', 125, 1850, 231250, 'F-02']
    ];
    
    // Sheet 2: EOQ Parametre (EOQ calculation parameters)
    const eoqParams = [
        ['Parameter', 'Værdi', 'Beskrivelse'],
        ['Standard Ordreomkostning', 200, 'Omkostning pr. ordre i DKK'],
        ['Standard Rentesats', 5, 'Lagerrentesats i %'],
        ['Leveringstid A-varer', 3, 'Dage'],
        ['Leveringstid B-varer', 7, 'Dage'],
        ['Leveringstid C-varer', 14, 'Dage'],
        ['Sikkerhedslager A', 10, '% af årsforbrug'],
        ['Sikkerhedslager B', 15, '% af årsforbrug'],
        ['Sikkerhedslager C', 5, '% af årsforbrug']
    ];
    
    // Sheet 3: ABC Tærskler (ABC thresholds)
    const abcThresholds = [
        ['Klassifikation', 'Værdiandel %', 'Typisk Vareandel %', 'Fokus'],
        ['A-varer', 80, '10-20', 'Høj prioritet - Tæt opfølgning'],
        ['B-varer', 15, '20-30', 'Mellem prioritet - Periodisk gennemgang'],
        ['C-varer', 5, '50-70', 'Lav prioritet - Minimal styring']
    ];
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    const ws1 = XLSX.utils.aoa_to_sheet(lagerData);
    const ws2 = XLSX.utils.aoa_to_sheet(eoqParams);
    const ws3 = XLSX.utils.aoa_to_sheet(abcThresholds);
    
    // Set column widths
    ws1['!cols'] = [
        {wch: 10}, {wch: 35}, {wch: 15}, {wch: 12}, {wch: 10}, {wch: 12}, {wch: 10}
    ];
    ws2['!cols'] = [{wch: 25}, {wch: 10}, {wch: 30}];
    ws3['!cols'] = [{wch: 15}, {wch: 15}, {wch: 18}, {wch: 35}];
    
    XLSX.utils.book_append_sheet(wb, ws1, 'Lager Data');
    XLSX.utils.book_append_sheet(wb, ws2, 'EOQ Parametre');
    XLSX.utils.book_append_sheet(wb, ws3, 'ABC Tærskler');
    
    // Download
    XLSX.writeFile(wb, 'sample_lager_data.xlsx');
    
    showToast(
        currentLanguage === 'da' ? '📊 Excel fil downloaded med 3 ark' : '📊 Excel file downloaded with 3 sheets',
        'success'
    );
}

// Generate empty template Excel
function generateTemplateExcel() {
    if (typeof XLSX === 'undefined') {
        showToast(currentLanguage === 'da' ? 'Excel bibliotek ikke indlæst' : 'Excel library not loaded', 'error');
        return;
    }
    
    // Sheet 1: Data Template
    const dataTemplate = [
        ['Varenr', 'Varenavn', 'Kategori', 'Årsforbrug', 'Pris', 'Ordreomkostning', 'Rentesats'],
        ['SKU-001', 'Eksempel Vare 1', 'Kategori A', 1000, 100, 200, 5],
        ['SKU-002', 'Eksempel Vare 2', 'Kategori B', 500, 50, 200, 5],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['// Udfyld dine egne data herunder', '', '', '', '', '', '']
    ];
    
    // Sheet 2: Instructions
    const instructions = [
        ['Instruktioner til brug af skabelonen'],
        [''],
        ['Påkrævede kolonner:'],
        ['- Varenavn: Navn eller ID på varen'],
        ['- Årsforbrug: Antal enheder brugt/solgt pr. år'],
        ['- Pris: Pris pr. enhed (bruges til værdiberegning)'],
        [''],
        ['Valgfrie kolonner:'],
        ['- Varenr: SKU eller varenummer'],
        ['- Kategori: Produktkategori'],
        ['- Ordreomkostning: Omkostning pr. ordre (standard: 200 DKK)'],
        ['- Rentesats: Lagerrentesats i % (standard: 5%)'],
        [''],
        ['Tips:'],
        ['- Systemet genkender automatisk kolonnenavne'],
        ['- Du kan bruge både danske og engelske navne'],
        ['- CSV og Excel filer understøttes']
    ];
    
    const wb = XLSX.utils.book_new();
    
    const ws1 = XLSX.utils.aoa_to_sheet(dataTemplate);
    const ws2 = XLSX.utils.aoa_to_sheet(instructions);
    
    ws1['!cols'] = [
        {wch: 12}, {wch: 25}, {wch: 15}, {wch: 12}, {wch: 10}, {wch: 15}, {wch: 10}
    ];
    ws2['!cols'] = [{wch: 60}];
    
    XLSX.utils.book_append_sheet(wb, ws1, 'Data');
    XLSX.utils.book_append_sheet(wb, ws2, 'Instruktioner');
    
    XLSX.writeFile(wb, 'lager_skabelon.xlsx');
    
    showToast(
        currentLanguage === 'da' ? '📊 Tom skabelon downloaded' : '📊 Empty template downloaded',
        'success'
    );
}

// Generate comprehensive Logistics Operator Excel with realistic data
function generateLogisticsOperatorExcel() {
    if (typeof XLSX === 'undefined') {
        showToast(currentLanguage === 'da' ? 'Excel bibliotek ikke indlæst' : 'Excel library not loaded', 'error');
        return;
    }
    
    // Sheet 1: Varelager (Inventory)
    const varelagerHeaders = currentLanguage === 'da'
        ? ['SKU', 'Varenavn', 'Kategori', 'Underkategori', 'Lokation', 'Zone', 'Reol', 'Hylde', 'Lagerbestand', 'Min Lager', 'Max Lager', 'Genbestillingspunkt', 'Årsforbrug', 'Pris pr. enhed', 'Lagerværdi', 'ABC Klasse', 'Leverandør ID', 'Lead Time (dage)', 'Sidst Optalt']
        : ['SKU', 'Item Name', 'Category', 'Subcategory', 'Location', 'Zone', 'Rack', 'Shelf', 'Stock Level', 'Min Stock', 'Max Stock', 'Reorder Point', 'Annual Consumption', 'Price per Unit', 'Inventory Value', 'ABC Class', 'Supplier ID', 'Lead Time (days)', 'Last Counted'];
    const varelager = [
        varelagerHeaders,
        ['LOG-001', 'EUR Palle 120x80cm', 'Paller', 'Euro Standard', 'Lager A', 'A', '01', '01', 2450, 500, 3000, 800, 12500, 145, 355250, 'A', 'LEV-001', 3, '2024-01-15'],
        ['LOG-002', 'DK Palle 100x120cm', 'Paller', 'Dansk Standard', 'Lager A', 'A', '01', '02', 1850, 400, 2500, 600, 8900, 165, 305250, 'A', 'LEV-001', 3, '2024-01-15'],
        ['LOG-003', 'Halvpalle 80x60cm', 'Paller', 'Halvpalle', 'Lager A', 'A', '02', '01', 980, 200, 1500, 350, 4500, 95, 93100, 'B', 'LEV-001', 5, '2024-01-15'],
        ['LOG-004', 'Stretchfilm 500mm Klar', 'Emballage', 'Stretchfilm', 'Lager B', 'B', '01', '01', 420, 100, 600, 150, 5600, 285, 119700, 'A', 'LEV-002', 2, '2024-01-12'],
        ['LOG-005', 'Stretchfilm 500mm Sort', 'Emballage', 'Stretchfilm', 'Lager B', 'B', '01', '02', 280, 80, 400, 120, 3200, 295, 82600, 'A', 'LEV-002', 2, '2024-01-12'],
        ['LOG-006', 'Tape 50mm Brun', 'Emballage', 'Tape', 'Lager B', 'B', '02', '01', 1250, 500, 2000, 700, 8400, 22, 27500, 'B', 'LEV-002', 2, '2024-01-10'],
        ['LOG-007', 'Tape 50mm Transparent', 'Emballage', 'Tape', 'Lager B', 'B', '02', '02', 890, 400, 1500, 550, 6200, 24, 21360, 'B', 'LEV-002', 2, '2024-01-10'],
        ['LOG-008', 'Papkasse 40x30x30 Enkel', 'Kasser', 'Papkasser', 'Lager C', 'C', '01', '01', 3200, 1000, 5000, 1500, 15200, 18, 57600, 'A', 'LEV-003', 5, '2024-01-08'],
        ['LOG-009', 'Papkasse 60x40x40 Dobbelt', 'Kasser', 'Papkasser', 'Lager C', 'C', '01', '02', 1850, 600, 3000, 900, 9800, 32, 59200, 'A', 'LEV-003', 5, '2024-01-08'],
        ['LOG-010', 'Papkasse 30x20x20 Mini', 'Kasser', 'Papkasser', 'Lager C', 'C', '02', '01', 4500, 2000, 6000, 2500, 22000, 12, 54000, 'B', 'LEV-003', 5, '2024-01-08'],
        ['LOG-011', 'Bobleplast 1500mm x 100m', 'Beskyttelse', 'Bobleplast', 'Lager D', 'D', '01', '01', 85, 30, 120, 45, 2100, 850, 72250, 'A', 'LEV-004', 7, '2024-01-05'],
        ['LOG-012', 'Hjørnebeskytter Pap', 'Beskyttelse', 'Hjørnebeskytter', 'Lager D', 'D', '01', '02', 5200, 2000, 8000, 3000, 12400, 8, 41600, 'B', 'LEV-003', 3, '2024-01-05'],
        ['LOG-013', 'Skumplast Ark 50x50cm', 'Beskyttelse', 'Skumplast', 'Lager D', 'D', '02', '01', 2800, 800, 4000, 1200, 8500, 15, 42000, 'B', 'LEV-004', 5, '2024-01-05'],
        ['LOG-014', 'Plastbakke 60x40x22 Stabel', 'Opbevaring', 'Plastbakker', 'Lager E', 'E', '01', '01', 450, 150, 600, 200, 2400, 185, 83250, 'B', 'LEV-005', 10, '2024-01-03'],
        ['LOG-015', 'Palleløfter Manuel 2500kg', 'Udstyr', 'Palleløftere', 'Lager F', 'F', '01', '01', 12, 5, 20, 8, 85, 4500, 54000, 'C', 'LEV-006', 14, '2024-01-01'],
        ['LOG-016', 'Adressemærkat 105x148', 'Labels', 'Adresselabels', 'Lager G', 'G', '01', '01', 125, 50, 200, 70, 2800, 145, 18125, 'B', 'LEV-007', 3, '2024-01-02'],
        ['LOG-017', 'Fragtseddel A5 3-delt', 'Labels', 'Fragtsedler', 'Lager G', 'G', '01', '02', 340, 150, 500, 200, 4800, 68, 23120, 'B', 'LEV-007', 3, '2024-01-02'],
        ['LOG-018', 'Håndtruck Aluminium 250kg', 'Udstyr', 'Trucks', 'Lager F', 'F', '02', '01', 8, 3, 15, 5, 125, 1850, 14800, 'C', 'LEV-006', 14, '2024-01-01'],
        ['LOG-019', 'Industriaffaldssæk 240L', 'Renovation', 'Affaldssække', 'Lager H', 'H', '01', '01', 2450, 1000, 4000, 1500, 18500, 12, 29400, 'B', 'LEV-008', 2, '2024-01-14'],
        ['LOG-020', 'Sikkerhedssko S3 Str. Mix', 'Sikkerhed', 'Fodtøj', 'Lager I', 'I', '01', '01', 85, 30, 120, 45, 320, 495, 42075, 'C', 'LEV-009', 21, '2024-01-10'],
        ['LOG-021', 'Arbejdshandsker Nitril XL', 'Sikkerhed', 'Handsker', 'Lager I', 'I', '02', '01', 480, 200, 800, 300, 4200, 28, 13440, 'C', 'LEV-009', 7, '2024-01-10'],
        ['LOG-022', 'Flueben Sticker Grøn', 'Labels', 'QC Labels', 'Lager G', 'G', '02', '01', 12500, 5000, 20000, 8000, 45000, 2.5, 31250, 'B', 'LEV-007', 3, '2024-01-02'],
        ['LOG-023', 'Spærrebånd Rød/Hvid 500m', 'Sikkerhed', 'Afspærring', 'Lager I', 'I', '03', '01', 65, 20, 100, 35, 420, 125, 8125, 'C', 'LEV-009', 5, '2024-01-10'],
        ['LOG-024', 'Pallerammer Træ 120x80', 'Opbevaring', 'Pallerammer', 'Lager E', 'E', '02', '01', 340, 100, 500, 150, 1800, 245, 83300, 'B', 'LEV-001', 7, '2024-01-03'],
        ['LOG-025', 'Containerlås Heavy Duty', 'Sikkerhed', 'Låse', 'Lager I', 'I', '04', '01', 28, 10, 50, 15, 180, 385, 10780, 'C', 'LEV-010', 14, '2024-01-08']
    ];
    
    // Sheet 2: Leverandører (Suppliers)
    const leverandorerHeaders = currentLanguage === 'da'
        ? ['Leverandør ID', 'Firmanavn', 'Kontaktperson', 'Email', 'Telefon', 'Adresse', 'Postnummer', 'By', 'Land', 'Betalingsbetingelser', 'Standard Lead Time', 'Min. Ordre', 'Rating', 'Aktiv']
        : ['Supplier ID', 'Company Name', 'Contact Person', 'Email', 'Phone', 'Address', 'Postal Code', 'City', 'Country', 'Payment Terms', 'Standard Lead Time', 'Min. Order', 'Rating', 'Active'];
    const leverandorer = [
        leverandorerHeaders,
        ['LEV-001', 'Nordic Pallet Solutions A/S', 'Hans Jensen', 'hj@nordicpallet.dk', '+45 70 20 30 40', 'Industrivej 45', '4600', 'Køge', 'Danmark', 'Netto 30', 3, 500, 4.8, 'Ja'],
        ['LEV-002', 'PackPro Emballage', 'Mette Olsen', 'mo@packpro.dk', '+45 45 67 89 01', 'Emballagevej 12', '2650', 'Hvidovre', 'Danmark', 'Netto 14', 2, 200, 4.5, 'Ja'],
        ['LEV-003', 'Kartonnage Danmark', 'Per Andersen', 'pa@kartonnage.dk', '+45 86 12 34 56', 'Papvej 8', '8600', 'Silkeborg', 'Danmark', 'Netto 30', 5, 1000, 4.6, 'Ja'],
        ['LEV-004', 'ProtectPack ApS', 'Line Sørensen', 'ls@protectpack.dk', '+45 22 33 44 55', 'Beskyttelsesvej 3', '5000', 'Odense', 'Danmark', 'Netto 14', 7, 300, 4.3, 'Ja'],
        ['LEV-005', 'PlastBakker.dk', 'Thomas Nielsen', 'tn@plastbakker.dk', '+45 33 44 55 66', 'Plastvej 22', '9000', 'Aalborg', 'Danmark', 'Netto 30', 10, 100, 4.0, 'Ja'],
        ['LEV-006', 'LagerUdstyr A/S', 'Kirsten Holm', 'kh@lagerudstyr.dk', '+45 75 22 33 44', 'Udstyrsvej 88', '7100', 'Vejle', 'Danmark', 'Netto 45', 14, 10000, 4.7, 'Ja'],
        ['LEV-007', 'Label Expert', 'Bo Madsen', 'bm@labelexpert.dk', '+45 38 38 38 38', 'Labelvej 5', '2300', 'København S', 'Danmark', 'Netto 14', 3, 500, 4.4, 'Ja'],
        ['LEV-008', 'Reno Solutions', 'Anne Larsen', 'al@renosolutions.dk', '+45 66 77 88 99', 'Renovej 15', '6000', 'Kolding', 'Danmark', 'Netto 14', 2, 200, 4.2, 'Ja'],
        ['LEV-009', 'SafetyFirst Danmark', 'Mikkel Christensen', 'mc@safetyfirst.dk', '+45 55 66 77 88', 'Sikkerhedsvej 42', '8000', 'Aarhus C', 'Danmark', 'Netto 30', 7, 1000, 4.9, 'Ja'],
        ['LEV-010', 'SecureLock Import', 'Eva Schmidt', 'es@securelock.de', '+49 40 123 456', 'Schlossstrasse 10', '20095', 'Hamburg', 'Tyskland', 'Netto 45', 14, 2000, 4.1, 'Ja']
    ];
    
    // Sheet 3: Ordrehistorik (Order History)
    const ordrehistorikHeaders = currentLanguage === 'da'
        ? ['Ordre ID', 'Dato', 'Leverandør ID', 'SKU', 'Antal', 'Pris pr. enhed', 'Total Beløb', 'Status', 'Forventet Levering', 'Faktisk Levering', 'Noter']
        : ['Order ID', 'Date', 'Supplier ID', 'SKU', 'Quantity', 'Price per Unit', 'Total Amount', 'Status', 'Expected Delivery', 'Actual Delivery', 'Notes'];
    const ordrehistorik = [
        ordrehistorikHeaders,
        ['ORD-2024-001', '2024-01-02', 'LEV-001', 'LOG-001', 1000, 145, 145000, 'Leveret', '2024-01-05', '2024-01-05', ''],
        ['ORD-2024-002', '2024-01-03', 'LEV-002', 'LOG-004', 200, 285, 57000, 'Leveret', '2024-01-05', '2024-01-04', 'Leveret 1 dag før tid'],
        ['ORD-2024-003', '2024-01-05', 'LEV-003', 'LOG-008', 2500, 18, 45000, 'Leveret', '2024-01-10', '2024-01-10', ''],
        ['ORD-2024-004', '2024-01-08', 'LEV-001', 'LOG-002', 800, 165, 132000, 'Leveret', '2024-01-11', '2024-01-12', 'Forsinket 1 dag - sne'],
        ['ORD-2024-005', '2024-01-10', 'LEV-004', 'LOG-011', 50, 850, 42500, 'Under levering', '2024-01-17', '', ''],
        ['ORD-2024-006', '2024-01-12', 'LEV-002', 'LOG-006', 1500, 22, 33000, 'Bekræftet', '2024-01-14', '', ''],
        ['ORD-2024-007', '2024-01-14', 'LEV-003', 'LOG-009', 1200, 32, 38400, 'Afventer', '2024-01-19', '', 'Venter på lagerplads'],
        ['ORD-2024-008', '2024-01-15', 'LEV-009', 'LOG-020', 40, 495, 19800, 'Bestilt', '2024-02-05', '', 'Lang leveringstid'],
        ['ORD-2024-009', '2024-01-15', 'LEV-007', 'LOG-016', 100, 145, 14500, 'Bekræftet', '2024-01-18', '', ''],
        ['ORD-2024-010', '2024-01-16', 'LEV-001', 'LOG-003', 500, 95, 47500, 'Afventer', '2024-01-21', '', '']
    ];
    
    // Sheet 4: Lagerflytninger (Warehouse Movements)
    const lagerflytningerHeaders = currentLanguage === 'da'
        ? ['Flytter ID', 'Dato', 'Tidspunkt', 'SKU', 'Fra Lokation', 'Til Lokation', 'Antal', 'Type', 'Reference', 'Medarbejder', 'Noter']
        : ['Movement ID', 'Date', 'Time', 'SKU', 'From Location', 'To Location', 'Quantity', 'Type', 'Reference', 'Employee', 'Notes'];
    const lagerflytninger = [
        lagerflytningerHeaders,
        ['MOV-001', '2024-01-15', '08:15', 'LOG-001', 'Modtagelse', 'A-01-01', 500, 'Indgående', 'ORD-2024-001', 'Peter J', 'Modtaget fra Nordic Pallet'],
        ['MOV-002', '2024-01-15', '09:30', 'LOG-008', 'C-01-01', 'Pakkeri', 200, 'Intern', 'PICK-0115', 'Anna M', 'Til pakkelinje 3'],
        ['MOV-003', '2024-01-15', '10:45', 'LOG-004', 'B-01-01', 'Pakkeri', 50, 'Intern', 'PICK-0116', 'Lars H', ''],
        ['MOV-004', '2024-01-15', '11:20', 'LOG-022', 'G-02-01', 'QC', 500, 'Intern', 'QC-CHECK', 'Marie K', 'Kvalitetskontrol'],
        ['MOV-005', '2024-01-15', '13:00', 'LOG-009', 'C-01-02', 'Afsendelse', 150, 'Udgående', 'SHIP-2024-089', 'Thomas B', 'Kunde: ABC Logistics'],
        ['MOV-006', '2024-01-15', '14:15', 'LOG-006', 'Modtagelse', 'B-02-01', 1500, 'Indgående', 'ORD-2024-006', 'Peter J', ''],
        ['MOV-007', '2024-01-15', '15:30', 'LOG-014', 'E-01-01', 'Rengøring', 20, 'Intern', 'CLEAN-0115', 'Anna M', 'Til vask og retur'],
        ['MOV-008', '2024-01-15', '16:00', 'LOG-001', 'A-01-01', 'Afsendelse', 80, 'Udgående', 'SHIP-2024-090', 'Lars H', 'Express levering'],
        ['MOV-009', '2024-01-16', '07:45', 'LOG-002', 'Modtagelse', 'A-01-02', 800, 'Indgående', 'ORD-2024-004', 'Marie K', 'Forsinket levering'],
        ['MOV-010', '2024-01-16', '09:00', 'LOG-019', 'H-01-01', 'Renovation', 100, 'Intern', 'WASTE-0116', 'Thomas B', 'Defekte sække']
    ];
    
    // Sheet 5: KPI Målinger (KPI Metrics)
    const kpiMalingerHeaders = currentLanguage === 'da'
        ? ['Måned', 'Lageromkostning', 'Ordreomkostninger', 'Lageromsætning', 'Fill Rate %', 'On-Time Delivery %', 'Plukkefejl %', 'Pladsudnyttelse %', 'Arbejdstimer', 'Antal Ordrer']
        : ['Month', 'Storage Cost', 'Order Costs', 'Inventory Turnover', 'Fill Rate %', 'On-Time Delivery %', 'Pick Error %', 'Space Utilization %', 'Work Hours', 'Number of Orders'];
    const kpiMalinger = [
        kpiMalingerHeaders,
        ['Jan 2024', 125000, 48000, 4.2, 98.5, 96.2, 0.8, 78, 1680, 2450],
        ['Dec 2023', 132000, 52000, 3.9, 97.8, 94.5, 1.2, 82, 1720, 2680],
        ['Nov 2023', 118000, 45000, 4.5, 98.2, 95.8, 0.9, 75, 1650, 2320],
        ['Okt 2023', 115000, 42000, 4.8, 98.8, 97.1, 0.6, 72, 1600, 2180],
        ['Sep 2023', 108000, 38000, 5.1, 99.1, 97.5, 0.5, 68, 1580, 2050],
        ['Aug 2023', 98000, 35000, 5.5, 99.3, 98.2, 0.4, 65, 1520, 1920],
        ['Jul 2023', 95000, 32000, 5.8, 98.9, 97.8, 0.7, 62, 1480, 1850],
        ['Jun 2023', 102000, 36000, 5.3, 98.6, 96.9, 0.8, 66, 1550, 1980],
        ['Maj 2023', 110000, 40000, 4.9, 98.4, 96.5, 0.9, 70, 1620, 2100],
        ['Apr 2023', 105000, 38000, 5.0, 98.7, 97.2, 0.7, 68, 1590, 2020],
        ['Mar 2023', 112000, 42000, 4.6, 98.1, 95.9, 1.0, 73, 1640, 2200],
        ['Feb 2023', 120000, 46000, 4.3, 97.5, 94.8, 1.3, 76, 1690, 2380]
    ];
    
    // Sheet 6: Parametre (Parameters for calculations)
    const parametreHeaders = currentLanguage === 'da'
        ? ['Parameter', 'Værdi', 'Enhed', 'Beskrivelse']
        : ['Parameter', 'Value', 'Unit', 'Description'];
    const parametre = [
        parametreHeaders,
        ['Standard Ordreomkostning', 250, 'DKK', 'Gennemsnitlig omkostning pr. ordre inkl. administration'],
        ['Lagerrentesats', 8, '%', 'Årlig lagerrentesats (kapital + forsikring + svind)'],
        ['Kapitalbinding', 4, '%', 'Rentesats for bundet kapital'],
        ['Forsikring', 2, '%', 'Årlig forsikringspræmie i % af lagerværdi'],
        ['Svind', 2, '%', 'Forventet årligt svind'],
        ['Lageromkostning pr. m²', 850, 'DKK/år', 'Årlig omkostning pr. kvadratmeter lagerplads'],
        ['Arbejdstime', 285, 'DKK', 'Omkostning pr. arbejdstime'],
        ['Plukketid pr. linje', 1.5, 'min', 'Gennemsnitlig tid pr. ordrelinje'],
        ['Modtagelsestid pr. palle', 8, 'min', 'Tid til modtagelse og registrering'],
        ['Afsendelsetid pr. ordre', 12, 'min', 'Tid til afsendelse inkl. dokumenter'],
        ['Sikkerhedslager A-varer', 14, 'dage', 'Sikkerhedslager i dage for A-varer'],
        ['Sikkerhedslager B-varer', 21, 'dage', 'Sikkerhedslager i dage for B-varer'],
        ['Sikkerhedslager C-varer', 30, 'dage', 'Sikkerhedslager i dage for C-varer'],
        ['Service Level Mål', 98.5, '%', 'Målsætning for serviceniveau'],
        ['On-Time Delivery Mål', 97, '%', 'Målsætning for rettidig levering']
    ];
    
    // Create workbook and add all sheets
    const wb = XLSX.utils.book_new();
    
    const ws1 = XLSX.utils.aoa_to_sheet(varelager);
    const ws2 = XLSX.utils.aoa_to_sheet(leverandorer);
    const ws3 = XLSX.utils.aoa_to_sheet(ordrehistorik);
    const ws4 = XLSX.utils.aoa_to_sheet(lagerflytninger);
    const ws5 = XLSX.utils.aoa_to_sheet(kpiMalinger);
    const ws6 = XLSX.utils.aoa_to_sheet(parametre);
    
    // Set column widths for each sheet
    ws1['!cols'] = [
        {wch: 10}, {wch: 30}, {wch: 12}, {wch: 15}, {wch: 10}, {wch: 6}, {wch: 6}, {wch: 6}, {wch: 12}, {wch: 10}, {wch: 10}, {wch: 18}, {wch: 12}, {wch: 14}, {wch: 12}, {wch: 10}, {wch: 14}, {wch: 15}, {wch: 12}
    ];
    ws2['!cols'] = [
        {wch: 14}, {wch: 28}, {wch: 18}, {wch: 25}, {wch: 16}, {wch: 22}, {wch: 12}, {wch: 14}, {wch: 10}, {wch: 18}, {wch: 16}, {wch: 10}, {wch: 8}, {wch: 6}
    ];
    ws3['!cols'] = [
        {wch: 15}, {wch: 12}, {wch: 14}, {wch: 10}, {wch: 8}, {wch: 14}, {wch: 12}, {wch: 14}, {wch: 18}, {wch: 16}, {wch: 25}
    ];
    ws4['!cols'] = [
        {wch: 10}, {wch: 12}, {wch: 10}, {wch: 10}, {wch: 14}, {wch: 14}, {wch: 8}, {wch: 12}, {wch: 14}, {wch: 12}, {wch: 25}
    ];
    ws5['!cols'] = [
        {wch: 12}, {wch: 15}, {wch: 16}, {wch: 15}, {wch: 12}, {wch: 18}, {wch: 12}, {wch: 16}, {wch: 14}, {wch: 12}
    ];
    ws6['!cols'] = [
        {wch: 28}, {wch: 10}, {wch: 10}, {wch: 50}
    ];
    
    XLSX.utils.book_append_sheet(wb, ws1, currentLanguage === 'da' ? 'Varelager' : 'Inventory');
    XLSX.utils.book_append_sheet(wb, ws2, currentLanguage === 'da' ? 'Leverandører' : 'Suppliers');
    XLSX.utils.book_append_sheet(wb, ws3, currentLanguage === 'da' ? 'Ordrehistorik' : 'Order History');
    XLSX.utils.book_append_sheet(wb, ws4, currentLanguage === 'da' ? 'Lagerflytninger' : 'Warehouse Movements');
    XLSX.utils.book_append_sheet(wb, ws5, currentLanguage === 'da' ? 'KPI Målinger' : 'KPI Metrics');
    XLSX.utils.book_append_sheet(wb, ws6, currentLanguage === 'da' ? 'Parametre' : 'Parameters');
    
    // Download the file
    XLSX.writeFile(wb, currentLanguage === 'da' ? 'Lager_og_Logistik_Eksempel.xlsx' : 'Inventory_and_Logistics_Example.xlsx');
    
    showToast(
        currentLanguage === 'da' 
            ? '📊 Komplet logistik Excel downloaded med 6 ark' 
            : '📊 Complete logistics Excel downloaded with 6 sheets',
        'success'
    );
}

// Auto-detect column mapping based on selected template
function autoMapColumns(headers) {
    if (selectedImportTemplate === 'custom' || !importTemplates[selectedImportTemplate]) {
        return null; // User selects manually
    }
    
    const template = importTemplates[selectedImportTemplate];
    const mappings = {};
    
    for (const [field, possibleNames] of Object.entries(template.columnMappings)) {
        for (const header of headers) {
            const normalizedHeader = header.toLowerCase().trim();
            if (possibleNames.some(name => normalizedHeader.includes(name.toLowerCase()))) {
                mappings[field] = header;
                break;
            }
        }
    }
    
    return mappings;
}

// ========================================
// File Upload and Parsing
// ========================================

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Store file info globally to show in fileInfo section
    currentFileName = file.name;
    currentFileSize = (file.size / 1024).toFixed(1) + ' KB';
    
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split('.').pop();
    
    if (fileExtension === 'csv') {
        parseCSV(file);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        parseExcel(file);
    } else {
        showToast(currentLanguage === 'da' ? 'Upload venligst en CSV- eller Excel-fil (.csv, .xlsx, .xls)' : 'Please upload a CSV or Excel file (.csv, .xlsx, .xls)', 'error');
    }
}

function parseCSV(file) {
    // Use FileReader to read file with proper UTF-8 encoding
    const reader = new FileReader();
    
    reader.onload = (e) => {
        let csvText = e.target.result;
        
        // Remove BOM if present (UTF-8 BOM is EF BB BF)
        if (csvText.charCodeAt(0) === 0xFEFF) {
            csvText = csvText.substring(1);
        }
        
        // Check if encoding looks corrupted (check for common encoding issues)
        const hasEncodingIssue = csvText.includes('Ã…') || csvText.includes('Ã¸') || csvText.includes('Ã¦');
        
        if (hasEncodingIssue) {
            console.warn('⚠️ Detected encoding issue, attempting to fix...');
            // Try to fix common Windows-1252 to UTF-8 issues
            csvText = csvText
                .replace(/Ã…/g, 'Å')
                .replace(/Ã¥/g, 'å')
                .replace(/Ã˜/g, 'Ø')
                .replace(/Ã¸/g, 'ø')
                .replace(/Ã†/g, 'Æ')
                .replace(/Ã¦/g, 'æ');
        }
        
        Papa.parse(csvText, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
                console.log('📊 CSV parsed:', results.data.length, 'rows');
                // Open Import Preview modal instead of direct processing
                if (results.data.length > 0) {
                    ImportPreview.open(results.data, currentFileName);
                } else {
                    showToast(currentLanguage === 'da' ? 'Ingen data fundet i filen' : 'No data found in file', 'error');
                }
            },
            error: (error) => {
                console.error('CSV parsing error:', error);
                showToast(currentLanguage === 'da' ? 'Fejl ved læsning af CSV-fil' : 'Error parsing CSV file', 'error');
            }
        });
    };
    
    reader.onerror = (error) => {
        console.error('File reading error:', error);
        showToast(currentLanguage === 'da' ? 'Fejl ved læsning af filen' : 'Error reading file', 'error');
    };
    
    // Read file as text with UTF-8 encoding
    reader.readAsText(file, 'UTF-8');
}

function parseExcel(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            // Open Import Preview modal instead of direct processing
            if (jsonData.length > 0) {
                ImportPreview.open(jsonData, currentFileName);
            } else {
                showToast(currentLanguage === 'da' ? 'Ingen data fundet i filen' : 'No data found in file', 'error');
            }
        } catch (error) {
            console.error('Excel parsing error:', error);
            showToast(currentLanguage === 'da' ? 'Fejl ved læsning af Excel-fil' : 'Error parsing Excel file', 'error');
        }
    };
    
    reader.readAsArrayBuffer(file);
}

function processUploadedData(data) {
    // Store ALL column names from the uploaded file
    if (data && data.length > 0) {
        allColumnNames = Object.keys(data[0]).map(key => key.trim()).filter(key => key);
        console.log('✅ Detected', allColumnNames.length, 'columns:', allColumnNames);
    }
    
    // Reset original column names
    originalColumnNames = {
        name: 'Item Name',
        consumption: 'Consumption', 
        price: 'Price'
    };
    
    // Filter out empty rows and normalize column names
    let detectedColumns = { name: false, consumption: false, price: false };
    
    uploadedData = data.filter(row => {
        return row && Object.keys(row).length > 0;
    }).map((row, idx) => {
        const normalizedRow = { _original: row }; // Keep original data
        
        Object.keys(row).forEach(key => {
            const normalizedKey = key.trim().toLowerCase();
            
            // Match NAME column
            if (normalizedKey.includes('vare') || normalizedKey.includes('item') || normalizedKey.includes('name') || normalizedKey.includes('produkt')) {
                normalizedRow.name = row[key];
                if (!originalColumnNames.nameSet) {
                    originalColumnNames.name = key.trim();
                    originalColumnNames.nameSet = true;
                    detectedColumns.name = true;
                    if (idx === 0) console.log(`✅ Matched NAME column: "${key}"`);
                }
            } 
            // Match CONSUMPTION column
            else if (normalizedKey.includes('forbrug') || normalizedKey.includes('consumption') || normalizedKey.includes('demand') || normalizedKey.includes('omsætning') || normalizedKey.includes('årsforbrug')) {
                normalizedRow.consumption = parseFloat(row[key]) || 0;
                if (!originalColumnNames.consumptionSet) {
                    originalColumnNames.consumption = key.trim();
                    originalColumnNames.consumptionSet = true;
                    detectedColumns.consumption = true;
                    if (idx === 0) console.log(`✅ Matched CONSUMPTION column: "${key}"`);
                }
            } 
            // Match PRICE column
            else if (normalizedKey.includes('pris') || normalizedKey.includes('price') || normalizedKey.includes('stykpris')) {
                normalizedRow.price = parseFloat(row[key]) || 0;
                if (!originalColumnNames.priceSet) {
                    originalColumnNames.price = key.trim();
                    originalColumnNames.priceSet = true;
                    detectedColumns.price = true;
                    if (idx === 0) console.log(`✅ Matched PRICE column: "${key}"`);
                }
            }
        });
        return normalizedRow;
    }).filter(row => row.name && row.consumption && row.price);
    
    if (uploadedData.length === 0) {
        // Show which columns are missing
        const missing = [];
        if (!detectedColumns.name) missing.push('Name/Varenavn');
        if (!detectedColumns.consumption) missing.push('Consumption/Årsforbrug');
        if (!detectedColumns.price) missing.push('Price/Pris');
        
        let msg;
        if (missing.length > 0) {
            msg = currentLanguage === 'da' 
                ? `❌ Kunne ikke finde påkrævede kolonner: ${missing.join(', ')}. Detekterede kolonner: ${allColumnNames.join(', ')}` 
                : `❌ Could not find required columns: ${missing.join(', ')}. Detected columns: ${allColumnNames.join(', ')}`;
        } else {
            msg = currentLanguage === 'da' 
                ? 'Ingen gyldig data fundet. Kontroller at filen har kolonnerne: Varenavn, Årsforbrug, Pris' 
                : 'No valid data found. Please ensure your file has columns: Item Name, Consumption, Price';
        }
        showToast(msg, 'error');
        console.error('❌ Import failed. Detected columns:', allColumnNames);
        return;
    }
    
    console.log('✅ Successfully imported', uploadedData.length, 'rows');
    
    // Show file info and enable process button with filename and size
    const fileInfoDiv = document.getElementById('fileInfo');
    const fileNameSpan = document.getElementById('fileName');
    const fileSizeSpan = document.getElementById('fileSize');
    const fileRowsSpan = document.getElementById('fileRows');
    const processBtn = document.getElementById('processBtn');
    
    if (fileInfoDiv) {
        fileInfoDiv.classList.remove('hidden');
    }
    if (fileNameSpan && currentFileName) {
        fileNameSpan.textContent = currentFileName;
    }
    if (fileSizeSpan && currentFileSize) {
        fileSizeSpan.textContent = currentFileSize;
    }
    if (fileRowsSpan) {
        fileRowsSpan.textContent = uploadedData.length;
    }
    if (processBtn) {
        processBtn.disabled = false;
    }
    
    // === ENHANCEMENT: Data Quality Score ===
    if (window.UploadEnhancements && UploadEnhancements.qualityScore) {
        const quality = UploadEnhancements.qualityScore.calculate(uploadedData);
        const qualityContainer = document.getElementById('dataQualityScore');
        if (qualityContainer) {
            qualityContainer.innerHTML = UploadEnhancements.qualityScore.render(quality);
        } else if (fileInfoDiv) {
            // Create container if it doesn't exist
            const newContainer = document.createElement('div');
            newContainer.id = 'dataQualityScore';
            newContainer.innerHTML = UploadEnhancements.qualityScore.render(quality);
            fileInfoDiv.appendChild(newContainer);
        }
    }
    
    // === ENHANCEMENT: Remember Column Mappings ===
    if (window.UploadEnhancements && currentFileName) {
        const savedMappings = UploadEnhancements.columnMappings.load(currentFileName);
        if (savedMappings) {
            console.log('📋 Loaded saved column mappings for:', currentFileName);
            // Apply saved mappings if available
        }
        // Save current mappings for next time
        UploadEnhancements.columnMappings.save(currentFileName, {
            name: originalColumnNames.name,
            consumption: originalColumnNames.consumption,
            price: originalColumnNames.price
        });
    }
    
    // Minimize upload section after successful upload
    minimizeUploadSection();
    
    // Initialize visible columns (all columns selected by default)
    initializeColumnVisibility();
    
    displayPreview();
}

// Column Visibility Functions
function initializeColumnVisibility() {
    if (allColumnNames.length === 0) return;
    
    // By default, show all columns
    visibleColumns = [...allColumnNames];
    
    const section = document.getElementById('columnVisibilitySection');
    const checkboxContainer = document.getElementById('columnCheckboxes');
    
    if (!section || !checkboxContainer) return;
    
    // Build checkboxes for each column
    checkboxContainer.innerHTML = allColumnNames.map(colName => `
        <label class="flex items-center gap-2 p-2 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors">
            <input type="checkbox" 
                   value="${colName}" 
                   checked 
                   onchange="toggleColumnVisibility('${colName}', this.checked)"
                   class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500">
            <span class="text-sm text-gray-700 dark:text-gray-200">${colName}</span>
        </label>
    `).join('');
    
    section.classList.remove('hidden');
}

function toggleColumnVisibility(columnName, isVisible) {
    if (isVisible) {
        if (!visibleColumns.includes(columnName)) {
            // Insert column back at its original position
            const originalIndex = allColumnNames.indexOf(columnName);
            
            // Find the correct position in visibleColumns based on original order
            let insertIndex = 0;
            for (let i = 0; i < visibleColumns.length; i++) {
                const visColIndex = allColumnNames.indexOf(visibleColumns[i]);
                if (visColIndex > originalIndex) {
                    break;
                }
                insertIndex++;
            }
            
            visibleColumns.splice(insertIndex, 0, columnName);
        }
    } else {
        visibleColumns = visibleColumns.filter(col => col !== columnName);
    }
    
    // Refresh displays
    if (uploadedData.length > 0) {
        displayPreview();
    }
    if (abcResults.length > 0) {
        displayResults();
    }
    if (doubleABCResults && doubleABCResults.length > 0) {
        displayDoubleABCResults();
    }
}

function selectAllColumns() {
    visibleColumns = [...allColumnNames];
    document.querySelectorAll('#columnCheckboxes input[type="checkbox"]').forEach(cb => {
        cb.checked = true;
    });
    
    // Refresh displays
    if (uploadedData.length > 0) displayPreview();
    if (abcResults.length > 0) displayResults();
    if (doubleABCResults && doubleABCResults.length > 0) displayDoubleABCResults();
    
    showToast(currentLanguage === 'da' ? 'Alle kolonner valgt' : 'All columns selected', 'success');
}

function deselectAllColumns() {
    visibleColumns = [];
    document.querySelectorAll('#columnCheckboxes input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    
    // Refresh displays
    if (uploadedData.length > 0) displayPreview();
    if (abcResults.length > 0) displayResults();
    if (doubleABCResults && doubleABCResults.length > 0) displayDoubleABCResults();
    
    showToast(currentLanguage === 'da' ? 'Alle kolonner fravalgt' : 'All columns deselected', 'info');
}

function displayPreview(showAll = false) {
    const previewSection = document.getElementById('previewSection');
    const previewTable = document.getElementById('previewTable');
    
    // Get columns to display
    const columnsToShow = visibleColumns.length > 0 ? visibleColumns : allColumnNames;
    const hasColumns = columnsToShow && columnsToShow.length > 0;
    
    // Create table headers dynamically based on visible columns
    const headers = hasColumns 
        ? columnsToShow.map(col => `<th>${col}</th>`).join('')
        : `<th>${t('item-name')}</th><th>${t('consumption')}</th><th>${t('price')}</th>`;
    
    const thead = `
        <thead>
            <tr>${headers}</tr>
        </thead>
    `;
    
    // Determine how many rows to show
    const rowsToShow = showAll ? uploadedData : uploadedData.slice(0, 5);
    
    // Create table rows dynamically based on visible columns
    const tbody = `
        <tbody>
            ${rowsToShow.map(row => {
                if (hasColumns && row._original) {
                    const cells = columnsToShow.map(col => {
                        const value = row._original[col];
                        const displayValue = typeof value === 'number' 
                            ? value.toLocaleString(currentLanguage === 'da' ? 'da-DK' : 'en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2})
                            : (value || '');
                        return `<td>${displayValue}</td>`;
                    }).join('');
                    return `<tr>${cells}</tr>`;
                } else {
                    return `
                        <tr>
                            <td>${row.name}</td>
                            <td>${row.consumption.toFixed(2)}</td>
                            <td>${row.price.toFixed(2)}</td>
                        </tr>
                    `;
                }
            }).join('')}
            ${!showAll && uploadedData.length > 5 ? `
                <tr>
                    <td colspan="${hasColumns ? columnsToShow.length : 3}" class="text-center">
                        <button onclick="displayPreview(true)" class="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium">
                            ... vis alle ${uploadedData.length} rækker
                        </button>
                    </td>
                </tr>
            ` : ''}
            ${showAll && uploadedData.length > 5 ? `
                <tr>
                    <td colspan="${hasColumns ? columnsToShow.length : 3}" class="text-center">
                        <button onclick="displayPreview(false)" class="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium">
                            vis færre
                        </button>
                    </td>
                </tr>
            ` : ''}
        </tbody>
    `;
    
    previewTable.innerHTML = thead + tbody;
    previewSection.classList.remove('hidden');
}

// ========================================
// ABC Analysis
// ========================================

function processABCAnalysis() {
    if (uploadedData.length === 0) return;
    
    // Show loading spinner
    showLoadingSpinner('Analyzing data...');
    
    // Use setTimeout to allow UI to update
    setTimeout(() => {
        try {
            // Run quality check
            const quality = validateDataQuality(uploadedData);
            displayQualityCheck(quality);
            
            // Get custom thresholds
            const thresholds = getABCThresholds();
            
            // Calculate value for each item
            const dataWithValues = uploadedData.map(item => ({
                ...item,
                value: item.consumption * item.price
            }));
            
            // Sort by value (descending)
            dataWithValues.sort((a, b) => b.value - a.value);
            
            // Calculate cumulative values
            const totalValue = dataWithValues.reduce((sum, item) => sum + item.value, 0);
            let cumulativeValue = 0;
            
            abcResults = dataWithValues.map(item => {
                cumulativeValue += item.value;
                const cumulativePercent = (cumulativeValue / totalValue) * 100;
                
                // Assign group using custom thresholds
                let group;
                if (cumulativePercent <= thresholds.A) {
                    group = 'A';
                } else if (cumulativePercent <= thresholds.A + thresholds.B) {
                    group = 'B';
                } else {
                    group = 'C';
                }
                
                return {
                    ...item,
                    cumulativePercent: cumulativePercent,
                    group: group
                };
            });
            
            // Reset pagination for new analysis
            currentVisibleRows = 200;
            
            // Show performance info for large datasets
            showPerformanceInfo();
            
            displayResults();
            updateDashboard();
            
            // Save to localStorage
            saveDataToStorage();
            
            // Track ABC analysis for enhancements
            if (window.DashboardEnhancements) {
                DashboardEnhancements.suggestions.trackUsage(currentLanguage === 'da' ? 'ABC Analyse' : 'ABC Analysis');
            }
            
            // Store data for matrix drill-down
            window.currentABCData = abcResults;
            
            // Add to session history
            if (window.CrossFeatureEnhancements) {
                const counts = { A: 0, B: 0, C: 0 };
                abcResults.forEach(item => counts[item.group]++);
                CrossFeatureEnhancements.sessionHistory.add('abc', { counts, total: abcResults.length }, 
                    `ABC: ${abcResults.length} items (A:${counts.A}, B:${counts.B}, C:${counts.C})`);
            }
        } finally {
            hideLoadingSpinner();
        }
    }, 50);
}

function displayResults() {
    const resultsSection = document.getElementById('resultsSection');
    const resultsTable = document.getElementById('resultsTable');
    
    // Determine if EOQ columns should be shown
    const hasEOQ = abcResults.some(item => item.eoq !== undefined);
    
    // Use pagination for large datasets (>200 rows)
    const usePagination = abcResults.length > 200;
    const visibleRows = usePagination ? Math.min(currentVisibleRows, abcResults.length) : abcResults.length;
    
    // Get all original column names from the first item with _original data
    let originalColumns = [];
    const firstItemWithOriginal = abcResults.find(item => item._original);
    if (firstItemWithOriginal && firstItemWithOriginal._original) {
        const allCols = Object.keys(firstItemWithOriginal._original);
        originalColumns = visibleColumns.length > 0 ? visibleColumns.filter(col => allCols.includes(col)) : allCols;
    }
    
    // Create table headers - show ALL original columns plus ABC results
    const originalHeaders = originalColumns.length > 0 
        ? originalColumns.map(col => `<th>${col}</th>`).join('')
        : `<th>${t('item-name')}</th><th>${t('consumption')}</th><th>${t('price')}</th>`;
    
    const thead = `
        <thead>
            <tr>
                ${originalHeaders}
                <th>${t('value')}</th>
                <th>${t('cumulative')}</th>
                <th>${t('group')}</th>
                ${hasEOQ ? '<th>EOQ</th><th>' + t('orders-per-year-label') + '</th>' : ''}
                <th>Info</th>
            </tr>
        </thead>
    `;
    
    // Calculate total value for percentage calculations
    const totalValue = abcResults.reduce((sum, item) => sum + item.value, 0);
    
    // Create table rows with info buttons - only render visible rows for performance
    const rowsToRender = usePagination ? abcResults.slice(0, visibleRows) : abcResults;
    const tbody = `
        <tbody>
            ${rowsToRender.map((row, index) => {
                const valuePercent = ((row.value / totalValue) * 100).toFixed(2);
                const rank = index + 1;
                const eoqColumns = hasEOQ && row.eoq ? `
                    <td class="font-bold text-purple-600 dark:text-purple-400">${row.eoq.toFixed(2)}</td>
                    <td>${row.ordersPerYear ? row.ordersPerYear.toFixed(2) : '-'}</td>
                ` : hasEOQ ? '<td>-</td><td>-</td>' : '';
                
                // Build cells for all original columns
                let originalCells = '';
                if (row._original && originalColumns.length > 0) {
                    originalCells = originalColumns.map(col => {
                        const value = row._original[col];
                        let displayValue = '';
                        if (value === null || value === undefined) {
                            displayValue = '';
                        } else if (typeof value === 'number') {
                            displayValue = value.toLocaleString(currentLanguage === 'da' ? 'da-DK' : 'en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2});
                        } else {
                            displayValue = value;
                        }
                        return `<td>${displayValue}</td>`;
                    }).join('');
                } else {
                    // Fallback to basic columns
                    originalCells = `
                        <td class="font-medium">${row.name}</td>
                        <td>${row.consumption.toFixed(2)}</td>
                        <td>${row.price.toFixed(2)}</td>
                    `;
                }
                
                // Calculate confidence score for this item's classification
                const confidenceScore = calculateClassificationConfidence(row, index, totalValue);
                const confidenceClass = confidenceScore >= 90 ? 'high' : confidenceScore >= 70 ? 'medium' : 'low';
                const confidenceColor = confidenceScore >= 90 ? 'text-green-600' : confidenceScore >= 70 ? 'text-yellow-600' : 'text-red-600';
                
                return `
                <tr>
                    ${originalCells}
                    <td>${row.value.toFixed(2)}</td>
                    <td>${row.cumulativePercent.toFixed(2)}%</td>
                    <td>
                        <div class="flex items-center gap-1">
                            <span class="group-badge group-${row.group}">${row.group}</span>
                            <span class="confidence-indicator ${confidenceClass}" title="${currentLanguage === 'da' ? 'Klassificerings-konfidens' : 'Classification confidence'}: ${confidenceScore}%">
                                <span class="text-xs ${confidenceColor}">${confidenceScore >= 90 ? '●' : confidenceScore >= 70 ? '◐' : '○'}</span>
                            </span>
                        </div>
                    </td>
                    ${eoqColumns}
                    <td>
                        <button onclick="showItemDetails(${index})" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xl" title="${currentLanguage === 'da' ? 'Se detaljer' : 'View details'}">
                            ℹ️
                        </button>
                    </td>
                </tr>
            `;
            }).join('')}
            ${usePagination && visibleRows < abcResults.length ? `
                <tr>
                    <td colspan="${originalColumns.length > 0 ? originalColumns.length + 3 + (hasEOQ ? 3 : 1) : (hasEOQ ? '9' : '7')}" class="text-center py-4 bg-gray-50 dark:bg-gray-700">
                        <div class="flex items-center justify-center gap-4">
                            <span class="text-gray-600 dark:text-gray-300 font-medium">
                                ${translations[currentLanguage]['showing'] || 'Showing'} ${visibleRows.toLocaleString()} ${translations[currentLanguage]['of'] || 'of'} ${abcResults.length.toLocaleString()}
                            </span>
                            <button onclick="loadMoreResults(100)" class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition-colors shadow">
                                +100
                            </button>
                            <button onclick="loadMoreResults(1000)" class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-medium transition-colors shadow">
                                +1,000
                            </button>
                            <button onclick="loadMoreResults(5000)" class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded font-medium transition-colors shadow">
                                +5,000
                            </button>
                            <button onclick="loadAllResults()" class="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded font-medium transition-colors shadow">
                                🚀 ${translations[currentLanguage]['load-all'] || 'All'} (${(abcResults.length - visibleRows).toLocaleString()})
                            </button>
                        </div>
                    </td>
                </tr>
            ` : ''}
        </tbody>
    `;
    
    resultsTable.innerHTML = thead + tbody;
    resultsSection.classList.remove('hidden');
    
    // Update EOQ dropdown counts
    updateEOQDropdownCounts();
    
    // Render chart with debounce
    const chartType = document.getElementById('chartTypeSelect').value;
    debouncedRenderChart(chartType);
}

// Pagination support (optimized for up to 100k+ items)
let currentVisibleRows = 200;

function showPerformanceInfo() {
    const banner = document.getElementById('performanceBanner');
    const message = document.getElementById('perfMessage');
    
    if (!banner || !message) return;
    
    const totalItems = abcResults.length;
    
    if (totalItems > 10000) {
        banner.classList.remove('hidden');
        const chartSampling = totalItems > 500 ? (currentLanguage === 'da' ? ` Grafik viser ~500 samplingsepunkter.` : ` Charts show ~500 sampling points.`) : '';
        message.textContent = currentLanguage === 'da'
            ? `⚡ Stort datasæt: ${totalItems.toLocaleString()} varer. Viser første 200 rækker.${chartSampling} Brug +100/+1.000/+5.000 knapperne nedenfor for at indlæse mere.`
            : `⚡ Large dataset: ${totalItems.toLocaleString()} items. Showing first 200 rows.${chartSampling} Use the +100/+1,000/+5,000 buttons below to load more.`;
    } else if (totalItems > 1000) {
        banner.classList.remove('hidden');
        message.textContent = currentLanguage === 'da'
            ? `Datasæt: ${totalItems.toLocaleString()} varer. Viser første 200 rækker for hurtig indlæsning. Brug knapperne nedenfor for at indlæse mere.`
            : `Dataset: ${totalItems.toLocaleString()} items. Showing first 200 rows for fast loading. Use buttons below to load more.`;
    } else {
        banner.classList.add('hidden');
    }
}

function loadMoreResults(amount = 50) {
    currentVisibleRows += amount;
    if (currentVisibleRows > abcResults.length) {
        currentVisibleRows = abcResults.length;
    }
    displayResults();
    showToast(`${translations[currentLanguage]['loaded'] || 'Loaded'} ${amount} ${translations[currentLanguage]['more-items'] || 'more items'}`, 'success');
}

function loadAllResults() {
    const remaining = abcResults.length - currentVisibleRows;
    currentVisibleRows = abcResults.length;
    displayResults();
    showToast(`${translations[currentLanguage]['loaded'] || 'Loaded'} ${remaining.toLocaleString()} ${translations[currentLanguage]['items'] || 'items'}`, 'success');
}

// Debounced chart rendering for performance
let chartRenderTimeout;
function debouncedRenderChart(chartType) {
    clearTimeout(chartRenderTimeout);
    chartRenderTimeout = setTimeout(() => {
        renderABCChart(chartType);
    }, 150);
}

// ========================================
// ABC Charts
// ========================================

function renderABCChart(chartType) {
    const canvas = document.getElementById('abcChart');
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart
    if (currentChart) {
        currentChart.destroy();
    }
    
    if (chartType === 'pareto') {
        renderParetoChart(ctx);
    } else if (chartType === 'pie') {
        renderPieChart(ctx);
    }
}

function renderParetoChart(ctx) {
    // Sample data for large datasets to improve chart performance
    // For 100k+ items, use aggressive sampling
    const maxChartPoints = abcResults.length > 50000 ? 200 : (abcResults.length > 10000 ? 300 : 500);
    let chartData = abcResults;
    
    if (abcResults.length > maxChartPoints) {
        // Sample every Nth item to reduce to target points
        const step = Math.ceil(abcResults.length / maxChartPoints);
        chartData = abcResults.filter((_, index) => index % step === 0);
        if (abcResults.length > 10000) {
            console.log(`📊 Chart optimized: ${chartData.length} sampled points from ${abcResults.length.toLocaleString()} items`);
        }
    }
    
    const labels = chartData.map(item => item.name);
    const values = chartData.map(item => item.value);
    const cumulativePercents = chartData.map(item => item.cumulativePercent);
    
    // Determine colors based on theme
    const isDark = currentTheme === 'dark';
    const textColor = isDark ? '#f9fafb' : '#1f2937';
    const gridColor = isDark ? '#374151' : '#e5e7eb';
    
    currentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    type: 'bar',
                    label: t('value'),
                    data: values,
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    type: 'line',
                    label: t('cumulative'),
                    data: cumulativePercents,
                    borderColor: 'rgba(239, 68, 68, 1)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: t('pareto-title'),
                    color: textColor,
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    labels: { color: textColor }
                }
            },
            scales: {
                x: {
                    ticks: { 
                        color: textColor,
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: { color: gridColor }
                },
                y: {
                    type: 'linear',
                    position: 'left',
                    ticks: { color: textColor },
                    grid: { color: gridColor },
                    title: {
                        display: true,
                        text: t('value'),
                        color: textColor
                    }
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    min: 0,
                    max: 100,
                    ticks: { 
                        color: textColor,
                        callback: value => value + '%'
                    },
                    grid: { drawOnChartArea: false },
                    title: {
                        display: true,
                        text: t('cumulative'),
                        color: textColor
                    }
                }
            }
        }
    });
}

function renderPieChart(ctx) {
    // Count items in each group
    const groupCounts = {
        A: abcResults.filter(item => item.group === 'A').length,
        B: abcResults.filter(item => item.group === 'B').length,
        C: abcResults.filter(item => item.group === 'C').length
    };
    
    const isDark = currentTheme === 'dark';
    const textColor = isDark ? '#f9fafb' : '#1f2937';
    
    currentChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Group A', 'Group B', 'Group C'],
            datasets: [{
                data: [groupCounts.A, groupCounts.B, groupCounts.C],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(251, 191, 36, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderColor: [
                    'rgba(34, 197, 94, 1)',
                    'rgba(251, 191, 36, 1)',
                    'rgba(239, 68, 68, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: t('pie-title'),
                    color: textColor,
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    labels: { color: textColor }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} items (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// ========================================
// Download Results
// ========================================

function downloadResultsCSV() {
    if (abcResults.length === 0) {
        showToast(currentLanguage === 'da' ? 'Ingen data at eksportere' : 'No data to export', 'warning');
        return;
    }
    
    // Get all unique column names from original data
    const allColumns = new Set();
    abcResults.forEach(item => {
        if (item._original) {
            Object.keys(item._original).forEach(key => allColumns.add(key));
        }
    });
    
    // Add ABC analysis columns
    allColumns.add(t('value'));
    allColumns.add(t('cumulative'));
    allColumns.add(t('group'));
    
    // Create CSV headers
    const headers = Array.from(allColumns).map(col => `"${col}"`).join(',') + '\n';
    
    // Create CSV rows with all columns
    const rows = abcResults.map(row => {
        const values = [];
        allColumns.forEach(col => {
            if (col === t('value')) {
                values.push(row.value ? row.value.toFixed(2) : '');
            } else if (col === t('cumulative')) {
                values.push(row.cumulativePercent ? row.cumulativePercent.toFixed(2) : (row.cumulative || ''));
            } else if (col === t('group')) {
                values.push(row.group || '');
            } else if (row._original && row._original[col] !== undefined) {
                const val = row._original[col];
                values.push(typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val);
            } else {
                values.push('');
            }
        });
        return values.join(',');
    });
    
    const csvContent = headers + rows.join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `abc_analysis_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast(currentLanguage === 'da' ? 'CSV fil downloadet!' : 'CSV file downloaded!', 'success');
}

function downloadResultsExcel() {
    if (abcResults.length === 0) {
        showToast(currentLanguage === 'da' ? 'Ingen data at eksportere' : 'No data to export', 'warning');
        return;
    }
    
    exportToExcel();
}

// ========================================
// Wilson (EOQ) Calculation
// ========================================

function calculateWilson() {
    // Hent værdier fra input-felter
    const aarsforbrug = parseFloat(document.getElementById('demandInput').value);
    const ordreomkostninger = parseFloat(document.getElementById('orderCostInput').value);
    const pris = parseFloat(document.getElementById('priceInput').value);
    const rentePercent = parseFloat(document.getElementById('interestInput').value);
    
    // Validering
    if (isNaN(aarsforbrug) || isNaN(ordreomkostninger) || isNaN(pris) || isNaN(rentePercent)) {
        alert(translate('alert-invalid-numbers') || 'Indtast venligst gyldige tal i alle felter.');
        return;
    }
    
    if (aarsforbrug <= 0 || ordreomkostninger <= 0 || pris <= 0 || rentePercent <= 0) {
        alert(translate('alert-positive-values') || 'Alle værdier skal være positive tal større end nul.');
        return;
    }
    
    if (rentePercent > 100) {
        alert(translate('alert-interest-limit') || 'Renten kan ikke være over 100%');
        return;
    }
    
    // Omregn rente fra procent til decimaltal (f.eks. 5% -> 0.05)
    const rente = rentePercent / 100;
    
    // Wilson formel: Q* = √[(2 × Årsforbrug × Ordreomkostninger) / (Pris × Rente)]
    // Trin 1: Beregn tælleren (2 × Årsforbrug × Ordreomkostninger)
    const taeller = 2 * aarsforbrug * ordreomkostninger;
    
    // Trin 2: Beregn nævneren (Pris × Rente)
    const naevner = pris * rente;
    
    // Trin 3: Del tælleren med nævneren
    const x = taeller / naevner;
    
    // Trin 4: Tag kvadratroden af x for at få den optimale indkøbsmængde (Q*)
    const EOQ = Math.sqrt(x);
    
    // Beregn andre værdier
    const ordersPerYear = aarsforbrug / EOQ;
    const holdingCostTotal = (EOQ / 2) * pris * rente;
    const orderCostTotal = ordersPerYear * ordreomkostninger;
    const totalCost = holdingCostTotal + orderCostTotal;
    
    // Vis beregningen i formlen
    const formulaCalc = document.getElementById('formulaCalculation');
    if (formulaCalc) {
        const step1 = translations[currentLanguage]['wilson-step-1'];
        const step2 = translations[currentLanguage]['wilson-step-2'];
        const step3 = translations[currentLanguage]['wilson-step-3'];
        const step4 = translations[currentLanguage]['wilson-step-4'];
        
        formulaCalc.innerHTML = `
            <div class="space-y-1">
                <div class="text-xs text-gray-700 dark:text-gray-300">
                    <strong>1:</strong> ${step1}: 2 × ${aarsforbrug} × ${ordreomkostninger} = ${taeller.toFixed(2)}
                </div>
                <div class="text-xs text-gray-700 dark:text-gray-300">
                    <strong>2:</strong> ${step2}: ${pris} × ${rente.toFixed(3)} = ${naevner.toFixed(2)}
                </div>
                <div class="text-xs text-gray-700 dark:text-gray-300">
                    <strong>3:</strong> ${step3}: ${taeller.toFixed(2)} / ${naevner.toFixed(2)} = ${x.toFixed(2)}
                </div>
                <div class="text-xs text-gray-700 dark:text-gray-300">
                    <strong>4:</strong> ${step4}: √${x.toFixed(2)} = <strong class="text-purple-600 dark:text-purple-400">${EOQ.toFixed(2)}</strong>
                </div>
            </div>
        `;
    }
    
    // Vis resultater
    document.getElementById('eoqValue').textContent = EOQ.toFixed(2);
    document.getElementById('ordersPerYear').textContent = ordersPerYear.toFixed(2);
    document.getElementById('holdingTotal').textContent = holdingCostTotal.toFixed(2);
    document.getElementById('orderTotal').textContent = orderCostTotal.toFixed(2);
    document.getElementById('totalCost').textContent = totalCost.toFixed(2);
    
    // Validering: Ved EOQ skal lageromkostning = ordreomkostning
    const costDifference = Math.abs(holdingCostTotal - orderCostTotal);
    if (costDifference < 0.01) {
        console.log('✓ Wilson EOQ valideret: Lageromkostning = Ordreomkostning');
    }
    
    // Mark that calculation has been performed and show results
    wilsonCalculated = true;
    document.getElementById('wilsonResults').classList.remove('hidden');
    
    // Enable add scenario button
    const addScenarioBtn = document.getElementById('addScenarioBtn');
    if (addScenarioBtn) addScenarioBtn.disabled = false;
    
    // Add sensitivity analysis if enhancement is available
    if (window.EOQEnhancements && EOQEnhancements.sensitivityAnalysis) {
        const sensitivityContainer = document.getElementById('sensitivityAnalysis');
        if (sensitivityContainer) {
            const results = EOQEnhancements.sensitivityAnalysis.calculate(EOQ, aarsforbrug, ordreomkostninger, pris * rente);
            sensitivityContainer.innerHTML = EOQEnhancements.sensitivityAnalysis.renderTable(results, EOQ);
        }
    }
    
    // Track feature usage for suggestions
    if (window.DashboardEnhancements) {
        DashboardEnhancements.suggestions.trackUsage(currentLanguage === 'da' ? 'Wilson EOQ' : 'Wilson EOQ');
    }
    
    // Add to session history
    if (window.CrossFeatureEnhancements) {
        CrossFeatureEnhancements.sessionHistory.add('wilson', { eoq: EOQ, demand: aarsforbrug, orderCost: ordreomkostninger }, 
            `EOQ: ${EOQ.toFixed(0)} (D=${aarsforbrug})`);
    }
}

// Track if Wilson calculation has been performed
let wilsonCalculated = false;

// Wilson Slider Sync Functions
function syncWilsonSlider(field, value) {
    const slider = document.getElementById(`${field}Slider`);
    if (!slider) return;
    
    const numValue = parseFloat(value) || 0;
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    
    // Clamp value to slider range
    const clampedValue = Math.max(min, Math.min(max, numValue));
    slider.value = clampedValue;
}

function syncWilsonInput(field, value) {
    const input = document.getElementById(`${field}Input`);
    if (!input) return;
    
    const numValue = parseFloat(value) || 0;
    input.value = numValue;
    
    // === ENHANCEMENT: Real-time calculation if enabled ===
    if (window.EOQEnhancements && EOQEnhancements.realtimeSliders.enabled) {
        clearTimeout(EOQEnhancements.realtimeSliders.debounceTimer);
        EOQEnhancements.realtimeSliders.debounceTimer = setTimeout(() => {
            calculateWilson();
        }, 150);
    }
}

// Toggle real-time slider mode (Enhancement)
function toggleRealtimeSliders(enabled) {
    if (window.EOQEnhancements) {
        EOQEnhancements.realtimeSliders.toggle(enabled);
        showToast(
            enabled 
                ? (currentLanguage === 'da' ? 'Realtidsberegning aktiveret' : 'Real-time calculation enabled')
                : (currentLanguage === 'da' ? 'Realtidsberegning deaktiveret' : 'Real-time calculation disabled'),
            'info'
        );
    }
}

// Initialize real-time toggle state on page load
function initRealtimeSliders() {
    if (window.EOQEnhancements) {
        const isEnabled = EOQEnhancements.realtimeSliders.isEnabled();
        const toggle = document.getElementById('realtimeSliderToggle');
        if (toggle) toggle.checked = isEnabled;
        EOQEnhancements.realtimeSliders.enabled = isEnabled;
    }
}

// Wilson Scenario Management
let wilsonScenarios = [];

function addWilsonScenario() {
    const aarsforbrug = parseFloat(document.getElementById('demandInput').value);
    const ordreomkostninger = parseFloat(document.getElementById('orderCostInput').value);
    const pris = parseFloat(document.getElementById('priceInput').value);
    const rentePercent = parseFloat(document.getElementById('interestInput').value);
    const eoqValue = document.getElementById('eoqValue').textContent;
    const totalCost = document.getElementById('totalCost').textContent;
    
    if (!eoqValue || eoqValue === '-') {
        showToast(currentLanguage === 'da' ? 'Beregn EOQ først' : 'Calculate EOQ first', 'warning');
        return;
    }
    
    const scenario = {
        id: Date.now(),
        name: `Scenarie ${wilsonScenarios.length + 1}`,
        demand: aarsforbrug,
        orderCost: ordreomkostninger,
        price: pris,
        interest: rentePercent,
        eoq: parseFloat(eoqValue),
        totalCost: parseFloat(totalCost.replace(/[^\d.-]/g, ''))
    };
    
    wilsonScenarios.push(scenario);
    updateScenarioTable();
    showToast(currentLanguage === 'da' ? 'Scenarie tilføjet!' : 'Scenario added!', 'success');
}

function updateScenarioTable() {
    const section = document.getElementById('scenarioComparison');
    const tbody = document.getElementById('scenarioTableBody');
    const clearBtn = document.getElementById('clearScenariosBtn');
    
    if (wilsonScenarios.length === 0) {
        section.classList.add('hidden');
        if (clearBtn) clearBtn.classList.add('hidden');
        return;
    }
    
    section.classList.remove('hidden');
    if (clearBtn) clearBtn.classList.remove('hidden');
    
    // Find best scenario (lowest total cost)
    const bestScenario = wilsonScenarios.reduce((best, current) => 
        current.totalCost < best.totalCost ? current : best
    );
    
    tbody.innerHTML = wilsonScenarios.map(scenario => {
        const isBest = scenario.id === bestScenario.id;
        const rowClass = isBest ? 'bg-green-50 dark:bg-green-900/20' : '';
        
        return `
            <tr class="${rowClass}">
                <td class="font-medium">
                    ${scenario.name} ${isBest ? '⭐' : ''}
                </td>
                <td>${scenario.demand.toLocaleString()}</td>
                <td>${scenario.orderCost.toLocaleString()}</td>
                <td>${scenario.price.toLocaleString()}</td>
                <td>${scenario.interest}%</td>
                <td class="font-bold text-purple-600 dark:text-purple-400">${scenario.eoq.toFixed(2)}</td>
                <td class="font-bold">${scenario.totalCost.toLocaleString()}</td>
                <td>
                    <button onclick="removeScenario(${scenario.id})" class="text-red-500 hover:text-red-700 text-sm">
                        ✕
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function removeScenario(id) {
    wilsonScenarios = wilsonScenarios.filter(s => s.id !== id);
    updateScenarioTable();
}

function clearWilsonScenarios() {
    if (!confirm(currentLanguage === 'da' ? 'Ryd alle scenarier?' : 'Clear all scenarios?')) {
        return;
    }
    wilsonScenarios = [];
    wilsonCalculated = false;
    updateScenarioTable();
}

// Batch Wilson Calculation
function showBatchWilsonPanel() {
    const panel = document.getElementById('batchWilsonPanel');
    panel.classList.toggle('hidden');
}

function runBatchWilsonCalculation() {
    // Use selected items if available from EOQ dropdown, otherwise use all ABC results
    const itemsToCalculate = window.eoqSelectedItems || abcResults;
    const classLabel = window.eoqSelectedClasses ? window.eoqSelectedClasses.join('+') : 'All';
    
    if (!itemsToCalculate || itemsToCalculate.length === 0) {
        showToast(currentLanguage === 'da' ? 'Ingen data at beregne' : 'No data to calculate', 'warning');
        return;
    }
    
    const orderCost = parseFloat(document.getElementById('batchOrderCost').value);
    const interestPercent = parseFloat(document.getElementById('batchInterest').value);
    
    if (isNaN(orderCost) || isNaN(interestPercent) || orderCost <= 0 || interestPercent <= 0) {
        showToast(currentLanguage === 'da' ? 'Indtast gyldige værdier' : 'Enter valid values', 'error');
        return;
    }
    
    const interest = interestPercent / 100;
    const results = [];
    
    // Calculate EOQ for each item
    itemsToCalculate.forEach(item => {
        const D = item.consumption || item.demand || 0;
        const S = orderCost;
        const price = item.price || item.unitCost || 0;
        const H = price * interest;
        
        if (D > 0 && H > 0) {
            // Wilson formula: Q* = √[(2 × D × S) / H]
            const EOQ = Math.sqrt((2 * D * S) / H);
            const ordersPerYear = D / EOQ;
            const avgInventory = EOQ / 2;
            const totalOrderCost = ordersPerYear * S;
            const totalHoldingCost = avgInventory * H;
            const totalCost = totalOrderCost + totalHoldingCost;
            
            // Store results in item
            item.eoq = EOQ;
            item.ordersPerYear = ordersPerYear;
            
            results.push({
                name: item.name || item.id || 'Unknown',
                group: item.group || '-',
                demand: D,
                price: price,
                eoq: EOQ,
                ordersPerYear: ordersPerYear,
                totalCost: totalCost
            });
        }
    });
    
    // Display inline results
    displayBatchEOQResults(results, classLabel);
    
    // Also update the main table if using all items
    if (!window.eoqSelectedItems) {
        displayResults();
    }
    
    // Save to localStorage
    saveDataToStorage();
    
    showToast(
        currentLanguage === 'da' 
            ? `✅ EOQ beregnet for ${results.length} ${classLabel}-varer!` 
            : `✅ EOQ calculated for ${results.length} ${classLabel}-items!`, 
        'success'
    );
}

// Display batch EOQ results inline
function displayBatchEOQResults(results, classLabel) {
    const resultsDiv = document.getElementById('batchWilsonResults');
    if (!resultsDiv || results.length === 0) return;
    
    // Summary stats
    const totalItems = results.length;
    const avgEOQ = results.reduce((sum, r) => sum + r.eoq, 0) / totalItems;
    const avgOrdersPerYear = results.reduce((sum, r) => sum + r.ordersPerYear, 0) / totalItems;
    const totalAnnualCost = results.reduce((sum, r) => sum + r.totalCost, 0);
    
    // Sort by EOQ descending
    results.sort((a, b) => b.eoq - a.eoq);
    
    // Take top 10 for display
    const topResults = results.slice(0, 10);
    const hasMore = results.length > 10;
    
    resultsDiv.innerHTML = `
        <div class="border-t border-purple-200 dark:border-purple-700 pt-4">
            <div class="flex items-center justify-between mb-3">
                <h5 class="font-semibold text-purple-800 dark:text-purple-200">
                    📊 ${currentLanguage === 'da' ? 'EOQ Resultater' : 'EOQ Results'} (${classLabel})
                </h5>
                <button onclick="exportBatchEOQ()" class="text-xs px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors">
                    📥 ${currentLanguage === 'da' ? 'Eksporter' : 'Export'}
                </button>
            </div>
            
            <!-- Summary Cards -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                <div class="bg-white dark:bg-gray-800 p-2 rounded border border-purple-100 dark:border-purple-800">
                    <div class="text-xs text-gray-500 dark:text-gray-400">${currentLanguage === 'da' ? 'Antal Varer' : 'Items'}</div>
                    <div class="text-lg font-bold text-purple-700 dark:text-purple-300">${totalItems}</div>
                </div>
                <div class="bg-white dark:bg-gray-800 p-2 rounded border border-purple-100 dark:border-purple-800">
                    <div class="text-xs text-gray-500 dark:text-gray-400">${currentLanguage === 'da' ? 'Gns. EOQ' : 'Avg EOQ'}</div>
                    <div class="text-lg font-bold text-purple-700 dark:text-purple-300">${formatNumber(avgEOQ, 0)}</div>
                </div>
                <div class="bg-white dark:bg-gray-800 p-2 rounded border border-purple-100 dark:border-purple-800">
                    <div class="text-xs text-gray-500 dark:text-gray-400">${currentLanguage === 'da' ? 'Gns. Ordrer/År' : 'Avg Orders/Year'}</div>
                    <div class="text-lg font-bold text-purple-700 dark:text-purple-300">${formatNumber(avgOrdersPerYear, 1)}</div>
                </div>
                <div class="bg-white dark:bg-gray-800 p-2 rounded border border-purple-100 dark:border-purple-800">
                    <div class="text-xs text-gray-500 dark:text-gray-400">${currentLanguage === 'da' ? 'Total Årlig Omkostning' : 'Total Annual Cost'}</div>
                    <div class="text-lg font-bold text-purple-700 dark:text-purple-300">${formatCurrency(totalAnnualCost)}</div>
                </div>
            </div>
            
            <!-- Results Table -->
            <div class="overflow-x-auto max-h-64 overflow-y-auto">
                <table class="w-full text-sm">
                    <thead class="sticky top-0 bg-purple-100 dark:bg-purple-900/50">
                        <tr>
                            <th class="text-left p-2 font-medium text-purple-800 dark:text-purple-200">${currentLanguage === 'da' ? 'Vare' : 'Item'}</th>
                            <th class="text-center p-2 font-medium text-purple-800 dark:text-purple-200">${currentLanguage === 'da' ? 'Klasse' : 'Class'}</th>
                            <th class="text-right p-2 font-medium text-purple-800 dark:text-purple-200">${currentLanguage === 'da' ? 'Forbrug' : 'Demand'}</th>
                            <th class="text-right p-2 font-medium text-purple-800 dark:text-purple-200">EOQ</th>
                            <th class="text-right p-2 font-medium text-purple-800 dark:text-purple-200">${currentLanguage === 'da' ? 'Ordrer/År' : 'Orders/Yr'}</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-purple-100 dark:divide-purple-800">
                        ${topResults.map(r => {
                            const colors = { 'A': 'bg-red-500', 'B': 'bg-yellow-500', 'C': 'bg-green-500' };
                            const bgColor = colors[r.group] || 'bg-gray-500';
                            return `
                            <tr class="hover:bg-purple-50 dark:hover:bg-purple-900/30">
                                <td class="p-2 text-gray-800 dark:text-gray-200 max-w-[150px] truncate" title="${r.name}">${r.name}</td>
                                <td class="p-2 text-center">
                                    <span class="w-6 h-6 ${bgColor} text-white text-xs font-bold rounded inline-flex items-center justify-center">${r.group}</span>
                                </td>
                                <td class="p-2 text-right text-gray-700 dark:text-gray-300">${formatNumber(r.demand, 0)}</td>
                                <td class="p-2 text-right font-semibold text-purple-700 dark:text-purple-300">${formatNumber(r.eoq, 0)}</td>
                                <td class="p-2 text-right text-gray-700 dark:text-gray-300">${formatNumber(r.ordersPerYear, 1)}</td>
                            </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            ${hasMore ? `<p class="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">${currentLanguage === 'da' ? `... og ${results.length - 10} flere varer` : `... and ${results.length - 10} more items`}</p>` : ''}
        </div>
    `;
    
    // Store results for export
    window.batchEOQResults = results;
}

// Export batch EOQ results
function exportBatchEOQ() {
    if (!window.batchEOQResults || window.batchEOQResults.length === 0) {
        showToast(currentLanguage === 'da' ? 'Ingen data at eksportere' : 'No data to export', 'warning');
        return;
    }
    
    const results = window.batchEOQResults;
    const classLabel = window.eoqSelectedClasses ? window.eoqSelectedClasses.join('+') : 'All';
    
    // Create CSV
    const headers = ['Item', 'Class', 'Demand', 'Price', 'EOQ', 'Orders/Year', 'Total Cost'];
    const rows = results.map(r => [
        r.name,
        r.group,
        r.demand,
        r.price,
        Math.round(r.eoq),
        r.ordersPerYear.toFixed(1),
        r.totalCost.toFixed(2)
    ]);
    
    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eoq_${classLabel}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    showToast(
        currentLanguage === 'da' ? `📥 ${results.length} EOQ resultater eksporteret` : `📥 ${results.length} EOQ results exported`,
        'success'
    );
}

// ========================================
// ABC to Wilson Integration (Option A)
// ========================================

// Send items from ABC to Wilson page
function sendToWilson(classes = ['A']) {
    if (typeof classes === 'string') {
        classes = [classes];
    }
    
    const selectedItems = abcResults.filter(item => classes.includes(item.group));
    const classLabel = classes.join('+');
    
    if (selectedItems.length === 0) {
        showToast(
            currentLanguage === 'da' 
                ? `⚠️ Ingen ${classLabel}-varer fundet i ABC-analysen` 
                : `⚠️ No ${classLabel}-items found in ABC analysis`,
            'warning'
        );
        return;
    }
    
    // Store items for Wilson page
    window.wilsonABCItems = selectedItems.map(item => ({
        id: item.id || item.name,
        name: item.name || item.id,
        demand: item.consumption || item.demand || 0,
        price: item.price || 0,
        group: item.group,
        totalValue: item.totalValue || 0
    }));
    window.wilsonABCClasses = classes;
    
    // Switch to Wilson tab
    switchTab('wilson');
    
    // Show the ABC items loaded banner
    showABCItemsBanner();
    
    showToast(
        currentLanguage === 'da' 
            ? `🔗 ${selectedItems.length} ${classLabel}-varer sendt til Wilson` 
            : `🔗 ${selectedItems.length} ${classLabel}-items sent to Wilson`,
        'success'
    );
}

// Show ABC items banner on Wilson page
function showABCItemsBanner() {
    const banner = document.getElementById('abcItemsLoadedBanner');
    const selector = document.getElementById('abcItemSelector');
    const info = document.getElementById('abcItemsLoadedInfo');
    const quickStats = document.getElementById('abcItemsQuickStats');
    
    if (!banner || !window.wilsonABCItems) return;
    
    const items = window.wilsonABCItems;
    const classes = window.wilsonABCClasses || [];
    const classLabel = classes.join('+');
    
    // Update info text
    info.textContent = currentLanguage === 'da' 
        ? `${items.length} ${classLabel}-varer klar til EOQ-beregning`
        : `${items.length} ${classLabel}-items ready for EOQ calculation`;
    
    // Populate selector
    selector.innerHTML = `<option value="">${currentLanguage === 'da' ? 'Vælg vare...' : 'Select item...'}</option>`;
    items.forEach((item, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = `[${item.group}] ${item.name}`;
        selector.appendChild(opt);
    });
    
    // Calculate quick stats
    const totalDemand = items.reduce((sum, i) => sum + i.demand, 0);
    const totalValue = items.reduce((sum, i) => sum + i.totalValue, 0);
    const avgPrice = items.reduce((sum, i) => sum + i.price, 0) / items.length;
    
    quickStats.innerHTML = `
        <div>
            <div class="font-bold">${items.length}</div>
            <div class="text-xs text-indigo-200">${currentLanguage === 'da' ? 'Varer' : 'Items'}</div>
        </div>
        <div>
            <div class="font-bold">${formatNumber(totalDemand, 0)}</div>
            <div class="text-xs text-indigo-200">${currentLanguage === 'da' ? 'Total Forbrug' : 'Total Demand'}</div>
        </div>
        <div>
            <div class="font-bold">${formatCurrency(avgPrice)}</div>
            <div class="text-xs text-indigo-200">${currentLanguage === 'da' ? 'Gns. Pris' : 'Avg Price'}</div>
        </div>
        <div>
            <div class="font-bold">${formatCurrency(totalValue)}</div>
            <div class="text-xs text-indigo-200">${currentLanguage === 'da' ? 'Total Værdi' : 'Total Value'}</div>
        </div>
    `;
    
    banner.classList.remove('hidden');
}

// Load selected ABC item into Wilson inputs
function loadSelectedABCItem() {
    const selector = document.getElementById('abcItemSelector');
    const idx = parseInt(selector.value);
    
    if (isNaN(idx) || !window.wilsonABCItems || !window.wilsonABCItems[idx]) {
        showToast(currentLanguage === 'da' ? 'Vælg en vare først' : 'Select an item first', 'warning');
        return;
    }
    
    const item = window.wilsonABCItems[idx];
    
    // Switch to single mode
    switchWilsonMode('single');
    
    // Populate Wilson inputs
    const demandInput = document.getElementById('demandInput');
    const priceInput = document.getElementById('priceInput');
    
    if (demandInput) {
        demandInput.value = item.demand;
        syncWilsonSlider('demand', item.demand);
    }
    if (priceInput && item.price) {
        priceInput.value = item.price;
        syncWilsonSlider('price', item.price);
    }
    
    showToast(
        currentLanguage === 'da' 
            ? `✅ "${item.name}" indlæst - klar til beregning` 
            : `✅ "${item.name}" loaded - ready for calculation`,
        'success'
    );
}

// Clear ABC items banner
function clearABCItemsBanner() {
    const banner = document.getElementById('abcItemsLoadedBanner');
    if (banner) {
        banner.classList.add('hidden');
    }
    window.wilsonABCItems = null;
    window.wilsonABCClasses = null;
    
    // Also close batch results
    closeABCBatchResults();
}

// Store for batch EOQ results
window.abcBatchEOQResults = [];

// Calculate EOQ for all ABC items
function calculateAllABCItems() {
    if (!window.wilsonABCItems || window.wilsonABCItems.length === 0) {
        showToast(currentLanguage === 'da' ? 'Ingen varer at beregne' : 'No items to calculate', 'warning');
        return;
    }
    
    const orderCost = parseFloat(document.getElementById('batchOrderCost')?.value) || 200;
    const interestRate = (parseFloat(document.getElementById('batchInterestRate')?.value) || 5) / 100;
    
    // Calculate EOQ for each item
    window.abcBatchEOQResults = window.wilsonABCItems.map(item => {
        const D = item.demand || 0;
        const S = orderCost;
        const H = (item.price || 0) * interestRate;
        
        const eoq = H > 0 ? Math.sqrt((2 * D * S) / H) : 0;
        const ordersPerYear = eoq > 0 ? D / eoq : 0;
        const holdingCost = (eoq / 2) * H;
        const orderingCost = ordersPerYear * S;
        const totalCost = holdingCost + orderingCost;
        
        // Estimate current cost (assuming ordering in batches of 100 or demand/12)
        const currentOrderQty = Math.max(100, D / 12);
        const currentOrdersPerYear = D / currentOrderQty;
        const currentHoldingCost = (currentOrderQty / 2) * H;
        const currentOrderingCost = currentOrdersPerYear * S;
        const currentTotalCost = currentHoldingCost + currentOrderingCost;
        
        const savings = currentTotalCost - totalCost;
        
        return {
            ...item,
            eoq: Math.round(eoq),
            ordersPerYear: Math.round(ordersPerYear * 10) / 10,
            holdingCost,
            orderingCost,
            totalCost,
            currentTotalCost,
            savings: Math.max(0, savings)
        };
    });
    
    // Display results
    displayABCBatchResults();
    
    showToast(
        currentLanguage === 'da' 
            ? `✅ EOQ beregnet for ${window.abcBatchEOQResults.length} varer` 
            : `✅ EOQ calculated for ${window.abcBatchEOQResults.length} items`,
        'success'
    );
}

// Recalculate with updated parameters
function recalculateABCBatch() {
    if (window.wilsonABCItems && window.wilsonABCItems.length > 0) {
        calculateAllABCItems();
    }
}

// Display batch calculation results
function displayABCBatchResults() {
    const container = document.getElementById('abcBatchResults');
    const tbody = document.getElementById('abcBatchTableBody');
    
    if (!container || !tbody || !window.abcBatchEOQResults) return;
    
    const results = window.abcBatchEOQResults;
    const classColors = {
        'A': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        'B': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        'C': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    };
    
    // Build table rows
    tbody.innerHTML = results.map((item, idx) => `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <td class="text-left font-medium text-gray-800 dark:text-gray-200 max-w-[200px] truncate" title="${item.name}">${item.name}</td>
            <td class="text-center">
                <span class="px-2 py-0.5 rounded text-xs font-bold ${classColors[item.group] || 'bg-gray-100 text-gray-800'}">${item.group}</span>
            </td>
            <td class="text-right text-gray-600 dark:text-gray-400">${formatNumber(item.demand, 0)}</td>
            <td class="text-right text-gray-600 dark:text-gray-400">${formatCurrency(item.price)}</td>
            <td class="text-right font-bold text-green-600 dark:text-green-400">${formatNumber(item.eoq, 0)}</td>
            <td class="text-right text-gray-600 dark:text-gray-400">${item.ordersPerYear}</td>
            <td class="text-right text-gray-600 dark:text-gray-400">${formatCurrency(item.totalCost)}</td>
            <td class="text-center">
                <button onclick="openItemInWilson('${item.name.replace(/'/g, "\\'")}', ${item.demand}, ${item.price})" 
                    class="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors" 
                    title="${currentLanguage === 'da' ? 'Detaljer i Wilson' : 'Details in Wilson'}">
                    📊
                </button>
            </td>
        </tr>
    `).join('');
    
    // Calculate summary stats
    const totalItems = results.length;
    const totalEOQ = results.reduce((sum, i) => sum + i.eoq, 0);
    const avgEOQ = totalItems > 0 ? totalEOQ / totalItems : 0;
    const totalOrders = results.reduce((sum, i) => sum + i.ordersPerYear, 0);
    const totalCost = results.reduce((sum, i) => sum + i.totalCost, 0);
    const totalSavings = results.reduce((sum, i) => sum + i.savings, 0);
    
    // Update summary cards
    document.getElementById('abcBatchTotalItems').textContent = totalItems;
    document.getElementById('abcBatchAvgEOQ').textContent = formatNumber(avgEOQ, 0);
    document.getElementById('abcBatchTotalOrders').textContent = formatNumber(totalOrders, 0);
    document.getElementById('abcBatchTotalCost').textContent = formatCurrency(totalCost);
    document.getElementById('abcBatchSavings').textContent = formatCurrency(totalSavings);
    
    // Show results container
    container.classList.remove('hidden');
}

// Close batch results
function closeABCBatchResults() {
    const container = document.getElementById('abcBatchResults');
    if (container) {
        container.classList.add('hidden');
    }
}

// Save EOQ values back to ABC results
function saveEOQToABC() {
    if (!window.abcBatchEOQResults || window.abcBatchEOQResults.length === 0) {
        showToast(currentLanguage === 'da' ? 'Ingen EOQ-resultater at gemme' : 'No EOQ results to save', 'warning');
        return;
    }
    
    // Map EOQ results back to abcResults
    let updatedCount = 0;
    window.abcBatchEOQResults.forEach(result => {
        const idx = abcResults.findIndex(item => 
            (item.name === result.name || item.id === result.name) && item.group === result.group
        );
        if (idx !== -1) {
            abcResults[idx].eoq = result.eoq;
            abcResults[idx].ordersPerYear = result.ordersPerYear;
            abcResults[idx].eoqTotalCost = result.totalCost;
            abcResults[idx].eoqSavings = result.savings;
            updatedCount++;
        }
    });
    
    // Re-render ABC table if visible
    if (abcResults.length > 0) {
        updateABCTableWithEOQ();
    }
    
    showToast(
        currentLanguage === 'da' 
            ? `💾 EOQ gemt for ${updatedCount} varer i ABC-analysen` 
            : `💾 EOQ saved for ${updatedCount} items in ABC analysis`,
        'success'
    );
    
    // Highlight saved status
    const saveBtn = document.querySelector('button[onclick="saveEOQToABC()"]');
    if (saveBtn) {
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '✅ ' + (currentLanguage === 'da' ? 'Gemt!' : 'Saved!');
        saveBtn.classList.remove('bg-purple-500', 'hover:bg-purple-600');
        saveBtn.classList.add('bg-green-500', 'hover:bg-green-600');
        setTimeout(() => {
            saveBtn.innerHTML = originalText;
            saveBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
            saveBtn.classList.add('bg-purple-500', 'hover:bg-purple-600');
        }, 2000);
    }
}

// Update ABC table to show EOQ column
function updateABCTableWithEOQ() {
    // Check if table has EOQ column already
    const abcTable = document.getElementById('abcResultsBody');
    if (!abcTable) return;
    
    // Re-render with EOQ data - the renderABCTable should handle this
    // For now, show a notification that ABC table will show EOQ on next view
    
    // If Double ABC results exist, update those too
    if (typeof renderDoubleABCResults === 'function' && doubleAbcResults && doubleAbcResults.length > 0) {
        // Similar update logic
    }
}

// Export ABC batch results to Excel
function exportABCBatchToExcel() {
    if (!window.abcBatchEOQResults || window.abcBatchEOQResults.length === 0) {
        showToast(currentLanguage === 'da' ? 'Ingen data at eksportere' : 'No data to export', 'warning');
        return;
    }
    
    const wb = XLSX.utils.book_new();
    
    // Prepare data
    const data = window.abcBatchEOQResults.map(item => ({
        'Varenavn': item.name,
        'Klasse': item.group,
        'Årsforbrug': item.demand,
        'Pris pr. enhed': item.price,
        'EOQ (Optimal mængde)': item.eoq,
        'Ordrer pr. år': item.ordersPerYear,
        'Årlig lageromkostning': Math.round(item.holdingCost),
        'Årlig ordreomkostning': Math.round(item.orderingCost),
        'Total årlig omkostning': Math.round(item.totalCost),
        'Potentiel besparelse': Math.round(item.savings)
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Set column widths
    ws['!cols'] = [
        { width: 25 },  // Varenavn
        { width: 8 },   // Klasse
        { width: 12 },  // Årsforbrug
        { width: 12 },  // Pris
        { width: 15 },  // EOQ
        { width: 12 },  // Ordrer/år
        { width: 18 },  // Lageromk
        { width: 18 },  // Ordreomk
        { width: 18 },  // Total omk
        { width: 15 }   // Besparelse
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'EOQ Resultater');
    
    // Add summary sheet
    const summaryData = [
        { Metric: 'Antal varer', Værdi: window.abcBatchEOQResults.length },
        { Metric: 'Gns. EOQ', Værdi: Math.round(window.abcBatchEOQResults.reduce((s, i) => s + i.eoq, 0) / window.abcBatchEOQResults.length) },
        { Metric: 'Total ordrer/år', Værdi: Math.round(window.abcBatchEOQResults.reduce((s, i) => s + i.ordersPerYear, 0)) },
        { Metric: 'Total årlig omkostning', Værdi: Math.round(window.abcBatchEOQResults.reduce((s, i) => s + i.totalCost, 0)) },
        { Metric: 'Total potentiel besparelse', Værdi: Math.round(window.abcBatchEOQResults.reduce((s, i) => s + i.savings, 0)) }
    ];
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    summaryWs['!cols'] = [{ width: 25 }, { width: 15 }];
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Opsummering');
    
    // Download
    XLSX.writeFile(wb, `ABC_EOQ_Resultater_${new Date().toISOString().slice(0,10)}.xlsx`);
    
    showToast(currentLanguage === 'da' ? '📊 Excel eksporteret' : '📊 Excel exported', 'success');
}

// Open specific item in Wilson single mode
function openItemInWilson(name, demand, price) {
    // Find in ABC results or batch results
    const item = window.wilsonABCItems?.find(i => i.name === name) || 
                 abcResults.find(i => i.name === name || i.id === name);
    
    // Switch to single mode
    switchWilsonMode('single');
    
    // Populate inputs
    const demandInput = document.getElementById('demandInput');
    const priceInput = document.getElementById('priceInput');
    
    if (demandInput) {
        demandInput.value = demand;
        syncWilsonSlider('demand', demand);
    }
    if (priceInput && price) {
        priceInput.value = price;
        syncWilsonSlider('price', price);
    }
    
    // Trigger calculation
    setTimeout(() => {
        const calcBtn = document.getElementById('calculateBtn');
        if (calcBtn) calcBtn.click();
    }, 100);
    
    showToast(
        currentLanguage === 'da' 
            ? `📊 "${name}" indlæst til detaljeret analyse` 
            : `📊 "${name}" loaded for detailed analysis`,
        'info'
    );
}

// Show quick EOQ preview on ABC page
function showQuickEOQPreview() {
    const panel = document.getElementById('quickEOQPreview');
    const content = document.getElementById('quickEOQPreviewContent');
    
    if (!panel || !content || abcResults.length === 0) {
        showToast(currentLanguage === 'da' ? 'Ingen data at vise' : 'No data to display', 'warning');
        return;
    }
    
    // Default parameters for quick estimate
    const orderCost = 200;
    const interestRate = 0.05;
    
    // Calculate quick EOQ for top items of each class
    const previewData = {
        A: abcResults.filter(i => i.group === 'A').slice(0, 3),
        B: abcResults.filter(i => i.group === 'B').slice(0, 3),
        C: abcResults.filter(i => i.group === 'C').slice(0, 3)
    };
    
    let html = `
        <div class="text-xs text-gray-500 dark:text-gray-400 mb-3">
            ${currentLanguage === 'da' ? 'Estimater med standardparametre' : 'Estimates with default parameters'}: 
            ${currentLanguage === 'da' ? 'Ordreomk' : 'Order cost'}: ${formatCurrency(orderCost)}, 
            ${currentLanguage === 'da' ? 'Rente' : 'Interest'}: ${interestRate * 100}%
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead class="bg-purple-100 dark:bg-purple-900/50">
                    <tr>
                        <th class="text-left p-2 text-purple-800 dark:text-purple-200">${currentLanguage === 'da' ? 'Vare' : 'Item'}</th>
                        <th class="text-center p-2 text-purple-800 dark:text-purple-200">${currentLanguage === 'da' ? 'Klasse' : 'Class'}</th>
                        <th class="text-right p-2 text-purple-800 dark:text-purple-200">${currentLanguage === 'da' ? 'Forbrug' : 'Demand'}</th>
                        <th class="text-right p-2 text-purple-800 dark:text-purple-200">~EOQ</th>
                        <th class="text-center p-2 text-purple-800 dark:text-purple-200">${currentLanguage === 'da' ? 'Analyse' : 'Analyze'}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-purple-100 dark:divide-purple-800">
    `;
    
    const colors = { 'A': 'bg-red-500', 'B': 'bg-yellow-500', 'C': 'bg-green-500' };
    
    ['A', 'B', 'C'].forEach(cls => {
        previewData[cls].forEach(item => {
            const D = item.consumption || item.demand || 0;
            const H = (item.price || 0) * interestRate;
            const eoq = H > 0 ? Math.sqrt((2 * D * orderCost) / H) : 0;
            
            html += `
                <tr class="hover:bg-purple-50 dark:hover:bg-purple-900/30">
                    <td class="p-2 text-gray-800 dark:text-gray-200 max-w-[150px] truncate" title="${item.name || item.id}">${item.name || item.id}</td>
                    <td class="p-2 text-center">
                        <span class="w-6 h-6 ${colors[cls]} text-white text-xs font-bold rounded inline-flex items-center justify-center">${cls}</span>
                    </td>
                    <td class="p-2 text-right text-gray-700 dark:text-gray-300">${formatNumber(D, 0)}</td>
                    <td class="p-2 text-right font-semibold text-purple-700 dark:text-purple-300">${formatNumber(eoq, 0)}</td>
                    <td class="p-2 text-center">
                        <button onclick="openItemInWilson('${(item.name || item.id).replace(/'/g, "\\'")}', ${D}, ${item.price || 0})" 
                            class="px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded transition-colors" 
                            title="${currentLanguage === 'da' ? 'Åbn i Wilson' : 'Open in Wilson'}">
                            📊
                        </button>
                    </td>
                </tr>
            `;
        });
    });
    
    html += `
                </tbody>
            </table>
        </div>
        <div class="mt-3 flex justify-between items-center">
            <p class="text-xs text-gray-500 dark:text-gray-400">
                ${currentLanguage === 'da' ? 'Viser top 3 pr. klasse. Klik 📊 for fuld analyse.' : 'Showing top 3 per class. Click 📊 for full analysis.'}
            </p>
            <button onclick="sendToWilson(['A', 'B', 'C'])" class="text-xs px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors">
                ${currentLanguage === 'da' ? 'Send alle til Wilson →' : 'Send all to Wilson →'}
            </button>
        </div>
    `;
    
    content.innerHTML = html;
    panel.classList.remove('hidden');
    panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Hide quick EOQ preview
function hideQuickEOQPreview() {
    const panel = document.getElementById('quickEOQPreview');
    if (panel) {
        panel.classList.add('hidden');
    }
}

// Open single item in Wilson from preview
function openItemInWilson(name, demand, price) {
    // Store single item
    window.wilsonABCItems = [{
        id: name,
        name: name,
        demand: demand,
        price: price,
        group: '-'
    }];
    
    // Switch to Wilson
    switchTab('wilson');
    switchWilsonMode('single');
    
    // Populate inputs
    const demandInput = document.getElementById('demandInput');
    const priceInput = document.getElementById('priceInput');
    
    if (demandInput) {
        demandInput.value = demand;
        syncWilsonSlider('demand', demand);
    }
    if (priceInput) {
        priceInput.value = price;
        syncWilsonSlider('price', price);
    }
    
    showToast(
        currentLanguage === 'da' 
            ? `📊 "${name}" åbnet i Wilson` 
            : `📊 "${name}" opened in Wilson`,
        'success'
    );
}

// Update item counts in dropdown when ABC results change
function updateEOQDropdownCounts() {
    if (!abcResults || abcResults.length === 0) return;
    
    const aCount = abcResults.filter(i => i.group === 'A').length;
    const bCount = abcResults.filter(i => i.group === 'B').length;
    const cCount = abcResults.filter(i => i.group === 'C').length;
    
    const aSpan = document.getElementById('aItemCount');
    const bSpan = document.getElementById('bItemCount');
    const cSpan = document.getElementById('cItemCount');
    const allSpan = document.getElementById('allItemCount');
    
    if (aSpan) aSpan.textContent = `(${aCount})`;
    if (bSpan) bSpan.textContent = `(${bCount})`;
    if (cSpan) cSpan.textContent = `(${cCount})`;
    if (allSpan) allSpan.textContent = `(${aCount + bCount + cCount})`;
}

// Backward compatibility wrapper
function calculateEOQForAItems() {
    calculateEOQForItems(['A']);
}

// Setup batch calculation for selected class items
function setupClassBatchCalculation(items, classes) {
    const classLabel = classes.join('+');
    
    // Create or update items batch indicator
    let indicator = document.getElementById('classBatchIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'classBatchIndicator';
        indicator.className = 'bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-300 dark:border-indigo-700 rounded-lg p-3 mb-4';
        
        const batchPanel = document.getElementById('batchWilsonPanel');
        if (batchPanel) {
            batchPanel.insertBefore(indicator, batchPanel.firstChild);
        }
    }
    
    // Generate class badges
    const classBadges = classes.map(c => {
        const colors = {
            'A': 'bg-red-500',
            'B': 'bg-yellow-500',
            'C': 'bg-green-500'
        };
        return `<span class="w-5 h-5 ${colors[c] || 'bg-gray-500'} text-white text-xs font-bold rounded flex items-center justify-center">${c}</span>`;
    }).join('');
    
    indicator.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
                <span class="text-2xl">🎯</span>
                <div class="flex items-center gap-2">
                    ${classBadges}
                    <div>
                        <span class="font-semibold text-indigo-800 dark:text-indigo-200">
                            ${currentLanguage === 'da' ? `${classLabel}-Varer Batch Mode` : `${classLabel}-Items Batch Mode`}
                        </span>
                        <p class="text-sm text-indigo-600 dark:text-indigo-400">
                            ${items.length} ${currentLanguage === 'da' ? 'varer fra ABC-analyse' : 'items from ABC analysis'}
                        </p>
                    </div>
                </div>
            </div>
            <button onclick="clearClassBatchMode()" class="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 p-1">
                ✕
            </button>
        </div>
    `;
    
    // Store items for batch calculation
    window.classBatchData = items.map(item => ({
        id: item.id || item.name,
        name: item.name || item.id,
        demand: item.consumption || item.demand,
        price: item.price || 0,
        group: item.group,
        totalValue: item.totalValue
    }));
    window.classBatchClasses = classes;
}

// Backward compatibility
function setupAItemsBatchCalculation(aItems) {
    setupClassBatchCalculation(aItems, ['A']);
}

// Clear class batch mode
function clearClassBatchMode() {
    const indicator = document.getElementById('classBatchIndicator');
    if (indicator) {
        indicator.remove();
    }
    window.classBatchData = null;
    window.classBatchClasses = null;
}

// Clear A-items batch mode (backward compatibility)
function clearAItemsBatchMode() {
    clearClassBatchMode();
    // Also clear old indicator if exists
    const indicator = document.getElementById('aItemsBatchIndicator');
    if (indicator) {
        indicator.remove();
    }
    window.aItemsBatchData = null;
    window.eoqAItems = null;
    
    showToast(
        currentLanguage === 'da' 
            ? 'A-varer batch mode ryddet' 
            : 'A-items batch mode cleared',
        'info'
    );
}

// EOQ Dropdown Functions
function toggleEOQDropdown() {
    const menu = document.getElementById('eoqDropdownMenu');
    if (menu) {
        menu.classList.toggle('hidden');
        
        // Close dropdown when clicking outside
        if (!menu.classList.contains('hidden')) {
            setTimeout(() => {
                document.addEventListener('click', closeEOQDropdownOnClickOutside);
            }, 10);
        }
    }
}

function closeEOQDropdown() {
    const menu = document.getElementById('eoqDropdownMenu');
    if (menu) {
        menu.classList.add('hidden');
    }
    document.removeEventListener('click', closeEOQDropdownOnClickOutside);
}

function closeEOQDropdownOnClickOutside(e) {
    const container = document.getElementById('eoqDropdownContainer');
    if (container && !container.contains(e.target)) {
        closeEOQDropdown();
    }
}

// renderWilsonGraph function removed as graph is no longer needed

// ========================================
// Reset Application
// ========================================

function resetApp() {
    const message = currentLanguage === 'da' 
        ? 'Er du sikker på, at du vil rydde alle data? Dette kan ikke fortrydes.'
        : 'Are you sure you want to clear all data? This cannot be undone.';
    
    if (!confirm(message)) {
        return;
    }
    
    // Clear data
    uploadedData = [];
    abcResults = [];
    doubleABCResults = [];
    currentFileName = '';
    currentFileSize = '';
    allColumnNames = [];
    
    // Reset file input
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
    
    const processBtn = document.getElementById('processBtn');
    if (processBtn) processBtn.disabled = true;
    
    // Hide file info
    const fileInfo = document.getElementById('fileInfo');
    if (fileInfo) fileInfo.classList.add('hidden');
    
    // Hide sections
    const previewSection = document.getElementById('previewSection');
    if (previewSection) previewSection.classList.add('hidden');
    
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) resultsSection.classList.add('hidden');
    
    const wilsonResults = document.getElementById('wilsonResults');
    if (wilsonResults) wilsonResults.classList.add('hidden');
    
    // Hide ABC Double sections
    const doubleAnalysisInfo = document.getElementById('doubleAnalysisInfo');
    if (doubleAnalysisInfo) doubleAnalysisInfo.classList.add('hidden');
    
    const doubleMatrixContainer = document.getElementById('doubleMatrixContainer');
    if (doubleMatrixContainer) doubleMatrixContainer.classList.add('hidden');
    
    const doubleSummaryStats = document.getElementById('doubleSummaryStats');
    if (doubleSummaryStats) doubleSummaryStats.classList.add('hidden');
    
    const doubleTableContainer = document.getElementById('doubleTableContainer');
    if (doubleTableContainer) doubleTableContainer.classList.add('hidden');
    
    const doubleABCFiltersPanel = document.getElementById('doubleABCFiltersPanel');
    if (doubleABCFiltersPanel) doubleABCFiltersPanel.classList.add('hidden');
    
    // Destroy chart
    if (currentChart) {
        currentChart.destroy();
        currentChart = null;
    }
    
    // Clear Wilson inputs
    document.getElementById('demandInput').value = '10000';
    document.getElementById('orderCostInput').value = '200';
    const priceInput = document.getElementById('priceInput');
    const interestInput = document.getElementById('interestInput');
    if (priceInput) priceInput.value = '100';
    if (interestInput) interestInput.value = '5';
    
    // Clear dashboard statistics
    const totalItemsEl = document.getElementById('totalItems');
    const totalValueEl = document.getElementById('totalValue');
    const aItemsEl = document.getElementById('aItems');
    const lastAnalysisEl = document.getElementById('lastAnalysis');
    if (totalItemsEl) totalItemsEl.textContent = '0';
    if (totalValueEl) totalValueEl.textContent = '0';
    if (aItemsEl) aItemsEl.textContent = '0';
    if (lastAnalysisEl) lastAnalysisEl.textContent = translate('no-analysis-yet');
    
    // Hide and clear quality check
    const qualityCheck = document.getElementById('qualityCheck');
    const qualityScore = document.getElementById('qualityScore');
    const qualityIssues = document.getElementById('qualityIssues');
    if (qualityCheck) qualityCheck.classList.add('hidden');
    if (qualityScore) qualityScore.textContent = '';
    if (qualityIssues) qualityIssues.innerHTML = '';
    
    // Clear all tables
    const abcTable = document.getElementById('abcTable');
    if (abcTable) abcTable.innerHTML = '';
    
    const doubleABCTable = document.getElementById('doubleABCTable');
    if (doubleABCTable) doubleABCTable.innerHTML = '';
    
    const matrixDetailsTable = document.getElementById('matrixDetailsTable');
    if (matrixDetailsTable) matrixDetailsTable.innerHTML = '';
    
    const previewTable = document.getElementById('previewTable');
    if (previewTable) previewTable.innerHTML = '';
    
    const compareTable = document.getElementById('compareTable');
    if (compareTable) compareTable.innerHTML = '';
    
    // Clear Top 5 Items table on dashboard
    const dashboardTop5Body = document.getElementById('dashboardTop5Body');
    const dashboardTop5Head = document.getElementById('dashboardTop5Head');
    if (dashboardTop5Body) {
        dashboardTop5Body.innerHTML = '<tr><td colspan="4" class="text-center text-gray-500" data-i18n="no-data-yet">Ingen analyse kører endnu</td></tr>';
    }
    if (dashboardTop5Head) {
        dashboardTop5Head.innerHTML = `<tr><th data-i18n="item-name">Varenavn</th><th data-i18n="value">Værdi</th><th data-i18n="cumulative">Kumulativ %</th><th data-i18n="group">Gruppe</th></tr>`;
    }
    
    // Re-enable and expand file upload
    const uploadSection = document.getElementById('uploadSection');
    if (uploadSection && uploadSection.classList.contains('hidden')) {
        toggleUploadSection();
    }
    if (uploadSection) uploadSection.classList.remove('hidden');
    
    // Clear matrix cells
    const categories = ['AA', 'AB', 'AC', 'BA', 'BB', 'BC', 'CA', 'CB', 'CC'];
    categories.forEach(cat => {
        const countEl = document.getElementById(`count-${cat}`);
        const valueEl = document.getElementById(`value-${cat}`);
        if (countEl) countEl.textContent = currentLanguage === 'da' ? '0 varer' : '0 items';
        if (valueEl) valueEl.textContent = '0 kr';
    });
    
    // Clear dashboard top items
    const dashTopItems = document.getElementById('dashTopItems');
    if (dashTopItems) {
        const itemsContainer = dashTopItems.querySelector('.space-y-2');
        if (itemsContainer) itemsContainer.innerHTML = `<p class="text-gray-500 dark:text-gray-400 text-center py-4">${currentLanguage === 'da' ? 'Ingen data tilgængelig' : 'No data available'}</p>`;
    }
    
    // Clear summary stats
    const summaryCards = document.querySelectorAll('.text-2xl.font-bold');
    summaryCards.forEach(card => {
        if (card.textContent.match(/\d/)) {
            card.textContent = '0';
        }
    });
    
    // Clear axis labels
    const detectedConsumption = document.getElementById('detectedConsumption');
    const detectedConsumption2 = document.getElementById('detectedConsumption2');
    const detectedPrice = document.getElementById('detectedPrice');
    if (detectedConsumption) detectedConsumption.textContent = '';
    if (detectedConsumption2) detectedConsumption2.textContent = '';
    if (detectedPrice) detectedPrice.textContent = '';
    
    // Reset column dropdowns
    const horizontalAxisLabel = document.getElementById('horizontalAxisLabel');
    const verticalAxisLabel = document.getElementById('verticalAxisLabel');
    const selectColumnText = translate('select-column');
    const autoCalcText = translate('auto-calculated-column');
    if (horizontalAxisLabel) horizontalAxisLabel.innerHTML = `<option value="">${selectColumnText}</option>`;
    if (verticalAxisLabel) verticalAxisLabel.innerHTML = `<option value="">${selectColumnText}</option><option value="__calculated__">${autoCalcText}</option>`;
    
    // Hide ABC Double tab
    const abcDoubleTabBtn = document.getElementById('abcDoubleTabBtn');
    if (abcDoubleTabBtn) abcDoubleTabBtn.classList.add('hidden');
    
    // Hide matrix details container
    const matrixDetailsContainer = document.getElementById('matrixDetailsContainer');
    if (matrixDetailsContainer) matrixDetailsContainer.classList.add('hidden');
    
    // Clear persisted data (but keep user settings)
    localStorage.removeItem('abcDashboardData');
    localStorage.removeItem('quickActionsConfig');
    localStorage.removeItem('hasVisitedBefore');
    
    // Note: We keep theme, language, thresholds, educationMode, and defaultChartType
    // as these are user preferences, not data
    
    console.log('Application reset successfully');
    
    // Update Quick Actions to show defaults
    populateQuickActionsCheckboxes();
    renderQuickActions();
    
    // Switch back to dashboard
    switchTab('dashboard');
    
    showToast(currentLanguage === 'da' ? 'Alle data ryddet!' : 'All data cleared!', 'success');
}

// ========================================
// Data Management Functions (Settings)
// ========================================

function clearUploadedData() {
    const message = currentLanguage === 'da' 
        ? 'Er du sikker på, at du vil rydde alle uploadede data og analyseresultater? Dette kan ikke fortrydes.'
        : 'Are you sure you want to clear all uploaded data and analysis results? This cannot be undone.';
    
    if (!confirm(message)) {
        return;
    }
    
    // Call the existing resetApp function which handles data clearing
    resetApp();
}

function resetDashboardCustomization() {
    const message = currentLanguage === 'da' 
        ? 'Er du sikker på, at du vil nulstille Quick Actions til standard? Dette kan ikke fortrydes.'
        : 'Are you sure you want to reset Quick Actions to default? This cannot be undone.';
    
    if (!confirm(message)) {
        return;
    }
    
    // Clear Quick Actions config from localStorage
    localStorage.removeItem('quickActionsConfig');
    
    // Reset to defaults
    populateQuickActionsCheckboxes();
    renderQuickActions();
    
    showToast(currentLanguage === 'da' ? 'Dashboard nulstillet!' : 'Dashboard reset!', 'success');
}

function deleteAllCustomPages() {
    const message = currentLanguage === 'da' 
        ? 'Er du sikker på, at du vil slette ALLE custom pages? Dette kan ikke fortrydes.'
        : 'Are you sure you want to delete ALL custom pages? This cannot be undone.';
    
    if (!confirm(message)) {
        return;
    }
    
    // Clear custom pages from localStorage
    localStorage.removeItem('customPages');
    
    // Reload custom pages (will be empty)
    if (typeof loadCustomPages === 'function') {
        loadCustomPages();
    }
    
    // Refresh custom pages management grid
    if (typeof renderCustomPagesManagement === 'function') {
        renderCustomPagesManagement();
    }
    
    showToast(currentLanguage === 'da' ? 'Alle custom pages slettet!' : 'All custom pages deleted!', 'success');
}

function resetEverything() {
    const message = currentLanguage === 'da' 
        ? 'Er du HELT sikker på, at du vil nulstille ALT? Dette sletter alle data, custom pages, dashboard indstillinger og nulstiller applikationen til fabriksindstillinger. Dette kan IKKE fortrydes!'
        : 'Are you ABSOLUTELY sure you want to reset EVERYTHING? This will delete all data, custom pages, dashboard settings, and reset the application to factory defaults. This CANNOT be undone!';
    
    if (!confirm(message)) {
        return;
    }
    
    // Double confirm for safety
    const doubleConfirm = currentLanguage === 'da'
        ? 'Sidste advarsel! Tryk OK for at nulstille ALT permanent.'
        : 'Final warning! Press OK to reset EVERYTHING permanently.';
    
    if (!confirm(doubleConfirm)) {
        return;
    }
    
    // Clear ALL localStorage (including settings, theme, language, etc.)
    localStorage.clear();
    
    // Reload the page to reset everything
    showToast(currentLanguage === 'da' ? 'Nulstiller applikationen...' : 'Resetting application...', 'info');
    
    setTimeout(() => {
        location.reload();
    }, 1000);
}

// ========================================
// Utility Functions
// ========================================

// Format number with thousand separators
function formatNumber(num, decimals = 0) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    const formatted = Number(num).toFixed(decimals);
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return decimals > 0 ? parts.join(',') : parts[0];
}

// Format currency with kr suffix
function formatCurrency(num) {
    if (num === null || num === undefined || isNaN(num)) return '0 kr';
    return formatNumber(num, 0) + ' kr';
}

// ========================================
// NEW ENHANCEMENTS FUNCTIONALITY
// ========================================

// Dashboard Update Function
function updateDashboard() {
    if (abcResults.length === 0) {
        return;
    }
    
    const totalItems = abcResults.length;
    const totalValue = abcResults.reduce((sum, item) => sum + item.value, 0);
    const aItems = abcResults.filter(item => item.group === 'A').length;
    const now = new Date().toLocaleString(currentLanguage === 'da' ? 'da-DK' : 'en-US');
    
    document.getElementById('dashTotalItems').textContent = totalItems;
    document.getElementById('dashTotalValue').textContent = totalValue.toLocaleString(currentLanguage === 'da' ? 'da-DK' : 'en-US');
    document.getElementById('dashAItems').textContent = aItems;
    document.getElementById('dashLastAnalysis').textContent = now;
    
    // Update top 5 items - show all visible columns
    const top5 = abcResults.slice(0, 5);
    const thead = document.getElementById('dashboardTop5Head');
    const tbody = document.getElementById('dashboardTop5Body');
    
    // Get columns to display
    let originalColumns = [];
    if (top5[0] && top5[0]._original) {
        const allCols = Object.keys(top5[0]._original);
        originalColumns = visibleColumns.length > 0 ? visibleColumns.filter(col => allCols.includes(col)) : allCols;
    }
    
    // Build dynamic table headers - match ABC analysis table exactly
    if (originalColumns.length > 0) {
        thead.innerHTML = `<tr>${originalColumns.map(col => `<th>${col}</th>`).join('')}<th>${t('value')}</th><th>${t('cumulative')}</th><th>${t('group')}</th></tr>`;
    } else {
        thead.innerHTML = `<tr><th>${t('item-name')}</th><th>${t('value')}</th><th>${t('cumulative')}</th><th>${t('group')}</th></tr>`;
    }
    
    // Build table rows with all visible columns - match ABC analysis table exactly
    tbody.innerHTML = top5.map(item => {
        let cells = '';
        
        if (item._original && originalColumns.length > 0) {
            cells = originalColumns.map(col => {
                const value = item._original[col];
                const displayValue = typeof value === 'number' 
                    ? value.toLocaleString(currentLanguage === 'da' ? 'da-DK' : 'en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2})
                    : (value || '');
                return `<td>${displayValue}</td>`;
            }).join('');
        } else {
            cells = `<td>${item.name}</td>`;
        }
        
        return `
            <tr>
                ${cells}
                <td>${item.value.toLocaleString(currentLanguage === 'da' ? 'da-DK' : 'en-US')}</td>
                <td>${item.cumulativePercent.toFixed(2)}%</td>
                <td><span class="group-badge group-${item.group}">${item.group}</span></td>
            </tr>
        `;
    }).join('');
    
    // Update session history panel (enhancement)
    updateSessionHistoryPanel();
    
    // Update smart suggestions (enhancement)
    updateDashboardSuggestions();
}

// Dashboard Smart Suggestions (Enhancement)
function updateDashboardSuggestions() {
    const container = document.getElementById('dashboard-suggestions');
    const content = document.getElementById('suggestions-content');
    
    if (!container || !content) return;
    
    const suggestions = generateSmartSuggestions();
    
    if (suggestions.length === 0) {
        container.classList.add('hidden');
        return;
    }
    
    // Use DashboardEnhancements if available
    if (window.DashboardEnhancements && window.DashboardEnhancements.suggestions) {
        content.innerHTML = window.DashboardEnhancements.suggestions.getSuggestionHTML(suggestions, currentLanguage);
    } else {
        // Fallback
        content.innerHTML = suggestions.map(s => `
            <div class="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div class="flex items-center gap-2">
                    <span>${s.icon}</span>
                    <span class="text-sm text-gray-700 dark:text-gray-300">${s.text}</span>
                </div>
                ${s.action ? `<button onclick="${s.action}" class="text-xs px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded">${s.actionText || 'Do it'}</button>` : ''}
            </div>
        `).join('');
    }
    
    // Show suggestions if user hasn't dismissed them
    const dismissed = sessionStorage.getItem('suggestions_dismissed');
    if (!dismissed) {
        container.classList.remove('hidden');
    }
}

// Generate smart suggestions based on current data
function generateSmartSuggestions() {
    const suggestions = [];
    
    // Check if data is loaded
    if (abcResults.length === 0) {
        suggestions.push({
            icon: '📤',
            text: currentLanguage === 'da' ? 'Upload en CSV-fil for at komme i gang' : 'Upload a CSV file to get started',
            action: "document.getElementById('fileInput').click()",
            actionText: currentLanguage === 'da' ? 'Upload' : 'Upload'
        });
        return suggestions;
    }
    
    // A-items analysis
    const aItems = abcResults.filter(item => item.group === 'A');
    if (aItems.length > 0 && aItems.length <= 10) {
        suggestions.push({
            icon: '🎯',
            text: currentLanguage === 'da' 
                ? `Du har ${aItems.length} A-varer. Beregn EOQ for dem for at optimere lagerbeholdningen.`
                : `You have ${aItems.length} A-items. Calculate EOQ for them to optimize inventory.`,
            action: 'calculateEOQForAItems()',
            actionText: currentLanguage === 'da' ? 'Beregn EOQ' : 'Calculate EOQ'
        });
    }
    
    // High value concentration check
    const aValue = aItems.reduce((sum, item) => sum + item.value, 0);
    const totalValue = abcResults.reduce((sum, item) => sum + item.value, 0);
    const aPercent = (aValue / totalValue) * 100;
    
    if (aPercent > 85) {
        suggestions.push({
            icon: '⚠️',
            text: currentLanguage === 'da' 
                ? `A-varer udgør ${aPercent.toFixed(1)}% af værdien. Overvej at justere tærskelværdier.`
                : `A-items account for ${aPercent.toFixed(1)}% of value. Consider adjusting thresholds.`,
            action: "document.getElementById('thresholdA').focus()",
            actionText: currentLanguage === 'da' ? 'Justér' : 'Adjust'
        });
    }
    
    // Missing prices check
    const missingPrices = abcResults.filter(item => !item.price || item.price === 0);
    if (missingPrices.length > 0) {
        suggestions.push({
            icon: '💰',
            text: currentLanguage === 'da' 
                ? `${missingPrices.length} varer mangler prisdata`
                : `${missingPrices.length} items are missing price data`
        });
    }
    
    // Export suggestion if analysis is done
    if (abcResults.length > 0) {
        const lastExport = localStorage.getItem('last_export_time');
        if (!lastExport || Date.now() - parseInt(lastExport) > 24 * 60 * 60 * 1000) {
            suggestions.push({
                icon: '📊',
                text: currentLanguage === 'da' 
                    ? 'Husk at eksportere dine resultater'
                    : 'Remember to export your results',
                action: "document.querySelector('[onclick*=\"exportToPDF\"]')?.click()",
                actionText: currentLanguage === 'da' ? 'Eksporter' : 'Export'
            });
        }
    }
    
    return suggestions.slice(0, 4); // Max 4 suggestions
}

// Toggle suggestions visibility
function toggleSuggestions(show) {
    const container = document.getElementById('dashboard-suggestions');
    if (container) {
        if (show) {
            container.classList.remove('hidden');
            sessionStorage.removeItem('suggestions_dismissed');
        } else {
            container.classList.add('hidden');
            sessionStorage.setItem('suggestions_dismissed', 'true');
        }
    }
}

// Session History Panel Update (Enhancement)
function updateSessionHistoryPanel() {
    const container = document.getElementById('sessionHistoryContent');
    if (!container || !window.CrossFeatureEnhancements) {
        if (container) container.innerHTML = '<p class="text-xs text-gray-500">' + (currentLanguage === 'da' ? 'Ingen historik endnu' : 'No history yet') + '</p>';
        return;
    }
    container.innerHTML = CrossFeatureEnhancements.sessionHistory.renderPanel();
}

// Clear Session History
function clearSessionHistory() {
    localStorage.removeItem('session_history');
    updateSessionHistoryPanel();
    showToast(currentLanguage === 'da' ? 'Historik ryddet' : 'History cleared', 'success');
}

// Drag & Drop File Upload
function setupDragDrop() {
    const dropZone = document.getElementById('fileDropZone');
    const fileInput = document.getElementById('fileInput');
    
    if (!dropZone || !fileInput) return;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('dragover');
        });
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('dragover');
        });
    });
    
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            const file = files[0];
            // Validate file type
            const validExtensions = ['csv', 'xlsx', 'xls'];
            const fileExtension = file.name.split('.').pop().toLowerCase();
            
            if (validExtensions.includes(fileExtension)) {
                // Create a new FileList-like object
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInput.files = dataTransfer.files;
                
                // Trigger the file upload handler
                handleFileUpload({ target: fileInput });
            } else {
                showToast(currentLanguage === 'da' ? 'Upload venligst en CSV- eller Excel-fil (.csv, .xlsx, .xls)' : 'Please upload a CSV or Excel file (.csv, .xlsx, .xls)', 'error');
            }
        }
    });
    
    // Only trigger on dropZone click, not on label or label child clicks
    dropZone.addEventListener('click', (e) => {
        // Don't trigger if the click is on the label element or its children (span)
        if (e.target.tagName !== 'LABEL' && e.target.closest('label') === null) {
            fileInput.click();
        }
    });
}

// Prevent browser from opening dragged files globally
function preventGlobalFileDrop() {
    // Prevent default drag behaviors on window
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        window.addEventListener(eventName, (e) => {
            // Only prevent default if dragging files from outside browser
            if (e.dataTransfer && e.dataTransfer.types && e.dataTransfer.types.includes('Files')) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, false);
    });
    
    // Specifically prevent drop on document
    document.addEventListener('drop', (e) => {
        // If it's not one of our drop zones, prevent the drop
        const dropZones = ['fileDropZone', 'batchDropZone', 'compareDropZone1', 'compareDropZone2'];
        const isDropZone = dropZones.some(id => {
            const zone = document.getElementById(id);
            return zone && zone.contains(e.target);
        });
        
        if (!isDropZone && e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, false);
}

// View Uploaded Data
function viewUploadedData() {
    if (uploadedData.length === 0) {
        showToast(currentLanguage === 'da' ? 'Ingen data uploadet endnu' : 'No data uploaded yet', 'warning');
        return;
    }
    
    const modal = document.getElementById('dataModal');
    const thead = document.getElementById('dataTableHead');
    const tbody = document.getElementById('dataTableBody');
    
    // Build dynamic headers from visible columns only
    const headers = ['#'];
    const columnsToShow = visibleColumns.length > 0 ? visibleColumns : allColumnNames;
    if (columnsToShow && columnsToShow.length > 0) {
        headers.push(...columnsToShow);
    } else if (uploadedData[0] && uploadedData[0]._original) {
        headers.push(...Object.keys(uploadedData[0]._original));
    } else {
        headers.push(t('item-name'), t('consumption'), t('price'));
    }
    
    thead.innerHTML = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
    
    // Build dynamic rows with all column data
    tbody.innerHTML = uploadedData.map((item, index) => {
        const cells = [`<td>${index + 1}</td>`];
        
        if (item._original) {
            // Use original data to preserve all columns in correct order
            const columnNames = visibleColumns.length > 0 ? visibleColumns : (allColumnNames && allColumnNames.length > 0 ? allColumnNames : Object.keys(item._original));
            columnNames.forEach(colName => {
                const value = item._original[colName];
                const displayValue = typeof value === 'number' ? value.toLocaleString(currentLanguage === 'da' ? 'da-DK' : 'en-US') : (value || '');
                cells.push(`<td>${displayValue}</td>`);
            });
        } else {
            // Fallback to basic columns
            cells.push(`<td>${item.name}</td>`);
            cells.push(`<td>${item.consumption}</td>`);
            cells.push(`<td>${item.price}</td>`);
        }
        
        return `<tr>${cells.join('')}</tr>`;
    }).join('');
    
    modal.classList.remove('hidden');
}

function closeDataModal() {
    document.getElementById('dataModal').classList.add('hidden');
}

// Item Details Functions
function showItemDetails(index) {
    if (index < 0 || index >= abcResults.length) return;
    
    const item = abcResults[index];
    const totalValue = abcResults.reduce((sum, i) => sum + i.value, 0);
    const valuePercent = ((item.value / totalValue) * 100).toFixed(2);
    const rank = index + 1;
    
    // Calculate annual turnover rate and inventory metrics
    const annualValue = item.value;
    const avgInventoryValue = (item.consumption * item.price) / 2;
    
    // Group descriptions
    const groupDescriptions = {
        'A': currentLanguage === 'da' 
            ? 'Høj værdi vare - kræver tæt overvågning og hyppig genopfyldning. Disse varer udgør typisk 70-80% af den samlede lagerværdi.'
            : 'High value item - requires close monitoring and frequent replenishment. These items typically account for 70-80% of total inventory value.',
        'B': currentLanguage === 'da'
            ? 'Medium værdi vare - moderat overvågning. Disse varer udgør typisk 15-25% af den samlede lagerværdi.'
            : 'Medium value item - moderate monitoring. These items typically account for 15-25% of total inventory value.',
        'C': currentLanguage === 'da'
            ? 'Lav værdi vare - minimal overvågning. Disse varer udgør typisk 5% af den samlede lagerværdi, men kan være mange enheder.'
            : 'Low value item - minimal monitoring. These items typically account for 5% of total inventory value but may be many units.'
    };
    
    const modal = document.getElementById('itemDetailsModal');
    const content = document.getElementById('itemDetailsContent');
    
    content.innerHTML = `
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4 mb-4">
            <h4 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">${item.name}</h4>
            <div class="flex items-center gap-3">
                <span class="group-badge group-${item.group} text-lg px-4 py-1">${currentLanguage === 'da' ? 'Gruppe' : 'Group'} ${item.group}</span>
                <span class="text-gray-600 dark:text-gray-300">Ranking: #${rank} ${currentLanguage === 'da' ? 'af' : 'of'} ${abcResults.length}</span>
            </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">${currentLanguage === 'da' ? 'Forbrug (årligt)' : 'Consumption (yearly)'}</div>
                <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">${item.consumption.toLocaleString()}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">${currentLanguage === 'da' ? 'enheder' : 'units'}</div>
            </div>
            
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">${currentLanguage === 'da' ? 'Pris pr. enhed' : 'Price per unit'}</div>
                <div class="text-2xl font-bold text-green-600 dark:text-green-400">${item.price.toLocaleString()}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">DKK</div>
            </div>
            
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">${currentLanguage === 'da' ? 'Total Værdi (årlig)' : 'Total Value (yearly)'}</div>
                <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">${item.value.toLocaleString()}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">DKK</div>
            </div>
            
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">${currentLanguage === 'da' ? 'Værdi %' : 'Value %'}</div>
                <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">${valuePercent}%</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">${currentLanguage === 'da' ? 'af total' : 'of total'}</div>
            </div>
        </div>
        
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 mb-4">
            <h5 class="font-semibold text-gray-800 dark:text-white mb-2">📊 ${currentLanguage === 'da' ? 'Kumulativ Position' : 'Cumulative Position'}</h5>
            <div class="flex items-center gap-2">
                <div class="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-4">
                    <div class="bg-blue-500 h-4 rounded-full" style="width: ${item.cumulativePercent}%"></div>
                </div>
                <span class="font-bold text-blue-600 dark:text-blue-400">${item.cumulativePercent.toFixed(2)}%</span>
            </div>
        </div>
        
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h5 class="font-semibold text-gray-800 dark:text-white mb-2">💡 ${item.group}-${currentLanguage === 'da' ? 'Gruppe' : 'Group'} Information</h5>
            <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">${groupDescriptions[item.group]}</p>
        </div>
        
        <div class="mt-4 flex gap-2">
            <button onclick="closeItemDetailsModal()" class="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors">
                ${currentLanguage === 'da' ? 'Luk' : 'Close'}
            </button>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

function closeItemDetailsModal() {
    document.getElementById('itemDetailsModal').classList.add('hidden');
}

// Data Quality Validation
function validateDataQuality(data) {
    let issues = [];
    let score = 100;
    
    // Check for duplicates
    const names = data.map(item => item.name.toLowerCase());
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
    if (duplicates.length > 0) {
        issues.push(currentLanguage === 'da' ? `${duplicates.length} duplikerede varenavne fundet` : `${duplicates.length} duplicate item names found`);
        score -= 20;
    }
    
    // Check for zero values
    const zeros = data.filter(item => item.consumption === 0 || item.price === 0);
    if (zeros.length > 0) {
        issues.push(currentLanguage === 'da' ? `${zeros.length} varer med nul forbrug eller pris` : `${zeros.length} items with zero consumption or price`);
        score -= 15;
    }
    
    // Check for missing data
    const missing = data.filter(item => !item.name || item.consumption === undefined || item.price === undefined);
    if (missing.length > 0) {
        issues.push(currentLanguage === 'da' ? `${missing.length} varer med manglende data` : `${missing.length} items with missing data`);
        score -= 30;
    }
    
    // Check for outliers (extreme values)
    const values = data.map(item => ({ name: item.name, value: item.consumption * item.price }));
    const valueArray = values.map(v => v.value);
    const mean = valueArray.reduce((a, b) => a + b, 0) / valueArray.length;
    const stdDev = Math.sqrt(valueArray.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / valueArray.length);
    const outlierItems = values.filter(v => Math.abs(v.value - mean) > 3 * stdDev);
    if (outlierItems.length > 0) {
        const displayLimit = 5;
        const outlierNames = outlierItems.slice(0, displayLimit).map(o => 
            `<span class="inline-block px-2 py-1 bg-yellow-100 dark:bg-yellow-900 rounded text-sm mr-2 mb-1"><strong>${o.name}</strong>: ${o.value.toLocaleString(currentLanguage === 'da' ? 'da-DK' : 'en-US')}</span>`
        ).join('');
        const moreText = outlierItems.length > displayLimit ? `<span class="text-gray-600 dark:text-gray-400">+ ${outlierItems.length - displayLimit} ${currentLanguage === 'da' ? 'flere varer' : 'more items'}</span>` : '';
        issues.push(currentLanguage === 'da' ? `${outlierItems.length} potentielle outliers fundet (værdier >3 standardafvigelser fra gennemsnit):<br><div class="mt-2">${outlierNames}${moreText}</div>` : `${outlierItems.length} potential outliers detected (values >3 std deviations from mean):<br><div class="mt-2">${outlierNames}${moreText}</div>`);
        score -= 10;
    }
    
    score = Math.max(0, score);
    
    return { score, issues };
}

function displayQualityCheck(quality) {
    const section = document.getElementById('qualityCheck');
    const scoreEl = document.getElementById('qualityScore');
    const issuesEl = document.getElementById('qualityIssues');
    
    // If quality check section doesn't exist, skip display
    if (!section || !scoreEl || !issuesEl) {
        console.log('Quality check UI elements not found - skipping display');
        return;
    }
    
    section.classList.remove('hidden');
    scoreEl.textContent = quality.score;
    
    // Update border color based on score
    section.classList.remove('border-blue-500', 'border-green-500', 'border-yellow-500', 'border-red-500');
    section.classList.remove('bg-blue-50', 'bg-green-50', 'bg-yellow-50', 'bg-red-50');
    
    if (quality.score >= 90) {
        section.classList.add('border-green-500', 'bg-green-50');
    } else if (quality.score >= 70) {
        section.classList.add('border-blue-500', 'bg-blue-50');
    } else if (quality.score >= 50) {
        section.classList.add('border-yellow-500', 'bg-yellow-50');
    } else {
        section.classList.add('border-red-500', 'bg-red-50');
    }
    
    if (quality.issues.length > 0) {
        issuesEl.innerHTML = quality.issues.map(issue => `<li>⚠️ ${issue}</li>`).join('');
    } else {
        issuesEl.innerHTML = `<li>✅ ${currentLanguage === 'da' ? 'Ingen problemer fundet' : 'No issues found'}</li>`;
    }
}

// Export to Excel
function exportToExcel() {
    if (abcResults.length === 0) {
        showToast(currentLanguage === 'da' ? 'Ingen data at eksportere' : 'No data to export', 'warning');
        return;
    }
    
    const wb = XLSX.utils.book_new();
    
    // ABC Analysis Sheet - include ALL original columns plus ABC results
    const abcData = abcResults.map(item => {
        const row = {};
        
        // Add all original columns first
        if (item._original) {
            Object.keys(item._original).forEach(key => {
                row[key] = item._original[key];
            });
        }
        
        // Add ABC analysis results
        row[t('value')] = item.value;
        row[t('cumulative')] = item.cumulativePercent ? item.cumulativePercent.toFixed(2) + '%' : (item.cumulative || '');
        row[t('group')] = item.group;
        
        return row;
    });
    
    const ws1 = XLSX.utils.json_to_sheet(abcData);
    
    // Set column widths
    ws1['!cols'] = [
        { wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 8 }
    ];
    
    XLSX.utils.book_append_sheet(wb, ws1, "ABC Analysis");
    
    // Summary Sheet
    const summary = [
        ['Metric', 'Value'],
        ['Total Items', abcResults.length],
        ['Total Value', abcResults.reduce((sum, item) => sum + item.value, 0)],
        ['A-Items', abcResults.filter(item => item.group === 'A').length],
        ['B-Items', abcResults.filter(item => item.group === 'B').length],
        ['C-Items', abcResults.filter(item => item.group === 'C').length],
        ['Analysis Date', new Date().toLocaleString()]
    ];
    
    const ws2 = XLSX.utils.aoa_to_sheet(summary);
    ws2['!cols'] = [{ wch: 20 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws2, "Summary");
    
    XLSX.writeFile(wb, `ABC_Analysis_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    showToast(currentLanguage === 'da' ? 'Excel fil eksporteret!' : 'Excel file exported!', 'success');
}

// Comparative Analysis Functions
let compareData1 = [];
let compareData2 = [];

function setupCompareDragDrop() {
    [1, 2].forEach(num => {
        const dropZone = document.getElementById(`compareDropZone${num}`);
        const fileInput = document.getElementById(`compareFile${num}`);
        
        if (!dropZone) return;
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('dragover');
            });
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('dragover');
            });
        });
        
        dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(files[0]);
                fileInput.files = dataTransfer.files;
                handleCompareFile(num);
            }
        });
        
        // Click to browse file
        dropZone.addEventListener('click', (e) => {
            // Don't trigger if clicking the label or its children
            if (e.target.tagName !== 'LABEL' && e.target.closest('label') === null) {
                fileInput.click();
            }
        });
        
        fileInput.addEventListener('change', () => handleCompareFile(num));
    });
    
    const runBtn = document.getElementById('runCompareBtn');
    if (runBtn) {
        runBtn.addEventListener('click', runComparison);
    }
}

function handleCompareFile(fileNum) {
    const fileInput = document.getElementById(`compareFile${fileNum}`);
    const file = fileInput.files[0];
    
    if (!file) return;
    
    document.getElementById(`compareFileName${fileNum}`).textContent = file.name;
    document.getElementById(`compareFileSize${fileNum}`).textContent = (file.size / 1024).toFixed(1) + ' KB';
    document.getElementById(`compareFileInfo${fileNum}`).classList.remove('hidden');
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = e.target.result;
        
        if (file.name.endsWith('.csv')) {
            Papa.parse(data, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (fileNum === 1) {
                        compareData1 = parseCompareData(results.data);
                    } else {
                        compareData2 = parseCompareData(results.data);
                    }
                    checkCompareReady();
                }
            });
        } else {
            const workbook = XLSX.read(data, { type: 'binary' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            
            if (fileNum === 1) {
                compareData1 = parseCompareData(jsonData);
            } else {
                compareData2 = parseCompareData(jsonData);
            }
            checkCompareReady();
        }
    };
    
    if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
    } else {
        reader.readAsBinaryString(file);
    }
}

function parseCompareData(data) {
    return data.map(row => {
        const keys = Object.keys(row);
        return {
            name: row[keys[0]] || '',
            consumption: parseFloat(row[keys[1]]) || 0,
            price: parseFloat(row[keys[2]]) || 0
        };
    }).filter(item => item.name && item.consumption && item.price);
}

function clearCompareFile(fileNum) {
    document.getElementById(`compareFile${fileNum}`).value = '';
    document.getElementById(`compareFileInfo${fileNum}`).classList.add('hidden');
    
    if (fileNum === 1) {
        compareData1 = [];
    } else {
        compareData2 = [];
    }
    checkCompareReady();
}

function checkCompareReady() {
    const btn = document.getElementById('runCompareBtn');
    if (btn) {
        btn.disabled = !(compareData1.length > 0 && compareData2.length > 0);
    }
}

let comparisonResults = null;

function runComparison() {
    if (compareData1.length === 0 || compareData2.length === 0) return;
    
    // Run ABC analysis on both datasets
    const abc1 = performABCAnalysis(compareData1);
    const abc2 = performABCAnalysis(compareData2);
    
    // Calculate changes
    const totalItems1 = abc1.length;
    const totalItems2 = abc2.length;
    const itemsChange = totalItems2 - totalItems1;
    
    const totalValue1 = abc1.reduce((sum, item) => sum + item.value, 0);
    const totalValue2 = abc2.reduce((sum, item) => sum + item.value, 0);
    const valueChange = totalValue2 - totalValue1;
    const valueChangePercent = totalValue1 > 0 ? ((valueChange / totalValue1) * 100) : 0;
    
    const aItems1 = abc1.filter(i => i.group === 'A').length;
    const aItems2 = abc2.filter(i => i.group === 'A').length;
    const aItemsChange = aItems2 - aItems1;
    const aItemsPercent = aItems1 > 0 ? ((aItemsChange / aItems1) * 100) : 0;
    
    const itemsPercent = totalItems1 > 0 ? ((itemsChange / totalItems1) * 100) : 0;
    
    // Count new items
    const allItems1 = new Set(abc1.map(i => i.name));
    const newItems = abc2.filter(i => !allItems1.has(i.name)).length;
    
    // Display summary
    document.getElementById('compareItemsChange').textContent = (itemsChange >= 0 ? '+' : '') + itemsChange;
    document.getElementById('compareItemsChange').className = itemsChange >= 0 ? 'text-2xl font-bold trend-up' : 'text-2xl font-bold trend-down';
    document.getElementById('compareItemsPercent').textContent = (itemsPercent >= 0 ? '+' : '') + itemsPercent.toFixed(1) + '%';
    
    document.getElementById('compareValueChange').textContent = (valueChange >= 0 ? '+' : '') + valueChange.toLocaleString(currentLanguage === 'da' ? 'da-DK' : 'en-US');
    document.getElementById('compareValueChange').className = valueChange >= 0 ? 'text-2xl font-bold trend-up' : 'text-2xl font-bold trend-down';
    document.getElementById('compareValuePercent').textContent = (valueChangePercent >= 0 ? '+' : '') + valueChangePercent.toFixed(1) + '%';
    
    document.getElementById('compareAItemsChange').textContent = (aItemsChange >= 0 ? '+' : '') + aItemsChange;
    document.getElementById('compareAItemsChange').className = aItemsChange >= 0 ? 'text-2xl font-bold trend-up' : 'text-2xl font-bold trend-down';
    document.getElementById('compareAItemsPercent').textContent = (aItemsPercent >= 0 ? '+' : '') + aItemsPercent.toFixed(1) + '%';
    
    document.getElementById('compareNewItems').textContent = newItems;
    
    // Build comparison table
    const allItems = new Set([...abc1.map(i => i.name), ...abc2.map(i => i.name)]);
    const tbody = document.getElementById('compareTableBody');
    
    // Store results for export
    comparisonResults = {
        abc1: abc1,
        abc2: abc2,
        summary: {
            itemsChange,
            valueChange,
            aItemsChange,
            newItems
        }
    };
    
    const comparisonRows = Array.from(allItems).map(name => {
        const item1 = abc1.find(i => i.name === name);
        const item2 = abc2.find(i => i.name === name);
        
        const class1 = item1 ? `group-badge group-${item1.group}` : '';
        const class2 = item2 ? `group-badge group-${item2.group}` : '';
        
        let trend = '➡️';
        let trendClass = 'trend-neutral';
        let changeValue = 0;
        
        if (!item1 && item2) {
            trend = '🆕 Ny';
            trendClass = 'trend-up';
            changeValue = item2.value;
        } else if (item1 && !item2) {
            trend = '❌ Fjernet';
            trendClass = 'trend-down';
            changeValue = -item1.value;
        } else if (item1 && item2) {
            const change = item2.value - item1.value;
            changeValue = change;
            if (change > 0) {
                trend = '⬆️ +' + change.toFixed(0);
                trendClass = 'trend-up';
            } else if (change < 0) {
                trend = '⬇️ ' + change.toFixed(0);
                trendClass = 'trend-down';
            } else {
                trend = '➡️ Ingen ændring';
            }
        }
        
        return {
            html: `
                <tr>
                    <td class="font-medium">${name}</td>
                    <td><span class="${class1}">${item1 ? item1.group : '-'}</span></td>
                    <td><span class="${class2}">${item2 ? item2.group : '-'}</span></td>
                    <td class="text-right">${item1 ? item1.value.toLocaleString() : '-'}</td>
                    <td class="text-right">${item2 ? item2.value.toLocaleString() : '-'}</td>
                    <td class="${trendClass} font-medium">${trend}</td>
                </tr>
            `,
            name,
            item1,
            item2,
            changeValue
        };
    });
    
    // Sort by absolute change value (biggest changes first)
    comparisonRows.sort((a, b) => Math.abs(b.changeValue) - Math.abs(a.changeValue));
    
    tbody.innerHTML = comparisonRows.map(row => row.html).join('');
    
    // Update trend arrows using CompareEnhancements
    updateCompareTrendArrows(itemsChange, valueChange, aItemsChange, newItems);
    
    // Generate change summary
    generateCompareChangeSummary(comparisonRows, itemsChange, valueChange, aItemsChange, newItems);
    
    document.getElementById('compareResults').classList.remove('hidden');
    showToast(currentLanguage === 'da' ? 'Sammenligning gennemført!' : 'Comparison completed!', 'success');
}

// Update trend arrows with animation
function updateCompareTrendArrows(itemsChange, valueChange, aItemsChange, newItems) {
    const arrows = [
        { id: 'compare-items-arrow', value: itemsChange },
        { id: 'compare-value-arrow', value: valueChange },
        { id: 'compare-a-items-arrow', value: aItemsChange },
        { id: 'compare-new-arrow', value: newItems }
    ];
    
    arrows.forEach(({ id, value }) => {
        const el = document.getElementById(id);
        if (!el) return;
        
        // Use CompareEnhancements if available
        if (window.CompareEnhancements && window.CompareEnhancements.trendArrows) {
            el.innerHTML = window.CompareEnhancements.trendArrows.getArrowHTML(value);
        } else {
            // Fallback
            if (value > 0) {
                el.innerHTML = '<span class="text-green-500 text-xl animate-pulse">▲</span>';
            } else if (value < 0) {
                el.innerHTML = '<span class="text-red-500 text-xl animate-pulse">▼</span>';
            } else {
                el.innerHTML = '<span class="text-gray-400 text-xl">◆</span>';
            }
        }
    });
}

// Generate change summary for comparison
function generateCompareChangeSummary(comparisonRows, itemsChange, valueChange, aItemsChange, newItems) {
    const summaryEl = document.getElementById('compare-change-summary');
    const contentEl = document.getElementById('compare-change-summary-content');
    
    if (!summaryEl || !contentEl) return;
    
    // Use CompareEnhancements if available
    if (window.CompareEnhancements && window.CompareEnhancements.changeSummary) {
        const summary = window.CompareEnhancements.changeSummary.generate({
            itemsChange,
            valueChange,
            aItemsChange,
            newItems,
            topChanges: comparisonRows.slice(0, 5)
        });
        contentEl.innerHTML = summary;
        summaryEl.classList.remove('hidden');
    } else {
        // Fallback summary
        const topChanges = comparisonRows.slice(0, 3);
        const summaryPoints = [];
        
        if (itemsChange !== 0) {
            summaryPoints.push(`${itemsChange > 0 ? '📈' : '📉'} ${Math.abs(itemsChange)} items ${itemsChange > 0 ? 'added' : 'removed'}`);
        }
        if (valueChange !== 0) {
            summaryPoints.push(`${valueChange > 0 ? '💰' : '📉'} Total value ${valueChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(valueChange).toLocaleString()}`);
        }
        if (aItemsChange !== 0) {
            summaryPoints.push(`${aItemsChange > 0 ? '⬆️' : '⬇️'} ${Math.abs(aItemsChange)} A-items ${aItemsChange > 0 ? 'gained' : 'lost'}`);
        }
        if (topChanges.length > 0) {
            summaryPoints.push(`🔝 Biggest changes: ${topChanges.map(r => r.name).join(', ')}`);
        }
        
        contentEl.innerHTML = `<ul class="list-disc list-inside space-y-1">${summaryPoints.map(p => `<li>${p}</li>`).join('')}</ul>`;
        summaryEl.classList.remove('hidden');
    }
}

// Calculate classification confidence score for an item
function calculateClassificationConfidence(item, index, totalValue) {
    // Use ABCEnhancements if available
    if (window.ABCEnhancements && window.ABCEnhancements.confidenceScores) {
        return window.ABCEnhancements.confidenceScores.calculate(item, index, abcResults, totalValue);
    }
    
    // Fallback calculation
    const thresholds = getABCThresholds();
    const itemPercent = (item.value / totalValue) * 100;
    const cumPercent = item.cumulativePercent;
    
    // Calculate distance from nearest boundary
    let distanceFromBoundary = 100;
    
    if (item.group === 'A') {
        // Distance from A/B boundary
        distanceFromBoundary = Math.abs(cumPercent - thresholds.A);
    } else if (item.group === 'B') {
        // Distance from either A/B or B/C boundary
        const distToA = Math.abs(cumPercent - thresholds.A);
        const distToC = Math.abs(cumPercent - (thresholds.A + thresholds.B));
        distanceFromBoundary = Math.min(distToA, distToC);
    } else {
        // C items - distance from B/C boundary
        distanceFromBoundary = Math.abs(cumPercent - (thresholds.A + thresholds.B));
    }
    
    // Items far from boundaries have higher confidence
    // Scale: 0-5% from boundary = low, 5-15% = medium, >15% = high
    let confidence = 50; // Base confidence
    
    if (distanceFromBoundary > 15) {
        confidence = 95;
    } else if (distanceFromBoundary > 10) {
        confidence = 85;
    } else if (distanceFromBoundary > 5) {
        confidence = 75;
    } else if (distanceFromBoundary > 2) {
        confidence = 65;
    } else {
        confidence = 55; // Very close to boundary
    }
    
    // Boost confidence for items with significant value contribution
    if (itemPercent > 5) confidence = Math.min(99, confidence + 5);
    
    return Math.round(confidence);
}

function performABCAnalysis(data) {
    const thresholds = getABCThresholds();
    const processed = data.map(item => ({
        ...item,
        value: item.consumption * item.price
    }));
    
    processed.sort((a, b) => b.value - a.value);
    
    const totalValue = processed.reduce((sum, item) => sum + item.value, 0);
    let cumulative = 0;
    
    return processed.map(item => {
        cumulative += item.value;
        const cumulativePercent = (cumulative / totalValue) * 100;
        
        let group = 'C';
        if (cumulativePercent <= thresholds.A) {
            group = 'A';
        } else if (cumulativePercent <= thresholds.A + thresholds.B) {
            group = 'B';
        }
        
        return {
            ...item,
            cumulative: cumulativePercent.toFixed(2),
            group
        };
    });
}

// ABC Threshold Management
function getABCThresholds() {
    const a = parseInt(document.getElementById('thresholdASingle')?.value || 80);
    const b = parseInt(document.getElementById('thresholdBSingle')?.value || 15);
    return { A: a, B: b, C: 100 - a - b };
}

function applyABCPreset(preset) {
    const presets = {
        tight: { A: 60, B: 30, C: 10 },
        standard: { A: 80, B: 15, C: 5 },
        relaxed: { A: 70, B: 20, C: 10 }
    };
    
    const values = presets[preset];
    document.getElementById('thresholdASingle').value = values.A;
    document.getElementById('thresholdBSingle').value = values.B;
    document.getElementById('thresholdC').value = values.C;
    
    localStorage.setItem('abcThresholds', JSON.stringify(values));
    
    showToast(currentLanguage === 'da' ? 'Tærskelværdier opdateret' : 'Thresholds updated', 'success');
}

function validateThresholds() {
    const a = parseInt(document.getElementById('thresholdASingle').value);
    const b = parseInt(document.getElementById('thresholdBSingle').value);
    const c = 100 - a - b;
    
    document.getElementById('thresholdC').value = c;
    
    if (c < 0) {
        showToast(currentLanguage === 'da' ? 'Tærskler skal summere til 100%' : 'Thresholds must sum to 100%', 'error');
        applyABCPreset('standard');
    } else {
        localStorage.setItem('abcThresholds', JSON.stringify({ A: a, B: b, C: c }));
        
        // === ENHANCEMENT: Save thresholds per file ===
        if (window.ABCEnhancements && currentFileName) {
            ABCEnhancements.thresholdMemory.save(currentFileName, { A: a, B: b, C: c });
        }
    }
}

// Load saved thresholds for current file (Enhancement)
function loadSavedThresholds() {
    if (window.ABCEnhancements && currentFileName) {
        const saved = ABCEnhancements.thresholdMemory.load(currentFileName);
        if (saved) {
            document.getElementById('thresholdASingle').value = saved.A;
            document.getElementById('thresholdBSingle').value = saved.B;
            document.getElementById('thresholdC').value = saved.C;
            showToast(currentLanguage === 'da' ? 'Gemte tærskler indlæst' : 'Saved thresholds loaded', 'info');
            return true;
        }
    }
    return false;
}

// Toast Notification System
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Keyboard Shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Skip if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
            return;
        }
        
        // Number keys 1-9 for quick tab navigation (without modifiers)
        if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key >= '1' && e.key <= '9') {
            const tabMap = {
                '1': 'dashboard',
                '2': 'abc',
                '3': 'double-abc',
                '4': 'wilson-eoq',
                '5': 'wilson',
                '6': 'safety-stock',
                '7': 'compare',
                '8': 'lean',
                '9': 'settings'
            };
            const tabName = tabMap[e.key];
            if (tabName) {
                e.preventDefault();
                const tabButton = document.querySelector(`[data-tab="${tabName}"]`);
                if (tabButton && !tabButton.disabled) {
                    switchTab(tabName, tabButton);
                    showToast(`${e.key}⃣ → ${tabName.replace('-', ' ').toUpperCase()}`, 'info', 1000);
                }
            }
        }
        
        // Ctrl/Cmd + U: Upload file
        if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
            e.preventDefault();
            document.getElementById('fileInput')?.click();
        }
        
        // Ctrl/Cmd + A: ABC tab (conflicts with select all, so using Alt+A)
        if (e.altKey && e.key === 'a') {
            e.preventDefault();
            switchTab('abc', document.querySelector('[data-tab="abc"]'));
        }
        
        // Ctrl/Cmd + W: Wilson tab
        if (e.altKey && e.key === 'w') {
            e.preventDefault();
            switchTab('wilson', document.querySelector('[data-tab="wilson"]'));
        }
        
        // Ctrl/Cmd + S: Settings tab
        if (e.altKey && e.key === 's') {
            e.preventDefault();
            switchTab('settings', document.querySelector('[data-tab="settings"]'));
        }
        
        // Ctrl/Cmd + D: Dashboard tab
        if (e.altKey && e.key === 'd') {
            e.preventDefault();
            switchTab('dashboard', document.querySelector('[data-tab="dashboard"]'));
        }
        
        // Ctrl/Cmd + E: Export to Excel
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            exportToExcel();
        }
    });
}

// Export Comparison Functions
function exportComparisonCSV() {
    if (!comparisonResults) {
        showToast(currentLanguage === 'da' ? 'Ingen sammenligning at eksportere' : 'No comparison to export', 'warning');
        return;
    }
    
    const headers = 'Varenavn,P1 Gruppe,P1 Værdi,P2 Gruppe,P2 Værdi,Ændring\n';
    const allItems = new Set([...comparisonResults.abc1.map(i => i.name), ...comparisonResults.abc2.map(i => i.name)]);
    
    const rows = Array.from(allItems).map(name => {
        const item1 = comparisonResults.abc1.find(i => i.name === name);
        const item2 = comparisonResults.abc2.find(i => i.name === name);
        const change = (item2?.value || 0) - (item1?.value || 0);
        
        return `"${name}",${item1?.group || '-'},${item1?.value.toFixed(2) || '0'},${item2?.group || '-'},${item2?.value.toFixed(2) || '0'},${change.toFixed(2)}`;
    }).join('\n');
    
    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `comparison_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showToast(currentLanguage === 'da' ? 'CSV fil downloadet!' : 'CSV file downloaded!', 'success');
}

function exportComparisonExcel() {
    if (!comparisonResults) {
        showToast(currentLanguage === 'da' ? 'Ingen sammenligning at eksportere' : 'No comparison to export', 'warning');
        return;
    }
    
    const wb = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
        ['Metric', 'Value'],
        ['Items Change', comparisonResults.summary.itemsChange],
        ['Value Change', comparisonResults.summary.valueChange],
        ['A-Items Change', comparisonResults.summary.aItemsChange],
        ['New Items', comparisonResults.summary.newItems],
        ['Comparison Date', new Date().toLocaleString()]
    ];
    
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws1, "Summary");
    
    // Detailed comparison sheet
    const allItems = new Set([...comparisonResults.abc1.map(i => i.name), ...comparisonResults.abc2.map(i => i.name)]);
    const detailData = Array.from(allItems).map(name => {
        const item1 = comparisonResults.abc1.find(i => i.name === name);
        const item2 = comparisonResults.abc2.find(i => i.name === name);
        const change = (item2?.value || 0) - (item1?.value || 0);
        
        return {
            'Varenavn': name,
            'P1 Gruppe': item1?.group || '-',
            'P1 Værdi': item1?.value || 0,
            'P2 Gruppe': item2?.group || '-',
            'P2 Værdi': item2?.value || 0,
            'Ændring': change
        };
    });
    
    const ws2 = XLSX.utils.json_to_sheet(detailData);
    XLSX.utils.book_append_sheet(wb, ws2, "Comparison");
    
    XLSX.writeFile(wb, `comparison_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    showToast(currentLanguage === 'da' ? 'Excel fil eksporteret!' : 'Excel file exported!', 'success');
}

// ========================================
// Education Mode Functions
// ========================================

function toggleEducationMode() {
    const toggle = document.getElementById('educationModeToggle');
    const learningContent = document.getElementById('learningContent');
    const educationNotice = document.getElementById('educationModeNotice');
    const learnTabBtn = document.getElementById('learnTabBtn');
    
    educationMode = toggle.checked;
    localStorage.setItem('educationMode', educationMode);
    
    if (educationMode) {
        if (learningContent) learningContent.classList.remove('hidden');
        if (educationNotice) educationNotice.classList.add('hidden');
        if (learnTabBtn) learnTabBtn.classList.remove('hidden');
        showToast(currentLanguage === 'da' ? '📚 Uddannelsestilstand aktiveret' : '📚 Education mode enabled', 'success');
    } else {
        if (learningContent) learningContent.classList.add('hidden');
        if (educationNotice) educationNotice.classList.remove('hidden');
        if (learnTabBtn) learnTabBtn.classList.add('hidden');
        showToast(currentLanguage === 'da' ? '📚 Uddannelsestilstand deaktiveret' : '📚 Education mode disabled', 'info');
    }
}

function loadSampleDataset(type) {
    let dataset = [];
    let datasetName = '';
    
    if (type === 'retail') {
        datasetName = currentLanguage === 'da' ? 'Detailbutik (15 varer)' : 'Retail Store (15 items)';
        dataset = [
            { name: 'Mælk 1L', consumption: 2400, price: 12 },
            { name: 'Brød hvidt', consumption: 3600, price: 18 },
            { name: 'Smør 500g', consumption: 1200, price: 35 },
            { name: 'Æg 12 stk', consumption: 1800, price: 28 },
            { name: 'Kaffe 500g', consumption: 900, price: 65 },
            { name: 'Sukker 1kg', consumption: 600, price: 15 },
            { name: 'Mel 1kg', consumption: 480, price: 12 },
            { name: 'Pasta 500g', consumption: 720, price: 8 },
            { name: 'Ris 1kg', consumption: 360, price: 18 },
            { name: 'Tomatdåse', consumption: 840, price: 9 },
            { name: 'Shampoo 250ml', consumption: 300, price: 45 },
            { name: 'Toiletpapir 8 rl', consumption: 420, price: 32 },
            { name: 'Tandpasta', consumption: 240, price: 28 },
            { name: 'Chips 200g', consumption: 180, price: 22 },
            { name: 'Chokolade 100g', consumption: 150, price: 18 }
        ];
    } else if (type === 'warehouse') {
        datasetName = currentLanguage === 'da' ? 'Lager (50 varer)' : 'Warehouse (50 items)';
        dataset = [
            // A-items (high value)
            { name: 'Laptop Dell XPS', consumption: 240, price: 8500 },
            { name: 'Monitor 27" 4K', consumption: 360, price: 3200 },
            { name: 'iPhone 15 Pro', consumption: 480, price: 9500 },
            { name: 'Printer HP LaserJet', consumption: 120, price: 4800 },
            { name: 'Server HP ProLiant', consumption: 60, price: 28000 },
            { name: 'Router Cisco', consumption: 180, price: 5600 },
            { name: 'MacBook Pro 16"', consumption: 96, price: 22000 },
            { name: 'iPad Pro 12.9"', consumption: 200, price: 7800 },
            // B-items (medium value)
            { name: 'Keyboard Logitech', consumption: 480, price: 450 },
            { name: 'Mouse Wireless', consumption: 720, price: 280 },
            { name: 'Webcam HD', consumption: 360, price: 650 },
            { name: 'Headset Jabra', consumption: 240, price: 890 },
            { name: 'USB-C Hub', consumption: 600, price: 320 },
            { name: 'SSD 1TB Samsung', consumption: 300, price: 980 },
            { name: 'RAM 32GB DDR5', consumption: 180, price: 1450 },
            { name: 'External HDD 4TB', consumption: 240, price: 1200 },
            { name: 'Docking Station', consumption: 150, price: 2100 },
            { name: 'UPS APC 1500VA', consumption: 120, price: 1800 },
            // C-items (low value)
            { name: 'USB Cable 2m', consumption: 1200, price: 45 },
            { name: 'HDMI Cable 3m', consumption: 960, price: 85 },
            { name: 'Ethernet Cable CAT6', consumption: 1440, price: 35 },
            { name: 'USB Stick 32GB', consumption: 720, price: 68 },
            { name: 'Screen Cleaner', consumption: 480, price: 42 },
            { name: 'Cable Ties 100pk', consumption: 360, price: 28 },
            { name: 'Labels A4 100pk', consumption: 600, price: 55 },
            { name: 'Pen Box 10pk', consumption: 840, price: 22 },
            { name: 'Notebook A4', consumption: 720, price: 18 },
            { name: 'Folder Plastic', consumption: 960, price: 8 },
            { name: 'Stapler Metal', consumption: 240, price: 65 },
            { name: 'Tape Dispenser', consumption: 180, price: 48 },
            { name: 'Scissors Office', consumption: 300, price: 32 },
            { name: 'Hole Punch 2-hole', consumption: 150, price: 78 },
            { name: 'Calculator Basic', consumption: 200, price: 95 },
            { name: 'Desk Organizer', consumption: 120, price: 125 },
            { name: 'Whiteboard Marker', consumption: 600, price: 12 },
            { name: 'Sticky Notes 100pk', consumption: 840, price: 15 },
            { name: 'Paper Clips 200pk', consumption: 480, price: 8 },
            { name: 'Rubber Bands 100g', consumption: 360, price: 18 },
            { name: 'Envelope C5 100pk', consumption: 420, price: 38 },
            { name: 'A4 Paper 500 sheets', consumption: 960, price: 42 },
            { name: 'Toner Cartridge', consumption: 240, price: 420 },
            { name: 'Batteries AA 10pk', consumption: 600, price: 48 },
            { name: 'Extension Cord 3m', consumption: 180, price: 95 },
            { name: 'Desk Lamp LED', consumption: 150, price: 245 },
            { name: 'Monitor Stand', consumption: 120, price: 180 },
            { name: 'Keyboard Tray', consumption: 90, price: 220 },
            { name: 'Mouse Pad XL', consumption: 360, price: 85 },
            { name: 'Cable Management Box', consumption: 240, price: 68 },
            { name: 'Phone Holder', consumption: 300, price: 52 }
        ];
    } else if (type === 'manufacturing') {
        datasetName = currentLanguage === 'da' ? 'Produktion (100 varer)' : 'Manufacturing (100 items)';
        dataset = [
            // Raw materials - A-items
            { name: 'Steel Sheet 2mm', consumption: 12000, price: 185 },
            { name: 'Aluminum Rod Ø50mm', consumption: 8400, price: 245 },
            { name: 'Copper Wire 2.5mm²', consumption: 15600, price: 128 },
            { name: 'Brass Tube Ø25mm', consumption: 6000, price: 312 },
            { name: 'Stainless Steel 304', consumption: 4800, price: 425 },
            // Electronic components - A/B-items
            { name: 'PCB Assembly Main', consumption: 2400, price: 850 },
            { name: 'Motor 3-Phase 5kW', consumption: 1200, price: 3200 },
            { name: 'Servo Drive 2kW', consumption: 960, price: 4500 },
            { name: 'PLC Siemens S7-1200', consumption: 480, price: 6800 },
            { name: 'HMI Touch Panel 10"', consumption: 600, price: 2400 },
            { name: 'Power Supply 24V 10A', consumption: 1800, price: 680 },
            { name: 'Sensor Proximity', consumption: 3600, price: 185 },
            { name: 'Encoder Rotary 1024ppr', consumption: 1200, price: 520 },
            { name: 'Relay 24VDC 16A', consumption: 2400, price: 78 },
            { name: 'Contactor 3-Pole 32A', consumption: 1440, price: 245 },
            // Mechanical components - B/C-items
            { name: 'Bearing 6205-2RS', consumption: 4800, price: 45 },
            { name: 'Bearing 6308-2Z', consumption: 2400, price: 98 },
            { name: 'V-Belt A50', consumption: 1800, price: 125 },
            { name: 'Chain 12B-1 10ft', consumption: 1200, price: 320 },
            { name: 'Sprocket 12B 20T', consumption: 960, price: 165 },
            { name: 'Gear 20DP 40T', consumption: 720, price: 280 },
            { name: 'Shaft Ø40mm L500', consumption: 1440, price: 185 },
            { name: 'Coupling Flexible Ø40', consumption: 600, price: 425 },
            { name: 'Pulley V-Belt Ø200', consumption: 480, price: 245 },
            { name: 'Belt Guard Metal', consumption: 360, price: 320 },
            // Fasteners - C-items
            { name: 'Bolt M8x30 DIN933', consumption: 24000, price: 2.5 },
            { name: 'Bolt M10x40 DIN933', consumption: 18000, price: 3.8 },
            { name: 'Bolt M12x50 DIN933', consumption: 12000, price: 5.2 },
            { name: 'Nut M8 DIN934', consumption: 24000, price: 1.2 },
            { name: 'Nut M10 DIN934', consumption: 18000, price: 1.8 },
            { name: 'Nut M12 DIN934', consumption: 12000, price: 2.4 },
            { name: 'Washer M8 DIN125', consumption: 24000, price: 0.6 },
            { name: 'Washer M10 DIN125', consumption: 18000, price: 0.9 },
            { name: 'Washer M12 DIN125', consumption: 12000, price: 1.2 },
            { name: 'Screw M6x20 DIN912', consumption: 36000, price: 1.8 },
            { name: 'Screw M8x25 DIN912', consumption: 24000, price: 2.8 },
            { name: 'Lock Washer M8', consumption: 24000, price: 0.8 },
            { name: 'Lock Washer M10', consumption: 18000, price: 1.1 },
            { name: 'Lock Nut M10', consumption: 12000, price: 3.2 },
            { name: 'Grub Screw M8x10', consumption: 9600, price: 1.5 },
            // Pneumatic components - B-items
            { name: 'Cylinder Ø50 S200', consumption: 720, price: 680 },
            { name: 'Cylinder Ø63 S300', consumption: 480, price: 920 },
            { name: 'Valve 5/2 24VDC', consumption: 1200, price: 285 },
            { name: 'Valve 3/2 24VDC', consumption: 1800, price: 165 },
            { name: 'Air Filter 1/2"', consumption: 600, price: 245 },
            { name: 'Regulator 1/2"', consumption: 600, price: 320 },
            { name: 'Lubricator 1/2"', consumption: 480, price: 280 },
            { name: 'Tube PA 8mm 50m', consumption: 960, price: 95 },
            { name: 'Fitting Push 8mm', consumption: 4800, price: 12 },
            { name: 'Fitting Elbow 8mm', consumption: 2400, price: 15 },
            // Hydraulic components - A/B-items
            { name: 'Pump Gear 16cc', consumption: 240, price: 3200 },
            { name: 'Valve Directional 4/3', consumption: 360, price: 1850 },
            { name: 'Cylinder Ø80 S500', consumption: 180, price: 2400 },
            { name: 'Hose DN16 20m', consumption: 480, price: 185 },
            { name: 'Filter Element 10µm', consumption: 720, price: 125 },
            { name: 'Accumulator 1L', consumption: 120, price: 980 },
            { name: 'Pressure Switch', consumption: 360, price: 420 },
            { name: 'Flow Control Valve', consumption: 480, price: 520 },
            // Consumables - C-items
            { name: 'Cutting Oil 5L', consumption: 960, price: 185 },
            { name: 'Lubricating Oil 20L', consumption: 480, price: 425 },
            { name: 'Grease Cartridge 400g', consumption: 1200, price: 48 },
            { name: 'Grinding Disc Ø125', consumption: 2400, price: 18 },
            { name: 'Cut-off Wheel Ø230', consumption: 1800, price: 22 },
            { name: 'Drill Bit HSS Ø8mm', consumption: 720, price: 28 },
            { name: 'Drill Bit HSS Ø10mm', consumption: 600, price: 35 },
            { name: 'End Mill Ø12mm', consumption: 360, price: 165 },
            { name: 'End Mill Ø16mm', consumption: 240, price: 220 },
            { name: 'Thread Tap M8', consumption: 480, price: 45 },
            { name: 'Thread Tap M10', consumption: 360, price: 58 },
            { name: 'Saw Blade 250mm', consumption: 240, price: 185 },
            { name: 'Sanding Belt 100x610', consumption: 1200, price: 12 },
            { name: 'Wire Brush Ø100', consumption: 480, price: 32 },
            { name: 'Safety Gloves L', consumption: 2400, price: 15 },
            { name: 'Safety Glasses', consumption: 960, price: 28 },
            { name: 'Ear Protection', consumption: 600, price: 45 },
            { name: 'Face Shield', consumption: 360, price: 68 },
            { name: 'Welding Gloves', consumption: 480, price: 85 },
            { name: 'Welding Electrode Ø3.2', consumption: 1800, price: 8 },
            { name: 'Welding Wire Ø1.0', consumption: 1200, price: 125 },
            { name: 'Grinding Stone Ø200', consumption: 360, price: 95 },
            // Packaging materials - C-items
            { name: 'Cardboard Box L', consumption: 4800, price: 12 },
            { name: 'Cardboard Box M', consumption: 7200, price: 8 },
            { name: 'Bubble Wrap 100m', consumption: 960, price: 185 },
            { name: 'Stretch Film 500m', consumption: 1200, price: 145 },
            { name: 'Pallet EUR 1200x800', consumption: 2400, price: 68 },
            { name: 'Strapping Band 12mm', consumption: 1800, price: 95 },
            { name: 'Label Printer Roll', consumption: 720, price: 45 },
            { name: 'Packing Tape 50m', consumption: 2400, price: 18 },
            // Electrical materials - C-items
            { name: 'Cable 3x2.5mm² 100m', consumption: 480, price: 285 },
            { name: 'Cable 4x1.5mm² 100m', consumption: 600, price: 185 },
            { name: 'Cable Gland M20', consumption: 1800, price: 12 },
            { name: 'Cable Gland M25', consumption: 1200, price: 15 },
            { name: 'Terminal Block 10mm²', consumption: 2400, price: 8 },
            { name: 'DIN Rail 35mm 2m', consumption: 960, price: 28 },
            { name: 'Cable Duct 40x40 2m', consumption: 720, price: 35 },
            { name: 'Heat Shrink Ø10mm', consumption: 1440, price: 22 },
            { name: 'Electrical Tape Black', consumption: 2400, price: 8 },
            { name: 'Zip Ties 200mm', consumption: 4800, price: 5 }
        ];
    }
    
    uploadedData = dataset;
    displayPreview();
    processABCAnalysis();
    
    // Switch to ABC tab
    const abcTab = document.querySelector('[data-tab="abc"]');
    if (abcTab) {
        switchTab('abc', abcTab);
    }
    
    // Update file info
    const fileInfoDiv = document.getElementById('fileInfo');
    const fileNameSpan = document.getElementById('fileName');
    const fileRowsSpan = document.getElementById('fileRows');
    
    if (fileInfoDiv && fileNameSpan && fileRowsSpan) {
        fileNameSpan.textContent = datasetName;
        fileRowsSpan.textContent = uploadedData.length;
        fileInfoDiv.classList.remove('hidden');
    }
    
    showToast(currentLanguage === 'da' ? `📊 ${datasetName} indlæst!` : `📊 ${datasetName} loaded!`, 'success');
}

// ========================================
// Data Encryption Functions
// ========================================

let encryptionEnabled = false;
let encryptionKey = null;

// Simple encryption using Base64 and XOR (for demonstration - not production-grade security)
function simpleEncrypt(text, password) {
    const textBytes = new TextEncoder().encode(text);
    const keyBytes = new TextEncoder().encode(password);
    const encrypted = new Uint8Array(textBytes.length);
    
    for (let i = 0; i < textBytes.length; i++) {
        encrypted[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    return btoa(String.fromCharCode.apply(null, encrypted));
}

function simpleDecrypt(encryptedText, password) {
    try {
        const encrypted = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));
        const keyBytes = new TextEncoder().encode(password);
        const decrypted = new Uint8Array(encrypted.length);
        
        for (let i = 0; i < encrypted.length; i++) {
            decrypted[i] = encrypted[i] ^ keyBytes[i % keyBytes.length];
        }
        
        return new TextDecoder().decode(decrypted);
    } catch (e) {
        return null;
    }
}

function checkEncryptionStatus() {
    const encrypted = localStorage.getItem('dataEncrypted');
    const statusIcon = document.getElementById('encryptionStatusIcon');
    const statusText = document.getElementById('encryptionStatusText');
    const statusDesc = document.getElementById('encryptionStatusDesc');
    const toggle = document.getElementById('encryptionToggle');
    
    if (encrypted === 'true') {
        encryptionEnabled = true;
        if (toggle) toggle.checked = true;
        if (statusIcon) statusIcon.textContent = '🔒';
        if (statusText) statusText.setAttribute('data-i18n', 'encryption-enabled');
        if (statusDesc) statusDesc.setAttribute('data-i18n', 'encryption-enabled-desc');
        updateTranslations();
    }
}

function toggleEncryption() {
    const toggle = document.getElementById('encryptionToggle');
    const passwordSection = document.getElementById('encryptionPasswordSection');
    const unlockSection = document.getElementById('encryptionUnlockSection');
    
    if (toggle.checked) {
        // Show password input to enable encryption
        if (passwordSection) passwordSection.classList.remove('hidden');
        if (unlockSection) unlockSection.classList.add('hidden');
    } else {
        // Disable encryption
        disableEncryption();
    }
}

function enableEncryption() {
    const password = document.getElementById('encryptionPassword').value;
    const confirmPassword = document.getElementById('encryptionPasswordConfirm').value;
    
    if (!password || password.length < 8) {
        showToast(translations[currentLanguage]['encryption-password-short'], 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast(translations[currentLanguage]['encryption-password-mismatch'], 'error');
        return;
    }
    
    // Encrypt existing data
    encryptionKey = password;
    encryptionEnabled = true;
    
    // Store encryption flag
    localStorage.setItem('dataEncrypted', 'true');
    
    // Encrypt and save current data
    if (uploadedData && uploadedData.length > 0) {
        const dataStr = JSON.stringify(uploadedData);
        const encrypted = simpleEncrypt(dataStr, password);
        localStorage.setItem('encryptedData', encrypted);
    }
    
    // Update UI
    document.getElementById('encryptionPasswordSection').classList.add('hidden');
    document.getElementById('encryptionPassword').value = '';
    document.getElementById('encryptionPasswordConfirm').value = '';
    
    const statusIcon = document.getElementById('encryptionStatusIcon');
    const statusText = document.getElementById('encryptionStatusText');
    const statusDesc = document.getElementById('encryptionStatusDesc');
    
    if (statusIcon) statusIcon.textContent = '🔒';
    if (statusText) {
        statusText.setAttribute('data-i18n', 'encryption-enabled');
        statusText.textContent = translations[currentLanguage]['encryption-enabled'];
    }
    if (statusDesc) {
        statusDesc.setAttribute('data-i18n', 'encryption-enabled-desc');
        statusDesc.textContent = translations[currentLanguage]['encryption-enabled-desc'];
    }
    
    showToast(translations[currentLanguage]['encryption-success'], 'success');
}

function disableEncryption() {
    encryptionEnabled = false;
    encryptionKey = null;
    localStorage.removeItem('dataEncrypted');
    localStorage.removeItem('encryptedData');
    
    const statusIcon = document.getElementById('encryptionStatusIcon');
    const statusText = document.getElementById('encryptionStatusText');
    const statusDesc = document.getElementById('encryptionStatusDesc');
    const toggle = document.getElementById('encryptionToggle');
    const passwordSection = document.getElementById('encryptionPasswordSection');
    
    if (toggle) toggle.checked = false;
    if (passwordSection) passwordSection.classList.add('hidden');
    if (statusIcon) statusIcon.textContent = '🔓';
    if (statusText) {
        statusText.setAttribute('data-i18n', 'encryption-disabled');
        statusText.textContent = translations[currentLanguage]['encryption-disabled'];
    }
    if (statusDesc) {
        statusDesc.setAttribute('data-i18n', 'encryption-disabled-desc');
        statusDesc.textContent = translations[currentLanguage]['encryption-disabled-desc'];
    }
    
    showToast(translations[currentLanguage]['encryption-disabled-success'], 'success');
}

function cancelEncryption() {
    const toggle = document.getElementById('encryptionToggle');
    const passwordSection = document.getElementById('encryptionPasswordSection');
    
    if (toggle) toggle.checked = false;
    if (passwordSection) passwordSection.classList.add('hidden');
    document.getElementById('encryptionPassword').value = '';
    document.getElementById('encryptionPasswordConfirm').value = '';
}

function unlockData() {
    const password = document.getElementById('unlockPassword').value;
    
    if (!password) {
        showToast(translations[currentLanguage]['encryption-password-short'], 'error');
        return;
    }
    
    const encryptedData = localStorage.getItem('encryptedData');
    if (!encryptedData) {
        showToast(currentLanguage === 'da' ? 'Ingen krypterede data fundet' : 'No encrypted data found', 'error');
        return;
    }
    
    const decrypted = simpleDecrypt(encryptedData, password);
    
    if (!decrypted) {
        showToast(translations[currentLanguage]['encryption-unlock-failed'], 'error');
        return;
    }
    
    try {
        uploadedData = JSON.parse(decrypted);
        encryptionKey = password;
        document.getElementById('unlockPassword').value = '';
        document.getElementById('encryptionUnlockSection').classList.add('hidden');
        showToast(translations[currentLanguage]['encryption-unlock-success'], 'success');
        
        // Refresh display
        displayPreview();
        processABCAnalysis();
    } catch (e) {
        showToast(translations[currentLanguage]['encryption-unlock-failed'], 'error');
    }
}

// ========================================
// Advanced Filters & Search
// ========================================

let filteredData = [];

function applyFilters() {
    if (!abcResults || abcResults.length === 0) return;
    
    const searchTerm = document.getElementById('filterSearch')?.value.toLowerCase() || '';
    const classFilter = document.getElementById('filterClass')?.value || '';
    const sortBy = document.getElementById('filterSort')?.value || 'value-desc';
    const minValue = parseFloat(document.getElementById('filterMinValue')?.value) || 0;
    const maxValue = parseFloat(document.getElementById('filterMaxValue')?.value) || Infinity;
    
    // Filter data
    filteredData = abcResults.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm);
        const matchesClass = !classFilter || item.group === classFilter;
        const matchesValue = item.value >= minValue && item.value <= maxValue;
        
        return matchesSearch && matchesClass && matchesValue;
    });
    
    // Sort data
    filteredData.sort((a, b) => {
        switch (sortBy) {
            case 'value-desc':
                return b.value - a.value;
            case 'value-asc':
                return a.value - b.value;
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'consumption-desc':
                return b.consumption - a.consumption;
            default:
                return 0;
        }
    });
    
    // Update filter stats
    document.getElementById('filterCount').textContent = filteredData.length;
    document.getElementById('filterTotal').textContent = abcResults.length;
    
    // Redraw table with filtered data
    displayFilteredResults();
}

function resetFilters() {
    document.getElementById('filterSearch').value = '';
    document.getElementById('filterClass').value = '';
    document.getElementById('filterSort').value = 'value-desc';
    document.getElementById('filterMinValue').value = '';
    document.getElementById('filterMaxValue').value = '';
    
    applyFilters();
}

function displayFilteredResults() {
    const table = document.getElementById('resultsTable');
    if (!table || !filteredData) return;
    
    // Rebuild table with filtered data
    let html = `
        <thead>
            <tr>
                <th data-i18n="item-name">${translations[currentLanguage]['item-name']}</th>
                <th data-i18n="consumption">${translations[currentLanguage]['consumption']}</th>
                <th data-i18n="price">${translations[currentLanguage]['price']}</th>
                <th data-i18n="value">${translations[currentLanguage]['value']}</th>
                <th data-i18n="cumulative">${translations[currentLanguage]['cumulative']}</th>
                <th data-i18n="group">${translations[currentLanguage]['group']}</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    let cumulativePercent = 0;
    const totalValue = filteredData.reduce((sum, item) => sum + item.value, 0);
    
    filteredData.forEach((item, index) => {
        const percent = (item.value / totalValue) * 100;
        cumulativePercent += percent;
        
        html += `
            <tr onclick="showItemDetails('${item.name}')" class="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                <td class="font-medium">${item.name}</td>
                <td>${item.consumption.toLocaleString()}</td>
                <td>${item.price.toFixed(2)}</td>
                <td class="font-semibold">${item.value.toLocaleString()}</td>
                <td>${cumulativePercent.toFixed(1)}%</td>
                <td>
                    <span class="group-badge group-${item.group}">${item.group}</span>
                </td>
            </tr>
        `;
    });
    
    html += `</tbody>`;
    table.innerHTML = html;
}

// ========================================
// Double ABC Configuration Panel
// ========================================

function toggleDoubleABCConfig() {
    const content = document.getElementById('doubleConfigContent');
    const icon = document.getElementById('doubleConfigToggleIcon');
    
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        icon.style.transform = 'rotate(180deg)';
    } else {
        content.classList.add('hidden');
        icon.style.transform = 'rotate(0deg)';
    }
}

// ========================================
// Double ABC Filters
// ========================================

let doubleFilteredData = [];

function toggleDoubleABCFilters() {
    const content = document.getElementById('doubleFiltersContent');
    const icon = document.getElementById('doubleFiltersToggleIcon');
    
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        icon.style.transform = 'rotate(180deg)';
    } else {
        content.classList.add('hidden');
        icon.style.transform = 'rotate(0deg)';
    }
}

function applyDoubleABCFilters() {
    if (!doubleABCResults || doubleABCResults.length === 0) return;
    
    const searchTerm = document.getElementById('doubleFilterSearch')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('doubleFilterCategory')?.value || '';
    const sortBy = document.getElementById('doubleFilterSort')?.value || 'name-asc';
    
    // Filter data
    doubleFilteredData = doubleABCResults.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || item.doubleClass === categoryFilter;
        
        return matchesSearch && matchesCategory;
    });
    
    // Sort data
    doubleFilteredData.sort((a, b) => {
        switch (sortBy) {
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            default:
                return 0;
        }
    });
    
    // Update filter stats
    document.getElementById('doubleFilterCount').textContent = doubleFilteredData.length;
    document.getElementById('doubleFilterTotal').textContent = doubleABCResults.length;
    
    // Redraw table with filtered data
    displayDoubleABCFilteredResults();
}

function resetDoubleABCFilters() {
    document.getElementById('doubleFilterSearch').value = '';
    document.getElementById('doubleFilterCategory').value = '';
    document.getElementById('doubleFilterSort').value = 'name-asc';
    
    applyDoubleABCFilters();
}

function displayDoubleABCFilteredResults() {
    // Update filter stats
    document.getElementById('doubleFilterCount').textContent = doubleFilteredData.length;
    document.getElementById('doubleFilterTotal').textContent = doubleABCResults.length;
    
    // Update the main table with filtered data
    displayDoubleABCTable();
}

// ========================================
// ABC Double Analysis Functions
// ========================================

let doubleABCResults = [];

function toggleAxisCustomization() {
    const panel = document.getElementById('axisCustomization');
    const icon = document.getElementById('axisToggleIcon');
    
    if (panel.classList.contains('hidden')) {
        panel.classList.remove('hidden');
        icon.style.transform = 'rotate(180deg)';
    } else {
        panel.classList.add('hidden');
        icon.style.transform = 'rotate(0deg)';
    }
}

function toggleDoubleThresholds() {
    const content = document.getElementById('doubleThresholdsContent');
    const icon = document.getElementById('doubleThresholdsToggleIcon');
    
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        icon.style.transform = 'rotate(180deg)';
    } else {
        content.classList.add('hidden');
        icon.style.transform = 'rotate(0deg)';
    }
}

function toggleABCThresholds() {
    const content = document.getElementById('abcThresholdsContent');
    const icon = document.getElementById('abcThresholdsToggleIcon');
    
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        icon.style.transform = 'rotate(180deg)';
    } else {
        content.classList.add('hidden');
        icon.style.transform = 'rotate(0deg)';
    }
}

function toggleAdvancedFilters() {
    const content = document.getElementById('filtersContent');
    const icon = document.getElementById('filtersToggleIcon');
    
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        icon.style.transform = 'rotate(180deg)';
    } else {
        content.classList.add('hidden');
        icon.style.transform = 'rotate(0deg)';
    }
}

function updateAxisLabelsDisplay() {
    // Update detected column names (with null checks)
    const detectedConsumption = document.getElementById('detectedConsumption');
    const detectedConsumption2 = document.getElementById('detectedConsumption2');
    const detectedPrice = document.getElementById('detectedPrice');
    
    if (detectedConsumption) detectedConsumption.textContent = originalColumnNames.consumption;
    if (detectedConsumption2) detectedConsumption2.textContent = originalColumnNames.consumption;
    if (detectedPrice) detectedPrice.textContent = originalColumnNames.price;
    
    // Populate dropdown with available columns
    const horizontalSelect = document.getElementById('horizontalAxisLabel');
    const verticalSelect = document.getElementById('verticalAxisLabel');
    
    const selectColumnText = translate('select-column');
    const autoCalcText = translate('auto-calculated-column');
    
    if (horizontalSelect && allColumnNames && allColumnNames.length > 0) {
        // Clear existing options except the first placeholder
        horizontalSelect.innerHTML = `<option value="">${selectColumnText}</option>`;
        
        // Add all available columns
        allColumnNames.forEach(col => {
            const option = document.createElement('option');
            option.value = col;
            option.textContent = col;
            // Pre-select the detected consumption column
            if (col === originalColumnNames.consumption) {
                option.selected = true;
            }
            horizontalSelect.appendChild(option);
        });
    }
    
    if (verticalSelect && allColumnNames && allColumnNames.length > 0) {
        // Clear existing options except the first two
        verticalSelect.innerHTML = `<option value="">${selectColumnText}</option><option value="__calculated__">${autoCalcText}</option>`;
        
        // Add all available columns
        allColumnNames.forEach(col => {
            const option = document.createElement('option');
            option.value = col;
            option.textContent = col;
            verticalSelect.appendChild(option);
        });
        
        // Pre-select calculated value
        verticalSelect.value = '__calculated__';
    }
}

function applyAxisLabels() {
    let horizontalLabel = document.getElementById('horizontalAxisLabel').value || originalColumnNames.consumption;
    let verticalLabel = document.getElementById('verticalAxisLabel').value;
    
    // Handle calculated value option
    if (verticalLabel === '__calculated__' || !verticalLabel) {
        verticalLabel = `${originalColumnNames.price} × ${originalColumnNames.consumption}`;
    }
    
    // Update the matrix axes label
    const axesLabel = document.getElementById('matrixAxesLabel');
    if (currentLanguage === 'da') {
        axesLabel.textContent = `Første bogstav: ${verticalLabel} | Andet bogstav: ${horizontalLabel}`;
    } else {
        axesLabel.textContent = `First letter: ${verticalLabel} | Second letter: ${horizontalLabel}`;
    }
    
    // Update column headers in the matrix
    const consumptionHeaders = document.querySelectorAll('[data-i18n="consumption-high"], [data-i18n="consumption-medium"], [data-i18n="consumption-low"]');
    const valueHeaders = document.querySelectorAll('[data-i18n="value-high"], [data-i18n="value-medium"], [data-i18n="value-low"]');
    
    consumptionHeaders.forEach((header, idx) => {
        const suffix = idx === 0 ? ' A' : (idx === 1 ? ' B' : ' C');
        header.textContent = horizontalLabel + suffix;
    });
    
    valueHeaders.forEach((header, idx) => {
        const suffix = idx === 0 ? ' A' : (idx === 1 ? ' B' : ' C');
        header.textContent = verticalLabel + suffix;
    });
    
    // Re-run the analysis with new column selections (skip dropdown reset)
    if (uploadedData && uploadedData.length > 0) {
        performDoubleABCAnalysis(true);
    }
    
    showToast(translations[currentLanguage]['labels-applied'] || 'Labels applied successfully', 'success');
}

function updateDoubleThresholdLabels() {
    // Update the threshold section labels based on selected columns
    let horizontalLabel = document.getElementById('horizontalAxisLabel')?.value || '';
    let verticalLabel = document.getElementById('verticalAxisLabel')?.value || '';
    
    // Handle calculated value option or empty
    if (verticalLabel === '__calculated__' || !verticalLabel) {
        if (originalColumnNames && originalColumnNames.price && originalColumnNames.consumption) {
            verticalLabel = currentLanguage === 'da' ? 'Værdi' : 'Value';
        } else {
            verticalLabel = currentLanguage === 'da' ? 'Værdi' : 'Value';
        }
    }
    
    if (!horizontalLabel) {
        horizontalLabel = currentLanguage === 'da' ? 'Forbrug' : 'Consumption';
    }
    
    // Update threshold section labels
    const valueLabel = document.getElementById('doubleThresholdValueLabel');
    const consumptionLabel = document.getElementById('doubleThresholdConsumptionLabel');
    
    if (valueLabel) {
        const vertical = currentLanguage === 'da' ? 'Lodret' : 'Vertical';
        valueLabel.innerHTML = `${verticalLabel} <span class="text-xs text-gray-500">(${vertical})</span>`;
    }
    
    if (consumptionLabel) {
        const horizontal = currentLanguage === 'da' ? 'Vandret' : 'Horizontal';
        consumptionLabel.innerHTML = `${horizontalLabel} <span class="text-xs text-gray-500">(${horizontal})</span>`;
    }
}

function updateAxisLabelsUI() {
    // Update UI labels only, without re-running analysis
    let horizontalLabel = document.getElementById('horizontalAxisLabel').value || originalColumnNames.consumption;
    let verticalLabel = document.getElementById('verticalAxisLabel').value;
    
    // Handle calculated value option
    if (verticalLabel === '__calculated__' || !verticalLabel) {
        verticalLabel = `${originalColumnNames.price} × ${originalColumnNames.consumption}`;
    }
    
    // Update the matrix axes label
    const axesLabel = document.getElementById('matrixAxesLabel');
    if (axesLabel) {
        if (currentLanguage === 'da') {
            axesLabel.textContent = `Første bogstav: ${verticalLabel} | Andet bogstav: ${horizontalLabel}`;
        } else {
            axesLabel.textContent = `First letter: ${verticalLabel} | Second letter: ${horizontalLabel}`;
        }
    }
    
    // Update column headers in the matrix
    const consumptionHeaders = document.querySelectorAll('[data-i18n="consumption-high"], [data-i18n="consumption-medium"], [data-i18n="consumption-low"]');
    const valueHeaders = document.querySelectorAll('[data-i18n="value-high"], [data-i18n="value-medium"], [data-i18n="value-low"]');
    
    consumptionHeaders.forEach((header, idx) => {
        const suffix = idx === 0 ? ' A' : (idx === 1 ? ' B' : ' C');
        header.textContent = horizontalLabel + suffix;
    });
    
    valueHeaders.forEach((header, idx) => {
        const suffix = idx === 0 ? ' A' : (idx === 1 ? ' B' : ' C');
        header.textContent = verticalLabel + suffix;
    });
}

function performDoubleABCAnalysis(skipDropdownUpdate = false) {
    if (!uploadedData || uploadedData.length === 0) {
        showToast(translations[currentLanguage]['no-data'], 'warning');
        return;
    }
    
    // Only update dropdowns on initial load, not when user applies changes
    if (!skipDropdownUpdate) {
        updateAxisLabelsDisplay();
    }

    // Get selected columns from dropdowns
    const horizontalColumn = document.getElementById('horizontalAxisLabel')?.value || originalColumnNames.consumption;
    const verticalColumn = document.getElementById('verticalAxisLabel')?.value;
    
    console.log('📊 ABC Double Analysis - Selected columns:', {
        horizontal: horizontalColumn,
        vertical: verticalColumn,
        allColumns: allColumnNames,
        originalNames: originalColumnNames
    });
    
    // Prepare data with values based on selected columns
    const dataWithValues = uploadedData.map((item, idx) => {
        let verticalValue;
        let horizontalValue;
        
        // Check if vertical is calculated or a direct column
        if (verticalColumn === '__calculated__' || !verticalColumn) {
            // Use calculated value (price × consumption)
            verticalValue = item.consumption * item.price;
        } else {
            // Try to get from original data first, fallback to normalized
            if (item._original && item._original[verticalColumn] !== undefined) {
                verticalValue = parseFloat(item._original[verticalColumn]) || 0;
                if (idx === 0) console.log('✅ Using original data for vertical:', verticalColumn, '=', verticalValue);
            } else {
                verticalValue = parseFloat(item[verticalColumn]) || 0;
                if (idx === 0) console.log('⚠️ Fallback to normalized for vertical:', verticalColumn, '=', verticalValue);
            }
        }
        
        // Get horizontal value from original data
        if (item._original && item._original[horizontalColumn] !== undefined) {
            horizontalValue = parseFloat(item._original[horizontalColumn]) || 0;
            if (idx === 0) console.log('✅ Using original data for horizontal:', horizontalColumn, '=', horizontalValue);
        } else {
            horizontalValue = parseFloat(item[horizontalColumn]) || item.consumption || 0;
            if (idx === 0) console.log('⚠️ Fallback to normalized for horizontal:', horizontalColumn, '=', horizontalValue);
        }
        
        return {
            ...item,
            value: verticalValue,
            horizontalAxisValue: horizontalValue,
            verticalAxisValue: verticalValue
        };
    });

    // Sort by vertical axis (value) descending
    const sortedByValue = [...dataWithValues].sort((a, b) => b.verticalAxisValue - a.verticalAxisValue);
    const totalValue = sortedByValue.reduce((sum, item) => sum + item.verticalAxisValue, 0);

    // Sort by horizontal axis descending
    const sortedByHorizontal = [...dataWithValues].sort((a, b) => b.horizontalAxisValue - a.horizontalAxisValue);
    const totalHorizontal = sortedByHorizontal.reduce((sum, item) => sum + item.horizontalAxisValue, 0);

    // Get custom thresholds or use defaults
    const valueThresholdA = parseFloat(document.getElementById('doubleThresholdValueA')?.value || 80);
    const valueThresholdB = parseFloat(document.getElementById('doubleThresholdValueB')?.value || 15);
    const horizontalThresholdA = parseFloat(document.getElementById('doubleThresholdConsumptionA')?.value || 80);
    const horizontalThresholdB = parseFloat(document.getElementById('doubleThresholdConsumptionB')?.value || 15);

    // Classify by vertical axis (first letter)
    let cumValuePercent = 0;
    sortedByValue.forEach(item => {
        cumValuePercent += (item.verticalAxisValue / totalValue) * 100;
        if (cumValuePercent <= valueThresholdA) {
            item.valueClass = 'A';
        } else if (cumValuePercent <= valueThresholdA + valueThresholdB) {
            item.valueClass = 'B';
        } else {
            item.valueClass = 'C';
        }
    });

    // Classify by horizontal axis (second letter)
    let cumHorizontalPercent = 0;
    sortedByHorizontal.forEach(item => {
        cumHorizontalPercent += (item.horizontalAxisValue / totalHorizontal) * 100;
        if (cumHorizontalPercent <= horizontalThresholdA) {
            item.horizontalClass = 'A';
        } else if (cumHorizontalPercent <= horizontalThresholdA + horizontalThresholdB) {
            item.horizontalClass = 'B';
        } else {
            item.horizontalClass = 'C';
        }
    });

    // Merge classifications back
    doubleABCResults = dataWithValues.map(item => {
        const valueItem = sortedByValue.find(v => v.name === item.name);
        const horizontalItem = sortedByHorizontal.find(c => c.name === item.name);
        return {
            ...item,
            valueClass: valueItem.valueClass,
            consumptionClass: horizontalItem.horizontalClass,
            doubleClass: valueItem.valueClass + horizontalItem.horizontalClass
        };
    });

    // Sort by double class priority (AA > AB > BA > BB > AC > CA > BC > CB > CC)
    const classPriority = {
        'AA': 1, 'AB': 2, 'BA': 3, 'BB': 4, 'AC': 5, 'CA': 6, 'BC': 7, 'CB': 8, 'CC': 9
    };
    doubleABCResults.sort((a, b) => classPriority[a.doubleClass] - classPriority[b.doubleClass]);

    // Show ABC Double tab (make it accessible)
    const abcDoubleTabBtn = document.getElementById('abcDoubleTabBtn');
    if (abcDoubleTabBtn) {
        abcDoubleTabBtn.classList.remove('hidden');
    }
    
    // Show UI elements
    document.getElementById('doubleMatrixContainer').classList.remove('hidden');
    document.getElementById('doubleSummaryStats').classList.remove('hidden');
    document.getElementById('doubleTableContainer').classList.remove('hidden');
    
    // Show filters panel
    const filtersPanel = document.getElementById('doubleABCFiltersPanel');
    if (filtersPanel) filtersPanel.classList.remove('hidden');
    
    // Show export button
    const exportBtn = document.getElementById('exportDoubleABCBtn');
    if (exportBtn) exportBtn.classList.remove('hidden');

    // Update matrix
    updateDoubleMatrix();
    
    // Update summary stats
    updateDoubleSummaryStats();
    
    // Display full table
    displayDoubleABCTable();
    
    // Update axis labels (without triggering re-run)
    updateAxisLabelsUI();
    
    // Initialize filters with all data
    doubleFilteredData = [...doubleABCResults];
    document.getElementById('doubleFilterCount').textContent = doubleFilteredData.length;
    document.getElementById('doubleFilterTotal').textContent = doubleABCResults.length;

    // Switch to the tab
    switchTab('abc-double');
}

// Debounced version for live updates (prevents too many re-renders while typing)
let doubleABCDebounceTimer = null;
function debouncedRerunDoubleABC() {
    if (doubleABCDebounceTimer) {
        clearTimeout(doubleABCDebounceTimer);
    }
    doubleABCDebounceTimer = setTimeout(() => {
        rerunDoubleABC();
    }, 300); // 300ms delay
}

function rerunDoubleABC() {
    // Re-run the double ABC analysis with new thresholds
    // Pass true to skip dropdown update (preserves user's column selection)
    if (!uploadedData || uploadedData.length === 0) {
        return;
    }
    performDoubleABCAnalysis(true);
}

function applyABCPreset(preset) {
    const thresholdA = document.getElementById('thresholdASingle');
    const thresholdB = document.getElementById('thresholdBSingle');
    const thresholdC = document.getElementById('thresholdCSingle');
    
    if (!thresholdA || !thresholdB || !thresholdC) return;
    
    const presets = {
        '80-15-5': { A: 80, B: 15, C: 5 },
        '70-20-10': { A: 70, B: 20, C: 10 },
        '90-9-1': { A: 90, B: 9, C: 1 }
    };
    
    const values = presets[preset];
    if (values) {
        thresholdA.value = values.A;
        thresholdB.value = values.B;
        thresholdC.value = values.C;
        showToast(currentLanguage === 'da' ? `ABC tærskler sat til ${preset}` : `ABC thresholds set to ${preset}`, 'success');
    }
}

function updateDoubleMatrix() {
    const categories = ['AA', 'AB', 'AC', 'BA', 'BB', 'BC', 'CA', 'CB', 'CC'];
    
    categories.forEach(cat => {
        const items = doubleABCResults.filter(item => item.doubleClass === cat);
        const totalValue = items.reduce((sum, item) => sum + item.value, 0);
        
        document.getElementById(`count-${cat}`).textContent = `${items.length} ${translations[currentLanguage]['items'] || 'items'}`;
        document.getElementById(`value-${cat}`).textContent = totalValue.toLocaleString(currentLanguage === 'da' ? 'da-DK' : 'en-US') + ' kr';
    });
}

function updateDoubleSummaryStats() {
    const highPriority = doubleABCResults.filter(item => ['AA', 'AB', 'BA'].includes(item.doubleClass));
    const mediumPriority = doubleABCResults.filter(item => ['BB', 'AC', 'CA'].includes(item.doubleClass));
    const lowPriority = doubleABCResults.filter(item => ['BC', 'CB', 'CC'].includes(item.doubleClass));
    
    document.getElementById('highPriorityCount').textContent = highPriority.length;
    document.getElementById('mediumPriorityCount').textContent = mediumPriority.length;
    document.getElementById('lowPriorityCount').textContent = lowPriority.length;
}

// Pagination for Double ABC
let currentVisibleDoubleRows = 200;

function displayDoubleABCTable() {
    const table = document.getElementById('doubleABCTable');
    if (!table) return;

    // Get selected column labels
    const horizontalColumn = document.getElementById('horizontalAxisLabel')?.value || originalColumnNames.consumption;
    const verticalColumn = document.getElementById('verticalAxisLabel')?.value;
    const verticalLabel = (verticalColumn === '__calculated__' || !verticalColumn) 
        ? `${originalColumnNames.price} × ${originalColumnNames.consumption}` 
        : verticalColumn;

    const headers = [
        translations[currentLanguage]['rank'] || 'Rank',
        translations[currentLanguage]['item-name'] || 'Item Name',
        horizontalColumn,
        verticalLabel,
        translations[currentLanguage]['value-class'] || 'Value Class',
        horizontalColumn + ' Class',
        translations[currentLanguage]['double-class'] || 'Double Class',
        translations[currentLanguage]['priority'] || 'Priority'
    ];

    // Use filtered data if available, otherwise use all results
    const dataToDisplay = doubleFilteredData && doubleFilteredData.length > 0 ? doubleFilteredData : doubleABCResults;
    
    // Use pagination for large datasets (>200 rows)
    const usePagination = dataToDisplay.length > 200;
    const visibleRows = usePagination ? Math.min(currentVisibleDoubleRows, dataToDisplay.length) : dataToDisplay.length;
    const rowsToRender = usePagination ? dataToDisplay.slice(0, visibleRows) : dataToDisplay;

    let html = '<thead><tr>';
    headers.forEach(header => {
        html += `<th>${header}</th>`;
    });
    html += '</tr></thead><tbody>';

    rowsToRender.forEach((item, index) => {
        const priorityLabel = ['AA', 'AB', 'BA'].includes(item.doubleClass) ? 
            (translations[currentLanguage]['high'] || 'High') :
            (['BB', 'AC', 'CA'].includes(item.doubleClass) ? 
                (translations[currentLanguage]['medium'] || 'Medium') : 
                (translations[currentLanguage]['low'] || 'Low'));
        
        const priorityColor = ['AA', 'AB', 'BA'].includes(item.doubleClass) ? 
            'text-red-600 dark:text-red-400' :
            (['BB', 'AC', 'CA'].includes(item.doubleClass) ? 
                'text-yellow-600 dark:text-yellow-400' : 
                'text-green-600 dark:text-green-400');

        html += `
            <tr>
                <td>${index + 1}</td>
                <td class="font-medium">${item.name}</td>
                <td>${item.horizontalAxisValue.toLocaleString(currentLanguage === 'da' ? 'da-DK' : 'en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td>${item.verticalAxisValue.toLocaleString(currentLanguage === 'da' ? 'da-DK' : 'en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td><span class="px-2 py-1 bg-${getClassColor(item.valueClass)}-100 dark:bg-${getClassColor(item.valueClass)}-900/20 text-${getClassColor(item.valueClass)}-700 dark:text-${getClassColor(item.valueClass)}-300 rounded font-semibold">${item.valueClass}</span></td>
                <td><span class="px-2 py-1 bg-${getClassColor(item.consumptionClass)}-100 dark:bg-${getClassColor(item.consumptionClass)}-900/20 text-${getClassColor(item.consumptionClass)}-700 dark:text-${getClassColor(item.consumptionClass)}-300 rounded font-semibold">${item.consumptionClass}</span></td>
                <td><span class="px-3 py-1 bg-gray-700 text-white rounded-lg font-bold">${item.doubleClass}</span></td>
                <td><span class="${priorityColor} font-semibold">${priorityLabel}</span></td>
            </tr>
        `;
    });

    // Add pagination controls if needed
    if (usePagination && visibleRows < dataToDisplay.length) {
        html += `
            <tr>
                <td colspan="8" class="text-center py-4 bg-gray-50 dark:bg-gray-700">
                    <div class="flex items-center justify-center gap-4">
                        <span class="text-gray-600 dark:text-gray-300 font-medium">
                            ${translations[currentLanguage]['showing'] || 'Showing'} ${visibleRows.toLocaleString()} ${translations[currentLanguage]['of'] || 'of'} ${dataToDisplay.length.toLocaleString()}
                        </span>
                        <button onclick="loadMoreDoubleResults(100)" class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition-colors shadow">
                            +100
                        </button>
                        <button onclick="loadMoreDoubleResults(1000)" class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-medium transition-colors shadow">
                            +1,000
                        </button>
                        <button onclick="loadMoreDoubleResults(5000)" class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded font-medium transition-colors shadow">
                            +5,000
                        </button>
                        <button onclick="loadAllDoubleResults()" class="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded font-medium transition-colors shadow">
                            🚀 ${translations[currentLanguage]['load-all'] || 'All'} (${(dataToDisplay.length - visibleRows).toLocaleString()})
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    html += '</tbody>';
    table.innerHTML = html;
}

function loadMoreDoubleResults(amount) {
    currentVisibleDoubleRows += amount;
    displayDoubleABCTable();
}

function loadAllDoubleResults() {
    currentVisibleDoubleRows = doubleABCResults.length;
    displayDoubleABCTable();
}

function getClassColor(classLetter) {
    return classLetter === 'A' ? 'red' : (classLetter === 'B' ? 'yellow' : 'green');
}

function showMatrixDetails(category) {
    const items = doubleABCResults.filter(item => item.doubleClass === category);
    
    if (items.length === 0) {
        showToast(translations[currentLanguage]['no-items-category'] || 'No items in this category', 'info');
        return;
    }

    document.getElementById('selectedCategory').textContent = category;
    document.getElementById('matrixDetailsContainer').classList.remove('hidden');

    // Get selected column labels
    const horizontalColumn = document.getElementById('horizontalAxisLabel')?.value || originalColumnNames.consumption;
    const verticalColumn = document.getElementById('verticalAxisLabel')?.value;
    const verticalLabel = (verticalColumn === '__calculated__' || !verticalColumn) 
        ? `${originalColumnNames.price} × ${originalColumnNames.consumption}` 
        : verticalColumn;

    const table = document.getElementById('matrixDetailsTable');
    const headers = [
        translations[currentLanguage]['item-name'] || 'Item Name',
        horizontalColumn,
        verticalLabel,
        translations[currentLanguage]['value-percent'] || 'Value %'
    ];

    const totalValue = doubleABCResults.reduce((sum, item) => sum + item.verticalAxisValue, 0);

    let html = '<thead><tr>';
    headers.forEach(header => {
        html += `<th>${header}</th>`;
    });
    html += '</tr></thead><tbody>';

    items.forEach(item => {
        const valuePercent = ((item.verticalAxisValue / totalValue) * 100).toFixed(2);
        html += `
            <tr>
                <td class="font-medium">${item.name}</td>
                <td>${item.horizontalAxisValue.toLocaleString(currentLanguage === 'da' ? 'da-DK' : 'en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td>${item.verticalAxisValue.toLocaleString(currentLanguage === 'da' ? 'da-DK' : 'en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td>${valuePercent}%</td>
            </tr>
        `;
    });

    html += '</tbody>';
    table.innerHTML = html;

    // Scroll to details
    document.getElementById('matrixDetailsContainer').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideMatrixDetails() {
    document.getElementById('matrixDetailsContainer').classList.add('hidden');
}

function exportDoubleABCExcel() {
    if (!doubleABCResults || doubleABCResults.length === 0) {
        showToast(translations[currentLanguage]['no-data'], 'warning');
        return;
    }

    // Prepare data for export - include ALL original columns plus Double ABC results
    const exportData = doubleABCResults.map((item, index) => {
        const row = {};
        
        // Add rank first
        row['Rank'] = index + 1;
        
        // Add all original columns if available
        if (item._original) {
            Object.keys(item._original).forEach(key => {
                row[key] = item._original[key];
            });
        }
        
        // Add Double ABC analysis results
        row['Value Class'] = item.valueClass;
        row['Consumption Class'] = item.consumptionClass;
        row['Double ABC Class'] = item.doubleClass;
        row['Priority'] = ['AA', 'AB', 'BA'].includes(item.doubleClass) ? 'High' : 
                         (['BB', 'AC', 'CA'].includes(item.doubleClass) ? 'Medium' : 'Low');
        
        return row;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Double ABC Analysis");

    // Add summary sheet
    const summaryData = [
        { 'Category': 'AA', 'Count': doubleABCResults.filter(i => i.doubleClass === 'AA').length },
        { 'Category': 'AB', 'Count': doubleABCResults.filter(i => i.doubleClass === 'AB').length },
        { 'Category': 'AC', 'Count': doubleABCResults.filter(i => i.doubleClass === 'AC').length },
        { 'Category': 'BA', 'Count': doubleABCResults.filter(i => i.doubleClass === 'BA').length },
        { 'Category': 'BB', 'Count': doubleABCResults.filter(i => i.doubleClass === 'BB').length },
        { 'Category': 'BC', 'Count': doubleABCResults.filter(i => i.doubleClass === 'BC').length },
        { 'Category': 'CA', 'Count': doubleABCResults.filter(i => i.doubleClass === 'CA').length },
        { 'Category': 'CB', 'Count': doubleABCResults.filter(i => i.doubleClass === 'CB').length },
        { 'Category': 'CC', 'Count': doubleABCResults.filter(i => i.doubleClass === 'CC').length }
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

    XLSX.writeFile(wb, `Double_ABC_Analysis_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast(currentLanguage === 'da' ? 'Excel fil eksporteret!' : 'Excel file exported!', 'success');
}

// ========================================
// Inventory Management - Sub-tab System
// ========================================

function switchInventoryTool(tool) {
    // Hide all tool panels
    document.querySelectorAll('.inv-tool-content').forEach(el => el.classList.add('hidden'));
    // Reset all tabs
    document.querySelectorAll('.inv-tool-tab').forEach(btn => {
        btn.classList.remove('border-purple-500', 'text-purple-600', 'dark:text-purple-400',
            'border-green-500', 'text-green-600', 'dark:text-green-400',
            'border-blue-500', 'text-blue-600', 'dark:text-blue-400');
        btn.classList.add('border-transparent', 'text-gray-500', 'dark:text-gray-400');
    });

    const colors = {
        rop: ['border-purple-500', 'text-purple-600', 'dark:text-purple-400'],
        periodic: ['border-green-500', 'text-green-600', 'dark:text-green-400'],
        minmax: ['border-blue-500', 'text-blue-600', 'dark:text-blue-400']
    };
    const panelMap = { rop: 'invToolROP', periodic: 'invToolPeriodic', minmax: 'invToolMinMax' };
    const tabMap = { rop: 'invTabROP', periodic: 'invTabPeriodic', minmax: 'invTabMinMax' };

    const panel = document.getElementById(panelMap[tool]);
    const tab = document.getElementById(tabMap[tool]);
    if (panel) panel.classList.remove('hidden');
    if (tab) {
        tab.classList.remove('border-transparent', 'text-gray-500', 'dark:text-gray-400');
        colors[tool].forEach(c => tab.classList.add(c));
    }
}

function syncSharedParams() {
    const demand = document.getElementById('invSharedDemand')?.value || '';
    const leadTime = document.getElementById('invSharedLeadTime')?.value || '';
    const stock = document.getElementById('invSharedStock')?.value || '';
    const safety = document.getElementById('invSharedSafety')?.value || '';
    const autoSync = document.getElementById('invAutoSync')?.checked;

    // Sync to ROP hidden fields
    const ropDemand = document.getElementById('ropDailyDemand');
    const ropLead = document.getElementById('ropLeadTime');
    const ropStock = document.getElementById('ropCurrentStock');
    if (ropDemand) ropDemand.value = demand;
    if (ropLead) ropLead.value = leadTime;
    if (ropStock) ropStock.value = stock;

    // Sync to Periodic Review hidden fields
    const prDemand = document.getElementById('prDailyDemand');
    const prLead = document.getElementById('prLeadTime');
    const prSafety = document.getElementById('prSafetyStock');
    const prStock = document.getElementById('prCurrentStock');
    if (prDemand) prDemand.value = demand;
    if (prLead) prLead.value = leadTime;
    if (prSafety) prSafety.value = safety;
    if (prStock) prStock.value = stock;

    // Sync to Min/Max hidden fields
    const mmDemand = document.getElementById('mmDailyDemand');
    const mmSafety = document.getElementById('mmSafetyStock');
    const mmCurrent = document.getElementById('mmCurrentLevel');
    if (mmDemand) mmDemand.value = demand;
    if (mmSafety) mmSafety.value = safety;
    if (mmCurrent) mmCurrent.value = stock;

    // Auto-calculate all if enabled
    if (autoSync) {
        calculateReorderPoint();
        calculatePeriodicReview();
        calculateMinMax();
    }
}

function toggleInventoryAutoSync() {
    const autoSync = document.getElementById('invAutoSync')?.checked;
    if (autoSync) {
        syncSharedParams();
        showToast(currentLanguage === 'da' ? 'Auto-synkronisering aktiveret' : 'Auto-sync enabled', 'success');
    }
}

// ========================================
// Reorder Point Calculator
// ========================================

// Approximation of inverse normal distribution (z-score from probability)
function calculateZScore(probability) {
    // Beasley-Springer-Moro algorithm approximation
    const a0 = 2.50662823884;
    const a1 = -18.61500062529;
    const a2 = 41.39119773534;
    const a3 = -25.44106049637;
    const b1 = -8.47351093090;
    const b2 = 23.08336743743;
    const b3 = -21.06224101826;
    const b4 = 3.13082909833;
    const c0 = 0.3374754822726147;
    const c1 = 0.9761690190917186;
    const c2 = 0.1607979714918209;
    const c3 = 0.0276438810333863;
    const c4 = 0.0038405729373609;
    const c5 = 0.0003951896511919;
    const c6 = 0.0000321767881768;
    const c7 = 0.0000002888167364;
    const c8 = 0.0000003960315187;
    
    if (probability <= 0 || probability >= 1) {
        return 0;
    }
    
    const y = probability - 0.5;
    
    if (Math.abs(y) < 0.42) {
        const r = y * y;
        return y * (((a3 * r + a2) * r + a1) * r + a0) / 
               ((((b4 * r + b3) * r + b2) * r + b1) * r + 1);
    } else {
        let r = probability;
        if (y > 0) r = 1 - probability;
        r = Math.log(-Math.log(r));
        const z = c0 + r * (c1 + r * (c2 + r * (c3 + r * (c4 + r * (c5 + r * (c6 + r * (c7 + r * c8)))))));
        return y < 0 ? -z : z;
    }
}

function handleServiceLevelChange() {
    const serviceLevelSelect = document.getElementById('ropServiceLevel');
    const customInput = document.getElementById('customServiceLevelInput');
    
    if (serviceLevelSelect.value === 'custom') {
        customInput.classList.remove('hidden');
    } else {
        customInput.classList.add('hidden');
        calculateReorderPoint();
    }
}

// Add Enter key listener for Reorder Point inputs
function setupReorderPointEnterKey() {
    const inputs = ['ropDailyDemand', 'ropLeadTime', 'ropStdDev', 'customServiceLevel', 'ropCurrentStock'];
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input && !input.dataset.enterListenerAdded) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') calculateReorderPoint();
            });
            input.dataset.enterListenerAdded = 'true';
        }
    });
}

// Smart Feature #1: Apply standard deviation preset
function applyStdDevPreset() {
    const preset = document.getElementById('ropStdDevPreset');
    const dailyDemand = parseFloat(document.getElementById('ropDailyDemand').value) || 100;
    
    if (preset.value) {
        // Calculate σ as percentage of daily demand
        const percentage = parseFloat(preset.value) / 100;
        const stdDev = Math.round(dailyDemand * percentage);
        document.getElementById('ropStdDev').value = stdDev;
        calculateReorderPoint();
    }
}

function calculateReorderPoint() {
    const dailyDemand = parseFloat(document.getElementById('ropDailyDemand').value);
    const leadTime = parseFloat(document.getElementById('ropLeadTime').value);
    const serviceLevelSelect = document.getElementById('ropServiceLevel');
    const stdDev = parseFloat(document.getElementById('ropStdDev').value);
    const currentStock = parseFloat(document.getElementById('ropCurrentStock')?.value) || 0;
    
    let zScore;
    if (serviceLevelSelect.value === 'custom') {
        const customServiceLevel = parseFloat(document.getElementById('customServiceLevel').value);
        if (!customServiceLevel || customServiceLevel < 50 || customServiceLevel > 99.99) {
            return;
        }
        zScore = calculateZScore(customServiceLevel / 100);
    } else {
        zScore = parseFloat(serviceLevelSelect.value);
    }
    
    if (!dailyDemand || !leadTime || !zScore || stdDev === null) {
        return;
    }
    
    // Calculate average demand during lead time
    const avgLeadTimeDemand = dailyDemand * leadTime;
    
    // Calculate safety stock: Z * σ * √LT
    const safetyStock = zScore * stdDev * Math.sqrt(leadTime);
    
    // Calculate reorder point
    const reorderPoint = avgLeadTimeDemand + safetyStock;
    
    // Display results
    document.getElementById('ropResult').textContent = Math.round(reorderPoint).toLocaleString();
    document.getElementById('ropSafetyStock').textContent = Math.round(safetyStock).toLocaleString();
    document.getElementById('ropAvgDemand').textContent = Math.round(avgLeadTimeDemand).toLocaleString();
    
    // Update safety stock gauge
    updateSafetyStockGauge(safetyStock, avgLeadTimeDemand, reorderPoint);
    
    // Smart Feature #2: Update urgency status based on current stock
    updateROPUrgencyStatus(currentStock, reorderPoint, safetyStock, dailyDemand, leadTime);
    
    // Smart Feature #6: Show contextual warnings
    updateROPSmartWarning(currentStock, reorderPoint, safetyStock, dailyDemand, leadTime);
    
    document.getElementById('ropResults').classList.remove('hidden');
    
    // Store values for cross-sync
    window.lastROPCalculation = {
        dailyDemand,
        leadTime,
        safetyStock: Math.round(safetyStock),
        reorderPoint: Math.round(reorderPoint),
        currentStock
    };
}

// Smart Feature #2: Update ROP urgency status
function updateROPUrgencyStatus(currentStock, reorderPoint, safetyStock, dailyDemand, leadTime) {
    const urgencyBox = document.getElementById('ropUrgencyStatus');
    const urgencyIcon = document.getElementById('ropUrgencyIcon');
    const urgencyText = document.getElementById('ropUrgencyText');
    const urgencySubtext = document.getElementById('ropUrgencySubtext');
    
    if (!urgencyBox || !currentStock) return;
    
    const daysOfStock = dailyDemand > 0 ? Math.floor(currentStock / dailyDemand) : 0;
    const stockAboveROP = currentStock - reorderPoint;
    const daysUntilROP = dailyDemand > 0 ? Math.floor(stockAboveROP / dailyDemand) : 0;
    
    let icon, text, subtext, borderColor, bgColor;
    
    if (currentStock <= safetyStock) {
        // CRITICAL - below safety stock
        icon = '🚨';
        text = currentLanguage === 'da' ? 'KRITISK - Bestil NU!' : 'CRITICAL - Order NOW!';
        subtext = currentLanguage === 'da' 
            ? `Du er under sikkerhedslageret! Kun ${daysOfStock} dages lager tilbage.`
            : `Below safety stock! Only ${daysOfStock} days of stock left.`;
        borderColor = 'border-red-500';
        bgColor = 'bg-red-50 dark:bg-red-900/30';
    } else if (currentStock <= reorderPoint) {
        // Below ROP - order now
        icon = '⚠️';
        text = currentLanguage === 'da' ? 'Bestil nu!' : 'Order now!';
        subtext = currentLanguage === 'da'
            ? `Lageret (${currentStock}) er under genbestillingspunkt (${Math.round(reorderPoint)}). ${daysOfStock} dage tilbage.`
            : `Stock (${currentStock}) is below reorder point (${Math.round(reorderPoint)}). ${daysOfStock} days left.`;
        borderColor = 'border-orange-500';
        bgColor = 'bg-orange-50 dark:bg-orange-900/30';
    } else if (daysUntilROP <= leadTime) {
        // Will hit ROP before delivery can arrive
        icon = '⏰';
        text = currentLanguage === 'da' ? 'Bestil snart' : 'Order soon';
        subtext = currentLanguage === 'da'
            ? `${daysUntilROP} dage til genbestillingspunkt. Leveringstid er ${leadTime} dage.`
            : `${daysUntilROP} days until reorder point. Lead time is ${leadTime} days.`;
        borderColor = 'border-yellow-500';
        bgColor = 'bg-yellow-50 dark:bg-yellow-900/30';
    } else {
        // OK
        icon = '✅';
        text = currentLanguage === 'da' ? 'Lager OK' : 'Stock OK';
        subtext = currentLanguage === 'da'
            ? `${daysUntilROP} dage til genbestillingspunkt. Du har god tid.`
            : `${daysUntilROP} days until reorder point. You have time.`;
        borderColor = 'border-green-500';
        bgColor = 'bg-green-50 dark:bg-green-900/30';
    }
    
    // Update UI
    const container = urgencyBox.querySelector('div');
    if (container) {
        container.className = `p-4 rounded-lg border-2 w-full ${bgColor} ${borderColor}`;
    }
    if (urgencyIcon) urgencyIcon.textContent = icon;
    if (urgencyText) urgencyText.textContent = text;
    if (urgencySubtext) urgencySubtext.textContent = subtext;
}

// Smart Feature #6: Contextual warnings for ROP
function updateROPSmartWarning(currentStock, reorderPoint, safetyStock, dailyDemand, leadTime) {
    const warningBox = document.getElementById('ropSmartWarning');
    const warningIcon = document.getElementById('ropWarningIcon');
    const warningTitle = document.getElementById('ropWarningTitle');
    const warningText = document.getElementById('ropWarningText');
    
    if (!warningBox) return;
    
    const safetyDays = dailyDemand > 0 ? safetyStock / dailyDemand : 0;
    
    let show = false;
    let icon, title, text, borderColor, bgColor;
    
    // Warning: Safety stock too low
    if (safetyDays < 2 && dailyDemand > 0) {
        show = true;
        icon = '⚠️';
        title = currentLanguage === 'da' ? 'Sikkerhedslager meget lavt' : 'Safety stock very low';
        text = currentLanguage === 'da'
            ? `Dit sikkerhedslager (${Math.round(safetyStock)}) dækker kun ${safetyDays.toFixed(1)} dage. Anbefalet minimum er 3-5 dage ved 99% serviceniveau.`
            : `Your safety stock (${Math.round(safetyStock)}) covers only ${safetyDays.toFixed(1)} days. Recommended minimum is 3-5 days at 99% service level.`;
        borderColor = 'border-yellow-500';
        bgColor = 'bg-yellow-50 dark:bg-yellow-900/20';
    }
    // Warning: Safety stock excessive
    else if (safetyDays > 14 && dailyDemand > 0) {
        show = true;
        icon = '💡';
        title = currentLanguage === 'da' ? 'Sikkerhedslager måske for højt' : 'Safety stock may be excessive';
        text = currentLanguage === 'da'
            ? `Dit sikkerhedslager (${Math.round(safetyStock)}) dækker ${safetyDays.toFixed(1)} dage. Overvej at sænke serviceniveau eller reducere variation.`
            : `Your safety stock (${Math.round(safetyStock)}) covers ${safetyDays.toFixed(1)} days. Consider lowering service level or reducing variation.`;
        borderColor = 'border-blue-500';
        bgColor = 'bg-blue-50 dark:bg-blue-900/20';
    }
    // Tip: Stock much higher than ROP
    else if (currentStock > reorderPoint * 2) {
        show = true;
        icon = '📦';
        title = currentLanguage === 'da' ? 'Overskudslager' : 'Excess inventory';
        text = currentLanguage === 'da'
            ? `Nuværende lager (${currentStock}) er mere end dobbelt ROP (${Math.round(reorderPoint)}). Overvej at reducere næste bestilling.`
            : `Current stock (${currentStock}) is more than double ROP (${Math.round(reorderPoint)}). Consider reducing next order.`;
        borderColor = 'border-blue-500';
        bgColor = 'bg-blue-50 dark:bg-blue-900/20';
    }
    
    if (show) {
        warningBox.className = `mt-4 p-4 rounded-lg border-2 ${borderColor} ${bgColor}`;
        warningBox.classList.remove('hidden');
        if (warningIcon) warningIcon.textContent = icon;
        if (warningTitle) warningTitle.textContent = title;
        if (warningText) warningText.textContent = text;
    } else {
        warningBox.classList.add('hidden');
    }
}

// Update safety stock coverage gauge
function updateSafetyStockGauge(safetyStock, avgDemand, rop) {
    const coveragePercent = avgDemand > 0 ? (safetyStock / avgDemand) * 100 : 0;
    const gaugePercent = Math.min(coveragePercent / 1.5, 100); // Scale to 150% max
    
    const gaugeFill = document.getElementById('safety-gauge-fill');
    const coverageDisplay = document.getElementById('safety-coverage-percent');
    
    if (gaugeFill) {
        gaugeFill.style.width = `${gaugePercent}%`;
    }
    
    if (coverageDisplay) {
        coverageDisplay.textContent = `${coveragePercent.toFixed(1)}%`;
        
        // Update color based on level
        if (coveragePercent < 20) {
            coverageDisplay.className = 'text-lg font-bold text-red-600 dark:text-red-400';
        } else if (coveragePercent < 50) {
            coverageDisplay.className = 'text-lg font-bold text-yellow-600 dark:text-yellow-400';
        } else if (coveragePercent <= 100) {
            coverageDisplay.className = 'text-lg font-bold text-green-600 dark:text-green-400';
        } else {
            coverageDisplay.className = 'text-lg font-bold text-blue-600 dark:text-blue-400';
        }
    }
    
    // Use InventoryEnhancements if available
    if (window.InventoryEnhancements && window.InventoryEnhancements.safetyStockGauge) {
        window.InventoryEnhancements.safetyStockGauge.update({
            safetyStock,
            avgDemand,
            rop,
            coveragePercent
        });
    }
}

// Periodic Review Calculator
// Add Enter key listener for Periodic Review inputs
function setupPeriodicReviewEnterKey() {
    const inputs = ['prDailyDemand', 'prReviewPeriod', 'prLeadTime', 'prSafetyStock', 'prCurrentStock'];
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input && !input.dataset.enterListenerAdded) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') calculatePeriodicReview();
            });
            input.dataset.enterListenerAdded = 'true';
        }
    });
}

function calculatePeriodicReview() {
    const dailyDemand = parseFloat(document.getElementById('prDailyDemand')?.value || 0);
    const reviewPeriod = parseFloat(document.getElementById('prReviewPeriod')?.value || 0);
    const leadTime = parseFloat(document.getElementById('prLeadTime')?.value || 0);
    const safetyStock = parseFloat(document.getElementById('prSafetyStock')?.value || 0);
    const currentStock = parseFloat(document.getElementById('prCurrentStock')?.value || 0);
    const nextReviewDate = document.getElementById('prNextReviewDate')?.value;
    
    if (!dailyDemand || !reviewPeriod) return;
    
    // Target Level = Daily Demand × (Review Period + Lead Time) + Safety Stock
    const targetLevel = dailyDemand * (reviewPeriod + leadTime) + safetyStock;
    const orderQuantity = Math.max(0, targetLevel - currentStock);
    const coverage = currentStock > 0 ? (currentStock + orderQuantity) / dailyDemand : 0;
    
    document.getElementById('prTargetLevel').textContent = Math.round(targetLevel).toLocaleString();
    document.getElementById('prOrderQuantity').textContent = Math.round(orderQuantity).toLocaleString();
    document.getElementById('prCoverage').textContent = Math.round(coverage);
    
    // Smart Feature #3: Timing check - will you run out before next review?
    updatePeriodicReviewTimingWarning(dailyDemand, currentStock, safetyStock, reviewPeriod, leadTime, nextReviewDate);
    
    // Draw chart
    drawPeriodicReviewChart(dailyDemand, reviewPeriod, leadTime, currentStock, targetLevel, orderQuantity);
    
    // Store for cross-sync
    window.lastPRCalculation = {
        dailyDemand,
        reviewPeriod,
        leadTime,
        safetyStock,
        targetLevel: Math.round(targetLevel)
    };
}

// Smart Feature #3: Timing warning for Periodic Review
function updatePeriodicReviewTimingWarning(dailyDemand, currentStock, safetyStock, reviewPeriod, leadTime, nextReviewDate) {
    const warningBox = document.getElementById('prTimingWarning');
    const warningIcon = document.getElementById('prWarningIcon');
    const warningTitle = document.getElementById('prWarningTitle');
    const warningText = document.getElementById('prWarningText');
    const warningAction = document.getElementById('prWarningAction');
    const nextReviewStatus = document.getElementById('prNextReviewStatus');
    
    if (!warningBox) return;
    
    const daysOfStock = dailyDemand > 0 ? Math.floor(currentStock / dailyDemand) : 0;
    const daysToSafety = dailyDemand > 0 ? Math.floor((currentStock - safetyStock) / dailyDemand) : 0;
    
    let daysToNextReview = reviewPeriod; // Default to review period
    if (nextReviewDate) {
        const today = new Date();
        const reviewDate = new Date(nextReviewDate);
        daysToNextReview = Math.ceil((reviewDate - today) / (1000 * 60 * 60 * 24));
    }
    
    // Update next review status text
    if (nextReviewStatus && nextReviewDate) {
        const reviewDate = new Date(nextReviewDate);
        nextReviewStatus.textContent = currentLanguage === 'da'
            ? `Næste gennemgang: ${reviewDate.toLocaleDateString('da-DK')} (om ${daysToNextReview} dage)`
            : `Next review: ${reviewDate.toLocaleDateString('en-GB')} (in ${daysToNextReview} days)`;
    }
    
    let show = false;
    let icon, title, text, action, borderColor, bgColor;
    
    // CRITICAL: Will run out of stock before review + delivery
    if (daysOfStock < daysToNextReview + leadTime) {
        show = true;
        
        if (daysOfStock < daysToNextReview) {
            // Will run out BEFORE the review even happens
            icon = '🚨';
            title = currentLanguage === 'da' ? 'KRITISK: Løber tør før næste gennemgang!' : 'CRITICAL: Will run out before next review!';
            text = currentLanguage === 'da'
                ? `Du har ${daysOfStock} dages lager, men næste gennemgang er om ${daysToNextReview} dage.`
                : `You have ${daysOfStock} days of stock, but next review is in ${daysToNextReview} days.`;
            action = currentLanguage === 'da' 
                ? '➡️ Bestil NU eller fremskyn gennemgangsdato!'
                : '➡️ Order NOW or move review date earlier!';
            borderColor = 'border-red-500';
            bgColor = 'bg-red-50 dark:bg-red-900/30';
        } else {
            // Will run out during lead time after review
            icon = '⚠️';
            title = currentLanguage === 'da' ? 'Advarsel: Lager kan blive kritisk' : 'Warning: Stock may become critical';
            text = currentLanguage === 'da'
                ? `Du har ${daysOfStock} dages lager. Leveringstid (${leadTime} dage) efter gennemgang kan skabe mangel.`
                : `You have ${daysOfStock} days of stock. Lead time (${leadTime} days) after review may cause shortage.`;
            action = currentLanguage === 'da'
                ? '💡 Overvej at øge sikkerhedslageret eller bestille en ekstra batch.'
                : '💡 Consider increasing safety stock or ordering an extra batch.';
            borderColor = 'border-orange-500';
            bgColor = 'bg-orange-50 dark:bg-orange-900/30';
        }
    }
    // OK: Plenty of stock
    else if (daysOfStock > daysToNextReview + leadTime + 5) {
        show = true;
        icon = '✅';
        title = currentLanguage === 'da' ? 'Lager OK til næste gennemgang' : 'Stock OK until next review';
        text = currentLanguage === 'da'
            ? `Du har ${daysOfStock} dages lager. Næste gennemgang + leveringstid = ${daysToNextReview + leadTime} dage.`
            : `You have ${daysOfStock} days of stock. Next review + lead time = ${daysToNextReview + leadTime} days.`;
        action = '';
        borderColor = 'border-green-500';
        bgColor = 'bg-green-50 dark:bg-green-900/30';
    }
    
    if (show) {
        warningBox.className = `mt-4 p-4 rounded-lg border-2 ${borderColor} ${bgColor}`;
        warningBox.classList.remove('hidden');
        if (warningIcon) warningIcon.textContent = icon;
        if (warningTitle) warningTitle.textContent = title;
        if (warningText) warningText.textContent = text;
        if (warningAction) warningAction.textContent = action;
    } else {
        warningBox.classList.add('hidden');
    }
}

function drawPeriodicReviewChart(dailyDemand, reviewPeriod, leadTime, currentStock, targetLevel, orderQuantity) {
    const canvas = document.getElementById('periodicReviewChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (window.periodicReviewChartInstance) {
        window.periodicReviewChartInstance.destroy();
    }
    
    const days = reviewPeriod + leadTime + 10;
    const labels = [];
    const stockLevels = [];
    const targetLine = [];
    const safetyLine = [];
    
    let stock = currentStock;
    const safetyStock = parseFloat(document.getElementById('prSafetyStock')?.value || 0);
    
    for (let day = 0; day <= days; day++) {
        labels.push(`${translate('day-abbr')} ${day}`);
        targetLine.push(targetLevel);
        safetyLine.push(safetyStock);
        
        if (day === reviewPeriod) {
            stock += orderQuantity; // Order arrives
        }
        
        stockLevels.push(stock);
        stock = Math.max(0, stock - dailyDemand);
    }
    
    window.periodicReviewChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: translate('pr-dataset-stock'),
                data: stockLevels,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true
            }, {
                label: translate('pr-dataset-target'),
                data: targetLine,
                borderColor: 'rgb(34, 197, 94)',
                borderDash: [5, 5],
                borderWidth: 2,
                pointRadius: 0
            }, {
                label: translate('pr-dataset-safety'),
                data: safetyLine,
                borderColor: 'rgb(239, 68, 68)',
                borderDash: [10, 5],
                borderWidth: 2,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: translate('pr-chart-title'),
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: translate('units')
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: translate('days-abbr')
                    }
                }
            }
        }
    });
}

// Min/Max Model Calculator
// Add Enter key listener for Min-Max inputs
function setupMinMaxEnterKey() {
    const inputs = ['mmDailyDemand', 'mmMinLevel', 'mmMaxLevel', 'mmEOQ', 'mmSafetyStock', 'mmCurrentLevel'];
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input && !input.dataset.enterListenerAdded) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') calculateMinMax();
            });
            input.dataset.enterListenerAdded = 'true';
        }
    });
}

function calculateMinMax() {
    const dailyDemand = parseFloat(document.getElementById('mmDailyDemand')?.value || 0);
    const minLevel = parseFloat(document.getElementById('mmMinLevel')?.value || 0);
    const maxLevel = parseFloat(document.getElementById('mmMaxLevel')?.value || 0);
    const eoq = parseFloat(document.getElementById('mmEOQ')?.value || 0);
    const safetyStock = parseFloat(document.getElementById('mmSafetyStock')?.value || 0);
    const currentLevel = parseFloat(document.getElementById('mmCurrentLevel')?.value || 0);
    
    if (!minLevel || !maxLevel) return;
    
    // Determine status
    let status, statusIcon, orderNeeded;
    if (currentLevel < minLevel) {
        status = currentLanguage === 'da' ? 'Kritisk' : 'Critical';
        statusIcon = '🔴';
        orderNeeded = maxLevel - currentLevel;
    } else if (currentLevel <= minLevel + safetyStock) {
        status = currentLanguage === 'da' ? 'Lav' : 'Low';
        statusIcon = '🟡';
        orderNeeded = eoq;
    } else if (currentLevel > maxLevel) {
        status = currentLanguage === 'da' ? 'Overfyldt' : 'Overfilled';
        statusIcon = '🔵';
        orderNeeded = 0;
    } else {
        status = currentLanguage === 'da' ? 'Normal' : 'Normal';
        statusIcon = '🟢';
        orderNeeded = 0;
    }
    
    const capacity = ((currentLevel / maxLevel) * 100).toFixed(1);
    
    // Smart Feature #4: FIXED days-to-min calculation
    let daysToMin;
    if (dailyDemand > 0 && currentLevel > minLevel) {
        daysToMin = Math.floor((currentLevel - minLevel) / dailyDemand);
    } else if (currentLevel <= minLevel) {
        daysToMin = 0;
    } else {
        daysToMin = '-';
    }
    
    // Also calculate days to max after ordering
    let daysToMax = '-';
    if (dailyDemand > 0 && orderNeeded > 0) {
        daysToMax = Math.floor((currentLevel + orderNeeded) / dailyDemand);
    }
    
    const mmStatusEl = document.getElementById('mmStatus');
    if (mmStatusEl) {
        mmStatusEl.textContent = status;
        // Set the data-i18n attribute for proper translation
        if (currentLevel < minLevel) {
            mmStatusEl.setAttribute('data-i18n', 'mm-status-critical');
        } else if (currentLevel <= minLevel + safetyStock) {
            mmStatusEl.setAttribute('data-i18n', 'mm-status-low');
        } else if (currentLevel > maxLevel) {
            mmStatusEl.setAttribute('data-i18n', 'mm-status-overfilled');
        } else {
            mmStatusEl.setAttribute('data-i18n', 'mm-status-normal');
        }
    }
    const mmStatusIconEl = document.getElementById('mmStatusIcon');
    if (mmStatusIconEl) mmStatusIconEl.textContent = statusIcon;
    const mmOrderNeededEl = document.getElementById('mmOrderNeeded');
    if (mmOrderNeededEl) mmOrderNeededEl.textContent = Math.round(orderNeeded).toLocaleString();
    const mmCapacityEl = document.getElementById('mmCapacity');
    if (mmCapacityEl) mmCapacityEl.textContent = capacity;
    const mmDaysToMinEl = document.getElementById('mmDaysToMin');
    if (mmDaysToMinEl) mmDaysToMinEl.textContent = daysToMin;
    
    // Smart Feature #6: Contextual warnings for Min/Max
    updateMinMaxSmartWarning(dailyDemand, minLevel, maxLevel, currentLevel, safetyStock, daysToMin, orderNeeded);
    
    // Draw warehouse dashboard chart
    drawMinMaxChart(minLevel, maxLevel, safetyStock, currentLevel);
    
    // Store for cross-sync
    window.lastMMCalculation = {
        dailyDemand,
        minLevel,
        maxLevel,
        safetyStock,
        currentLevel
    };
}

// Smart Feature #6: Contextual warnings for Min/Max
function updateMinMaxSmartWarning(dailyDemand, minLevel, maxLevel, currentLevel, safetyStock, daysToMin, orderNeeded) {
    const warningBox = document.getElementById('mmSmartWarning');
    const warningIcon = document.getElementById('mmWarningIcon');
    const warningTitle = document.getElementById('mmWarningTitle');
    const warningText = document.getElementById('mmWarningText');
    
    if (!warningBox) return;
    
    let show = false;
    let icon, title, text, borderColor, bgColor;
    
    // Critical: Below min level
    if (currentLevel < minLevel) {
        show = true;
        icon = '🚨';
        title = currentLanguage === 'da' ? 'Under minimum - Bestil straks!' : 'Below minimum - Order immediately!';
        text = currentLanguage === 'da'
            ? `Lager (${currentLevel}) er ${minLevel - currentLevel} enheder under minimum. Bestil ${orderNeeded} enheder for at nå max.`
            : `Stock (${currentLevel}) is ${minLevel - currentLevel} units below minimum. Order ${orderNeeded} units to reach max.`;
        borderColor = 'border-red-500';
        bgColor = 'bg-red-50 dark:bg-red-900/30';
    }
    // Warning: Approaching min
    else if (typeof daysToMin === 'number' && daysToMin <= 5 && daysToMin > 0) {
        show = true;
        icon = '⏰';
        title = currentLanguage === 'da' ? 'Nærmer sig minimum' : 'Approaching minimum';
        text = currentLanguage === 'da'
            ? `Kun ${daysToMin} dage til minimum-niveau nås. Forbered næste bestilling.`
            : `Only ${daysToMin} days until minimum level reached. Prepare next order.`;
        borderColor = 'border-yellow-500';
        bgColor = 'bg-yellow-50 dark:bg-yellow-900/30';
    }
    // Warning: Overfilled
    else if (currentLevel > maxLevel) {
        show = true;
        icon = '📦';
        const excess = currentLevel - maxLevel;
        icon = '⚠️';
        title = currentLanguage === 'da' ? 'Overskudslager' : 'Excess inventory';
        text = currentLanguage === 'da'
            ? `Lager (${currentLevel}) overstiger max (${maxLevel}) med ${excess} enheder. Overvej at reducere næste bestilling.`
            : `Stock (${currentLevel}) exceeds max (${maxLevel}) by ${excess} units. Consider reducing next order.`;
        borderColor = 'border-blue-500';
        bgColor = 'bg-blue-50 dark:bg-blue-900/30';
    }
    // Tip: Safety stock too low
    else if (safetyStock < minLevel * 0.1 && minLevel > 0) {
        show = true;
        icon = '💡';
        title = currentLanguage === 'da' ? 'Tip: Lavt sikkerhedslager' : 'Tip: Low safety stock';
        text = currentLanguage === 'da'
            ? `Dit sikkerhedslager (${safetyStock}) er kun ${((safetyStock/minLevel)*100).toFixed(0)}% af minimum. Overvej at øge for bedre beskyttelse.`
            : `Your safety stock (${safetyStock}) is only ${((safetyStock/minLevel)*100).toFixed(0)}% of minimum. Consider increasing for better protection.`;
        borderColor = 'border-blue-500';
        bgColor = 'bg-blue-50 dark:bg-blue-900/20';
    }
    
    if (show) {
        warningBox.className = `mt-4 p-4 rounded-lg border-2 ${borderColor} ${bgColor}`;
        warningBox.classList.remove('hidden');
        if (warningIcon) warningIcon.textContent = icon;
        if (warningTitle) warningTitle.textContent = title;
        if (warningText) warningText.textContent = text;
    } else {
        warningBox.classList.add('hidden');
    }
}

function drawMinMaxChart(minLevel, maxLevel, safetyStock, currentLevel) {
    const canvas = document.getElementById('minMaxChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (window.minMaxChartInstance) {
        window.minMaxChartInstance.destroy();
    }
    
    window.minMaxChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [currentLanguage === 'da' ? 'Lagerstatus' : 'Inventory Status'],
            datasets: [{
                label: currentLanguage === 'da' ? 'Sikkerhedslager' : 'Safety Stock',
                data: [safetyStock],
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 2
            }, {
                label: currentLanguage === 'da' ? 'Min → Aktuelt' : 'Min → Current',
                data: [currentLevel - minLevel > 0 ? currentLevel - minLevel : 0],
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                borderColor: 'rgb(34, 197, 94)',
                borderWidth: 2
            }, {
                label: currentLanguage === 'da' ? 'Aktuelt → Max' : 'Current → Max',
                data: [maxLevel - currentLevel > 0 ? maxLevel - currentLevel : 0],
                backgroundColor: 'rgba(234, 179, 8, 0.3)',
                borderColor: 'rgb(234, 179, 8)',
                borderWidth: 2,
                borderDash: [5, 5]
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: `${currentLanguage === 'da' ? 'Nuværende Niveau' : 'Current Level'}: ${currentLevel.toLocaleString()} ${currentLanguage === 'da' ? 'enheder' : 'units'} | Min: ${minLevel.toLocaleString()} | Max: ${maxLevel.toLocaleString()}`,
                    font: { size: 14, weight: 'bold' }
                },
                legend: {
                    display: true,
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + Math.round(context.parsed.x).toLocaleString() + ' ' + (currentLanguage === 'da' ? 'enheder' : 'units');
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: currentLanguage === 'da' ? 'enheder' : 'units'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                },
                y: {
                    stacked: true
                }
            }
        }
    });
}

// ========================================
// Smart Feature #5: Cross-Sync Functions
// ========================================

// Sync ROP values to Min/Max
function syncROPToMinMax() {
    if (!window.lastROPCalculation) {
        showToast(currentLanguage === 'da' ? 'Beregn ROP først' : 'Calculate ROP first', 'warning');
        return;
    }
    
    const rop = window.lastROPCalculation;
    
    // Set Min = ROP, Safety Stock from ROP
    const mmMinLevel = document.getElementById('mmMinLevel');
    const mmSafetyStock = document.getElementById('mmSafetyStock');
    const mmDailyDemand = document.getElementById('mmDailyDemand');
    
    if (mmMinLevel) mmMinLevel.value = rop.reorderPoint;
    if (mmSafetyStock) mmSafetyStock.value = rop.safetyStock;
    if (mmDailyDemand) mmDailyDemand.value = rop.dailyDemand;
    
    calculateMinMax();
    
    showToast(currentLanguage === 'da' 
        ? `Synkroniseret: Min=${rop.reorderPoint}, Sikkerhed=${rop.safetyStock}` 
        : `Synced: Min=${rop.reorderPoint}, Safety=${rop.safetyStock}`, 'success');
    
    // Scroll to Min/Max section
    document.getElementById('mmMinLevel')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Sync ROP values to Periodic Review
function syncROPToPeriodic() {
    if (!window.lastROPCalculation) {
        showToast(currentLanguage === 'da' ? 'Beregn ROP først' : 'Calculate ROP first', 'warning');
        return;
    }
    
    const rop = window.lastROPCalculation;
    
    const prSafetyStock = document.getElementById('prSafetyStock');
    const prDailyDemand = document.getElementById('prDailyDemand');
    const prLeadTime = document.getElementById('prLeadTime');
    
    if (prSafetyStock) prSafetyStock.value = rop.safetyStock;
    if (prDailyDemand) prDailyDemand.value = rop.dailyDemand;
    if (prLeadTime) prLeadTime.value = rop.leadTime;
    
    calculatePeriodicReview();
    
    showToast(currentLanguage === 'da' 
        ? `Synkroniseret sikkerhedslager: ${rop.safetyStock}` 
        : `Synced safety stock: ${rop.safetyStock}`, 'success');
}

// Sync FROM ROP to either periodic or minmax
function syncFromROP(target) {
    if (!window.lastROPCalculation) {
        showToast(currentLanguage === 'da' ? 'Beregn ROP først i ROP-sektionen' : 'Calculate ROP first in ROP section', 'warning');
        return;
    }
    
    const rop = window.lastROPCalculation;
    
    if (target === 'periodic') {
        const prSafetyStock = document.getElementById('prSafetyStock');
        const prDailyDemand = document.getElementById('prDailyDemand');
        if (prSafetyStock) prSafetyStock.value = rop.safetyStock;
        if (prDailyDemand) prDailyDemand.value = rop.dailyDemand;
        calculatePeriodicReview();
        showToast(currentLanguage === 'da' ? 'Hentet fra ROP!' : 'Fetched from ROP!', 'success');
    } else if (target === 'minmax') {
        const mmMinLevel = document.getElementById('mmMinLevel');
        const mmSafetyStock = document.getElementById('mmSafetyStock');
        const mmDailyDemand = document.getElementById('mmDailyDemand');
        if (mmMinLevel) mmMinLevel.value = rop.reorderPoint;
        if (mmSafetyStock) mmSafetyStock.value = rop.safetyStock;
        if (mmDailyDemand) mmDailyDemand.value = rop.dailyDemand;
        calculateMinMax();
        showToast(currentLanguage === 'da' 
            ? `Hentet: Min=${rop.reorderPoint}, Sikkerhed=${rop.safetyStock}` 
            : `Fetched: Min=${rop.reorderPoint}, Safety=${rop.safetyStock}`, 'success');
    }
}

// Sync EOQ from Wilson calculator
function syncFromWilson() {
    // Try to get EOQ from the Wilson result
    const wilsonEOQ = document.getElementById('eoqResult')?.textContent;
    
    if (!wilsonEOQ || wilsonEOQ === '-' || wilsonEOQ === '0') {
        showToast(currentLanguage === 'da' ? 'Beregn Wilson EOQ først' : 'Calculate Wilson EOQ first', 'warning');
        return;
    }
    
    const eoqValue = parseFloat(wilsonEOQ.replace(/[^\d.-]/g, ''));
    
    if (isNaN(eoqValue)) {
        showToast(currentLanguage === 'da' ? 'Kunne ikke læse EOQ værdi' : 'Could not read EOQ value', 'error');
        return;
    }
    
    const mmEOQ = document.getElementById('mmEOQ');
    if (mmEOQ) {
        mmEOQ.value = Math.round(eoqValue);
        calculateMinMax();
        showToast(currentLanguage === 'da' 
            ? `Hentet EOQ: ${Math.round(eoqValue)}` 
            : `Fetched EOQ: ${Math.round(eoqValue)}`, 'success');
    }
}

// Sync ALL inventory tools
function syncAllInventory() {
    let synced = [];
    
    // First, ensure ROP is calculated
    calculateReorderPoint();
    
    if (window.lastROPCalculation) {
        const rop = window.lastROPCalculation;
        
        // Sync to Periodic Review
        const prSafetyStock = document.getElementById('prSafetyStock');
        const prDailyDemand = document.getElementById('prDailyDemand');
        const prLeadTime = document.getElementById('prLeadTime');
        if (prSafetyStock) prSafetyStock.value = rop.safetyStock;
        if (prDailyDemand) prDailyDemand.value = rop.dailyDemand;
        if (prLeadTime) prLeadTime.value = rop.leadTime;
        synced.push('Periodisk');
        
        // Sync to Min/Max
        const mmMinLevel = document.getElementById('mmMinLevel');
        const mmSafetyStock = document.getElementById('mmSafetyStock');
        const mmDailyDemand = document.getElementById('mmDailyDemand');
        if (mmMinLevel) mmMinLevel.value = rop.reorderPoint;
        if (mmSafetyStock) mmSafetyStock.value = rop.safetyStock;
        if (mmDailyDemand) mmDailyDemand.value = rop.dailyDemand;
        synced.push('Min/Max');
    }
    
    // Try to sync EOQ from Wilson
    const wilsonEOQ = document.getElementById('eoqResult')?.textContent;
    if (wilsonEOQ && wilsonEOQ !== '-' && wilsonEOQ !== '0') {
        const eoqValue = parseFloat(wilsonEOQ.replace(/[^\d.-]/g, ''));
        if (!isNaN(eoqValue)) {
            const mmEOQ = document.getElementById('mmEOQ');
            if (mmEOQ) {
                mmEOQ.value = Math.round(eoqValue);
                synced.push('EOQ');
            }
        }
    }
    
    // Recalculate all
    calculatePeriodicReview();
    calculateMinMax();
    
    if (synced.length > 0) {
        showToast(currentLanguage === 'da' 
            ? `Synkroniseret: ${synced.join(', ')}` 
            : `Synchronized: ${synced.join(', ')}`, 'success');
    } else {
        showToast(currentLanguage === 'da' 
            ? 'Ingen data at synkronisere - beregn ROP først' 
            : 'No data to sync - calculate ROP first', 'warning');
    }
}

// ========================================
// Cargo Securing Calculator
// ========================================

function toggleLashingReference() {
    const ref = document.getElementById('lashingReference');
    const arrow = document.getElementById('lashingReferenceArrow');
    ref.classList.toggle('hidden');
    arrow.textContent = ref.classList.contains('hidden') ? '▼' : '▲';
}

function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const arrow = document.getElementById(sectionId + 'Arrow');
    section.classList.toggle('hidden');
    arrow.textContent = section.classList.contains('hidden') ? '▶' : '▼';
}

function updateLashingMethodUI() {
    const method = document.getElementById('lashingMethod')?.value;
    const descDiv = document.getElementById('methodDescription');
    
    if (!descDiv) return;
    
    const descriptions = {
        'overfald': '<strong>Overfaldssurring:</strong> Den mest brugte metode. Båndene går hen over godset og skaber friktion mod underlaget. Kræver god friktion mellem gods og lad.',
        'loop': '<strong>Loopsurring:</strong> Effektiv metode til sideretning og tipning. Godset skal altid sikres med mindst 2 loopsurringspar. Kræver faste monteringspunkter.',
        'friction': '<strong>Grimesurring:</strong> Særligt effektiv til fremad/bagud sikring. Max 45° vinkel! Høj sikkerhedsfaktor (k=2.0). God løsning når friktion er lav.',
        'direct': '<strong>Direkt Surring:</strong> Mest effektive metode hvor godset fastgøres direkte til køretøjet. Høj sikkerhedsfaktor (k=2.0). Kræver gode fastgørelsespunkter på godset.'
    };
    
    descDiv.innerHTML = '<p class="text-sm text-blue-900 dark:text-blue-200">' + (descriptions[method] || '') + '</p>';
}

function handleFrictionChange() {
    const select = document.getElementById('cargoFrictionSelect');
    const input = document.getElementById('cargoFriction');
    
    if (select.value === 'custom') {
        input.classList.remove('hidden');
        input.focus();
    } else {
        input.classList.add('hidden');
        input.value = select.value;
        calculateCargoSecuring();
    }
}

function handleRowsChange() {
    const select = document.getElementById('cargoRowsSelect');
    const input = document.getElementById('cargoRows');
    
    if (select.value === 'custom') {
        input.classList.remove('hidden');
        input.focus();
    } else {
        input.classList.add('hidden');
        input.value = select.value;
        calculateCargoSecuring();
    }
}

function calculateCargoSecuring() {
    // Top-over lashing calculations (simplified - all 4 methods use same inputs)
    const cargoWeight = parseFloat(document.getElementById('cargoWeight')?.value);
    const friction = parseFloat(document.getElementById('cargoFriction')?.value) || 0.30;
    const angle = parseFloat(document.getElementById('cargoAngle')?.value) || 90;
    const actualSTF = parseFloat(document.getElementById('cargoActualSTF')?.value) || 400;
    const hbRatio = parseFloat(document.getElementById('cargoHBRatio')?.value);
    const rows = parseInt(document.getElementById('cargoRows')?.value) || 1;
    
    const resultsDiv = document.getElementById('cargoResults');
    
    // Validate basic inputs
    if (!cargoWeight || cargoWeight <= 0) {
        if (resultsDiv) resultsDiv.classList.add('hidden');
        return;
    }
    
    // Show results
    if (resultsDiv) resultsDiv.classList.remove('hidden');
    
    const standardSTF = 400; // Standard STF value from the book
    const stfFactor = actualSTF / standardSTF;
    
    // === GLIDNING TABLE (Sliding) - From book page 3 ===
    // Antal ton goods, en overfaldssurring forhindrer i at glide
    const slidingTable = {
        0.15: { side: 0.31, forward: 0.15, backward: 0.31 },
        0.20: { side: 0.48, forward: 0.21, backward: 0.48 },
        0.25: { side: 0.72, forward: 0.29, backward: 0.72 },
        0.30: { side: 1.1, forward: 0.38, backward: 1.1 },
        0.35: { side: 1.7, forward: 0.49, backward: 1.7 },
        0.40: { side: 2.9, forward: 0.63, backward: 2.9 },
        0.45: { side: 6.4, forward: 0.81, backward: 6.4 },
        0.50: { side: 999, forward: 1.1, backward: 999 }, // ÷ glidning means no sliding
        0.55: { side: 999, forward: 1.4, backward: 999 },
        0.60: { side: 999, forward: 1.9, backward: 999 },
        0.65: { side: 999, forward: 2.7, backward: 999 },
        0.70: { side: 999, forward: 4.4, backward: 999 }
    };
    
    // Find closest friction value in table
    const frictionKeys = Object.keys(slidingTable).map(parseFloat).sort((a,b) => a - b);
    let closestFriction = frictionKeys[0];
    for (let key of frictionKeys) {
        if (Math.abs(key - friction) < Math.abs(closestFriction - friction)) {
            closestFriction = key;
        }
    }
    
    const slidingCapacity = slidingTable[closestFriction];
    
    // Apply STF factor
    const slidingSide = slidingCapacity.side * stfFactor;
    const slidingForward = slidingCapacity.forward * stfFactor;
    const slidingBackward = slidingCapacity.backward * stfFactor;
    
    // Display sliding capacity
    document.getElementById('cargoSlidingSide').textContent = slidingSide >= 999 ? '÷ glidning' : slidingSide.toFixed(2);
    document.getElementById('cargoSlidingForward').textContent = slidingForward.toFixed(2);
    document.getElementById('cargoSlidingBackward').textContent = slidingBackward >= 999 ? '÷ glidning' : slidingBackward.toFixed(2);
    
    // Calculate lashings needed for sliding (use the most critical direction)
    let slidingLashings = 0;
    if (slidingSide < 999) {
        slidingLashings = Math.max(slidingLashings, Math.ceil(cargoWeight / slidingSide));
    }
    slidingLashings = Math.max(slidingLashings, Math.ceil(cargoWeight / slidingForward));
    if (slidingBackward < 999) {
        slidingLashings = Math.max(slidingLashings, Math.ceil(cargoWeight / slidingBackward));
    }
    
    // Apply angle correction
    let angleWarningText = '';
    const angleWarningDiv = document.getElementById('cargoAngleWarning');
    
    if (angle < 30) {
        angleWarningText = currentLanguage === 'da'
            ? '⚠️ Vinkel under 30° - Anvend en anden lastsikringsmetode!'
            : '⚠️ Angle below 30° - Use a different cargo securing method!';
        angleWarningDiv?.classList.remove('hidden');
        slidingLashings = 999; // Invalid
    } else if (angle >= 30 && angle < 75) {
        angleWarningText = currentLanguage === 'da'
            ? `⚠️ Vinkel ${angle}° kræver DOBBELT antal surringer eller halvering af tabelværdier`
            : `⚠️ Angle ${angle}° requires DOUBLE the number of lashings or halving table values`;
        angleWarningDiv?.classList.remove('hidden');
        slidingLashings = slidingLashings * 2; // Double for angle 30-75°
    } else {
        angleWarningDiv?.classList.add('hidden');
    }
    
    document.getElementById('cargoAngleWarningText').textContent = angleWarningText;
    document.getElementById('cargoSlidingResult').textContent = slidingLashings >= 999 ? 'N/A' : slidingLashings;
    document.getElementById('cargoSlidingNote').textContent = slidingLashings >= 999 
        ? (currentLanguage === 'da' ? 'Ugyldig vinkel' : 'Invalid angle')
        : (currentLanguage === 'da' ? `Baseret på μ=${closestFriction}, STF=${actualSTF}` : `Based on μ=${closestFriction}, STF=${actualSTF}`);
    
    // === TIPNING TABLE (Tipping) - From book page 2 ===
    // Antal ton goods, en overfaldssurring forhindrer i at tippe (Sideretning)
    const tippingTableSide = {
        0.6: { 1: 999, 2: 999, 3: 5.8, 4: 2.9, 5: 2.9 },
        0.8: { 1: 999, 2: 999, 3: 4.9, 4: 2.1, 5: 1.5 },
        1.0: { 1: 999, 2: 999, 3: 2.2, 4: 1.3, 5: 0.97 },
        1.2: { 1: 999, 2: 4.1, 3: 1.4, 4: 0.91, 5: 0.73 },
        1.4: { 1: 999, 2: 2.3, 3: 0.99, 4: 0.71, 5: 0.58 },
        1.6: { 1: 999, 2: 1.5, 3: 0.78, 4: 0.58, 5: 0.49 },
        1.8: { 1: 999, 2: 1.1, 3: 0.64, 4: 0.49, 5: 0.42 },
        2.0: { 1: 999, 2: 0.90, 3: 0.54, 4: 0.42, 5: 0.36 },
        2.2: { 1: 4.5, 2: 0.75, 3: 0.47, 4: 0.37, 5: 0.32 },
        2.4: { 1: 3.3, 2: 0.64, 3: 0.42, 4: 0.33, 5: 0.29 },
        2.6: { 1: 2.6, 2: 0.56, 3: 0.37, 4: 0.30, 5: 0.26 },
        2.8: { 1: 1.8, 2: 0.50, 3: 0.34, 4: 0.28, 5: 0.24 },
        3.0: { 1: 1.4, 2: 0.45, 3: 0.31, 4: 0.25, 5: 0.22 },
        3.2: { 1: 1.2, 2: 0.41, 3: 0.29, 4: 0.24, 5: 0.21 }
    };
    
    let tippingCapacity = 0;
    let tippingLashings = 999;
    
    if (hbRatio && hbRatio > 0) {
        // Find closest H/B ratio
        const hbKeys = Object.keys(tippingTableSide).map(parseFloat).sort((a,b) => a - b);
        let closestHB = hbKeys[0];
        for (let key of hbKeys) {
            if (Math.abs(key - hbRatio) < Math.abs(closestHB - hbRatio)) {
                closestHB = key;
            }
        }
        
        tippingCapacity = tippingTableSide[closestHB][rows] || 0;
        
        // Apply STF factor
        tippingCapacity = tippingCapacity * stfFactor;
        
        // Apply angle correction
        if (angle >= 30 && angle < 75) {
            tippingCapacity = tippingCapacity / 2; // Halve table value for angle 30-75°
        }
        
        // Calculate lashings needed
        if (tippingCapacity >= 999) {
            tippingLashings = 999; // ÷ tipning
        } else if (tippingCapacity > 0) {
            tippingLashings = Math.ceil(cargoWeight / tippingCapacity);
        }
        
        document.getElementById('cargoTippingHBDisplay').textContent = closestHB.toFixed(1);
        document.getElementById('cargoTippingRowsDisplay').textContent = `${rows} række${rows > 1 ? 'r' : ''}`;
        document.getElementById('cargoTippingCapacity').textContent = tippingCapacity >= 999 ? '÷ tipning' : tippingCapacity.toFixed(2);
        document.getElementById('cargoTippingResult').textContent = tippingLashings >= 999 ? 'N/A' : tippingLashings;
        document.getElementById('cargoTippingNote').textContent = tippingLashings >= 999
            ? (currentLanguage === 'da' ? 'Ikke relevant (÷ tipning)' : 'Not relevant (÷ tipping)')
            : (currentLanguage === 'da' ? `Baseret på H/B=${closestHB}, ${rows} række${rows > 1 ? 'r' : ''}` : `Based on H/B=${closestHB}, ${rows} row${rows > 1 ? 's' : ''}`);
    } else {
        document.getElementById('cargoTippingHBDisplay').textContent = '-';
        document.getElementById('cargoTippingRowsDisplay').textContent = '-';
        document.getElementById('cargoTippingCapacity').textContent = '-';
        document.getElementById('cargoTippingResult').textContent = '-';
        document.getElementById('cargoTippingNote').textContent = currentLanguage === 'da' 
            ? 'Indtast H/B forhold' 
            : 'Enter H/B ratio';
    }
    
    // === FINAL RECOMMENDATION ===
    // Use the highest number of lashings (most critical scenario)
    const finalLashings = Math.max(
        slidingLashings < 999 ? slidingLashings : 0,
        tippingLashings < 999 ? tippingLashings : 0
    );
    
    if (finalLashings > 0 && finalLashings < 999) {
        document.getElementById('cargoFinalResult').textContent = finalLashings;
        document.getElementById('cargoFinalNote').textContent = currentLanguage === 'da'
            ? `Glidning: ${slidingLashings < 999 ? slidingLashings : 'N/A'} | Tipning: ${tippingLashings < 999 ? tippingLashings : 'N/A'}`
            : `Sliding: ${slidingLashings < 999 ? slidingLashings : 'N/A'} | Tipping: ${tippingLashings < 999 ? tippingLashings : 'N/A'}`;
    } else {
        document.getElementById('cargoFinalResult').textContent = '-';
        document.getElementById('cargoFinalNote').textContent = currentLanguage === 'da'
            ? 'Indtast alle nødvendige værdier'
            : 'Enter all required values';
    }
}

// ========================================
// Settings Helper Functions
// ========================================

function saveDefaultServiceLevel() {
    const select = document.getElementById('defaultServiceLevelSelect');
    if (select) {
        localStorage.setItem('defaultServiceLevel', select.value);
        // Update ROP calculator if visible
        const ropServiceLevel = document.getElementById('ropServiceLevel');
        if (ropServiceLevel && ropServiceLevel.value !== 'custom') {
            ropServiceLevel.value = select.value;
            calculateReorderPoint();
        }
    }
}

function toggleAutoSave() {
    const toggle = document.getElementById('autoSaveToggle');
    if (toggle) {
        localStorage.setItem('autoSave', toggle.checked);
        const message = currentLanguage === 'da' 
            ? (toggle.checked ? 'Auto-gem aktiveret' : 'Auto-gem deaktiveret')
            : (toggle.checked ? 'Auto-save enabled' : 'Auto-save disabled');
        showToast(message, 'success');
    }
}

// Initialize inventory calculators on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load saved default service level
    const savedServiceLevel = localStorage.getItem('defaultServiceLevel');
    if (savedServiceLevel) {
        const defaultSelect = document.getElementById('defaultServiceLevelSelect');
        const ropSelect = document.getElementById('ropServiceLevel');
        if (defaultSelect) defaultSelect.value = savedServiceLevel;
        if (ropSelect) ropSelect.value = savedServiceLevel;
    }
    
    // Load auto-save setting
    const autoSave = localStorage.getItem('autoSave');
    if (autoSave !== null) {
        const toggle = document.getElementById('autoSaveToggle');
        if (toggle) toggle.checked = autoSave === 'true';
    }
    
    // Auto-calculate on first load
    if (document.getElementById('ropDailyDemand')) {
        calculateReorderPoint();
    }
    if (document.getElementById('prDailyDemand')) {
        calculatePeriodicReview();
    }
    if (document.getElementById('mmMinLevel')) {
        calculateMinMax();
    }
    
    // Setup batch Wilson file upload
    const batchFileInput = document.getElementById('batchWilsonFileInput');
    if (batchFileInput) {
        batchFileInput.addEventListener('change', handleBatchWilsonUpload);
    }
    
    // Setup drag-and-drop for batch Wilson
    const batchDropZone = document.getElementById('batchDropZone');
    if (batchDropZone) {
        batchDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            batchDropZone.classList.add('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
        });
        
        batchDropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            batchDropZone.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
        });
        
        batchDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            batchDropZone.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                batchFileInput.files = files;
                handleBatchWilsonUpload({ target: { files: files } });
            }
        });
    }
});

// ========================================
// SAMPLE FILE LOADER
// ========================================

function loadSampleFile(filename) {
    const fileExtension = filename.split('.').pop().toLowerCase();
    
    fetch(filename)
        .then(response => {
            if (!response.ok) {
                throw new Error('File not found: ' + filename);
            }
            if (fileExtension === 'csv') {
                return response.text();
            } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
                return response.arrayBuffer();
            }
        })
        .then(data => {
            if (fileExtension === 'csv') {
                Papa.parse(data, {
                    header: true,
                    dynamicTyping: true,
                    complete: (results) => {
                        currentFileName = filename;
                        currentFileSize = (data.length / 1024).toFixed(1) + ' KB';
                        processUploadedData(results.data);
                        showToast(`${currentLanguage === 'da' ? 'Indlæst' : 'Loaded'} ${filename}`, 'success');
                    },
                    error: (error) => {
                        console.error('CSV parsing error:', error);
                        showToast(currentLanguage === 'da' ? 'Fejl ved CSV parsing' : 'Error parsing CSV file', 'error');
                    }
                });
            } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
                try {
                    const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                    currentFileName = filename;
                    currentFileSize = (data.byteLength / 1024).toFixed(1) + ' KB';
                    processUploadedData(jsonData);
                    showToast(`${currentLanguage === 'da' ? 'Indlæst' : 'Loaded'} ${filename}`, 'success');
                } catch (error) {
                    console.error('Excel parsing error:', error);
                    showToast(currentLanguage === 'da' ? 'Fejl ved Excel parsing' : 'Error parsing Excel file', 'error');
                }
            }
        })
        .catch(error => {
            console.error('Error loading sample file:', error);
            showToast(`${currentLanguage === 'da' ? 'Kunne ikke indlæse' : 'Could not load'} ${filename}`, 'error');
        });
}

// ========================================
// BATCH WILSON EOQ CALCULATOR
// ========================================

let batchWilsonData = [];
let currentWilsonMode = 'single';

function switchWilsonMode(mode) {
    currentWilsonMode = mode;
    const singleCard = document.getElementById('singleModeCard');
    const batchCard = document.getElementById('batchModeCard');
    const singleCheck = document.getElementById('singleCheckmark');
    const batchCheck = document.getElementById('batchCheckmark');
    const singleInputs = document.getElementById('singleItemInputs');
    const batchUpload = document.getElementById('batchUploadSection');
    const batchResults = document.getElementById('batchWilsonResults');
    const wilsonResults = document.getElementById('wilsonResults');
    
    if (mode === 'single') {
        // Style cards
        singleCard.className = 'cursor-pointer border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 transition-all hover:shadow-lg';
        batchCard.className = 'cursor-pointer border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg p-4 transition-all hover:shadow-lg';
        singleCheck.classList.remove('hidden');
        batchCheck.classList.add('hidden');
        
        // Show/hide sections
        singleInputs.classList.remove('hidden');
        batchUpload.classList.add('hidden');
        batchResults.classList.add('hidden');
        // Only show Wilson results if calculation has been performed
        if (wilsonCalculated) {
            wilsonResults.classList.remove('hidden');
        } else {
            wilsonResults.classList.add('hidden');
        }
    } else {
        // Style cards
        batchCard.className = 'cursor-pointer border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 transition-all hover:shadow-lg';
        singleCard.className = 'cursor-pointer border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg p-4 transition-all hover:shadow-lg';
        batchCheck.classList.remove('hidden');
        singleCheck.classList.add('hidden');
        
        // Show/hide sections
        singleInputs.classList.add('hidden');
        batchUpload.classList.remove('hidden');
        wilsonResults.classList.add('hidden');
        
        // Show batch results if data exists
        if (batchWilsonData.length > 0) {
            batchResults.classList.remove('hidden');
        }
    }
}

function handleBatchWilsonUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split('.').pop();
    
    if (fileExtension === 'csv') {
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            complete: (results) => {
                processBatchWilsonData(results.data, file.name);
            },
            error: (error) => {
                console.error('CSV parsing error:', error);
                showToast('Fejl ved læsning af CSV-fil', 'error');
            }
        });
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                processBatchWilsonData(jsonData, file.name);
            } catch (error) {
                console.error('Excel parsing error:', error);
                showToast('Fejl ved læsning af Excel-fil', 'error');
            }
        };
        reader.readAsArrayBuffer(file);
    }
}

function processBatchWilsonData(data, fileName) {
    // Normalize column names and extract data - DYNAMIC like ABC analysis
    batchWilsonData = data.filter(row => row && Object.keys(row).length > 0).map(row => {
        const item = {
            _original: row  // Store all original columns
        };
        Object.keys(row).forEach(key => {
            const normalizedKey = key.trim().toLowerCase();
            const normalizedKeyNoSpaces = normalizedKey.replace(/[_\s-]/g, '');
            
            // Item Name detection
            if (normalizedKey.includes('name') || normalizedKey.includes('item') || normalizedKey.includes('vare') || normalizedKey.includes('produkt') || normalizedKey === 'varenavn') {
                item.name = row[key];
            }
            // Annual Demand detection (Årsforbrug, Forbrug, Demand, Consumption)
            else if (normalizedKey.includes('demand') || normalizedKey.includes('forbrug') || normalizedKey.includes('annual') || normalizedKey.includes('årsforbrug') || normalizedKey.includes('årsforbruk') || normalizedKey.includes('consumption')) {
                const value = parseFloat(String(row[key]).replace(/[^0-9.-]/g, ''));
                if (!isNaN(value)) item.demand = value;
            }
            // Order Cost detection
            else if (normalizedKeyNoSpaces.includes('ordercost') || normalizedKey.includes('ordreomkostning') || 
                     normalizedKey.includes('order cost') || normalizedKey.includes('ordering cost') ||
                     (normalizedKey.includes('order') && normalizedKey.includes('cost'))) {
                const value = parseFloat(String(row[key]).replace(/[^0-9.-]/g, ''));
                if (!isNaN(value)) item.orderCost = value;
            }
            // Unit Price detection (Pris, Price, Unit Price)
            else if (!item.orderCost && (normalizedKey.includes('price') || normalizedKey.includes('pris') || 
                     normalizedKey.includes('stykpris') || normalizedKeyNoSpaces.includes('unitprice'))) {
                const value = parseFloat(String(row[key]).replace(/[^0-9.-]/g, ''));
                if (!isNaN(value)) item.price = value;
            }
            // Interest Rate detection
            else if (normalizedKey.includes('interest') || normalizedKey.includes('rente') || 
                     (normalizedKey.includes('rate') && !normalizedKey.includes('exchange'))) {
                const value = parseFloat(String(row[key]).replace(/[^0-9.-]/g, ''));
                if (!isNaN(value)) item.interest = value;
            }
        });
        
        // Apply defaults for missing Wilson-specific columns (making it dynamic)
        if (!item.orderCost) item.orderCost = 200; // Default order cost
        if (!item.interest) item.interest = 5; // Default 5% interest rate
        if (!item.price && item.demand) {
            // If no price but has demand, estimate from other items or use default
            item.price = 100; // Default unit price
        }
        
        return item;
    }).filter(item => {
        // RELAXED VALIDATION: Only require name and at least demand OR price
        // This makes it work like ABC analysis - accept any columns
        const hasName = item.name && String(item.name).trim().length > 0;
        const hasDemand = item.demand && item.demand > 0;
        const hasPrice = item.price && item.price > 0;
        
        // Accept if we have name and at least one numeric value
        const isValid = hasName && (hasDemand || hasPrice);
        
        if (!isValid) {
            console.log('Skipping invalid row (missing name or numeric data):', item);
        }
        return isValid;
    });
    
    if (batchWilsonData.length === 0) {
        const sampleRow = data[0] || {};
        const foundColumns = Object.keys(sampleRow).join(', ');
        const errorMsg = currentLanguage === 'da' 
            ? `Ingen gyldig data fundet. Forventede mindst: Item Name og Årsforbrug/Pris. Fandt: ${foundColumns}`
            : `No valid data found. Expected at least: Item Name and Annual Demand/Price. Found: ${foundColumns}`;
        showToast(errorMsg, 'error');
        return;
    }
    
    // Show file info
    document.getElementById('batchFileInfo').classList.remove('hidden');
    document.getElementById('batchFileName').textContent = fileName;
    document.getElementById('batchFileRows').textContent = batchWilsonData.length;
    
    // Calculate EOQ for all items
    calculateBatchWilson();
    
    showToast(currentLanguage === 'da' ? `${batchWilsonData.length} varer indlæst` : `${batchWilsonData.length} items loaded`, 'success');
}

// Sample data function removed - use real file uploads only

function calculateBatchWilson() {
    if (batchWilsonData.length === 0) return;
    
    // Calculate EOQ for each item
    const results = batchWilsonData.map(item => {
        const h = item.price * (item.interest / 100);
        const eoq = Math.sqrt((2 * item.demand * item.orderCost) / h);
        const ordersPerYear = item.demand / eoq;
        const holdingCost = (eoq / 2) * h;
        const orderingCost = ordersPerYear * item.orderCost;
        const totalCost = holdingCost + orderingCost;
        
        return {
            ...item,
            eoq: Math.round(eoq),
            ordersPerYear: ordersPerYear.toFixed(1),
            totalCost: Math.round(totalCost)
        };
    });
    
    // Display results in table
    const tbody = document.getElementById('batchWilsonTableBody');
    tbody.innerHTML = results.map(item => `
        <tr>
            <td class="font-medium">${item.name}</td>
            <td>${item.demand.toLocaleString()}</td>
            <td>${item.orderCost.toLocaleString()} kr</td>
            <td>${item.price.toLocaleString()} kr</td>
            <td>${item.interest}%</td>
            <td class="font-bold text-green-600">${item.eoq.toLocaleString()}</td>
            <td>${item.ordersPerYear}</td>
            <td>${item.totalCost.toLocaleString()} kr</td>
        </tr>
    `).join('');
    
    // Calculate and display summary
    const totalItems = results.length;
    const totalEOQ = results.reduce((sum, item) => sum + item.eoq, 0);
    const avgOrders = (results.reduce((sum, item) => sum + parseFloat(item.ordersPerYear), 0) / totalItems).toFixed(1);
    const totalCost = results.reduce((sum, item) => sum + item.totalCost, 0);
    
    document.getElementById('batchTotalItems').textContent = totalItems;
    document.getElementById('batchTotalEOQ').textContent = totalEOQ.toLocaleString();
    document.getElementById('batchAvgOrders').textContent = avgOrders;
    document.getElementById('batchTotalCost').textContent = totalCost.toLocaleString() + ' kr';
    
    // Show results section
    document.getElementById('batchWilsonResults').classList.remove('hidden');
    
    // Store results for export
    window.batchWilsonResults = results;
}

function exportBatchToExcel() {
    if (!window.batchWilsonResults || window.batchWilsonResults.length === 0) {
        showToast(currentLanguage === 'da' ? 'Ingen batch-data at eksportere' : 'No batch data to export', 'warning');
        return;
    }
    
    const wb = XLSX.utils.book_new();
    
    // Include ALL original columns plus Wilson calculation results
    const data = window.batchWilsonResults.map(item => {
        const row = {};
        
        // Add all original columns first (if available from _original property)
        if (item._original) {
            Object.keys(item._original).forEach(key => {
                row[key] = item._original[key];
            });
        } else {
            // If no _original, use the basic columns
            row['Item Name'] = item.name;
            row['Annual Demand'] = item.demand;
            row['Order Cost'] = item.orderCost;
            row['Unit Price'] = item.price;
            row['Interest Rate %'] = item.interest;
        }
        
        // Add Wilson calculation results
        row['EOQ'] = item.eoq;
        row['Orders Per Year'] = item.ordersPerYear;
        row['Total Annual Cost'] = item.totalCost;
        
        return row;
    });
    
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
        { wch: 30 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 18 }
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Batch EOQ Results');
    XLSX.writeFile(wb, `Batch_Wilson_EOQ_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    showToast(currentLanguage === 'da' ? 'Excel-fil eksporteret' : 'Excel file exported', 'success');
}

function exportBatchToPDF() {
    if (!window.batchWilsonResults || window.batchWilsonResults.length === 0) {
        showToast(currentLanguage === 'da' ? 'Ingen batch-data at eksportere' : 'No batch data to export', 'warning');
        return;
    }
    
    showToast(currentLanguage === 'da' ? 'PDF-eksport kræver jsPDF-biblioteket. Brug Excel-eksport i stedet.' : 'PDF export requires the jsPDF library. Use Excel export instead.', 'info');
}

// ========================================
// PDF EXPORT FUNCTIONALITY (Placeholder)
// ========================================

function exportSectionToPDF(sectionId) {
    showToast(currentLanguage === 'da' ? 'PDF-eksport kommer snart! Brug Excel-eksport eller udskriv.' : 'PDF export coming soon! Use Excel export or print.', 'info');
}

function exportDashboardToPDF() {
    exportSectionToPDF('dashboard');
}

function exportABCToPDF() {
    exportSectionToPDF('abc');
}

function exportWilsonToPDF() {
    exportSectionToPDF('wilson');
}

// ========================================
// WIZARD NAVIGATION & ENHANCEMENTS
// ========================================

let currentWizardStep = 1;
let autoSaveInterval = null;
let lastAutoSave = null;

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('customPageModal');
    if (!modal || modal.classList.contains('hidden')) return;
    
    // Ctrl+S or Cmd+S - Save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveCustomPage();
        return;
    }
    
    // Escape - Close modal
    if (e.key === 'Escape') {
        e.preventDefault();
        closeCustomPageModal();
        return;
    }
    
    // Ctrl+Enter - Add input/formula based on current step
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (currentWizardStep === 2) {
            addCustomInput();
        } else if (currentWizardStep === 3) {
            addCustomFormula();
        }
        return;
    }
    
    // Ctrl+Z - Undo (placeholder for future implementation)
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        showToast(currentLanguage === 'da' ? '⚠️ Fortryd-funktion kommer snart' : '⚠️ Undo feature coming soon', 'info');
        return;
    }
    
    // Ctrl+Shift+Z or Ctrl+Y - Redo (placeholder)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        showToast(currentLanguage === 'da' ? '⚠️ Gendan-funktion kommer snart' : '⚠️ Redo feature coming soon', 'info');
        return;
    }
});

function switchWizardStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.wizard-step').forEach(step => {
        step.classList.add('hidden');
    });
    
    // Show selected step
    const targetStep = document.querySelector(`.wizard-step[data-step="${stepNumber}"]`);
    if (targetStep) {
        targetStep.classList.remove('hidden');
    }
    
    // Update tab styling
    document.querySelectorAll('.wizard-tab').forEach(tab => {
        tab.classList.remove('wizard-tab-active', 'bg-white/20');
        tab.classList.add('bg-white/10');
    });
    
    const activeTab = document.querySelector(`.wizard-tab[data-step="${stepNumber}"]`);
    if (activeTab) {
        activeTab.classList.add('wizard-tab-active', 'bg-white/20');
        activeTab.classList.remove('bg-white/10');
    }
    
    // Update step description
    const descriptions = {
        1: translate('step1-description') || 'Give your custom calculator a name and description',
        2: translate('step2-description') || 'Define what values users can enter',
        3: translate('step3-description') || 'Define calculations and results',
        4: translate('step4-description') || 'Configure validation, graphs, and simulation',
        5: translate('step5-description') || 'Preview and test your calculator'
    };
    
    const descEl = document.getElementById('wizardStepDescription');
    if (descEl) {
        descEl.textContent = descriptions[stepNumber] || '';
    }
    
    currentWizardStep = stepNumber;
    updateWizardProgress();
    updateAvailableVariables();
    
    // Update live preview when moving to preview step
    if (stepNumber === 5) {
        updateLivePreview();
    }
}

function updateWizardProgress() {
    let progress = 0;
    const pageName = document.getElementById('customPageName')?.value || '';
    const inputs = document.querySelectorAll('#customInputsList > div').length;
    const formulas = document.querySelectorAll('#customFormulasList > div').length;
    
    // Calculate progress
    if (pageName.trim()) progress += 20;
    if (inputs > 0) progress += 30;
    if (formulas > 0) progress += 30;
    progress += 20; // Base progress
    
    const progressEl = document.getElementById('wizardProgress');
    if (progressEl) {
        progressEl.textContent = Math.min(progress, 100) + '%';
    }
    
    // Update badges
    const inputBadges = document.querySelectorAll('.wizard-tab[data-step="2"] .wizard-badge');
    inputBadges.forEach(badge => badge.textContent = inputs);
    
    const formulaBadges = document.querySelectorAll('.wizard-tab[data-step="3"] .wizard-badge');
    formulaBadges.forEach(badge => badge.textContent = formulas);
    
    // Update stats in sidebar
    const statsInputCount = document.getElementById('statsInputCount');
    if (statsInputCount) statsInputCount.textContent = inputs;
    
    const statsFormulaCount = document.getElementById('statsFormulaCount');
    if (statsFormulaCount) statsFormulaCount.textContent = formulas;
    
    const requiredCount = document.querySelectorAll('#customInputsList .input-required:checked').length;
    const statsRequiredCount = document.getElementById('statsRequiredCount');
    if (statsRequiredCount) statsRequiredCount.textContent = requiredCount;
    
    // Update empty states
    const inputsEmpty = document.getElementById('inputsEmptyState');
    if (inputsEmpty) {
        inputsEmpty.style.display = inputs === 0 ? 'block' : 'none';
    }
    
    const formulasEmpty = document.getElementById('formulasEmptyState');
    if (formulasEmpty) {
        formulasEmpty.style.display = formulas === 0 ? 'block' : 'none';
    }
}

function updateAvailableVariables() {
    const container = document.getElementById('availableVariablesList');
    if (!container) return;
    
    const inputs = document.querySelectorAll('#customInputsList > div');
    if (inputs.length === 0) {
        container.innerHTML = `<span class="text-sm text-gray-500 dark:text-gray-400" data-i18n="no-variables-yet">${translate('no-variables-yet') || 'Add inputs first to see available variables'}</span>`;
        return;
    }
    
    container.innerHTML = '';
    inputs.forEach(inputDiv => {
        const varInput = inputDiv.querySelector('.input-variable');
        if (varInput && varInput.value.trim()) {
            const badge = document.createElement('button');
            badge.type = 'button';
            badge.className = 'px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg text-sm font-mono hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors';
            badge.textContent = varInput.value.trim();
            badge.onclick = () => {
                // Copy variable name to clipboard
                navigator.clipboard.writeText(varInput.value.trim());
                showToast(currentLanguage === 'da' ? `"${varInput.value.trim()}" kopieret til udklipsholder` : `"${varInput.value.trim()}" copied to clipboard`, 'success');
            };
            container.appendChild(badge);
        }
    });
}

function quickAddInput() {
    switchWizardStep(2);
    setTimeout(() => {
        addCustomInput();
    }, 100);
}

function quickAddFormula() {
    switchWizardStep(3);
    setTimeout(() => {
        addCustomFormula();
    }, 100);
}

function autoSaveCurrentPage() {
    const pageName = document.getElementById('customPageName')?.value || 'Untitled';
    const pageData = {
        name: pageName,
        description: document.getElementById('customPageDesc')?.value || '',
        icon: document.getElementById('customPageIcon')?.value || '📊',
        timestamp: new Date().toISOString(),
        inputs: [],
        formulas: []
    };
    
    // Collect inputs
    document.querySelectorAll('#customInputsList > div').forEach(inputDiv => {
        const varName = inputDiv.querySelector('.input-var-name')?.value || '';
        const label = inputDiv.querySelector('.input-label')?.value || '';
        if (varName && label) {
            pageData.inputs.push({ variable: varName, label: label });
        }
    });
    
    // Collect formulas
    document.querySelectorAll('#customFormulasList > div').forEach(formulaDiv => {
        const varName = formulaDiv.querySelector('.formula-var-name')?.value || '';
        const formula = formulaDiv.querySelector('.formula-expression')?.value || '';
        if (varName && formula) {
            pageData.formulas.push({ variable: varName, formula: formula });
        }
    });
    
    // Save to localStorage
    localStorage.setItem('customPage_autosave_draft', JSON.stringify(pageData));
    lastAutoSave = new Date();
    
    // Update UI indicator
    const indicator = document.getElementById('autoSaveIndicator');
    if (indicator) {
        indicator.textContent = '💾 ' + (translate('saved') || 'Saved');
        indicator.className = 'text-xs text-green-600 dark:text-green-400';
        setTimeout(() => {
            const time = new Date(lastAutoSave).toLocaleTimeString();
            indicator.textContent = '💾 ' + time;
            indicator.className = 'text-xs text-gray-500 dark:text-gray-400';
        }, 2000);
    }
}

function startAutoSave() {
    // Clear any existing interval
    if (autoSaveInterval) clearInterval(autoSaveInterval);
    
    // Auto-save every 30 seconds
    autoSaveInterval = setInterval(() => {
        const pageName = document.getElementById('customPageName')?.value;
        if (pageName && pageName.trim()) {
            autoSaveCurrentPage();
        }
    }, 30000);
}

function stopAutoSave() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
    }
}

function loadAutoSaveDraft() {
    const draft = localStorage.getItem('customPage_autosave_draft');
    if (!draft) return false;
    
    try {
        const pageData = JSON.parse(draft);
        const draftTime = new Date(pageData.timestamp);
        const minutesAgo = Math.floor((Date.now() - draftTime.getTime()) / 60000);
        
        if (confirm(translate('restore-draft-prompt') || `Found auto-saved draft from ${minutesAgo} minutes ago. Restore it?`)) {
            document.getElementById('customPageName').value = pageData.name || '';
            document.getElementById('customPageDesc').value = pageData.description || '';
            document.getElementById('customPageIcon').value = pageData.icon || '📊';
            
            // Clear and restore inputs
            document.getElementById('customInputsList').innerHTML = '';
            pageData.inputs?.forEach(input => {
                addCustomInput();
                const lastInput = document.getElementById('customInputsList').lastChild;
                lastInput.querySelector('.input-var-name').value = input.variable;
                lastInput.querySelector('.input-label').value = input.label;
            });
            
            // Clear and restore formulas
            document.getElementById('customFormulasList').innerHTML = '';
            pageData.formulas?.forEach(formula => {
                addCustomFormula();
                const lastFormula = document.getElementById('customFormulasList').lastChild;
                lastFormula.querySelector('.formula-var-name').value = formula.variable;
                lastFormula.querySelector('.formula-expression').value = formula.formula;
            });
            
            updateWizardProgress();
            updateAvailableVariables();
            showToast('📂 ' + (translate('draft-restored') || 'Draft restored'), 'success');
            return true;
        }
    } catch (e) {
        console.error('Failed to load draft:', e);
    }
    return false;
}

function clearAutoSaveDraft() {
    localStorage.removeItem('customPage_autosave_draft');
}

function showTemplateCategory(category) {
    // This will open the template modal filtered by category
    openTemplateModal();
    // Filter logic can be added to the template modal
}

function updateLivePreview() {
    // Generate preview of the custom page
    const preview = document.getElementById('livePreviewContent');
    if (!preview) return;
    
    const pageName = document.getElementById('customPageName')?.value || 'Preview';
    const pageDesc = document.getElementById('customPageDesc')?.value || '';
    const pageIcon = document.getElementById('customPageIcon')?.value || '📊';
    
    let html = `
        <div class="text-center mb-6">
            <div class="text-6xl mb-3">${pageIcon}</div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">${pageName}</h2>
            ${pageDesc ? `<p class="text-gray-600 dark:text-gray-400 mt-2">${pageDesc}</p>` : ''}
        </div>
    `;
    
    // Show inputs
    const inputs = document.querySelectorAll('#customInputsList > div');
    if (inputs.length > 0) {
        html += '<div class="space-y-3 mb-6">';
        inputs.forEach(inputDiv => {
            const label = inputDiv.querySelector('.input-label')?.value || 'Input';
            const type = inputDiv.querySelector('.input-type')?.value || 'number';
            html += `
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">${label}</label>
                    <input type="${type}" class="input-field" placeholder="${currentLanguage === 'da' ? `Indtast ${label.toLowerCase()}` : `Enter ${label.toLowerCase()}`}">
                </div>
            `;
        });
        html += '</div>';
    }
    
    // Show formulas
    const formulas = document.querySelectorAll('#customFormulasList > div');
    if (formulas.length > 0) {
        html += '<div class="space-y-3">';
        formulas.forEach(formulaDiv => {
            const label = formulaDiv.querySelector('.formula-label')?.value || 'Result';
            html += `
                <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-600">
                    <div class="text-sm font-medium text-gray-700 dark:text-gray-300">${label}</div>
                    <div class="text-2xl font-bold text-gray-900 dark:text-white mt-2">0.00</div>
                </div>
            `;
        });
        html += '</div>';
    }
    
    preview.innerHTML = html;
}

// Drag and Drop Functions
function makeDraggable(element) {
    const handle = element.querySelector('.drag-handle');
    if (!handle) return;
    
    handle.addEventListener('mousedown', (e) => {
        element.setAttribute('draggable', 'true');
    });
    
    element.addEventListener('dragstart', (e) => {
        draggedElement = element;
        element.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
    });
    
    element.addEventListener('dragend', (e) => {
        element.style.opacity = '1';
        element.setAttribute('draggable', 'false');
        draggedElement = null;
    });
    
    element.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        if (!draggedElement || draggedElement === element) return;
        
        const rect = element.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        
        if (e.clientY < midY) {
            element.parentNode.insertBefore(draggedElement, element);
        } else {
            element.parentNode.insertBefore(draggedElement, element.nextSibling);
        }
    });
}

// Duplicate Functions
function duplicateInput(id) {
    const originalDiv = document.getElementById(id);
    if (!originalDiv) return;
    
    const varName = originalDiv.querySelector('.input-var-name').value;
    const label = originalDiv.querySelector('.input-label').value;
    const type = originalDiv.querySelector('.input-type').value;
    const defaultValue = originalDiv.querySelector('.input-default').value;
    const min = originalDiv.querySelector('.input-min')?.value;
    const max = originalDiv.querySelector('.input-max')?.value;
    const required = originalDiv.querySelector('.input-required')?.checked;
    
    addCustomInput();
    
    const newDiv = document.getElementById('customInputsList').lastChild;
    if (newDiv) {
        newDiv.querySelector('.input-var-name').value = varName + '_copy';
        newDiv.querySelector('.input-label').value = label + ' (Copy)';
        newDiv.querySelector('.input-type').value = type;
        newDiv.querySelector('.input-default').value = defaultValue;
        if (min) newDiv.querySelector('.input-min').value = min;
        if (max) newDiv.querySelector('.input-max').value = max;
        if (required) newDiv.querySelector('.input-required').checked = true;
    }
    
    updateWizardProgress();
    updateAvailableVariables();
    showToast('📋 ' + (translate('input-duplicated') || 'Input duplicated'), 'success');
}

function duplicateFormula(id) {
    const originalDiv = document.getElementById(id);
    if (!originalDiv) return;
    
    const varName = originalDiv.querySelector('.formula-var-name').value;
    const label = originalDiv.querySelector('.formula-label').value;
    const expression = originalDiv.querySelector('.formula-expression').value;
    
    addCustomFormula();
    
    const newDiv = document.getElementById('customFormulasList').lastChild;
    if (newDiv) {
        newDiv.querySelector('.formula-var-name').value = varName + '_copy';
        newDiv.querySelector('.formula-label').value = label + ' (Copy)';
        newDiv.querySelector('.formula-expression').value = expression;
        validateFormulaLive(newDiv.querySelector('.formula-expression'));
    }
    
    updateWizardProgress();
    showToast('📋 ' + (translate('formula-duplicated') || 'Formula duplicated'), 'success');
}

// Smart Variable Name Suggestion
function suggestVariableName(labelInput) {
    const label = labelInput.value;
    if (!label) return;
    
    const parent = labelInput.closest('.input-card');
    const varNameInput = parent?.querySelector('.input-var-name');
    
    if (!varNameInput || varNameInput.value) return; // Don't override if already has value
    
    // Convert label to camelCase variable name
    const varName = label
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .map((word, i) => i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
    
    varNameInput.value = varName;
    updateAvailableVariables();
}

// Formula Autocomplete System
let autocompleteIndex = -1;
let autocompleteList = [];

function setupFormulaAutocomplete() {
    // Get all available variables
    const variables = [];
    document.querySelectorAll('.input-var-name').forEach(input => {
        const varName = input.value.trim();
        if (varName) variables.push(varName);
    });
    
    // Math.js functions
    const mathFunctions = [
        'sqrt', 'pow', 'abs', 'round', 'ceil', 'floor',
        'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
        'log', 'log10', 'exp', 'min', 'max',
        'sum', 'mean', 'median', 'std', 'variance',
        'pi', 'e', 'tau', 'phi'
    ];
    
    return { variables, mathFunctions };
}

function handleFormulaAutocomplete(event, textarea) {
    const dropdown = document.getElementById('autocomplete-' + textarea.dataset.formulaId);
    if (!dropdown) return;
    
    // Handle arrow keys and enter when dropdown is visible
    if (!dropdown.classList.contains('hidden')) {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            autocompleteIndex = Math.min(autocompleteIndex + 1, autocompleteList.length - 1);
            updateAutocompleteSelection(dropdown);
            return;
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            autocompleteIndex = Math.max(autocompleteIndex - 1, 0);
            updateAutocompleteSelection(dropdown);
            return;
        } else if (event.key === 'Enter' && autocompleteIndex >= 0) {
            event.preventDefault();
            selectAutocompleteItem(textarea, autocompleteList[autocompleteIndex]);
            return;
        } else if (event.key === 'Escape') {
            dropdown.classList.add('hidden');
            return;
        }
    }
    
    // Trigger autocomplete on typing
    setTimeout(() => showAutocomplete(textarea), 10);
}

function showAutocomplete(textarea) {
    const dropdown = document.getElementById('autocomplete-' + textarea.dataset.formulaId);
    if (!dropdown) return;
    
    const text = textarea.value;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = text.substring(0, cursorPos);
    
    // Find the current word being typed
    const match = textBeforeCursor.match(/([a-zA-Z_][a-zA-Z0-9_]*)$/);
    if (!match) {
        dropdown.classList.add('hidden');
        return;
    }
    
    const currentWord = match[1];
    const { variables, mathFunctions } = setupFormulaAutocomplete();
    
    // Filter suggestions
    const suggestions = [
        ...variables.filter(v => v.toLowerCase().startsWith(currentWord.toLowerCase())).map(v => ({ type: 'var', value: v })),
        ...mathFunctions.filter(f => f.toLowerCase().startsWith(currentWord.toLowerCase())).map(f => ({ type: 'func', value: f }))
    ];
    
    if (suggestions.length === 0) {
        dropdown.classList.add('hidden');
        return;
    }
    
    autocompleteList = suggestions;
    autocompleteIndex = 0;
    
    // Build dropdown HTML
    dropdown.innerHTML = suggestions.map((item, i) => {
        const icon = item.type === 'var' ? '🔢' : '🧮';
        const color = item.type === 'var' ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400';
        return `
            <div class="autocomplete-item px-3 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 ${i === 0 ? 'bg-blue-50 dark:bg-gray-700' : ''}" 
                 data-index="${i}"
                 onclick="selectAutocompleteItem(document.querySelector('[data-formula-id=\\"${textarea.dataset.formulaId}\\"]'), '${item.value}')">
                <span class="${color}">${icon} <strong>${item.value}</strong></span>
                <span class="text-xs text-gray-500 ml-2">${item.type === 'var' ? 'variable' : 'function'}</span>
            </div>
        `;
    }).join('');
    
    dropdown.classList.remove('hidden');
}

function updateAutocompleteSelection(dropdown) {
    const items = dropdown.querySelectorAll('.autocomplete-item');
    items.forEach((item, i) => {
        if (i === autocompleteIndex) {
            item.classList.add('bg-blue-50', 'dark:bg-gray-700');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('bg-blue-50', 'dark:bg-gray-700');
        }
    });
}

function selectAutocompleteItem(textarea, value) {
    const text = textarea.value;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = text.substring(0, cursorPos);
    const textAfterCursor = text.substring(cursorPos);
    
    // Replace the current word with the selected value
    const newTextBefore = textBeforeCursor.replace(/([a-zA-Z_][a-zA-Z0-9_]*)$/, value);
    textarea.value = newTextBefore + textAfterCursor;
    textarea.selectionStart = textarea.selectionEnd = newTextBefore.length;
    
    // Hide dropdown
    const dropdown = document.getElementById('autocomplete-' + textarea.dataset.formulaId);
    if (dropdown) dropdown.classList.add('hidden');
    
    // Trigger validation
    validateFormulaLive(textarea);
    textarea.focus();
}

// Real-time Formula Validation
function validateFormulaLive(textarea) {
    const formula = textarea.value.trim();
    const parent = textarea.closest('.formula-card');
    const errorDiv = parent?.querySelector('.formula-error');
    const successDiv = parent?.querySelector('.formula-success');
    
    if (!formula) {
        if (errorDiv) errorDiv.classList.add('hidden');
        if (successDiv) successDiv.classList.add('hidden');
        return;
    }
    
    try {
        // Get available variables
        const variables = {};
        document.querySelectorAll('.input-var-name').forEach(input => {
            const varName = input.value.trim();
            if (varName) variables[varName] = 10; // Test value
        });
        
        // Try to evaluate
        const result = math.evaluate(formula, variables);
        
        // Success
        if (errorDiv) errorDiv.classList.add('hidden');
        if (successDiv) {
            successDiv.textContent = `✓ ${translate('valid-formula') || 'Valid formula'} (test result: ${result})`;
            successDiv.classList.remove('hidden');
        }
    } catch (error) {
        // Error
        if (successDiv) successDiv.classList.add('hidden');
        if (errorDiv) {
            errorDiv.textContent = `⚠️ ${error.message}`;
            errorDiv.classList.remove('hidden');
        }
    }
}

// Initialize Enter key listeners for all calculators
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof setupReorderPointEnterKey === 'function') setupReorderPointEnterKey();
        if (typeof setupPeriodicReviewEnterKey === 'function') setupPeriodicReviewEnterKey();
        if (typeof setupMinMaxEnterKey === 'function') setupMinMaxEnterKey();
    }, 500);
});

// ========================================
// BARCODE & QR CODE GENERATOR
// ========================================

// State
let currentQRInstance = null;
let currentQRType = 'url';
let batchBarcodeData = [];

// --- QR Type Switching ---

function setQRType(type) {
    currentQRType = type;

    // Update tab button styles
    document.querySelectorAll('.qr-type-btn').forEach(btn => {
        btn.classList.remove('active-qr-type', 'bg-blue-100', 'dark:bg-blue-900/40', 'text-blue-700', 'dark:text-blue-300');
        btn.classList.add('bg-gray-100', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300', 'hover:bg-gray-200', 'dark:hover:bg-gray-600');
    });
    const activeBtn = document.getElementById(`qrType${type.charAt(0).toUpperCase() + type.slice(1)}`);
    if (activeBtn) {
        activeBtn.classList.remove('bg-gray-100', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300', 'hover:bg-gray-200', 'dark:hover:bg-gray-600');
        activeBtn.classList.add('active-qr-type', 'bg-blue-100', 'dark:bg-blue-900/40', 'text-blue-700', 'dark:text-blue-300');
    }

    const container = document.getElementById('qrContentFields');
    if (!container) return;

    const inputClass = 'input-field w-full mb-2';
    const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

    const templates = {
        url: `
            <label class="${labelClass}">URL</label>
            <input type="url" id="qrInput_url" class="${inputClass}" placeholder="${currentLanguage === 'da' ? 'https://eksempel.dk' : 'https://example.com'}"
                   oninput="if(document.getElementById('qrLive').checked) generateQRCode()">`,
        text: `
            <label class="${labelClass}">${currentLanguage === 'da' ? 'Tekst' : 'Text'}</label>
            <textarea id="qrInput_text" rows="3" class="${inputClass}" placeholder="${currentLanguage === 'da' ? 'Skriv din tekst her...' : 'Type your text here...'}"
                      oninput="if(document.getElementById('qrLive').checked) generateQRCode()"></textarea>`,
        email: `
            <label class="${labelClass}">${currentLanguage === 'da' ? 'Email-adresse' : 'Email address'}</label>
            <input type="email" id="qrInput_email" class="${inputClass}" placeholder="${currentLanguage === 'da' ? 'kontakt@virksomhed.dk' : 'contact@company.com'}"
                   oninput="if(document.getElementById('qrLive').checked) generateQRCode()">
            <label class="${labelClass}">${currentLanguage === 'da' ? 'Emne (valgfri)' : 'Subject (optional)'}</label>
            <input type="text" id="qrInput_subject" class="${inputClass}" placeholder="${currentLanguage === 'da' ? 'Forespørgsel' : 'Inquiry'}"
                   oninput="if(document.getElementById('qrLive').checked) generateQRCode()">
            <label class="${labelClass}">${currentLanguage === 'da' ? 'Besked (valgfri)' : 'Message (optional)'}</label>
            <textarea id="qrInput_body" rows="2" class="${inputClass}" placeholder="${currentLanguage === 'da' ? 'Hej...' : 'Hello...'}"
                      oninput="if(document.getElementById('qrLive').checked) generateQRCode()"></textarea>`,
        phone: `
            <label class="${labelClass}">${currentLanguage === 'da' ? 'Telefonnummer' : 'Phone number'}</label>
            <input type="tel" id="qrInput_phone" class="${inputClass}" placeholder="+4512345678"
                   oninput="if(document.getElementById('qrLive').checked) generateQRCode()">`,
        wifi: `
            <label class="${labelClass}">${currentLanguage === 'da' ? 'Netværksnavn (SSID)' : 'Network name (SSID)'}</label>
            <input type="text" id="qrInput_ssid" class="${inputClass}" placeholder="${currentLanguage === 'da' ? 'MitNetværk' : 'MyNetwork'}"
                   oninput="if(document.getElementById('qrLive').checked) generateQRCode()">
            <label class="${labelClass}">${currentLanguage === 'da' ? 'Adgangskode' : 'Password'}</label>
            <input type="text" id="qrInput_pass" class="${inputClass}" placeholder="${currentLanguage === 'da' ? 'MinKode123' : 'MyCode123'}"
                   oninput="if(document.getElementById('qrLive').checked) generateQRCode()">
            <label class="${labelClass}">${currentLanguage === 'da' ? 'Krypteringstype' : 'Encryption type'}</label>
            <select id="qrInput_enc" class="${inputClass}" onchange="if(document.getElementById('qrLive').checked) generateQRCode()">
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">${currentLanguage === 'da' ? 'Ingen (åbent netværk)' : 'None (open network)'}</option>
            </select>`,
        vcard: `
            <label class="${labelClass}">${currentLanguage === 'da' ? 'Navn' : 'Name'}</label>
            <input type="text" id="qrInput_name" class="${inputClass}" placeholder="${currentLanguage === 'da' ? 'Lars Hansen' : 'John Smith'}"
                   oninput="if(document.getElementById('qrLive').checked) generateQRCode()">
            <label class="${labelClass}">${currentLanguage === 'da' ? 'Firma (valgfri)' : 'Company (optional)'}</label>
            <input type="text" id="qrInput_org" class="${inputClass}" placeholder="${currentLanguage === 'da' ? 'Acme ApS' : 'Acme Inc.'}"
                   oninput="if(document.getElementById('qrLive').checked) generateQRCode()">
            <label class="${labelClass}">${currentLanguage === 'da' ? 'Telefon (valgfri)' : 'Phone (optional)'}</label>
            <input type="tel" id="qrInput_vcardPhone" class="${inputClass}" placeholder="+4512345678"
                   oninput="if(document.getElementById('qrLive').checked) generateQRCode()">
            <label class="${labelClass}">${currentLanguage === 'da' ? 'Email (valgfri)' : 'Email (optional)'}</label>
            <input type="email" id="qrInput_vcardEmail" class="${inputClass}" placeholder="lars@acme.dk"
                   oninput="if(document.getElementById('qrLive').checked) generateQRCode()">`
    };

    container.innerHTML = templates[type] || templates.url;
}

function buildQRContent() {
    const type = currentQRType;
    const val = id => { const el = document.getElementById(`qrInput_${id}`); return el ? el.value.trim() : ''; };

    switch (type) {
        case 'url':   return val('url') || 'https://eksempel.dk';
        case 'text':  return val('text') || (currentLanguage === 'da' ? 'Intet indhold' : 'No content');
        case 'email': {
            const email = val('email');
            const subject = val('subject');
            const body = val('body');
            if (!email) return 'mailto:';
            let mailto = `mailto:${email}`;
            const params = [];
            if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
            if (body)    params.push(`body=${encodeURIComponent(body)}`);
            if (params.length) mailto += '?' + params.join('&');
            return mailto;
        }
        case 'phone': return `tel:${val('phone') || '+45'}`;
        case 'wifi': {
            const ssid = val('ssid');
            const pass = val('pass');
            const enc  = val('enc') || 'WPA';
            return `WIFI:T:${enc};S:${ssid};P:${pass};;`;
        }
        case 'vcard': {
            const name  = val('name')       || '';
            const org   = val('org')        || '';
            const phone = val('vcardPhone') || '';
            const email = val('vcardEmail') || '';
            return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\n${org ? 'ORG:' + org + '\n' : ''}${phone ? 'TEL:' + phone + '\n' : ''}${email ? 'EMAIL:' + email + '\n' : ''}END:VCARD`;
        }
        default: return '';
    }
}

// --- QR Generation ---

function generateQRCode() {
    const preview = document.getElementById('qrPreview');
    const errorEl = document.getElementById('qrError');
    const infoBox = document.getElementById('qrContentInfo');
    const infoDisplay = document.getElementById('qrContentDisplay');

    if (!preview) return;

    const content = buildQRContent();
    const size    = parseInt(document.getElementById('qrSize')?.value  || 250);
    const fgColor = document.getElementById('qrFgColor')?.value || '#000000';
    const bgColor = document.getElementById('qrBgColor')?.value || '#ffffff';
    const errorLevelKey = document.getElementById('qrErrorLevel')?.value || 'M';

    if (!content) {
        preview.innerHTML = '<p class="text-gray-400 dark:text-gray-500 text-sm">' + (currentLanguage === 'da' ? 'Udfyld indholdet ovenfor' : 'Fill in the content above') + '</p>';
        if (infoBox) infoBox.classList.add('hidden');
        return;
    }

    const errorLevels = { L: QRCode.CorrectLevel.L, M: QRCode.CorrectLevel.M, Q: QRCode.CorrectLevel.Q, H: QRCode.CorrectLevel.H };

    // Destroy old instance
    if (currentQRInstance) {
        try { currentQRInstance.clear(); } catch(e) {}
    }

    // Clean container
    preview.innerHTML = '';
    const qrContainer = document.createElement('div');
    preview.appendChild(qrContainer);

    try {
        currentQRInstance = new QRCode(qrContainer, {
            text: content,
            width: size,
            height: size,
            colorDark: fgColor,
            colorLight: bgColor,
            correctLevel: errorLevels[errorLevelKey] || QRCode.CorrectLevel.M
        });

        if (errorEl) errorEl.classList.add('hidden');

        // Show content preview
        if (infoBox && infoDisplay) {
            infoDisplay.textContent = content.length > 150 ? content.substring(0, 150) + '…' : content;
            infoBox.classList.remove('hidden');
        }
    } catch(err) {
        preview.innerHTML = '<p class="text-gray-400 dark:text-gray-500 text-sm">' + (currentLanguage === 'da' ? 'Udfyld indholdet ovenfor' : 'Fill in the content above') + '</p>';
        if (errorEl) {
            errorEl.textContent = (currentLanguage === 'da' ? 'Kunne ikke generere QR-kode: ' : 'Could not generate QR code: ') + err.message;
            errorEl.classList.remove('hidden');
        }
        if (infoBox) infoBox.classList.add('hidden');
    }
}

function downloadQRCode(format) {
    const preview = document.getElementById('qrPreview');
    if (!preview) return;

    const canvas = preview.querySelector('canvas');
    const img    = preview.querySelector('img');

    if (format === 'png') {
        let dataUrl;
        if (canvas) {
            dataUrl = canvas.toDataURL('image/png');
        } else if (img) {
            // Draw img onto canvas to download
            const c = document.createElement('canvas');
            c.width = img.width || 250;
            c.height = img.height || 250;
            c.getContext('2d').drawImage(img, 0, 0);
            dataUrl = c.toDataURL('image/png');
        } else {
            showToast(currentLanguage === 'da' ? 'Generer en QR-kode først' : 'Generate a QR code first', 'warning');
            return;
        }
        const link = document.createElement('a');
        link.href     = dataUrl;
        link.download = `qrcode_${Date.now()}.png`;
        link.click();
        showToast(currentLanguage === 'da' ? 'QR-kode downloadet som PNG' : 'QR code downloaded as PNG', 'success');
    } else if (format === 'svg') {
        // Build a simple SVG from the canvas
        if (!canvas) { showToast(currentLanguage === 'da' ? 'Generer en QR-kode først' : 'Generate a QR code first', 'warning'); return; }
        const size    = parseInt(document.getElementById('qrSize')?.value || 250);
        const fgColor = document.getElementById('qrFgColor')?.value || '#000000';
        const bgColor = document.getElementById('qrBgColor')?.value || '#ffffff';
        const svgContent = canvasToSVG(canvas, size, fgColor, bgColor);
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url  = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href     = url;
        link.download = `qrcode_${Date.now()}.svg`;
        link.click();
        URL.revokeObjectURL(url);
        showToast(currentLanguage === 'da' ? 'QR-kode downloadet som SVG' : 'QR code downloaded as SVG', 'success');
    }
}

// Helper: convert canvas pixel data to SVG rects
function canvasToSVG(canvas, size, fgColor, bgColor) {
    const ctx  = canvas.getContext('2d');
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const scale = canvas.width / size;
    let rects = '';
    // Sample at cell-level (every ~scale pixels)
    const step = Math.max(1, Math.round(scale));
    for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
            const i = (y * canvas.width + x) * 4;
            const r = data.data[i], g = data.data[i+1], b = data.data[i+2];
            if (r < 128 && g < 128 && b < 128) {
                rects += `<rect x="${(x/canvas.width*size).toFixed(1)}" y="${(y/canvas.height*size).toFixed(1)}" width="${step/scale*size/step > 1 ? (1).toFixed(1) : (step/scale).toFixed(1)}" height="${(step/canvas.height*size).toFixed(1)}" fill="${fgColor}"/>`;
            }
        }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="${bgColor}"/>${rects}</svg>`;
}

// --- Barcode Generation ---

function updateBarcodeHint() {
    const format = document.getElementById('barcodeFormat')?.value;
    const hintEl = document.getElementById('barcodeHint');
    if (!hintEl) return;
    const hints = {
        EAN13:  currentLanguage === 'da' ? 'EAN-13: Indtast 12 cifre — check-cifret (det 13.) beregnes automatisk.' : 'EAN-13: Enter 12 digits — the check digit (13th) is calculated automatically.',
        EAN8:   currentLanguage === 'da' ? 'EAN-8: Indtast 7 cifre — check-cifret (det 8.) beregnes automatisk.' : 'EAN-8: Enter 7 digits — the check digit (8th) is calculated automatically.',
        UPCA:   currentLanguage === 'da' ? 'UPC-A: Indtast 11 cifre — check-cifret beregnes automatisk.' : 'UPC-A: Enter 11 digits — the check digit is calculated automatically.',
        CODE128:currentLanguage === 'da' ? 'CODE-128: Fri tekst og tal op til ~80 tegn.' : 'CODE-128: Free text and numbers up to ~80 characters.',
        CODE39: currentLanguage === 'da' ? 'CODE-39: Store bogstaver, cifre og tegnene: -.$/+%SPACE' : 'CODE-39: Uppercase letters, digits and characters: -.$/+%SPACE',
        ITF14:  currentLanguage === 'da' ? 'ITF-14: Indtast 13 cifre — check-cifret beregnes automatisk.' : 'ITF-14: Enter 13 digits — the check digit is calculated automatically.',
        MSI:    currentLanguage === 'da' ? 'MSI: Kun cifre, fri længde.' : 'MSI: Digits only, any length.'
    };
    hintEl.textContent = hints[format] || '';
    if (document.getElementById('barcodeLive')?.checked) generateBarcode();
}

function generateBarcode() {
    const preview  = document.getElementById('barcodePreview');
    const errorEl  = document.getElementById('barcodeError');
    if (!preview) return;

    const format    = document.getElementById('barcodeFormat')?.value || 'EAN13';
    const value     = document.getElementById('barcodeValue')?.value?.trim() || '';
    const lineColor = document.getElementById('barcodeLineColor')?.value || '#000000';
    const bgColor   = document.getElementById('barcodeBgColor')?.value || '#ffffff';
    const width     = parseFloat(document.getElementById('barcodeWidth')?.value || 2);
    const height    = parseInt(document.getElementById('barcodeHeight')?.value || 100);
    const displayValue = document.getElementById('barcodeShowText')?.checked !== false;

    if (!value) {
        preview.innerHTML = '<p class="text-gray-400 dark:text-gray-500 text-sm">' + (currentLanguage === 'da' ? 'Ingen stregkode endnu — klik Generer' : 'No barcode yet — click Generate') + '</p>';
        if (errorEl) errorEl.classList.add('hidden');
        return;
    }

    preview.innerHTML = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('id', 'barcodeSVG');
    preview.appendChild(svg);

    try {
        JsBarcode(svg, value, {
            format,
            lineColor,
            background: bgColor,
            width,
            height,
            displayValue,
            margin: 10,
            fontSize: 14,
            font: 'monospace'
        });
        if (errorEl) errorEl.classList.add('hidden');
    } catch(err) {
        preview.innerHTML = '<p class="text-gray-400 dark:text-gray-500 text-sm">' + (currentLanguage === 'da' ? 'Kunne ikke generere — tjek format og indhold.' : 'Could not generate — check format and content.') + '</p>';
        if (errorEl) {
            errorEl.textContent = err.message || (currentLanguage === 'da' ? 'Ugyldigt indhold for det valgte format.' : 'Invalid content for the selected format.');
            errorEl.classList.remove('hidden');
        }
    }
}

function downloadBarcode(format) {
    const svgEl = document.getElementById('barcodeSVG');
    if (!svgEl) { showToast(currentLanguage === 'da' ? 'Generer en stregkode først' : 'Generate a barcode first', 'warning'); return; }

    if (format === 'svg') {
        const serializer = new XMLSerializer();
        const svgStr = serializer.serializeToString(svgEl);
        const blob = new Blob([svgStr], { type: 'image/svg+xml' });
        const link = document.createElement('a');
        link.href     = URL.createObjectURL(blob);
        link.download = `barcode_${Date.now()}.svg`;
        link.click();
        showToast(currentLanguage === 'da' ? 'Stregkode downloadet som SVG' : 'Barcode downloaded as SVG', 'success');
    } else if (format === 'png') {
        const svgData = new XMLSerializer().serializeToString(svgEl);
        const img = new Image();
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width  = img.width  || svgEl.getBoundingClientRect().width  || 400;
            canvas.height = img.height || svgEl.getBoundingClientRect().height || 150;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const link = document.createElement('a');
            link.href     = canvas.toDataURL('image/png');
            link.download = `barcode_${Date.now()}.png`;
            link.click();
            URL.revokeObjectURL(url);
            showToast(currentLanguage === 'da' ? 'Stregkode downloadet som PNG' : 'Barcode downloaded as PNG', 'success');
        };
        img.src = url;
    }
}

// --- Batch Barcodes ---

function generateBatchBarcodes() {
    const textarea = document.getElementById('barcodeBatch');
    const results  = document.getElementById('batchBarcodeResults');
    const dlBtn    = document.getElementById('downloadBatchBtn');
    if (!textarea || !results) return;

    const lines = textarea.value.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) { showToast(currentLanguage === 'da' ? 'Ingen værdier at generere' : 'No values to generate', 'warning'); return; }

    const format    = document.getElementById('barcodeFormat')?.value || 'EAN13';
    const lineColor = document.getElementById('barcodeLineColor')?.value || '#000000';
    const bgColor   = document.getElementById('barcodeBgColor')?.value || '#ffffff';
    const width     = parseFloat(document.getElementById('barcodeWidth')?.value || 2);
    const height    = parseInt(document.getElementById('barcodeHeight')?.value || 100);
    const displayValue = document.getElementById('barcodeShowText')?.checked !== false;

    results.innerHTML = '';
    batchBarcodeData = [];
    let successCount = 0;
    let errorCount   = 0;

    lines.forEach((value, i) => {
        const card = document.createElement('div');
        card.className = 'p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600';

        const label = document.createElement('p');
        label.className = 'text-xs font-medium text-gray-600 dark:text-gray-400 mb-2';
        label.textContent = `#${i + 1}: ${value}`;
        card.appendChild(label);

        const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgEl.setAttribute('id', `batchSVG_${i}`);
        card.appendChild(svgEl);

        try {
            JsBarcode(svgEl, value, { format, lineColor, background: bgColor, width, height, displayValue, margin: 8, fontSize: 12 });
            batchBarcodeData.push({ value, svg: new XMLSerializer().serializeToString(svgEl) });
            successCount++;
        } catch(err) {
            svgEl.remove();
            const errEl = document.createElement('p');
            errEl.className = 'text-xs text-red-500';
            errEl.textContent = '❌ ' + (err.message || 'Ugyldig');
            card.appendChild(errEl);
            errorCount++;
        }

        results.appendChild(card);
    });

    if (dlBtn) dlBtn.classList.toggle('hidden', successCount === 0);
    showToast(currentLanguage === 'da' ? `✅ ${successCount} stregkode${successCount !== 1 ? 'r' : ''} genereret${errorCount > 0 ? `, ${errorCount} fejl` : ''}` : `✅ ${successCount} barcode${successCount !== 1 ? 's' : ''} generated${errorCount > 0 ? `, ${errorCount} error${errorCount !== 1 ? 's' : ''}` : ''}`, successCount > 0 ? 'success' : 'error');
}

function downloadBatchBarcodes() {
    if (batchBarcodeData.length === 0) { showToast(currentLanguage === 'da' ? 'Generer stregkoderne først' : 'Generate the barcodes first', 'warning'); return; }

    // If JSZip is available, zip them all; otherwise download one by one
    if (typeof JSZip !== 'undefined') {
        const zip = new JSZip();
        batchBarcodeData.forEach((item, i) => {
            zip.file(`barcode_${i + 1}_${item.value}.svg`, item.svg);
        });
        zip.generateAsync({ type: 'blob' }).then(blob => {
            const link = document.createElement('a');
            link.href     = URL.createObjectURL(blob);
            link.download = currentLanguage === 'da' ? 'stregkoder.zip' : 'barcodes.zip';
            link.click();
            showToast(currentLanguage === 'da' ? `${batchBarcodeData.length} stregkoder downloadet som ZIP` : `${batchBarcodeData.length} barcodes downloaded as ZIP`, 'success');
        });
    } else {
        // Fallback: download as a single HTML page with all barcodes
        const combined = batchBarcodeData.map((item, i) =>
            `<div style="margin:16px;display:inline-block;border:1px solid #ddd;padding:8px;border-radius:4px">
                <p style="font-size:11px;color:#666;margin-bottom:4px">#${i+1}: ${item.value}</p>
                ${item.svg}
            </div>`
        ).join('');
        const html = `<!DOCTYPE html><html><head><title>${currentLanguage === 'da' ? 'Stregkoder' : 'Barcodes'}</title></head><body style="background:#fff;font-family:sans-serif;padding:16px"><h1 style="font-size:18px">${currentLanguage === 'da' ? 'Stregkoder' : 'Barcodes'}</h1>${combined}</body></html>`;
        const blob = new Blob([html], { type: 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = currentLanguage === 'da' ? 'stregkoder.html' : 'barcodes.html';
        link.click();
        showToast(currentLanguage === 'da' ? `${batchBarcodeData.length} stregkoder downloadet som HTML` : `${batchBarcodeData.length} barcodes downloaded as HTML`, 'success');
    }
}

// Initialize barcode page when tab is switched to (only once)
let _barcodeTabInitialized = false;
function initBarcodeTab() {
    if (_barcodeTabInitialized) return;
    _barcodeTabInitialized = true;
    // Set up default QR type fields
    setQRType('url');
    // Set hint for default barcode format
    updateBarcodeHint();
}

// ========================================
// LEAN TOOLS CALCULATORS
// ========================================

// OEE Calculator
function calculateOEE() {
    const availability = parseFloat(document.getElementById('oeeAvailability').value) || 0;
    const performance = parseFloat(document.getElementById('oeePerformance').value) || 0;
    const quality = parseFloat(document.getElementById('oeeQuality').value) || 0;
    
    // Calculate OEE
    const oee = (availability * performance * quality) / 10000;
    
    // Auto-save to localStorage
    localStorage.setItem('lean_oee_data', JSON.stringify({
        availability, performance, quality, oee, timestamp: Date.now()
    }));
    
    // Update result with animation
    const resultElem = document.getElementById('oeeResult');
    const ratingElem = document.getElementById('oeeRating');
    
    if (resultElem) {
        // Animate counter
        animateValue(resultElem, parseFloat(resultElem.textContent) || 0, oee, 600, '%');
    }
    
    // Set rating and color
    if (ratingElem) {
        let rating = '';
        let colorClass = '';
        
        if (oee < 60) {
            rating = translations[currentLanguage]['lean-oee-poor'] || 'Poor - Needs Improvement';
            colorClass = 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300';
        } else if (oee < 75) {
            rating = translations[currentLanguage]['lean-oee-average'] || 'Average - Room for Growth';
            colorClass = 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
        } else if (oee < 85) {
            rating = translations[currentLanguage]['lean-oee-good'] || 'Good - Above Average';
            colorClass = 'bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-300';
        } else {
            rating = translations[currentLanguage]['lean-oee-world-class'] || 'World Class Excellence!';
            colorClass = 'bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
            // Trigger confetti for world class!
            if (oee >= 85) triggerConfetti('oeeConfetti');
        }
        
        ratingElem.textContent = rating;
        ratingElem.className = 'inline-block px-4 py-1 rounded-full text-sm font-semibold ' + colorClass;
    }
}

// Animated counter helper
function animateValue(element, start, end, duration, suffix = '') {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = current.toFixed(1) + suffix;
    }, 16);
}

// Confetti effect for achievements
function triggerConfetti(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    canvas.style.display = 'block';
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const particles = [];
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
    
    for (let i = 0; i < 50; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10 - 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 5 + 2
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let activeParticles = 0;
        
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.3; // gravity
            
            if (p.y < canvas.height) {
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, p.size, p.size);
                activeParticles++;
            }
        });
        
        if (activeParticles > 0) {
            requestAnimationFrame(animate);
        } else {
            canvas.style.display = 'none';
        }
    }
    
    animate();
}

// Reset OEE calculator
function resetOEE() {
    document.getElementById('oeeAvailability').value = '85';
    document.getElementById('oeePerformance').value = '90';
    document.getElementById('oeeQuality').value = '95';
    calculateOEE();
}

// Industry OEE benchmarks
const oeeBenchmarks = {
    general: { name: 'General Manufacturing', value: 65 },
    automotive: { name: 'Automotive', value: 85 },
    pharma: { name: 'Pharmaceutical', value: 55 },
    food: { name: 'Food & Beverage', value: 50 },
    electronics: { name: 'Electronics', value: 75 },
    worldclass: { name: 'World Class', value: 85 }
};

// Update OEE benchmark display
function updateOEEBenchmark() {
    const industry = document.getElementById('oee-benchmark-industry')?.value || 'worldclass';
    const benchmark = oeeBenchmarks[industry] || oeeBenchmarks.worldclass;
    
    // Update benchmark marker position
    const benchmarkMarker = document.getElementById('oee-benchmark-marker');
    if (benchmarkMarker) {
        benchmarkMarker.style.left = `${benchmark.value}%`;
        const label = benchmarkMarker.querySelector('div');
        if (label) {
            label.textContent = `${benchmark.value}%`;
        }
    }
    
    // Update current OEE position
    updateOEEMarkerPosition();
    
    // Use LEANEnhancements if available
    if (window.LEANEnhancements && window.LEANEnhancements.benchmarks) {
        window.LEANEnhancements.benchmarks.setIndustry(industry);
    }
}

// Update OEE current marker position
function updateOEEMarkerPosition() {
    const oeeResult = document.getElementById('oeeResult');
    const currentMarker = document.getElementById('oee-current-marker');
    
    if (oeeResult && currentMarker) {
        const oeeValue = parseFloat(oeeResult.textContent) || 0;
        currentMarker.style.left = `${Math.min(oeeValue, 100)}%`;
    }
}

// Extend calculateOEE to update benchmark bar
const _originalCalculateOEEForBenchmark = calculateOEE;
calculateOEE = function() {
    _originalCalculateOEEForBenchmark.call(this);
    setTimeout(updateOEEMarkerPosition, 650); // After animation
};

// Copy OEE results
function copyOEEResults() {
    const availability = document.getElementById('oeeAvailability').value;
    const performance = document.getElementById('oeePerformance').value;
    const quality = document.getElementById('oeeQuality').value;
    const result = document.getElementById('oeeResult').textContent;
    const rating = document.getElementById('oeeRating').textContent;
    
    const text = `OEE Calculator Results\n` +
                 `Availability: ${availability}%\n` +
                 `Performance: ${performance}%\n` +
                 `Quality: ${quality}%\n` +
                 `OEE: ${result}\n` +
                 `Rating: ${rating}`;
    
    navigator.clipboard.writeText(text).then(() => {
        showCopyFeedback(event.target);
    });
}

// Show copy feedback
function showCopyFeedback(button) {
    const originalText = button.textContent;
    button.textContent = '✓ Copied!';
    button.classList.add('bg-green-700');
    setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('bg-green-700');
    }, 2000);
}

// Toggle tooltip visibility
function showTooltip(tooltipId) {
    const tooltip = document.getElementById(tooltipId);
    if (tooltip) {
        tooltip.classList.toggle('hidden');
    }
}

// SMED Savings Calculator
function calculateSMED() {
    const currentTime = parseFloat(document.getElementById('smedCurrentTime').value) || 0;
    const targetTime = parseFloat(document.getElementById('smedTargetTime').value) || 0;
    const frequency = parseFloat(document.getElementById('smedFrequency').value) || 0;
    const hourlyCost = parseFloat(document.getElementById('smedHourlyCost').value) || 0;
    
    // Calculate savings
    const timeSaved = currentTime - targetTime;
    const reduction = currentTime > 0 ? ((timeSaved / currentTime) * 100) : 0;
    const hoursSavedPerYear = (timeSaved * frequency) / 60;
    const annualSavings = hoursSavedPerYear * hourlyCost;
    
    // Auto-save to localStorage
    localStorage.setItem('lean_smed_data', JSON.stringify({
        currentTime, targetTime, frequency, hourlyCost, annualSavings, timestamp: Date.now()
    }));
    
    // Update results
    document.getElementById('smedTimeSaved').textContent = timeSaved.toFixed(1) + ' min';
    document.getElementById('smedReduction').textContent = reduction.toFixed(0) + '%';
    document.getElementById('smedAnnualSavings').textContent = formatNumber(annualSavings.toFixed(0)) + ' kr';
    
    const hoursSavedText = translations[currentLanguage]['lean-smed-hours-saved'] || 'hours saved';
    document.getElementById('smedHoursSaved').textContent = hoursSavedPerYear.toFixed(1) + ' ' + hoursSavedText;
}

// Reset SMED calculator
function resetSMED() {
    document.getElementById('smedCurrentTime').value = '30';
    document.getElementById('smedTargetTime').value = '10';
    document.getElementById('smedFrequency').value = '250';
    document.getElementById('smedHourlyCost').value = '500';
    calculateSMED();
}

// Copy SMED results
function copySMEDResults() {
    const currentTime = document.getElementById('smedCurrentTime').value;
    const targetTime = document.getElementById('smedTargetTime').value;
    const timeSaved = document.getElementById('smedTimeSaved').textContent;
    const reduction = document.getElementById('smedReduction').textContent;
    const annualSavings = document.getElementById('smedAnnualSavings').textContent;
    
    const text = `SMED Savings Results\n` +
                 `Current Setup: ${currentTime} min\n` +
                 `Target Setup: ${targetTime} min\n` +
                 `Time Saved: ${timeSaved}\n` +
                 `Reduction: ${reduction}\n` +
                 `Annual Savings: ${annualSavings}`;
    
    navigator.clipboard.writeText(text).then(() => {
        showCopyFeedback(event.target);
    });
}

// Waste Cost Calculator
function calculateWaste() {
    let totalCost = 0;
    let wasteCount = 0;
    const wasteData = {};
    
    const wastes = [
        'Overproduction', 'Waiting', 'Transport', 
        'Processing', 'Inventory', 'Motion', 'Defects'
    ];
    
    wastes.forEach(waste => {
        const checkbox = document.getElementById('waste' + waste);
        const costInput = document.getElementById('waste' + waste + 'Cost');
        
        if (checkbox && checkbox.checked && costInput) {
            const cost = parseFloat(costInput.value) || 0;
            totalCost += cost;
            wasteCount++;
            wasteData[waste] = cost;
        }
    });
    
    // Auto-save to localStorage
    localStorage.setItem('lean_7wastes_data', JSON.stringify({
        wasteData, totalCost, checkedCount: wasteCount, timestamp: Date.now()
    }));
    
    // Update results
    document.getElementById('wasteTotalCost').textContent = formatNumber(totalCost.toFixed(0)) + ' kr';
    const wasteText = currentLanguage === 'da' 
        ? `${wasteCount} spildtyper valgt`
        : `${wasteCount} waste type${wasteCount !== 1 ? 's' : ''} selected`;
    document.getElementById('wasteCount').textContent = wasteText;
    
    // Render waste pie chart
    renderWastePieChart(wasteData, totalCost);
}

// Render waste distribution pie chart
function renderWastePieChart(wasteData, totalCost) {
    const chartContainer = document.getElementById('waste-pie-chart');
    if (!chartContainer) return;
    
    const entries = Object.entries(wasteData).filter(([_, v]) => v > 0);
    
    if (entries.length === 0) {
        chartContainer.innerHTML = '<p class="text-center text-gray-500 text-sm py-4">' + 
            (currentLanguage === 'da' ? 'Vælg spildtyper for at se fordelingen' : 'Select waste types to see distribution') + '</p>';
        return;
    }
    
    // Waste colors matching LEAN methodology
    const colors = {
        'Overproduction': '#ef4444', // red
        'Waiting': '#f97316',        // orange
        'Transport': '#eab308',      // yellow
        'Processing': '#22c55e',     // green
        'Inventory': '#06b6d4',      // cyan
        'Motion': '#3b82f6',         // blue
        'Defects': '#8b5cf6'         // purple
    };
    
    // Use LEANEnhancements if available
    if (window.LEANEnhancements && window.LEANEnhancements.wastes && window.LEANEnhancements.wastes.renderPieChart) {
        chartContainer.innerHTML = window.LEANEnhancements.wastes.renderPieChart(entries, totalCost, colors);
        return;
    }
    
    // Fallback: Create simple bar representation
    chartContainer.innerHTML = `
        <div class="space-y-2">
            ${entries.map(([waste, cost]) => {
                const percent = ((cost / totalCost) * 100).toFixed(1);
                return `
                    <div class="flex items-center gap-2">
                        <div class="w-24 text-xs text-gray-600 dark:text-gray-400 truncate">${waste}</div>
                        <div class="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                            <div class="h-full transition-all duration-300" style="width: ${percent}%; background-color: ${colors[waste] || '#6b7280'}"></div>
                        </div>
                        <div class="w-16 text-xs text-right font-medium">${percent}%</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Reset Waste calculator
function resetWaste() {
    const wastes = ['Overproduction', 'Waiting', 'Transport', 'Processing', 'Inventory', 'Motion', 'Defects'];
    wastes.forEach(waste => {
        const checkbox = document.getElementById('waste' + waste);
        const costInput = document.getElementById('waste' + waste + 'Cost');
        if (checkbox) checkbox.checked = false;
        if (costInput) costInput.value = '';
    });
    calculateWaste();
}

// Copy Waste results
function copyWasteResults() {
    const wastes = ['Overproduction', 'Waiting', 'Transport', 'Processing', 'Inventory', 'Motion', 'Defects'];
    let text = '7 Wastes Cost Analysis\n\n';
    
    wastes.forEach(waste => {
        const checkbox = document.getElementById('waste' + waste);
        const costInput = document.getElementById('waste' + waste + 'Cost');
        if (checkbox && checkbox.checked && costInput.value) {
            text += `${waste}: ${formatNumber(costInput.value)} kr\n`;
        }
    });
    
    const totalCost = document.getElementById('wasteTotalCost').textContent;
    text += `\nTotal Waste Cost: ${totalCost}`;
    
    navigator.clipboard.writeText(text).then(() => {
        showCopyFeedback(event.target);
    });
}

// SWOT Analysis Functions
function clearSWOT() {
    const msg = currentLanguage === 'da' ? 'Ryd alt SWOT analyse indhold?' : 'Clear all SWOT analysis content?';
    if (confirm(msg)) {
        document.getElementById('swotStrengths').value = '';
        document.getElementById('swotWeaknesses').value = '';
        document.getElementById('swotOpportunities').value = '';
        document.getElementById('swotThreats').value = '';
        localStorage.removeItem('lean_swot_analysis');
        alert(currentLanguage === 'da' ? '✅ SWOT analyse ryddet!' : '✅ SWOT analysis cleared!');
    }
}

function saveSWOT() {
    const swotData = {
        strengths: document.getElementById('swotStrengths').value,
        weaknesses: document.getElementById('swotWeaknesses').value,
        opportunities: document.getElementById('swotOpportunities').value,
        threats: document.getElementById('swotThreats').value,
        timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('lean_swot_analysis', JSON.stringify(swotData));
    
    // Show success feedback
    const btn = event?.target || document.querySelector('[onclick*="saveSWOT"]');
    if (btn) {
        const original = btn.innerHTML;
        btn.innerHTML = currentLanguage === 'da' ? '✅ Gemt!' : '✅ Saved!';
        btn.style.backgroundColor = '#10b981';
        setTimeout(() => {
            btn.innerHTML = original;
            btn.style.backgroundColor = '';
        }, 2000);
    }
}

function exportSWOT(format = 'markdown') {
    const swotData = {
        strengths: document.getElementById('swotStrengths').value.split('\n').filter(s => s.trim()),
        weaknesses: document.getElementById('swotWeaknesses').value.split('\n').filter(s => s.trim()),
        opportunities: document.getElementById('swotOpportunities').value.split('\n').filter(s => s.trim()),
        threats: document.getElementById('swotThreats').value.split('\n').filter(s => s.trim())
    };
    
    if (format === 'image') {
        exportSWOTAsImage(swotData);
        return;
    }
    
    // Create markdown format
    let markdown = '# SWOT Analysis\n\n';
    markdown += `Generated: ${new Date().toLocaleString()}\n\n`;
    markdown += '## Strengths 💪\n';
    swotData.strengths.forEach(s => markdown += `- ${s}\n`);
    markdown += '\n## Weaknesses ⚠️\n';
    swotData.weaknesses.forEach(s => markdown += `- ${s}\n`);
    markdown += '\n## Opportunities 🚀\n';
    swotData.opportunities.forEach(s => markdown += `- ${s}\n`);
    markdown += '\n## Threats ⚡\n';
    swotData.threats.forEach(s => markdown += `- ${s}\n`);
    
    // Download as text file
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SWOT_Analysis_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert(translate('alert-swot-exported-md') || '✅ SWOT Analysis exported as Markdown!');
}

function exportSWOTAsImage(swotData) {
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 900;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Title
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SWOT Analysis', 600, 50);
    
    // Date
    ctx.font = '16px Arial';
    ctx.fillStyle = '#6b7280';
    ctx.fillText(new Date().toLocaleDateString(), 600, 80);
    
    // Draw 2x2 grid
    const boxWidth = 560;
    const boxHeight = 380;
    const startX = 40;
    const startY = 120;
    const gap = 40;
    
    const boxes = [
        { x: startX, y: startY, color: '#d1fae5', borderColor: '#10b981', title: '💪 Strengths', data: swotData.strengths },
        { x: startX + boxWidth + gap, y: startY, color: '#fee2e2', borderColor: '#ef4444', title: '⚠️ Weaknesses', data: swotData.weaknesses },
        { x: startX, y: startY + boxHeight + gap, color: '#dbeafe', borderColor: '#3b82f6', title: '🚀 Opportunities', data: swotData.opportunities },
        { x: startX + boxWidth + gap, y: startY + boxHeight + gap, color: '#fed7aa', borderColor: '#f97316', title: '⚡ Threats', data: swotData.threats }
    ];
    
    boxes.forEach(box => {
        // Box background
        ctx.fillStyle = box.color;
        ctx.fillRect(box.x, box.y, boxWidth, boxHeight);
        
        // Border
        ctx.strokeStyle = box.borderColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(box.x, box.y, boxWidth, boxHeight);
        
        // Title
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(box.title, box.x + 20, box.y + 40);
        
        // Content
        ctx.font = '16px Arial';
        ctx.fillStyle = '#374151';
        let yOffset = box.y + 75;
        box.data.slice(0, 12).forEach((item, i) => {
            const text = `• ${item}`;
            const maxWidth = boxWidth - 40;
            
            // Wrap text if too long
            if (ctx.measureText(text).width > maxWidth) {
                const words = text.split(' ');
                let line = '';
                words.forEach(word => {
                    const testLine = line + word + ' ';
                    if (ctx.measureText(testLine).width > maxWidth) {
                        ctx.fillText(line, box.x + 20, yOffset);
                        line = word + ' ';
                        yOffset += 22;
                    } else {
                        line = testLine;
                    }
                });
                ctx.fillText(line, box.x + 20, yOffset);
            } else {
                ctx.fillText(text, box.x + 20, yOffset);
            }
            yOffset += 25;
        });
        
        if (box.data.length > 12) {
            ctx.fillStyle = '#9ca3af';
            ctx.font = 'italic 14px Arial';
            ctx.fillText(`... and ${box.data.length - 12} more`, box.x + 20, yOffset + 10);
        }
    });
    
    // Convert to blob and download
    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SWOT_Analysis_${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert(translate('alert-swot-exported-png') || '✅ SWOT Analysis exported as PNG image!');
    });
}

// Load saved SWOT on page load
function loadSavedSWOT() {
    const saved = localStorage.getItem('lean_swot_analysis');
    if (saved) {
        try {
            const swotData = JSON.parse(saved);
            document.getElementById('swotStrengths').value = swotData.strengths || '';
            document.getElementById('swotWeaknesses').value = swotData.weaknesses || '';
            document.getElementById('swotOpportunities').value = swotData.opportunities || '';
            document.getElementById('swotThreats').value = swotData.threats || '';
        } catch (e) {
            console.error('Error loading SWOT data:', e);
        }
    }
}

// ========================================
// Takt Time, Cycle Time & Lead Time Calculators
// ========================================

function calculateTaktTime() {
    const availableTime = parseFloat(document.getElementById('taktAvailableTime')?.value) || 480;
    const demand = parseFloat(document.getElementById('taktDemand')?.value) || 240;
    
    if (demand === 0) {
        document.getElementById('taktTimeResult').textContent = '∞';
        return;
    }
    
    const taktTime = availableTime / demand;
    document.getElementById('taktTimeResult').textContent = taktTime.toFixed(2) + ' min';
    
    // Save to localStorage
    localStorage.setItem('lean_takt_data', JSON.stringify({
        availableTime, demand, taktTime, timestamp: Date.now()
    }));
    
    updateProductionAnalysis();
}

function calculateCycleTime() {
    const units = parseFloat(document.getElementById('cycleUnits')?.value) || 250;
    const time = parseFloat(document.getElementById('cycleProductionTime')?.value) || 450;
    
    if (units === 0) {
        document.getElementById('cycleTimeResult').textContent = '∞';
        return;
    }
    
    const cycleTime = time / units;
    document.getElementById('cycleTimeResult').textContent = cycleTime.toFixed(2) + ' min';
    
    // Save to localStorage
    localStorage.setItem('lean_cycle_data', JSON.stringify({
        units, time, cycleTime, timestamp: Date.now()
    }));
    
    updateProductionAnalysis();
}

function calculateLeadTime() {
    const processTime = parseFloat(document.getElementById('leadProcessTime')?.value) || 0;
    const queueTime = parseFloat(document.getElementById('leadQueueTime')?.value) || 0;
    const transportTime = parseFloat(document.getElementById('leadTransportTime')?.value) || 0;
    
    const totalLeadTime = processTime + queueTime + transportTime;
    const hours = (totalLeadTime / 60).toFixed(1);
    const days = (totalLeadTime / 480).toFixed(2);
    
    document.getElementById('leadTimeResult').textContent = totalLeadTime.toFixed(0) + ' min';
    document.getElementById('leadTimeHours').textContent = hours;
    document.getElementById('leadTimeDays').textContent = days;
    
    // Save to localStorage
    localStorage.setItem('lean_lead_data', JSON.stringify({
        processTime, queueTime, transportTime, totalLeadTime, timestamp: Date.now()
    }));
}

function updateProductionAnalysis() {
    const taktTime = parseFloat(document.getElementById('taktTimeResult')?.textContent) || 2.0;
    const cycleTime = parseFloat(document.getElementById('cycleTimeResult')?.textContent) || 1.8;
    
    const statusElem = document.getElementById('productionStatus');
    const capacityElem = document.getElementById('capacityUtilization');
    const bufferElem = document.getElementById('bufferTime');
    const adviceElem = document.getElementById('productionAdvice');
    
    if (!statusElem || !capacityElem || !bufferElem || !adviceElem) return;
    
    const capacityUtilization = (cycleTime / taktTime) * 100;
    const buffer = taktTime - cycleTime;
    
    capacityElem.textContent = capacityUtilization.toFixed(1) + '%';
    bufferElem.textContent = buffer.toFixed(2) + ' min';
    
    // Determine status and advice
    if (cycleTime > taktTime) {
        statusElem.textContent = currentLanguage === 'da' ? '⚠️ For Langsom' : '⚠️ Too Slow';
        statusElem.className = 'px-3 py-1 rounded-full text-xs font-bold bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300';
        adviceElem.textContent = currentLanguage === 'da' 
            ? '❌ Produktion kan ikke følge med efterspørgslen! Reducer cyklustid eller tilføj kapacitet.'
            : '❌ Production cannot meet demand! Reduce cycle time or add capacity.';
    } else if (cycleTime === taktTime) {
        statusElem.textContent = currentLanguage === 'da' ? '✅ Perfekt Balance' : '✅ Perfect Balance';
        statusElem.className = 'px-3 py-1 rounded-full text-xs font-bold bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-300';
        adviceElem.textContent = currentLanguage === 'da'
            ? '✅ Perfekt match mellem produktion og efterspørgsel!'
            : '✅ Perfect match between production and demand!';
    } else {
        const excess = ((taktTime - cycleTime) / taktTime * 100).toFixed(1);
        statusElem.textContent = currentLanguage === 'da' ? '✅ God Kapacitet' : '✅ Good Capacity';
        statusElem.className = 'px-3 py-1 rounded-full text-xs font-bold bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-300';
        adviceElem.textContent = currentLanguage === 'da'
            ? `✅ Produktion møder efterspørgsel med ${excess}% buffer. Du har plads til forbedringer eller uventede forsinkelser.`
            : `✅ Production meets demand with ${excess}% buffer. Room for improvement activities or unexpected delays.`;
    }
}

function resetTimeCalculators() {
    document.getElementById('taktAvailableTime').value = 480;
    document.getElementById('taktDemand').value = 240;
    document.getElementById('cycleUnits').value = 250;
    document.getElementById('cycleProductionTime').value = 450;
    document.getElementById('leadProcessTime').value = 450;
    document.getElementById('leadQueueTime').value = 120;
    document.getElementById('leadTransportTime').value = 30;
    
    calculateTaktTime();
    calculateCycleTime();
    calculateLeadTime();
}

function copyTimeResults() {
    const takt = document.getElementById('taktTimeResult')?.textContent || '';
    const cycle = document.getElementById('cycleTimeResult')?.textContent || '';
    const lead = document.getElementById('leadTimeResult')?.textContent || '';
    const capacity = document.getElementById('capacityUtilization')?.textContent || '';
    
    const text = currentLanguage === 'da'
        ? `Produktionstid Analyse\n` +
          `========================\n` +
          `Takttid: ${takt}\n` +
          `Cyklustid: ${cycle}\n` +
          `Gennemløbstid: ${lead}\n` +
          `Kapacitetsudnyttelse: ${capacity}\n` +
          `\nGenereret: ${new Date().toLocaleString()}`
        : `Production Time Analysis\n` +
          `========================\n` +
          `Takt Time: ${takt}\n` +
          `Cycle Time: ${cycle}\n` +
          `Lead Time: ${lead}\n` +
          `Capacity Utilization: ${capacity}\n` +
          `\nGenerated: ${new Date().toLocaleString()}`;
    
    navigator.clipboard.writeText(text).then(() => {
        alert(currentLanguage === 'da' ? '✅ Resultater kopieret!' : '✅ Results copied!');
    });
}

// ========================================
// LEAN Dashboard Overview Functions
// ========================================

function refreshLEANDashboard() {
    // Gather all LEAN metrics from localStorage
    const dashboardPanel = document.getElementById('leanDashboardOverview');
    if (!dashboardPanel) return;
    
    // Clear any previous color classes
    const allDashValues = dashboardPanel.querySelectorAll('[id^="dash"][id$="Value"]');
    allDashValues.forEach(el => {
        el.classList.remove('text-green-600', 'text-yellow-600', 'text-red-600');
    });
    
    // 1. OEE (from localStorage or calculate)
    let oeeValue = null;
    const savedOEE = localStorage.getItem('lean_oee_data');
    if (savedOEE) {
        try {
            const oeeData = JSON.parse(savedOEE);
            oeeValue = oeeData.oee;
        } catch(e) {}
    }
    const dashOEEElem = document.getElementById('dashOEEValue');
    const dashOEEStatus = document.getElementById('dashOEEStatus');
    if (dashOEEElem) {
        dashOEEElem.textContent = oeeValue !== null ? oeeValue.toFixed(1) + '%' : '--';
        // Color coding based on OEE
        if (oeeValue !== null) {
            if (oeeValue >= 85) {
                dashOEEElem.classList.add('text-green-600');
                dashOEEStatus?.classList.replace('bg-gray-300', 'bg-green-500');
            } else if (oeeValue >= 60) {
                dashOEEElem.classList.add('text-yellow-600');
                dashOEEStatus?.classList.replace('bg-gray-300', 'bg-yellow-500');
            } else {
                dashOEEElem.classList.add('text-red-600');
                dashOEEStatus?.classList.replace('bg-gray-300', 'bg-red-500');
            }
        }
    }
    
    // 2. Takt Time (from localStorage)
    let taktValue = null;
    const savedTakt = localStorage.getItem('lean_takt_data');
    if (savedTakt) {
        try {
            const taktData = JSON.parse(savedTakt);
            taktValue = taktData.taktTime;
        } catch(e) {}
    }
    const dashTaktElem = document.getElementById('dashTaktValue');
    const dashTaktStatus = document.getElementById('dashTaktStatus');
    if (dashTaktElem) {
        dashTaktElem.textContent = taktValue !== null ? taktValue.toFixed(2) : '--';
        if (taktValue !== null) dashTaktStatus?.classList.replace('bg-gray-300', 'bg-green-500');
    }
    
    // 3. Cycle Time (from localStorage)
    let cycleValue = null;
    const savedCycle = localStorage.getItem('lean_cycle_data');
    if (savedCycle) {
        try {
            const cycleData = JSON.parse(savedCycle);
            cycleValue = cycleData.cycleTime;
        } catch(e) {}
    }
    const dashCycleElem = document.getElementById('dashCycleValue');
    const dashCycleStatus = document.getElementById('dashCycleStatus');
    if (dashCycleElem) {
        dashCycleElem.textContent = cycleValue !== null ? cycleValue.toFixed(2) : '--';
        // Color coding: good if cycle <= takt
        if (cycleValue !== null && taktValue !== null) {
            if (cycleValue <= taktValue) {
                dashCycleElem.classList.add('text-green-600');
                dashCycleStatus?.classList.replace('bg-gray-300', 'bg-green-500');
            } else {
                dashCycleElem.classList.add('text-red-600');
                dashCycleStatus?.classList.replace('bg-gray-300', 'bg-red-500');
            }
        }
    }
    
    // 4. Lead Time (from localStorage)
    let leadValue = null;
    const savedLead = localStorage.getItem('lean_lead_data');
    if (savedLead) {
        try {
            const leadData = JSON.parse(savedLead);
            leadValue = leadData.totalLeadTime;
        } catch(e) {}
    }
    const dashLeadElem = document.getElementById('dashLeadValue');
    const dashLeadStatus = document.getElementById('dashLeadStatus');
    if (dashLeadElem) {
        dashLeadElem.textContent = leadValue !== null ? Math.round(leadValue) : '--';
        if (leadValue !== null) dashLeadStatus?.classList.replace('bg-gray-300', 'bg-green-500');
    }
    
    // 5. SMED (from localStorage)
    let smedValue = null;
    const savedSMED = localStorage.getItem('lean_smed_data');
    if (savedSMED) {
        try {
            const smedData = JSON.parse(savedSMED);
            smedValue = smedData.totalTime || smedData.optimizedTime;
        } catch(e) {}
    }
    const dashSMEDElem = document.getElementById('dashSMEDValue');
    const dashSMEDStatus = document.getElementById('dashSMEDStatus');
    if (dashSMEDElem) {
        dashSMEDElem.textContent = smedValue !== null ? Math.round(smedValue) : '--';
        if (smedValue !== null) dashSMEDStatus?.classList.replace('bg-gray-300', 'bg-green-500');
    }
    
    // 6. 7 Wastes Count (from localStorage)
    let wasteCount = 0;
    const savedWastes = localStorage.getItem('lean_7wastes_data');
    if (savedWastes) {
        try {
            const wastesData = JSON.parse(savedWastes);
            wasteCount = wastesData.checkedCount || 0;
        } catch(e) {}
    }
    const dashWastesElem = document.getElementById('dashWastesValue');
    const dashWastesStatus = document.getElementById('dashWastesStatus');
    if (dashWastesElem) {
        dashWastesElem.textContent = wasteCount > 0 ? wasteCount + '/7' : '--';
        if (wasteCount > 0) {
            if (wasteCount <= 2) {
                dashWastesElem.classList.add('text-green-600');
                dashWastesStatus?.classList.replace('bg-gray-300', 'bg-green-500');
            } else if (wasteCount <= 4) {
                dashWastesElem.classList.add('text-yellow-600');
                dashWastesStatus?.classList.replace('bg-gray-300', 'bg-yellow-500');
            } else {
                dashWastesElem.classList.add('text-red-600');
                dashWastesStatus?.classList.replace('bg-gray-300', 'bg-red-500');
            }
        }
    }
    
    // Update last updated timestamp
    const lastUpdatedElem = document.getElementById('dashLastUpdated');
    if (lastUpdatedElem) {
        const now = new Date();
        lastUpdatedElem.innerHTML = `<span data-i18n="last-updated">${currentLanguage === 'da' ? 'Sidst opdateret:' : 'Last updated:'}</span> ${now.toLocaleTimeString()}`;
    }
    
    // Show success message
    showToastNotification(currentLanguage === 'da' 
        ? '✅ Dashboard opdateret med seneste LEAN data'
        : '✅ Dashboard updated with latest LEAN data');
}

function exportLEANReport() {
    // Gather all LEAN data and export as text report
    let report = '═══════════════════════════════════════\n';
    report += '       LEAN PERFORMANCE REPORT\n';
    report += '═══════════════════════════════════════\n\n';
    report += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    // OEE
    const savedOEE = localStorage.getItem('lean_oee_data');
    if (savedOEE) {
        const oeeData = JSON.parse(savedOEE);
        report += '📊 OEE (Overall Equipment Effectiveness)\n';
        report += '───────────────────────────────────────\n';
        report += `   OEE: ${oeeData.oee?.toFixed(1)}%\n`;
        report += `   Availability: ${oeeData.availability?.toFixed(1)}%\n`;
        report += `   Performance: ${oeeData.performance?.toFixed(1)}%\n`;
        report += `   Quality: ${oeeData.quality?.toFixed(1)}%\n\n`;
    }
    
    // Time metrics
    const savedTakt = localStorage.getItem('lean_takt_data');
    const savedCycle = localStorage.getItem('lean_cycle_data');
    const savedLead = localStorage.getItem('lean_lead_data');
    
    report += '⏱️ Production Time Metrics\n';
    report += '───────────────────────────────────────\n';
    if (savedTakt) {
        const taktData = JSON.parse(savedTakt);
        report += `   Takt Time: ${taktData.taktTime?.toFixed(2)} min/unit\n`;
    }
    if (savedCycle) {
        const cycleData = JSON.parse(savedCycle);
        report += `   Cycle Time: ${cycleData.cycleTime?.toFixed(2)} min/unit\n`;
    }
    if (savedLead) {
        const leadData = JSON.parse(savedLead);
        report += `   Lead Time: ${leadData.totalLeadTime?.toFixed(0)} min\n`;
        report += `     - Process: ${leadData.processTime} min\n`;
        report += `     - Queue: ${leadData.queueTime} min\n`;
        report += `     - Transport: ${leadData.transportTime} min\n`;
    }
    report += '\n';
    
    // 7 Wastes
    const savedWastes = localStorage.getItem('lean_7wastes_data');
    if (savedWastes) {
        const wastesData = JSON.parse(savedWastes);
        report += '🗑️ 7 Wastes Analysis\n';
        report += '───────────────────────────────────────\n';
        report += `   Total Waste Cost: ${formatCurrency(wastesData.totalCost || 0)}\n`;
        report += `   Wastes Identified: ${wastesData.checkedCount || 0}/7\n\n`;
    }
    
    report += '═══════════════════════════════════════\n';
    report += '         End of Report\n';
    report += '═══════════════════════════════════════\n';
    
    // Copy to clipboard
    navigator.clipboard.writeText(report).then(() => {
        showToastNotification(currentLanguage === 'da' 
            ? '📋 LEAN rapport kopieret til udklipsholder!'
            : '📋 LEAN report copied to clipboard!');
    });
}

function showToastNotification(message) {
    // Remove existing toast if any
    const existingToast = document.querySelector('.lean-toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'lean-toast fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize LEAN dashboard on page load if on LEAN tab
function initLEANDashboardOnLoad() {
    // Try to update dashboard with any saved data
    setTimeout(() => {
        refreshLEANDashboard();
        loadImprovements();
        updateWhatIfScenario();
    }, 500);
}

// ========================================
// LEAN IMPROVEMENT TRACKER
// ========================================

let leanImprovements = [];

function loadImprovements() {
    const saved = localStorage.getItem('lean_improvements');
    if (saved) {
        try {
            leanImprovements = JSON.parse(saved);
            renderImprovements();
            updateImprovementStats();
        } catch(e) {
            leanImprovements = [];
        }
    }
}

function addImprovement() {
    const area = document.getElementById('improvementArea')?.value || 'other';
    const before = parseFloat(document.getElementById('improvementBefore')?.value) || 0;
    const after = parseFloat(document.getElementById('improvementAfter')?.value) || 0;
    const notes = document.getElementById('improvementNotes')?.value || '';
    
    if (before === 0 && after === 0) {
        showToastNotification(currentLanguage === 'da' 
            ? '⚠️ Angiv før og efter værdier'
            : '⚠️ Please enter before and after values');
        return;
    }
    
    const improvement = {
        id: Date.now(),
        date: new Date().toISOString(),
        area,
        before,
        after,
        notes,
        change: before !== 0 ? ((after - before) / Math.abs(before) * 100) : 0
    };
    
    leanImprovements.unshift(improvement);
    localStorage.setItem('lean_improvements', JSON.stringify(leanImprovements));
    
    // Clear inputs
    document.getElementById('improvementBefore').value = '';
    document.getElementById('improvementAfter').value = '';
    document.getElementById('improvementNotes').value = '';
    
    renderImprovements();
    updateImprovementStats();
    
    showToastNotification(currentLanguage === 'da' 
        ? '✅ Forbedring registreret!'
        : '✅ Improvement recorded!');
}

function renderImprovements() {
    const container = document.getElementById('improvementHistory');
    if (!container) return;
    
    if (leanImprovements.length === 0) {
        const emptyMsg = currentLanguage === 'da' ? 'Ingen forbedringer registreret endnu' : 'No improvements recorded yet';
        container.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400 text-sm py-4" data-i18n="lean-tracker-empty">' + emptyMsg + '</p>';
        return;
    }
    
    const areaColors = {
        oee: 'emerald',
        takt: 'cyan',
        cycle: 'sky',
        lead: 'indigo',
        waste: 'red',
        smed: 'orange',
        other: 'gray'
    };
    
    const areaIcons = {
        oee: '⚙️',
        takt: '⏱️',
        cycle: '🔄',
        lead: '📊',
        waste: '🗑️',
        smed: '🔧',
        other: '📝'
    };
    
    container.innerHTML = leanImprovements.map(function(imp) {
        const color = areaColors[imp.area] || 'gray';
        const icon = areaIcons[imp.area] || '📝';
        const changeClass = imp.change >= 0 ? 'text-green-600' : 'text-red-600';
        const changePrefix = imp.change >= 0 ? '+' : '';
        const dateStr = new Date(imp.date).toLocaleDateString();
        const notesText = imp.notes || 'No description';
        
        return '<div class="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-' + color + '-200 dark:border-' + color + '-700 hover:shadow-md transition-shadow">' +
            '<span class="text-xl">' + icon + '</span>' +
            '<div class="flex-1 min-w-0">' +
                '<div class="flex items-center gap-2">' +
                    '<span class="font-medium text-sm text-gray-700 dark:text-gray-300">' + imp.area.toUpperCase() + '</span>' +
                    '<span class="text-xs text-gray-500">' + dateStr + '</span>' +
                '</div>' +
                '<p class="text-xs text-gray-500 dark:text-gray-400 truncate">' + notesText + '</p>' +
            '</div>' +
            '<div class="text-right">' +
                '<p class="text-xs text-gray-500">' + imp.before + ' → ' + imp.after + '</p>' +
                '<p class="font-bold ' + changeClass + '">' + changePrefix + imp.change.toFixed(1) + '%</p>' +
            '</div>' +
            '<button onclick="deleteImprovement(' + imp.id + ')" class="text-gray-400 hover:text-red-500 transition-colors">' +
                '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
                    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>' +
                '</svg>' +
            '</button>' +
        '</div>';
    }).join('');
}

function deleteImprovement(id) {
    leanImprovements = leanImprovements.filter(imp => imp.id !== id);
    localStorage.setItem('lean_improvements', JSON.stringify(leanImprovements));
    renderImprovements();
    updateImprovementStats();
}

function updateImprovementStats() {
    const totalCount = document.getElementById('trackerTotalCount');
    const avgImprovement = document.getElementById('trackerAvgImprovement');
    const monthCount = document.getElementById('trackerMonthCount');
    
    if (totalCount) totalCount.textContent = leanImprovements.length;
    
    if (avgImprovement) {
        if (leanImprovements.length > 0) {
            const avg = leanImprovements.reduce((sum, imp) => sum + imp.change, 0) / leanImprovements.length;
            const prefix = avg >= 0 ? '+' : '';
            avgImprovement.textContent = prefix + avg.toFixed(1) + '%';
            avgImprovement.className = avg >= 0 
                ? 'text-2xl font-bold text-green-600 dark:text-green-400'
                : 'text-2xl font-bold text-red-600 dark:text-red-400';
        } else {
            avgImprovement.textContent = '0%';
        }
    }
    
    if (monthCount) {
        const now = new Date();
        const thisMonth = leanImprovements.filter(imp => {
            const impDate = new Date(imp.date);
            return impDate.getMonth() === now.getMonth() && impDate.getFullYear() === now.getFullYear();
        }).length;
        monthCount.textContent = thisMonth;
    }
}

function exportImprovements() {
    if (leanImprovements.length === 0) {
        showToastNotification(currentLanguage === 'da' 
            ? '⚠️ Ingen forbedringer at eksportere'
            : '⚠️ No improvements to export');
        return;
    }
    
    let report = 'LEAN IMPROVEMENT HISTORY\n';
    report += '========================\n\n';
    report += `Generated: ${new Date().toLocaleString()}\n`;
    report += `Total Improvements: ${leanImprovements.length}\n\n`;
    
    leanImprovements.forEach((imp, idx) => {
        const changePrefix = imp.change >= 0 ? '+' : '';
        report += `${idx + 1}. ${imp.area.toUpperCase()} - ${new Date(imp.date).toLocaleDateString()}\n`;
        report += `   Before: ${imp.before} → After: ${imp.after} (${changePrefix}${imp.change.toFixed(1)}%)\n`;
        if (imp.notes) report += `   Notes: ${imp.notes}\n`;
        report += '\n';
    });
    
    navigator.clipboard.writeText(report).then(() => {
        showToastNotification(currentLanguage === 'da' 
            ? '📋 Forbedringer kopieret til udklipsholder!'
            : '📋 Improvements copied to clipboard!');
    });
}

// ========================================
// WHAT-IF SCENARIO ANALYZER
// ========================================

function updateWhatIfScenario() {
    // Get slider values
    const oeeChange = parseFloat(document.getElementById('whatifOEE')?.value) || 0;
    const taktChange = parseFloat(document.getElementById('whatifTakt')?.value) || 0;
    const wasteReduction = parseFloat(document.getElementById('whatifWaste')?.value) || 0;
    const leadReduction = parseFloat(document.getElementById('whatifLead')?.value) || 0;
    
    // Update slider value displays
    document.getElementById('whatifOEEValue').textContent = (oeeChange >= 0 ? '+' : '') + oeeChange + '%';
    document.getElementById('whatifTaktValue').textContent = (taktChange >= 0 ? '+' : '') + taktChange + '%';
    document.getElementById('whatifWasteValue').textContent = '-' + wasteReduction + '%';
    document.getElementById('whatifLeadValue').textContent = '-' + leadReduction + '%';
    
    // Get current values from localStorage
    let currentOEE = 72.7;
    let currentTakt = 2.0;
    let currentWasteCost = 0;
    let currentLead = 600;
    
    const savedOEE = localStorage.getItem('lean_oee_data');
    if (savedOEE) {
        try { currentOEE = JSON.parse(savedOEE).oee || 72.7; } catch(e) {}
    }
    
    const savedTakt = localStorage.getItem('lean_takt_data');
    if (savedTakt) {
        try { currentTakt = JSON.parse(savedTakt).taktTime || 2.0; } catch(e) {}
    }
    
    const savedWastes = localStorage.getItem('lean_7wastes_data');
    if (savedWastes) {
        try { currentWasteCost = JSON.parse(savedWastes).totalCost || 0; } catch(e) {}
    }
    
    const savedLead = localStorage.getItem('lean_lead_data');
    if (savedLead) {
        try { currentLead = JSON.parse(savedLead).totalLeadTime || 600; } catch(e) {}
    }
    
    // Calculate new values
    const newOEE = Math.min(100, Math.max(0, currentOEE + oeeChange));
    const newTakt = Math.max(0.1, currentTakt * (1 + taktChange / 100));
    const wasteSaved = currentWasteCost * (wasteReduction / 100);
    const newLead = Math.max(1, currentLead * (1 - leadReduction / 100));
    
    // Update displays
    document.getElementById('whatifNewOEE').textContent = newOEE.toFixed(1) + '%';
    document.getElementById('whatifNewTakt').textContent = newTakt.toFixed(2) + ' min';
    document.getElementById('whatifWasteSaved').textContent = formatCurrency(wasteSaved);
    document.getElementById('whatifNewLead').textContent = Math.round(newLead) + ' min';
    
    // Calculate total impact (estimate annual savings)
    // Assumptions: OEE improvement = production gain, Waste reduction = direct savings, Lead time = indirect savings
    const oeeImpact = (oeeChange / 100) * 100000; // Rough estimate per % OEE
    const wasteImpact = wasteSaved * 12; // Monthly to annual
    const leadImpact = (leadReduction / 100) * 50000; // Rough estimate
    
    const totalImpact = oeeImpact + wasteImpact + leadImpact;
    document.getElementById('whatifTotalImpact').textContent = formatCurrency(totalImpact) + '/år';
}

function resetWhatIf() {
    document.getElementById('whatifOEE').value = 0;
    document.getElementById('whatifTakt').value = 0;
    document.getElementById('whatifWaste').value = 0;
    document.getElementById('whatifLead').value = 0;
    updateWhatIfScenario();
}

// ========================================
// ========================================
// Value Stream Mapping (VSM) Tool - ENHANCED
// ========================================

let vsmProcesses = [];
let vsmCanvas = null;
let vsmContext = null;
let selectedProcess = null;
let editingProcessId = null;
let vsmTimeUnit = 'min'; // Global time unit

// Process type colors and icons
const VSM_TYPES = {
    'value-add': { color: '#10b981', icon: '✓', label: 'Value-Add' },
    'non-value-add': { color: '#ef4444', icon: '✗', label: 'Non-Value-Add' },
    'transport': { color: '#f97316', icon: '🚚', label: 'Transport' },
    'inspection': { color: '#3b82f6', icon: '🔍', label: 'Inspection' }
};

function initVSMCanvas() {
    vsmCanvas = document.getElementById('vsmCanvas');
    if (!vsmCanvas) return;
    
    vsmContext = vsmCanvas.getContext('2d');
    
    // Load saved data
    const saved = localStorage.getItem('lean_vsm_processes');
    if (saved) {
        try {
            vsmProcesses = JSON.parse(saved);
            renderVSM();
            updateVSMList();
            calculateVSMMetrics();
        } catch (e) {
            console.error('Error loading VSM data:', e);
        }
    }
    
    // Canvas click handler - now opens edit modal
    vsmCanvas.addEventListener('click', handleVSMClick);
    
    // Setup radio button styling
    setupVSMTypeRadios();
}

function setupVSMTypeRadios() {
    document.querySelectorAll('input[name="vsmType"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            // Update visual styling
            document.querySelectorAll('input[name="vsmType"]').forEach(r => {
                const label = r.closest('label');
                const dot = label.querySelector('.w-2');
                if (r.checked) {
                    label.classList.add('border-2');
                    label.style.borderColor = VSM_TYPES[r.value]?.color || '#10b981';
                    label.style.backgroundColor = `${VSM_TYPES[r.value]?.color}20`;
                    if (dot) dot.classList.remove('hidden');
                } else {
                    label.style.borderColor = '#e5e7eb';
                    label.style.backgroundColor = '';
                    if (dot) dot.classList.add('hidden');
                }
            });
        });
    });
}

// Open modal for adding new process
function addVSMProcess() {
    editingProcessId = null;
    document.getElementById('vsmModalTitle').textContent = currentLanguage === 'da' ? 'Tilføj Proces' : 'Add Process';
    document.getElementById('vsmProcessName').value = '';
    document.getElementById('vsmCycleTime').value = '';
    document.getElementById('vsmWaitTime').value = '';
    document.getElementById('vsmOperators').value = '1';
    document.getElementById('vsmDeleteBtn').classList.add('hidden');
    
    // Reset type selection
    document.querySelectorAll('input[name="vsmType"]').forEach(r => {
        r.checked = false;
        const label = r.closest('label');
        const dot = label.querySelector('.w-2');
        label.style.borderColor = '#e5e7eb';
        label.style.backgroundColor = '';
        if (dot) dot.classList.add('hidden');
    });
    
    // Default to value-add
    const valueAddRadio = document.querySelector('input[name="vsmType"][value="value-add"]');
    if (valueAddRadio) {
        valueAddRadio.checked = true;
        valueAddRadio.dispatchEvent(new Event('change'));
    }
    
    document.getElementById('vsmEditModal').classList.remove('hidden');
    document.getElementById('vsmProcessName').focus();
}

// Open modal for editing existing process
function editVSMProcess(processId) {
    const process = vsmProcesses.find(p => p.id === processId);
    if (!process) return;
    
    editingProcessId = processId;
    document.getElementById('vsmModalTitle').textContent = currentLanguage === 'da' ? 'Rediger Proces' : 'Edit Process';
    document.getElementById('vsmProcessName').value = process.name;
    document.getElementById('vsmCycleTime').value = process.cycleTime;
    document.getElementById('vsmWaitTime').value = process.waitTime;
    document.getElementById('vsmOperators').value = process.operators || 1;
    document.getElementById('vsmDeleteBtn').classList.remove('hidden');
    
    // Set type
    const processType = process.type || (process.isValueAdd ? 'value-add' : 'non-value-add');
    document.querySelectorAll('input[name="vsmType"]').forEach(r => {
        r.checked = r.value === processType;
        if (r.checked) r.dispatchEvent(new Event('change'));
    });
    
    document.getElementById('vsmEditModal').classList.remove('hidden');
}

function closeVSMModal() {
    document.getElementById('vsmEditModal').classList.add('hidden');
    editingProcessId = null;
}

function saveVSMProcess() {
    const name = document.getElementById('vsmProcessName').value.trim();
    if (!name) {
        showToast(currentLanguage === 'da' ? 'Indtast et procesnavn' : 'Enter a process name', 'warning');
        return;
    }
    
    const cycleTime = parseFloat(document.getElementById('vsmCycleTime').value) || 0;
    const waitTime = parseFloat(document.getElementById('vsmWaitTime').value) || 0;
    const operators = parseInt(document.getElementById('vsmOperators').value) || 1;
    const timeUnit = document.getElementById('vsmTimeUnit').value;
    
    // Convert to minutes for storage
    let cycleTimeMin = cycleTime;
    if (timeUnit === 'sec') cycleTimeMin = cycleTime / 60;
    else if (timeUnit === 'hr') cycleTimeMin = cycleTime * 60;
    else if (timeUnit === 'day') cycleTimeMin = cycleTime * 60 * 24;
    
    const selectedType = document.querySelector('input[name="vsmType"]:checked')?.value || 'value-add';
    const isValueAdd = selectedType === 'value-add';
    
    if (editingProcessId) {
        // Update existing
        const process = vsmProcesses.find(p => p.id === editingProcessId);
        if (process) {
            process.name = name;
            process.cycleTime = cycleTimeMin;
            process.waitTime = waitTime;
            process.isValueAdd = isValueAdd;
            process.type = selectedType;
            process.operators = operators;
        }
    } else {
        // Add new - calculate dynamic width based on cycle time
        const process = {
            id: Date.now(),
            name,
            cycleTime: cycleTimeMin,
            waitTime,
            isValueAdd,
            type: selectedType,
            operators,
            x: 50 + vsmProcesses.length * 170,
            y: 120
        };
        vsmProcesses.push(process);
    }
    
    saveVSM();
    renderVSM();
    updateVSMList();
    calculateVSMMetrics();
    closeVSMModal();
    
    showToast(editingProcessId 
        ? (currentLanguage === 'da' ? 'Proces opdateret' : 'Process updated')
        : (currentLanguage === 'da' ? 'Proces tilføjet' : 'Process added'), 'success');
}

function deleteVSMProcess() {
    if (!editingProcessId) return;
    
    const process = vsmProcesses.find(p => p.id === editingProcessId);
    if (confirm(currentLanguage === 'da' ? `Slet proces "${process?.name}"?` : `Delete process "${process?.name}"?`)) {
        vsmProcesses = vsmProcesses.filter(p => p.id !== editingProcessId);
        
        // Recalculate positions
        vsmProcesses.forEach((p, i) => {
            p.x = 50 + i * 170;
        });
        
        saveVSM();
        renderVSM();
        updateVSMList();
        calculateVSMMetrics();
        closeVSMModal();
    }
}

function renderVSM() {
    if (!vsmContext || !vsmCanvas) return;
    
    // Find bottleneck (longest cycle time)
    const bottleneckId = vsmProcesses.length > 0 
        ? vsmProcesses.reduce((max, p) => p.cycleTime > max.cycleTime ? p : max, vsmProcesses[0]).id
        : null;
    
    // Find max cycle time for scaling
    const maxCycleTime = Math.max(...vsmProcesses.map(p => p.cycleTime), 1);
    
    // Auto-resize canvas if needed
    const requiredWidth = vsmProcesses.length * 170 + 100;
    if (requiredWidth > vsmCanvas.width) {
        vsmCanvas.width = requiredWidth;
    }
    
    // Clear canvas
    vsmContext.clearRect(0, 0, vsmCanvas.width, vsmCanvas.height);
    
    // Draw subtle grid
    vsmContext.strokeStyle = '#e5e7eb';
    vsmContext.lineWidth = 0.5;
    for (let x = 0; x < vsmCanvas.width; x += 50) {
        vsmContext.beginPath();
        vsmContext.moveTo(x, 0);
        vsmContext.lineTo(x, vsmCanvas.height);
        vsmContext.stroke();
    }
    for (let y = 0; y < vsmCanvas.height; y += 50) {
        vsmContext.beginPath();
        vsmContext.moveTo(0, y);
        vsmContext.lineTo(vsmCanvas.width, y);
        vsmContext.stroke();
    }
    
    // Draw timeline at bottom
    if (vsmProcesses.length > 0) {
        vsmContext.strokeStyle = '#9ca3af';
        vsmContext.lineWidth = 2;
        vsmContext.beginPath();
        vsmContext.moveTo(30, 350);
        vsmContext.lineTo(vsmCanvas.width - 30, 350);
        vsmContext.stroke();
        
        // Timeline labels
        vsmContext.fillStyle = '#6b7280';
        vsmContext.font = '11px Arial';
        vsmContext.textAlign = 'left';
        vsmContext.fillText('Timeline', 30, 370);
    }
    
    // Draw connections with wait time labels
    if (vsmProcesses.length > 1) {
        for (let i = 0; i < vsmProcesses.length - 1; i++) {
            const p1 = vsmProcesses[i];
            const p2 = vsmProcesses[i + 1];
            
            // Calculate box width based on relative cycle time
            const p1Width = 80 + (p1.cycleTime / maxCycleTime) * 60;
            
            // Connection line
            vsmContext.strokeStyle = '#9ca3af';
            vsmContext.lineWidth = 2;
            vsmContext.setLineDash([5, 5]);
            vsmContext.beginPath();
            vsmContext.moveTo(p1.x + p1Width, p1.y + 40);
            vsmContext.lineTo(p2.x, p2.y + 40);
            vsmContext.stroke();
            vsmContext.setLineDash([]);
            
            // Arrow
            vsmContext.beginPath();
            vsmContext.moveTo(p2.x, p2.y + 40);
            vsmContext.lineTo(p2.x - 8, p2.y + 35);
            vsmContext.lineTo(p2.x - 8, p2.y + 45);
            vsmContext.closePath();
            vsmContext.fillStyle = '#9ca3af';
            vsmContext.fill();
            
            // Wait time label on arrow (if wait time > 0)
            if (p1.waitTime > 0) {
                const midX = (p1.x + p1Width + p2.x) / 2;
                vsmContext.fillStyle = '#ef4444';
                vsmContext.font = 'bold 11px Arial';
                vsmContext.textAlign = 'center';
                
                // Wait time bubble
                const waitText = `⏳ ${p1.waitTime}m`;
                const textWidth = vsmContext.measureText(waitText).width + 10;
                vsmContext.fillStyle = '#fef2f2';
                vsmContext.strokeStyle = '#fca5a5';
                vsmContext.lineWidth = 1;
                vsmContext.beginPath();
                vsmContext.roundRect(midX - textWidth/2, p1.y + 25, textWidth, 20, 4);
                vsmContext.fill();
                vsmContext.stroke();
                
                vsmContext.fillStyle = '#dc2626';
                vsmContext.fillText(waitText, midX, p1.y + 39);
            }
        }
    }
    
    // Draw processes
    vsmProcesses.forEach((process, index) => {
        const typeInfo = VSM_TYPES[process.type] || VSM_TYPES['value-add'];
        const color = typeInfo.color;
        const isBottleneck = process.id === bottleneckId && vsmProcesses.length > 1;
        
        // Calculate box width based on relative cycle time
        const boxWidth = 80 + (process.cycleTime / maxCycleTime) * 60;
        process.width = boxWidth; // Store for click detection
        
        // Box shadow for bottleneck
        if (isBottleneck) {
            vsmContext.shadowColor = '#ef4444';
            vsmContext.shadowBlur = 15;
        }
        
        // Box
        vsmContext.fillStyle = '#ffffff';
        vsmContext.strokeStyle = isBottleneck ? '#ef4444' : color;
        vsmContext.lineWidth = isBottleneck ? 4 : 3;
        vsmContext.beginPath();
        vsmContext.roundRect(process.x, process.y, boxWidth, 80, 8);
        vsmContext.fill();
        vsmContext.stroke();
        
        vsmContext.shadowColor = 'transparent';
        vsmContext.shadowBlur = 0;
        
        // Bottleneck badge
        if (isBottleneck) {
            vsmContext.fillStyle = '#ef4444';
            vsmContext.beginPath();
            vsmContext.arc(process.x + boxWidth - 5, process.y + 5, 12, 0, Math.PI * 2);
            vsmContext.fill();
            vsmContext.fillStyle = '#ffffff';
            vsmContext.font = 'bold 12px Arial';
            vsmContext.textAlign = 'center';
            vsmContext.fillText('🚧', process.x + boxWidth - 5, process.y + 10);
        }
        
        // Type icon in corner
        vsmContext.fillStyle = color;
        vsmContext.font = '14px Arial';
        vsmContext.textAlign = 'left';
        vsmContext.fillText(typeInfo.icon, process.x + 8, process.y + 18);
        
        // Process number
        vsmContext.fillStyle = '#9ca3af';
        vsmContext.font = '10px Arial';
        vsmContext.textAlign = 'right';
        vsmContext.fillText(`#${index + 1}`, process.x + boxWidth - 8, process.y + 18);
        
        // Process name
        vsmContext.fillStyle = '#111827';
        vsmContext.font = 'bold 13px Arial';
        vsmContext.textAlign = 'center';
        
        // Truncate name if too long
        let displayName = process.name;
        if (vsmContext.measureText(displayName).width > boxWidth - 20) {
            while (vsmContext.measureText(displayName + '...').width > boxWidth - 20 && displayName.length > 0) {
                displayName = displayName.slice(0, -1);
            }
            displayName += '...';
        }
        vsmContext.fillText(displayName, process.x + boxWidth/2, process.y + 40);
        
        // Cycle time
        vsmContext.fillStyle = '#374151';
        vsmContext.font = '11px Arial';
        vsmContext.fillText(`C/T: ${process.cycleTime.toFixed(1)}m`, process.x + boxWidth/2, process.y + 58);
        
        // Operators (if > 1)
        if (process.operators > 1) {
            vsmContext.fillStyle = '#6b7280';
            vsmContext.font = '10px Arial';
            vsmContext.fillText(`👤×${process.operators}`, process.x + boxWidth/2, process.y + 73);
        }
        
        // Timeline marker
        vsmContext.fillStyle = color;
        vsmContext.beginPath();
        vsmContext.arc(process.x + boxWidth/2, 350, 6, 0, Math.PI * 2);
        vsmContext.fill();
        
        // Cycle time on timeline
        vsmContext.fillStyle = '#374151';
        vsmContext.font = '10px Arial';
        vsmContext.textAlign = 'center';
        vsmContext.fillText(`${process.cycleTime.toFixed(0)}m`, process.x + boxWidth/2, 340);
    });
    
    // Click hint
    if (vsmProcesses.length > 0) {
        vsmContext.fillStyle = '#9ca3af';
        vsmContext.font = 'italic 11px Arial';
        vsmContext.textAlign = 'right';
        vsmContext.fillText(currentLanguage === 'da' ? 'Klik på en proces for at redigere' : 'Click a process to edit', vsmCanvas.width - 10, 20);
    }
}

function handleVSMClick(e) {
    const rect = vsmCanvas.getBoundingClientRect();
    const scaleX = vsmCanvas.width / rect.width;
    const scaleY = vsmCanvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Check if clicked on a process
    for (const process of vsmProcesses) {
        const boxWidth = process.width || 120;
        if (x >= process.x && x <= process.x + boxWidth && y >= process.y && y <= process.y + 80) {
            editVSMProcess(process.id);
            return;
        }
    }
}

function updateVSMList() {
    const list = document.getElementById('vsmProcessList');
    if (!list) return;
    
    if (vsmProcesses.length === 0) {
        list.innerHTML = `<p class="text-xs text-gray-500 dark:text-gray-400 text-center py-4" data-i18n="lean-vsm-empty">Click "+ Add Process" to start mapping</p>`;
        return;
    }
    
    // Find bottleneck
    const bottleneck = vsmProcesses.reduce((max, p) => p.cycleTime > max.cycleTime ? p : max, vsmProcesses[0]);
    
    list.innerHTML = vsmProcesses.map((p, i) => {
        const typeInfo = VSM_TYPES[p.type] || VSM_TYPES[p.isValueAdd ? 'value-add' : 'non-value-add'];
        const isBottleneck = p.id === bottleneck.id && vsmProcesses.length > 1;
        const bgColor = p.isValueAdd || p.type === 'value-add' ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700' 
            : p.type === 'transport' ? 'bg-orange-50 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700'
            : p.type === 'inspection' ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
            : 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700';
        
        return `
            <div class="flex items-center justify-between p-2 ${bgColor} rounded border cursor-pointer hover:shadow-md transition-shadow ${isBottleneck ? 'ring-2 ring-red-500' : ''}" onclick="editVSMProcess(${p.id})">
                <div class="flex-1">
                    <p class="font-semibold text-sm text-gray-800 dark:text-gray-200">
                        ${typeInfo.icon} ${i + 1}. ${p.name}
                        ${isBottleneck ? '<span class="ml-2 text-xs bg-red-500 text-white px-1 rounded">BOTTLENECK</span>' : ''}
                    </p>
                    <p class="text-xs text-gray-600 dark:text-gray-400">
                        C/T: ${p.cycleTime.toFixed(1)}m | Wait: ${p.waitTime}m${p.operators > 1 ? ` | 👤×${p.operators}` : ''}
                    </p>
                </div>
                <span class="text-gray-400 hover:text-gray-600">✏️</span>
            </div>
        `;
    }).join('');
}

function calculateVSMMetrics() {
    if (vsmProcesses.length === 0) {
        document.getElementById('vsmTotalTime').textContent = '0 min';
        document.getElementById('vsmValueTime').textContent = '0 min';
        document.getElementById('vsmWastePercentage').textContent = '0%';
        document.getElementById('vsmPCE').textContent = '0%';
        document.getElementById('vsmPCEBenchmark').textContent = '-';
        document.getElementById('vsmBottleneckAlert').classList.add('hidden');
        return;
    }
    
    // Calculate metrics
    const totalCycleTime = vsmProcesses.reduce((sum, p) => sum + p.cycleTime, 0);
    const totalWaitTime = vsmProcesses.reduce((sum, p) => sum + p.waitTime, 0);
    const totalLeadTime = totalCycleTime + totalWaitTime;
    
    // Value-add time = only cycle time of value-add processes
    const valueAddTime = vsmProcesses
        .filter(p => p.isValueAdd || p.type === 'value-add')
        .reduce((sum, p) => sum + p.cycleTime, 0);
    
    // Waste = all wait time + cycle time of non-value-add processes
    const wasteTime = totalWaitTime + vsmProcesses
        .filter(p => !p.isValueAdd && p.type !== 'value-add')
        .reduce((sum, p) => sum + p.cycleTime, 0);
    
    const wastePercentage = totalLeadTime > 0 ? (wasteTime / totalLeadTime * 100) : 0;
    
    // Process Cycle Efficiency (PCE) = Value-Add Time / Total Lead Time
    const pce = totalLeadTime > 0 ? (valueAddTime / totalLeadTime * 100) : 0;
    
    // PCE Benchmark
    let pceBenchmark, pceColor;
    if (pce >= 25) {
        pceBenchmark = currentLanguage === 'da' ? '🏆 World-Class!' : '🏆 World-Class!';
        pceColor = 'text-green-600 dark:text-green-400';
    } else if (pce >= 10) {
        pceBenchmark = currentLanguage === 'da' ? '✓ God' : '✓ Good';
        pceColor = 'text-blue-600 dark:text-blue-400';
    } else if (pce >= 1) {
        pceBenchmark = currentLanguage === 'da' ? '⚡ Typisk' : '⚡ Typical';
        pceColor = 'text-yellow-600 dark:text-yellow-400';
    } else {
        pceBenchmark = currentLanguage === 'da' ? '⚠️ Skal forbedres' : '⚠️ Needs improvement';
        pceColor = 'text-red-600 dark:text-red-400';
    }
    
    // Update display
    document.getElementById('vsmTotalTime').textContent = totalLeadTime.toFixed(0) + ' min';
    document.getElementById('vsmValueTime').textContent = valueAddTime.toFixed(0) + ' min';
    document.getElementById('vsmWastePercentage').textContent = wastePercentage.toFixed(1) + '%';
    
    const pceEl = document.getElementById('vsmPCE');
    pceEl.textContent = pce.toFixed(1) + '%';
    pceEl.className = `text-2xl font-bold ${pceColor}`;
    
    document.getElementById('vsmPCEBenchmark').textContent = pceBenchmark;
    
    // Bottleneck alert
    const bottleneck = vsmProcesses.reduce((max, p) => p.cycleTime > max.cycleTime ? p : max, vsmProcesses[0]);
    const bottleneckAlert = document.getElementById('vsmBottleneckAlert');
    const bottleneckText = document.getElementById('vsmBottleneckText');
    
    if (vsmProcesses.length > 1) {
        bottleneckAlert.classList.remove('hidden');
        bottleneckText.textContent = currentLanguage === 'da'
            ? `"${bottleneck.name}" har længste cyklustid (${bottleneck.cycleTime.toFixed(1)} min). Fokusér forbedringer her.`
            : `"${bottleneck.name}" has longest cycle time (${bottleneck.cycleTime.toFixed(1)} min). Focus improvements here.`;
    } else {
        bottleneckAlert.classList.add('hidden');
    }
}

function clearVSM() {
    if (confirm(currentLanguage === 'da' ? 'Ryd hele VSM kortet?' : 'Clear entire VSM map?')) {
        vsmProcesses = [];
        saveVSM();
        renderVSM();
        updateVSMList();
        calculateVSMMetrics();
        showToast(currentLanguage === 'da' ? 'VSM ryddet' : 'VSM cleared', 'success');
    }
}

function exportVSM() {
    if (!vsmCanvas) return;
    
    // Create a temporary canvas with white background
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = vsmCanvas.width;
    tempCanvas.height = vsmCanvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // White background
    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Draw the VSM
    tempCtx.drawImage(vsmCanvas, 0, 0);
    
    // Add title and metrics at bottom
    tempCtx.fillStyle = '#374151';
    tempCtx.font = 'bold 14px Arial';
    tempCtx.textAlign = 'left';
    tempCtx.fillText((currentLanguage === 'da' ? 'Værdistrøms Kort - ' : 'Value Stream Map - ') + new Date().toLocaleDateString(), 10, tempCanvas.height - 30);
    
    const pce = document.getElementById('vsmPCE').textContent;
    tempCtx.fillText(`PCE: ${pce}`, 10, tempCanvas.height - 10);
    
    tempCanvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `VSM_${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(currentLanguage === 'da' ? '✅ VSM eksporteret som PNG!' : '✅ VSM exported as PNG!', 'success');
    });
}

function saveVSM() {
    localStorage.setItem('lean_vsm_processes', JSON.stringify(vsmProcesses));
}

// ========================================
// Kaizen Event Planner
// ========================================

let kaizenActions = [];

function calculateKaizenROI() {
    const currentValue = parseFloat(document.getElementById('kaizenCurrentValue')?.value) || 0;
    const targetValue = parseFloat(document.getElementById('kaizenTargetValue')?.value) || 0;
    const cost = parseFloat(document.getElementById('kaizenCost')?.value) || 0;
    const annualSavings = parseFloat(document.getElementById('kaizenAnnualSavings')?.value) || 0;
    
    // Calculate improvement percentage
    let improvement = 0;
    if (currentValue !== 0) {
        improvement = ((currentValue - targetValue) / currentValue * 100).toFixed(1);
        if (improvement < 0) improvement = Math.abs(improvement); // Handle cases where target is higher
    }
    document.getElementById('kaizenImprovement').textContent = improvement + '%';
    
    // Calculate payback period
    let paybackMonths = 0;
    if (annualSavings > 0) {
        paybackMonths = (cost / annualSavings * 12).toFixed(1);
    }
    document.getElementById('kaizenPayback').textContent = paybackMonths + ' ' + (currentLanguage === 'da' ? 'måneder' : 'months');
    
    // Calculate ROI
    let roi = 0;
    if (cost > 0) {
        roi = ((annualSavings - cost) / cost * 100).toFixed(1);
    }
    document.getElementById('kaizenROI').textContent = roi + '%';
    
    saveKaizen();
}

function addKaizenAction() {
    const action = prompt(currentLanguage === 'da' ? 'Beskriv handlingspost:' : 'Describe action item:');
    if (!action) return;
    
    const responsible = prompt(currentLanguage === 'da' ? 'Ansvarlig person:' : 'Responsible person:') || currentLanguage === 'da' ? 'Ikke tildelt' : 'Unassigned';
    const deadline = prompt(currentLanguage === 'da' ? 'Deadline (YYYY-MM-DD):' : 'Deadline (YYYY-MM-DD):') || '';
    
    kaizenActions.push({
        id: Date.now(),
        action,
        responsible,
        deadline,
        completed: false
    });
    
    updateKaizenActionList();
    saveKaizen();
}

function updateKaizenActionList() {
    const list = document.getElementById('kaizenActionList');
    if (!list) return;
    
    if (kaizenActions.length === 0) {
        list.innerHTML = `<p class="text-xs text-gray-500 dark:text-gray-400 text-center py-4" data-i18n="lean-kaizen-empty">No action items yet. Click "+ Add Action" to start.</p>`;
        return;
    }
    
    list.innerHTML = kaizenActions.map((action, i) => `
        <div class="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded border ${action.completed ? 'border-green-300 dark:border-green-700 opacity-60' : 'border-gray-300 dark:border-gray-600'}">
            <input type="checkbox" ${action.completed ? 'checked' : ''} onchange="toggleKaizenAction(${action.id})" class="w-5 h-5 mt-1 text-amber-600 rounded">
            <div class="flex-1">
                <p class="text-sm font-medium text-gray-800 dark:text-gray-200 ${action.completed ? 'line-through' : ''}">${i + 1}. ${action.action}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    👤 ${action.responsible} ${action.deadline ? `| 📅 ${action.deadline}` : ''}
                </p>
            </div>
            <button onclick="deleteKaizenAction(${action.id})" class="text-red-600 hover:text-red-700 text-xs">🗑️</button>
        </div>
    `).join('');
}

function toggleKaizenAction(id) {
    const action = kaizenActions.find(a => a.id === id);
    if (action) {
        action.completed = !action.completed;
        updateKaizenActionList();
        saveKaizen();
    }
}

function deleteKaizenAction(id) {
    if (confirm(currentLanguage === 'da' ? 'Slet denne handling?' : 'Delete this action?')) {
        kaizenActions = kaizenActions.filter(a => a.id !== id);
        updateKaizenActionList();
        saveKaizen();
    }
}

function saveKaizen() {
    const data = {
        problem: document.getElementById('kaizenProblem')?.value || '',
        currentMetric: document.getElementById('kaizenCurrentMetric')?.value || '',
        currentValue: document.getElementById('kaizenCurrentValue')?.value || '',
        targetValue: document.getElementById('kaizenTargetValue')?.value || '',
        unit: document.getElementById('kaizenUnit')?.value || '',
        cost: document.getElementById('kaizenCost')?.value || '',
        annualSavings: document.getElementById('kaizenAnnualSavings')?.value || '',
        actions: kaizenActions,
        timestamp: Date.now()
    };
    
    localStorage.setItem('lean_kaizen_data', JSON.stringify(data));
}

function loadKaizen() {
    const saved = localStorage.getItem('lean_kaizen_data');
    if (!saved) return;
    
    try {
        const data = JSON.parse(saved);
        document.getElementById('kaizenProblem').value = data.problem || '';
        document.getElementById('kaizenCurrentMetric').value = data.currentMetric || '';
        document.getElementById('kaizenCurrentValue').value = data.currentValue || '';
        document.getElementById('kaizenTargetValue').value = data.targetValue || '';
        document.getElementById('kaizenUnit').value = data.unit || '';
        document.getElementById('kaizenCost').value = data.cost || '';
        document.getElementById('kaizenAnnualSavings').value = data.annualSavings || '';
        kaizenActions = data.actions || [];
        
        updateKaizenActionList();
        calculateKaizenROI();
    } catch (e) {
        console.error('Error loading Kaizen data:', e);
    }
}

function exportKaizen() {
    const data = {
        problem: document.getElementById('kaizenProblem')?.value || '',
        currentMetric: document.getElementById('kaizenCurrentMetric')?.value || '',
        currentValue: document.getElementById('kaizenCurrentValue')?.value || '',
        targetValue: document.getElementById('kaizenTargetValue')?.value || '',
        unit: document.getElementById('kaizenUnit')?.value || '',
        improvement: document.getElementById('kaizenImprovement')?.textContent || '',
        cost: document.getElementById('kaizenCost')?.value || '',
        annualSavings: document.getElementById('kaizenAnnualSavings')?.value || '',
        payback: document.getElementById('kaizenPayback')?.textContent || '',
        roi: document.getElementById('kaizenROI')?.textContent || '',
        actions: kaizenActions
    };
    
    const markdown = `# Kaizen Event Plan\n\n` +
        `**Date:** ${new Date().toLocaleDateString()}\n\n` +
        `## Problem Statement\n${data.problem}\n\n` +
        `## Current vs Target State\n` +
        `- **Metric:** ${data.currentMetric}\n` +
        `- **Current Value:** ${data.currentValue} ${data.unit}\n` +
        `- **Target Value:** ${data.targetValue} ${data.unit}\n` +
        `- **Improvement:** ${data.improvement}\n\n` +
        `## Financial Impact\n` +
        `- **Implementation Cost:** ${data.cost} kr\n` +
        `- **Annual Savings:** ${data.annualSavings} kr\n` +
        `- **Payback Period:** ${data.payback}\n` +
        `- **ROI:** ${data.roi}\n\n` +
        `## Action Items\n` +
        data.actions.map((a, i) => `${i + 1}. ${a.completed ? '[x]' : '[ ]'} ${a.action} (${a.responsible}) ${a.deadline ? `- Due: ${a.deadline}` : ''}`).join('\n');
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Kaizen_Event_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert(currentLanguage === 'da' ? '✅ Kaizen plan eksporteret!' : '✅ Kaizen plan exported!');
}

// Initialize LEAN calculators on page load
function initializeLEANTools() {
    // Load saved data from localStorage
    loadSavedSWOT();
    loadLEANData();
    initVSMCanvas();
    loadKaizen();
    
    // Calculate initial values for new calculators
    if (document.getElementById('taktTimeResult')) {
        calculateTaktTime();
        calculateCycleTime();
        calculateLeadTime();
    }
    
    // Replace all oninput handlers with debounced versions for performance
    replaceCalculatorHandlers();
    
    // Initialize keyboard shortcuts
    initKeyboardShortcuts();
    
    // Optimize scroll performance
    optimizeLEANScroll();
    
    // Initialize smooth scrolling
    initSmoothScroll();
    
    // Show keyboard hints for new users
    showKeyboardHints();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to calculate in focused calculator
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const activeElement = document.activeElement;
            if (activeElement && activeElement.id) {
                if (activeElement.id.startsWith('oee')) {
                    calculateOEE();
                    e.preventDefault();
                } else if (activeElement.id.startsWith('smed')) {
                    calculateSMED();
                    e.preventDefault();
                } else if (activeElement.id.startsWith('waste')) {
                    calculateWaste();
                    e.preventDefault();
                }
            }
        }
    });
}

// Load saved LEAN data from localStorage
function loadLEANData() {
    // Load OEE data
    const oeeData = localStorage.getItem('lean_oee_data');
    if (oeeData) {
        try {
            const data = JSON.parse(oeeData);
            if (document.getElementById('oeeAvailability')) {
                document.getElementById('oeeAvailability').value = data.availability || 85;
                document.getElementById('oeePerformance').value = data.performance || 90;
                document.getElementById('oeeQuality').value = data.quality || 95;
                calculateOEE();
            }
        } catch (e) {}
    }
    
    // Load SMED data
    const smedData = localStorage.getItem('lean_smed_data');
    if (smedData) {
        try {
            const data = JSON.parse(smedData);
            if (document.getElementById('smedCurrentTime')) {
                document.getElementById('smedCurrentTime').value = data.currentTime || 30;
                document.getElementById('smedTargetTime').value = data.targetTime || 10;
                document.getElementById('smedFrequency').value = data.frequency || 250;
                document.getElementById('smedHourlyCost').value = data.hourlyCost || 500;
                calculateSMED();
            }
        } catch (e) {}
    }
    
    // Load Waste data
    const wasteData = localStorage.getItem('lean_waste_data');
    if (wasteData) {
        try {
            const data = JSON.parse(wasteData);
            if (data.wasteData) {
                Object.keys(data.wasteData).forEach(waste => {
                    const checkbox = document.getElementById('waste' + waste);
                    const costInput = document.getElementById('waste' + waste + 'Cost');
                    if (checkbox && costInput) {
                        checkbox.checked = true;
                        costInput.value = data.wasteData[waste];
                    }
                });
                calculateWaste();
            }
        } catch (e) {}
    }
}

// Toggle LEAN section expand/collapse
function toggleLEANSection(sectionId) {
    const content = document.getElementById(`${sectionId}-content`);
    const toggle = document.getElementById(`${sectionId}-toggle`);
    const section = document.getElementById(sectionId);
    
    // Handle help section (no toggle arrow)
    if (sectionId === 'lean-help' && section) {
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
        return;
    }
    
    if (content && toggle) {
        const isHidden = content.style.display === 'none';
        
        // Simplified instant toggle with fade
        if (isHidden) {
            content.style.display = 'block';
            requestAnimationFrame(() => {
                content.classList.add('expanding');
            });
            toggle.style.transform = 'rotate(90deg)';
        } else {
            content.classList.remove('expanding');
            toggle.style.transform = 'rotate(0deg)';
            setTimeout(() => {
                content.style.display = 'none';
            }, 200);
        }
        
        toggle.textContent = isHidden ? '▼' : '▶';
    }
}

// ============================================
// REAL-TIME VALIDATION & FEEDBACK
// ============================================

function validateInput(inputElement, validationFn) {
    if (!inputElement) return;
    
    const value = parseFloat(inputElement.value);
    const result = validationFn(value);
    
    // Remove existing classes
    inputElement.classList.remove('input-valid', 'input-warning', 'input-error');
    
    // Add appropriate class
    if (result.state === 'valid') {
        inputElement.classList.add('input-valid');
    } else if (result.state === 'warning') {
        inputElement.classList.add('input-warning');
    } else if (result.state === 'error') {
        inputElement.classList.add('input-error');
    }
    
    // Add validation icon if container exists
    const container = inputElement.parentElement;
    if (container && container.style.position !== 'relative') {
        container.style.position = 'relative';
    }
}

function validateOEEInputs() {
    const availability = document.getElementById('oeeAvailability');
    const performance = document.getElementById('oeePerformance');
    const quality = document.getElementById('oeeQuality');
    
    if (availability) {
        validateInput(availability, (val) => {
            if (val >= 90) return { state: 'valid' };
            if (val >= 70) return { state: 'warning' };
            return { state: 'error' };
        });
    }
    
    if (performance) {
        validateInput(performance, (val) => {
            if (val >= 90) return { state: 'valid' };
            if (val >= 75) return { state: 'warning' };
            return { state: 'error' };
        });
    }
    
    if (quality) {
        validateInput(quality, (val) => {
            if (val >= 95) return { state: 'valid' };
            if (val >= 85) return { state: 'warning' };
            return { state: 'error' };
        });
    }
}

function validateTimeCalculatorInputs() {
    const taktAvailable = document.getElementById('taktAvailableTime');
    const taktDemand = document.getElementById('taktDemand');
    const cycleUnits = document.getElementById('cycleUnits');
    const cycleTime = document.getElementById('cycleProductionTime');
    
    if (taktAvailable) {
        validateInput(taktAvailable, (val) => {
            if (val > 0 && val <= 960) return { state: 'valid' };
            if (val > 960) return { state: 'warning' };
            return { state: 'error' };
        });
    }
    
    if (taktDemand) {
        validateInput(taktDemand, (val) => {
            if (val > 0) return { state: 'valid' };
            return { state: 'error' };
        });
    }
    
    if (cycleUnits) {
        validateInput(cycleUnits, (val) => {
            if (val > 0) return { state: 'valid' };
            return { state: 'error' };
        });
    }
    
    if (cycleTime) {
        validateInput(cycleTime, (val) => {
            if (val > 0) return { state: 'valid' };
            return { state: 'error' };
        });
    }
}

function validateKaizenROI() {
    const currentValue = document.getElementById('kaizenCurrentValue');
    const targetValue = document.getElementById('kaizenTargetValue');
    const cost = document.getElementById('kaizenCost');
    const savings = document.getElementById('kaizenAnnualSavings');
    
    if (currentValue) {
        validateInput(currentValue, (val) => {
            if (val > 0) return { state: 'valid' };
            return { state: 'error' };
        });
    }
    
    if (targetValue && currentValue) {
        const current = parseFloat(currentValue.value) || 0;
        const target = parseFloat(targetValue.value) || 0;
        
        validateInput(targetValue, (val) => {
            if (val > 0 && val < current) return { state: 'valid' };
            if (val >= current) return { state: 'warning' };
            return { state: 'error' };
        });
    }
    
    if (cost) {
        validateInput(cost, (val) => {
            if (val >= 0 && val < 100000) return { state: 'valid' };
            if (val >= 100000) return { state: 'warning' };
            return { state: 'valid' };
        });
    }
    
    if (savings && cost) {
        const costVal = parseFloat(cost.value) || 0;
        const savingsVal = parseFloat(savings.value) || 0;
        
        validateInput(savings, (val) => {
            if (val > costVal * 2) return { state: 'valid' };
            if (val > costVal) return { state: 'warning' };
            return { state: 'error' };
        });
    }
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Only activate in LEAN section
        const leanSection = document.getElementById('lean-section');
        if (!leanSection || leanSection.classList.contains('hidden')) return;
        
        // Ctrl/Cmd + K: Toggle calculators section
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            toggleLEANSection('calculators');
        }
        
        // Ctrl/Cmd + R: Reset active calculator
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            const activeElement = document.activeElement;
            if (activeElement && activeElement.id) {
                if (activeElement.id.includes('oee')) resetOEE();
                else if (activeElement.id.includes('smed')) resetSMED();
                else if (activeElement.id.includes('waste')) resetWaste();
                else if (activeElement.id.includes('takt') || activeElement.id.includes('cycle') || activeElement.id.includes('lead')) resetTimeCalculators();
            }
        }
        
        // Ctrl/Cmd + Shift + C: Copy results
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            const activeElement = document.activeElement;
            if (activeElement && activeElement.id) {
                if (activeElement.id.includes('oee')) copyOEEResults();
                else if (activeElement.id.includes('smed')) copySMEDResults();
                else if (activeElement.id.includes('waste')) copyWasteResults();
                else if (activeElement.id.includes('time') || activeElement.id.includes('takt') || activeElement.id.includes('cycle')) copyTimeResults();
            }
        }
        
        // Ctrl/Cmd + L: Toggle reference library
        if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
            e.preventDefault();
            toggleLEANSection('reference');
        }
        
        // Ctrl/Cmd + H: Toggle help
        if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
            e.preventDefault();
            const helpSection = document.getElementById('lean-help');
            if (helpSection) {
                helpSection.style.display = helpSection.style.display === 'none' ? 'block' : 'none';
            }
        }
        
        // Escape: Close tooltips
        if (e.key === 'Escape') {
            document.querySelectorAll('[id$="-tooltip"]').forEach(tooltip => {
                tooltip.classList.add('hidden');
            });
        }
    });
}

// Show keyboard shortcut hints on first visit
function showKeyboardHints() {
    const hasSeenHints = localStorage.getItem('lean_keyboard_hints_shown');
    if (!hasSeenHints) {
        setTimeout(() => {
            const message = currentLanguage === 'da' 
                ? '💡 Tip: Brug Ctrl+K for kalkulatorer, Ctrl+R for nulstilling, Ctrl+L for reference!'
                : '💡 Tip: Use Ctrl+K for calculators, Ctrl+R to reset, Ctrl+L for reference!';
            
            // Show non-intrusive notification
            const notification = document.createElement('div');
            notification.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: #3b82f6; color: white; padding: 12px 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 10000; animation: slideInUp 0.4s ease;';
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOutDown 0.4s ease';
                setTimeout(() => notification.remove(), 400);
            }, 5000);
            
            localStorage.setItem('lean_keyboard_hints_shown', 'true');
        }, 2000);
    }
}

// ============================================
// ENHANCED CALCULATORS WITH VALIDATION
// ============================================

// Override original calculateOEE to include validation
const originalCalculateOEE = calculateOEE;
calculateOEE = function() {
    validateOEEInputs();
    originalCalculateOEE.call(this);
};

// Override time calculators to include validation
const originalCalculateTaktTime = calculateTaktTime;
calculateTaktTime = function() {
    validateTimeCalculatorInputs();
    originalCalculateTaktTime.call(this);
};

const originalCalculateCycleTime = calculateCycleTime;
calculateCycleTime = function() {
    validateTimeCalculatorInputs();
    originalCalculateCycleTime.call(this);
};

const originalCalculateLeadTime = calculateLeadTime;
calculateLeadTime = function() {
    validateTimeCalculatorInputs();
    originalCalculateLeadTime.call(this);
};

const originalCalculateKaizenROI = calculateKaizenROI;
calculateKaizenROI = function() {
    validateKaizenROI();
    originalCalculateKaizenROI.call(this);
};

// ============================================
// PERFORMANCE OPTIMIZATIONS
// ============================================

// Debounce function for input handlers
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll handlers
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Create debounced versions of calculator functions for better performance
const debouncedCalculateOEE = debounce(calculateOEE, 300);
const debouncedCalculateSMED = debounce(calculateSMED, 300);
const debouncedCalculateWaste = debounce(calculateWaste, 300);
const debouncedCalculateTaktTime = debounce(calculateTaktTime, 300);
const debouncedCalculateCycleTime = debounce(calculateCycleTime, 300);
const debouncedCalculateLeadTime = debounce(calculateLeadTime, 300);
const debouncedCalculateKaizenROI = debounce(calculateKaizenROI, 300);

// Replace all calculator oninput handlers with debounced versions
function replaceCalculatorHandlers() {
    // OEE inputs
    const oeeInputs = ['oeeAvailability', 'oeePerformance', 'oeeQuality'];
    oeeInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.removeAttribute('oninput');
            input.addEventListener('input', debouncedCalculateOEE);
        }
    });
    
    // SMED inputs
    const smedInputs = ['smedCurrentTime', 'smedTargetTime', 'smedFrequency', 'smedHourlyCost'];
    smedInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.removeAttribute('oninput');
            input.addEventListener('input', debouncedCalculateSMED);
        }
    });
    
    // Waste inputs
    const wasteInputs = ['wasteOverproductionCost', 'wasteWaitingCost', 'wasteTransportCost', 
                         'wasteProcessingCost', 'wasteInventoryCost', 'wasteMotionCost', 'wasteDefectsCost'];
    wasteInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.removeAttribute('oninput');
            input.addEventListener('input', debouncedCalculateWaste);
        }
    });
    
    // Time calculator inputs
    const taktInputs = ['taktAvailableTime', 'taktDemand'];
    taktInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.removeAttribute('oninput');
            input.addEventListener('input', debouncedCalculateTaktTime);
        }
    });
    
    const cycleInputs = ['cycleUnits', 'cycleProductionTime'];
    cycleInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.removeAttribute('oninput');
            input.addEventListener('input', debouncedCalculateCycleTime);
        }
    });
    
    const leadInputs = ['leadProcessTime', 'leadQueueTime', 'leadTransportTime'];
    leadInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.removeAttribute('oninput');
            input.addEventListener('input', debouncedCalculateLeadTime);
        }
    });
    
    // Kaizen inputs
    const kaizenInputs = ['kaizenCurrentValue', 'kaizenTargetValue', 'kaizenCost', 
                          'kaizenAnnualSavings', 'kaizenUnit'];
    kaizenInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.removeAttribute('oninput');
            input.addEventListener('input', debouncedCalculateKaizenROI);
        }
    });
}

// Optimize scroll performance in LEAN section
function optimizeLEANScroll() {
    const leanSection = document.getElementById('lean-section');
    if (!leanSection) return;
    
    // Use passive listeners for better scroll performance
    leanSection.addEventListener('scroll', throttle(() => {
        // Lazy load images or heavy content if needed
    }, 100), { passive: true });
}

// Add smooth scroll behavior
function initSmoothScroll() {
    document.querySelectorAll('#lean-section a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function toggleBudgetHelp() {
    const helpSection = document.getElementById('budget-help-section');
    if (helpSection) {
        helpSection.style.display = helpSection.style.display === 'none' ? 'block' : 'none';
    }
}

// Toggle budget sparklines visibility
function toggleBudgetSparklines() {
    const container = document.getElementById('budget-sparklines-container');
    if (container) {
        container.classList.toggle('hidden');
    }
}

// Call initialization when switching to LEAN tab
const originalSwitchTab = switchTab;
switchTab = function(tabName, button) {
    originalSwitchTab.call(this, tabName, button);
    
    // Initialize LEAN tools when tab is activated
    if (tabName === 'lean') {
        setTimeout(initializeLEANTools, 100);
    }
};

// Close export dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('[onclick*="exportSWOT"]') && !e.target.closest('.relative')) {
        document.querySelectorAll('.relative .hidden').forEach(el => {
            if (!el.classList.contains('tab-content')) {
                el.classList.add('hidden');
            }
        });
    }
});

// Log application info
console.log('ABC & EOQ Dashboard v2.0 - Enhanced Edition');
console.log('All processing happens locally in your browser');
console.log('No data is sent to any server');
console.log('New features: Dashboard, Drag&Drop, Data Validation, Excel Export, Comparison, Keyboard Shortcuts, LEAN Tools');
