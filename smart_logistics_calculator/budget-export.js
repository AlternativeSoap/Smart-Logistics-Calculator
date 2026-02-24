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
    // Export to Excel - Clean Design with Muted Colors
    // ===================================================================
    async exportToExcel() {
        const data = this.storage.getData();
        
        // Create a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Budget', {
            views: [{ state: 'frozen', xSplit: 2, ySplit: 3 }]
        });
        
        const monthNamesDA = currentLanguage === 'da' ? ['Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'December'] : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        
        // Muted, professional color scheme
        const colors = {
            // Header colors - soft blue-gray
            headerBg: 'D6E4F0',
            headerText: '2C5282',
            
            // Income colors - soft greens
            incomeHeader: 'C6E1D4',
            incomeData: 'F0F7F4',
            incomeText: '2D5F3F',
            incomeTotal: 'B8D7CA',
            
            // Expense colors - soft reds/pinks
            expenseHeader: 'F4D4D8',
            expenseData: 'FBF5F5',
            expenseText: '7C2D37',
            expenseTotal: 'ECC4C8',
            
            // Month columns - alternating soft grays
            monthEven: 'F5F5F5',
            monthOdd: 'FFFFFF',
            month14Even: 'FAFAFA',
            month14Odd: 'F8F8F8',
            
            // Category color
            category: 'E8EDF2',
            categoryText: '4A5568',
            
            // Faktiske column
            faktiskeBg: 'FFF8DC',
            faktiskeText: '5D4E37'
        };
        
        // Set column widths
        worksheet.getColumn(1).width = 30; // Name
        worksheet.getColumn(2).width = 12; // Faktiske
        for (let i = 3; i <= 26; i++) {
            worksheet.getColumn(i).width = 11; // Month columns
        }
        
        // Row 1: Title and Year
        worksheet.mergeCells('A1:Z1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = `Budget ${data.year}`;
        titleCell.font = { bold: true, size: 18, color: { argb: 'FF' + colors.headerText } };
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colors.headerBg } };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        titleCell.border = {
            bottom: { style: 'medium', color: { argb: 'FF' + colors.headerText } }
        };
        worksheet.getRow(1).height = 30;
        
        // Row 2: Empty spacing
        worksheet.getRow(2).height = 8;
        
        // Row 3: Column Headers
        const headerRow = worksheet.getRow(3);
        headerRow.height = 22;
        
        // Name header
        const nameHeader = headerRow.getCell(1);
        nameHeader.value = currentLanguage === 'da' ? 'Navn' : 'Name';
        nameHeader.font = { bold: true, size: 11, color: { argb: 'FF' + colors.headerText } };
        nameHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colors.headerBg } };
        nameHeader.alignment = { horizontal: 'center', vertical: 'middle' };
        nameHeader.border = {
            top: { style: 'medium' }, bottom: { style: 'medium' },
            left: { style: 'medium' }, right: { style: 'thin' }
        };
        
        // Faktiske header
        const faktiskeHeader = headerRow.getCell(2);
        faktiskeHeader.value = currentLanguage === 'da' ? 'Faktiske*' : 'Actuals*';
        faktiskeHeader.font = { bold: true, size: 11, color: { argb: 'FF' + colors.faktiskeText } };
        faktiskeHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colors.faktiskeBg } };
        faktiskeHeader.alignment = { horizontal: 'center', vertical: 'middle' };
        faktiskeHeader.border = {
            top: { style: 'medium' }, bottom: { style: 'medium' },
            left: { style: 'thin' }, right: { style: 'thin' }
        };
        
        // Month column headers
        let colIndex = 3;
        monthNamesDA.forEach((month, idx) => {
            const isEven = idx % 2 === 0;
            
            // Month (Mdr) column
            const mdrCell = headerRow.getCell(colIndex);
            mdrCell.value = currentLanguage === 'da' ? `${month} Mdr` : `${month} Mo.`;
            mdrCell.font = { bold: true, size: 10, color: { argb: 'FF' + colors.headerText } };
            mdrCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colors.headerBg } };
            mdrCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            mdrCell.border = {
                top: { style: 'medium' }, bottom: { style: 'medium' },
                left: { style: 'thin' }, right: { style: 'thin' }
            };
            
            // 14-day column
            const dag14Cell = headerRow.getCell(colIndex + 1);
            dag14Cell.value = currentLanguage === 'da' ? `${month} 14.Dag` : `${month} 14.Day`;
            dag14Cell.font = { bold: true, size: 10, color: { argb: 'FF' + colors.headerText } };
            dag14Cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colors.headerBg } };
            dag14Cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            dag14Cell.border = {
                top: { style: 'medium' }, bottom: { style: 'medium' },
                left: { style: 'thin' }, right: { style: 'thin' }
            };
            
            colIndex += 2;
        });
        
        let currentRow = 4; // Start after title, empty row, and headers
        
        // Income section header
        worksheet.mergeCells(`A${currentRow}:Z${currentRow}`);
        const incomeHeaderCell = worksheet.getCell(`A${currentRow}`);
        incomeHeaderCell.value = currentLanguage === 'da' ? '💰 INDTÆGTER' : '💰 INCOME';
        incomeHeaderCell.font = { bold: true, size: 13, color: { argb: 'FF' + colors.incomeText } };
        incomeHeaderCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colors.incomeHeader } };
        incomeHeaderCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
        incomeHeaderCell.border = {
            top: { style: 'medium' }, bottom: { style: 'thin' },
            left: { style: 'medium' }, right: { style: 'medium' }
        };
        worksheet.getRow(currentRow).height = 20;
        currentRow++;
        
        const incomeStartRow = currentRow;
        
        // Income rows
        data.income.forEach((row, idx) => {
            const dataRow = worksheet.getRow(currentRow);
            dataRow.height = 18;
            
            if (row.isCategory) {
                // Category row - spans all columns
                worksheet.mergeCells(`A${currentRow}:Z${currentRow}`);
                const catCell = worksheet.getCell(`A${currentRow}`);
                catCell.value = `  📂 ${row.name}`;
                catCell.font = { bold: true, italic: true, size: 10, color: { argb: 'FF' + colors.categoryText } };
                catCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colors.category } };
                catCell.alignment = { horizontal: 'left', vertical: 'middle' };
                catCell.border = {
                    left: { style: 'thin' }, right: { style: 'thin' }
                };
            } else {
                // Name cell
                const nameCell = dataRow.getCell(1);
                nameCell.value = row.name;
                nameCell.font = { size: 10 };
                nameCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colors.incomeData } };
                nameCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
                nameCell.border = {
                    top: { style: 'hair' }, bottom: { style: 'hair' },
                    left: { style: 'thin' }, right: { style: 'thin' }
                };
                
                // Faktiske cell
                const faktCell = dataRow.getCell(2);
                faktCell.value = parseFloat(row.faktiske) || 0;
                faktCell.numFmt = '#,##0.00';
                faktCell.font = { size: 10, color: { argb: 'FF' + colors.faktiskeText } };
                faktCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colors.faktiskeBg } };
                faktCell.alignment = { horizontal: 'right', vertical: 'middle' };
                faktCell.border = {
                    top: { style: 'hair' }, bottom: { style: 'hair' },
                    left: { style: 'thin' }, right: { style: 'thin' }
                };
                
                // Month columns
                let colIdx = 3;
                this.monthNames.forEach((month, mIdx) => {
                    const isEven = mIdx % 2 === 0;
                    const mdrBg = isEven ? colors.monthEven : colors.monthOdd;
                    const dag14Bg = isEven ? colors.month14Even : colors.month14Odd;
                    
                    // Mdr cell
                    const mdrCell = dataRow.getCell(colIdx);
                    mdrCell.value = parseFloat(row[month].mdr) || 0;
                    mdrCell.numFmt = '#,##0.00';
                    mdrCell.font = { size: 10, color: { argb: 'FF' + colors.incomeText } };
                    mdrCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + mdrBg } };
                    mdrCell.alignment = { horizontal: 'right', vertical: 'middle' };
                    mdrCell.border = {
                        top: { style: 'hair' }, bottom: { style: 'hair' },
                        left: { style: 'thin' }, right: { style: 'hair' }
                    };
                    
                    // 14-day cell
                    const dag14Cell = dataRow.getCell(colIdx + 1);
                    dag14Cell.value = parseFloat(row[month].dag14) || 0;
                    dag14Cell.numFmt = '#,##0.00';
                    dag14Cell.font = { size: 9, color: { argb: 'FF' + colors.incomeText } };
                    dag14Cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + dag14Bg } };
                    dag14Cell.alignment = { horizontal: 'right', vertical: 'middle' };
                    dag14Cell.border = {
                        top: { style: 'hair' }, bottom: { style: 'hair' },
                        left: { style: 'hair' }, right: { style: 'thin' }
                    };
                    
                    colIdx += 2;
                });
            }
            currentRow++;
        });
        
        const incomeEndRow = currentRow - 1;
        
        // Income totals row
        const incomeTotalRow = worksheet.getRow(currentRow);
        incomeTotalRow.height = 22;
        
        const incTotalName = incomeTotalRow.getCell(1);
        incTotalName.value = currentLanguage === 'da' ? 'TOTAL INDTÆGTER' : 'TOTAL INCOME';
        incTotalName.font = { bold: true, size: 11, color: { argb: 'FF' + colors.incomeText } };
        incTotalName.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colors.incomeTotal } };
        incTotalName.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
        incTotalName.border = {
            top: { style: 'medium' }, bottom: { style: 'medium' },
            left: { style: 'medium' }, right: { style: 'thin' }
        };
        
        // Faktiske total
        const incTotalFakt = incomeTotalRow.getCell(2);
        incTotalFakt.value = { formula: `SUMIF(B${incomeStartRow}:B${incomeEndRow},"<>"")",B${incomeStartRow}:B${incomeEndRow})` };
        incTotalFakt.numFmt = '#,##0.00';
        incTotalFakt.font = { bold: true, size: 11, color: { argb: 'FF' + colors.faktiskeText } };
        incTotalFakt.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colors.faktiskeBg } };
        incTotalFakt.alignment = { horizontal: 'right', vertical: 'middle' };
        incTotalFakt.border = {
            top: { style: 'medium' }, bottom: { style: 'medium' },
            left: { style: 'thin' }, right: { style: 'thin' }
        };
        
        // Month totals
        let colIdx = 3;
        this.monthNames.forEach((month, mIdx) => {
            const isEven = mIdx % 2 === 0;
            const mdrBg = isEven ? colors.monthEven : colors.monthOdd;
            const dag14Bg = isEven ? colors.month14Even : colors.month14Odd;
            const colLetter = this.getColumnLetter(colIdx);
            const col14Letter = this.getColumnLetter(colIdx + 1);
            
            // Mdr total
            const mdrTotal = incomeTotalRow.getCell(colIdx);
            mdrTotal.value = { formula: `SUMIF(${colLetter}${incomeStartRow}:${colLetter}${incomeEndRow},"<>""",${colLetter}${incomeStartRow}:${colLetter}${incomeEndRow})` };
            mdrTotal.numFmt = '#,##0.00';
            mdrTotal.font = { bold: true, size: 10, color: { argb: 'FF' + colors.incomeText } };
            mdrTotal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + mdrBg } };
            mdrTotal.alignment = { horizontal: 'right', vertical: 'middle' };
            mdrTotal.border = {
                top: { style: 'medium' }, bottom: { style: 'medium' },
                left: { style: 'thin' }, right: { style: 'hair' }
            };
            
            // 14-day total
            const dag14Total = incomeTotalRow.getCell(colIdx + 1);
            dag14Total.value = { formula: `SUMIF(${col14Letter}${incomeStartRow}:${col14Letter}${incomeEndRow},"<>""",${col14Letter}${incomeStartRow}:${col14Letter}${incomeEndRow})` };
            dag14Total.numFmt = '#,##0.00';
            dag14Total.font = { bold: true, size: 9, color: { argb: 'FF' + colors.incomeText } };
            dag14Total.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + dag14Bg } };
            dag14Total.alignment = { horizontal: 'right', vertical: 'middle' };
            dag14Total.border = {
                top: { style: 'medium' }, bottom: { style: 'medium' },
                left: { style: 'hair' }, right: { style: 'thin' }
            };
            
            colIdx += 2;
        });
        currentRow++;
        
        // Empty separator row
        worksheet.getRow(currentRow).height = 12;
        currentRow++;
        
        // Expenses section header
        worksheet.mergeCells(`A${currentRow}:Z${currentRow}`);
        const expenseHeaderCell = worksheet.getCell(`A${currentRow}`);
        expenseHeaderCell.value = currentLanguage === 'da' ? '💳 UDGIFTER' : '💳 EXPENSES';
        expenseHeaderCell.font = { bold: true, size: 13, color: { argb: 'FF' + colors.expenseText } };
        expenseHeaderCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colors.expenseHeader } };
        expenseHeaderCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
        expenseHeaderCell.border = {
            top: { style: 'medium' }, bottom: { style: 'thin' },
            left: { style: 'medium' }, right: { style: 'medium' }
        };
        worksheet.getRow(currentRow).height = 20;
        currentRow++;
        
        const expenseStartRow = currentRow;
        
        // Expense rows
        data.expenses.forEach((row, idx) => {
            const dataRow = worksheet.getRow(currentRow);
            dataRow.height = 18;
            
            if (row.isCategory) {
                // Category row
                worksheet.mergeCells(`A${currentRow}:Z${currentRow}`);
                const catCell = worksheet.getCell(`A${currentRow}`);
                catCell.value = `  📂 ${row.name}`;
                catCell.font = { bold: true, italic: true, size: 10, color: { argb: 'FF' + colors.categoryText } };
                catCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colors.category } };
                catCell.alignment = { horizontal: 'left', vertical: 'middle' };
                catCell.border = {
                    left: { style: 'thin' }, right: { style: 'thin' }
                };
            } else {
                // Name cell
                const nameCell = dataRow.getCell(1);
                nameCell.value = row.name;
                nameCell.font = { size: 10 };
                nameCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colors.expenseData } };
                nameCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
                nameCell.border = {
                    top: { style: 'hair' }, bottom: { style: 'hair' },
                    left: { style: 'thin' }, right: { style: 'thin' }
                };
                
                // Faktiske cell
                const faktCell = dataRow.getCell(2);
                faktCell.value = parseFloat(row.faktiske) || 0;
                faktCell.numFmt = '#,##0.00';
                faktCell.font = { size: 10, color: { argb: 'FF' + colors.faktiskeText } };
                faktCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colors.faktiskeBg } };
                faktCell.alignment = { horizontal: 'right', vertical: 'middle' };
                faktCell.border = {
                    top: { style: 'hair' }, bottom: { style: 'hair' },
                    left: { style: 'thin' }, right: { style: 'thin' }
                };
                
                // Month columns
                let colIdx = 3;
                this.monthNames.forEach((month, mIdx) => {
                    const isEven = mIdx % 2 === 0;
                    const mdrBg = isEven ? colors.monthEven : colors.monthOdd;
                    const dag14Bg = isEven ? colors.month14Even : colors.month14Odd;
                    
                    // Mdr cell
                    const mdrCell = dataRow.getCell(colIdx);
                    mdrCell.value = parseFloat(row[month].mdr) || 0;
                    mdrCell.numFmt = '#,##0.00';
                    mdrCell.font = { size: 10, color: { argb: 'FF' + colors.expenseText } };
                    mdrCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + mdrBg } };
                    mdrCell.alignment = { horizontal: 'right', vertical: 'middle' };
                    mdrCell.border = {
                        top: { style: 'hair' }, bottom: { style: 'hair' },
                        left: { style: 'thin' }, right: { style: 'hair' }
                    };
                    
                    // 14-day cell
                    const dag14Cell = dataRow.getCell(colIdx + 1);
                    dag14Cell.value = parseFloat(row[month].dag14) || 0;
                    dag14Cell.numFmt = '#,##0.00';
                    dag14Cell.font = { size: 9, color: { argb: 'FF' + colors.expenseText } };
                    dag14Cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + dag14Bg } };
                    dag14Cell.alignment = { horizontal: 'right', vertical: 'middle' };
                    dag14Cell.border = {
                        top: { style: 'hair' }, bottom: { style: 'hair' },
                        left: { style: 'hair' }, right: { style: 'thin' }
                    };
                    
                    colIdx += 2;
                });
            }
            currentRow++;
        });
        
        const expenseEndRow = currentRow - 1;
        
        // Expense totals row
        const expenseTotalRow = worksheet.getRow(currentRow);
        expenseTotalRow.height = 22;
        
        const expTotalName = expenseTotalRow.getCell(1);
        expTotalName.value = currentLanguage === 'da' ? 'TOTAL UDGIFTER' : 'TOTAL EXPENSES';
        expTotalName.font = { bold: true, size: 11, color: { argb: 'FF' + colors.expenseText } };
        expTotalName.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colors.expenseTotal } };
        expTotalName.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
        expTotalName.border = {
            top: { style: 'medium' }, bottom: { style: 'medium' },
            left: { style: 'medium' }, right: { style: 'thin' }
        };
        
        // Faktiske total
        const expTotalFakt = expenseTotalRow.getCell(2);
        expTotalFakt.value = { formula: `SUMIF(B${expenseStartRow}:B${expenseEndRow},"<>""",B${expenseStartRow}:B${expenseEndRow})` };
        expTotalFakt.numFmt = '#,##0.00';
        expTotalFakt.font = { bold: true, size: 11, color: { argb: 'FF' + colors.faktiskeText } };
        expTotalFakt.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colors.faktiskeBg } };
        expTotalFakt.alignment = { horizontal: 'right', vertical: 'middle' };
        expTotalFakt.border = {
            top: { style: 'medium' }, bottom: { style: 'medium' },
            left: { style: 'thin' }, right: { style: 'thin' }
        };
        
        // Month totals
        colIdx = 3;
        this.monthNames.forEach((month, mIdx) => {
            const isEven = mIdx % 2 === 0;
            const mdrBg = isEven ? colors.monthEven : colors.monthOdd;
            const dag14Bg = isEven ? colors.month14Even : colors.month14Odd;
            const colLetter = this.getColumnLetter(colIdx);
            const col14Letter = this.getColumnLetter(colIdx + 1);
            
            // Mdr total
            const mdrTotal = expenseTotalRow.getCell(colIdx);
            mdrTotal.value = { formula: `SUMIF(${colLetter}${expenseStartRow}:${colLetter}${expenseEndRow},"<>""",${colLetter}${expenseStartRow}:${colLetter}${expenseEndRow})` };
            mdrTotal.numFmt = '#,##0.00';
            mdrTotal.font = { bold: true, size: 10, color: { argb: 'FF' + colors.expenseText } };
            mdrTotal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + mdrBg } };
            mdrTotal.alignment = { horizontal: 'right', vertical: 'middle' };
            mdrTotal.border = {
                top: { style: 'medium' }, bottom: { style: 'medium' },
                left: { style: 'thin' }, right: { style: 'hair' }
            };
            
            // 14-day total
            const dag14Total = expenseTotalRow.getCell(colIdx + 1);
            dag14Total.value = { formula: `SUMIF(${col14Letter}${expenseStartRow}:${col14Letter}${expenseEndRow},"<>""",${col14Letter}${expenseStartRow}:${col14Letter}${expenseEndRow})` };
            dag14Total.numFmt = '#,##0.00';
            dag14Total.font = { bold: true, size: 9, color: { argb: 'FF' + colors.expenseText } };
            dag14Total.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + dag14Bg } };
            dag14Total.alignment = { horizontal: 'right', vertical: 'middle' };
            dag14Total.border = {
                top: { style: 'medium' }, bottom: { style: 'medium' },
                left: { style: 'hair' }, right: { style: 'thin' }
            };
            
            colIdx += 2;
        });
        
        const expenseTotalRowNum = currentRow;
        currentRow++;
        
        // Empty separator row
        worksheet.getRow(currentRow).height = 12;
        currentRow++;
        
        // Net balance row
        const netBalanceRow = worksheet.getRow(currentRow);
        netBalanceRow.height = 24;
        
        const netBalanceName = netBalanceRow.getCell(1);
        netBalanceName.value = currentLanguage === 'da' ? '💰 NETTO RESULTAT' : '💰 NET RESULT';
        netBalanceName.font = { bold: true, size: 12, color: { argb: 'FF1A365D' } };
        netBalanceName.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEDF5FF' } };
        netBalanceName.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
        netBalanceName.border = {
            top: { style: 'double' }, bottom: { style: 'double' },
            left: { style: 'medium' }, right: { style: 'thin' }
        };
        
        // Faktiske balance
        const netBalanceFakt = netBalanceRow.getCell(2);
        netBalanceFakt.value = { formula: `B${incomeTotalRowNum}-B${expenseTotalRowNum}` };
        netBalanceFakt.numFmt = '#,##0.00';
        netBalanceFakt.font = { bold: true, size: 11, color: { argb: 'FF1A365D' } };
        netBalanceFakt.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F9FF' } };
        netBalanceFakt.alignment = { horizontal: 'right', vertical: 'middle' };
        netBalanceFakt.border = {
            top: { style: 'double' }, bottom: { style: 'double' },
            left: { style: 'thin' }, right: { style: 'thin' }
        };
        
        // Month balances
        colIdx = 3;
        this.monthNames.forEach((month, mIdx) => {
            const colLetter = this.getColumnLetter(colIdx);
            const col14Letter = this.getColumnLetter(colIdx + 1);
            
            // Mdr balance
            const mdrBalance = netBalanceRow.getCell(colIdx);
            mdrBalance.value = { formula: `${colLetter}${incomeTotalRowNum}-${colLetter}${expenseTotalRowNum}` };
            mdrBalance.numFmt = '#,##0.00';
            mdrBalance.font = { bold: true, size: 10, color: { argb: 'FF1A365D' } };
            mdrBalance.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F9FF' } };
            mdrBalance.alignment = { horizontal: 'right', vertical: 'middle' };
            mdrBalance.border = {
                top: { style: 'double' }, bottom: { style: 'double' },
                left: { style: 'thin' }, right: { style: 'hair' }
            };
            
            // 14-day balance
            const dag14Balance = netBalanceRow.getCell(colIdx + 1);
            dag14Balance.value = { formula: `${col14Letter}${incomeTotalRowNum}-${col14Letter}${expenseTotalRowNum}` };
            dag14Balance.numFmt = '#,##0.00';
            dag14Balance.font = { bold: true, size: 9, color: { argb: 'FF1A365D' } };
            dag14Balance.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F9FF' } };
            dag14Balance.alignment = { horizontal: 'right', vertical: 'middle' };
            dag14Balance.border = {
                top: { style: 'double' }, bottom: { style: 'double' },
                left: { style: 'hair' }, right: { style: 'thin' }
            };
            
            colIdx += 2;
        });
        
        currentRow++;
        
        // Footer note
        currentRow += 2;
        worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
        const noteCell = worksheet.getCell(`A${currentRow}`);
        noteCell.value = currentLanguage === 'da' ? '* Faktiske = Faktiske værdier fra den valgte konto' : '* Actuals = Actual values from selected account';
        noteCell.font = { italic: true, size: 9, color: { argb: 'FF5D4E37' } };
        noteCell.alignment = { horizontal: 'left', vertical: 'middle' };
        currentRow++;
        
        // Empty row
        worksheet.getRow(currentRow).height = 10;
        currentRow++;
        
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
            if (typeof showToast === 'function') {
                showToast(currentLanguage === 'da' ? 'Fejl ved generering af Excel-fil. Prøv igen.' : 'Error generating Excel file. Please try again.', 'error');
            } else {
                alert(currentLanguage === 'da' ? 'Fejl ved generering af Excel-fil. Prøv igen.' : 'Error generating Excel file. Please try again.');
            }
        }
        
        return filename;
    }
    
    // Helper function to convert column index to Excel column letter
    getColumnLetter(colIdx) {
        let letter = '';
        while (colIdx > 0) {
            const remainder = (colIdx - 1) % 26;
            letter = String.fromCharCode(65 + remainder) + letter;
            colIdx = Math.floor((colIdx - 1) / 26);
        }
        return letter;
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
        csv += currentLanguage === 'da' ? 'Navn,Faktiske' : 'Name,Actuals';
        const monthNamesDA = currentLanguage === 'da' ? ['Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'December'] : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        monthNamesDA.forEach(month => {
            csv += currentLanguage === 'da' ? `,${month} Mdr.,${month} 14.Dag` : `,${month} Mo.,${month} 14.Day`;
        });
        csv += '\n';
        
        // Income
        csv += currentLanguage === 'da' ? 'INDTÆGTER\n' : 'INCOME\n';
        data.income.forEach(row => {
            csv += `"${row.name}",${row.faktiske}`;
            this.monthNames.forEach(month => {
                csv += `,${row[month].mdr},${row[month].dag14}`;
            });
            csv += '\n';
        });
        
        csv += '\n';
        
        // Expenses
        csv += currentLanguage === 'da' ? 'UDGIFTER\n' : 'EXPENSES\n';
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
