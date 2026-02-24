// ========================================
// Custom Formula Pages System
// Fully customizable logistics calculator builder
// ========================================

// Global variables for custom pages
let customPages = [];
let currentEditingPageId = null;
let inputCounter = 0;
let formulaCounter = 0;
let simulationIntervalId = null;

// Helper function to get translated template text
function getTemplateTranslation(translationKey, fallbackText) {
    const currentLang = localStorage.getItem('language') || 'en';
    if (typeof translations !== 'undefined' && translations[currentLang] && translations[currentLang][translationKey]) {
        return translations[currentLang][translationKey];
    }
    return fallbackText;
}

// Helper function to access translations from main script
function translate(key) {
    let translated;
    
    // Access the parent window's translate function if available
    if (window.parent && window.parent !== window && typeof window.parent.translate === 'function') {
        translated = window.parent.translate(key);
        if (translated !== key) return translated;
    }
    
    // Try to find translate in global scope (same window)
    if (window.translations && window.currentLanguage) {
        translated = window.translations[window.currentLanguage][key];
        if (translated) return translated;
    }
    
    // Fallback: Convert key to human-readable text
    // budget-income-name → Budget Income Name
    // custom-page-title → Custom Page Title
    return key
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Auto-translate field labels for templates
function autoTranslateLabel(englishLabel) {
    const currentLang = localStorage.getItem('language') || 'en';
    if (currentLang === 'en' || !englishLabel) return englishLabel;
    
    // Danish translations map
    const da = {
        // Logistics & Inventory (existing)
        'Annual Demand (D)': 'Årlig Efterspørgsel (D)', 'Order Cost (S)': 'Ordreomkostning (S)', 'Holding Cost %': 'Lageromkostning %', 'Holding Cost (H)': 'Lageromkostning (H)', 'Unit Price': 'Enhedspris', 'Optimal Order Quantity': 'Optimal Ordremængde', 'Orders Per Year': 'Ordrer Pr. År', 'Total Annual Cost': 'Totale Årlige Omkostninger', 'Daily Demand': 'Daglig Efterspørgsel', 'Lead Time (days)': 'Leveringstid (dage)', 'Safety Stock': 'Sikkerhedslager', 'Lead Time Demand': 'Leveringstid Efterspørgsel', 'Reorder Point (ROP)': 'Genbestillingspunkt (ROP)', 'Average Daily Demand': 'Gennemsnitlig Daglig Efterspørgsel', 'Demand Std Dev': 'Efterspørgsel Std. Afv.', 'Service Level (Z-score)': 'Serviceniveau (Z-score)', 'Avg Lead Time Demand': 'Gns. Leveringstid Efterspørgsel', 'Total ROP': 'Total ROP', 'Item Value': 'Vareværdi', 'Total Inventory Value': 'Samlet Lagerværdi', 'Cumulative %': 'Kumulativ %', 'Value % of Total': 'Værdi % af Total', 'Is A Class': 'Er A Klasse', 'Is B Class': 'Er B Klasse', 'Is C Class': 'Er C Klasse', 'Order Quantity (EOQ)': 'Ordremængde (EOQ)', 'Minimum Level': 'Minimum Niveau', 'Maximum Level': 'Maksimum Niveau', 'Period 1 Demand': 'Periode 1 Efterspørgsel', 'Period 2 Demand': 'Periode 2 Efterspørgsel', 'Period 3 Demand': 'Periode 3 Efterspørgsel', 'Period 4 Demand': 'Periode 4 Efterspørgsel', '3-Period Moving Average': '3-Periode Glidende Gennemsnit', 'Next Period Forecast': 'Næste Periode Prognose', 'Fixed Costs': 'Faste Omkostninger', 'Variable Cost per Unit': 'Variable Omkostninger pr. Enhed', 'Selling Price per Unit': 'Salgspris pr. Enhed', 'Contribution Margin per Unit': 'Dækningsbidrag pr. Enhed', 'Contribution Margin %': 'Dækningsbidrag %', 'Break-Even Units': 'Break-Even Enheder', 'Break-Even Revenue': 'Break-Even Omsætning', 'Safety Margin (assuming 200 units sold)': 'Sikkerhedsmargen (antager 200 solgte enheder)', 'Cost of Goods Sold (Annual)': 'Vareomkostninger (Årligt)', 'Average Inventory Value': 'Gennemsnitlig Lagerværdi', 'Inventory Turnover Ratio': 'Lageromsætningsgrad', 'Days in Inventory': 'Dage i Lager', 'Weeks in Inventory': 'Uger i Lager', 'Purchase Price': 'Købspris', 'Shipping & Handling': 'Fragt & Håndtering', 'Installation Cost': 'Installationsomkostning', 'Annual Maintenance': 'Årlig Vedligeholdelse', 'Years of Use': 'Brugsår', 'Training Cost': 'Træningsomkostning', 'Initial Total Cost': 'Indledende Totale Omkostninger', 'Total Maintenance Cost': 'Totale Vedligeholdelsesomkostninger', 'Total Cost of Ownership': 'Totale Ejeromkostninger', 'Annual TCO': 'Årlig TCO', 'Available Hours per Day': 'Tilgængelige Timer pr. Dag', 'Cycle Time per Unit (minutes)': 'Cyklustid pr. Enhed (minutter)', 'Actual Daily Production': 'Faktisk Daglig Produktion', 'Working Days per Month': 'Arbejdsdage pr. Måned', 'Maximum Daily Capacity': 'Maksimal Daglig Kapacitet', 'Utilization Rate %': 'Udnyttelsesgrad %', 'Monthly Capacity': 'Månedlig Kapacitet', 'Spare Capacity per Day': 'Ledig Kapacitet pr. Dag', 'Order Processing Time (days)': 'Ordrebehandlingstid (dage)', 'Production Time (days)': 'Produktionstid (dage)', 'Quality Check Time (days)': 'Kvalitetskontrol Tid (dage)', 'Shipping Time (days)': 'Forsendelsestid (dage)', 'Total Lead Time': 'Samlet Leveringstid', 'Value-Add Time': 'Værditilvækst Tid', 'Non-Value-Add Time': 'Ikke-Værditilvækst Tid', 'Efficiency Ratio %': 'Effektivitetsforhold %', 'Pallet Length (m)': 'Palle Længde (m)', 'Pallet Width (m)': 'Palle Bredde (m)', 'Pallet Height (m)': 'Palle Højde (m)', 'Number of Pallets': 'Antal Paller', 'Aisle Width (m)': 'Gangareal (m)', 'Stack Height (levels)': 'Stakning Højde (niveauer)', 'Area per Pallet (m²)': 'Areal pr. Palle (m²)', 'Total Pallet Area (m²)': 'Samlet Palle Areal (m²)', 'Aisle Space (m²)': 'Gangareal (m²)', 'Total Warehouse Area (m²)': 'Samlet Lagerareal (m²)', 'Volume Capacity (m³)': 'Volumenkapacitet (m³)', 'Item 1 Value': 'Vare 1 Værdi', 'Item 2 Value': 'Vare 2 Værdi', 'Item 3 Value': 'Vare 3 Værdi', 'Item 4 Value': 'Vare 4 Værdi', 'Item 5 Value': 'Vare 5 Værdi', 'Total Value': 'Samlet Værdi', 'Item 1 %': 'Vare 1 %', 'Item 2 %': 'Vare 2 %', 'Item 3 %': 'Vare 3 %', 'Top 3 Combined Value': 'Top 3 Samlet Værdi', 'Top 3 Combined %': 'Top 3 Samlet %', 'Truck Capacity (kg)': 'Lastbil Kapacitet (kg)', 'Truck Volume (m³)': 'Lastbil Volumen (m³)', 'Total Cargo Weight (kg)': 'Samlet Last Vægt (kg)', 'Total Cargo Volume (m³)': 'Samlet Last Volumen (m³)', 'Cost per Trip': 'Omkostning pr. Tur', 'Weight Utilization %': 'Vægtudnyttelse %', 'Volume Utilization %': 'Volumenudnyttelse %', 'Limiting Factor': 'Begrænsende Faktor', 'Unused Weight (kg)': 'Ubrugt Vægt (kg)', 'Cost per kg': 'Omkostning pr. kg', 'Total SKUs': 'Totalt SKU\'er', 'A Class %': 'A Klasse %', 'B Class %': 'B Klasse %', 'A Class Counts/Year': 'A Klasse Optællinger/År', 'B Class Counts/Year': 'B Klasse Optællinger/År', 'C Class Counts/Year': 'C Klasse Optællinger/År', 'A Class SKUs': 'A Klasse SKU\'er', 'B Class SKUs': 'B Klasse SKU\'er', 'C Class SKUs': 'C Klasse SKU\'er', 'Total Counts/Year': 'Totale Optællinger/År', 'Daily Counts (260 days)': 'Daglige Optællinger (260 dage)', 'Weekly Counts': 'Ugentlige Optællinger', 'Avg Daily Demand': 'Gns. Daglig Efterspørgsel', 'Days Out of Stock': 'Dage Udsolgt', 'Profit Margin %': 'Overskudsgrad %', 'Customer Retention % Loss': 'Kundefastholdelse % Tab', 'Units Lost': 'Tabte Enheder', 'Revenue Lost': 'Tabt Omsætning', 'Profit Lost': 'Tabt Overskud', 'Customer Impact Cost': 'Kundeindvirkning Omkostning', 'Total Stockout Cost': 'Totale Udsolgt Omkostninger', 'Total Sales': 'Total Salg', 'Returned Units': 'Returnerede Enheder', 'Total Units Sold': 'Totalt Solgte Enheder', 'Avg Unit Cost': 'Gns. Enhedsomkostning', 'Processing Cost per Return': 'Behandlingsomkostning pr. Retur', 'Return Rate %': 'Returrate %', 'Return Value': 'Returværdi', 'Total Processing Cost': 'Total Behandlingsomkostning', 'Total Return Cost': 'Total Returomkostning', 'Return Impact on Sales %': 'Retur Indvirkning på Salg %', 'Component 1 Qty per Kit': 'Komponent 1 Antal pr. Kit', 'Component 1 Cost': 'Komponent 1 Omkostning', 'Component 2 Qty per Kit': 'Komponent 2 Antal pr. Kit', 'Component 2 Cost': 'Komponent 2 Omkostning', 'Assembly Labor Cost per Kit': 'Samlings Arbejdsomkostning pr. Kit', 'Number of Kits Needed': 'Antal Kit Nødvendige', 'Material Cost per Kit': 'Materialomkostning pr. Kit', 'Total Cost per Kit': 'Total Omkostning pr. Kit', 'Total Component 1 Needed': 'Total Komponent 1 Nødvendig', 'Total Component 2 Needed': 'Total Komponent 2 Nødvendig', 'Total Kitting Cost': 'Total Kitting Omkostning', 'Average Demand': 'Gennemsnitlig Efterspørgsel', 'Maximum Demand': 'Maksimum Efterspørgsel', 'Minimum Demand': 'Minimum Efterspørgsel', 'Standard Deviation': 'Standardafvigelse', 'Demand Range': 'Efterspørgselsområde', 'Coefficient of Variation %': 'Variationskoefficient %', 'Demand Volatility %': 'Efterspørgselsvolatilitet %', 'Upper Control Limit': 'Øvre Kontrolgrænse', 'Lower Control Limit': 'Nedre Kontrolgrænse', 'Total Distance (km)': 'Samlet Afstand (km)', 'Number of Stops': 'Antal Stop', 'Cost per km': 'Omkostning pr. km', 'Time per Stop (minutes)': 'Tid pr. Stop (minutter)', 'Average Speed (km/h)': 'Gennemsnitshastighed (km/t)', 'Total Route Cost': 'Total Rute Omkostning', 'Cost per Stop': 'Omkostning pr. Stop', 'Driving Time (hours)': 'Køretid (timer)', 'Stop Time (hours)': 'Stoptid (timer)', 'Total Time (hours)': 'Samlet Tid (timer)', 'Avg Distance per Stop (km)': 'Gns. Afstand pr. Stop (km)', 'Units Produced': 'Producerede Enheder', 'Hours Worked': 'Arbejdstimer', 'Number of Workers': 'Antal Arbejdere', 'Target Units/Hour': 'Mål Enheder/Time', 'Units per Hour': 'Enheder pr. Time', 'Units per Worker': 'Enheder pr. Arbejder', 'Efficiency %': 'Effektivitet %', 'Total Labor Hours': 'Totale Arbejdstimer', 'Labor Productivity': 'Arbejdsproduktivitet', 'On-Time Deliveries': 'Rettidige Leveringer', 'Total Deliveries': 'Totale Leveringer', 'Quality Score (0-100)': 'Kvalitetsscore (0-100)', 'Price Competitiveness (0-100)': 'Priskonkurrenceevne (0-100)', 'Response Time Score (0-100)': 'Svartid Score (0-100)', 'Delivery Reliability %': 'Leveringspålidelighed %', 'Overall Performance Score': 'Samlet Præstationsscore', 'Supplier Rating': 'Leverandørvurdering', 'Late Deliveries': 'Sene Leveringer', 'Late Delivery Rate %': 'Sen Leveringsrate %', 'Planned Production Time (min)': 'Planlagt Produktionstid (min)', 'Downtime (min)': 'Nedetid (min)', 'Ideal Cycle Time (min/unit)': 'Ideel Cyklustid (min/enhed)', 'Total Produced': 'Total Produceret', 'Good Units': 'Gode Enheder', 'Operating Time (min)': 'Driftstid (min)', 'Availability (%)': 'Tilgængelighed (%)', 'Performance (%)': 'Ydelse (%)', 'Quality (%)': 'Kvalitet (%)', 'OEE (%)': 'OEE (%)',
        // LEAN Manufacturing (NEW)
        'Current Changeover Time (min)': 'Nuværende Omstillingstid (min)', 'Target Changeover Time (min)': 'Måltidsomstilling (min)', 'Changeovers Per Year': 'Omstillinger pr. År', 'Hourly Labor Rate': 'Timeløn', 'Time Saved Per Changeover (min)': 'Tid Sparet pr. Omstilling (min)', 'Annual Time Saved (hours)': 'Årlig Tidsbesparelse (timer)', 'Annual Cost Savings': 'Årlige Omkostningsbesparelser', 'Reduction (%)': 'Reduktion (%)', 'Available Production Time (min/day)': 'Tilgængelig Produktionstid (min/dag)', 'Total Breaks (min/day)': 'Totale Pauser (min/dag)', 'Customer Demand (units/day)': 'Kundeefterspørgsel (enheder/dag)', 'Net Available Time (min)': 'Netto Tilgængelig Tid (min)', 'Takt Time (min/unit)': 'Takttid (min/enhed)', 'Takt Time (seconds/unit)': 'Takttid (sekunder/enhed)', 'Required Units Per Hour': 'Påkrævede Enheder pr. Time', 'Total Process Time (seconds)': 'Samlet Procestid (sekunder)', 'Takt Time (seconds)': 'Takttid (sekunder)', 'Cycle Time (seconds/unit)': 'Cyklustid (sekunder/enhed)', 'Difference from Takt (seconds)': 'Forskel fra Takt (sekunder)', 'Status': 'Status', 'Capacity Utilization (%)': 'Kapacitetsudnyttelse (%)', 'Value-Add Time (min)': 'Værditilvækst Tid (min)', 'Non-Value-Add Time (min)': 'Ikke-Værditilvækst Tid (min)', 'Queue/Wait Time (min)': 'Kø-/Ventetid (min)', 'Total Lead Time (min)': 'Samlet Gennemløbstid (min)', 'Total Lead Time (days)': 'Samlet Gennemløbstid (dage)', 'Value-Add Ratio (%)': 'Værditilvækst Forhold (%)', 'Process Efficiency (%)': 'Proceseffektivitet (%)', 'Team Members': 'Teammedlemmer', 'Event Duration (days)': 'Arrangement Varighed (dage)', 'Average Hourly Rate': 'Gennemsnitlig Timeløn', 'Annual Savings': 'Årlige Besparelser', 'Event Cost': 'Arrangement Omkostning', 'ROI (%)': 'ROI (%)', 'Payback Period (months)': 'Tilbagebetalingsperiode (måneder)', 'Net Annual Benefit': 'Årlig Nettofordel', 'Sort (Seiri) Score (0-5)': 'Sortere (Seiri) Score (0-5)', 'Set in Order (Seiton) Score (0-5)': 'Sæt i Orden (Seiton) Score (0-5)', 'Shine (Seiso) Score (0-5)': 'Rengøring (Seiso) Score (0-5)', 'Standardize (Seiketsu) Score (0-5)': 'Standardiser (Seiketsu) Score (0-5)', 'Sustain (Shitsuke) Score (0-5)': 'Oprethold (Shitsuke) Score (0-5)', 'Total Score': 'Total Score', 'Overall Score (%)': 'Samlet Score (%)', 'Average Score': 'Gennemsnitlig Score', 'Maturity Level (1-5)': 'Modenhedsniveau (1-5)', 'Daily Demand (units)': 'Daglig Efterspørgsel (enheder)', 'Safety Factor (%)': 'Sikkerhedsfaktor (%)', 'Container Size (units)': 'Containerstørrelse (enheder)', 'Demand During Lead Time': 'Efterspørgsel under Leveringstid', 'Total Inventory Needed': 'Samlet Lagerbehov', 'Number of Kanban Cards': 'Antal Kanban-kort', 'Product A Monthly Demand': 'Produkt A Månedlig Efterspørgsel', 'Product B Monthly Demand': 'Produkt B Månedlig Efterspørgsel', 'Working Days Per Month': 'Arbejdsdage pr. Måned', 'Shifts Per Day': 'Skift pr. Dag', 'Total Monthly Demand': 'Samlet Månedlig Efterspørgsel', 'Daily Product A': 'Daglig Produkt A', 'Daily Product B': 'Daglig Produkt B', 'Product A Ratio (%)': 'Produkt A Forhold (%)', 'Product B Ratio (%)': 'Produkt B Forhold (%)', 'Manual Time (seconds)': 'Manuel Tid (sekunder)', 'Machine Time (seconds)': 'Maskintid (sekunder)', 'Walk Time (seconds)': 'Gangtid (sekunder)', 'Total Cycle Time (seconds)': 'Samlet Cyklustid (sekunder)', 'Operator Utilization (%)': 'Operatørudnyttelse (%)', 'Machine Utilization (%)': 'Maskinudnyttelse (%)', 'Capacity vs Takt (%)': 'Kapacitet vs Takt (%)', 'Idle Time (seconds)': 'Tomgangstid (sekunder)', 'Demand Variability (Std Dev)': 'Efterspørgselsvariabilitet (Std. Afv.)', 'Replenishment Time (days)': 'Genopfyldningstid (dage)', 'Avg Demand During RT': 'Gns. Efterspørgsel under GT', 'Safety Buffer': 'Sikkerhedsbuffer', 'Total Buffer Size': 'Samlet Bufferstørrelse', 'Reorder Point': 'Genbestillingspunkt', 'Preparation Time (min)': 'Forberedelsestid (min)', 'Mounting/Removal Time (min)': 'Monterings-/Afmonteringstid (min)', 'Adjustment Time (min)': 'Justeringstid (min)', 'Trial Run Time (min)': 'Prøvekørselstid (min)', 'Total Changeover Time (min)': 'Samlet Omstillingstid (min)', 'Internal Time (min)': 'Intern Tid (min)', 'External Time (min)': 'Ekstern Tid (min)', 'Internal Time (%)': 'Intern Tid (%)', 'Potential Reduction (min)': 'Potentiel Reduktion (min)', 'Visual Signals Implemented': 'Visuelle Signaler Implementeret', 'Total Opportunities': 'Samlede Muligheder', 'Issues Identified Visually': 'Problemer Identificeret Visuelt', 'Total Issues': 'Samlede Problemer', 'Implementation Rate (%)': 'Implementeringsrate (%)', 'Visual Detection Rate (%)': 'Visuel Detekteringsrate (%)', 'Remaining Opportunities': 'Resterende Muligheder', 'Overall Effectiveness (%)': 'Samlet Effektivitet (%)', 'Total Observations': 'Samlede Observationer', 'Improvement Opportunities': 'Forbedrinsmuligheder', 'Actions Created': 'Handlinger Oprettet', 'Actions Completed': 'Handlinger Gennemført', 'Opportunity Rate (%)': 'Mulighedsrate (%)', 'Action Creation Rate (%)': 'Handlingsoprettelsesrate (%)', 'Action Completion Rate (%)': 'Handlingsgennemførelsesrate (%)', 'Defects Before Poka-Yoke': 'Defekter Før Poka-Yoke', 'Defects After Poka-Yoke': 'Defekter Efter Poka-Yoke', 'Total Units Produced': 'Totalt Producerede Enheder', 'Cost Per Defect': 'Omkostning pr. Defekt', 'Defect Reduction': 'Defektreduktion', 'Reduction Percentage (%)': 'Reduktionsprocent (%)', 'DPM Before': 'DPM Før', 'DPM After': 'DPM Efter',
        // Finance & Accounting (NEW)
        'Initial Investment': 'Initialinvestering', 'Final Value': 'Endelig Værdi', 'Time Period (years)': 'Tidsperiode (år)', 'Total Return': 'Samlet Afkast', 'Annualized ROI (%)': 'Årlig ROI (%)', 'Year 1 Cash Flow': 'År 1 Pengestrøm', 'Year 2 Cash Flow': 'År 2 Pengestrøm', 'Year 3 Cash Flow': 'År 3 Pengestrøm', 'Discount Rate (%)': 'Diskonteringsrate (%)', 'PV Year 1': 'NV År 1', 'PV Year 2': 'NV År 2', 'PV Year 3': 'NV År 3', 'Total Present Value': 'Samlet Nutidsværdi', 'Net Present Value': 'Nettonutidsværdi', 'Annual Cash Flow': 'Årlig Pengestrøm', 'Monthly Cash Flow': 'Månedlig Pengestrøm', 'Payback Period (years)': 'Tilbagebetalingsperiode (år)', 'After 1 Year': 'Efter 1 År', 'Asset Cost': 'Aktivomkostning', 'Salvage Value': 'Bjærgningsværdi', 'Useful Life (years)': 'Brugstid (år)', 'Declining Balance Rate (%)': 'Degressiv Afskrivningssats (%)', 'Depreciable Base': 'Afskrivningsgrundlag', 'Straight-Line Annual': 'Lineær Årlig', 'Straight-Line Rate (%)': 'Lineær Sats (%)', 'Declining Balance Year 1': 'Degressiv Afskrivning År 1', 'Book Value After Year 1': 'Bogført Værdi Efter År 1', 'Current Assets': 'Omsætningsaktiver', 'Current Liabilities': 'Kortfristede Forpligtelser', 'Inventory': 'Lagerbeholdning', 'Cash': 'Kontanter', 'Working Capital': 'Driftskapital', 'Current Ratio': 'Likviditetsgrad', 'Quick Assets': 'Omsættelige Aktiver', 'Quick Ratio': 'Likviditetskvote', 'Cash Ratio': 'Likviditetskvotient', 'Total Revenue': 'Samlet Omsætning', 'Operating Expenses': 'Driftsomkostninger', 'Interest & Tax': 'Renter & Skat', 'Gross Profit': 'Bruttofortjeneste', 'Gross Margin (%)': 'Bruttomargin (%)', 'Operating Profit': 'Driftsresultat', 'Operating Margin (%)': 'Driftsmargin (%)', 'Net Profit': 'Nettofortjeneste', 'Net Margin (%)': 'Nettomargin (%)', 'Depreciation': 'Afskrivning', 'Amortization': 'Amortisering', 'EBITDA': 'EBITDA', 'EBITDA Margin (%)': 'EBITDA-margin (%)', 'Operating Income': 'Driftsindtægt', 'Price Per Unit': 'Pris pr. Enhed', 'CM Ratio (%)': 'Dækningsbidragsforhold (%)', 'Margin of Safety (at 2000 units)': 'Sikkerhedsmargin (ved 2000 enheder)', 'Total Debt': 'Samlet Gæld', 'Total Equity': 'Samlet Egenkapital', 'Short-Term Debt': 'Kortfristet Gæld', 'Long-Term Debt': 'Langfristet Gæld', 'Debt-to-Equity Ratio': 'Gældsandel', 'Debt Ratio': 'Gældsgrad', 'Equity Multiplier': 'Egenkapitalmultiplikator', 'Long-Term D/E': 'Langfristet G/E', 'Net Income': 'Nettoindkomst', 'Change in Accounts Receivable': 'Ændring i Debitorer', 'Change in Inventory': 'Ændring i Lagerbeholdning', 'Change in Accounts Payable': 'Ændring i Kreditorer', 'Operating Cash Flow': 'Driftspengestrøm', 'Cash Flow Margin (%)': 'Pengestrømsmargin (%)', 'Quality of Earnings': 'Indtjeningskvalitet', 'Budgeted Revenue': 'Budgetteret Omsætning', 'Actual Revenue': 'Faktisk Omsætning', 'Budgeted Costs': 'Budgetterede Omkostninger', 'Actual Costs': 'Faktiske Omkostninger', 'Revenue Variance': 'Omsætningsafvigelse', 'Revenue Variance (%)': 'Omsætningsafvigelse (%)', 'Cost Variance': 'Omkostningsafvigelse', 'Cost Variance (%)': 'Omkostningsafvigelse (%)', 'Budgeted Profit': 'Budgetteret Fortjeneste', 'Actual Profit': 'Faktisk Fortjeneste', 'Profit Variance': 'Fortjenesteafvigelse', 'Implementation Cost': 'Implementeringsomkostning', 'Annual Benefit': 'Årlig Fordel', 'Annual Operating Cost': 'Årlige Driftsomkostninger', 'Project Life (years)': 'Projektlevetid (år)', 'Total Benefits': 'Samlede Fordele', 'Total Costs': 'Samlede Omkostninger', 'Net Benefit': 'Nettofordel', 'Benefit-Cost Ratio': 'Fordel-Omkostningsforhold', 'Simple Payback (years)': 'Simpel Tilbagebetalingstid (år)', 'Original Price': 'Original Pris', 'New Price': 'Ny Pris', 'Original Quantity': 'Original Mængde', 'New Quantity': 'Ny Mængde', 'Price Change (%)': 'Prisændring (%)', 'Quantity Change (%)': 'Mængdeændring (%)', 'Price Elasticity': 'Priselasticitet', 'Elasticity Type': 'Elasticitetstype', 'Revenue Change': 'Omsætningsændring', 'Annual Demand': 'Årlig Efterspørgsel', 'Cost Per Order': 'Omkostning pr. Ordre', 'Holding Cost Rate (%)': 'Lageromkostningssats (%)', 'Unit Cost': 'Enhedsomkostning', 'Holding Cost Per Unit': 'Lageromkostning pr. Enhed', 'Economic Order Quantity': 'Økonomisk Ordremængde', 'Number of Orders': 'Antal Ordrer', 'Total Ordering Cost': 'Samlet Ordreomkostning', 'Average Inventory': 'Gennemsnitlig Lagerbeholdning', 'Total Holding Cost': 'Samlet Lageromkostning', 'Total Inventory Cost': 'Samlet Lageromkostning',
        // Math & General Calculations (NEW)
        'Value': 'Værdi', 'Total': 'Total', 'Old Value': 'Gammel Værdi', 'New Value': 'Ny Værdi', 'Percentage': 'Procent', 'Change': 'Ændring', 'Percent Change': 'Procentændring', 'Slope (m)': 'Hældning (m)', 'X Value': 'X-værdi', 'Y-Intercept (b)': 'Y-skæring (b)', 'Y Value': 'Y-værdi', 'Principal Amount': 'Hovedstol', 'Annual Interest Rate (%)': 'Årlig Rente (%)', 'Compounds Per Year': 'Renteberegninger pr. År', 'Final Amount': 'Slutbeløb', 'Total Interest Earned': 'Samlet Renteindtægt', 'Revenue': 'Omsætning', 'Cost': 'Omkostning', 'Profit': 'Fortjeneste', 'Markup %': 'Avance %', 'ROI %': 'ROI %', 'Conversion Factor': 'Omregningsfaktor', 'Converted Value': 'Omregnet Værdi', 'Value 1': 'Værdi 1', 'Weight 1': 'Vægt 1', 'Value 2': 'Værdi 2', 'Weight 2': 'Vægt 2', 'Value 3': 'Værdi 3', 'Weight 3': 'Vægt 3', 'Total Weight': 'Samlet Vægt', 'Weighted Sum': 'Vægtet Sum', 'Weighted Average': 'Vægtet Gennemsnit', 'Loan Amount': 'Lånebeløb', 'Loan Term (years)': 'Låneperiode (år)', 'Monthly Rate': 'Månedlig Rente', 'Number of Payments': 'Antal Betalinger', 'Monthly Payment': 'Månedlig Betaling', 'Total Amount Paid': 'Samlet Betalt Beløb', 'Total Interest': 'Samlet Rente', 'Discount %': 'Rabat %', 'Discount Amount': 'Rabatbeløb', 'Final Price': 'Slutpris', 'You Save': 'Du Sparer', 'Distance (km)': 'Afstand (km)', 'Time (hours)': 'Tid (timer)', 'Speed (km/h)': 'Hastighed (km/t)', 'Time for 2x Distance': 'Tid for 2x Afstand', 'Package Weight (kg)': 'Pakkevægt (kg)', 'Base Rate per kg': 'Grundtakst pr. kg', 'Distance Fee per 100km': 'Afstandsgebyr pr. 100km', 'Handling Fee': 'Håndteringsgebyr', 'Weight Cost': 'Vægtomkostning', 'Distance Cost': 'Afstandsomkostning', 'Total Shipping Cost': 'Samlet Forsendelsesomkostning', 'Order Processing (hours)': 'Ordrebehandling (timer)', 'Picking Time (hours)': 'Pluktid (timer)', 'Packing Time (hours)': 'Paktid (timer)', 'Quality Check (hours)': 'Kvalitetskontrol (timer)', 'Shipping Time (hours)': 'Forsendelsestid (timer)', 'Warehouse Processing Time': 'Lagerbehandlingstid', 'Total Fulfillment Time (hours)': 'Samlet Opfyldelsestid (timer)', 'Total Days': 'Samlede Dage', 'Warehouse Efficiency %': 'Lagereffektivitet %', 'Quantity': 'Mængde', 'Tier 1 Min Qty': 'Trin 1 Min. Antal', 'Tier 1 Discount %': 'Trin 1 Rabat %', 'Tier 2 Min Qty': 'Trin 2 Min. Antal', 'Tier 2 Discount %': 'Trin 2 Rabat %', 'Base Cost': 'Basisomkostning', 'Applied Discount %': 'Anvendt Rabat %', 'Final Cost': 'Slutomkostning', 'Savings per Unit': 'Besparelse pr. Enhed', 'Years Used': 'Antal År Brugt', 'Depreciable Amount': 'Afskrivningsgrundlag', 'Annual Depreciation': 'Årlig Afskrivning', 'Accumulated Depreciation': 'Akkumuleret Afskrivning', 'Current Book Value': 'Nuværende Bogført Værdi', 'Remaining Life (years)': 'Resterende Levetid (år)', 'Quick Ratio (Acid Test)': 'Likviditetskvote (Syre Test)', 'Demand Filled': 'Opfyldt Efterspørgsel', 'Total Demand': 'Samlet Efterspørgsel', 'Orders Filled': 'Opfyldte Ordrer', 'Total Orders': 'Samlede Ordrer', 'Fill Rate %': 'Opfyldelsesrate %', 'Order Fill Rate %': 'Ordreopfyldelsesrate %', 'Stockout Rate %': 'Lagermangelrate %', 'Units Short': 'Manglende Enheder', 'Service Level': 'Serviceniveau', 'Arrival Rate (per hour)': 'Ankomstrate (pr. time)', 'Service Rate (per hour)': 'Servicerate (pr. time)', 'Number of Servers': 'Antal Servere', 'Utilization %': 'Udnyttelse %', 'Avg Queue Length': 'Gns. Kølængde', 'Avg Wait Time (minutes)': 'Gns. Ventetid (minutter)', 'Avg Time in System (minutes)': 'Gns. Tid i System (minutter)', 'Fuel Consumption (L/100km)': 'Brændstofforbrug (L/100km)', 'CO2 per Liter (kg)': 'CO2 pr. Liter (kg)', 'Number of Trips': 'Antal Ture', 'Fuel per Trip (L)': 'Brændstof pr. Tur (L)', 'CO2 per Trip (kg)': 'CO2 pr. Tur (kg)', 'Total CO2 (kg)': 'Samlet CO2 (kg)', 'Total CO2 (tons)': 'Samlet CO2 (tons)', 'CO2 per km (kg)': 'CO2 pr. km (kg)', 'Celsius': 'Celsius', 'Fahrenheit': 'Fahrenheit', 'Kelvin': 'Kelvin', 'Loan Principal': 'Lånehovedsæt', 'Payment Number (1-360)': 'Betalingsnummer (1-360)', 'Monthly Interest Rate': 'Månedlig Rente', 'Total Payments': 'Samlede Betalinger', 'Total Interest Paid': 'Samlet Rente Betalt', 'Balance at Payment N': 'Saldo ved Betaling N', 'Current Age': 'Nuværende Alder', 'Retirement Age': 'Pensionsalder', 'Current Savings': 'Nuværende Opsparing', 'Monthly Contribution': 'Månedlig Indbetaling', 'Expected Annual Return %': 'Forventet Årligt Afkast %', 'Years to Retirement': 'År til Pension', 'Total Months': 'Samlede Måneder', 'Monthly Return Rate': 'Månedlig Afkastrate', 'Future Value of Current': 'Fremtidig Værdi af Nuværende', 'Future Value of Contributions': 'Fremtidig Værdi af Indbetalinger', 'Total at Retirement': 'Samlet ved Pension', 'Total You Contributed': 'Samlet Indbetalt', 'Investment Gain': 'Investeringsgevinst', 'Target Profit': 'Målfortjeneste', 'Units for Target Profit': 'Enheder for Målfortjeneste', 'Revenue for Target Profit': 'Omsætning for Målfortjeneste', 'Value 4': 'Værdi 4', 'Value 5': 'Værdi 5', 'Mean (Average)': 'Gennemsnit', 'Sum Total': 'Total Sum', 'Minimum Value': 'Minimumsværdi', 'Maximum Value': 'Maksimumsværdi', 'Range': 'Område', 'Variance (approx)': 'Varians (ca.)', 'Contribution Margin': 'Dækningsbidrag'
    };
    
    return da[englishLabel] || englishLabel;
}

// Built-in Template Library
const logisticsTemplates = [
    {
        name: "EOQ (Wilson Formula)",
        icon: "📦",
        description: "Economic Order Quantity calculator",
        translationKey: "template-logistics-eoq",
        inputs: [
            { name: "annualDemand", label: "Annual Demand (D)", type: "number", defaultValue: 10000 },
            { name: "orderCost", label: "Order Cost (S)", type: "number", defaultValue: 200 },
            { name: "holdingCostPercent", label: "Holding Cost %", type: "number", defaultValue: 20 },
            { name: "unitPrice", label: "Unit Price", type: "number", defaultValue: 50 }
        ],
        formulas: [
            { name: "holdingCost", label: "Holding Cost (H)", formula: "unitPrice * (holdingCostPercent / 100)" },
            { name: "EOQ", label: "Optimal Order Quantity", formula: "sqrt((2 * annualDemand * orderCost) / holdingCost)" },
            { name: "ordersPerYear", label: "Orders Per Year", formula: "annualDemand / EOQ" },
            { name: "totalCost", label: "Total Annual Cost", formula: "(annualDemand / EOQ) * orderCost + (EOQ / 2) * holdingCost" }
        ],
        graph: {
            enabled: true,
            type: "line",
            xAxis: "quantity",
            yAxis: "holdingCost, orderCost, totalCost"
        }
    },
    {
        name: "Reorder Point (ROP)",
        icon: "🔔",
        description: "Calculate when to reorder inventory",
        translationKey: "template-logistics-rop",
        inputs: [
            { name: "dailyDemand", label: "Daily Demand", type: "number", defaultValue: 100 },
            { name: "leadTime", label: "Lead Time (days)", type: "number", defaultValue: 7 },
            { name: "safetyStock", label: "Safety Stock", type: "number", defaultValue: 150 }
        ],
        formulas: [
            { name: "leadTimeDemand", label: "Lead Time Demand", formula: "dailyDemand * leadTime" },
            { name: "reorderPoint", label: "Reorder Point (ROP)", formula: "leadTimeDemand + safetyStock" }
        ],
        simulation: {
            enabled: true,
            timeVar: "day",
            startValue: 0,
            endValue: 30
        }
    },
    {
        name: "Safety Stock Calculator",
        icon: "🛡️",
        description: "Determine optimal safety stock levels",
        translationKey: "template-logistics-safety",
        inputs: [
            { name: "avgDemand", label: "Average Daily Demand", type: "number", defaultValue: 50 },
            { name: "stdDev", label: "Demand Std Dev", type: "number", defaultValue: 10 },
            { name: "leadTime", label: "Lead Time (days)", type: "number", defaultValue: 5 },
            { name: "serviceLevel", label: "Service Level (Z-score)", type: "number", defaultValue: 1.65, step: 0.01 }
        ],
        formulas: [
            { name: "safetyStock", label: "Safety Stock", formula: "serviceLevel * stdDev * sqrt(leadTime)" },
            { name: "avgLeadTimeDemand", label: "Avg Lead Time Demand", formula: "avgDemand * leadTime" },
            { name: "totalROP", label: "Total ROP", formula: "avgLeadTimeDemand + safetyStock" }
        ]
    },
    {
        name: "ABC Classification Helper",
        icon: "🎯",
        description: "Calculate cumulative percentages for ABC analysis",
        translationKey: "template-logistics-abc",
        inputs: [
            { name: "itemValue", label: "Item Value", type: "number", defaultValue: 1000 },
            { name: "totalValue", label: "Total Inventory Value", type: "number", defaultValue: 100000 },
            { name: "cumulativePercent", label: "Cumulative %", type: "number", defaultValue: 75 }
        ],
        formulas: [
            { name: "valuePercent", label: "Value % of Total", formula: "(itemValue / totalValue) * 100" },
            { name: "isA", label: "Is A Class", formula: "cumulativePercent <= 80 ? 1 : 0" },
            { name: "isB", label: "Is B Class", formula: "(cumulativePercent > 80 and cumulativePercent <= 95) ? 1 : 0" },
            { name: "isC", label: "Is C Class", formula: "cumulativePercent > 95 ? 1 : 0" }
        ]
    },
    {
        name: "Min/Max Inventory Model",
        icon: "📊",
        description: "Calculate min and max inventory levels",
        translationKey: "template-logistics-minmax",
        inputs: [
            { name: "avgDemand", label: "Average Daily Demand", type: "number", defaultValue: 50 },
            { name: "leadTime", label: "Lead Time (days)", type: "number", defaultValue: 5 },
            { name: "safetyStock", label: "Safety Stock", type: "number", defaultValue: 100 },
            { name: "orderQuantity", label: "Order Quantity (EOQ)", type: "number", defaultValue: 500 }
        ],
        formulas: [
            { name: "minLevel", label: "Minimum Level", formula: "safetyStock + (avgDemand * leadTime)" },
            { name: "maxLevel", label: "Maximum Level", formula: "minLevel + orderQuantity" }
        ]
    },
    {
        name: "Demand Forecasting (Simple Moving Average)",
        icon: "📈",
        description: "Forecast future demand using moving average",
        translationKey: "template-logistics-forecast",
        inputs: [
            { name: "period1", label: "Period 1 Demand", type: "number", defaultValue: 100 },
            { name: "period2", label: "Period 2 Demand", type: "number", defaultValue: 110 },
            { name: "period3", label: "Period 3 Demand", type: "number", defaultValue: 105 },
            { name: "period4", label: "Period 4 Demand", type: "number", defaultValue: 115 }
        ],
        formulas: [
            { name: "movingAvg", label: "3-Period Moving Average", formula: "(period2 + period3 + period4) / 3" },
            { name: "forecast", label: "Next Period Forecast", formula: "movingAvg" }
        ]
    },
    {
        name: "Break-Even Analysis",
        icon: "💰",
        description: "Calculate break-even point and visualize revenue vs costs",
        translationKey: "template-logistics-breakeven",
        inputs: [
            { name: "fixedCosts", label: "Fixed Costs", type: "number", defaultValue: 10000 },
            { name: "variableCostPerUnit", label: "Variable Cost per Unit", type: "number", defaultValue: 20 },
            { name: "sellingPricePerUnit", label: "Selling Price per Unit", type: "number", defaultValue: 50 }
        ],
        formulas: [
            { name: "contributionMargin", label: "Contribution Margin per Unit", formula: "sellingPricePerUnit - variableCostPerUnit" },
            { name: "contributionMarginRatio", label: "Contribution Margin %", formula: "(contributionMargin / sellingPricePerUnit) * 100" },
            { name: "breakEvenUnits", label: "Break-Even Units", formula: "fixedCosts / contributionMargin" },
            { name: "breakEvenRevenue", label: "Break-Even Revenue", formula: "breakEvenUnits * sellingPricePerUnit" },
            { name: "safetyMargin", label: "Safety Margin (assuming 200 units sold)", formula: "((200 - breakEvenUnits) / 200) * 100" }
        ],
        simulation: {
            enabled: true,
            timeVar: "units",
            startValue: 0,
            endValue: Math.ceil((10000 / (50 - 20)) * 2),
            formulas: {
                revenue: "units * 50",
                totalCost: "10000 + (units * 20)",
                profit: "revenue - totalCost"
            }
        }
    },
    {
        name: "Inventory Turnover Ratio",
        icon: "🔄",
        description: "Measure inventory efficiency",
        translationKey: "template-logistics-turnover",
        inputs: [
            { name: "cogs", label: "Cost of Goods Sold (Annual)", type: "number", defaultValue: 500000 },
            { name: "avgInventory", label: "Average Inventory Value", type: "number", defaultValue: 100000 }
        ],
        formulas: [
            { name: "turnoverRatio", label: "Inventory Turnover Ratio", formula: "cogs / avgInventory" },
            { name: "daysInInventory", label: "Days in Inventory", formula: "365 / turnoverRatio" },
            { name: "weeksInInventory", label: "Weeks in Inventory", formula: "52 / turnoverRatio" }
        ]
    },
    {
        name: "Total Cost of Ownership (TCO)",
        icon: "🏷️",
        description: "Calculate total cost including hidden costs",
        translationKey: "template-logistics-tco",
        inputs: [
            { name: "purchasePrice", label: "Purchase Price", type: "number", defaultValue: 50000 },
            { name: "shippingCost", label: "Shipping & Handling", type: "number", defaultValue: 2000 },
            { name: "installationCost", label: "Installation Cost", type: "number", defaultValue: 5000 },
            { name: "annualMaintenance", label: "Annual Maintenance", type: "number", defaultValue: 3000 },
            { name: "yearsOfUse", label: "Years of Use", type: "number", defaultValue: 5 },
            { name: "trainingCost", label: "Training Cost", type: "number", defaultValue: 2000 }
        ],
        formulas: [
            { name: "initialCost", label: "Initial Total Cost", formula: "purchasePrice + shippingCost + installationCost + trainingCost" },
            { name: "maintenanceTotal", label: "Total Maintenance Cost", formula: "annualMaintenance * yearsOfUse" },
            { name: "TCO", label: "Total Cost of Ownership", formula: "initialCost + maintenanceTotal" },
            { name: "annualTCO", label: "Annual TCO", formula: "TCO / yearsOfUse" }
        ]
    },
    {
        name: "Capacity Planning",
        icon: "⚙️",
        description: "Calculate production capacity and utilization",
        translationKey: "template-logistics-capacity",
        inputs: [
            { name: "availableHours", label: "Available Hours per Day", type: "number", defaultValue: 16 },
            { name: "cycleTime", label: "Cycle Time per Unit (minutes)", type: "number", defaultValue: 15 },
            { name: "actualProduction", label: "Actual Daily Production", type: "number", defaultValue: 50 },
            { name: "workingDays", label: "Working Days per Month", type: "number", defaultValue: 22 }
        ],
        formulas: [
            { name: "maxDailyCapacity", label: "Maximum Daily Capacity", formula: "(availableHours * 60) / cycleTime" },
            { name: "utilizationRate", label: "Utilization Rate %", formula: "(actualProduction / maxDailyCapacity) * 100" },
            { name: "monthlyCapacity", label: "Monthly Capacity", formula: "maxDailyCapacity * workingDays" },
            { name: "spareCapacity", label: "Spare Capacity per Day", formula: "maxDailyCapacity - actualProduction" }
        ]
    },
    {
        name: "Lead Time Analysis",
        icon: "⏱️",
        description: "Analyze and optimize lead times",
        translationKey: "template-logistics-leadtime",
        inputs: [
            { name: "orderProcessing", label: "Order Processing Time (days)", type: "number", defaultValue: 1 },
            { name: "productionTime", label: "Production Time (days)", type: "number", defaultValue: 5 },
            { name: "qualityCheck", label: "Quality Check Time (days)", type: "number", defaultValue: 1 },
            { name: "shippingTime", label: "Shipping Time (days)", type: "number", defaultValue: 3 }
        ],
        formulas: [
            { name: "totalLeadTime", label: "Total Lead Time", formula: "orderProcessing + productionTime + qualityCheck + shippingTime" },
            { name: "valueAddTime", label: "Value-Add Time", formula: "productionTime" },
            { name: "nonValueAddTime", label: "Non-Value-Add Time", formula: "totalLeadTime - valueAddTime" },
            { name: "efficiencyRatio", label: "Efficiency Ratio %", formula: "(valueAddTime / totalLeadTime) * 100" }
        ]
    },
    {
        name: "Warehouse Space Calculator",
        icon: "🏭",
        description: "Calculate required warehouse space",
        translationKey: "template-logistics-warehouse",
        inputs: [
            { name: "palletLength", label: "Pallet Length (m)", type: "number", defaultValue: 1.2 },
            { name: "palletWidth", label: "Pallet Width (m)", type: "number", defaultValue: 0.8 },
            { name: "palletHeight", label: "Pallet Height (m)", type: "number", defaultValue: 1.5 },
            { name: "numberOfPallets", label: "Number of Pallets", type: "number", defaultValue: 100 },
            { name: "aisleWidth", label: "Aisle Width (m)", type: "number", defaultValue: 3 },
            { name: "stackHeight", label: "Stack Height (levels)", type: "number", defaultValue: 3 }
        ],
        formulas: [
            { name: "palletArea", label: "Area per Pallet (m²)", formula: "palletLength * palletWidth" },
            { name: "totalPalletArea", label: "Total Pallet Area (m²)", formula: "palletArea * numberOfPallets / stackHeight" },
            { name: "aisleSpace", label: "Aisle Space (m²)", formula: "totalPalletArea * 0.4" },
            { name: "totalArea", label: "Total Warehouse Area (m²)", formula: "totalPalletArea + aisleSpace" },
            { name: "volumeCapacity", label: "Volume Capacity (m³)", formula: "numberOfPallets * palletLength * palletWidth * palletHeight" }
        ]
    },
    {
        name: "Pareto Analysis (80/20)",
        icon: "📈",
        description: "Identify critical few from trivial many",
        translationKey: "template-logistics-pareto",
        inputs: [
            { name: "item1Value", label: "Item 1 Value", type: "number", defaultValue: 50000 },
            { name: "item2Value", label: "Item 2 Value", type: "number", defaultValue: 30000 },
            { name: "item3Value", label: "Item 3 Value", type: "number", defaultValue: 15000 },
            { name: "item4Value", label: "Item 4 Value", type: "number", defaultValue: 3000 },
            { name: "item5Value", label: "Item 5 Value", type: "number", defaultValue: 2000 }
        ],
        formulas: [
            { name: "totalValue", label: "Total Value", formula: "item1Value + item2Value + item3Value + item4Value + item5Value" },
            { name: "item1Percent", label: "Item 1 %", formula: "(item1Value / totalValue) * 100" },
            { name: "item2Percent", label: "Item 2 %", formula: "(item2Value / totalValue) * 100" },
            { name: "item3Percent", label: "Item 3 %", formula: "(item3Value / totalValue) * 100" },
            { name: "top3Value", label: "Top 3 Combined Value", formula: "item1Value + item2Value + item3Value" },
            { name: "top3Percent", label: "Top 3 Combined %", formula: "(top3Value / totalValue) * 100" }
        ]
    },
    {
        name: "Truck Load Optimization",
        icon: "🚚",
        description: "Calculate optimal truck loading and utilization",
        translationKey: "template-logistics-truck",
        inputs: [
            { name: "truckCapacity", label: "Truck Capacity (kg)", type: "number", defaultValue: 20000 },
            { name: "truckVolume", label: "Truck Volume (m³)", type: "number", defaultValue: 80 },
            { name: "cargoWeight", label: "Total Cargo Weight (kg)", type: "number", defaultValue: 15000 },
            { name: "cargoVolume", label: "Total Cargo Volume (m³)", type: "number", defaultValue: 60 },
            { name: "costPerTrip", label: "Cost per Trip", type: "number", defaultValue: 500 }
        ],
        formulas: [
            { name: "weightUtilization", label: "Weight Utilization %", formula: "(cargoWeight / truckCapacity) * 100" },
            { name: "volumeUtilization", label: "Volume Utilization %", formula: "(cargoVolume / truckVolume) * 100" },
            { name: "limitingFactor", label: "Limiting Factor", formula: "weightUtilization > volumeUtilization ? weightUtilization : volumeUtilization" },
            { name: "unusedCapacity", label: "Unused Weight (kg)", formula: "truckCapacity - cargoWeight" },
            { name: "costPerKg", label: "Cost per kg", formula: "costPerTrip / cargoWeight" }
        ]
    },
    {
        name: "Cycle Count Planning",
        icon: "📋",
        description: "Plan inventory cycle counting schedule",
        translationKey: "template-logistics-cycle",
        inputs: [
            { name: "totalSKUs", label: "Total SKUs", type: "number", defaultValue: 5000 },
            { name: "aClassPercent", label: "A Class %", type: "number", defaultValue: 20 },
            { name: "bClassPercent", label: "B Class %", type: "number", defaultValue: 30 },
            { name: "aCountsPerYear", label: "A Class Counts/Year", type: "number", defaultValue: 12 },
            { name: "bCountsPerYear", label: "B Class Counts/Year", type: "number", defaultValue: 4 },
            { name: "cCountsPerYear", label: "C Class Counts/Year", type: "number", defaultValue: 1 }
        ],
        formulas: [
            { name: "aSKUs", label: "A Class SKUs", formula: "(totalSKUs * aClassPercent) / 100" },
            { name: "bSKUs", label: "B Class SKUs", formula: "(totalSKUs * bClassPercent) / 100" },
            { name: "cSKUs", label: "C Class SKUs", formula: "totalSKUs - aSKUs - bSKUs" },
            { name: "totalCounts", label: "Total Counts/Year", formula: "(aSKUs * aCountsPerYear) + (bSKUs * bCountsPerYear) + (cSKUs * cCountsPerYear)" },
            { name: "dailyCounts", label: "Daily Counts (260 days)", formula: "totalCounts / 260" },
            { name: "weeklyCounts", label: "Weekly Counts", formula: "totalCounts / 52" }
        ]
    },
    {
        name: "Stockout Cost Calculator",
        icon: "⚠️",
        description: "Calculate financial impact of stockouts",
        translationKey: "template-logistics-stockout",
        inputs: [
            { name: "avgDailyDemand", label: "Avg Daily Demand", type: "number", defaultValue: 100 },
            { name: "stockoutDays", label: "Days Out of Stock", type: "number", defaultValue: 3 },
            { name: "unitPrice", label: "Unit Price", type: "number", defaultValue: 50 },
            { name: "profitMargin", label: "Profit Margin %", type: "number", defaultValue: 30 },
            { name: "customerRetention", label: "Customer Retention % Loss", type: "number", defaultValue: 5 }
        ],
        formulas: [
            { name: "unitsLost", label: "Units Lost", formula: "avgDailyDemand * stockoutDays" },
            { name: "revenueLost", label: "Revenue Lost", formula: "unitsLost * unitPrice" },
            { name: "profitLost", label: "Profit Lost", formula: "(revenueLost * profitMargin) / 100" },
            { name: "customerImpact", label: "Customer Impact Cost", formula: "(revenueLost * customerRetention) / 100" },
            { name: "totalStockoutCost", label: "Total Stockout Cost", formula: "profitLost + customerImpact" }
        ]
    },
    {
        name: "Returns Management",
        icon: "↩️",
        description: "Analyze return rates and costs",
        translationKey: "template-logistics-returns",
        inputs: [
            { name: "totalSales", label: "Total Sales", type: "number", defaultValue: 100000 },
            { name: "returnedUnits", label: "Returned Units", type: "number", defaultValue: 500 },
            { name: "totalUnits", label: "Total Units Sold", type: "number", defaultValue: 2000 },
            { name: "avgUnitCost", label: "Avg Unit Cost", type: "number", defaultValue: 50 },
            { name: "processingCost", label: "Processing Cost per Return", type: "number", defaultValue: 10 }
        ],
        formulas: [
            { name: "returnRate", label: "Return Rate %", formula: "(returnedUnits / totalUnits) * 100" },
            { name: "returnValue", label: "Return Value", formula: "returnedUnits * avgUnitCost" },
            { name: "processingTotal", label: "Total Processing Cost", formula: "returnedUnits * processingCost" },
            { name: "totalReturnCost", label: "Total Return Cost", formula: "returnValue + processingTotal" },
            { name: "returnImpact", label: "Return Impact on Sales %", formula: "(totalReturnCost / totalSales) * 100" }
        ]
    },
    {
        name: "Kitting Calculator",
        icon: "📦",
        description: "Calculate kit assembly costs and requirements",
        translationKey: "template-logistics-kitting",
        inputs: [
            { name: "component1Qty", label: "Component 1 Qty per Kit", type: "number", defaultValue: 2 },
            { name: "component1Cost", label: "Component 1 Cost", type: "number", defaultValue: 5 },
            { name: "component2Qty", label: "Component 2 Qty per Kit", type: "number", defaultValue: 1 },
            { name: "component2Cost", label: "Component 2 Cost", type: "number", defaultValue: 10 },
            { name: "laborCost", label: "Assembly Labor Cost per Kit", type: "number", defaultValue: 3 },
            { name: "kitsNeeded", label: "Number of Kits Needed", type: "number", defaultValue: 100 }
        ],
        formulas: [
            { name: "materialCostPerKit", label: "Material Cost per Kit", formula: "(component1Qty * component1Cost) + (component2Qty * component2Cost)" },
            { name: "totalCostPerKit", label: "Total Cost per Kit", formula: "materialCostPerKit + laborCost" },
            { name: "totalComp1Needed", label: "Total Component 1 Needed", formula: "component1Qty * kitsNeeded" },
            { name: "totalComp2Needed", label: "Total Component 2 Needed", formula: "component2Qty * kitsNeeded" },
            { name: "totalKitCost", label: "Total Kitting Cost", formula: "totalCostPerKit * kitsNeeded" }
        ]
    },
    {
        name: "Demand Variability Analysis",
        icon: "📊",
        description: "Analyze demand patterns and variability",
        translationKey: "template-logistics-variability",
        inputs: [
            { name: "avgDemand", label: "Average Demand", type: "number", defaultValue: 100 },
            { name: "maxDemand", label: "Maximum Demand", type: "number", defaultValue: 150 },
            { name: "minDemand", label: "Minimum Demand", type: "number", defaultValue: 50 },
            { name: "stdDev", label: "Standard Deviation", type: "number", defaultValue: 20 }
        ],
        formulas: [
            { name: "demandRange", label: "Demand Range", formula: "maxDemand - minDemand" },
            { name: "coefficientOfVariation", label: "Coefficient of Variation %", formula: "(stdDev / avgDemand) * 100" },
            { name: "demandVolatility", label: "Demand Volatility %", formula: "(demandRange / avgDemand) * 100" },
            { name: "upperControl", label: "Upper Control Limit", formula: "avgDemand + (2 * stdDev)" },
            { name: "lowerControl", label: "Lower Control Limit", formula: "avgDemand - (2 * stdDev)" }
        ]
    },
    {
        name: "Route Optimization",
        icon: "🗺️",
        description: "Calculate optimal routing and delivery costs",
        translationKey: "template-logistics-route",
        inputs: [
            { name: "totalDistance", label: "Total Distance (km)", type: "number", defaultValue: 200 },
            { name: "numStops", label: "Number of Stops", type: "number", defaultValue: 8 },
            { name: "costPerKm", label: "Cost per km", type: "number", defaultValue: 1.5 },
            { name: "stopTime", label: "Time per Stop (minutes)", type: "number", defaultValue: 15 },
            { name: "avgSpeed", label: "Average Speed (km/h)", type: "number", defaultValue: 50 }
        ],
        formulas: [
            { name: "totalRouteCost", label: "Total Route Cost", formula: "totalDistance * costPerKm" },
            { name: "costPerStop", label: "Cost per Stop", formula: "totalRouteCost / numStops" },
            { name: "drivingTime", label: "Driving Time (hours)", formula: "totalDistance / avgSpeed" },
            { name: "stopTimeHours", label: "Stop Time (hours)", formula: "(numStops * stopTime) / 60" },
            { name: "totalTime", label: "Total Time (hours)", formula: "drivingTime + stopTimeHours" },
            { name: "avgDistancePerStop", label: "Avg Distance per Stop (km)", formula: "totalDistance / numStops" }
        ]
    },
    {
        name: "Productivity Calculator",
        icon: "⚡",
        description: "Measure workforce productivity metrics",
        translationKey: "template-logistics-productivity",
        inputs: [
            { name: "unitsProduced", label: "Units Produced", type: "number", defaultValue: 500 },
            { name: "hoursWorked", label: "Hours Worked", type: "number", defaultValue: 8 },
            { name: "numWorkers", label: "Number of Workers", type: "number", defaultValue: 5 },
            { name: "targetUnitsPerHour", label: "Target Units/Hour", type: "number", defaultValue: 15 }
        ],
        formulas: [
            { name: "unitsPerHour", label: "Units per Hour", formula: "unitsProduced / hoursWorked" },
            { name: "unitsPerWorker", label: "Units per Worker", formula: "unitsProduced / numWorkers" },
            { name: "efficiencyPercent", label: "Efficiency %", formula: "(unitsPerHour / targetUnitsPerHour) * 100" },
            { name: "totalLaborHours", label: "Total Labor Hours", formula: "hoursWorked * numWorkers" },
            { name: "laborProductivity", label: "Labor Productivity", formula: "unitsProduced / totalLaborHours" }
        ]
    },
    {
        name: "Supplier Performance Score",
        icon: "⭐",
        description: "Evaluate supplier performance metrics",
        translationKey: "template-logistics-supplier",
        inputs: [
            { name: "onTimeDeliveries", label: "On-Time Deliveries", type: "number", defaultValue: 95 },
            { name: "totalDeliveries", label: "Total Deliveries", type: "number", defaultValue: 100 },
            { name: "qualityScore", label: "Quality Score (0-100)", type: "number", defaultValue: 88 },
            { name: "priceCompetitive", label: "Price Competitiveness (0-100)", type: "number", defaultValue: 75 },
            { name: "responseTime", label: "Response Time Score (0-100)", type: "number", defaultValue: 90 }
        ],
        formulas: [
            { name: "deliveryReliability", label: "Delivery Reliability %", formula: "(onTimeDeliveries / totalDeliveries) * 100" },
            { name: "overallScore", label: "Overall Performance Score", formula: "(deliveryReliability * 0.3 + qualityScore * 0.3 + priceCompetitive * 0.2 + responseTime * 0.2)" },
            { name: "rating", label: "Supplier Rating", formula: "overallScore >= 90 ? 5 : (overallScore >= 80 ? 4 : (overallScore >= 70 ? 3 : (overallScore >= 60 ? 2 : 1)))" },
            { name: "lateDeliveries", label: "Late Deliveries", formula: "totalDeliveries - onTimeDeliveries" },
            { name: "lateDeliveryRate", label: "Late Delivery Rate %", formula: "(lateDeliveries / totalDeliveries) * 100" }
        ]
    },
    // NEW LOGISTICS: Cross-Docking Efficiency
    {
        name: "Cross-Docking Efficiency",
        icon: "🔀",
        description: "Measure throughput and cost savings of cross-docking vs traditional warehousing",
        translationKey: "template-logistics-crossdock",
        inputs: [
            { name: "inboundUnits", label: "Inbound Units per Day", type: "number", defaultValue: 5000 },
            { name: "avgHandlingTimeSec", label: "Avg Handling Time (sec/unit)", type: "number", defaultValue: 12 },
            { name: "laborRatePerHour", label: "Labor Rate (per hour)", type: "number", defaultValue: 220 },
            { name: "traditionalStorageCostPerUnit", label: "Traditional Storage Cost (per unit/day)", type: "number", defaultValue: 2.5 },
            { name: "facilityOperatingHours", label: "Facility Operating Hours/Day", type: "number", defaultValue: 16 }
        ],
        formulas: [
            { name: "totalHandlingHours", label: "Total Handling Time (hours)", formula: "(inboundUnits * avgHandlingTimeSec) / 3600" },
            { name: "laborCostPerDay", label: "Daily Labor Cost", formula: "totalHandlingHours * laborRatePerHour" },
            { name: "laborCostPerUnit", label: "Labor Cost Per Unit", formula: "laborCostPerDay / inboundUnits" },
            { name: "storageSavings", label: "Daily Storage Savings", formula: "inboundUnits * traditionalStorageCostPerUnit" },
            { name: "netBenefit", label: "Net Daily Benefit", formula: "storageSavings - laborCostPerDay" },
            { name: "utilisationRate", label: "Facility Utilisation (%)", formula: "(totalHandlingHours / facilityOperatingHours) * 100" }
        ]
    },
    // NEW LOGISTICS: Supplier Lead Time Variability
    {
        name: "Supplier Lead Time Variability",
        icon: "📅",
        description: "Analyse lead time standard deviation and calculate safety stock buffer",
        translationKey: "template-logistics-leadvar",
        inputs: [
            { name: "lt1", label: "Lead Time Sample 1 (days)", type: "number", defaultValue: 5 },
            { name: "lt2", label: "Lead Time Sample 2 (days)", type: "number", defaultValue: 7 },
            { name: "lt3", label: "Lead Time Sample 3 (days)", type: "number", defaultValue: 6 },
            { name: "lt4", label: "Lead Time Sample 4 (days)", type: "number", defaultValue: 9 },
            { name: "lt5", label: "Lead Time Sample 5 (days)", type: "number", defaultValue: 4 },
            { name: "avgDemandPerDay", label: "Average Daily Demand", type: "number", defaultValue: 100 },
            { name: "serviceFactor", label: "Service Factor (Z)", type: "number", defaultValue: 1.65 }
        ],
        formulas: [
            { name: "avgLeadTime", label: "Average Lead Time (days)", formula: "(lt1 + lt2 + lt3 + lt4 + lt5) / 5" },
            { name: "variance", label: "Lead Time Variance", formula: "((lt1-avgLeadTime)^2 + (lt2-avgLeadTime)^2 + (lt3-avgLeadTime)^2 + (lt4-avgLeadTime)^2 + (lt5-avgLeadTime)^2) / 5" },
            { name: "stdDev", label: "Std Deviation (days)", formula: "sqrt(variance)" },
            { name: "safetyStock", label: "Safety Stock (units)", formula: "serviceFactor * stdDev * avgDemandPerDay" },
            { name: "reorderPoint", label: "Reorder Point", formula: "(avgLeadTime * avgDemandPerDay) + safetyStock" },
            { name: "variabilityIndex", label: "Variability Index (%)", formula: "(stdDev / avgLeadTime) * 100" }
        ]
    }
];

// LEAN Manufacturing templates
const leanTemplates = [
    {
        name: "OEE Calculator",
        icon: "⚙️",
        description: "Calculate Overall Equipment Effectiveness",
        translationKey: "template-lean-oee",
        inputs: [
            { name: "plannedProductionTime", label: "Planned Production Time (min)", type: "number", defaultValue: 480 },
            { name: "downtime", label: "Downtime (min)", type: "number", defaultValue: 47 },
            { name: "idealCycleTime", label: "Ideal Cycle Time (min/unit)", type: "number", defaultValue: 1 },
            { name: "totalProduced", label: "Total Produced", type: "number", defaultValue: 410 },
            { name: "goodUnits", label: "Good Units", type: "number", defaultValue: 400 }
        ],
        formulas: [
            { name: "operatingTime", label: "Operating Time (min)", formula: "plannedProductionTime - downtime" },
            { name: "availability", label: "Availability (%)", formula: "(operatingTime / plannedProductionTime) * 100" },
            { name: "performance", label: "Performance (%)", formula: "((totalProduced * idealCycleTime) / operatingTime) * 100" },
            { name: "quality", label: "Quality (%)", formula: "(goodUnits / totalProduced) * 100" },
            { name: "oee", label: "OEE (%)", formula: "(availability / 100) * (performance / 100) * (quality / 100) * 100" }
        ]
    },
    {
        name: "SMED Analysis",
        icon: "⏱️",
        description: "Single-Minute Exchange of Die - Changeover time reduction",
        translationKey: "template-lean-smed",
        inputs: [
            { name: "currentChangeoverTime", label: "Current Changeover Time (min)", type: "number", defaultValue: 120 },
            { name: "targetChangeoverTime", label: "Target Changeover Time (min)", type: "number", defaultValue: 45 },
            { name: "changoversPerYear", label: "Changeovers Per Year", type: "number", defaultValue: 250 },
            { name: "hourlyRate", label: "Hourly Labor Rate", type: "number", defaultValue: 300 }
        ],
        formulas: [
            { name: "timeSavedPerChangeover", label: "Time Saved Per Changeover (min)", formula: "currentChangeoverTime - targetChangeoverTime" },
            { name: "annualTimeSaved", label: "Annual Time Saved (hours)", formula: "(timeSavedPerChangeover * changoversPerYear) / 60" },
            { name: "annualCostSavings", label: "Annual Cost Savings", formula: "annualTimeSaved * hourlyRate" },
            { name: "reductionPercentage", label: "Reduction (%)", formula: "((currentChangeoverTime - targetChangeoverTime) / currentChangeoverTime) * 100" }
        ]
    },
    {
        name: "Takt Time Calculator",
        icon: "⏰",
        description: "Calculate the pace of production to meet customer demand",
        translationKey: "template-lean-takt",
        inputs: [
            { name: "availableTime", label: "Available Production Time (min/day)", type: "number", defaultValue: 480 },
            { name: "breaks", label: "Total Breaks (min/day)", type: "number", defaultValue: 60 },
            { name: "customerDemand", label: "Customer Demand (units/day)", type: "number", defaultValue: 400 }
        ],
        formulas: [
            { name: "netAvailableTime", label: "Net Available Time (min)", formula: "availableTime - breaks" },
            { name: "taktTime", label: "Takt Time (min/unit)", formula: "netAvailableTime / customerDemand" },
            { name: "taktTimeSeconds", label: "Takt Time (seconds/unit)", formula: "taktTime * 60" },
            { name: "unitsPerHour", label: "Required Units Per Hour", formula: "customerDemand / (netAvailableTime / 60)" }
        ]
    },
    {
        name: "Cycle Time Analysis",
        icon: "🔄",
        description: "Compare cycle time to takt time",
        translationKey: "template-lean-cycle",
        inputs: [
            { name: "totalProcessTime", label: "Total Process Time (seconds)", type: "number", defaultValue: 540 },
            { name: "unitsProduced", label: "Units Produced", type: "number", defaultValue: 10 },
            { name: "taktTime", label: "Takt Time (seconds)", type: "number", defaultValue: 60 }
        ],
        formulas: [
            { name: "cycleTime", label: "Cycle Time (seconds/unit)", formula: "totalProcessTime / unitsProduced" },
            { name: "difference", label: "Difference from Takt (seconds)", formula: "cycleTime - taktTime" },
            { name: "status", label: "Status", formula: "cycleTime <= taktTime ? 1 : 0" },
            { name: "capacity", label: "Capacity Utilization (%)", formula: "(cycleTime / taktTime) * 100" }
        ]
    },
    {
        name: "Value Stream Mapping Metrics",
        icon: "🗺️",
        description: "Calculate value-add ratio and lead time",
        translationKey: "template-lean-vsm",
        inputs: [
            { name: "valueAddTime", label: "Value-Add Time (min)", type: "number", defaultValue: 45 },
            { name: "nonValueAddTime", label: "Non-Value-Add Time (min)", type: "number", defaultValue: 355 },
            { name: "queueTime", label: "Queue/Wait Time (min)", type: "number", defaultValue: 2880 }
        ],
        formulas: [
            { name: "totalLeadTime", label: "Total Lead Time (min)", formula: "valueAddTime + nonValueAddTime + queueTime" },
            { name: "totalLeadTimeDays", label: "Total Lead Time (days)", formula: "totalLeadTime / 1440" },
            { name: "valueAddRatio", label: "Value-Add Ratio (%)", formula: "(valueAddTime / totalLeadTime) * 100" },
            { name: "processEfficiency", label: "Process Efficiency (%)", formula: "(valueAddTime / (valueAddTime + nonValueAddTime)) * 100" }
        ]
    },
    {
        name: "Kaizen Event ROI",
        icon: "📈",
        description: "Calculate return on investment for improvement events",
        translationKey: "template-lean-kaizen",
        inputs: [
            { name: "teamMembers", label: "Team Members", type: "number", defaultValue: 8 },
            { name: "eventDays", label: "Event Duration (days)", type: "number", defaultValue: 5 },
            { name: "avgHourlyRate", label: "Average Hourly Rate", type: "number", defaultValue: 250 },
            { name: "annualSavings", label: "Annual Savings", type: "number", defaultValue: 150000 }
        ],
        formulas: [
            { name: "eventCost", label: "Event Cost", formula: "teamMembers * eventDays * 8 * avgHourlyRate" },
            { name: "roi", label: "ROI (%)", formula: "((annualSavings - eventCost) / eventCost) * 100" },
            { name: "paybackMonths", label: "Payback Period (months)", formula: "eventCost / (annualSavings / 12)" },
            { name: "netBenefit", label: "Net Annual Benefit", formula: "annualSavings - eventCost" }
        ]
    },
    {
        name: "5S Score Calculator",
        icon: "✨",
        description: "Evaluate 5S implementation maturity",
        translationKey: "template-lean-5s",
        inputs: [
            { name: "sortScore", label: "Sort (Seiri) Score (0-5)", type: "number", defaultValue: 4 },
            { name: "setInOrderScore", label: "Set in Order (Seiton) Score (0-5)", type: "number", defaultValue: 4 },
            { name: "shineScore", label: "Shine (Seiso) Score (0-5)", type: "number", defaultValue: 3 },
            { name: "standardizeScore", label: "Standardize (Seiketsu) Score (0-5)", type: "number", defaultValue: 3 },
            { name: "sustainScore", label: "Sustain (Shitsuke) Score (0-5)", type: "number", defaultValue: 2 }
        ],
        formulas: [
            { name: "totalScore", label: "Total Score", formula: "sortScore + setInOrderScore + shineScore + standardizeScore + sustainScore" },
            { name: "percentageScore", label: "Overall Score (%)", formula: "(totalScore / 25) * 100" },
            { name: "averageScore", label: "Average Score", formula: "totalScore / 5" },
            { name: "maturityLevel", label: "Maturity Level (1-5)", formula: "round(averageScore)" }
        ]
    },
    {
        name: "Kanban Card Calculator",
        icon: "📋",
        description: "Calculate number of kanban cards needed",
        translationKey: "template-lean-kanban",
        inputs: [
            { name: "dailyDemand", label: "Daily Demand (units)", type: "number", defaultValue: 400 },
            { name: "leadTime", label: "Lead Time (days)", type: "number", defaultValue: 2 },
            { name: "safetyFactor", label: "Safety Factor (%)", type: "number", defaultValue: 10 },
            { name: "containerSize", label: "Container Size (units)", type: "number", defaultValue: 50 }
        ],
        formulas: [
            { name: "demandDuringLT", label: "Demand During Lead Time", formula: "dailyDemand * leadTime" },
            { name: "safetyStock", label: "Safety Stock", formula: "demandDuringLT * (safetyFactor / 100)" },
            { name: "totalInventory", label: "Total Inventory Needed", formula: "demandDuringLT + safetyStock" },
            { name: "numberOfCards", label: "Number of Kanban Cards", formula: "ceil(totalInventory / containerSize)" }
        ]
    },
    {
        name: "Production Leveling (Heijunka)",
        icon: "📊",
        description: "Calculate production leveling schedule",
        translationKey: "template-lean-heijunka",
        inputs: [
            { name: "productADemand", label: "Product A Monthly Demand", type: "number", defaultValue: 1000 },
            { name: "productBDemand", label: "Product B Monthly Demand", type: "number", defaultValue: 500 },
            { name: "workingDays", label: "Working Days Per Month", type: "number", defaultValue: 20 },
            { name: "shiftsPerDay", label: "Shifts Per Day", type: "number", defaultValue: 2 }
        ],
        formulas: [
            { name: "totalDemand", label: "Total Monthly Demand", formula: "productADemand + productBDemand" },
            { name: "dailyProductA", label: "Daily Product A", formula: "productADemand / workingDays" },
            { name: "dailyProductB", label: "Daily Product B", formula: "productBDemand / workingDays" },
            { name: "productARatio", label: "Product A Ratio (%)", formula: "(productADemand / totalDemand) * 100" },
            { name: "productBRatio", label: "Product B Ratio (%)", formula: "(productBDemand / totalDemand) * 100" }
        ]
    },
    {
        name: "Standard Work Calculator",
        icon: "📝",
        description: "Calculate standard work components",
        translationKey: "template-lean-standard",
        inputs: [
            { name: "manualTime", label: "Manual Time (seconds)", type: "number", defaultValue: 35 },
            { name: "machineTime", label: "Machine Time (seconds)", type: "number", defaultValue: 20 },
            { name: "walkTime", label: "Walk Time (seconds)", type: "number", defaultValue: 5 },
            { name: "taktTime", label: "Takt Time (seconds)", type: "number", defaultValue: 65 }
        ],
        formulas: [
            { name: "totalCycleTime", label: "Total Cycle Time (seconds)", formula: "manualTime + machineTime + walkTime" },
            { name: "operatorUtilization", label: "Operator Utilization (%)", formula: "((manualTime + walkTime) / totalCycleTime) * 100" },
            { name: "machineUtilization", label: "Machine Utilization (%)", formula: "(machineTime / totalCycleTime) * 100" },
            { name: "capacityVsTakt", label: "Capacity vs Takt (%)", formula: "(totalCycleTime / taktTime) * 100" },
            { name: "idleTime", label: "Idle Time (seconds)", formula: "taktTime - totalCycleTime" }
        ]
    },
    {
        name: "Pull System Sizing",
        icon: "🔗",
        description: "Calculate buffer sizes for pull production",
        translationKey: "template-lean-pull",
        inputs: [
            { name: "avgDailyDemand", label: "Average Daily Demand", type: "number", defaultValue: 500 },
            { name: "demandVariability", label: "Demand Variability (Std Dev)", type: "number", defaultValue: 50 },
            { name: "replenishmentTime", label: "Replenishment Time (days)", type: "number", defaultValue: 1 },
            { name: "serviceLevel", label: "Service Level (Z-score)", type: "number", defaultValue: 1.65 }
        ],
        formulas: [
            { name: "avgDemandDuringRT", label: "Avg Demand During RT", formula: "avgDailyDemand * replenishmentTime" },
            { name: "safetyBuffer", label: "Safety Buffer", formula: "serviceLevel * demandVariability * sqrt(replenishmentTime)" },
            { name: "totalBufferSize", label: "Total Buffer Size", formula: "avgDemandDuringRT + safetyBuffer" },
            { name: "reorderPoint", label: "Reorder Point", formula: "ceil(totalBufferSize)" }
        ]
    },
    {
        name: "Changeover Reduction Analysis",
        icon: "🔧",
        description: "Analyze changeover time components",
        translationKey: "template-lean-changeover",
        inputs: [
            { name: "preparationTime", label: "Preparation Time (min)", type: "number", defaultValue: 15 },
            { name: "mountingTime", label: "Mounting/Removal Time (min)", type: "number", defaultValue: 30 },
            { name: "adjustmentTime", label: "Adjustment Time (min)", type: "number", defaultValue: 45 },
            { name: "trialRunTime", label: "Trial Run Time (min)", type: "number", defaultValue: 20 }
        ],
        formulas: [
            { name: "totalChangeoverTime", label: "Total Changeover Time (min)", formula: "preparationTime + mountingTime + adjustmentTime + trialRunTime" },
            { name: "internalTime", label: "Internal Time (min)", formula: "mountingTime + adjustmentTime + trialRunTime" },
            { name: "externalTime", label: "External Time (min)", formula: "preparationTime" },
            { name: "internalPercent", label: "Internal Time (%)", formula: "(internalTime / totalChangeoverTime) * 100" },
            { name: "potentialReduction", label: "Potential Reduction (min)", formula: "adjustmentTime * 0.5" }
        ]
    },
    {
        name: "Visual Management Metrics",
        icon: "👁️",
        description: "Calculate visual management effectiveness",
        translationKey: "template-lean-visual",
        inputs: [
            { name: "visualSignals", label: "Visual Signals Implemented", type: "number", defaultValue: 25 },
            { name: "totalOpportunities", label: "Total Opportunities", type: "number", defaultValue: 40 },
            { name: "issuesIdentified", label: "Issues Identified Visually", type: "number", defaultValue: 15 },
            { name: "totalIssues", label: "Total Issues", type: "number", defaultValue: 20 }
        ],
        formulas: [
            { name: "implementationRate", label: "Implementation Rate (%)", formula: "(visualSignals / totalOpportunities) * 100" },
            { name: "detectionRate", label: "Visual Detection Rate (%)", formula: "(issuesIdentified / totalIssues) * 100" },
            { name: "remainingOpportunities", label: "Remaining Opportunities", formula: "totalOpportunities - visualSignals" },
            { name: "effectiveness", label: "Overall Effectiveness (%)", formula: "((implementationRate / 100) * (detectionRate / 100)) * 100" }
        ]
    },
    {
        name: "Gemba Walk Metrics",
        icon: "🚶",
        description: "Track gemba walk observations and actions",
        translationKey: "template-lean-gemba",
        inputs: [
            { name: "observationsTotal", label: "Total Observations", type: "number", defaultValue: 30 },
            { name: "improvementOpps", label: "Improvement Opportunities", type: "number", defaultValue: 12 },
            { name: "actionsCreated", label: "Actions Created", type: "number", defaultValue: 10 },
            { name: "actionsCompleted", label: "Actions Completed", type: "number", defaultValue: 7 }
        ],
        formulas: [
            { name: "opportunityRate", label: "Opportunity Rate (%)", formula: "(improvementOpps / observationsTotal) * 100" },
            { name: "actionCreationRate", label: "Action Creation Rate (%)", formula: "(actionsCreated / improvementOpps) * 100" },
            { name: "actionCompletionRate", label: "Action Completion Rate (%)", formula: "(actionsCompleted / actionsCreated) * 100" },
            { name: "overallEffectiveness", label: "Overall Effectiveness (%)", formula: "(actionsCompleted / improvementOpps) * 100" }
        ]
    },
    {
        name: "Poka-Yoke Design Calculator",
        icon: "🛡️",
        description: "Calculate error-proofing effectiveness",
        translationKey: "template-lean-pokayoke",
        inputs: [
            { name: "defectsBeforePY", label: "Defects Before Poka-Yoke", type: "number", defaultValue: 500 },
            { name: "defectsAfterPY", label: "Defects After Poka-Yoke", type: "number", defaultValue: 50 },
            { name: "totalUnits", label: "Total Units Produced", type: "number", defaultValue: 10000 },
            { name: "costPerDefect", label: "Cost Per Defect", type: "number", defaultValue: 25 }
        ],
        formulas: [
            { name: "defectReduction", label: "Defect Reduction", formula: "defectsBeforePY - defectsAfterPY" },
            { name: "reductionPercent", label: "Reduction Percentage (%)", formula: "((defectsBeforePY - defectsAfterPY) / defectsBeforePY) * 100" },
            { name: "dpmBefore", label: "DPM Before", formula: "(defectsBeforePY / totalUnits) * 1000000" },
            { name: "dpmAfter", label: "DPM After", formula: "(defectsAfterPY / totalUnits) * 1000000" },
            { name: "costSavings", label: "Annual Cost Savings", formula: "defectReduction * costPerDefect" }
        ]
    },
    // NEW LEAN: Error Rate Tracker (DPMO)
    {
        name: "Error Rate Tracker (DPMO)",
        icon: "🎯",
        description: "Defects Per Million Opportunities — measure and track Six Sigma quality level",
        translationKey: "template-lean-dpmo",
        inputs: [
            { name: "defects", label: "Number of Defects", type: "number", defaultValue: 12 },
            { name: "totalUnits", label: "Total Units Inspected", type: "number", defaultValue: 5000 },
            { name: "opportunitiesPerUnit", label: "Opportunities per Unit", type: "number", defaultValue: 5 }
        ],
        formulas: [
            { name: "totalOpportunities", label: "Total Opportunities", formula: "totalUnits * opportunitiesPerUnit" },
            { name: "dpo", label: "Defects Per Opportunity", formula: "defects / totalOpportunities" },
            { name: "dpmo", label: "DPMO", formula: "dpo * 1000000" },
            { name: "yieldPct", label: "Process Yield (%)", formula: "(1 - dpo) * 100" },
            { name: "sigmaLevel", label: "Approx. Sigma Level", formula: "dpmo <= 3.4 ? 6 : (dpmo <= 233 ? 5 : (dpmo <= 6210 ? 4 : (dpmo <= 66807 ? 3 : (dpmo <= 308537 ? 2 : 1))))" }
        ]
    },
    // NEW LEAN: Line Balancing Efficiency
    {
        name: "Line Balancing Efficiency",
        icon: "⚖️",
        description: "Compare takt time vs cycle times per station to identify bottlenecks",
        translationKey: "template-lean-linebalance",
        inputs: [
            { name: "availableTimeMin", label: "Available Time (min/shift)", type: "number", defaultValue: 480 },
            { name: "customerDemand", label: "Customer Demand (units/shift)", type: "number", defaultValue: 240 },
            { name: "numStations", label: "Number of Stations", type: "number", defaultValue: 5 },
            { name: "station1", label: "Station 1 Cycle Time (min)", type: "number", defaultValue: 1.8 },
            { name: "station2", label: "Station 2 Cycle Time (min)", type: "number", defaultValue: 2.1 },
            { name: "station3", label: "Station 3 Cycle Time (min)", type: "number", defaultValue: 1.5 },
            { name: "station4", label: "Station 4 Cycle Time (min)", type: "number", defaultValue: 2.0 },
            { name: "station5", label: "Station 5 Cycle Time (min)", type: "number", defaultValue: 1.7 }
        ],
        formulas: [
            { name: "taktTime", label: "Takt Time (min/unit)", formula: "availableTimeMin / customerDemand" },
            { name: "totalWorkContent", label: "Total Work Content (min)", formula: "station1 + station2 + station3 + station4 + station5" },
            { name: "bottleneck", label: "Bottleneck Time (min)", formula: "max(station1, station2, station3, station4, station5)" },
            { name: "lineEfficiency", label: "Line Efficiency (%)", formula: "(totalWorkContent / (bottleneck * numStations)) * 100" },
            { name: "totalIdleTime", label: "Total Idle Time (min/unit)", formula: "(bottleneck * numStations) - totalWorkContent" },
            { name: "balanceDelay", label: "Balance Delay (%)", formula: "100 - lineEfficiency" }
        ]
    }
];

// Finance and Business templates
const financeTemplates = [
    {
        name: "ROI Calculator",
        icon: "💰",
        description: "Calculate Return on Investment",
        translationKey: "template-finance-roi",
        inputs: [
            { name: "initialInvestment", label: "Initial Investment", type: "number", defaultValue: 100000 },
            { name: "finalValue", label: "Final Value", type: "number", defaultValue: 150000 },
            { name: "timeYears", label: "Time Period (years)", type: "number", defaultValue: 3 }
        ],
        formulas: [
            { name: "totalReturn", label: "Total Return", formula: "finalValue - initialInvestment" },
            { name: "roi", label: "ROI (%)", formula: "((finalValue - initialInvestment) / initialInvestment) * 100" },
            { name: "annualizedROI", label: "Annualized ROI (%)", formula: "(pow((finalValue / initialInvestment), (1 / timeYears)) - 1) * 100" }
        ]
    },
    {
        name: "NPV Calculator",
        icon: "📊",
        description: "Calculate Net Present Value",
        translationKey: "template-finance-npv",
        inputs: [
            { name: "initialInvestment", label: "Initial Investment", type: "number", defaultValue: 100000 },
            { name: "yearOneCashFlow", label: "Year 1 Cash Flow", type: "number", defaultValue: 30000 },
            { name: "yearTwoCashFlow", label: "Year 2 Cash Flow", type: "number", defaultValue: 35000 },
            { name: "yearThreeCashFlow", label: "Year 3 Cash Flow", type: "number", defaultValue: 40000 },
            { name: "discountRate", label: "Discount Rate (%)", type: "number", defaultValue: 10 }
        ],
        formulas: [
            { name: "pvYear1", label: "PV Year 1", formula: "yearOneCashFlow / pow((1 + discountRate / 100), 1)" },
            { name: "pvYear2", label: "PV Year 2", formula: "yearTwoCashFlow / pow((1 + discountRate / 100), 2)" },
            { name: "pvYear3", label: "PV Year 3", formula: "yearThreeCashFlow / pow((1 + discountRate / 100), 3)" },
            { name: "totalPV", label: "Total Present Value", formula: "pvYear1 + pvYear2 + pvYear3" },
            { name: "npv", label: "Net Present Value", formula: "totalPV - initialInvestment" }
        ]
    },
    {
        name: "Payback Period",
        icon: "⏳",
        description: "Calculate time to recover investment",
        translationKey: "template-finance-payback",
        inputs: [
            { name: "initialInvestment", label: "Initial Investment", type: "number", defaultValue: 50000 },
            { name: "annualCashFlow", label: "Annual Cash Flow", type: "number", defaultValue: 15000 },
            { name: "monthlyCashFlow", label: "Monthly Cash Flow", type: "number", defaultValue: 1250 }
        ],
        formulas: [
            { name: "paybackYears", label: "Payback Period (years)", formula: "initialInvestment / annualCashFlow" },
            { name: "paybackMonths", label: "Payback Period (months)", formula: "initialInvestment / monthlyCashFlow" },
            { name: "remainingInvestment", label: "After 1 Year", formula: "initialInvestment - annualCashFlow" }
        ]
    },
    {
        name: "Depreciation Calculator",
        icon: "📉",
        description: "Calculate straight-line and declining balance depreciation",
        translationKey: "template-finance-depreciation",
        inputs: [
            { name: "assetCost", label: "Asset Cost", type: "number", defaultValue: 100000 },
            { name: "salvageValue", label: "Salvage Value", type: "number", defaultValue: 10000 },
            { name: "usefulLife", label: "Useful Life (years)", type: "number", defaultValue: 10 },
            { name: "decliningRate", label: "Declining Balance Rate (%)", type: "number", defaultValue: 20 }
        ],
        formulas: [
            { name: "depreciableBase", label: "Depreciable Base", formula: "assetCost - salvageValue" },
            { name: "straightLineAnnual", label: "Straight-Line Annual", formula: "depreciableBase / usefulLife" },
            { name: "straightLineRate", label: "Straight-Line Rate (%)", formula: "(1 / usefulLife) * 100" },
            { name: "decliningBalanceYear1", label: "Declining Balance Year 1", formula: "assetCost * (decliningRate / 100)" },
            { name: "bookValueAfterYear1", label: "Book Value After Year 1", formula: "assetCost - decliningBalanceYear1" }
        ]
    },
    {
        name: "Working Capital Ratio",
        icon: "💼",
        description: "Measure short-term liquidity",
        translationKey: "template-finance-working",
        inputs: [
            { name: "currentAssets", label: "Current Assets", type: "number", defaultValue: 500000 },
            { name: "currentLiabilities", label: "Current Liabilities", type: "number", defaultValue: 300000 },
            { name: "inventory", label: "Inventory", type: "number", defaultValue: 150000 },
            { name: "cash", label: "Cash", type: "number", defaultValue: 100000 }
        ],
        formulas: [
            { name: "workingCapital", label: "Working Capital", formula: "currentAssets - currentLiabilities" },
            { name: "currentRatio", label: "Current Ratio", formula: "currentAssets / currentLiabilities" },
            { name: "quickAssets", label: "Quick Assets", formula: "currentAssets - inventory" },
            { name: "quickRatio", label: "Quick Ratio", formula: "quickAssets / currentLiabilities" },
            { name: "cashRatio", label: "Cash Ratio", formula: "cash / currentLiabilities" }
        ]
    },
    {
        name: "Profit Margin Analysis",
        icon: "📈",
        description: "Calculate various profit margins",
        translationKey: "template-finance-profit",
        inputs: [
            { name: "revenue", label: "Total Revenue", type: "number", defaultValue: 1000000 },
            { name: "cogs", label: "Cost of Goods Sold", type: "number", defaultValue: 600000 },
            { name: "operatingExpenses", label: "Operating Expenses", type: "number", defaultValue: 250000 },
            { name: "interestTax", label: "Interest & Tax", type: "number", defaultValue: 50000 }
        ],
        formulas: [
            { name: "grossProfit", label: "Gross Profit", formula: "revenue - cogs" },
            { name: "grossMargin", label: "Gross Margin (%)", formula: "((revenue - cogs) / revenue) * 100" },
            { name: "operatingProfit", label: "Operating Profit", formula: "grossProfit - operatingExpenses" },
            { name: "operatingMargin", label: "Operating Margin (%)", formula: "(operatingProfit / revenue) * 100" },
            { name: "netProfit", label: "Net Profit", formula: "operatingProfit - interestTax" },
            { name: "netMargin", label: "Net Margin (%)", formula: "(netProfit / revenue) * 100" }
        ]
    },
    {
        name: "EBITDA Calculator",
        icon: "💵",
        description: "Calculate Earnings Before Interest, Taxes, Depreciation, and Amortization",
        translationKey: "template-finance-ebitda",
        inputs: [
            { name: "revenue", label: "Total Revenue", type: "number", defaultValue: 2000000 },
            { name: "operatingExpenses", label: "Operating Expenses", type: "number", defaultValue: 800000 },
            { name: "depreciation", label: "Depreciation", type: "number", defaultValue: 100000 },
            { name: "amortization", label: "Amortization", type: "number", defaultValue: 50000 }
        ],
        formulas: [
            { name: "ebitda", label: "EBITDA", formula: "revenue - operatingExpenses + depreciation + amortization" },
            { name: "ebitdaMargin", label: "EBITDA Margin (%)", formula: "(ebitda / revenue) * 100" },
            { name: "operatingIncome", label: "Operating Income", formula: "revenue - operatingExpenses" }
        ]
    },
    {
        name: "Debt-to-Equity Ratio",
        icon: "⚖️",
        description: "Measure financial leverage",
        translationKey: "template-finance-debt",
        inputs: [
            { name: "totalDebt", label: "Total Debt", type: "number", defaultValue: 500000 },
            { name: "totalEquity", label: "Total Equity", type: "number", defaultValue: 750000 },
            { name: "shortTermDebt", label: "Short-Term Debt", type: "number", defaultValue: 100000 },
            { name: "longTermDebt", label: "Long-Term Debt", type: "number", defaultValue: 400000 }
        ],
        formulas: [
            { name: "debtToEquity", label: "Debt-to-Equity Ratio", formula: "totalDebt / totalEquity" },
            { name: "debtRatio", label: "Debt Ratio", formula: "totalDebt / (totalDebt + totalEquity)" },
            { name: "equityMultiplier", label: "Equity Multiplier", formula: "(totalDebt + totalEquity) / totalEquity" },
            { name: "ltDebtToEquity", label: "Long-Term D/E", formula: "longTermDebt / totalEquity" }
        ]
    },
    {
        name: "Cash Flow Analysis",
        icon: "💸",
        description: "Analyze operating cash flow",
        translationKey: "template-finance-cashflow",
        inputs: [
            { name: "netIncome", label: "Net Income", type: "number", defaultValue: 200000 },
            { name: "depreciation", label: "Depreciation", type: "number", defaultValue: 50000 },
            { name: "changeAR", label: "Change in Accounts Receivable", type: "number", defaultValue: 20000 },
            { name: "changeInventory", label: "Change in Inventory", type: "number", defaultValue: 15000 },
            { name: "changeAP", label: "Change in Accounts Payable", type: "number", defaultValue: 10000 }
        ],
        formulas: [
            { name: "operatingCashFlow", label: "Operating Cash Flow", formula: "netIncome + depreciation - changeAR - changeInventory + changeAP" },
            { name: "cashFlowMargin", label: "Cash Flow Margin (%)", formula: "(operatingCashFlow / (netIncome * 5)) * 100" },
            { name: "qualityOfEarnings", label: "Quality of Earnings", formula: "operatingCashFlow / netIncome" }
        ]
    },
    {
        name: "Budget Variance Analysis",
        icon: "📊",
        description: "Compare actual vs budgeted performance",
        translationKey: "template-finance-variance",
        inputs: [
            { name: "budgetedRevenue", label: "Budgeted Revenue", type: "number", defaultValue: 500000 },
            { name: "actualRevenue", label: "Actual Revenue", type: "number", defaultValue: 520000 },
            { name: "budgetedCosts", label: "Budgeted Costs", type: "number", defaultValue: 300000 },
            { name: "actualCosts", label: "Actual Costs", type: "number", defaultValue: 310000 }
        ],
        formulas: [
            { name: "revenueVariance", label: "Revenue Variance", formula: "actualRevenue - budgetedRevenue" },
            { name: "revenueVariancePct", label: "Revenue Variance (%)", formula: "((actualRevenue - budgetedRevenue) / budgetedRevenue) * 100" },
            { name: "costVariance", label: "Cost Variance", formula: "actualCosts - budgetedCosts" },
            { name: "costVariancePct", label: "Cost Variance (%)", formula: "((actualCosts - budgetedCosts) / budgetedCosts) * 100" },
            { name: "budgetedProfit", label: "Budgeted Profit", formula: "budgetedRevenue - budgetedCosts" },
            { name: "actualProfit", label: "Actual Profit", formula: "actualRevenue - actualCosts" },
            { name: "profitVariance", label: "Profit Variance", formula: "actualProfit - budgetedProfit" }
        ]
    },
    {
        name: "Cost-Benefit Analysis",
        icon: "💡",
        description: "Evaluate project viability",
        translationKey: "template-finance-costbenefit",
        inputs: [
            { name: "implementationCost", label: "Implementation Cost", type: "number", defaultValue: 100000 },
            { name: "annualBenefit", label: "Annual Benefit", type: "number", defaultValue: 35000 },
            { name: "annualCost", label: "Annual Operating Cost", type: "number", defaultValue: 5000 },
            { name: "projectLifeYears", label: "Project Life (years)", type: "number", defaultValue: 5 }
        ],
        formulas: [
            { name: "netAnnualBenefit", label: "Net Annual Benefit", formula: "annualBenefit - annualCost" },
            { name: "totalBenefits", label: "Total Benefits", formula: "annualBenefit * projectLifeYears" },
            { name: "totalCosts", label: "Total Costs", formula: "implementationCost + (annualCost * projectLifeYears)" },
            { name: "netBenefit", label: "Net Benefit", formula: "totalBenefits - totalCosts" },
            { name: "benefitCostRatio", label: "Benefit-Cost Ratio", formula: "totalBenefits / totalCosts" },
            { name: "simplePayback", label: "Simple Payback (years)", formula: "implementationCost / netAnnualBenefit" }
        ]
    },
    {
        name: "Price Elasticity",
        icon: "📉",
        description: "Calculate demand price elasticity",
        translationKey: "template-finance-elasticity",
        inputs: [
            { name: "originalPrice", label: "Original Price", type: "number", defaultValue: 100 },
            { name: "newPrice", label: "New Price", type: "number", defaultValue: 110 },
            { name: "originalQuantity", label: "Original Quantity", type: "number", defaultValue: 1000 },
            { name: "newQuantity", label: "New Quantity", type: "number", defaultValue: 900 }
        ],
        formulas: [
            { name: "priceChange", label: "Price Change (%)", formula: "((newPrice - originalPrice) / originalPrice) * 100" },
            { name: "quantityChange", label: "Quantity Change (%)", formula: "((newQuantity - originalQuantity) / originalQuantity) * 100" },
            { name: "priceElasticity", label: "Price Elasticity", formula: "quantityChange / priceChange" },
            { name: "elasticityType", label: "Elasticity Type", formula: "abs(priceElasticity) > 1 ? 1 : 0" },
            { name: "revenueChange", label: "Revenue Change", formula: "(newPrice * newQuantity) - (originalPrice * originalQuantity)" }
        ]
    },
    {
        name: "Economic Order Quantity (Finance View)",
        icon: "📦",
        description: "Optimize order quantities with financial focus",
        translationKey: "template-finance-eoq",
        inputs: [
            { name: "annualDemand", label: "Annual Demand", type: "number", defaultValue: 10000 },
            { name: "orderingCost", label: "Cost Per Order", type: "number", defaultValue: 50 },
            { name: "holdingCostRate", label: "Holding Cost Rate (%)", type: "number", defaultValue: 20 },
            { name: "unitCost", label: "Unit Cost", type: "number", defaultValue: 10 }
        ],
        formulas: [
            { name: "holdingCost", label: "Holding Cost Per Unit", formula: "unitCost * (holdingCostRate / 100)" },
            { name: "eoq", label: "Economic Order Quantity", formula: "sqrt((2 * annualDemand * orderingCost) / holdingCost)" },
            { name: "numberOfOrders", label: "Number of Orders", formula: "annualDemand / eoq" },
            { name: "totalOrderingCost", label: "Total Ordering Cost", formula: "numberOfOrders * orderingCost" },
            { name: "avgInventory", label: "Average Inventory", formula: "eoq / 2" },
            { name: "totalHoldingCost", label: "Total Holding Cost", formula: "avgInventory * holdingCost" },
            { name: "totalInventoryCost", label: "Total Inventory Cost", formula: "totalOrderingCost + totalHoldingCost" }
        ]
    },
    // NEW FINANCE: Cash Conversion Cycle
    {
        name: "Cash Conversion Cycle",
        icon: "🔄",
        description: "Measure how long cash is tied up in operations: DIO + DSO - DPO",
        translationKey: "template-finance-ccc",
        inputs: [
            { name: "inventoryDays", label: "Days Inventory Outstanding (DIO)", type: "number", defaultValue: 45 },
            { name: "dso", label: "Days Sales Outstanding (DSO)", type: "number", defaultValue: 35 },
            { name: "dpo", label: "Days Payable Outstanding (DPO)", type: "number", defaultValue: 30 },
            { name: "dailyRevenue", label: "Daily Revenue", type: "number", defaultValue: 10000 }
        ],
        formulas: [
            { name: "ccc", label: "Cash Conversion Cycle (days)", formula: "inventoryDays + dso - dpo" },
            { name: "cashTiedUp", label: "Cash Tied Up", formula: "ccc * dailyRevenue" },
            { name: "ccStatus", label: "CCC Status", formula: "ccc <= 30 ? 'Excellent' : (ccc <= 60 ? 'Good' : (ccc <= 90 ? 'Average' : 'Poor'))" }
        ]
    },
    // NEW FINANCE: WACC Calculator
    {
        name: "WACC Calculator",
        icon: "📐",
        description: "Weighted Average Cost of Capital — used as discount rate for investment decisions",
        translationKey: "template-finance-wacc",
        inputs: [
            { name: "equityValue", label: "Market Value of Equity", type: "number", defaultValue: 600000 },
            { name: "debtValue", label: "Market Value of Debt", type: "number", defaultValue: 400000 },
            { name: "costOfEquity", label: "Cost of Equity (%)", type: "number", defaultValue: 12 },
            { name: "costOfDebt", label: "Cost of Debt (%)", type: "number", defaultValue: 6 },
            { name: "taxRate", label: "Corporate Tax Rate (%)", type: "number", defaultValue: 22 }
        ],
        formulas: [
            { name: "totalCapital", label: "Total Capital", formula: "equityValue + debtValue" },
            { name: "equityWeight", label: "Equity Weight (%)", formula: "(equityValue / totalCapital) * 100" },
            { name: "debtWeight", label: "Debt Weight (%)", formula: "(debtValue / totalCapital) * 100" },
            { name: "afterTaxDebt", label: "After-Tax Cost of Debt (%)", formula: "costOfDebt * (1 - taxRate / 100)" },
            { name: "wacc", label: "WACC (%)", formula: "((equityWeight / 100) * costOfEquity) + ((debtWeight / 100) * afterTaxDebt)" }
        ]
    }
];

// Math templates for general calculations
const mathTemplates = [
    {
        name: "Percentage Calculator",
        icon: "📊",
        description: "Calculate percentages and changes",
        translationKey: "template-math-percentage",
        inputs: [
            { name: "value", label: "Value", type: "number", defaultValue: 80 },
            { name: "total", label: "Total", type: "number", defaultValue: 100 },
            { name: "oldValue", label: "Old Value", type: "number", defaultValue: 50 },
            { name: "newValue", label: "New Value", type: "number", defaultValue: 80 }
        ],
        formulas: [
            { name: "percentage", label: "Percentage", formula: "(value / total) * 100" },
            { name: "change", label: "Change", formula: "newValue - oldValue" },
            { name: "percentChange", label: "Percent Change", formula: "((newValue - oldValue) / oldValue) * 100" }
        ]
    },
    {
        name: "Linear Equation Solver",
        icon: "📐",
        description: "Solve y = mx + b",
        translationKey: "template-math-linear",
        inputs: [
            { name: "m", label: "Slope (m)", type: "number", defaultValue: 2 },
            { name: "x", label: "X Value", type: "number", defaultValue: 5 },
            { name: "b", label: "Y-Intercept (b)", type: "number", defaultValue: 3 }
        ],
        formulas: [
            { name: "y", label: "Y Value", formula: "m * x + b" }
        ],
        graph: {
            enabled: true,
            type: "line",
            xAxis: "x",
            yAxis: "y"
        }
    },
    {
        name: "Compound Interest",
        icon: "💵",
        description: "Calculate compound interest over time",
        translationKey: "template-math-compound",
        inputs: [
            { name: "principal", label: "Principal Amount", type: "number", defaultValue: 1000 },
            { name: "rate", label: "Annual Interest Rate (%)", type: "number", defaultValue: 5 },
            { name: "time", label: "Time Period (years)", type: "number", defaultValue: 10 },
            { name: "n", label: "Compounds Per Year", type: "number", defaultValue: 12 }
        ],
        formulas: [
            { name: "amount", label: "Final Amount", formula: "principal * pow((1 + (rate/100) / n), n * time)" },
            { name: "interest", label: "Total Interest Earned", formula: "amount - principal" }
        ]
    },
    {
        name: "Profit Margin Calculator",
        icon: "💰",
        description: "Calculate profit margins and markups",
        translationKey: "template-math-profitmargin",
        inputs: [
            { name: "revenue", label: "Revenue", type: "number", defaultValue: 10000 },
            { name: "cost", label: "Cost", type: "number", defaultValue: 7000 }
        ],
        formulas: [
            { name: "profit", label: "Profit", formula: "revenue - cost" },
            { name: "profitMargin", label: "Profit Margin %", formula: "(profit / revenue) * 100" },
            { name: "markup", label: "Markup %", formula: "(profit / cost) * 100" },
            { name: "roi", label: "ROI %", formula: "(profit / cost) * 100" }
        ]
    },
    {
        name: "Unit Conversion",
        icon: "⚖️",
        description: "Convert between different units",
        translationKey: "template-math-unitconversion",
        inputs: [
            { name: "value", label: "Value", type: "number", defaultValue: 100 },
            { name: "factor", label: "Conversion Factor", type: "number", defaultValue: 2.54 }
        ],
        formulas: [
            { name: "converted", label: "Converted Value", formula: "value * factor" }
        ]
    },
    {
        name: "Weighted Average",
        icon: "⚖️",
        description: "Calculate weighted average",
        translationKey: "template-math-weightedaverage",
        inputs: [
            { name: "value1", label: "Value 1", type: "number", defaultValue: 80 },
            { name: "weight1", label: "Weight 1", type: "number", defaultValue: 3 },
            { name: "value2", label: "Value 2", type: "number", defaultValue: 90 },
            { name: "weight2", label: "Weight 2", type: "number", defaultValue: 2 },
            { name: "value3", label: "Value 3", type: "number", defaultValue: 85 },
            { name: "weight3", label: "Weight 3", type: "number", defaultValue: 5 }
        ],
        formulas: [
            { name: "totalWeight", label: "Total Weight", formula: "weight1 + weight2 + weight3" },
            { name: "weightedSum", label: "Weighted Sum", formula: "(value1 * weight1) + (value2 * weight2) + (value3 * weight3)" },
            { name: "weightedAverage", label: "Weighted Average", formula: "weightedSum / totalWeight" }
        ]
    },
    {
        name: "Loan Payment Calculator",
        icon: "🏦",
        description: "Calculate monthly loan payments",
        translationKey: "template-math-loanpayment",
        inputs: [
            { name: "loanAmount", label: "Loan Amount", type: "number", defaultValue: 200000 },
            { name: "annualRate", label: "Annual Interest Rate (%)", type: "number", defaultValue: 4.5 },
            { name: "years", label: "Loan Term (years)", type: "number", defaultValue: 30 }
        ],
        formulas: [
            { name: "monthlyRate", label: "Monthly Rate", formula: "(annualRate / 100) / 12" },
            { name: "numPayments", label: "Number of Payments", formula: "years * 12" },
            { name: "monthlyPayment", label: "Monthly Payment", formula: "loanAmount * (monthlyRate * pow(1 + monthlyRate, numPayments)) / (pow(1 + monthlyRate, numPayments) - 1)" },
            { name: "totalPaid", label: "Total Amount Paid", formula: "monthlyPayment * numPayments" },
            { name: "totalInterest", label: "Total Interest", formula: "totalPaid - loanAmount" }
        ]
    },
    {
        name: "Discount Calculator",
        icon: "🏷️",
        description: "Calculate discounts and final prices",
        translationKey: "template-math-discount",
        inputs: [
            { name: "originalPrice", label: "Original Price", type: "number", defaultValue: 100 },
            { name: "discountPercent", label: "Discount %", type: "number", defaultValue: 20 }
        ],
        formulas: [
            { name: "discountAmount", label: "Discount Amount", formula: "(originalPrice * discountPercent) / 100" },
            { name: "finalPrice", label: "Final Price", formula: "originalPrice - discountAmount" },
            { name: "savings", label: "You Save", formula: "discountAmount" }
        ]
    },
    {
        name: "Distance Speed Time",
        icon: "🚗",
        description: "Calculate distance, speed, or time",
        translationKey: "template-math-distancespeedtime",
        inputs: [
            { name: "distance", label: "Distance (km)", type: "number", defaultValue: 100 },
            { name: "time", label: "Time (hours)", type: "number", defaultValue: 2 }
        ],
        formulas: [
            { name: "speed", label: "Speed (km/h)", formula: "distance / time" },
            { name: "timeForDouble", label: "Time for 2x Distance", formula: "(distance * 2) / speed" }
        ]
    },
    {
        name: "Shipping Cost Calculator",
        icon: "📦",
        description: "Calculate shipping costs with volume/weight tiers",
        translationKey: "template-math-shippingcost",
        inputs: [
            { name: "weight", label: "Package Weight (kg)", type: "number", defaultValue: 5 },
            { name: "distance", label: "Distance (km)", type: "number", defaultValue: 100 },
            { name: "baseRate", label: "Base Rate per kg", type: "number", defaultValue: 2.5 },
            { name: "distanceFee", label: "Distance Fee per 100km", type: "number", defaultValue: 5 },
            { name: "handlingFee", label: "Handling Fee", type: "number", defaultValue: 10 }
        ],
        formulas: [
            { name: "weightCost", label: "Weight Cost", formula: "weight * baseRate" },
            { name: "distanceCost", label: "Distance Cost", formula: "(distance / 100) * distanceFee" },
            { name: "totalShipping", label: "Total Shipping Cost", formula: "weightCost + distanceCost + handlingFee" },
            { name: "costPerKg", label: "Cost per kg", formula: "totalShipping / weight" }
        ]
    },
    {
        name: "Order Fulfillment Time",
        icon: "⏰",
        description: "Calculate complete order fulfillment timeline",
        translationKey: "template-math-orderfulfillment",
        inputs: [
            { name: "orderProcessing", label: "Order Processing (hours)", type: "number", defaultValue: 2 },
            { name: "pickingTime", label: "Picking Time (hours)", type: "number", defaultValue: 1 },
            { name: "packingTime", label: "Packing Time (hours)", type: "number", defaultValue: 0.5 },
            { name: "qualityCheck", label: "Quality Check (hours)", type: "number", defaultValue: 0.5 },
            { name: "shippingTime", label: "Shipping Time (hours)", type: "number", defaultValue: 24 }
        ],
        formulas: [
            { name: "warehouseTime", label: "Warehouse Processing Time", formula: "orderProcessing + pickingTime + packingTime + qualityCheck" },
            { name: "totalTime", label: "Total Fulfillment Time (hours)", formula: "warehouseTime + shippingTime" },
            { name: "totalDays", label: "Total Days", formula: "totalTime / 24" },
            { name: "warehouseEfficiency", label: "Warehouse Efficiency %", formula: "(warehouseTime / totalTime) * 100" }
        ]
    },
    {
        name: "Bulk Discount Pricing",
        icon: "💳",
        description: "Calculate tiered bulk discount pricing",
        translationKey: "template-math-bulkdiscount",
        inputs: [
            { name: "unitPrice", label: "Unit Price", type: "number", defaultValue: 10 },
            { name: "quantity", label: "Quantity", type: "number", defaultValue: 150 },
            { name: "tier1Min", label: "Tier 1 Min Qty", type: "number", defaultValue: 100 },
            { name: "tier1Discount", label: "Tier 1 Discount %", type: "number", defaultValue: 10 },
            { name: "tier2Min", label: "Tier 2 Min Qty", type: "number", defaultValue: 200 },
            { name: "tier2Discount", label: "Tier 2 Discount %", type: "number", defaultValue: 20 }
        ],
        formulas: [
            { name: "baseCost", label: "Base Cost", formula: "unitPrice * quantity" },
            { name: "appliedDiscount", label: "Applied Discount %", formula: "quantity >= tier2Min ? tier2Discount : (quantity >= tier1Min ? tier1Discount : 0)" },
            { name: "discountAmount", label: "Discount Amount", formula: "(baseCost * appliedDiscount) / 100" },
            { name: "finalCost", label: "Final Cost", formula: "baseCost - discountAmount" },
            { name: "savingsPerUnit", label: "Savings per Unit", formula: "discountAmount / quantity" }
        ]
    },
    {
        name: "Service Level Calculator",
        icon: "🎯",
        description: "Calculate service level and stockout probability",
        translationKey: "template-math-servicelevel",
        inputs: [
            { name: "demandFilled", label: "Demand Filled", type: "number", defaultValue: 950 },
            { name: "totalDemand", label: "Total Demand", type: "number", defaultValue: 1000 },
            { name: "ordersFilled", label: "Orders Filled", type: "number", defaultValue: 95 },
            { name: "totalOrders", label: "Total Orders", type: "number", defaultValue: 100 }
        ],
        formulas: [
            { name: "fillRate", label: "Fill Rate %", formula: "(demandFilled / totalDemand) * 100" },
            { name: "orderFillRate", label: "Order Fill Rate %", formula: "(ordersFilled / totalOrders) * 100" },
            { name: "stockoutRate", label: "Stockout Rate %", formula: "100 - fillRate" },
            { name: "unitsShort", label: "Units Short", formula: "totalDemand - demandFilled" },
            { name: "serviceLevel", label: "Service Level", formula: "fillRate" }
        ]
    },
    {
        name: "Queue/Wait Time Calculator",
        icon: "⏳",
        description: "Calculate average wait times and queue length",
        translationKey: "template-math-queuetime",
        inputs: [
            { name: "arrivalRate", label: "Arrival Rate (per hour)", type: "number", defaultValue: 20 },
            { name: "serviceRate", label: "Service Rate (per hour)", type: "number", defaultValue: 25 },
            { name: "servers", label: "Number of Servers", type: "number", defaultValue: 1 }
        ],
        formulas: [
            { name: "utilization", label: "Utilization %", formula: "(arrivalRate / (serviceRate * servers)) * 100" },
            { name: "avgQueueLength", label: "Avg Queue Length", formula: "(arrivalRate * arrivalRate) / (serviceRate * (serviceRate - arrivalRate))" },
            { name: "avgWaitTime", label: "Avg Wait Time (minutes)", formula: "(avgQueueLength / arrivalRate) * 60" },
            { name: "avgSystemTime", label: "Avg Time in System (minutes)", formula: "(1 / (serviceRate - arrivalRate)) * 60" }
        ]
    },
    {
        name: "Carbon Footprint Calculator",
        icon: "🌍",
        description: "Calculate logistics carbon emissions",
        translationKey: "template-math-carbonfootprint",
        inputs: [
            { name: "distance", label: "Distance (km)", type: "number", defaultValue: 500 },
            { name: "fuelConsumption", label: "Fuel Consumption (L/100km)", type: "number", defaultValue: 25 },
            { name: "co2PerLiter", label: "CO2 per Liter (kg)", type: "number", defaultValue: 2.68 },
            { name: "trips", label: "Number of Trips", type: "number", defaultValue: 10 }
        ],
        formulas: [
            { name: "fuelUsedPerTrip", label: "Fuel per Trip (L)", formula: "(distance / 100) * fuelConsumption" },
            { name: "co2PerTrip", label: "CO2 per Trip (kg)", formula: "fuelUsedPerTrip * co2PerLiter" },
            { name: "totalCO2", label: "Total CO2 (kg)", formula: "co2PerTrip * trips" },
            { name: "totalCO2Tons", label: "Total CO2 (tons)", formula: "totalCO2 / 1000" },
            { name: "co2PerKm", label: "CO2 per km (kg)", formula: "totalCO2 / (distance * trips)" }
        ]
    },
    {
        name: "Temperature Converter",
        icon: "🌡️",
        description: "Convert between Celsius and Fahrenheit",
        translationKey: "template-math-temperature",
        inputs: [
            { name: "celsius", label: "Celsius", type: "number", defaultValue: 25 }
        ],
        formulas: [
            { name: "fahrenheit", label: "Fahrenheit", formula: "(celsius * 9/5) + 32" },
            { name: "kelvin", label: "Kelvin", formula: "celsius + 273.15" }
        ]
    },
    {
        name: "Loan Amortization Schedule",
        icon: "💳",
        description: "Calculate detailed loan payment breakdown",
        translationKey: "template-math-amortization",
        inputs: [
            { name: "principal", label: "Loan Principal", type: "number", defaultValue: 200000 },
            { name: "annualRate", label: "Annual Interest Rate %", type: "number", defaultValue: 4.5 },
            { name: "years", label: "Loan Term (years)", type: "number", defaultValue: 30 },
            { name: "paymentNumber", label: "Payment Number (1-360)", type: "number", defaultValue: 1 }
        ],
        formulas: [
            { name: "monthlyRate", label: "Monthly Interest Rate", formula: "(annualRate / 100) / 12" },
            { name: "numPayments", label: "Total Payments", formula: "years * 12" },
            { name: "monthlyPayment", label: "Monthly Payment", formula: "principal * (monthlyRate * pow(1 + monthlyRate, numPayments)) / (pow(1 + monthlyRate, numPayments) - 1)" },
            { name: "totalPaid", label: "Total Amount Paid", formula: "monthlyPayment * numPayments" },
            { name: "totalInterest", label: "Total Interest Paid", formula: "totalPaid - principal" },
            { name: "currentBalance", label: "Balance at Payment N", formula: "principal * ((pow(1 + monthlyRate, numPayments) - pow(1 + monthlyRate, paymentNumber - 1)) / (pow(1 + monthlyRate, numPayments) - 1))" }
        ]
    },
    {
        name: "Retirement Savings Planner",
        icon: "🏖️",
        description: "Plan for retirement with compound growth",
        translationKey: "template-math-retirement",
        inputs: [
            { name: "currentAge", label: "Current Age", type: "number", defaultValue: 30 },
            { name: "retirementAge", label: "Retirement Age", type: "number", defaultValue: 65 },
            { name: "currentSavings", label: "Current Savings", type: "number", defaultValue: 50000 },
            { name: "monthlyContribution", label: "Monthly Contribution", type: "number", defaultValue: 500 },
            { name: "annualReturn", label: "Expected Annual Return %", type: "number", defaultValue: 7 }
        ],
        formulas: [
            { name: "yearsToRetirement", label: "Years to Retirement", formula: "retirementAge - currentAge" },
            { name: "totalMonths", label: "Total Months", formula: "yearsToRetirement * 12" },
            { name: "monthlyRate", label: "Monthly Return Rate", formula: "(annualReturn / 100) / 12" },
            { name: "futureValueCurrent", label: "Future Value of Current", formula: "currentSavings * pow(1 + monthlyRate, totalMonths)" },
            { name: "futureValueContributions", label: "Future Value of Contributions", formula: "monthlyContribution * ((pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate)" },
            { name: "totalRetirement", label: "Total at Retirement", formula: "futureValueCurrent + futureValueContributions" },
            { name: "totalContributed", label: "Total You Contributed", formula: "currentSavings + (monthlyContribution * totalMonths)" },
            { name: "investmentGain", label: "Investment Gain", formula: "totalRetirement - totalContributed" }
        ]
    },
    {
        name: "Break-Even Point (Units & Revenue)",
        icon: "📍",
        description: "Calculate break-even in both units and dollars",
        translationKey: "template-math-breakeven",
        inputs: [
            { name: "fixedCosts", label: "Fixed Costs", type: "number", defaultValue: 50000 },
            { name: "pricePerUnit", label: "Price per Unit", type: "number", defaultValue: 100 },
            { name: "variableCostPerUnit", label: "Variable Cost per Unit", type: "number", defaultValue: 60 },
            { name: "targetProfit", label: "Target Profit", type: "number", defaultValue: 20000 }
        ],
        formulas: [
            { name: "contributionMargin", label: "Contribution Margin", formula: "pricePerUnit - variableCostPerUnit" },
            { name: "contributionMarginRatio", label: "CM Ratio %", formula: "(contributionMargin / pricePerUnit) * 100" },
            { name: "breakEvenUnits", label: "Break-Even Units", formula: "fixedCosts / contributionMargin" },
            { name: "breakEvenRevenue", label: "Break-Even Revenue", formula: "breakEvenUnits * pricePerUnit" },
            { name: "unitsForTarget", label: "Units for Target Profit", formula: "(fixedCosts + targetProfit) / contributionMargin" },
            { name: "revenueForTarget", label: "Revenue for Target Profit", formula: "unitsForTarget * pricePerUnit" }
        ]
    },
    {
        name: "Statistical Analysis",
        icon: "📐",
        description: "Calculate mean, median, standard deviation",
        translationKey: "template-math-statistical",
        inputs: [
            { name: "val1", label: "Value 1", type: "number", defaultValue: 10 },
            { name: "val2", label: "Value 2", type: "number", defaultValue: 20 },
            { name: "val3", label: "Value 3", type: "number", defaultValue: 30 },
            { name: "val4", label: "Value 4", type: "number", defaultValue: 40 },
            { name: "val5", label: "Value 5", type: "number", defaultValue: 50 }
        ],
        formulas: [
            { name: "mean", label: "Mean (Average)", formula: "(val1 + val2 + val3 + val4 + val5) / 5" },
            { name: "total", label: "Sum Total", formula: "val1 + val2 + val3 + val4 + val5" },
            { name: "minValue", label: "Minimum Value", formula: "min(val1, val2, val3, val4, val5)" },
            { name: "maxValue", label: "Maximum Value", formula: "max(val1, val2, val3, val4, val5)" },
            { name: "range", label: "Range", formula: "maxValue - minValue" },
            { name: "variance", label: "Variance (approx)", formula: "((val1-mean)^2 + (val2-mean)^2 + (val3-mean)^2 + (val4-mean)^2 + (val5-mean)^2) / 5" },
            { name: "stdDev", label: "Standard Deviation", formula: "sqrt(variance)" }
        ]
    },
    {
        name: "Lastsikring (Cargo Securing)",
        icon: "🚛",
        description: "Comprehensive cargo securing calculator with EN 12195-1:2010 standards, multiple methods, and safety analysis",
        translationKey: "template-lastsikring",
        inputs: [
            { name: "securingMethod", label: "Securing Method", type: "select", options: ["Overfaldssurring (Top-over)", "Loopsurring (Loop)", "Grime/Fjedersurring (Spring)", "Direkte Surring (Direct)", "Blocking/Opklodsning"], defaultValue: "Overfaldssurring (Top-over)" },
            { name: "cargoWeight", label: "Cargo Weight (tons)", type: "number", defaultValue: 10 },
            { name: "cargoHeight", label: "Cargo Height (m)", type: "number", defaultValue: 2.0, step: 0.1 },
            { name: "cargoWidth", label: "Cargo Width/Base (m)", type: "number", defaultValue: 1.2, step: 0.1 },
            { name: "cargoLength", label: "Cargo Length (m)", type: "number", defaultValue: 2.5, step: 0.1 },
            { name: "lashingCapacity", label: "Lashing Capacity LC (daN)", type: "number", defaultValue: 2500 },
            { name: "standardForce", label: "Standard Tension Force STF (daN)", type: "number", defaultValue: 500 },
            { name: "frictionCoeff", label: "Friction Coefficient (μ)", type: "number", defaultValue: 0.30, step: 0.05 },
            { name: "lashingAngle", label: "Lashing Angle (degrees)", type: "number", defaultValue: 90, step: 5 },
            { name: "numberOfLashingPoints", label: "Number of Lashing Points", type: "number", defaultValue: 4 },
            { name: "safetyFactor", label: "Additional Safety Factor (%)", type: "number", defaultValue: 0, step: 5 },
            { name: "weatherConditions", label: "Weather/Road Conditions", type: "select", options: ["Normal", "Poor (wet/icy)", "Extreme"], defaultValue: "Normal" },
            { name: "cargoStability", label: "Cargo Stability", type: "select", options: ["Stable/Rigid", "Moderately Stable", "Unstable/Fragile"], defaultValue: "Stable/Rigid" }
        ],
        formulas: [
            // Dimensional Calculations
            { name: "hbRatio", label: "Height/Base Ratio (H/B)", formula: "cargoHeight / cargoWidth" },
            { name: "cargoVolume", label: "Cargo Volume (m³)", formula: "cargoHeight * cargoWidth * cargoLength" },
            { name: "cargoDensity", label: "Cargo Density (kg/m³)", formula: "cargoVolume > 0 ? (cargoWeight * 1000) / cargoVolume : 0" },
            
            // Lashing Components
            { name: "verticalComponent", label: "Vertical Component (sin α)", formula: "abs(sin(lashingAngle * PI / 180))" },
            { name: "horizontalComponent", label: "Horizontal Component (cos α)", formula: "abs(cos(lashingAngle * PI / 180))" },
            { name: "effectiveSTF", label: "Effective STF per Lashing", formula: "standardForce * (verticalComponent * frictionCoeff + horizontalComponent)" },
            
            // EU Acceleration Forces (EN 12195-1:2010)
            { name: "forwardForce", label: "Forward Acceleration (0.8g)", formula: "cargoWeight * 1000 * 0.8" },
            { name: "backwardForce", label: "Backward Acceleration (0.5g)", formula: "cargoWeight * 1000 * 0.5" },
            { name: "sidewaysForce", label: "Sideways Acceleration (0.5g)", formula: "cargoWeight * 1000 * 0.5" },
            
            // Sliding Calculations
            { name: "slidingSide", label: "Lashings - Sliding Side", formula: "ceil(sidewaysForce / effectiveSTF)" },
            { name: "slidingForward", label: "Lashings - Sliding Forward", formula: "ceil(forwardForce / effectiveSTF)" },
            { name: "slidingBackward", label: "Lashings - Sliding Backward", formula: "ceil(backwardForce / effectiveSTF)" },
            { name: "maxSlidingLashings", label: "Max Sliding Requirement", formula: "max(slidingSide, slidingForward, slidingBackward)" },
            
            // Tipping Calculations
            { name: "conversionFactor", label: "Conversion Factor (STF/LC)", formula: "min(standardForce / 400, lashingCapacity / 1600)" },
            { name: "hbTableValue", label: "H/B Table Multiplier", formula: "hbRatio < 0.6 ? 20 : (hbRatio < 0.8 ? 10 : (hbRatio < 1.0 ? 5.1 : (hbRatio < 1.25 ? 3.4 : (hbRatio < 1.5 ? 2.5 : (hbRatio < 2.0 ? 1.7 : 1.0)))))" },
            { name: "tippingCapacity", label: "Tons per Lashing (Tipping)", formula: "conversionFactor * hbTableValue" },
            { name: "tippingLashings", label: "Lashings - Tipping Prevention", formula: "tippingCapacity > 0 ? ceil(cargoWeight / tippingCapacity) : 999" },
            
            // Method-Specific Adjustments
            { name: "methodMultiplier", label: "Method Efficiency Factor", formula: "securingMethod.includes('Overfald') ? 1.0 : (securingMethod.includes('Loop') ? 0.9 : (securingMethod.includes('Direct') ? 1.2 : (securingMethod.includes('Grime') ? 0.85 : 0.7)))" },
            { name: "adjustedSlidingReq", label: "Adjusted Sliding Requirement", formula: "ceil(maxSlidingLashings / methodMultiplier)" },
            { name: "adjustedTippingReq", label: "Adjusted Tipping Requirement", formula: "ceil(tippingLashings / methodMultiplier)" },
            
            // Environmental Adjustments
            { name: "weatherMultiplier", label: "Weather Safety Multiplier", formula: "weatherConditions.includes('Poor') ? 1.15 : (weatherConditions.includes('Extreme') ? 1.30 : 1.0)" },
            { name: "stabilityMultiplier", label: "Stability Safety Multiplier", formula: "cargoStability.includes('Unstable') ? 1.20 : (cargoStability.includes('Moderately') ? 1.10 : 1.0)" },
            { name: "combinedSafetyFactor", label: "Combined Safety Factor", formula: "(1 + safetyFactor / 100) * weatherMultiplier * stabilityMultiplier" },
            
            // Final Recommendations
            { name: "baseRequirement", label: "Base Lashing Requirement", formula: "max(adjustedSlidingReq, adjustedTippingReq)" },
            { name: "recommendedLashings", label: "RECOMMENDED LASHINGS", formula: "ceil(baseRequirement * combinedSafetyFactor)" },
            { name: "lashingsPerSide", label: "Lashings Per Side (if paired)", formula: "ceil(recommendedLashings / 2)" },
            { name: "lashingSpacing", label: "Recommended Spacing (m)", formula: "cargoLength > 0 ? cargoLength / (recommendedLashings / 2) : 0" },
            
            // Safety Analysis
            { name: "totalCapacity", label: "Total Securing Capacity (daN)", formula: "recommendedLashings * effectiveSTF" },
            { name: "maxLoadCapacity", label: "Max Supported Weight (tons)", formula: "totalCapacity / (1000 * 0.8)" },
            { name: "safetyMargin", label: "Safety Margin (%)", formula: "((maxLoadCapacity - cargoWeight) / cargoWeight) * 100" },
            { name: "criticalDirection", label: "Critical Direction", formula: "slidingForward > slidingSide ? (slidingForward > slidingBackward ? 'Forward' : 'Backward') : (slidingSide > slidingBackward ? 'Sideways' : 'Backward')" },
            
            // Friction Analysis
            { name: "frictionCategory", label: "Friction Category", formula: "frictionCoeff >= 0.50 ? 'Excellent' : (frictionCoeff >= 0.40 ? 'Good' : (frictionCoeff >= 0.30 ? 'Moderate' : (frictionCoeff >= 0.20 ? 'Low' : 'Poor')))" },
            { name: "frictionForce", label: "Friction Contribution (daN)", formula: "cargoWeight * 1000 * frictionCoeff * verticalComponent * recommendedLashings" },
            { name: "tensionForce", label: "Tension Contribution (daN)", formula: "standardForce * horizontalComponent * recommendedLashings" },
            
            // EU BPG Compliance Checks
            { name: "isHBRatioSafe", label: "H/B Ratio Status", formula: "hbRatio <= 2.0 ? 'Safe' : 'High'" },
            { name: "isLCAdequate", label: "LC Capacity Check", formula: "lashingCapacity >= 2000 ? 'Adequate' : 'Low'" },
            { name: "isSTFAdequate", label: "STF Tension Check", formula: "standardForce >= 350 ? 'Adequate' : 'Low'" },
            { name: "minLashingAngle", label: "Min Recommended Angle", formula: "hbRatio > 1.5 ? 60 : 75" },
            { name: "isAngleOptimal", label: "Angle Optimization", formula: "lashingAngle >= minLashingAngle ? 'Optimal' : 'Increase angle'" },
            
            // Cost & Material Estimates
            { name: "totalLashingLength", label: "Est. Total Strap Length (m)", formula: "recommendedLashings * ((cargoWidth + cargoHeight) * 2 + 1.5)" },
            { name: "estimatedCost", label: "Est. Material Cost (EUR)", formula: "recommendedLashings * 15" },
            
            // Additional Reference Values
            { name: "standardLCReference", label: "Standard LC Reference", formula: "'LC 2500 daN'" },
            { name: "standardSTFReference", label: "Standard STF Reference", formula: "'STF 400-500 daN'" },
            { name: "complianceStandard", label: "Compliance Standard", formula: "'EN 12195-1:2010'" }
        ]
    },
    {
        name: "Barcode & QR Generator",
        icon: "📱",
        description: "Generate EAN13, QR codes, Code128, and more with customization options",
        translationKey: "template-barcode-qr",
        inputs: [
            { name: "barcodeType", label: "Barcode Type", type: "select", options: ["EAN13", "QR", "Code128", "Code39", "UPC-A", "ITF-14"], defaultValue: "EAN13" },
            { name: "barcodeData", label: "Data/Text", type: "text", defaultValue: "1234567890128" },
            { name: "displayValue", label: "Show Text Below", type: "checkbox", defaultValue: true },
            { name: "barcodeWidth", label: "Width (px)", type: "number", defaultValue: 2, step: 1 },
            { name: "barcodeHeight", label: "Height (px)", type: "number", defaultValue: 100 },
            { name: "qrSize", label: "QR Size (px)", type: "number", defaultValue: 256 },
            { name: "qrErrorLevel", label: "QR Error Correction", type: "select", options: ["L", "M", "Q", "H"], defaultValue: "M" },
            { name: "foregroundColor", label: "Color", type: "text", defaultValue: "#000000" },
            { name: "backgroundColor", label: "Background", type: "text", defaultValue: "#FFFFFF" }
        ],
        formulas: [
            { name: "dataLength", label: "Data Length", formula: "length(barcodeData)" },
            { name: "isValidEAN13", label: "Valid EAN13", formula: "if(barcodeType == 'EAN13' and length(barcodeData) == 13, 'Yes', 'No')" },
            { name: "estimatedSize", label: "Estimated Size (px)", formula: "if(barcodeType == 'QR', qrSize, barcodeWidth * length(barcodeData) * 10)" }
        ]
    },
    // NEW MATH: Fuel Cost Calculator
    {
        name: "Fuel Cost Calculator",
        icon: "⛽",
        description: "Calculate fuel usage, total cost and cost per km for any vehicle",
        translationKey: "template-math-fuel",
        inputs: [
            { name: "distanceKm", label: "Distance (km)", type: "number", defaultValue: 500 },
            { name: "fuelPer100Km", label: "Fuel Consumption (L/100km)", type: "number", defaultValue: 8.5 },
            { name: "fuelPricePerLitre", label: "Fuel Price per Litre", type: "number", defaultValue: 1.85 },
            { name: "numVehicles", label: "Number of Vehicles", type: "number", defaultValue: 1 }
        ],
        formulas: [
            { name: "fuelUsedLitres", label: "Fuel Used (litres)", formula: "(distanceKm / 100) * fuelPer100Km" },
            { name: "tripFuelCost", label: "Trip Fuel Cost", formula: "fuelUsedLitres * fuelPricePerLitre" },
            { name: "costPerKm", label: "Cost per km", formula: "tripFuelCost / distanceKm" },
            { name: "totalFleetCost", label: "Total Fleet Cost", formula: "tripFuelCost * numVehicles" },
            { name: "co2Kg", label: "Estimated CO₂ (kg)", formula: "fuelUsedLitres * 2.31" }
        ]
    },
    // NEW MATH: Tax Bracket Calculator
    {
        name: "Tax Bracket Calculator",
        icon: "🏦",
        description: "Calculate marginal and effective tax rates across 3 income brackets",
        translationKey: "template-math-tax",
        inputs: [
            { name: "grossIncome", label: "Gross Annual Income", type: "number", defaultValue: 600000 },
            { name: "bracket1Limit", label: "Bracket 1 Upper Limit", type: "number", defaultValue: 50000 },
            { name: "bracket1Rate", label: "Bracket 1 Tax Rate (%)", type: "number", defaultValue: 8 },
            { name: "bracket2Limit", label: "Bracket 2 Upper Limit", type: "number", defaultValue: 550000 },
            { name: "bracket2Rate", label: "Bracket 2 Tax Rate (%)", type: "number", defaultValue: 40.2 },
            { name: "bracket3Rate", label: "Bracket 3 Tax Rate (%)", type: "number", defaultValue: 56 }
        ],
        formulas: [
            { name: "tax1", label: "Tax on Bracket 1", formula: "min(grossIncome, bracket1Limit) * (bracket1Rate / 100)" },
            { name: "tax2", label: "Tax on Bracket 2", formula: "max(0, min(grossIncome, bracket2Limit) - bracket1Limit) * (bracket2Rate / 100)" },
            { name: "tax3", label: "Tax on Bracket 3", formula: "max(0, grossIncome - bracket2Limit) * (bracket3Rate / 100)" },
            { name: "totalTax", label: "Total Tax", formula: "tax1 + tax2 + tax3" },
            { name: "effectiveRate", label: "Effective Tax Rate (%)", formula: "(totalTax / grossIncome) * 100" },
            { name: "netIncome", label: "Net Income After Tax", formula: "grossIncome - totalTax" },
            { name: "marginalRate", label: "Marginal Tax Rate (%)", formula: "grossIncome > bracket2Limit ? bracket3Rate : (grossIncome > bracket1Limit ? bracket2Rate : bracket1Rate)" }
        ]
    }
];

// Initialize Custom Pages System
function initializeCustomPages() {
    loadCustomPagesFromStorage();
    renderCustomPagesGrid();
    renderCustomPagesTabs();
}

// Load custom pages from localStorage
function loadCustomPagesFromStorage() {
    const stored = localStorage.getItem('customPages');
    if (stored) {
        try {
            customPages = JSON.parse(stored);
            // Migrate old pages to have translationKeys
            migrateCustomPagesToTranslatable();
            // Translate pages to current language (without saving)
            translateCustomPagesInPlace();
        } catch (e) {
            console.error('Error loading custom pages:', e);
            customPages = [];
        }
    }
}

// Save custom pages to localStorage
function saveCustomPagesToStorage() {
    localStorage.setItem('customPages', JSON.stringify(customPages));
}

// Show custom page modal
function showCustomPageModal() {
    document.getElementById('customPageModal').classList.remove('hidden');
    resetCustomPageForm();
    
    // Check for auto-save draft
    if (typeof loadAutoSaveDraft === 'function') {
        loadAutoSaveDraft();
    }
    
    // Start auto-save
    if (typeof startAutoSave === 'function') {
        startAutoSave();
    }
    
    // Initialize wizard to step 1
    if (typeof switchWizardStep === 'function') {
        setTimeout(() => {
            switchWizardStep(1);
        }, 100);
    }
}

// Alias for consistency with HTML onclick handlers
function openCustomPageModal() {
    showCustomPageModal();
}

// Close custom page modal
function closeCustomPageModal() {
    document.getElementById('customPageModal').classList.add('hidden');
    currentEditingPageId = null;
    
    // Stop auto-save
    if (typeof stopAutoSave === 'function') {
        stopAutoSave();
    }
}

// Reset custom page form
function resetCustomPageForm() {
    document.getElementById('customPageName').value = '';
    document.getElementById('customPageDesc').value = '';
    document.getElementById('customPageIcon').value = '📊';
    document.getElementById('customInputsList').innerHTML = '';
    document.getElementById('customFormulasList').innerHTML = '';
    document.getElementById('enableGraph').checked = false;
    document.getElementById('enableSimulation').checked = false;
    toggleGraphConfig();
    toggleSimulationConfig();
    inputCounter = 0;
    formulaCounter = 0;
    
    // Add example input and formula for new users
    if (!currentEditingPageId) {
        addCustomInput();
        const exampleInput = document.getElementById('customInputsList').lastChild;
        exampleInput.querySelector('.input-var-name').value = 'price';
        exampleInput.querySelector('.input-label').value = 'Price per unit';
        exampleInput.querySelector('.input-type').value = 'number';
        exampleInput.querySelector('.input-default').value = '100';
        
        addCustomInput();
        const exampleInput2 = document.getElementById('customInputsList').lastChild;
        exampleInput2.querySelector('.input-var-name').value = 'quantity';
        exampleInput2.querySelector('.input-label').value = 'Quantity';
        exampleInput2.querySelector('.input-type').value = 'number';
        exampleInput2.querySelector('.input-default').value = '10';
        
        addCustomFormula();
        const exampleFormula = document.getElementById('customFormulasList').lastChild;
        exampleFormula.querySelector('.formula-var-name').value = 'total';
        exampleFormula.querySelector('.formula-label').value = 'Total Cost';
        exampleFormula.querySelector('.formula-expression').value = 'price * quantity';
    }
}

// Add custom input field
function addCustomInput() {
    const container = document.getElementById('customInputsList');
    const id = `input_${inputCounter++}`;
    
    const inputDiv = document.createElement('div');
    inputDiv.className = 'rounded-lg border-2 border-indigo-200 dark:border-indigo-700 overflow-hidden shadow-sm mb-2';
    inputDiv.id = id;
    
    inputDiv.innerHTML = `
        <!-- Header bar -->
        <div class="flex items-center justify-between px-3 py-2 bg-indigo-500 dark:bg-indigo-700">
            <div class="flex items-center gap-2">
                <span class="drag-handle cursor-move text-white/70 hover:text-white select-none text-lg" title="Drag to reorder">⋮⋮</span>
                <span class="text-white font-semibold text-sm">📥 Input Field</span>
            </div>
            <div class="flex gap-1">
                <button onclick="duplicateInput('${id}')" class="px-2 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-xs" title="Duplicate">📋</button>
                <button onclick="removeElement('${id}')" class="px-2 py-1 bg-white/20 hover:bg-red-500 text-white rounded text-xs" title="Delete">🗑️</button>
            </div>
        </div>
        <!-- Two-pane: Variable Name + Display Label -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white dark:bg-gray-800">
            <!-- Variable Name (orange) -->
            <div class="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-700">
                <div class="flex items-center gap-1.5 mb-2">
                    <span>🔑</span>
                    <label class="text-xs font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wide">Variable Name</label>
                </div>
                <input type="text" placeholder="price" class="input-field text-sm font-mono input-var-name" oninput="updateAvailableVariables(); setupFormulaAutocomplete()">
                <p class="text-xs text-orange-600 dark:text-orange-400 mt-1.5 leading-snug">
                    Used in formulas: <code class="bg-orange-100 dark:bg-orange-900/50 px-1 rounded font-mono">price * quantity</code>
                </p>
                <p class="text-xs text-gray-400 mt-0.5">Lowercase, no spaces (e.g. <em>price</em>, <em>qty</em>)</p>
            </div>
            <!-- Display Label (blue) -->
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                <div class="flex items-center gap-1.5 mb-2">
                    <span>🏷️</span>
                    <label class="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Display Label</label>
                </div>
                <input type="text" placeholder="Price per unit" class="input-field text-sm input-label" oninput="suggestVariableName(this)">
                <p class="text-xs text-blue-600 dark:text-blue-400 mt-1.5 leading-snug">Shown to users as the field heading / name</p>
            </div>
        </div>
        <!-- Row 2: Type, Default, Unit -->
        <div class="grid grid-cols-3 gap-3 px-3 pb-3 bg-white dark:bg-gray-800">
            <div>
                <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">📊 Input Type</label>
                <select class="input-field text-sm input-type" onchange="updateInputTypeOptions(this)">
                    <option value="number">Number</option>
                    <option value="text">Text</option>
                    <option value="select">Dropdown</option>
                    <option value="range">Range/Slider</option>
                    <option value="date">Date</option>
                    <option value="checkbox">Checkbox (Yes/No)</option>
                    <option value="percentage">Percentage (%)</option>
                    <option value="currency">Currency ($)</option>
                </select>
            </div>
            <div>
                <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">🔢 Default Value</label>
                <input type="number" placeholder="100" class="input-field text-sm input-default">
            </div>
            <div>
                <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">🏷 Unit <span class="font-normal text-gray-400">(optional)</span></label>
                <input type="text" placeholder="kg, %, €" class="input-field text-xs input-unit" maxlength="12">
            </div>
        </div>
        <!-- Validation rules (collapsible) -->
        <details class="validation-details hidden">
            <summary class="cursor-pointer text-xs text-yellow-700 dark:text-yellow-400 hover:text-yellow-600 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-t border-gray-100 dark:border-gray-700">⚙️ Validation Rules (optional)</summary>
            <div class="grid grid-cols-3 gap-2 px-3 pb-3 pt-2 bg-white dark:bg-gray-800">
                <div>
                    <label class="text-xs text-gray-500 block mb-1">Min value</label>
                    <input type="number" placeholder="Min" class="input-field text-xs input-min" title="Minimum value">
                </div>
                <div>
                    <label class="text-xs text-gray-500 block mb-1">Max value</label>
                    <input type="number" placeholder="Max" class="input-field text-xs input-max" title="Maximum value">
                </div>
                <div class="flex items-end pb-1">
                    <label class="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                        <input type="checkbox" class="input-required w-3.5 h-3.5">
                        <span>Required field</span>
                    </label>
                </div>
            </div>
        </details>
    `;
    
    // Make draggable
    makeDraggable(inputDiv);
    
    container.appendChild(inputDiv);
    
    // Update wizard progress
    if (typeof updateWizardProgress === 'function') {
        updateWizardProgress();
    }
    if (typeof updateAvailableVariables === 'function') {
        updateAvailableVariables();
    }
}

// Add custom formula
function addCustomFormula() {
    const container = document.getElementById('customFormulasList');
    const id = `formula_${formulaCounter++}`;
    
    const formulaDiv = document.createElement('div');
    formulaDiv.className = 'rounded-lg border-2 border-purple-200 dark:border-purple-700 overflow-hidden shadow-sm mb-2';
    formulaDiv.id = id;
    
    formulaDiv.innerHTML = `
        <!-- Header bar -->
        <div class="flex items-center justify-between px-3 py-2 bg-purple-600 dark:bg-purple-800">
            <div class="flex items-center gap-2">
                <span class="drag-handle cursor-move text-white/70 hover:text-white select-none text-lg" title="Drag to reorder">⋮⋮</span>
                <span class="text-white font-semibold text-sm">🧮 Formula / Output</span>
            </div>
            <div class="flex gap-1">
                <button onclick="duplicateFormula('${id}')" class="px-2 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-xs" title="Duplicate">📋</button>
                <button onclick="removeElement('${id}')" class="px-2 py-1 bg-white/20 hover:bg-red-500 text-white rounded text-xs" title="Delete">🗑️</button>
            </div>
        </div>
        <!-- Two-pane: Result Variable + Result Label -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white dark:bg-gray-800">
            <!-- Result Variable Name (orange) -->
            <div class="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-700">
                <div class="flex items-center gap-1.5 mb-2">
                    <span>🔑</span>
                    <label class="text-xs font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wide">Result Variable Name</label>
                </div>
                <input type="text" placeholder="total" class="input-field text-sm font-mono formula-var-name">
                <p class="text-xs text-orange-600 dark:text-orange-400 mt-1.5 leading-snug">
                    Chain in other formulas: <code class="bg-orange-100 dark:bg-orange-900/50 px-1 rounded font-mono">total * 1.25</code>
                </p>
            </div>
            <!-- Result Label (blue) -->
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                <div class="flex items-center gap-1.5 mb-2">
                    <span>🏷️</span>
                    <label class="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Result Label</label>
                </div>
                <input type="text" placeholder="Total Price" class="input-field text-sm formula-label">
                <p class="text-xs text-blue-600 dark:text-blue-400 mt-1.5 leading-snug">Shown as the output card heading</p>
            </div>
        </div>
        <!-- Formula Expression (dark code editor style) -->
        <div class="px-3 pb-3 bg-white dark:bg-gray-800">
            <label class="text-xs font-bold text-gray-600 dark:text-gray-400 block mb-1.5">
                <span class="text-green-600 dark:text-green-400 font-mono text-sm">ƒ(x)</span> Formula Expression
                <span class="ml-1 font-normal text-gray-400">— reference variable names from the Input Fields above</span>
            </label>
            <div class="relative">
                <textarea placeholder="price * quantity"
                    class="input-field text-sm font-mono formula-expression w-full"
                    rows="2"
                    oninput="validateFormulaLive(this)"
                    onkeydown="handleFormulaAutocomplete(event, this)"
                    data-formula-id="${id}"
                    style="background: #1e1e2e; color: #4ade80; font-family: 'Courier New', monospace; border: 1px solid #4b5563; border-radius: 6px;"></textarea>
                <div class="autocomplete-dropdown hidden absolute z-50 bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-lg shadow-xl max-h-48 overflow-y-auto" id="autocomplete-${id}"></div>
                <div class="formula-error hidden mt-1 text-xs text-red-600 dark:text-red-400"></div>
                <div class="formula-success hidden mt-1 text-xs text-green-600 dark:text-green-400"></div>
            </div>
            <div class="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-400">
                <span>Functions: <code class="bg-gray-100 dark:bg-gray-700 px-1 rounded text-gray-600 dark:text-gray-300">sqrt() pow() abs() round() min() max()</code></span>
                <span>Operators: <code class="bg-gray-100 dark:bg-gray-700 px-1 rounded text-gray-600 dark:text-gray-300">+ - * / ^ ( )</code></span>
            </div>
        </div>
        <!-- Output options row -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 px-3 pb-3 pt-2 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
            <div>
                <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">📐 Output Format</label>
                <select class="input-field text-xs formula-format" style="padding: 4px 6px;">
                    <option value="number">Number (2 dec)</option>
                    <option value="integer">Integer</option>
                    <option value="currency">Currency</option>
                    <option value="percent">Percent (%)</option>
                    <option value="text">As-is / Text</option>
                </select>
            </div>
            <div>
                <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">🔴 Warn Below</label>
                <input type="number" placeholder="threshold" class="input-field text-xs formula-threshold-low" style="padding: 4px 6px;">
            </div>
            <div>
                <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">🟢 Good Above</label>
                <input type="number" placeholder="threshold" class="input-field text-xs formula-threshold-high" style="padding: 4px 6px;">
            </div>
            <div>
                <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">📝 Notes</label>
                <input type="text" placeholder="Explanation..." class="input-field text-xs formula-notes" style="padding: 4px 6px;">
            </div>
        </div>
    `;
    
    // Make draggable
    makeDraggable(formulaDiv);
    
    container.appendChild(formulaDiv);
    
    // Update wizard progress
    if (typeof updateWizardProgress === 'function') {
        updateWizardProgress();
    }
}

// Remove element by ID
function removeElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.remove();
        
        // Update wizard progress after removing
        if (typeof updateWizardProgress === 'function') {
            updateWizardProgress();
        }
        if (typeof updateAvailableVariables === 'function') {
            updateAvailableVariables();
        }
    }
}

