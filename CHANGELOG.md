# 📋 Changelog - ABC & EOQ Dashboard

## Version 2.1 - Budget Management Edition (November 2025)

### 🎉 Major New Features

#### 1. 💰 Multi-Account Budget Management System
**Track expenses across two bank accounts:**
- **Budget Account:**
  - Fixed expenses (rent, subscriptions, bills)
  - Payment day: Last day of month
  - Receives transfers from Daily Use account
- **Daily Use Account:**
  - All income deposited here first
  - Variable expenses (groceries, entertainment)
  - Transfers money to Budget account as needed

**Account Selector:**
- Dropdown in each budget row
- Select "Budget" or "Daily Use" for every income/expense
- Visual indicators: [B] and [D] in Excel exports
- Persistent storage per row

**Benefits:** Clear separation of fixed vs variable finances. Know exactly what stays in each account.

---

#### 2. 🤖 Smart Transfer Recommendation System
**AI-powered transfer calculations:**
- **Required Transfer:**
  - Sum of all Budget Account expenses
  - Shows minimum amount needed to cover fixed bills
- **Advised Transfer:**
  - Required amount + 90th percentile buffer
  - Based on historical variance analysis
  - Accounts for actual vs budgeted differences
- **Learning System:**
  - Tracks variance every month (actual - budgeted)
  - First year: Manually add safety buffer
  - Second year: System recommends buffer automatically
  - Uses 90th percentile statistical approach

**Visual Dashboard:**
- 3-card layout showing Budget Account, Daily Use, and Summary
- Real-time calculations update as you edit budget
- Color-coded status indicators
- Historical data badge when recommendations are available

**Benefits:** Never overdraft your budget account. System learns your spending patterns and adjusts recommendations.

---

#### 3. 📊 Enhanced Excel Export with Account Breakdown
**Professional budget reports:**
- **Header Section:**
  - Title: Budget {Year}
  - Legend: [B] = Budget Konto | [D] = Daglig Brug Konto
- **Account Indicators:**
  - Each row shows [B] or [D] prefix on name
  - Easy to see which account covers each expense
- **New Section: Account Transfer Recommendations**
  - Påkrævet Overførsel (Required Transfer)
  - Daglig Indtægt (Daily Income)
  - Daglig Udgifter (Daily Expenses)
  - Tilbage på Daglig (Remaining in Daily Account)
  - Calculated per month with proper formulas
- **Formula Integration:**
  - SUM formulas for income/expense totals
  - Subtraction formulas for balances
  - Account-filtered calculations
- **Color Coding:**
  - 12 paired colors (base + 30% lighter for 14-day columns)
  - Gradient blue headers
  - Frozen panes for easy scrolling

**Benefits:** Export complete budget with account breakdown. Share with family or accountant.

---

#### 4. 🔢 Flexible Number Formatting System
**Multiple format options with currency symbols:**
- **Format Types:**
  - 🇩🇰 Danish: 20.000,00 (space separator, comma decimal)
  - 🇺🇸 US: 20,000.00 (comma separator, dot decimal)
  - 🌐 Space: 20 000.00 (space separator, dot decimal)
  - 🇮🇳 Indian: 20,000.00 (lakh/crore grouping)
- **Currency Symbols:**
  - DKK (kr) - Danish Krone
  - USD ($) - US Dollar
  - EUR (€) - Euro
  - GBP (£) - British Pound
  - Custom symbol option
- **Persistent Settings:**
  - Saved to localStorage
  - Applied to all budget displays
  - Separate dropdown controls

**Benefits:** Use your preferred number format. Supports international teams.

---

#### 5. 📈 Historical Variance Tracking
**Learn from actual spending patterns:**
- **Data Structure:**
  - Stores per-year, per-month variance data
  - Each item tracks: actual - budgeted amount
  - Includes timestamp for audit trail
- **90th Percentile Calculation:**
  - Sorts all historical variances
  - Takes 90th percentile value
  - Used as buffer recommendation
  - Accounts for occasional high spending
- **Account Filtering:**
  - Calculate variance separately for Budget vs Daily accounts
  - Each account has independent recommendations
