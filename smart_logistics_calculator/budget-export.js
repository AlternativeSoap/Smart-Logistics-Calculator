// ===================================================================
// Budget Export/Import Manager - Excel-like Home Budget
// Export to Excel with monthly columns matching user's format
// ===================================================================

class BudgetExporter {
    constructor(storage) {
        this.storage = storage;
        this.monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    }

    // ===================================================================
    // Export to Excel - Using ExcelJS with Full Styling Support
    // ===================================================================
    async exportToExcel() {
        const data = this.storage.getData();
        
        // Create a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Budget', {
            views: [{ state: 'frozen', xSplit: 1, ySplit: 4 }]
        });
        
        const monthNamesDA = ['Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'December'];
        
        // Month column colors - base colors for Mdr columns
        const monthBaseColors = [
            'B4C7E7', 'C5E0B4', 'FFE699', 'F8CBAD', 'E2EFDA', 'DEEBF7',
            'FCE4D6', 'FFF2CC', 'D9E1F2', 'EDEDED', 'E7E6E6', 'D9D2E9'
        ];
        
        // Lighter versions for 14-day columns (30% lighter)
        const month14DayColors = [
            'DCE6F1', 'E2EFD9', 'FFF2CC', 'FCE4D6', 'F2F2F2', 'EAF1F7',
            'FEF2E8', 'FFF9E6', 'E9EFF7', 'F5F5F5', 'F3F3F3', 'EDE9F4'
        ];
        
        // Header column colors (blue gradient for headers)
        const headerColors = [
            '4472C4', '5B9BD5', '70A3DB', '85B3E1', 
            '9AC4E7', 'AFD4ED', '4A5F8C', '5E7BAF',
            '7297C2', '86B3D5', '9ACFE8', 'AEE0FB'
        ];
        
        // Row 1: Title
        worksheet.mergeCells('A1:Z1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = `Budget ${data.year}`;
        titleCell.font = { bold: true, size: 16, color: { argb: 'FF1F4788' } };
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE7F3FF' } };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(1).height = 25;
        
        // Row 2: Legend
        worksheet.mergeCells('A2:Z2');
        const legendCell = worksheet.getCell('A2');
        legendCell.value = 'Konto: [B] = Budget Konto  |  [D] = Daglig Brug Konto';
        legendCell.font = { italic: true, size: 10, color: { argb: 'FF666666' } };
        legendCell.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(2).height = 15;
        
        // Row 3: Empty
        worksheet.getRow(3).height = 10;
        
        // Row 4: Column Headers
        const headerRow = worksheet.getRow(4);
        headerRow.height = 20;
        
        // Set column headers with styling
        headerRow.getCell(1).value = 'Navn';
        headerRow.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        headerRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
        headerRow.getCell(1).border = {
            top: { style: 'thin' }, bottom: { style: 'thin' },
            left: { style: 'thin' }, right: { style: 'thin' }
        };
        
        headerRow.getCell(2).value = 'Faktiske';
        headerRow.getCell(2).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        headerRow.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
        headerRow.getCell(2).border = {
            top: { style: 'thin' }, bottom: { style: 'thin' },
            left: { style: 'thin' }, right: { style: 'thin' }
        };
        
        let colIndex = 3;
        monthNamesDA.forEach((month, idx) => {
            const color = headerColors[idx];
            
            // Month column
            const mdrCell = headerRow.getCell(colIndex);
            mdrCell.value = `${month} Mdr.`;
            mdrCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            mdrCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + color } };
            mdrCell.alignment = { horizontal: 'center', vertical: 'middle' };
            mdrCell.border = {
                top: { style: 'thin' }, bottom: { style: 'thin' },
                left: { style: 'thin' }, right: { style: 'thin' }
            };
            
            // 14-day column
            const dag14Cell = headerRow.getCell(colIndex + 1);
            dag14Cell.value = `${month} 14.Dag`;
            dag14Cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            dag14Cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + color } };
            dag14Cell.alignment = { horizontal: 'center', vertical: 'middle' };
            dag14Cell.border = {
                top: { style: 'thin' }, bottom: { style: 'thin' },
                left: { style: 'thin' }, right: { style: 'thin' }
            };
            
            colIndex += 2;
        });
        
        let currentRow = 5; // Start after title, legend, empty row, and headers
        
        // Income section header
        worksheet.mergeCells(`A${currentRow}:Z${currentRow}`);
        const incomeHeaderCell = worksheet.getCell(`A${currentRow}`);
        incomeHeaderCell.value = 'INDTÆGTER';
        incomeHeaderCell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
        incomeHeaderCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
        incomeHeaderCell.alignment = { horizontal: 'left', vertical: 'middle' };
        worksheet.getRow(currentRow).height = 18;
        currentRow++;
        
        // Calculate totals
        const incomeTotals = this.calculateTotals(data.income);
        
        // Income rows
        data.income.forEach(row => {
            const dataRow = worksheet.getRow(currentRow);
            dataRow.height = 16;
            
            if (row.isCategory) {
                // Category row
                worksheet.mergeCells(`A${currentRow}:Z${currentRow}`);
                const catCell = worksheet.getCell(`A${currentRow}`);
                catCell.value = `📁 ${row.name}`;
                catCell.font = { bold: true, italic: true, color: { argb: 'FF0070C0' } };
                catCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDEBF7' } };
                catCell.alignment = { horizontal: 'left', vertical: 'middle' };
            } else {
                // Name cell with account indicator
                const accountLabel = row.account === 'budget' ? '[B]' : '[D]';
                dataRow.getCell(1).value = `${accountLabel} ${row.name}`;
                dataRow.getCell(1).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
                
                // Faktiske cell
                dataRow.getCell(2).value = row.faktiske;
                dataRow.getCell(2).numFmt = '#,##0.00';
                dataRow.getCell(2).font = { color: { argb: 'FF006400' } };
                dataRow.getCell(2).alignment = { horizontal: 'right', vertical: 'middle' };
                dataRow.getCell(2).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
                
                // Month columns
                let colIdx = 3;
                this.monthNames.forEach((month, mIdx) => {
                    const baseColor = monthBaseColors[mIdx];
                    const lighterColor = month14DayColors[mIdx];
                    
                    // Mdr cell
                    const mdrCell = dataRow.getCell(colIdx);
                    mdrCell.value = row[month].mdr;
                    mdrCell.numFmt = '#,##0.00';
                    mdrCell.font = { color: { argb: 'FF006400' } };
                    mdrCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + baseColor } };
                    mdrCell.alignment = { horizontal: 'right', vertical: 'middle' };
                    mdrCell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
                    
                    // 14-day cell (lighter version)
                    const dag14Cell = dataRow.getCell(colIdx + 1);
                    dag14Cell.value = row[month].dag14;
                    dag14Cell.numFmt = '#,##0.00';
                    dag14Cell.font = { color: { argb: 'FF006400' } };
                    dag14Cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + lighterColor } };
                    dag14Cell.alignment = { horizontal: 'right', vertical: 'middle' };
                    dag14Cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
                    
                    colIdx += 2;
                });
            }
            currentRow++;
        });
        
        // Income totals row
        const incomeTotalRow = worksheet.getRow(currentRow);
        const incomeStartRow = currentRow - data.income.length;
        const incomeEndRow = currentRow - 1;
        incomeTotalRow.height = 18;
        
        incomeTotalRow.getCell(1).value = 'TOTAL INDTÆGTER';
        incomeTotalRow.getCell(1).font = { bold: true };
        incomeTotalRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFD966' } };
        incomeTotalRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
        incomeTotalRow.getCell(1).border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'medium' }, right: { style: 'thin' } };
        
        // Add SUM formula for Faktiske
        incomeTotalRow.getCell(2).value = { formula: `SUM(B${incomeStartRow}:B${incomeEndRow})`, result: incomeTotals.faktiske };
        incomeTotalRow.getCell(2).numFmt = '#,##0.00';
        incomeTotalRow.getCell(2).font = { bold: true };
        incomeTotalRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFD966' } };
        incomeTotalRow.getCell(2).alignment = { horizontal: 'right', vertical: 'middle' };
        incomeTotalRow.getCell(2).border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'thin' }, right: { style: 'thin' } };
        
        // Add SUM formulas for each month column
        let colIdx = 3;
        this.monthNames.forEach(month => {
            const colLetter = String.fromCharCode(64 + colIdx);
            incomeTotalRow.getCell(colIdx).value = { formula: `SUM(${colLetter}${incomeStartRow}:${colLetter}${incomeEndRow})`, result: incomeTotals[month].mdr };
            incomeTotalRow.getCell(colIdx).numFmt = '#,##0.00';
            incomeTotalRow.getCell(colIdx).font = { bold: true };
            incomeTotalRow.getCell(colIdx).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFD966' } };
            incomeTotalRow.getCell(colIdx).alignment = { horizontal: 'right', vertical: 'middle' };
            incomeTotalRow.getCell(colIdx).border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'thin' }, right: { style: 'thin' } };
            
            const col14Letter = String.fromCharCode(64 + colIdx + 1);
            incomeTotalRow.getCell(colIdx + 1).value = { formula: `SUM(${col14Letter}${incomeStartRow}:${col14Letter}${incomeEndRow})`, result: incomeTotals[month].dag14 };
            incomeTotalRow.getCell(colIdx + 1).numFmt = '#,##0.00';
            incomeTotalRow.getCell(colIdx + 1).font = { bold: true };
            incomeTotalRow.getCell(colIdx + 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFD966' } };
            incomeTotalRow.getCell(colIdx + 1).alignment = { horizontal: 'right', vertical: 'middle' };
            incomeTotalRow.getCell(colIdx + 1).border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'thin' }, right: { style: 'thin' } };
            
            colIdx += 2;
        });
        const incomeTotalRowNum = currentRow;
        currentRow++;
        
        // Empty row
        worksheet.getRow(currentRow).height = 10;
        currentRow++;
        
        // Expenses section header
        worksheet.mergeCells(`A${currentRow}:Z${currentRow}`);
        const expenseHeaderCell = worksheet.getCell(`A${currentRow}`);
        expenseHeaderCell.value = 'UDGIFTER';
        expenseHeaderCell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
        expenseHeaderCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE74C3C' } };
        expenseHeaderCell.alignment = { horizontal: 'left', vertical: 'middle' };
        worksheet.getRow(currentRow).height = 18;
        currentRow++;
        
        // Calculate expense totals
        const expenseTotals = this.calculateTotals(data.expenses);
        
        // Expense rows
        data.expenses.forEach(row => {
            const dataRow = worksheet.getRow(currentRow);
            dataRow.height = 16;
            
            if (row.isCategory) {
                worksheet.mergeCells(`A${currentRow}:Z${currentRow}`);
                const catCell = worksheet.getCell(`A${currentRow}`);
                catCell.value = `📁 ${row.name}`;
                catCell.font = { bold: true, italic: true, color: { argb: 'FF0070C0' } };
                catCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDEBF7' } };
                catCell.alignment = { horizontal: 'left', vertical: 'middle' };
            } else {
                // Name cell with account indicator
                const accountLabel = row.account === 'budget' ? '[B]' : '[D]';
                dataRow.getCell(1).value = `${accountLabel} ${row.name}`;
                dataRow.getCell(1).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
                
                dataRow.getCell(2).value = row.faktiske;
                dataRow.getCell(2).numFmt = '#,##0.00';
                dataRow.getCell(2).font = { color: { argb: 'FFCC0000' } };
                dataRow.getCell(2).alignment = { horizontal: 'right', vertical: 'middle' };
                dataRow.getCell(2).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
                
                let colIdx = 3;
                this.monthNames.forEach((month, mIdx) => {
                    const baseColor = monthBaseColors[mIdx];
                    const lighterColor = month14DayColors[mIdx];
                    
                    const mdrCell = dataRow.getCell(colIdx);
                    mdrCell.value = row[month].mdr;
                    mdrCell.numFmt = '#,##0.00';
                    mdrCell.font = { color: { argb: 'FFCC0000' } };
                    mdrCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + baseColor } };
                    mdrCell.alignment = { horizontal: 'right', vertical: 'middle' };
                    mdrCell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
                    
                    const dag14Cell = dataRow.getCell(colIdx + 1);
                    dag14Cell.value = row[month].dag14;
                    dag14Cell.numFmt = '#,##0.00';
                    dag14Cell.font = { color: { argb: 'FFCC0000' } };
                    dag14Cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + lighterColor } };
                    dag14Cell.alignment = { horizontal: 'right', vertical: 'middle' };
                    dag14Cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
                    
                    colIdx += 2;
                });
            }
            currentRow++;
        });
        
        // Expense totals row
        const expenseTotalRow = worksheet.getRow(currentRow);
        const expenseStartRow = currentRow - data.expenses.length;
        const expenseEndRow = currentRow - 1;
        expenseTotalRow.height = 18;
        
        expenseTotalRow.getCell(1).value = 'TOTAL UDGIFTER';
        expenseTotalRow.getCell(1).font = { bold: true };
        expenseTotalRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFD966' } };
        expenseTotalRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
        expenseTotalRow.getCell(1).border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'medium' }, right: { style: 'thin' } };
        
        // Add SUM formula for Faktiske
        expenseTotalRow.getCell(2).value = { formula: `SUM(B${expenseStartRow}:B${expenseEndRow})`, result: expenseTotals.faktiske };
        expenseTotalRow.getCell(2).numFmt = '#,##0.00';
        expenseTotalRow.getCell(2).font = { bold: true };
        expenseTotalRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFD966' } };
        expenseTotalRow.getCell(2).alignment = { horizontal: 'right', vertical: 'middle' };
        expenseTotalRow.getCell(2).border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'thin' }, right: { style: 'thin' } };
        
        // Add SUM formulas for each month column
        colIdx = 3;
        this.monthNames.forEach(month => {
            const colLetter = String.fromCharCode(64 + colIdx);
            expenseTotalRow.getCell(colIdx).value = { formula: `SUM(${colLetter}${expenseStartRow}:${colLetter}${expenseEndRow})`, result: expenseTotals[month].mdr };
            expenseTotalRow.getCell(colIdx).numFmt = '#,##0.00';
            expenseTotalRow.getCell(colIdx).font = { bold: true };
            expenseTotalRow.getCell(colIdx).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFD966' } };
            expenseTotalRow.getCell(colIdx).alignment = { horizontal: 'right', vertical: 'middle' };
            expenseTotalRow.getCell(colIdx).border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'thin' }, right: { style: 'thin' } };
            
            const col14Letter = String.fromCharCode(64 + colIdx + 1);
            expenseTotalRow.getCell(colIdx + 1).value = { formula: `SUM(${col14Letter}${expenseStartRow}:${col14Letter}${expenseEndRow})`, result: expenseTotals[month].dag14 };
            expenseTotalRow.getCell(colIdx + 1).numFmt = '#,##0.00';
            expenseTotalRow.getCell(colIdx + 1).font = { bold: true };
            expenseTotalRow.getCell(colIdx + 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFD966' } };
            expenseTotalRow.getCell(colIdx + 1).alignment = { horizontal: 'right', vertical: 'middle' };
            expenseTotalRow.getCell(colIdx + 1).border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'thin' }, right: { style: 'thin' } };
            
            colIdx += 2;
        });
        const expenseTotalRowNum = currentRow;
        currentRow++;
        
        // Empty row
        worksheet.getRow(currentRow).height = 10;
        currentRow++;
        
        // Summary section header
        worksheet.mergeCells(`A${currentRow}:Z${currentRow}`);
        const summaryHeaderCell = worksheet.getCell(`A${currentRow}`);
        summaryHeaderCell.value = 'OVERSIGT';
        summaryHeaderCell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
        summaryHeaderCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9B59B6' } };
        summaryHeaderCell.alignment = { horizontal: 'left', vertical: 'middle' };
        worksheet.getRow(currentRow).height = 18;
        currentRow++;
        
        // Summary row with conditional coloring
        const summaryRow = worksheet.getRow(currentRow);
        summaryRow.height = 18;
        
        summaryRow.getCell(1).value = 'Overskud/Underskud';
        summaryRow.getCell(1).font = { bold: true };
        summaryRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
        summaryRow.getCell(1).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
        
        // Add subtraction formula for Faktiske (income - expense)
        const netFaktiske = incomeTotals.faktiske - expenseTotals.faktiske;
        summaryRow.getCell(2).value = { formula: `B${incomeTotalRowNum}-B${expenseTotalRowNum}`, result: netFaktiske };
        summaryRow.getCell(2).numFmt = '#,##0.00';
        summaryRow.getCell(2).font = { bold: true, color: { argb: netFaktiske >= 0 ? 'FF006400' : 'FFCC0000' } };
        summaryRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: netFaktiske >= 0 ? 'FFC5E0B4' : 'FFFFCCCC' } };
        summaryRow.getCell(2).alignment = { horizontal: 'right', vertical: 'middle' };
        summaryRow.getCell(2).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
        
        // Add subtraction formulas for each month column
        colIdx = 3;
        this.monthNames.forEach(month => {
            const netMdr = incomeTotals[month].mdr - expenseTotals[month].mdr;
            const netDag14 = incomeTotals[month].dag14 - expenseTotals[month].dag14;
            
            const colLetter = String.fromCharCode(64 + colIdx);
            summaryRow.getCell(colIdx).value = { formula: `${colLetter}${incomeTotalRowNum}-${colLetter}${expenseTotalRowNum}`, result: netMdr };
            summaryRow.getCell(colIdx).numFmt = '#,##0.00';
            summaryRow.getCell(colIdx).font = { bold: true, color: { argb: netMdr >= 0 ? 'FF006400' : 'FFCC0000' } };
            summaryRow.getCell(colIdx).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: netMdr >= 0 ? 'FFC5E0B4' : 'FFFFCCCC' } };
            summaryRow.getCell(colIdx).alignment = { horizontal: 'right', vertical: 'middle' };
            summaryRow.getCell(colIdx).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
            
            const col14Letter = String.fromCharCode(64 + colIdx + 1);
            summaryRow.getCell(colIdx + 1).value = { formula: `${col14Letter}${incomeTotalRowNum}-${col14Letter}${expenseTotalRowNum}`, result: netDag14 };
            summaryRow.getCell(colIdx + 1).numFmt = '#,##0.00';
            summaryRow.getCell(colIdx + 1).font = { bold: true, color: { argb: netDag14 >= 0 ? 'FF006400' : 'FFCC0000' } };
            summaryRow.getCell(colIdx + 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: netDag14 >= 0 ? 'FFC5E0B4' : 'FFFFCCCC' } };
            summaryRow.getCell(colIdx + 1).alignment = { horizontal: 'right', vertical: 'middle' };
            summaryRow.getCell(colIdx + 1).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
            
            colIdx += 2;
        });
        
        currentRow++;
        
        // Empty row
        worksheet.getRow(currentRow).height = 10;
        currentRow++;
        
        // ===================================================================
        // ACCOUNT TRANSFER RECOMMENDATIONS SECTION
        // ===================================================================
        
        // Section header
        worksheet.mergeCells(`A${currentRow}:Z${currentRow}`);
        const transferHeaderCell = worksheet.getCell(`A${currentRow}`);
        transferHeaderCell.value = 'KONTO OVERFØRSEL ANBEFALINGER';
        transferHeaderCell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
        transferHeaderCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4A90E2' } };
        transferHeaderCell.alignment = { horizontal: 'left', vertical: 'middle' };
        worksheet.getRow(currentRow).height = 18;
        currentRow++;
        
        // Calculate account totals for each month
        const accountData = [];
        this.monthNames.forEach(month => {
            const budgetExpenses = data.expenses
                .filter(row => !row.isCategory && row.account === 'budget')
                .reduce((sum, row) => sum + (row[month].mdr || 0) + (row[month].dag14 || 0), 0);
            
            const dailyIncome = data.income
                .filter(row => !row.isCategory && row.account === 'daily')
                .reduce((sum, row) => sum + (row[month].mdr || 0) + (row[month].dag14 || 0), 0);
            
            const dailyExpenses = data.expenses
                .filter(row => !row.isCategory && row.account === 'daily')
                .reduce((sum, row) => sum + (row[month].mdr || 0) + (row[month].dag14 || 0), 0);
            
            accountData.push({
                month: month,
                required: budgetExpenses,
                dailyIncome: dailyIncome,
                dailyExpenses: dailyExpenses,
                remaining: dailyIncome - dailyExpenses - budgetExpenses
            });
        });
        
        // Transfer recommendation rows
        const transferRows = [
            { label: 'Påkrævet Overførsel', field: 'required', color: 'FFE7F3FF' },
            { label: 'Daglig Indtægt', field: 'dailyIncome', color: 'FFE2EFDA' },
            { label: 'Daglig Udgifter', field: 'dailyExpenses', color: 'FFFCE4D6' },
            { label: 'Tilbage på Daglig', field: 'remaining', color: 'FFFFF2CC' }
        ];
        
        transferRows.forEach(rowDef => {
            const row = worksheet.getRow(currentRow);
            row.height = 18;
            
            row.getCell(1).value = rowDef.label;
            row.getCell(1).font = { bold: true };
            row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowDef.color } };
            row.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
            row.getCell(1).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
            
            // Faktiske column (empty for transfer rows)
            row.getCell(2).value = '';
            row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowDef.color } };
            row.getCell(2).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
            
            // Month columns
            colIdx = 3;
            accountData.forEach((monthData, idx) => {
                const value = monthData[rowDef.field];
                const baseColor = monthBaseColors[idx];
                const lighterColor = month14DayColors[idx];
                
                // Mdr column
                row.getCell(colIdx).value = value;
                row.getCell(colIdx).numFmt = '#,##0.00';
                row.getCell(colIdx).font = { bold: rowDef.field === 'required' || rowDef.field === 'remaining', color: { argb: value >= 0 ? 'FF006400' : 'FFCC0000' } };
                row.getCell(colIdx).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + baseColor } };
                row.getCell(colIdx).alignment = { horizontal: 'right', vertical: 'middle' };
                row.getCell(colIdx).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
                
                // 14-day column (same value for consistency)
                row.getCell(colIdx + 1).value = value;
                row.getCell(colIdx + 1).numFmt = '#,##0.00';
                row.getCell(colIdx + 1).font = { bold: rowDef.field === 'required' || rowDef.field === 'remaining', color: { argb: value >= 0 ? 'FF006400' : 'FFCC0000' } };
                row.getCell(colIdx + 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + lighterColor } };
                row.getCell(colIdx + 1).alignment = { horizontal: 'right', vertical: 'middle' };
                row.getCell(colIdx + 1).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
                
                colIdx += 2;
            });
            
            currentRow++;
        });
        
        // Set column widths
        worksheet.getColumn(1).width = 35; // Name column
        worksheet.getColumn(2).width = 12; // Faktiske
        for (let i = 3; i <= 26; i++) {
            worksheet.getColumn(i).width = 12; // Month columns
        }
        
        // Generate Excel file and download
        const filename = `Budget_${data.year}.xlsx`;
        
        try {
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating Excel file:', error);
            alert('Failed to generate Excel file. Please try again.');
        }
        
        return filename;
    }
    
    // Helper function to calculate totals
    calculateTotals(rows) {
        const totals = {
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
        
        rows.forEach(row => {
            if (!row.isCategory) {
                totals.faktiske += parseFloat(row.faktiske) || 0;
                this.monthNames.forEach(month => {
                    totals[month].mdr += parseFloat(row[month].mdr) || 0;
                    totals[month].dag14 += parseFloat(row[month].dag14) || 0;
                });
            }
        });
        
        return totals;
    }

    // ===================================================================
    // Export to CSV
    // ===================================================================
    exportToCSV() {
        const data = this.storage.getData();
        let csv = `Budget ${data.year}\n\n`;
        
        // Headers
        csv += 'Navn,Faktiske';
        const monthNamesDA = ['Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'December'];
        monthNamesDA.forEach(month => {
            csv += `,${month} Mdr.,${month} 14.Dag`;
        });
        csv += '\n';
        
        // Income
        csv += 'INDTÆGTER\n';
        data.income.forEach(row => {
            csv += `"${row.name}",${row.faktiske}`;
            this.monthNames.forEach(month => {
                csv += `,${row[month].mdr},${row[month].dag14}`;
            });
            csv += '\n';
        });
        
        csv += '\n';
        
        // Expenses
        csv += 'UDGIFTER\n';
        data.expenses.forEach(row => {
            csv += `"${row.name}",${row.faktiske}`;
            this.monthNames.forEach(month => {
                csv += `,${row[month].mdr},${row[month].dag14}`;
            });
            csv += '\n';
        });
        
        // Download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Budget_${data.year}.csv`;
        link.click();
        
        return `Budget_${data.year}.csv`;
    }

    // ===================================================================
    // Import from Excel
    // ===================================================================
    importFromExcel(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    
                    // Parse imported data
                    const budgetData = this.parseImportedData(jsonData);
                    
                    if (this.storage.importData(budgetData)) {
                        resolve(budgetData);
                    } else {
                        reject(new Error('Invalid data format'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('File reading failed'));
            reader.readAsArrayBuffer(file);
        });
    }

    // ===================================================================
    // Import from CSV
    // ===================================================================
    importFromCSV(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const csv = e.target.result;
                    const lines = csv.split('\n');
                    const jsonData = lines.map(line => {
                        // Simple CSV parsing (handles quoted fields)
                        const regex = /(".*?"|[^,]+)(?=\s*,|\s*$)/g;
                        return (line.match(regex) || []).map(cell => 
                            cell.replace(/^"|"$/g, '').trim()
                        );
                    });
                    
                    const budgetData = this.parseImportedData(jsonData);
                    
                    if (this.storage.importData(budgetData)) {
                        resolve(budgetData);
                    } else {
                        reject(new Error('Invalid data format'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('File reading failed'));
            reader.readAsText(file);
        });
    }

    // ===================================================================
    // Parse Imported Data
    // ===================================================================
    parseImportedData(rows) {
        const budgetData = this.storage.getDefaultData();
        
        // Try to detect year from first row
        const firstRow = rows[0] ? rows[0].join(' ') : '';
        const yearMatch = firstRow.match(/\d{4}/);
        if (yearMatch) {
            budgetData.year = parseInt(yearMatch[0]);
        }
        
        let currentSection = null;
        let dataStartRow = -1;
        
        // Find where data starts (after headers)
        for (let i = 0; i < rows.length; i++) {
            const firstCell = (rows[i][0] || '').toString().toLowerCase();
            
            if (firstCell.includes('indtægt') || firstCell.includes('income')) {
                currentSection = 'income';
                dataStartRow = i + 1;
            } else if (firstCell.includes('udgift') || firstCell.includes('expense')) {
                currentSection = 'expenses';
                dataStartRow = i + 1;
            } else if (currentSection && i > dataStartRow && rows[i][0]) {
                // Parse data row
                const name = rows[i][0] || '';
                const faktiske = parseFloat(rows[i][1]) || 0;
                
                const rowData = {
                    name: name,
                    faktiske: faktiske,
                    jan: { mdr: parseFloat(rows[i][2]) || 0, dag14: parseFloat(rows[i][3]) || 0 },
                    feb: { mdr: parseFloat(rows[i][4]) || 0, dag14: parseFloat(rows[i][5]) || 0 },
                    mar: { mdr: parseFloat(rows[i][6]) || 0, dag14: parseFloat(rows[i][7]) || 0 },
                    apr: { mdr: parseFloat(rows[i][8]) || 0, dag14: parseFloat(rows[i][9]) || 0 },
                    may: { mdr: parseFloat(rows[i][10]) || 0, dag14: parseFloat(rows[i][11]) || 0 },
                    jun: { mdr: parseFloat(rows[i][12]) || 0, dag14: parseFloat(rows[i][13]) || 0 },
                    jul: { mdr: parseFloat(rows[i][14]) || 0, dag14: parseFloat(rows[i][15]) || 0 },
                    aug: { mdr: parseFloat(rows[i][16]) || 0, dag14: parseFloat(rows[i][17]) || 0 },
                    sep: { mdr: parseFloat(rows[i][18]) || 0, dag14: parseFloat(rows[i][19]) || 0 },
                    oct: { mdr: parseFloat(rows[i][20]) || 0, dag14: parseFloat(rows[i][21]) || 0 },
                    nov: { mdr: parseFloat(rows[i][22]) || 0, dag14: parseFloat(rows[i][23]) || 0 },
                    dec: { mdr: parseFloat(rows[i][24]) || 0, dag14: parseFloat(rows[i][25]) || 0 }
                };
                
                if (currentSection === 'income') {
                    budgetData.income.push(rowData);
                } else if (currentSection === 'expenses') {
                    budgetData.expenses.push(rowData);
                }
            }
        }
        
        // Remove default empty rows if we imported data
        if (budgetData.income.length > 1 && !budgetData.income[0].name) {
            budgetData.income.shift();
        }
        if (budgetData.expenses.length > 1 && !budgetData.expenses[0].name) {
            budgetData.expenses.shift();
        }
        
        return budgetData;
    }

    // ===================================================================
    // Export JSON Backup
    // ===================================================================
    exportJSON() {
        const data = this.storage.exportData();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Budget_${data.year}_backup.json`;
        link.click();
        return `Budget_${data.year}_backup.json`;
    }

    // ===================================================================
    // Import JSON Backup
    // ===================================================================
    importJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (this.storage.importData(data)) {
                        resolve(data);
                    } else {
                        reject(new Error('Invalid JSON format'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('File reading failed'));
            reader.readAsText(file);
        });
    }
}