// Toggle graph configuration
function toggleGraphConfig() {
    const enabled = document.getElementById('enableGraph').checked;
    const section = document.getElementById('graphConfigSection');
    if (enabled) {
        section.classList.remove('hidden');
    } else {
        section.classList.add('hidden');
    }
}

// Toggle simulation configuration
function toggleSimulationConfig() {
    const enabled = document.getElementById('enableSimulation').checked;
    const section = document.getElementById('simulationConfigSection');
    if (enabled) {
        section.classList.remove('hidden');
    } else {
        section.classList.add('hidden');
    }
}

// Validate formula in real-time
function validateFormula(textarea) {
    const formula = textarea.value.trim();
    const container = textarea.closest('.p-3');
    const errorDiv = container.querySelector('.formula-error');
    const previewDiv = container.querySelector('.formula-preview');
    
    if (!formula) {
        errorDiv.classList.add('hidden');
        previewDiv.classList.add('hidden');
        return;
    }
    
    try {
        // Try to compile the formula with math.js
        const node = math.parse(formula);
        errorDiv.classList.add('hidden');
        previewDiv.classList.remove('hidden');
        previewDiv.textContent = '✓ Formula syntax is valid';
    } catch (error) {
        errorDiv.classList.remove('hidden');
        previewDiv.classList.add('hidden');
        errorDiv.textContent = `❌ Error: ${error.message}`;
    }
}