- **Storage:**
  - localStorage key: homeBudgetVariance
  - Structure: { years: { 2025: { jan: { income: [], expenses: [] } } } }

**Benefits:** System becomes smarter over time. Recommendations improve with more data.

---

#### 6. 🎨 Improved Budget Table Layout
**Better spacing and usability:**
- **Name Column:**
  - Increased width: 300-500px
  - Min-width on inputs: 200px
  - Flex layout for icon + name + account selector
- **Account Dropdown:**
  - Fixed width: 85px
  - Flex-shrink: 0 (prevents compression)
  - Styled consistently with inputs
- **Auto-expanding Inputs:**
  - Name fields expand for long text
  - Number fields maintain proper width
  - Prevents text truncation
- **Faktiske Column:**
  - Set width: 100-120px
  - Consistent sizing across all rows

**Benefits:** No more cut-off text. Easy to read long expense names.

---

### 🎨 UI/UX Improvements

#### Visual Enhancements
- **Account Transfer Dashboard:** 3-card gradient layout with icons
- **Account Selector Dropdown:** Clean styling matching input fields
- **Status Badges:** "Based on historical data" vs "No history yet" indicators
- **Color-coded Cards:** Budget (blue), Daily (green), Summary (purple)
- **Smooth Animations:** Updates recalculate instantly as you type

#### Responsive Design
- Dashboard cards stack on mobile
- Table scrolls horizontally on small screens
- Account selectors remain accessible on all devices
- Touch-friendly dropdowns

#### Accessibility
- Account selector labeled with aria-labels
- Keyboard navigation supported
- High contrast in dark mode
- Screen reader friendly

---

### 🛠️ Technical Improvements

#### Architecture Changes
- **BudgetStorage Class:**
  - Added `varianceData` property and methods
  - `recordVariance(year, month)` - Store monthly variance
  - `getHistoricalVariances(account, limit)` - Retrieve past data
  - `calculate90thPercentileVariance(account)` - Statistical calculation
  - `getAdvisedAmount(budgeted, account)` - Recommendation engine
- **BudgetEditor Class:**
  - `calculateAccountTotals(month)` - Per-account income/expense sums
  - `calculateTransferRecommendation(month)` - Transfer logic
  - `renderAccountDashboard()` - Update UI with calculations
  - Enhanced `createTableRow()` - Add account selector to each row
- **BudgetExport Class:**
  - Enhanced `exportToExcel()` - Account indicators and transfer section
  - ExcelJS formula integration
  - Paired color scheme for 14-day columns

#### Performance
- Efficient account filtering in calculations
- Debounced UI updates on input changes
- Lazy variance calculation (only when historical data exists)
- Minimal localStorage writes

#### Code Quality
- All new functions documented
- Consistent naming conventions
- Full Danish/English translations (17 new keys)
- Error handling for missing data

---

### 📚 Documentation Updates

#### New Translation Keys (17 total)
- `budget-account-daily` / `budget-account-budget`
- `budget-transfer-title` / `budget-transfer-required` / `budget-transfer-advised`
- `budget-transfer-based-on-history` / `budget-transfer-no-history`
- Dashboard labels for income, expenses, balance, remaining
- Account-specific labels

#### README Updates
- Budget Management section added
- Feature comparison updated
- System requirements unchanged

---

### 🐛 Bug Fixes

#### Name Column Text Truncation (v2.0 → v2.1)
- **Issue:** Adding account selector caused "Budget Income" and "Budget Expense" text to be cut off
- **Cause:** Name column too narrow for icon + input + dropdown
- **Fix:** Increased first column width to 300-500px, added flex properties
- **Result:** ✅ All text displays fully, inputs auto-expand for long names

---

### 🔮 Future Considerations

Potential enhancements for v2.2:
- Multiple budget account support (more than 2 accounts)
- Manual variance entry for special cases
- Month-by-month transfer history view
- Transfer history reporting and charts
- Budget vs actual comparison graphs
- Automated payment reminders
- Bank account balance tracking
- Integration with actual bank transaction data

---

### 📊 Feature Comparison