// Save custom page
function saveCustomPage() {
    const name = document.getElementById('customPageName').value.trim();
    if (!name) {
        showToast(currentLanguage === 'da' ? 'Angiv venligst et sidenavn' : 'Please enter a page name', 'warning');
        return;
    }
    
    // Collect inputs with validation settings
    const inputs = [];
    document.querySelectorAll('#customInputsList > div').forEach(div => {
        const varName = div.querySelector('.input-var-name').value.trim();
        const label = div.querySelector('.input-label').value.trim();
        const type = div.querySelector('.input-type').value;
        const defaultValue = div.querySelector('.input-default').value;
        
        if (varName && label) {
            const inputObj = { name: varName, label, type, defaultValue };
            
            // Add unit label (Step F)
            const unitInput = div.querySelector('.input-unit');
            if (unitInput && unitInput.value.trim()) inputObj.unit = unitInput.value.trim();
            
            // Add validation settings if enabled
            const minInput = div.querySelector('.input-min');
            const maxInput = div.querySelector('.input-max');
            const requiredInput = div.querySelector('.input-required');
            
            if (minInput && minInput.value) inputObj.min = parseFloat(minInput.value);
            if (maxInput && maxInput.value) inputObj.max = parseFloat(maxInput.value);
            if (requiredInput && requiredInput.checked) inputObj.required = true;
            
            inputs.push(inputObj);
        }
    });
    
    // Collect formulas
    const formulas = [];
    document.querySelectorAll('#customFormulasList > div').forEach(div => {
        const varName = div.querySelector('.formula-var-name').value.trim();
        const label = div.querySelector('.formula-label').value.trim();
        const formula = div.querySelector('.formula-expression').value.trim();
        
        if (varName && label && formula) {
            const fmtEl = div.querySelector('.formula-format');
            const notesEl = div.querySelector('.formula-notes');
            const thLowEl = div.querySelector('.formula-threshold-low');
            const thHighEl = div.querySelector('.formula-threshold-high');
            const formulaObj = { name: varName, label, formula };
            if (fmtEl && fmtEl.value) formulaObj.format = fmtEl.value;
            if (notesEl && notesEl.value.trim()) formulaObj.notes = notesEl.value.trim();
            if (thLowEl && thLowEl.value !== '') formulaObj.thresholdLow = parseFloat(thLowEl.value);
            if (thHighEl && thHighEl.value !== '') formulaObj.thresholdHigh = parseFloat(thHighEl.value);
            formulas.push(formulaObj);
        }
    });
    
    if (inputs.length === 0 || formulas.length === 0) {
        showToast(currentLanguage === 'da' ? 'Tilføj venligst mindst ét inputfelt og én formel' : 'Please add at least one input field and one formula', 'warning');
        return;
    }
    
    // Create page object
    const page = {
        id: currentEditingPageId || 'custom_' + Date.now(),
        name: name,
        description: document.getElementById('customPageDesc').value.trim(),
        icon: document.getElementById('customPageIcon').value.trim() || '📊',
        inputs: inputs,
        formulas: formulas,
        graph: null,
        simulation: null
    };
    
    // Add graph config if enabled
    if (document.getElementById('enableGraph').checked) {
        page.graph = {
            enabled: true,
            type: document.getElementById('graphType').value,
            xAxis: document.getElementById('graphXAxis').value.trim(),
            yAxis: document.getElementById('graphYAxis').value.trim()
        };
    }
    
    // Add simulation config if enabled
    if (document.getElementById('enableSimulation').checked) {
        page.simulation = {
            enabled: true,
            timeVar: document.getElementById('simTimeVar').value.trim(),
            startValue: parseFloat(document.getElementById('simStartValue').value),
            endValue: parseFloat(document.getElementById('simEndValue').value)
        };
    }
    
    // Save or update
    if (currentEditingPageId) {
        const index = customPages.findIndex(p => p.id === currentEditingPageId);
        if (index !== -1) {
            customPages[index] = page;
        }
    } else {
        customPages.push(page);
    }
    
    saveCustomPagesToStorage();
    renderCustomPagesGrid();
    renderCustomPagesTabs();
    
    // Clear auto-save draft on successful save
    if (typeof clearAutoSaveDraft === 'function') {
        clearAutoSaveDraft();
    }
    
    closeCustomPageModal();
    showToast(currentLanguage === 'da' ? `✅ Siden "${name}" blev gemt!` : `✅ Page "${name}" saved successfully!`, 'success');
}

// Render custom pages grid
function renderCustomPagesGrid() {
    const grid = document.getElementById('customPagesGrid');
    const managementGrid = document.getElementById('customPagesManagementGrid');
    
    // Render in both grids if they exist
    [grid, managementGrid].forEach(targetGrid => {
        if (!targetGrid) return;
        
        targetGrid.innerHTML = '';
        
        if (customPages.length === 0) {
            targetGrid.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <div class="text-5xl mb-3">📄</div>
                    <p class="text-gray-600 dark:text-gray-400 text-lg" data-i18n="no-custom-pages-yet">${translate('no-custom-pages-yet')}</p>
                    <p class="text-gray-500 dark:text-gray-500 text-sm mt-2" data-i18n="click-create-to-start">${translate('click-create-to-start')}</p>
                </div>
            `;
            return;
        }
        
        customPages.forEach(page => {
            const card = document.createElement('div');
            card.className = 'bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-4 border-2 border-purple-200 dark:border-purple-700 hover:shadow-lg transition-all';
            
            card.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <div class="text-3xl">${page.icon}</div>
                    <div class="flex gap-1">
                        <button onclick="editCustomPage('${page.id}')" class="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs" title="${translate('edit') || 'Edit'}">
                            ✏️
                        </button>
                        <button onclick="duplicateCustomPage('${page.id}')" class="px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-xs" title="${translate('duplicate') || 'Duplicate'}">
                            📋
                        </button>
                        <button onclick="exportCustomPage('${page.id}')" class="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs" title="${translate('export') || 'Export'}">
                            📤
                        </button>
                        <button onclick="deleteCustomPage('${page.id}')" class="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs" title="${translate('delete') || 'Delete'}">
                            🗑️
                        </button>
                    </div>
                </div>
                <h3 class="font-bold text-base text-gray-900 dark:text-white mb-1">${page.name}</h3>
                <p class="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">${page.description || translate('no-description')}</p>
                <div class="flex flex-wrap gap-1 text-xs mb-2">
                    <span class="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                        ${page.inputs.length} ${translate('inputs')}
                    </span>
                    <span class="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                        ${page.formulas.length} ${translate('formulas')}
                    </span>
                </div>
                <button onclick="openCustomPage('${page.id}')" class="w-full px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
                    ${translate('open')} →
                </button>
            `;
            
            targetGrid.appendChild(card);
        });
    });
}