| Feature | v2.0 | v2.1 |
|---------|------|------|
| ABC Analysis | ✅ | ✅ |
| Wilson EOQ | ✅ | ✅ |
| LEAN Tools | ✅ | ✅ |
| Custom Pages | ✅ | ✅ |
| Dashboard | ✅ | ✅ |
| **Budget Management** | ❌ | ✅ |
| **Multi-Account Tracking** | ❌ | ✅ |
| **Transfer Recommendations** | ❌ | ✅ |
| **Historical Variance Learning** | ❌ | ✅ |
| **Number Formatting Options** | ❌ | ✅ |
| **Enhanced Excel Export** | ✅ | ✅✅ |
| **Account Breakdown in Excel** | ❌ | ✅ |

---

### 📦 File Changes

#### Modified Files
- `budget-storage.js` (+150 lines) - Variance tracking and account logic
- `budget-editor.js` (+200 lines) - Account selector, transfer calculations, dashboard
- `budget-export.js` (+120 lines) - Account indicators, transfer section in Excel
- `index.html` (+150 lines) - Account dashboard cards, improved table styling
- `script.js` (+50 lines) - 17 new translation keys (DA + EN)

#### New Storage Keys
- `homeBudgetVariance` - Historical variance data for recommendations

#### Total Project Size
- **v2.0:** ~70 KB (6 files)
- **v2.1:** ~90 KB (6 files + enhanced features)

---

## Version 2.0 - Enhanced Edition (2025)

### 🎉 Major New Features

#### 1. 📊 Dashboard Overview
**New landing page with real-time metrics:**
- **Metric Cards:**
  - Total Items count
  - Total Value sum
  - A-Items count
  - Last Analysis timestamp
- **Quick Actions Panel:**
  - Direct shortcuts to ABC Analysis, View Data, Export, and Compare
- **Top 5 Items Display:**
  - Automatically shows highest-value items after analysis
  - Color-coded ABC badges

**Benefits:** Instant overview of your inventory analysis without navigating through tabs.

---

#### 2. 🎯 Drag & Drop File Upload
**Intuitive file upload experience:**
- **Visual Drag Zone:**
  - Drag files directly from file explorer
  - Hover effect with visual feedback
  - "Dragover" state indication
- **File Info Display:**
  - Filename shown after upload
  - File size display (KB)
  - Remove file option
- **Multiple Upload Points:**
  - Main ABC analysis section
  - Comparative analysis (2 drop zones)

**Benefits:** Faster, more intuitive file upload. No need to browse through file dialogs.

---

#### 3. ✅ Data Quality Validation
**Automatic data quality checks:**
- **Quality Score (0-100):**
  - Excellent (90-100): Green badge
  - Good (70-89): Blue badge
  - Warning (50-69): Yellow badge
  - Poor (0-49): Red badge

- **Issue Detection:**
  - ✓ Duplicate item names (-20 points)
  - ✓ Zero values in consumption/price (-15 points)
  - ✓ Missing data fields (-30 points)
  - ✓ Statistical outliers (3σ threshold, -10 points)

- **Visual Display:**
  - Quality card shown before analysis
  - List of specific issues found
  - Actionable recommendations

**Benefits:** Identify data problems before running analysis, ensuring accurate results.

---

#### 4. 👁️ View Uploaded Data
**New "View Data" functionality:**
- **Data Modal:**
  - Full-screen modal dialog
  - Scrollable table view
  - Shows all uploaded rows
- **Columns Displayed:**
  - Row number
  - Item name
  - Consumption
  - Price
  - Calculated value
- **Easy Access:**
  - Dashboard quick action button
  - Available before running analysis

**Benefits:** Review your data before analyzing. Catch errors early.

---

#### 5. 📥 Export to Excel (XLSX)
**Professional Excel export:**
- **Multiple Sheets:**
  - Sheet 1: Full ABC Analysis results
  - Sheet 2: Summary statistics
- **Formatted Output:**
  - Bold headers
  - Proper column widths
  - All ABC classifications
  - Cumulative percentages
- **Summary Includes:**
  - Total items
  - Total value
  - A/B/C item counts
  - Analysis date/time
- **File Naming:**
  - Auto-generated: `ABC_Analysis_YYYY-MM-DD.xlsx`