// Legacy function - kept for backwards compatibility
function renderCustomPagesGridOld() {
    const grid = document.getElementById('customPagesGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (customPages.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-6xl mb-4">📄</div>
                <p class="text-gray-600 dark:text-gray-400 text-lg mb-4" data-i18n="no-custom-pages-yet">${translate('no-custom-pages-yet')}</p>
                <button onclick="openCustomPageModal()" class="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors" data-i18n="create-first-page-btn">
                    ${translate('create-first-page-btn')}
                </button>
            </div>
        `;
        return;
    }
    
    customPages.forEach(page => {
        const card = document.createElement('div');
        card.className = 'bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-5 border-2 border-purple-200 dark:border-purple-700 hover:shadow-lg transition-all';
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div class="text-4xl">${page.icon}</div>
                <div class="flex gap-1">
                    <button onclick="editCustomPage('${page.id}')" class="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm">
                        ✏️
                    </button>
                    <button onclick="deleteCustomPage('${page.id}')" class="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm">
                        🗑️
                    </button>
                </div>
            </div>
            <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-1">${page.name}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">${page.description || translate('no-description')}</p>
            <div class="flex gap-2 text-xs mb-3">
                <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                    ${page.inputs.length} ${currentLanguage === 'da' ? 'input' : 'inputs'}
                </span>
                <span class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                    ${page.formulas.length} ${currentLanguage === 'da' ? 'formler' : 'formulas'}
                </span>
                ${page.graph ? '<span class="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">📊 ' + (currentLanguage === 'da' ? 'Graf' : 'Graph') + '</span>' : ''}
                ${page.simulation ? '<span class="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded">⏱️ ' + (currentLanguage === 'da' ? 'Simulering' : 'Simulation') + '</span>' : ''}
            </div>
            <button onclick="openCustomPage('${page.id}')" class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                ${currentLanguage === 'da' ? 'Åbn Side' : 'Open Page'} →
            </button>
        `;
        
        grid.appendChild(card);
    });
}

// Render custom pages tabs
function renderCustomPagesTabs() {
    const container = document.getElementById('customPagesTabs');
    if (!container) return;
    
    if (customPages.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'flex';
    container.innerHTML = '';
    
    customPages.forEach(page => {
        const tab = document.createElement('button');
        tab.className = 'tab-btn px-4 py-2 font-medium text-sm';
        tab.setAttribute('data-tab', `custom-${page.id}`);
        tab.innerHTML = `${page.name}`;
        tab.addEventListener('click', () => {
            switchTab(`custom-${page.id}`, tab);
        });
        container.appendChild(tab);
    });
    
    // Generate dynamic page sections
    generateCustomPageSections();
}

// Generate custom page HTML sections
function generateCustomPageSections() {
    const container = document.getElementById('dynamicCustomPagesSections');
    if (!container) return;
    
    container.innerHTML = '';
    
    customPages.forEach(page => {
        const section = document.createElement('section');
        section.id = `custom-${page.id}-section`;
        section.className = 'tab-content hidden';
        
        section.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-300">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            ${page.icon} ${page.name}
                        </h2>
                        <p class="text-gray-600 dark:text-gray-400">${page.description || ''}</p>
                    </div>
                    <button onclick="exportCustomPage('${page.id}')" class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors">
                        📤 ${currentLanguage === 'da' ? 'Eksporter' : 'Export'}
                    </button>
                </div>
                
                <!-- Inputs -->
                <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">📝 ${currentLanguage === 'da' ? 'Inputfelter' : 'Inputs'}</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="inputs-${page.id}">
                        ${renderPageInputs(page)}
                    </div>
                </div>
                
                <!-- Calculate Button -->
                <div class="mb-6 text-center">
                    <button onclick="calculateCustomPage('${page.id}')" class="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg font-bold text-lg shadow-lg transition-all transform hover:scale-105">
                        🧮 ${translate('custom-calculate-btn') || 'Calculate'}
                    </button>
                    ${page.simulation ? `
                        <button onclick="runSimulation('${page.id}')" class="ml-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg font-bold text-lg shadow-lg transition-all transform hover:scale-105">
                            ⏱️ ${translate('custom-simulate-btn') || 'Run Simulation'}
                        </button>
                        <button onclick="stopSimulation()" class="ml-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors hidden" id="stop-sim-${page.id}">
                            ⏹️ ${translate('custom-stop-btn') || 'Stop'}
                        </button>
                    ` : ''}
                </div>
                
                <!-- Results -->
                <div id="results-${page.id}" class="hidden mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${renderPageResults(page)}
                </div>
                
                <!-- Graph -->
                ${page.graph ? `
                    <div id="graph-container-${page.id}" class="hidden">
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">📊 ${currentLanguage === 'da' ? 'Visualisering' : 'Visualization'}</h3>
                        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <canvas id="graph-${page.id}"></canvas>
                        </div>
                    </div>
                ` : ''}
                
                <!-- Simulation Canvas -->
                ${page.simulation ? `
                    <div id="simulation-container-${page.id}" class="hidden mt-6">
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">⏱️ ${currentLanguage === 'da' ? 'Simulering' : 'Simulation'}</h3>
                        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <canvas id="simulation-${page.id}"></canvas>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        container.appendChild(section);
    });
}

// Render page inputs HTML
function renderPageInputs(page) {
    return page.inputs.map(input => `
        <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">${input.label}${input.unit ? ` <span class="text-xs text-gray-400 font-normal">(${input.unit})</span>` : ''}</label>
            <input 
                type="${input.type}" 
                id="input-${page.id}-${input.name}" 
                class="input-field" 
                value="${input.defaultValue || ''}"
                placeholder="${input.label}${input.unit ? ' (' + input.unit + ')' : ''}"
                onkeypress="if(event.key === 'Enter') calculateCustomPage('${page.id}')">
        </div>
    `).join('');
}

// Render page results HTML
function renderPageResults(page) {
    return page.formulas.map(formula => `
        <div class="result-card" id="result-card-${page.id}-${formula.name}">
            <h4 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">${formula.label}</h4>
            <p id="result-${page.id}-${formula.name}" class="text-3xl font-bold text-purple-600 dark:text-purple-400">-</p>
            ${formula.notes ? `<p class="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">${formula.notes}</p>` : ''}
        </div>
    `).join('');
}

// Calculate custom page
function calculateCustomPage(pageId) {
    const page = customPages.find(p => p.id === pageId);
    if (!page) return;
    
    try {
        // Collect input values
        const scope = {};
        page.inputs.forEach(input => {
            const element = document.getElementById(`input-${pageId}-${input.name}`);
            if (element) {
                const value = element.value;
                scope[input.name] = input.type === 'number' ? parseFloat(value) || 0 : value;
            }
        });
        
        // Calculate formulas
        page.formulas.forEach(formula => {
            try {
                const result = math.evaluate(formula.formula, scope);
                scope[formula.name] = result;
                
                // Display result with formatting (Step D)
                const resultElement = document.getElementById(`result-${pageId}-${formula.name}`);
                const cardElement = document.getElementById(`result-card-${pageId}-${formula.name}`);
                if (resultElement) {
                    let displayValue;
                    if (typeof result === 'number') {
                        const fmt = formula.format || 'number';
                        if (fmt === 'integer') displayValue = Math.round(result).toString();
                        else if (fmt === 'currency') displayValue = '\u20AC\u00A0' + result.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                        else if (fmt === 'percent') displayValue = result.toFixed(1) + '%';
                        else if (fmt === 'text') displayValue = result.toString();
                        else displayValue = result.toFixed(2);
                    } else {
                        displayValue = result;
                    }
                    resultElement.textContent = displayValue;
                    
                    // Apply color threshold (Step E)
                    if (cardElement && typeof result === 'number') {
                        cardElement.classList.remove('threshold-good', 'threshold-warn', 'threshold-neutral');
                        const hasLow = formula.thresholdLow !== undefined;
                        const hasHigh = formula.thresholdHigh !== undefined;
                        if (hasLow && result < formula.thresholdLow) {
                            cardElement.classList.add('threshold-warn');
                            resultElement.className = resultElement.className.replace(/text-\S+-600/, 'text-red-600').replace(/dark:text-\S+-400/, 'dark:text-red-400');
                        } else if (hasHigh && result >= formula.thresholdHigh) {
                            cardElement.classList.add('threshold-good');
                            resultElement.className = resultElement.className.replace(/text-\S+-600/, 'text-green-600').replace(/dark:text-\S+-400/, 'dark:text-green-400');
                        } else {
                            cardElement.classList.add('threshold-neutral');
                            resultElement.className = resultElement.className.replace(/text-\S+-600/, 'text-purple-600').replace(/dark:text-\S+-400/, 'dark:text-purple-400');
                        }
                    }
                }
            } catch (error) {
                console.error(`Error calculating formula ${formula.name}:`, error);
                const resultElement = document.getElementById(`result-${pageId}-${formula.name}`);
                if (resultElement) {
                    resultElement.textContent = currentLanguage === 'da' ? 'Fejl' : 'Error';
                }
            }
        });
        
        // Show results
        document.getElementById(`results-${pageId}`).classList.remove('hidden');
        
        // Render graph if enabled
        if (page.graph && page.graph.enabled) {
            renderCustomGraph(pageId, page, scope);
        }
        
        showToast(currentLanguage === 'da' ? '✅ Beregning fuldført!' : '✅ Calculation complete!', 'success');
    } catch (error) {
        console.error('Calculation error:', error);
        showToast((currentLanguage === 'da' ? '❌ Beregningsfejl: ' : '❌ Calculation error: ') + error.message, 'error');
    }
}

// Render custom graph
function renderCustomGraph(pageId, page, scope) {
    const canvas = document.getElementById(`graph-${pageId}`);
    if (!canvas) return;
    
    const container = document.getElementById(`graph-container-${pageId}`);
    if (container) {
        container.classList.remove('hidden');
    }
    
    // Generate data for graph
    const xVar = page.graph.xAxis;
    const yVars = page.graph.yAxis.split(',').map(v => v.trim());
    
    // Create data points
    const xMin = scope[xVar] * 0.5 || 1;
    const xMax = scope[xVar] * 1.5 || 100;
    const step = (xMax - xMin) / 50;
    
    const xData = [];
    const yDatasets = yVars.map(v => ({ label: v, data: [] }));
    
    for (let x = xMin; x <= xMax; x += step) {
        xData.push(x);
        scope[xVar] = x;
        
        yVars.forEach((yVar, index) => {
            const formula = page.formulas.find(f => f.name === yVar);
            if (formula) {
                try {
                    const y = math.evaluate(formula.formula, scope);
                    yDatasets[index].data.push(y);
                } catch (e) {
                    yDatasets[index].data.push(0);
                }
            }
        });
    }
    
    // Destroy existing chart
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
        existingChart.destroy();
    }
    
    // Create new chart
    new Chart(canvas, {
        type: page.graph.type,
        data: {
            labels: xData.map(x => x.toFixed(0)),
            datasets: yDatasets.map((dataset, index) => ({
                label: dataset.label,
                data: dataset.data,
                borderColor: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 5],
                backgroundColor: ['rgba(139, 92, 246, 0.1)', 'rgba(59, 130, 246, 0.1)', 'rgba(16, 185, 129, 0.1)', 'rgba(245, 158, 11, 0.1)', 'rgba(239, 68, 68, 0.1)'][index % 5],
                tension: 0.4,
                fill: page.graph.type === 'line'
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: page.name + (currentLanguage === 'da' ? ' - Visualisering' : ' - Visualization')
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: xVar
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: currentLanguage === 'da' ? 'Værdi' : 'Value'
                    }
                }
            }
        }
    });
}

// Run simulation
function runSimulation(pageId) {
    const page = customPages.find(p => p.id === pageId);
    if (!page || !page.simulation) return;
    
    // Stop any existing simulation
    stopSimulation();
    
    // Show stop button
    const stopBtn = document.getElementById(`stop-sim-${pageId}`);
    if (stopBtn) stopBtn.classList.remove('hidden');
    
    // Collect initial values
    const scope = {};
    page.inputs.forEach(input => {
        const element = document.getElementById(`input-${pageId}-${input.name}`);
        if (element) {
            scope[input.name] = input.type === 'number' ? parseFloat(element.value) || 0 : element.value;
        }
    });
    
    // Prepare simulation data
    const timeVar = page.simulation.timeVar;
    const start = page.simulation.startValue;
    const end = page.simulation.endValue;
    const steps = end - start;
    
    let currentStep = start;
    const simData = [];
    
    // Show simulation container
    const container = document.getElementById(`simulation-container-${pageId}`);
    if (container) container.classList.remove('hidden');
    
    // Create chart
    const canvas = document.getElementById(`simulation-${pageId}`);
    if (!canvas) return;
    
    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();
    
    const chartData = {
        labels: [],
        datasets: page.formulas.map((formula, index) => ({
            label: formula.label,
            data: [],
            borderColor: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 5],
            backgroundColor: 'transparent',
            tension: 0.4
        }))
    };
    
    const simChart = new Chart(canvas, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            animation: {
                duration: 0
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: currentLanguage === 'da' ? `${page.name} - Simulering over tid` : `${page.name} - Simulation Over Time`
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: timeVar
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: currentLanguage === 'da' ? 'Værdi' : 'Value'
                    }
                }
            }
        }
    });
    
    // Animation loop
    simulationIntervalId = setInterval(() => {
        if (currentStep > end) {
            stopSimulation();
            showToast(currentLanguage === 'da' ? '✅ Simulering fuldført!' : '✅ Simulation complete!', 'success');
            return;
        }
        
        scope[timeVar] = currentStep;
        chartData.labels.push(currentStep);
        
        page.formulas.forEach((formula, index) => {
            try {
                const result = math.evaluate(formula.formula, scope);
                chartData.datasets[index].data.push(result);
                scope[formula.name] = result;
            } catch (e) {
                chartData.datasets[index].data.push(0);
            }
        });
        
        simChart.update();
        currentStep++;
    }, 100);
}

// Stop simulation
function stopSimulation() {
    if (simulationIntervalId) {
        clearInterval(simulationIntervalId);
        simulationIntervalId = null;
    }
    
    // Hide all stop buttons
    document.querySelectorAll('[id^="stop-sim-"]').forEach(btn => {
        btn.classList.add('hidden');
    });
}

// Edit custom page
function editCustomPage(pageId) {
    const page = customPages.find(p => p.id === pageId);
    if (!page) return;
    
    currentEditingPageId = pageId;
    
    // Open modal first
    showCustomPageModal();
    
    // Clear form completely (wait for modal to open)
    setTimeout(() => {
        document.getElementById('customPageName').value = page.name;
        document.getElementById('customPageDesc').value = page.description || '';
        document.getElementById('customPageIcon').value = page.icon;
        
        // Clear and populate inputs
        document.getElementById('customInputsList').innerHTML = '';
        inputCounter = 0;
        page.inputs.forEach(input => {
            addCustomInput();
            const lastInput = document.getElementById('customInputsList').lastChild;
            lastInput.querySelector('.input-var-name').value = input.name;
            lastInput.querySelector('.input-label').value = input.label;
            lastInput.querySelector('.input-type').value = input.type;
            lastInput.querySelector('.input-default').value = input.defaultValue || '';
            const unitEl = lastInput.querySelector('.input-unit');
            if (unitEl && input.unit) unitEl.value = input.unit;
        });
    
        // Clear and populate formulas
        document.getElementById('customFormulasList').innerHTML = '';
        formulaCounter = 0;
        page.formulas.forEach(formula => {
            addCustomFormula();
            const lastFormula = document.getElementById('customFormulasList').lastChild;
            lastFormula.querySelector('.formula-var-name').value = formula.name;
            lastFormula.querySelector('.formula-label').value = formula.label;
            lastFormula.querySelector('.formula-expression').value = formula.formula;
            const fmtEl = lastFormula.querySelector('.formula-format');
            const notesEl = lastFormula.querySelector('.formula-notes');
            const thLowEl = lastFormula.querySelector('.formula-threshold-low');
            const thHighEl = lastFormula.querySelector('.formula-threshold-high');
            if (fmtEl && formula.format) fmtEl.value = formula.format;
            if (notesEl && formula.notes) notesEl.value = formula.notes;
            if (thLowEl && formula.thresholdLow !== undefined) thLowEl.value = formula.thresholdLow;
            if (thHighEl && formula.thresholdHigh !== undefined) thHighEl.value = formula.thresholdHigh;
        });
        
        // Populate graph config
        if (page.graph) {
            document.getElementById('enableGraph').checked = true;
            toggleGraphConfig();
            document.getElementById('graphType').value = page.graph.type;
            document.getElementById('graphXAxis').value = page.graph.xAxis;
            document.getElementById('graphYAxis').value = page.graph.yAxis;
        } else {
            document.getElementById('enableGraph').checked = false;
            toggleGraphConfig();
        }
        
        // Populate simulation config
        if (page.simulation) {
            document.getElementById('enableSimulation').checked = true;
            toggleSimulationConfig();
            document.getElementById('simTimeVar').value = page.simulation.timeVar;
            document.getElementById('simStartValue').value = page.simulation.startValue;
            document.getElementById('simEndValue').value = page.simulation.endValue;
        } else {
            document.getElementById('enableSimulation').checked = false;
            toggleSimulationConfig();
        }
    }, 100);
}

// Delete custom page
function deleteCustomPage(pageId) {
    const page = customPages.find(p => p.id === pageId);
    if (!page) return;
    
    const message = (translate('confirm-delete-page') || 'Are you sure you want to delete "{name}"?').replace('{name}', page.name);
    if (confirm(message)) {
        customPages = customPages.filter(p => p.id !== pageId);
        saveCustomPagesToStorage();
        renderCustomPagesGrid();
        renderCustomPagesTabs();
        showToast(currentLanguage === 'da' ? `🗑️ Siden "${page.name}" slettet` : `🗑️ Page "${page.name}" deleted`, 'info');
    }
}

// Open custom page
function openCustomPage(pageId) {
    switchTab(`custom-${pageId}`);
}

// Export custom pages
function exportCustomPages() {
    const dataStr = JSON.stringify(customPages, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `custom-pages-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(currentLanguage === 'da' ? '📥 Brugerdefinerede sider eksporteret!' : '📥 Custom pages exported!', 'success');
}

// Export single page
function exportCustomPage(pageId) {
    const page = customPages.find(p => p.id === pageId);
    if (!page) return;
    
    const dataStr = JSON.stringify([page], null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${page.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(currentLanguage === 'da' ? `📤 "${page.name}" eksporteret!` : `📤 "${page.name}" exported!`, 'success');
}

// Import custom pages
function importCustomPages(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            if (!Array.isArray(imported)) {
                throw new Error('Invalid format');
            }
            
            imported.forEach(page => {
                // Ensure unique IDs
                page.id = 'imported_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                customPages.push(page);
            });
            
            saveCustomPagesToStorage();
            renderCustomPagesGrid();
            renderCustomPagesTabs();
            showToast(currentLanguage === 'da' ? `✅ ${imported.length} side(r) importeret!` : `✅ Imported ${imported.length} page(s)!`, 'success');
        } catch (error) {
            console.error('Import error:', error);
            showToast(currentLanguage === 'da' ? '❌ Import mislykkedes: Ugyldigt filformat' : '❌ Import failed: Invalid file format', 'error');
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

// Show template library
function showTemplateLibrary() {
    const modal = document.getElementById('templateLibraryModal');
    modal.classList.remove('hidden');
    
    // Reset filters
    document.getElementById('templateSearch').value = '';
    document.getElementById('templateCategoryFilter').value = 'all';
    
    // Initial render
    renderTemplates();
}

// Render templates with current filters
function renderTemplates(searchTerm = '', category = 'all') {
    const grid = document.getElementById('templateGrid');
    const noResults = document.getElementById('templateNoResults');
    const countSpan = document.getElementById('templateCount');
    grid.innerHTML = '';
    
    // Combine all templates with categories and preserve original indices
    const allTemplates = [
        ...logisticsTemplates.map((t, idx) => ({...t, category: 'logistics', originalIndex: idx, sourceArray: 'logistics'})),
        ...leanTemplates.map((t, idx) => ({...t, category: 'lean', originalIndex: idx, sourceArray: 'lean'})),
        ...financeTemplates.map((t, idx) => ({...t, category: 'finance', originalIndex: idx, sourceArray: 'finance'})),
        ...mathTemplates.map((t, idx) => ({...t, category: 'math', originalIndex: idx, sourceArray: 'math'}))
    ];
    
    // Filter templates
    let filteredTemplates = allTemplates.filter(template => {
        // Get translated name and description for searching
        const translatedName = template.translationKey ? 
            getTemplateTranslation(template.translationKey + '-name', template.name) : template.name;
        const translatedDesc = template.translationKey ? 
            getTemplateTranslation(template.translationKey + '-desc', template.description) : template.description;
        
        const matchesSearch = !searchTerm || 
            translatedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            translatedDesc.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = category === 'all' || template.category === category;
        
        return matchesSearch && matchesCategory;
    });
    
    // Update count (use translation)
    const currentLang = localStorage.getItem('language') || 'en';
    const templateWord = translations[currentLang]['template-count'] || 'templates';
    countSpan.textContent = `${filteredTemplates.length} ${templateWord}`;
    
    if (filteredTemplates.length === 0) {
        grid.classList.add('hidden');
        noResults.classList.remove('hidden');
        return;
    }
    
    grid.classList.remove('hidden');
    noResults.classList.add('hidden');
    
    // Group by category if showing all
    if (category === 'all' && !searchTerm) {
        const currentLang = localStorage.getItem('language') || 'en';
        const categories = [
            { key: 'logistics', translationKey: 'template-category-logistics', defaultLabel: '📦 Logistics' },
            { key: 'lean', translationKey: 'template-category-lean', defaultLabel: '🏭 LEAN Manufacturing' },
            { key: 'finance', translationKey: 'template-category-finance', defaultLabel: '💰 Finance' },
            { key: 'math', translationKey: 'template-category-math', defaultLabel: '🔢 Math & Science' }
        ];
        
        categories.forEach(cat => {
            const categoryTemplates = filteredTemplates.filter(t => t.category === cat.key);
            if (categoryTemplates.length > 0) {
                const label = translations[currentLang][cat.translationKey] || cat.defaultLabel;
                const section = document.createElement('div');
                section.className = 'col-span-full mt-6 first:mt-0';
                section.innerHTML = `<h4 class="text-lg font-bold text-gray-900 dark:text-white mb-3 pb-2 border-b-2 border-gray-200 dark:border-gray-700">${label}</h4>`;
                grid.appendChild(section);
                
                categoryTemplates.forEach(template => {
                    grid.appendChild(createTemplateCard(template, template.originalIndex));
                });
            }
        });
    } else {
        // Show all filtered templates without grouping
        filteredTemplates.forEach(template => {
            grid.appendChild(createTemplateCard(template, template.originalIndex));
        });
    }
}

// Filter templates based on search and category
function filterTemplates() {
    const searchTerm = document.getElementById('templateSearch').value;
    const category = document.getElementById('templateCategoryFilter').value;
    renderTemplates(searchTerm, category);
}

// Clear all filters
function clearTemplateFilters() {
    document.getElementById('templateSearch').value = '';
    document.getElementById('templateCategoryFilter').value = 'all';
    renderTemplates();
}

// Create template card
function createTemplateCard(template, templateIndex) {
    const card = document.createElement('div');
    card.className = 'bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-600 transition-all cursor-pointer';
    
    // Get translated name and description
    const translatedName = template.translationKey ? 
        getTemplateTranslation(template.translationKey + '-name', template.name) : template.name;
    const translatedDesc = template.translationKey ? 
        getTemplateTranslation(template.translationKey + '-desc', template.description) : template.description;
    
    // Get UI translations
    const currentLang = localStorage.getItem('language') || 'en';
    const inputsLabel = translate('template-inputs-label') || 'inputs';
    const formulasLabel = translate('template-formulas-label') || 'formulas';
    const useButtonLabel = translate('template-use-button') || 'Use Template';
    
    // Compute difficulty badge (Step H)
    const complexityTotal = template.inputs.length + template.formulas.length;
    const difficulty = complexityTotal <= 5  ? { label: '🟢 Beginner',     cls: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' } :
                       complexityTotal <= 10 ? { label: '🟡 Intermediate', cls: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' } :
                       complexityTotal <= 15 ? { label: '🟠 Advanced',     cls: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' } :
                                              { label: '🔴 Expert',        cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' };
    
    card.innerHTML = `
        <div class="text-3xl mb-2">${template.icon}</div>
        <h5 class="font-bold text-gray-900 dark:text-white mb-1">${translatedName}</h5>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">${translatedDesc}</p>
        <div class="flex flex-wrap gap-2 text-xs mb-3">
            <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                ${template.inputs.length} ${inputsLabel}
            </span>
            <span class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                ${template.formulas.length} ${formulasLabel}
            </span>
            <span class="px-2 py-1 rounded ${difficulty.cls}">${difficulty.label}</span>
        </div>
        <button onclick='loadTemplateByIndex(${templateIndex}, "${template.sourceArray || 'logistics'}")' class="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium transition-colors">
            ${useButtonLabel}
        </button>
    `;
    
    return card;
}

// Load template by index from the correct template array
function loadTemplateByIndex(index, sourceArray = 'logistics') {
    let templateArrays = {
        'logistics': logisticsTemplates,
        'lean': leanTemplates,
        'finance': financeTemplates,
        'math': mathTemplates
    };
    
    const templates = templateArrays[sourceArray] || logisticsTemplates;
    
    if (index >= 0 && index < templates.length) {
        loadTemplate(templates[index]);
    } else {
        console.error('Invalid template index:', index, 'for source:', sourceArray);
    }
}

// Load template
function loadTemplate(template) {
    const currentLang = localStorage.getItem('language') || 'en';
    
    // Translate template metadata
    const translatedName = template.translationKey ? 
        getTemplateTranslation(template.translationKey + '-name', template.name) : 
        template.name;
    const translatedDesc = template.translationKey ?
        getTemplateTranslation(template.translationKey + '-desc', template.description) :
        template.description;
    
    // Translate inputs using auto-translation and store original English labels
    const translatedInputs = template.inputs.map(input => ({
        ...input,
        originalLabel: input.label, // Store original English label
        label: autoTranslateLabel(input.label)
    }));
    
    // Translate formulas using auto-translation and store original English labels
    const translatedFormulas = template.formulas.map(formula => ({
        ...formula,
        originalLabel: formula.label, // Store original English label
        label: autoTranslateLabel(formula.label)
    }));
    
    const page = {
        id: 'custom_' + Date.now(),
        name: translatedName,
        description: translatedDesc,
        icon: template.icon,
        translationKey: template.translationKey, // Store for re-translation on language change
        inputs: translatedInputs,
        formulas: translatedFormulas,
        graph: template.graph,
        simulation: template.simulation
    };
    
    customPages.push(page);
    saveCustomPagesToStorage();
    renderCustomPagesGrid();
    renderCustomPagesTabs();
    closeTemplateLibrary();
    showToast(currentLanguage === 'da' ? `✅ Skabelon "${translatedName}" indlæst!` : `✅ Template "${translatedName}" loaded!`, 'success');
    
    // Open the new page
    setTimeout(() => {
        openCustomPage(page.id);
    }, 300);
}

// Translate custom pages in place (without saving)
function translateCustomPagesInPlace() {
    customPages.forEach(page => {
        if (page.translationKey) {
            // Retranslate name and description
            page.name = getTemplateTranslation(page.translationKey + '-name', page.name);
            page.description = getTemplateTranslation(page.translationKey + '-desc', page.description);
        }
        
        // Retranslate inputs using auto-translation (works with or without translationKey)
        if (page.inputs) {
            page.inputs.forEach(input => {
                // If we have originalLabel, translate from that, otherwise from current label
                const sourceLabel = input.originalLabel || input.label;
                input.label = autoTranslateLabel(sourceLabel);
                // Store original English label for future re-translation
                if (!input.originalLabel && localStorage.getItem('language') === 'en') {
                    input.originalLabel = input.label;
                }
            });
        }
        
        // Retranslate formulas using auto-translation
        if (page.formulas) {
            page.formulas.forEach(formula => {
                const sourceLabel = formula.originalLabel || formula.label;
                formula.label = autoTranslateLabel(sourceLabel);
                if (!formula.originalLabel && localStorage.getItem('language') === 'en') {
                    formula.originalLabel = formula.label;
                }
            });
        }
    });
}

// Retranslate all custom pages (called when language changes)
function retranslateCustomPages() {
    // First, try to add translationKeys to pages that don't have them (migration)
    migrateCustomPagesToTranslatable();
    
    // Translate in place
    translateCustomPagesInPlace();
    
    // Save updated pages and re-render
    saveCustomPagesToStorage();
    renderCustomPagesGrid();
    renderCustomPagesTabs();
}

// Migrate existing custom pages to have translationKeys
function migrateCustomPagesToTranslatable() {
    // Combine all templates
    const allTemplates = [
        ...logisticsTemplates.map(t => ({...t, category: 'logistics'})),
        ...leanTemplates.map(t => ({...t, category: 'lean'})),
        ...financeTemplates.map(t => ({...t, category: 'finance'})),
        ...mathTemplates.map(t => ({...t, category: 'math'}))
    ];
    
    customPages.forEach(page => {
        // Skip if already has translationKey
        if (page.translationKey) return;
        
        // Try to match with a template by comparing icon and number of inputs/formulas
        const matchedTemplate = allTemplates.find(t => 
            t.icon === page.icon && 
            t.inputs.length === (page.inputs?.length || 0) &&
            t.formulas.length === (page.formulas?.length || 0)
        );
        
        if (matchedTemplate && matchedTemplate.translationKey) {
            page.translationKey = matchedTemplate.translationKey;
        }
    });
}

// Alias for consistency
function openTemplateLibrary() {
    showTemplateLibrary();
}

// Close template library
function closeTemplateLibrary() {
    document.getElementById('templateLibraryModal').classList.add('hidden');
}

// Import custom page - trigger file input
function importCustomPage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                const pages = Array.isArray(imported) ? imported : [imported];
                
                pages.forEach(page => {
                    page.id = 'imported_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    customPages.push(page);
                });
                
                saveCustomPagesToStorage();
                renderCustomPagesGrid();
                renderCustomPagesTabs();
                showToast(currentLanguage === 'da' ? `✅ ${pages.length} side(r) importeret!` : `✅ Imported ${pages.length} page(s)!`, 'success');
            } catch (error) {
                console.error('Import error:', error);
                showToast(currentLanguage === 'da' ? '❌ Import mislykkedes: Ugyldigt filformat' : '❌ Import failed: Invalid file format', 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Preview custom page before saving
function previewCustomPage() {
    const pageName = document.getElementById('customPageName').value.trim();
    const pageDesc = document.getElementById('customPageDesc').value.trim();
    const pageIcon = document.getElementById('customPageIcon').value.trim() || '📄';
    
    // Collect inputs - look in all child divs, not just .field-item class
    const inputs = [];
    document.querySelectorAll('#customInputsList > div').forEach(item => {
        const nameInput = item.querySelector('.input-var-name');
        const labelInput = item.querySelector('.input-label');
        const typeInput = item.querySelector('.input-type');
        const defaultInput = item.querySelector('.input-default');
        
        if (nameInput && labelInput && typeInput && defaultInput) {
            const name = nameInput.value.trim();
            const label = labelInput.value.trim();
            const type = typeInput.value;
            const defaultValue = defaultInput.value;
            if (name && label) {
                inputs.push({ name, label, type, defaultValue: defaultValue || 0 });
            }
        }
    });
    
    // Collect formulas - look in all child divs, not just .field-item class
    const formulas = [];
    document.querySelectorAll('#customFormulasList > div').forEach(item => {
        const nameInput = item.querySelector('.formula-var-name');
        const labelInput = item.querySelector('.formula-label');
        const formulaInput = item.querySelector('.formula-expression');
        
        if (nameInput && labelInput && formulaInput) {
            const name = nameInput.value.trim();
            const label = labelInput.value.trim();
            const formula = formulaInput.value.trim();
            if (name && label && formula) {
                formulas.push({ name, label, formula });
            }
        }
    });
    
    // Validation
    if (!pageName) {
        showToast(currentLanguage === 'da' ? '❌ Angiv venligst et sidenavn' : '❌ Please enter a page name', 'error');
        return;
    }
    
    if (inputs.length === 0) {
        showToast(currentLanguage === 'da' ? '❌ Tilføj venligst mindst ét inputfelt' : '❌ Please add at least one input field', 'error');
        return;
    }
    
    if (formulas.length === 0) {
        showToast(currentLanguage === 'da' ? '❌ Tilføj venligst mindst én formel' : '❌ Please add at least one formula', 'error');
        return;
    }
    
    // Create preview page object
    const previewPage = {
        id: 'preview',
        name: pageName,
        description: pageDesc,
        icon: pageIcon,
        inputs: inputs,
        formulas: formulas
    };
    
    // Render preview
    const previewModal = document.getElementById('previewModal');
    const previewContent = document.getElementById('previewContent');
    
    previewContent.innerHTML = `
        <div class="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 mb-6">
            <div class="flex items-center gap-3 mb-3">
                <div class="text-5xl">${previewPage.icon}</div>
                <div>
                    <h2 class="text-3xl font-bold text-gray-900 dark:text-white">${previewPage.name}</h2>
                    <p class="text-gray-600 dark:text-gray-400">${previewPage.description || translate('no-description')}</p>
                </div>
            </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            ${previewPage.inputs.map(input => `
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${input.label}</label>
                    <input type="${input.type}" id="preview_${input.name}" value="${input.defaultValue}" 
                           class="input-field" onchange="updatePreviewCalculations()">
                </div>
            `).join('')}
        </div>
        
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">📊 ${currentLanguage === 'da' ? 'Resultater' : 'Results'}</h3>
            <div id="previewResults" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- Results will be calculated here -->
            </div>
        </div>
    `;
    
    // Store preview page data
    window.previewPageData = previewPage;
    
    // Initial calculation
    updatePreviewCalculations();
    
    // Show modal
    previewModal.classList.remove('hidden');
}

// Update preview calculations
function updatePreviewCalculations() {
    const previewPage = window.previewPageData;
    if (!previewPage) return;
    
    const resultsContainer = document.getElementById('previewResults');
    if (!resultsContainer) return;
    
    // Collect input values
    const variables = {};
    previewPage.inputs.forEach(input => {
        const element = document.getElementById(`preview_${input.name}`);
        if (element) {
            variables[input.name] = parseFloat(element.value) || 0;
        }
    });
    
    // Calculate formulas
    const results = [];
    previewPage.formulas.forEach(formula => {
        try {
            const result = math.evaluate(formula.formula, variables);
            results.push({
                label: formula.label,
                value: typeof result === 'number' ? result.toFixed(2) : result,
                success: true
            });
            variables[formula.name] = result; // Store for dependent formulas
        } catch (error) {
            results.push({
                label: formula.label,
                value: 'Error: ' + error.message,
                success: false
            });
        }
    });
    
    // Render results
    resultsContainer.innerHTML = results.map(result => `
        <div class="bg-gradient-to-br ${result.success ? 'from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30' : 'from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30'} rounded-lg p-4 shadow-md">
            <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">${result.label}</div>
            <div class="text-2xl font-bold ${result.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}">
                ${result.value}
            </div>
        </div>
    `).join('');
}

// Close preview modal
function closePreviewModal() {
    document.getElementById('previewModal').classList.add('hidden');
    window.previewPageData = null;
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-2xl text-white font-medium z-[70] animate-slide-in ${
        type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slide-out 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Insert formula snippet
function insertFormulaSnippet(name, formula) {
    // Get the last formula textarea or create a new formula if none exist
    let lastFormula = document.querySelector('#customFormulasList > div:last-child .formula-expression');
    
    if (!lastFormula || lastFormula.value.trim() !== '') {
        // If no formula exists or last one is filled, add a new one
        addCustomFormula();
        lastFormula = document.querySelector('#customFormulasList > div:last-child .formula-expression');
    }
    
    if (lastFormula) {
        lastFormula.value = formula;
        lastFormula.focus();
        validateFormula(lastFormula);
        showToast(currentLanguage === 'da' ? `✨ "${name}" formel indsat!` : `✨ "${name}" formula inserted!`, 'success');
    }
}

// Export current page being edited
function exportCurrentPage() {
    const name = document.getElementById('customPageName').value.trim();
    if (!name) {
        showToast(currentLanguage === 'da' ? '⚠️ Angiv venligst et sidenavn først' : '⚠️ Please enter a page name first', 'warning');
        return;
    }
    
    // Collect inputs
    const inputs = [];
    document.querySelectorAll('#customInputsList > div').forEach(div => {
        const varName = div.querySelector('.input-var-name').value.trim();
        const label = div.querySelector('.input-label').value.trim();
        const type = div.querySelector('.input-type').value;
        const defaultValue = div.querySelector('.input-default').value;
        
        if (varName && label) {
            inputs.push({ name: varName, label, type, defaultValue });
        }
    });
    
    // Collect formulas
    const formulas = [];
    document.querySelectorAll('#customFormulasList > div').forEach(div => {
        const varName = div.querySelector('.formula-var-name').value.trim();
        const label = div.querySelector('.formula-label').value.trim();
        const formula = div.querySelector('.formula-expression').value.trim();
        
        if (varName && label && formula) {
            formulas.push({ name: varName, label, formula });
        }
    });
    
    const exportData = {
        name: name,
        description: document.getElementById('customPageDesc').value.trim(),
        icon: document.getElementById('customPageIcon').value.trim() || '📊',
        inputs: inputs,
        formulas: formulas,
        version: '1.0',
        exportDate: new Date().toISOString()
    };
    
    // Create download
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast(currentLanguage === 'da' ? `📤 "${name}" eksporteret!` : `📤 "${name}" exported successfully!`, 'success');
}

// Export a saved custom page
function exportCustomPage(pageId) {
    const page = customPages.find(p => p.id === pageId);
    if (!page) return;
    
    const exportData = {
        name: page.name,
        description: page.description,
        icon: page.icon,
        inputs: page.inputs,
        formulas: page.formulas,
        graph: page.graph,
        simulation: page.simulation,
        version: '1.0',
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${page.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast(currentLanguage === 'da' ? `📤 "${page.name}" eksporteret!` : `📤 "${page.name}" exported!`, 'success');
}

// Import page from JSON file
function importPage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importData = JSON.parse(event.target.result);
                
                // Validate required fields
                if (!importData.name || !importData.inputs || !importData.formulas) {
                    showToast(currentLanguage === 'da' ? '❌ Ugyldigt sidefilformat' : '❌ Invalid page file format', 'error');
                    return;
                }
                
                // Fill form with imported data
                document.getElementById('customPageName').value = importData.name;
                document.getElementById('customPageDesc').value = importData.description || '';
                document.getElementById('customPageIcon').value = importData.icon || '📊';
                
                // Clear existing inputs and formulas
                document.getElementById('customInputsList').innerHTML = '';
                document.getElementById('customFormulasList').innerHTML = '';
                
                // Add imported inputs
                importData.inputs.forEach(input => {
                    addCustomInput();
                    const lastInput = document.querySelector('#customInputsList > div:last-child');
                    lastInput.querySelector('.input-var-name').value = input.name;
                    lastInput.querySelector('.input-label').value = input.label;
                    lastInput.querySelector('.input-type').value = input.type || 'number';
                    lastInput.querySelector('.input-default').value = input.defaultValue || '';
                });
                
                // Add imported formulas
                importData.formulas.forEach(formula => {
                    addCustomFormula();
                    const lastFormula = document.querySelector('#customFormulasList > div:last-child');
                    lastFormula.querySelector('.formula-var-name').value = formula.name;
                    lastFormula.querySelector('.formula-label').value = formula.label;
                    lastFormula.querySelector('.formula-expression').value = formula.formula;
                });
                
                showToast(currentLanguage === 'da' ? `📥 "${importData.name}" importeret!` : `📥 "${importData.name}" imported successfully!`, 'success');
            } catch (error) {
                showToast((currentLanguage === 'da' ? '❌ Import af side mislykkedes: ' : '❌ Failed to import page: ') + error.message, 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Duplicate a custom page
function duplicateCustomPage(pageId) {
    const page = customPages.find(p => p.id === pageId);
    if (!page) return;
    
    const duplicatedPage = {
        ...page,
        id: 'custom_' + Date.now(),
        name: page.name + (currentLanguage === 'da' ? ' (Kopi)' : ' (Copy)'),
        inputs: JSON.parse(JSON.stringify(page.inputs)),
        formulas: JSON.parse(JSON.stringify(page.formulas))
    };
    
    customPages.push(duplicatedPage);
    saveCustomPagesToStorage();
    renderCustomPagesGrid();
    renderCustomPagesTabs();
    showToast(currentLanguage === 'da' ? `📋 "${page.name}" duplikeret!` : `📋 "${page.name}" duplicated successfully!`, 'success');
}

// Update input type options based on selection
function updateInputTypeOptions(selectElement) {
    const container = selectElement.closest('.flex-1');
    const defaultInput = container.querySelector('.input-default');
    const type = selectElement.value;
    
    // Update placeholder and type based on selection
    switch(type) {
        case 'number':
            defaultInput.type = 'number';
            defaultInput.placeholder = translate('input-default-placeholder');
            break;
        case 'text':
            defaultInput.type = 'text';
            defaultInput.placeholder = currentLanguage === 'da' ? 'Standardtekst' : 'Default text';
            break;
        case 'range':
            defaultInput.type = 'number';
            defaultInput.placeholder = currentLanguage === 'da' ? 'Standardværdi (f.eks. 50)' : 'Default value (e.g., 50)';
            break;
        case 'date':
            defaultInput.type = 'date';
            defaultInput.placeholder = '';
            break;
        case 'checkbox':
            defaultInput.type = 'text';
            defaultInput.placeholder = currentLanguage === 'da' ? 'sand eller falsk' : 'true or false';
            defaultInput.value = 'false';
            break;
        case 'percentage':
            defaultInput.type = 'number';
            defaultInput.placeholder = currentLanguage === 'da' ? 'Standard % (f.eks. 15)' : 'Default % (e.g., 15)';
            break;
        case 'currency':
            defaultInput.type = 'number';
            defaultInput.placeholder = currentLanguage === 'da' ? 'Standardbeløb (f.eks. 100)' : 'Default amount (e.g., 100)';
            break;
        case 'select':
            defaultInput.type = 'text';
            defaultInput.placeholder = currentLanguage === 'da' ? 'valg1, valg2, valg3' : 'option1, option2, option3';
            break;
    }
}

// Toggle help tooltip
function toggleHelpTooltip(id) {
    const tooltip = document.getElementById(id);
    if (tooltip) {
        tooltip.classList.toggle('hidden');
    }
}

// Toggle validation fields visibility
function toggleValidationFields() {
    const checkbox = document.getElementById('enableValidation');
    const fields = document.getElementById('validationFields');
    const allValidationDetails = document.querySelectorAll('.validation-details');
    
    if (fields) {
        if (checkbox.checked) {
            fields.classList.remove('hidden');
            // Show validation options on all input fields
            allValidationDetails.forEach(detail => {
                detail.classList.remove('hidden');
            });
        } else {
            fields.classList.add('hidden');
            // Hide validation options on all input fields
            allValidationDetails.forEach(detail => {
                detail.classList.add('hidden');
            });
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (typeof math !== 'undefined') {
        initializeCustomPages();
    } else {
        console.error('math.js library not loaded');
    }
});