**Benefits:** Professional reports ready for sharing with management or import into other systems.

---

#### 6. 📈 Comparative ABC Analysis
**Side-by-side period comparison:**
- **Two-Period Upload:**
  - Period 1 (Baseline)
  - Period 2 (Comparison)
  - Separate drag-drop zones
- **Automatic Analysis:**
  - Runs ABC on both datasets
  - Calculates changes
  - Identifies trends
- **Comparison Metrics:**
  - Items Change (+/-)
  - Value Change (+/-)
  - A-Items Change (+/-)
- **Detailed Comparison Table:**
  - Shows each item's classification in both periods
  - Value changes with arrows (⬆️⬇️)
  - New items (🆕) and removed items (❌)
  - Trend indicators

**Benefits:** Track inventory changes over time. Identify shifting priorities.

---

#### 7. ⚙️ Customizable ABC Thresholds
**Flexible classification boundaries:**
- **Preset Options:**
  - 🎯 Tight (60/30/10): Stricter A-class criteria
  - 📊 Standard (80/15/5): Classic Pareto principle
  - 🌊 Relaxed (70/20/10): Broader A-class inclusion
- **Custom Input:**
  - Manual adjustment of A% and B%
  - C% calculated automatically
  - Real-time validation (must sum to 100%)
- **Persistent Storage:**
  - Settings saved to localStorage
  - Applied to all future analyses

**Benefits:** Adapt classification to your business needs. Different industries have different priorities.

---

#### 8. 📊 Enhanced Wilson EOQ Graph
**Interactive visualization improvements:**
- **Plotly.js Features:**
  - Zoom and pan controls
  - Hover tooltips with exact values
  - Legend toggle (show/hide curves)
  - Full-screen mode
- **Export Options:**
  - Download as PNG
  - Download as SVG
  - Copy to clipboard
- **Curve Customization:**
  - Toggle holding cost curve
  - Toggle ordering cost curve
  - Toggle total cost curve
  - Highlight EOQ point

**Benefits:** Better understanding of cost relationships. Export graphs for presentations.

---

#### 9. ⌨️ Keyboard Shortcuts
**Power-user productivity features:**

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+U` | Upload File | Opens file picker |
| `Alt+D` | Dashboard | Switch to Dashboard tab |
| `Alt+A` | ABC Analysis | Switch to ABC tab |
| `Alt+W` | Wilson EOQ | Switch to Wilson tab |
| `Alt+S` | Settings | Switch to Settings tab |
| `Ctrl+E` | Export Excel | Download current results |

**Benefits:** Navigate faster. Professional workflow for frequent users.

---

### 🎨 UI/UX Improvements

#### Visual Enhancements
- **Metric Cards:** Hover animations with lift effect
- **File Drop Zones:** Smooth color transitions on hover/drag
- **Quality Badges:** Color-coded with dark theme support
- **Toast Notifications:** Slide-in animations for user feedback
- **Modal Dialogs:** Backdrop blur and smooth transitions

#### Responsive Design
- All new features work on mobile/tablet
- Grid layouts adapt to screen size
- Touch-friendly drag-drop zones
- Modal dialogs scale appropriately

#### Dark Theme Support
- All new components support dark mode
- Proper contrast ratios maintained
- Quality badges invert colors appropriately
- Modal backgrounds use theme colors

---

### 🛠️ Technical Improvements

#### Architecture
- **Modular Functions:** Each feature is self-contained
- **Event Delegation:** Efficient event handling
- **Memory Management:** Charts destroyed before recreation
- **Error Handling:** Graceful fallbacks for all operations

#### Performance
- **Lazy Initialization:** Features load only when needed
- **Debounced Validations:** Threshold checks optimized
- **Efficient DOM Updates:** Minimal reflows/repaints
- **Smart Caching:** localStorage for preferences

#### Code Quality
- **Consistent Naming:** All functions follow camelCase
- **Comments:** Every major section documented
- **Translations:** All UI strings in translation objects
- **Validation:** Input sanitization and type checking

---

### 📚 Documentation Updates

#### New Translation Keys
- 40+ new Danish translations
- 40+ new English translations
- Dashboard section fully localized
- Compare section fully localized
- Settings thresholds localized

#### README Updates
- All new features documented
- Usage examples added
- Keyboard shortcuts table
- Troubleshooting section expanded

---

### 🐛 Bug Fixes

#### Tab Navigation (v1.0 → v2.0)
- **Issue:** Wilson and Settings tabs not opening
- **Cause:** `switchTab()` function expected event parameter but didn't receive it
- **Fix:** Modified function to accept explicit button reference
- **Result:** ✅ All tabs now work correctly

#### File Upload Display
- Enhanced with visual feedback
- Shows filename and size immediately
- Proper error handling for unsupported formats

---

### 🔮 Future Considerations (Not Implemented Yet)

These were suggested but can be added later:
- Multi-file batch processing
- Historical analysis trends (charts over time)
- Advanced filtering in results table
- Print-optimized layouts
- PDF export (requires additional library)
- Data import from databases
- API integration options

---

### 📊 Feature Comparison

| Feature | v1.0 | v2.0 |
|---------|------|------|
| ABC Analysis | ✅ | ✅ |
| Wilson EOQ | ✅ | ✅ |
| CSV Upload | ✅ | ✅ |
| Excel Upload | ✅ | ✅ |
| Pareto Chart | ✅ | ✅ |
| Pie Chart | ✅ | ✅ |
| Theme Switch | ✅ | ✅ |
| Language Switch | ✅ | ✅ |
| **Dashboard** | ❌ | ✅ |
| **Drag & Drop** | ❌ | ✅ |
| **Data Quality Check** | ❌ | ✅ |
| **View Data** | ❌ | ✅ |
| **Export Excel** | ❌ | ✅ |
| **Compare Analysis** | ❌ | ✅ |
| **Custom Thresholds** | ❌ | ✅ |
| **Enhanced Wilson Graph** | ❌ | ✅ |
| **Keyboard Shortcuts** | ❌ | ✅ |

---

### 📦 File Changes

#### Modified Files
- `index.html` (+300 lines) - Added Dashboard, Compare sections, modals
- `script.js` (+700 lines) - All new features implemented
- `style.css` (+250 lines) - New component styles, animations

#### New Files
- `CHANGELOG.md` (this file) - Version history
- `example_inventory.csv` - Sample data (enhanced)
- `example_inventory.xlsx` - Sample data (Excel format)

#### Total Project Size
- **v1.0:** ~15 KB (3 files)
- **v2.0:** ~70 KB (6 files + documentation)

---

### 🎓 Migration Guide (v1.0 → v2.0)

#### No Breaking Changes
All v1.0 functionality remains intact. Your existing workflows will work exactly as before.

#### New Default Behavior
- Dashboard is now the default landing page
- ABC thresholds default to 80/15/5 (Standard preset)
- Quality checks run automatically before analysis

#### Backward Compatibility
- Old CSV files work without changes
- localStorage settings are preserved
- Existing bookmarks still work

---

## Version 1.0 - Initial Release

### Features
- ✅ ABC Analysis with file upload
- ✅ Wilson EOQ calculator
- ✅ Pareto and Pie charts
- ✅ Light/Dark theme
- ✅ Danish/English language
- ✅ CSV and Excel support
- ✅ LocalStorage persistence
- ✅ Responsive design
- ✅ No server required (100% local)

### Known Issues (Fixed in v2.0)
- ~~Tab navigation bug (Wilson/Settings)~~
- ~~No data preview before analysis~~
- ~~No comparison between periods~~
- ~~Fixed ABC thresholds (80/15/5)~~

---

## Upgrade Instructions

### From v1.0 to v2.0

**Option 1: Replace Files**
1. Backup your current project folder
2. Replace `index.html`, `script.js`, `style.css` with new versions
3. Open `index.html` in browser
4. Your settings will be preserved (localStorage)

**Option 2: Fresh Install**
1. Download v2.0 files
2. Open in a new folder
3. Transfer any custom CSV files you created

**No Data Loss**
All data is processed locally. No database migrations needed.

---

**Developed with ❤️ for ABC & Wilson**  
**Version 2.0 - Enhanced Edition**  
**Released: 2025**
