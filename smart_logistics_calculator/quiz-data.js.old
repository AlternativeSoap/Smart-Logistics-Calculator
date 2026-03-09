// ============================================================
// LEARN QUIZ SYSTEM — Smart Logistics Calculator
// 110+ questions covering all site tools + general logistics
// For EUC Lillebælt Lager & Logistikoperatør education
// ============================================================

const learnQuizBank = [

// ============================
// CATEGORY 1: ABC ANALYSIS (1-12)
// ============================
{
    id: 1,
    category: 'ABC Analyse',
    q: 'Hvad er grundprincippet bag ABC-analyse?',
    options: [
        'At alle varer behandles ens',
        'Pareto-princippet (80/20-reglen)',
        'At C-varer altid er vigtigst',
        'At man kun fokuserer på dyre varer'
    ],
    correct: 1,
    explanation: 'ABC-analyse bygger på Pareto-princippet (80/20-reglen), som siger at ca. 20% af varerne typisk udgør ca. 80% af den samlede værdi. Dermed kan man prioritere sin indsats på de vigtigste varer.'
},
{
    id: 2,
    category: 'ABC Analyse',
    q: 'Hvor stor en andel af den samlede værdi repræsenterer A-varer typisk?',
    options: ['Ca. 5%', 'Ca. 50%', 'Ca. 80%', 'Ca. 95%'],
    correct: 2,
    explanation: 'A-varer udgør typisk ca. 80% af den samlede lagerværdi, selvom de kun udgør ca. 20% af det totale antal varer. Derfor kræver de tættest kontrol og opmærksomhed.'
},
{
    id: 3,
    category: 'ABC Analyse',
    q: 'Hvor stor en andel af antallet af varer er typisk C-varer?',
    options: ['Ca. 10%', 'Ca. 20%', 'Ca. 30%', 'Ca. 50%'],
    correct: 3,
    explanation: 'C-varer udgør typisk ca. 50% af det totale antal varer, men kun ca. 5% af den samlede værdi. De kræver mindst individuel opmærksomhed.'
},
{
    id: 4,
    category: 'ABC Analyse',
    q: 'Hvad er den anbefalede gennemgangsfrekvens for A-varer?',
    options: ['Årligt', 'Månedligt', 'Ugentligt', 'Dagligt'],
    correct: 3,
    explanation: 'A-varer bør overvåges dagligt eller ugentligt, da de udgør størstedelen af lagerværdien. Hyppig kontrol minimerer risikoen for lagermangler på kritiske varer.'
},
{
    id: 5,
    category: 'ABC Analyse',
    q: 'Hvad er standardgrænseværdierne for ABC-klassificering (Standard 80/95)?',
    options: [
        'A: 0-70%, B: 70-90%, C: 90-100%',
        'A: 0-80%, B: 80-95%, C: 95-100%',
        'A: 0-85%, B: 85-97%, C: 97-100%',
        'A: 0-60%, B: 60-80%, C: 80-100%'
    ],
    correct: 1,
    explanation: 'Standard ABC-grænser er 80/95: A-varer udgør 0-80% af kumulativ værdi, B-varer 80-95%, og C-varer 95-100%. Disse grænser kan justeres efter behov (Tight: 70/90, Loose: 85/97).'
},
{
    id: 6,
    category: 'ABC Analyse',
    q: 'Hvilket diagram bruges oftest til at visualisere ABC-analyse?',
    options: ['Gantt-diagram', 'Pareto-diagram', 'Fishbone-diagram', 'Scatter-plot'],
    correct: 1,
    explanation: 'Et Pareto-diagram (søjlediagram med kumulativ linje) er standardvisualiseringen for ABC-analyse. Det viser tydeligt den kumulative værdiandel og hvor ABC-grænserne falder.'
},
{
    id: 7,
    category: 'ABC Analyse',
    q: 'Hvornår bør man anvende ABC-analyse?',
    options: [
        'Kun ved opstart af ny virksomhed',
        'Ved styring af stort varelager (100+ varer) og begrænsede ressourcer',
        'Kun for fødevarer',
        'Kun i produktionsvirksomheder'
    ],
    correct: 1,
    explanation: 'ABC-analyse er mest nyttig ved store varelagre (100+ varer), begrænsede ressourcer, årlige gennemgangscyklusser, og nye produktlanceringer. Den hjælper med at prioritere indsatsen.'
},
{
    id: 8,
    category: 'ABC Analyse',
    q: 'Hvad er en typisk fejl ved brug af ABC-analyse?',
    options: [
        'At overvåge A-varer for ofte',
        'At ignorere C-varer fuldstændigt',
        'At bruge for nye data',
        'At inkludere for mange varegrupper'
    ],
    correct: 1,
    explanation: 'En typisk fejl er at ignorere C-varer helt. Selvom de har lav værdi, kan mangel på C-varer stadig forårsage produktionsstop eller kundetab. De bør gennemgås periodisk.'
},
{
    id: 9,
    category: 'ABC Analyse',
    q: 'Hvordan beregnes en vares værdi i ABC-analyse?',
    options: [
        'Kun indkøbsprisen',
        'Forbrug × Pris (årligt forbrug gange enhedspris)',
        'Antal på lager × Vægt',
        'Salgspris minus indkøbspris'
    ],
    correct: 1,
    explanation: 'I ABC-analyse beregnes en vares værdi som Forbrug × Pris (årligt antal forbrugte enheder ganget med enhedsprisen). Dette giver den samlede årlige værdi pr. vare.'
},
{
    id: 10,
    category: 'ABC Analyse',
    q: 'Hvad anbefales for sikkerhedslager på B-varer?',
    options: ['0%', '5-15%', '25-50%', '10-25%'],
    correct: 1,
    explanation: 'For B-varer anbefales et sikkerhedslager på 5-15% af forbruget. A-varer bør have 10-25%, mens C-varer kan nøjes med minimalt sikkerhedslager.'
},
{
    id: 11,
    category: 'ABC Analyse',
    q: 'Hvor ofte bør ABC-analysen som minimum opdateres med friske data?',
    options: ['Hvert 5. år', 'Årligt', 'Kvartalsvis', 'Dagligt'],
    correct: 2,
    explanation: 'ABC-analysen bør som minimum opdateres kvartalsvis. Brug af forældet data er en af de mest almindelige fejl — forbrugsmønstre ændrer sig over tid.'
},
{
    id: 12,
    category: 'ABC Analyse',
    q: 'Hvilken lagerstyringsstrategi passer bedst til C-varer?',
    options: [
        'Daglig optælling og just-in-time levering',
        'To-beholder-system med store ordremængder',
        'Individuel prognose for hver vare',
        'Real-time tracking med RFID'
    ],
    correct: 1,
    explanation: 'C-varer styres bedst med simple systemer som to-beholder-systemet, hvor man bestiller en ny batch når den første beholder er tom. Store ordremængder reducerer ordreomkostningerne.'
},

// ============================
// CATEGORY 2: ABC DOBBELT (13-20)
// ============================
{
    id: 13,
    category: 'ABC Dobbelt',
    q: 'Hvad kombinerer ABC Dobbelt Analyse?',
    options: [
        'Pris og leveringstid',
        'Værdi (forbrug × pris) og forbrug (antal enheder)',
        'Vægt og volumen',
        'Indkøbspris og salgspris'
    ],
    correct: 1,
    explanation: 'ABC Dobbelt Analyse kombinerer to dimensioner: Værdi (forbrug × pris) og Forbrug (antal enheder). Dette giver en mere nuanceret klassificering end standard ABC.'
},
{
    id: 14,
    category: 'ABC Dobbelt',
    q: 'Hvor mange kategorier skaber ABC Dobbelt Analyse i matricen?',
    options: ['3', '6', '9', '12'],
    correct: 2,
    explanation: 'ABC Dobbelt Analyse skaber en 3×3 matrix med 9 kategorier: AA, AB, AC, BA, BB, BC, CA, CB og CC. Hver kombination kræver en specifik lagerstyringsstrategi.'
},
{
    id: 15,
    category: 'ABC Dobbelt',
    q: 'Hvad kendetegner en AA-vare i ABC Dobbelt?',
    options: [
        'Lav værdi og lavt forbrug',
        'Høj værdi OG højt forbrug — kræver tæt overvågning',
        'Middel værdi og middel forbrug',
        'Høj værdi men lavt forbrug'
    ],
    correct: 1,
    explanation: 'AA-varer har både høj værdi OG højt forbrug. De er de mest kritiske varer og kræver tæt overvågning, præcis prognose og stramme sikkerhedslagre.'
},
{
    id: 16,
    category: 'ABC Dobbelt',
    q: 'Hvordan styres en AC-vare (høj værdi, lavt forbrug) anderledes end en CA-vare (lav værdi, højt forbrug)?',
    options: [
        'De styres på samme måde',
        'AC kræver værdibaseret kontrol, CA kræver forsyningssikring',
        'AC bestilles i bulk, CA overvåges dagligt',
        'Begge ignoreres som C-varer'
    ],
    correct: 1,
    explanation: 'AC-varer (dyre men sjældent brugt) kræver tæt økonomisk kontrol men sjælden genbestilling. CA-varer (billige men ofte brugt) kræver stabil forsyning og automatisk genbestilling for at undgå mangel.'
},
{
    id: 17,
    category: 'ABC Dobbelt',
    q: 'Hvad er CC-varer i ABC Dobbelt matricen?',
    options: [
        'Kritiske varer der kræver daglig kontrol',
        'Varer med lav værdi OG lavt forbrug — minimal kontrol',
        'Varer med høj værdi og lavt forbrug',
        'Mellemklasse varer'
    ],
    correct: 1,
    explanation: 'CC-varer har både lav værdi og lavt forbrug. De er laveste prioritet og styres med minimal kontrol, periodisk gennemgang og store ordremængder for at spare på administrative omkostninger.'
},
{
    id: 18,
    category: 'ABC Dobbelt',
    q: 'Hvornår er ABC Dobbelt Analyse mere nyttig end standard ABC?',
    options: [
        'Når du har under 10 varer',
        'Når standard ABC ikke er tilstrækkelig til at skelne mellem varer med samme værdiklasse men forskelligt forbrug',
        'Kun i fødevareindustrien',
        'Når du ikke har prisdata'
    ],
    correct: 1,
    explanation: 'ABC Dobbelt er nyttig når standard ABC giver for grov en klassificering — f.eks. kan to A-varer have meget forskelligt forbrug og dermed kræve forskellige styringsstrategier.'
},
{
    id: 19,
    category: 'ABC Dobbelt',
    q: 'Hvad kendetegner BB-varer (moderat) i ABC Dobbelt?',
    options: [
        'Kræver daglig overvågning',
        'Standard lagerprocedurer er tilstrækkelige',
        'Bør elimineres fra lageret',
        'Kræver individuel prognose'
    ],
    correct: 1,
    explanation: 'BB-varer har middel værdi og middel forbrug. Standard lagerprocedurer er tilstrækkelige for disse varer — hverken for tæt eller for løs kontrol.'
},
{
    id: 20,
    category: 'ABC Dobbelt',
    q: 'Hvilke to akser bruges i ABC Dobbelt matricen?',
    options: [
        'Pris-aksen og Tid-aksen',
        'Værdi-aksen (forbrug × pris) og Forbrugs-aksen (antal enheder)',
        'Leverandør-aksen og Kvalitets-aksen',
        'Risiko-aksen og Profit-aksen'
    ],
    correct: 1,
    explanation: 'Matricen har to akser: Værdi (beregnet som forbrug × stykpris) og Forbrug (det rene antal enheder). Kombinationen af de to giver 9 mulige kategorier.'
},

// ============================
// CATEGORY 3: WILSON EOQ (21-30)
// ============================
{
    id: 21,
    category: 'Wilson EOQ',
    q: 'Hvad står EOQ for?',
    options: [
        'Efficient Order Quality',
        'Economic Order Quantity',
        'Expected Outcome Quantity',
        'Enterprise Order Queue'
    ],
    correct: 1,
    explanation: 'EOQ står for Economic Order Quantity — den økonomisk optimale ordrestørrelse. Formlen finder den mængde, der minimerer de samlede lager- og ordreomkostninger.'
},
{
    id: 22,
    category: 'Wilson EOQ',
    q: 'Hvad er Wilsons EOQ-formel?',
    options: [
        'EOQ = D × S × H',
        'EOQ = √(2 × D × S / H)',
        'EOQ = (D + S) / H',
        'EOQ = 2 × D / (S × H)'
    ],
    correct: 1,
    explanation: 'Wilsons formel er EOQ = √(2DS/H), hvor D = årligt forbrug, S = ordreomkostning pr. ordre, og H = lageromkostning pr. enhed pr. år (pris × rente).'
},
{
    id: 23,
    category: 'Wilson EOQ',
    q: 'Hvad repræsenterer "D" i Wilsons formel?',
    options: [
        'Dagligt forbrug',
        'Årligt forbrug (enheder)',
        'Leveringstid i dage',
        'Rabatprocent'
    ],
    correct: 1,
    explanation: 'D repræsenterer det årlige forbrug målt i enheder (Annual Demand). Det er det totale antal enheder, der forbruges eller sælges pr. år.'
},
{
    id: 24,
    category: 'Wilson EOQ',
    q: 'Hvad repræsenterer "S" i Wilsons formel?',
    options: [
        'Sikkerhedslager',
        'Ordreomkostning pr. ordre',
        'Salgspris pr. enhed',
        'Standardafvigelse'
    ],
    correct: 1,
    explanation: 'S repræsenterer ordreomkostningen pr. ordre (Setup/Ordering Cost). Det inkluderer administrative omkostninger, forsendelse, modtagelse og kvalitetskontrol.'
},
{
    id: 25,
    category: 'Wilson EOQ',
    q: 'Hvad repræsenterer "H" i Wilsons formel?',
    options: [
        'Holdbarhedsdato',
        'Lageromkostning pr. enhed pr. år (Pris × Rente)',
        'Hyldekapacitet',
        'Historisk forbrug'
    ],
    correct: 1,
    explanation: 'H er lageromkostningen (Holding Cost) pr. enhed pr. år. Den beregnes som Pris × Rente (lagerprocent), og dækker opbevaring, forsikring, svind og kapitalbinding.'
},
{
    id: 26,
    category: 'Wilson EOQ',
    q: 'Hvad betyder det, hvis EOQ er MINDRE end din nuværende ordrestørrelse?',
    options: [
        'Du bestiller for lidt',
        'Du bestiller for meget — reducer for at spare lageromkostninger',
        'Din ordrestørrelse er perfekt',
        'Du bør stoppe med at bestille'
    ],
    correct: 1,
    explanation: 'Hvis EOQ < nuværende ordrestørrelse, bestiller du for meget ad gangen. Reducer ordrestørrelsen for at spare på lageromkostninger (opbevaring, kapitalbinding, svind).'
},
{
    id: 27,
    category: 'Wilson EOQ',
    q: 'Hvad er formålet med EOQ-beregningen?',
    options: [
        'At maksimere lagerbeholdningen',
        'At finde balancen mellem ordreomkostninger og lageromkostninger',
        'At minimere antallet af varer på lager',
        'At beregne fortjeneste pr. vare'
    ],
    correct: 1,
    explanation: 'EOQ finder den optimale balance: Ordreomkostninger falder med større ordrer (færre bestillinger), mens lageromkostninger stiger (mere på lager). EOQ er det punkt, hvor summen er lavest.'
},
{
    id: 28,
    category: 'Wilson EOQ',
    q: 'Hvis årligt forbrug (D) er 10.000 enheder, ordreomkostning (S) er 100 kr, og lageromkostning (H) er 5 kr/enhed/år, hvad er EOQ?',
    options: ['200 enheder', '400 enheder', '632 enheder', '1.000 enheder'],
    correct: 2,
    explanation: 'EOQ = √(2 × 10.000 × 100 / 5) = √(2.000.000 / 5) = √400.000 = 632 enheder. Husk formlen: EOQ = √(2DS/H).'
},
{
    id: 29,
    category: 'Wilson EOQ',
    q: 'Hvad er en vigtig begrænsning ved Wilsons EOQ-model?',
    options: [
        'Den kan kun bruges til A-varer',
        'Den antager konstant efterspørgsel og ubegrænset lagerplads',
        'Den virker kun med leveringstider under 7 dage',
        'Den kræver minimum 1.000 varer'
    ],
    correct: 1,
    explanation: 'EOQ-modellen antager konstant, jævn efterspørgsel, ingen mængderabatter, ubegrænset lagerkapacitet og øjeblikkelig levering. I virkeligheden bør man justere for disse faktorer.'
},
{
    id: 30,
    category: 'Wilson EOQ',
    q: 'Hvad er "Batch Wilson" beregning?',
    options: [
        'En EOQ-beregning for kun én vare',
        'Beregning af EOQ for alle varer på én gang',
        'En Wilson-beregning med rabatter',
        'Beregning af leveringstid'
    ],
    correct: 1,
    explanation: 'Batch Wilson beregner EOQ for alle varer i datasættet på én gang, i stedet for at beregne én vare ad gangen. Det er effektivt når man har mange varer efter en ABC-analyse.'
},

// ============================
// CATEGORY 4: LAGERSTYRING (31-42)
// ============================
{
    id: 31,
    category: 'Lagerstyring',
    q: 'Hvad er formlen for Genbestillingspunktet (ROP)?',
    options: [
        'ROP = Pris × Forbrug',
        'ROP = (Dagligt Forbrug × Leveringstid) + Sikkerhedslager',
        'ROP = EOQ - Sikkerhedslager',
        'ROP = Årligt Forbrug / 365'
    ],
    correct: 1,
    explanation: 'ROP = (Dagligt Forbrug × Leveringstid) + Sikkerhedslager. Når lagerbeholdningen rammer ROP, skal der bestilles nyt. Sikkerhedslageret beskytter mod uforudsete udsving.'
},
{
    id: 32,
    category: 'Lagerstyring',
    q: 'Hvad bruges Z-scoren 1,65 til i lagerstyring?',
    options: [
        'Den repræsenterer 85% serviceniveau',
        'Den repræsenterer 95% serviceniveau',
        'Den repræsenterer 99% serviceniveau',
        'Den repræsenterer gennemsnitlig leveringstid'
    ],
    correct: 1,
    explanation: 'Z = 1,65 svarer til 95% serviceniveau. Andre vigtige Z-scorer: 90% = 1,28, 98% = 2,05, 99% = 2,33, 99,5% = 2,58. Højere Z-score = højere sikkerhedslager.'
},
{
    id: 33,
    category: 'Lagerstyring',
    q: 'Hvornår er Periodisk Gennemgang-modellen mest velegnet?',
    options: [
        'Når efterspørgslen er meget ustabil',
        'Når leverandøren kører faste ruter eller ved konsolidering af ordrer',
        'Kun til A-varer',
        'Når lageret er næsten tomt'
    ],
    correct: 1,
    explanation: 'Periodisk Gennemgang passer til faste indkøbsintervaller — f.eks. når leverandøren kommer hver 14. dag, eller når man konsoliderer ordrer fra samme leverandør.'
},
{
    id: 34,
    category: 'Lagerstyring',
    q: 'Hvad er formlen for Målniveau i Periodisk Gennemgang?',
    options: [
        'Målniveau = EOQ × 2',
        'Målniveau = Dagligt Forbrug × (Gennemgangsperiode + Leveringstid) + Sikkerhedslager',
        'Målniveau = Sikkerhedslager × Gennemgangsperiode',
        'Målniveau = Max - Min'
    ],
    correct: 1,
    explanation: 'Målniveau = Dagligt Forbrug × (Gennemgangsperiode + Leveringstid) + Sikkerhedslager. Det dækker forbruget i hele perioden indtil næste levering, plus en buffer.'
},
{
    id: 35,
    category: 'Lagerstyring',
    q: 'I Min/Max-modellen, hvad er formlen for Min?',
    options: [
        'Min = EOQ / 2',
        'Min = Sikkerhedslager + (Dagligt Forbrug × Leveringstid)',
        'Min = Dagligt Forbrug × 30',
        'Min = Max - EOQ'
    ],
    correct: 1,
    explanation: 'Min = Sikkerhedslager + (Dagligt Forbrug × Leveringstid). Det er det laveste acceptable lagerniveau, der dækker forbruget i leveringstiden plus en sikkerhedsmargin.'
},
{
    id: 36,
    category: 'Lagerstyring',
    q: 'Hvad er formlen for Max i Min/Max-modellen?',
    options: [
        'Max = Min × 2',
        'Max = Min + EOQ (optimal ordremængde)',
        'Max = Årligt Forbrug / 12',
        'Max = Sikkerhedslager × 3'
    ],
    correct: 1,
    explanation: 'Max = Min + EOQ. Når lageret rammer Min, bestilles EOQ enheder, hvilket bringer lageret op til Max. Det giver en simpel, forudsigelig genbestillingscyklus.'
},
{
    id: 37,
    category: 'Lagerstyring',
    q: 'Hvad betyder "Kritisk" status i Min/Max-modellen?',
    options: [
        'Lageret er over Max',
        'Lageret er under sikkerhedslageret',
        'Lageret er mellem Min og Max',
        'Lageret er præcis på Min'
    ],
    correct: 1,
    explanation: 'Kritisk status (rød) betyder lageret er faldet under sikkerhedslageret. Der er akut risiko for lagermangel, og der bør handles øjeblikkeligt med hastebestilling.'
},
{
    id: 38,
    category: 'Lagerstyring',
    q: 'Hvilken lagerstyringsmodel er bedst til A-varer med variabel efterspørgsel?',
    options: [
        'Min/Max model',
        'Genbestillingspunkt (ROP)',
        'Periodisk Gennemgang',
        'To-beholder-system'
    ],
    correct: 1,
    explanation: 'ROP-modellen (kontinuerlig overvågning) er ideel til A-varer med variabel efterspørgsel. Den bestiller automatisk når lageret rammer genbestillingspunktet, og sikkerhedslageret beskytter mod udsving.'
},
{
    id: 39,
    category: 'Lagerstyring',
    q: 'Hvad er et serviceniveau på 95%?',
    options: [
        '95% af varerne er A-varer',
        'Sandsynligheden for at kunne opfylde kundeefterspørgsel fra lager er 95%',
        '95% af leverancerne ankommer til tiden',
        '95% af lagerpladsen udnyttes'
    ],
    correct: 1,
    explanation: 'Et serviceniveau på 95% betyder at der er 95% sandsynlighed for at kunne opfylde kundens efterspørgsel direkte fra lager, uden lagermangel. De resterende 5% risikerer stock-out.'
},
{
    id: 40,
    category: 'Lagerstyring',
    q: 'Hvad er sikkerhedslagerets formål?',
    options: [
        'At maksimere lageromsætningen',
        'At beskytte mod uforudsete udsving i efterspørgsel eller leveringstid',
        'At reducere ordreomkostningerne',
        'At fylde lageret op til max kapacitet'
    ],
    correct: 1,
    explanation: 'Sikkerhedslageret (Safety Stock) er en buffer, der beskytter mod uventede stigninger i efterspørgsel eller forsinkelser i leverancer. Størrelsen afhænger af ønsket serviceniveau.'
},
{
    id: 41,
    category: 'Lagerstyring',
    q: 'Hvad er "Overfyldt" status i Min/Max-modellen?',
    options: [
        'Lageret er mellem Min og Max',
        'Lageret er under Min',
        'Lageret er over Max',
        'Lageret er præcis på Max'
    ],
    correct: 2,
    explanation: 'Overfyldt (blå) status betyder lageret er over Max-niveauet. Det binder unødig kapital og lagerplads. Årsagen kan være for store bestillinger eller faldende efterspørgsel.'
},
{
    id: 42,
    category: 'Lagerstyring',
    q: 'Dagligt forbrug er 50 stk, leveringstid er 5 dage. Hvad er ROP uden sikkerhedslager?',
    options: ['50 enheder', '100 enheder', '200 enheder', '250 enheder'],
    correct: 3,
    explanation: 'ROP = Dagligt Forbrug × Leveringstid = 50 × 5 = 250 enheder (uden sikkerhedslager). Med 95% serviceniveau ville der komme sikkerhedslager oven i.'
},

// ============================
// CATEGORY 5: LEAN TOOLS (43-57)
// ============================
{
    id: 43,
    category: 'LEAN',
    q: 'Hvad står OEE for?',
    options: [
        'Optimal Equipment Evaluation',
        'Overall Equipment Effectiveness',
        'Operational Efficiency Estimate',
        'Output Energy Efficiency'
    ],
    correct: 1,
    explanation: 'OEE = Overall Equipment Effectiveness (Samlet Udstyrseffektivitet). Det er produktionens vigtigste KPI og måler, hvor godt maskinerne udnyttes.'
},
{
    id: 44,
    category: 'LEAN',
    q: 'Hvordan beregnes OEE?',
    options: [
        'OEE = Tilgængelighed + Ydelse + Kvalitet',
        'OEE = Tilgængelighed × Ydelse × Kvalitet',
        'OEE = (Tilgængelighed + Ydelse) × Kvalitet',
        'OEE = Tilgængelighed / (Ydelse × Kvalitet)'
    ],
    correct: 1,
    explanation: 'OEE = Tilgængelighed × Ydelse × Kvalitet (alle i decimal). F.eks: 90% × 85% × 98% = 0,90 × 0,85 × 0,98 = 74,97%. De tre faktorer ganges sammen.'
},
{
    id: 45,
    category: 'LEAN',
    q: 'Hvad er verdensklasse OEE?',
    options: ['Over 50%', 'Over 65%', 'Over 75%', 'Over 85%'],
    correct: 3,
    explanation: 'Verdensklasse OEE er over 85% (Tilgængelighed ≥95%, Ydelse ≥95%, Kvalitet ≥99,9%). De fleste virksomheder ligger mellem 60-75%.'
},
{
    id: 46,
    category: 'LEAN',
    q: 'Hvad er Takt-tid?',
    options: [
        'Den tid det tager at producere ét styk',
        'Tilgængelig tid divideret med kundeefterspørgsel',
        'Total produktionstid divideret med antal maskiner',
        'Leveringstid minus transporttid'
    ],
    correct: 1,
    explanation: 'Takt-tid = Tilgængelig Tid / Kundeefterspørgsel. Den definerer det tempo, produktionen skal køre med for at matche efterspørgslen. Hvis kunden vil have 100 stk på 8 timer, er Takt = 4,8 min/stk.'
},
{
    id: 47,
    category: 'LEAN',
    q: 'Hvad står SMED for?',
    options: [
        'Single Minute Exchange of Die',
        'Standard Method for Equipment Development',
        'Simple Machine Efficiency Design',
        'Systematic Material Evaluation & Dispatch'
    ],
    correct: 0,
    explanation: 'SMED = Single Minute Exchange of Die (Enkelt-minut omstilling). Målet er at reducere omstillingstiden til under 10 minutter ved at konvertere interne aktiviteter til eksterne.'
},
{
    id: 48,
    category: 'LEAN',
    q: 'Hvad er de 5S i LEAN?',
    options: [
        'Sort, Set in Order, Shine, Standardize, Sustain',
        'Speed, Strength, Safety, Service, Savings',
        'Supply, Stock, Schedule, Ship, Sell',
        'Solve, Simplify, Structure, Support, Scale'
    ],
    correct: 0,
    explanation: '5S: Sortér (Seiri), Systematisér (Seiton), Skinnende rent (Seiso), Standardisér (Seiketsu), Selvdisciplin (Shitsuke). Det er fundamentet for et velorganiseret og effektivt arbejdsmiljø.'
},
{
    id: 49,
    category: 'LEAN',
    q: 'Hvor mange spildtyper (Muda) er der i LEAN?',
    options: ['3', '5', '7', '9'],
    correct: 2,
    explanation: 'Der er 7 spildtyper (Muda): Overproduktion, Ventetid, Transport, Overforarbejdning, Lagerspild, Unødvendig bevægelse og Defekter. Nogle tilføjer en 8.: Uudnyttet talent.'
},
{
    id: 50,
    category: 'LEAN',
    q: 'Hvad er den værste af de 7 spildtyper ifølge LEAN?',
    options: ['Defekter', 'Overproduktion', 'Ventetid', 'Transport'],
    correct: 1,
    explanation: 'Overproduktion anses for den værste spildtype, fordi den forårsager alle andre: mere lager (lagerspild), mere transport, mere ventetid, og skjuler defekter.'
},
{
    id: 51,
    category: 'LEAN',
    q: 'Hvad er Value Stream Mapping (VSM)?',
    options: [
        'En metode til at kortlægge alle trin i en proces fra start til slut',
        'En teknik til at måle maskineffektivitet',
        'Et system til at sortere varer i ABC-kategorier',
        'En kvalitetskontrolmetode'
    ],
    correct: 0,
    explanation: 'VSM kortlægger alle trin i en værdistrøm fra råvare til kunde. Det identificerer værdi-tilførende (VA) og ikke-værdi-tilførende (NVA) aktiviteter, ventetider, og flaskehalse.'
},
{
    id: 52,
    category: 'LEAN',
    q: 'Hvad er PCE (Process Cycle Efficiency)?',
    options: [
        'Total tid / Antal processer',
        'Værdi-tilførende tid / Total gennemløbstid × 100%',
        'Antal fejl / Total produktion × 100%',
        'Maskinudnyttelse / Antal skift'
    ],
    correct: 1,
    explanation: 'PCE = Værditilførende tid / Total gennemløbstid × 100%. En typisk PCE er kun 1-5%, hvilket betyder at 95-99% af tiden er spild (ventetid, transport, osv.). Verdensklasse PCE er over 25%.'
},
{
    id: 53,
    category: 'LEAN',
    q: 'Hvad er Kaizen?',
    options: [
        'Et kvalitetsstyringssystem',
        'Japansk for "kontinuerlig forbedring"',
        'En type lagerstyringssoftware',
        'En transportmetode'
    ],
    correct: 1,
    explanation: 'Kaizen (改善) er japansk for "forandring til det bedre" — altså kontinuerlig forbedring. Det handler om mange små forbedringer over tid, hvor alle medarbejdere bidrager.'
},
{
    id: 54,
    category: 'LEAN',
    q: 'Hvad er PDCA-cyklussen?',
    options: [
        'Price, Demand, Cost, Analysis',
        'Plan, Do, Check, Act',
        'Process, Design, Control, Adjust',
        'Purchase, Deliver, Count, Archive'
    ],
    correct: 1,
    explanation: 'PDCA = Plan (planlæg), Do (udfør), Check (kontrollér), Act (korriger). Det er en iterativ problemløsningsmetode, også kaldet Demings cirkel, som bruges til kontinuerlig forbedring.'
},
{
    id: 55,
    category: 'LEAN',
    q: 'Hvad er forskellen mellem Muda, Mura og Muri?',
    options: [
        'Det er tre japanske bilmærker',
        'Muda = spild, Mura = ujævnhed, Muri = overbelastning',
        'Muda = kvalitet, Mura = hastighed, Muri = pris',
        'Det er tre typer af 5S-audit'
    ],
    correct: 1,
    explanation: '3M: Muda (spild — de 7 spildtyper), Mura (ujævnhed — uensartet arbejdsbyrde), Muri (overbelastning — for meget pres på mennesker eller maskiner). Alle tre skal elimineres.'
},
{
    id: 56,
    category: 'LEAN',
    q: 'Hvad er JIT (Just-In-Time)?',
    options: [
        'At producere store lagre på forhånd',
        'At producere og levere præcis det der er brug for, præcis når der er brug for det',
        'At bestille alle varer på én gang om året',
        'At have minimum 3 måneders lagerbeholdning'
    ],
    correct: 1,
    explanation: 'JIT = Producere/levere præcis den rigtige mængde, på det rigtige tidspunkt, i den rigtige kvalitet. Det minimerer lagerbeholdning og spild, men kræver pålidelige leverandører og processer.'
},
{
    id: 57,
    category: 'LEAN',
    q: 'Hvad er Kanban?',
    options: [
        'En type stregkode',
        'Et visuelt signal/pull-system der styrer produktion og lager',
        'En japansk lagerbygning',
        'Et kvalitetscertifikat'
    ],
    correct: 1,
    explanation: 'Kanban (看板, "signal-kort") er et pull-baseret system, hvor produktion og genbestilling kun sættes i gang, når der er et faktisk behov (signal). Det forhindrer overproduktion og reducerer WIP (Work In Progress).'
},

// ============================
// CATEGORY 6: SUPPLY CHAIN & LOGISTICS GENERAL (58-69)
// ============================
{
    id: 58,
    category: 'Forsyningskæde',
    q: 'Hvad er 7R-principperne i logistik?',
    options: [
        'Return, Recycle, Reduce, Reuse, Repair, Refurbish, Recover',
        'Right Product, Right Quantity, Right Condition, Right Place, Right Time, Right Customer, Right Cost',
        'Risk, Revenue, Resources, Routing, Regulations, Reporting, Returns',
        'Receive, Register, Route, Release, Report, Return, Recycle'
    ],
    correct: 1,
    explanation: '7R = Den rigtige vare, i den rigtige mængde, i den rigtige tilstand, på det rigtige sted, på det rigtige tidspunkt, til den rigtige kunde, til den rigtige pris. Det er logistikkens grundformel.'
},
{
    id: 59,
    category: 'Forsyningskæde',
    q: 'Hvad er en "flaskehals" (bottleneck) i en forsyningskæde?',
    options: [
        'Den hurtigste proces i kæden',
        'Det trin i processen der begrænser den samlede kapacitet',
        'Slutkunden i kæden',
        'Den dyreste leverandør'
    ],
    correct: 1,
    explanation: 'En flaskehals er det trin i processen, der har lavest kapacitet og dermed begrænser hele kædens output. Alt over flaskehalsens kapacitet skaber ventetid og lagerspild.'
},
{
    id: 60,
    category: 'Forsyningskæde',
    q: 'Hvad er gennemløbstid (lead time)?',
    options: [
        'Kun transporttiden',
        'Procestid + Ventetid + Transporttid',
        'Kun produktionstiden',
        'Tiden fra salg til betaling'
    ],
    correct: 1,
    explanation: 'Lead time = Procestid + Ventetid (Kø) + Transporttid. Det er den samlede tid fra en ordre afgives, til varen er klar hos kunden. I VSM opdeles den i VA-tid og NVA-tid.'
},
{
    id: 61,
    category: 'Forsyningskæde',
    q: 'Hvad er FIFO?',
    options: [
        'First In, First Out — det der kom ind først, sendes ud først',
        'Fast Inventory Flow Optimization',
        'Final Invoice For Orders',
        'Fixed Internal Freight Operations'
    ],
    correct: 0,
    explanation: 'FIFO = First In, First Out. De ældste varer på lageret plukkes og sendes først. Det er kritisk for fødevarer og varer med udløbsdato for at minimere svind.'
},
{
    id: 62,
    category: 'Forsyningskæde',
    q: 'Hvad er LIFO?',
    options: [
        'Last In, First Out — det der kom ind sidst, sendes ud først',
        'Logistics Information For Operations',
        'Low Inventory Fast Ordering',
        'Linear Inventory Flow Optimization'
    ],
    correct: 0,
    explanation: 'LIFO = Last In, First Out. De nyeste varer plukkes først. Bruges sjældent i fysisk lagerstyring (undtagen f.eks. tunge materialer i bunker), men er relevant i regnskab.'
},
{
    id: 63,
    category: 'Forsyningskæde',
    q: 'Hvad er FEFO?',
    options: [
        'First Expired, First Out — det med korteste holdbarhed sendes først',
        'Fast Evaluation For Ordering',
        'Final Equipment Function Overview',
        'Flexible Export & Freight Orders'
    ],
    correct: 0,
    explanation: 'FEFO = First Expired, First Out. Varer med tidligste udløbsdato plukkes først, uanset hvornår de ankom. Bruges i fødevare- og medicinalindustrien for at minimere spild.'
},
{
    id: 64,
    category: 'Forsyningskæde',
    q: 'Hvad er en EUR-palle?',
    options: [
        'En palle på 100 × 100 cm',
        'En standardpalle på 80 × 120 cm (EPAL)',
        'En palle kun til europæisk eksport',
        'En engangspalle i pap'
    ],
    correct: 1,
    explanation: 'EUR-pallen (EPAL) måler 80 × 120 cm og er den mest udbredte standardpalle i Europa. Den er genbrugelig, mærket med EPAL-logo og registreret med serienummer.'
},
{
    id: 65,
    category: 'Forsyningskæde',
    q: 'Hvad er en halvpalle?',
    options: [
        '80 × 120 cm', 
        '60 × 80 cm',
        '40 × 60 cm',
        '100 × 60 cm'
    ],
    correct: 1,
    explanation: 'En halvpalle (display-palle) måler 60 × 80 cm — altså halvdelen af en EUR-palle. Den bruges ofte i butikker, hvor den kan trilles direkte ud på salgsgulvet.'
},
{
    id: 66,
    category: 'Forsyningskæde',
    q: 'Hvad er et CMR-fragtbrev?',
    options: [
        'Et certifikat for farligt gods',
        'Et internationalt fragtdokument for vejtransport',
        'En faktura fra speditøren',
        'En tolddeklaration'
    ],
    correct: 1,
    explanation: 'CMR (Convention Marchandises Routières) er et internationalt fragtbrev for vejtransport. Det dokumenterer afsender, modtager, godsbeskrivelse og ansvar under transporten.'
},
{
    id: 67,
    category: 'Forsyningskæde',
    q: 'Hvad er cross-docking?',
    options: [
        'At lagre varer i mindst 30 dage',
        'At modtage varer på én side af lageret og sende dem ud på den anden uden langtidslagring',
        'At placere tunge varer øverst',
        'At krydstjekke stregkoder mod ordrer'
    ],
    correct: 1,
    explanation: 'Cross-docking handler om at varer modtages og sorteres direkte til udgående forsendelser med minimal eller ingen lagertid. Det reducerer lageromkostninger og håndteringstid markant.'
},
{
    id: 68,
    category: 'Forsyningskæde',
    q: 'Hvad er Incoterms?',
    options: [
        'Internationale transportforsikringer',
        'Standardiserede handelsregler der definerer ansvar, risiko og omkostninger mellem køber og sælger',
        'Europæiske toldkoder',
        'Kvalitetsstandarder for emballage'
    ],
    correct: 1,
    explanation: 'Incoterms (International Commercial Terms) er standardiserede regler udgivet af ICC, der klart definerer hvem der betaler for transport, forsikring, told osv., og hvornår risikoen overgår fra sælger til køber.'
},
{
    id: 69,
    category: 'Forsyningskæde',
    q: 'Hvad betyder Incoterm "EXW" (Ex Works)?',
    options: [
        'Sælger leverer til kundens dør',
        'Køber henter varen hos sælger — al transport og risiko påhviler køber',
        'Sælger betaler fragten til nærmeste havn',
        'Varen er forsikret under hele transporten'
    ],
    correct: 1,
    explanation: 'EXW (Ex Works / Ab Fabrik) er den mest simple Incoterm: Sælger stiller varen til rådighed, og køber står for ALT — afhentning, transport, forsikring, told. Mindst ansvar for sælger.'
},

// ============================
// CATEGORY 7: LAGER & WAREHOUSE (70-81)
// ============================
{
    id: 70,
    category: 'Lager & Drift',
    q: 'Hvad er de tre grundlæggende lagerprocesser?',
    options: [
        'Sortér, Pak, Send',
        'Modtagelse (Inbound), Opbevaring (Storage), Forsendelse (Outbound)',
        'Tæl, Registrer, Rapporter',
        'Bestil, Modtag, Betal'
    ],
    correct: 1,
    explanation: 'De tre hovedprocesser i et lager er: 1) Modtagelse (godskontrol, registrering), 2) Opbevaring (put-away, lagring), 3) Forsendelse (pluk, pak, afsendelse). Alt imellem er støtteprocesser.'
},
{
    id: 71,
    category: 'Lager & Drift',
    q: 'Hvad er indlagring (put-away)?',
    options: [
        'At kassere beskadigede varer',
        'At placere modtagne varer på deres korrekte lagerplads',
        'At pakke ordrer',
        'At returnere varer til leverandør'
    ],
    correct: 1,
    explanation: 'Indlagring (put-away) er processen hvor modtagne varer flyttes fra modtageområdet til deres tildelte lagerplads. Effektiv indlagring med ABC-zonering sparer meget plukketid.'
},
{
    id: 72,
    category: 'Lager & Drift',
    q: 'Hvad er plukning (picking)?',
    options: [
        'At modtage varer fra leverandør',
        'At udtage varer fra lagerpladser til at opfylde ordrer',
        'At tælle lagerbeholdningen',
        'At sortere varer efter ABC-klasse'
    ],
    correct: 1,
    explanation: 'Plukning (picking) er den mest tidskrævende lagerproces (op til 50-60% af arbejdstiden). Effektiv AB-zoneinddeling og optimerede plukruter kan reducere pluktiden markant.'
},
{
    id: 73,
    category: 'Lager & Drift',
    q: 'Hvorfor placeres A-varer tættest på forsendelsesområdet (ABC-zonering)?',
    options: [
        'For de er dyrere',
        'For de plukkes oftest — kort afstand sparer tid',
        'For de fylder mest',
        'For de er farligst'
    ],
    correct: 1,
    explanation: 'A-varer har højest omløbshastighed (plukkes oftest). Ved at placere dem tæt på forsendelsen minimerer man gangafstanden, som er den største tidstjuv i et lager.'
},
{
    id: 74,
    category: 'Lager & Drift',
    q: 'Hvad er koldlagring (Cold Storage) typisk brugt til?',
    options: [
        'Opbevaring af elektronik',
        'Opbevaring af temperatur-følsomme varer (fødevarer, medicin)',
        'Arkivering af dokumenter',
        'Opladning af trucks'
    ],
    correct: 1,
    explanation: 'Koldlagring bruges til varer der kræver temperaturkontrol: ferske fødevarer, frosne varer, medicin, kemikalier m.m. Det er del af cold chain management.'
},
{
    id: 75,
    category: 'Lager & Drift',
    q: 'Hvad er en mezzanin i et lager?',
    options: [
        'Et kølerum',
        'Et mellemdæk/balkon der udnytter højden og skaber ekstra etageplads',
        'En modtagerampe',
        'Et kontor til lagerchefen'
    ],
    correct: 1,
    explanation: 'En mezzanin er et mellemdæk eller balkon inde i lagerhallen, der udnytter den vertikale plads. Det kan fordoble lagerarealet uden at udvide bygningen. Bruges ofte til småvarer og plukzoner.'
},
{
    id: 76,
    category: 'Lager & Drift',
    q: 'Hvad er et klargøringsområde (staging area)?',
    options: [
        'Et pauseområde for medarbejdere',
        'Et midlertidigt opbevaringsområde til varer der venter på at blive sendt eller sat på plads',
        'Et område til defekte varer',
        'En parkeringsplads til trucks'
    ],
    correct: 1,
    explanation: 'Klargøringsområdet (staging area) er en bufferzone, hvor varer midlertidigt samles — enten indgående (venter på indlagring) eller udgående (pakket og venter på afhentning). Det holder processerne flydende.'
},
{
    id: 77,
    category: 'Lager & Drift',
    q: 'Hvorfor er det vigtigt at have markerede gabeltruckstier i et lager?',
    options: [
        'For at det ser pænt ud',
        'For sikkerhed — adskiller kørsel fra gangarealer, reducerer ulykker',
        'Lovkrav kun i USA',
        'For at spare på gulvbelægningen'
    ],
    correct: 1,
    explanation: 'Markerede gabeltruckstier (floor markings) er afgørende for sikkerheden. De adskiller kørende trafik fra gående, reducerer kollisioner og ulykker, og er krav i de fleste arbejdsmiljøregler.'
},
{
    id: 78,
    category: 'Lager & Drift',
    q: 'Hvad er en karantænezone (quarantine zone) i et lager?',
    options: [
        'Pauserum for syge medarbejdere',
        'Et isoleret område til varer der afventer kvalitetskontrol eller er defekte',
        'Et udendørs lagerområde',
        'Et område kun til farligt gods'
    ],
    correct: 1,
    explanation: 'Karantænezonen (quarantine zone) er et afspærret område, hvor varer holdes, mens de venter på kvalitetskontrol, undersøges for fejl, eller er returnerede varer. De må ikke plukkes fra, før de er godkendt.'
},
{
    id: 79,
    category: 'Lager & Drift',
    q: 'Hvad er lageromsætningshastighed?',
    options: [
        'Antal ansatte per kvadratmeter',
        'Antal gange lageret sælges og genopfyldes i en periode',
        'Hastigheden på transportbånd',
        'Antallet af ordrer per time'
    ],
    correct: 1,
    explanation: 'Lageromsætningshastighed = Vareforbrug (kostpris) / Gennemsnitlig lagerbeholdning. Høj omsætning = effektiv kapitalbinding. F.eks. betyder omsætning 12 = lageret udskiftes hver måned.'
},
{
    id: 80,
    category: 'Lager & Drift',
    q: 'Hvad er et transportbånd (conveyor belt) brugt til i et lager?',
    options: [
        'At opvarme lagerrummet',
        'At flytte varer automatisk mellem zoner uden manuelt løft',
        'At vejer varer',
        'At sortere affald'
    ],
    correct: 1,
    explanation: 'Transportbånd automatiserer intern flytning af varer mellem modtagelse, sortering, plukning og forsendelse. Det reducerer manuelt løftearbejde, forbedrer ergonomi og øger gennemstrømningen.'
},
{
    id: 81,
    category: 'Lager & Drift',
    q: 'Hvad er formålet med en ladestation i lageret?',
    options: [
        'At oplade mobiltelefoner',
        'At oplade elektriske gaffeltruck-batterier og lagerrobotter',
        'At oplade sikkerhedsudstyr',
        'At teste stregkodescannere'
    ],
    correct: 1,
    explanation: 'Ladestationer bruges til at oplade batterier i elektriske gaffeltrucks, reachtrucks, palleløftere og evt. lagerrobotter (AGV). Placering nær trafikruter minimerer spildtid.'
},

// ============================
// CATEGORY 8: SIKKERHED, ERGONOMI, ADR (82-89)
// ============================
{
    id: 82,
    category: 'Sikkerhed & Ergonomi',
    q: 'Hvad er den maksimale anbefalede vægt for manuelt løft ifølge Arbejdstilsynet?',
    options: ['10 kg', '15 kg', '25 kg', '50 kg'],
    correct: 2,
    explanation: 'Arbejdstilsynet anbefaler max 25 kg for manuelt løft under optimale forhold (tæt på kroppen, mellem hofte og skuldre). Ved dårlige forhold nedsættes grænsen til 12-15 kg.'
},
{
    id: 83,
    category: 'Sikkerhed & Ergonomi',
    q: 'Hvad kræves normalt for at køre gaffeltruck i Danmark?',
    options: [
        'Kun et normalt kørekort',
        'Gaffeltruckcertifikat (truckbevis)',
        'Ingen certificering er nødvendig',
        'Bachelor i logistik'
    ],
    correct: 1,
    explanation: 'For at køre gaffeltruck i Danmark kræves et gyldigt gaffeltruckcertifikat (truckbevis) udstedt efter godkendt kursus. Der findes certificeringer til forskellige trucktyper (B, A osv.).'
},
{
    id: 84,
    category: 'Sikkerhed & Ergonomi',
    q: 'Hvad betyder det orange faresymbol med en flamme over en cirkel?',
    options: [
        'Brandfarlig/letantændelig',
        'Oxiderende stof — kan forstærke brand',
        'Sundhedsfare',
        'Miljøfare'
    ],
    correct: 1,
    explanation: 'Flamme over cirkel = oxiderende stof. Det kan forstærke brand ved at frigive ilt. Det skal opbevares adskilt fra brandbare materialer. Flamme ALENE = brandfarlig.'
},
{
    id: 85,
    category: 'Sikkerhed & Ergonomi',
    q: 'Hvad er ADR i forbindelse med transport?',
    options: [
        'Automatic Delivery Registration',
        'Europæisk konvention om international vejtransport af farligt gods',
        'Avanceret leveringsrapport',
        'Average Delivery Rate'
    ],
    correct: 1,
    explanation: 'ADR (Accord européen relatif au transport international des marchandises Dangereuses par Route) regulerer vejtransport af farligt gods i Europa. Det kræver korrekt klassificering, mærkning og godkendt emballage.'
},
{
    id: 86,
    category: 'Sikkerhed & Ergonomi',
    q: 'Hvad skal du gøre ved en nødudgang i et lager?',
    options: [
        'Opbevare varer der har brug for ventilation',
        'Holde den fri for forhindringer til enhver tid',
        'Bruge den som ekstra modtageport',
        'Placere tunge varer foran den for sikkerhed'
    ],
    correct: 1,
    explanation: 'Nødudgange skal ALTID holdes frie, synlige og uaflåste i arbejdstiden. Blokering af nødudgange er en alvorlig lovovertrædelse og kan koste liv ved brand eller uheld.'
},
{
    id: 87,
    category: 'Sikkerhed & Ergonomi',
    q: 'Hvad er korrekt løfteteknik?',
    options: [
        'Løft med ryggen, hold benene strakte',
        'Bøj i knæene, hold ryggen ret, løft tæt på kroppen',
        'Ræk ud med strakte arme',
        'Vrid kroppen mens du løfter'
    ],
    correct: 1,
    explanation: 'Korrekt løfteteknik: Bøj i knæ og hofter, hold ryggen ret, grib varen tæt på kroppen, løft med benmusklerne. Undgå vridninger og pludselige bevægelser. Brug hjælpemidler ved tunge løft.'
},
{
    id: 88,
    category: 'Sikkerhed & Ergonomi',
    q: 'Hvilke personnlige værnemidler (PPE) er typisk påkrævet i et lager?',
    options: [
        'Kun sikkerhedssko',
        'Sikkerhedssko, refleksvest, evt. hjelm og handsker',
        'Svømmebriller og ørepropper',
        'Ingen, da lagre er sikre miljøer'
    ],
    correct: 1,
    explanation: 'Standard lagerpersonale bærer: sikkerhedssko (stålnæse), refleksvest/synlighedstøj, og afhængigt af opgaven: hjelm, handsker, høreværn, og evt. åndedrætsværn ved farlige stoffer.'
},
{
    id: 89,
    category: 'Sikkerhed & Ergonomi',
    q: 'Hvad er formålet med et sikkerhedsdatablad (SDS)?',
    options: [
        'At dokumentere medarbejdernes arbejdstid',
        'At give detaljeret information om kemiske stoffers farer, håndtering og førstehjælp',
        'At registrere lagerplaceringer',
        'At beregne forsikringspræmier'
    ],
    correct: 1,
    explanation: 'Et sikkerhedsdatablad (SDS/MSDS) indeholder 16 sektioner med info om et kemisk stofs farer, sammensætning, førstehjælp, brandslukning, håndtering, opbevaring, og bortskaffelse. Lovpligtigt for alle farlige stoffer.'
},

// ============================
// CATEGORY 9: BUDGET & ØKONOMI (90-95)
// ============================
{
    id: 90,
    category: 'Budget & Økonomi',
    q: 'Hvad er forskellen mellem faste og variable udgifter?',
    options: [
        'Faste er dyrere end variable',
        'Faste er det samme hver måned (husleje), variable svinger (dagligvarer)',
        'Variable er altid større end faste',
        'Der er ingen forskel'
    ],
    correct: 1,
    explanation: 'Faste udgifter er konstante (husleje, forsikring, abonnementer), mens variable udgifter svinger fra måned til måned (dagligvarer, transport, fritid). Budgettering kræver styring af begge.'
},
{
    id: 91,
    category: 'Budget & Økonomi',
    q: 'Hvad er en sikkerhedsbuffer i et budget?',
    options: [
        'Et ekstra beløb man aldrig må røre',
        'En procentvis reserve (typisk 5-20%) til uforudsete udgifter',
        'Pengene der er til overs efter alle udgifter',
        'En ekstra forsikring'
    ],
    correct: 1,
    explanation: 'En sikkerhedsbuffer (typisk 5-20% af husstandens udgifter) er en reserve til uforudsete udgifter som reparationer, tandlæge, eller uventede regninger. Det forhindrer at man kommer i minus.'
},
{
    id: 92,
    category: 'Budget & Økonomi',
    q: 'Hvad er ROI (Return on Investment)?',
    options: [
        'Risiko Over Investering',
        'Afkast af investering — (Gevinst - Investering) / Investering × 100%',
        'Rente Over Inflation',
        'Rate of Inventory'
    ],
    correct: 1,
    explanation: 'ROI = (Gevinst - Investering) / Investering × 100%. Eksempel: Investerer 100.000 kr og tjener 130.000 kr → ROI = (130.000 - 100.000) / 100.000 = 30%. Bruges til at vurdere om en investering er rentabel.'
},
{
    id: 93,
    category: 'Budget & Økonomi',
    q: 'Hvordan beregnes en 14-dages overførsel fra et månedligt budget?',
    options: [
        'Månedligt beløb / 2',
        'Årligt beløb / 26 (26 to-ugers perioder pr. år)',
        'Månedligt beløb × 14 / 30',
        'Årligt beløb / 24'
    ],
    correct: 1,
    explanation: 'Et år har 26 to-ugers perioder (52 uger / 2). Så 14-dages overførsel = Årligt beløb / 26. Det er lidt mindre end "halvt om månedligt", fordi 26 × 14 = 364 dage.'
},
{
    id: 94,
    category: 'Budget & Økonomi',
    q: 'Hvad er payback-perioden for en investering?',
    options: [
        'Den tid det tager at modtage leverancen',
        'Den tid det tager at tjene investeringen hjem (nul-punkt)',
        'Låneaftalens løbetid',
        'Tilbagebetalingsfristen på en faktura'
    ],
    correct: 1,
    explanation: 'Payback-perioden er den tid det tager, før de akkumulerede besparelser/indtægter overstiger den oprindelige investering. Kort payback = lavere risiko. Bruges i Kaizen ROI-beregninger.'
},
{
    id: 95,
    category: 'Budget & Økonomi',
    q: 'Hvad er det vigtigste formål med et personligt budget?',
    options: [
        'At betale så lidt skat som muligt',
        'At sikre overblik over indtægter vs. udgifter og planlægge sin økonomi',
        'At spare hele sin løn op',
        'At sammenligne sig med andre'
    ],
    correct: 1,
    explanation: 'Et budget giver overblik over indtægter og udgifter, hjælper med at prioritere forbrug, opbygge opsparing, og undgå uventede økonomiske problemer. Det er et styringsværktøj, ikke et sparemål.'
},

// ============================
// CATEGORY 10: STREGKODER, QR & GENERELT (96-110)
// ============================
{
    id: 96,
    category: 'Stregkoder & QR',
    q: 'Hvad er en EAN-13 stregkode typisk brugt til?',
    options: [
        'Intern lagermærkning',
        'Europæiske detailhandelsvarer (butiksvarer)',
        'Kun bøger',
        'Internationale forsendelser'
    ],
    correct: 1,
    explanation: 'EAN-13 (European Article Number) med 13 cifre er den mest udbredte stregkode for europæiske butiksvarer. Du scanner den ved kassen. De første cifre angiver landekode, derefter producent og vare.'
},
{
    id: 97,
    category: 'Stregkoder & QR',
    q: 'Hvad er forskellen på EAN-8 og EAN-13?',
    options: [
        'EAN-8 er nyere',
        'EAN-8 har færre cifre og bruges til små emballager hvor plads er begrænset',
        'EAN-8 er kun til USA',
        'Der er ingen forskel'
    ],
    correct: 1,
    explanation: 'EAN-8 har kun 8 cifre (7 + check) og er mindre fysisk. Den bruges til varer med begrænset emballageplads, f.eks. tyggegummipakker eller små kosmetikprodukter.'
},
{
    id: 98,
    category: 'Stregkoder & QR',
    q: 'Hvad er CODE-128 primært brugt til?',
    options: [
        'Butiksvarer i Europa',
        'Intern logistik, shipping og pakkemærkning — kan indeholde tekst og tal',
        'Bøger og magasiner',
        'Betalingskort'
    ],
    correct: 1,
    explanation: 'CODE-128 er den mest alsidige lineære stregkode. Den kan indeholde alle ASCII-tegn (tal, bogstaver, specialtegn) og bruges til shipping-labels, interne lagerkoder, og GS1-128 track-and-trace.'
},
{
    id: 99,
    category: 'Stregkoder & QR',
    q: 'Hvad er ITF-14 stregkoden typisk brugt til?',
    options: [
        'Individuelle butiksvarer',
        'Bulk- og palleemballager, ydre kartoner',
        'Digitale kvitteringer',
        'Biometrisk identifikation'
    ],
    correct: 1,
    explanation: 'ITF-14 (Interleaved Two of Five) med 14 cifre bruges på ydre emballage — kartoner, paller, bulk-forsendelser. Den er robust, kan printes direkte på bølgepap og scannes på afstand.'
},
{
    id: 100,
    category: 'Stregkoder & QR',
    q: 'Hvad er en QR-kodes primære fordel over en traditionel stregkode?',
    options: [
        'Den er billigere at printe',
        'Den kan rumme meget mere data og scannes fra enhver vinkel',
        'Den er altid i farver',
        'Den kræver ingen scanner'
    ],
    correct: 1,
    explanation: 'QR-koder (Quick Response) er 2D og kan rumme op til ~4.296 tegn vs. ~20-30 tegn i en 1D stregkode. De kan scannes fra enhver vinkel, med smartphones, og indeholde URLs, kontaktinfo, WiFi m.m.'
},
{
    id: 101,
    category: 'Stregkoder & QR',
    q: 'Hvad er fejlkorrektionsniveau "H" i QR-koder?',
    options: [
        '7% af koden kan være beskadiget',
        '15% af koden kan være beskadiget',
        '25% af koden kan være beskadiget',
        '30% af koden kan være beskadiget og stadig scannes'
    ],
    correct: 3,
    explanation: 'QR fejlkorrektionsniveau H (High) tillader op til 30% beskadigelse/tilsmudsning. Niveauerne er: L=7%, M=15%, Q=25%, H=30%. Højere niveau = mere robust men større kode.'
},
{
    id: 102,
    category: 'Generelt Logistik',
    q: 'Hvad er et WMS?',
    options: [
        'Wireless Monitoring System',
        'Warehouse Management System — software til lagerstyring',
        'World Market Standard',
        'Weekly Maintenance Schedule'
    ],
    correct: 1,
    explanation: 'WMS = Warehouse Management System. Det er software der automatiserer og optimerer lagerprocesser: indlagring, plukning, lagerplacering, optælling, og rapportering. Det er rygraden i moderne lagerdrift.'
},
{
    id: 103,
    category: 'Generelt Logistik',
    q: 'Hvad er et ERP-system?',
    options: [
        'Emergency Response Plan',
        'Enterprise Resource Planning — integreret virksomhedsstyringsystem',
        'External Routing Protocol',
        'Equipment Repair Procedure'
    ],
    correct: 1,
    explanation: 'ERP (Enterprise Resource Planning) er et centralt IT-system der integrerer alle forretningsprocesser: økonomi, lager, salg, produktion, HR osv. Kendte eksempler: SAP, Microsoft Dynamics, Oracle.'
},
{
    id: 104,
    category: 'Generelt Logistik',
    q: 'Hvad er TCO (Total Cost of Ownership)?',
    options: [
        'Kun indkøbsprisen for en vare',
        'De samlede omkostninger ved at eje/bruge en vare over hele dens levetid',
        'Transportomkostninger alene',
        'Toldafgifter og moms'
    ],
    correct: 1,
    explanation: 'TCO inkluderer ALLE omkostninger: indkøb, fragt, opbevaring, vedligeholdelse, forsikring, svind, bortskaffelse m.m. En billig vare med høje følgeomkostninger kan være dyrere end en dyr vare med lave følgeomkostninger.'
},
{
    id: 105,
    category: 'Generelt Logistik',
    q: 'Hvad er svind (shrinkage) i lagerstyring?',
    options: [
        'Når lageret fysisk krymper',
        'Tab af lagerbeholdning pga. tyveri, beskadigelse, fejl eller fordærv',
        'Når priser falder',
        'Reduktion i antal ansatte'
    ],
    correct: 1,
    explanation: 'Svind (shrinkage) er forskellen mellem den registrerede og den faktiske lagerbeholdning. Årsager: tyveri (internt/eksternt), beskadigelse, administrativefejl, fordærv. Typisk 1-3% af lagerværdien.'
},
{
    id: 106,
    category: 'Generelt Logistik',
    q: 'Hvad er batch-/lotnummer brugt til?',
    options: [
        'At sætte priser',
        'Sporbarhed — at kunne spore en specifik gruppe af varer tilbage til produktionsdato/leverandør',
        'At tælle antal på lager',
        'At identificere lagerpladser'
    ],
    correct: 1,
    explanation: 'Batch/lotnummer giver fuld sporbarhed: Hvis der opdages en fejl, kan man tilbagekalde præcis den batch. Det er lovpligtigt i fødevare- og medicinalindustrien.'
},
{
    id: 107,
    category: 'Generelt Logistik',
    q: 'Hvad er cyklisk optælling (cycle counting)?',
    options: [
        'At tælle alle varer på lageret én gang om året',
        'At tælle en del af lageret regelmæssigt, så alt tælles over en periode',
        'At tælle varer kun når de modtages',
        'At tælle transportmidler'
    ],
    correct: 1,
    explanation: 'Cyklisk optælling tæller en lille del af lageret dagligt/ugentligt (f.eks. A-varer oftere end C-varer), så hele lageret gennemgås over tid. Det er mere praktisk end fuld årlig optælling og giver bedre datakvalitet.'
},
{
    id: 108,
    category: 'Generelt Logistik',
    q: 'Hvad er SMART-mål?',
    options: [
        'Mål der kræver høj intelligens',
        'Specific, Measurable, Achievable, Relevant, Time-bound',
        'Sales, Marketing, Analytics, Revenue, Training',
        'Standard, Method, Approach, Result, Timeline'
    ],
    correct: 1,
    explanation: 'SMART: Specific (specifikt), Measurable (målbart), Achievable (opnåeligt), Relevant (relevant), Time-bound (tidsbestemt). F.eks. "Reducer leveringstiden med 15% inden Q3 2026" er SMART.'
},
{
    id: 109,
    category: 'Generelt Logistik',
    q: 'Hvad er en SWOT-analyse?',
    options: [
        'En regnskabsmetode',
        'En strategisk analyse af Strengths, Weaknesses, Opportunities og Threats',
        'En sikkerhedskontrol',
        'En transportberegning'
    ],
    correct: 1,
    explanation: 'SWOT analyserer: Styrker (interne fordele), Svagheder (interne ulemper), Muligheder (eksterne chancer), Trusler (eksterne risici). Det bruges til strategisk planlægning og beslutninger.'
},
{
    id: 110,
    category: 'Generelt Logistik',
    q: 'Hvad er "Incoterm DDP" (Delivered Duty Paid)?',
    options: [
        'Køber betaler alt',
        'Sælger leverer til døren og betaler al transport, told og moms — max ansvar for sælger',
        'Varen hentes på fabrikken',
        'Sælger betaler kun til grænsen'
    ],
    correct: 1,
    explanation: 'DDP er modsætningen til EXW: Sælger bærer ALLE omkostninger og risici helt til kundens dør, inkl. transport, forsikring, told og importmoms. Det er den mest favorable Incoterm for køber.'
},
{
    id: 111,
    category: 'Generelt Logistik',
    q: 'Hvad er gennemløb (throughput) i lagersammenhæng?',
    options: [
        'Antal ansatte der kan gå igennem lageret',
        'Mængden af varer der kan behandles (modtages, plukkes, sendes) pr. tidsenhed',
        'Tykkelsen af lagergulvet',
        'Antallet af hylder i lageret'
    ],
    correct: 1,
    explanation: 'Gennemløb (throughput) måler lagerets kapacitet: antal ordrer, linjer, kolli eller paller der behandles pr. time/dag. Det er en nøgle-KPI for lagereffektivitet.'
},
{
    id: 112,
    category: 'Generelt Logistik',
    q: 'Hvad er forskellen mellem 3PL og 4PL?',
    options: [
        '3PL er billigere end 4PL',
        '3PL udfører operationer (transport/lager), 4PL koordinerer hele forsyningskæden som rådgiver',
        '3PL er for 3 leverandører, 4PL for 4',
        'Der er ingen forskel'
    ],
    correct: 1,
    explanation: '3PL (Third-Party Logistics) udfører fysiske operationer (transport, lagring, distribution). 4PL (Fourth-Party) styrer og koordinerer hele forsyningskæden strategisk, ofte inkl. valg af 3PL-leverandører.'
},
{
    id: 113,
    category: 'LEAN',
    q: 'Hvad er Cykeltid (Cycle Time)?',
    options: [
        'Den tid en medarbejder cykler til arbejde',
        'Antal producerede enheder divideret med total tid',
        'Tiden fra kundebestilling til levering',
        'Tiden mellem to vedligeholdelseskontroller'
    ],
    correct: 1,
    explanation: 'Cykeltid = Producerede enheder / Total tid. Det er den faktiske tid det tager at slutføre én enhed. Cykeltid skal være ≤ Takt-tid for at møde kundeefterspørgslen.'
},
{
    id: 114,
    category: 'Forsyningskæde',
    q: 'Hvad er "sidste kilometer-levering" (last mile delivery)?',
    options: [
        'Den længste strækning i transporten',
        'Den sidste del af leveringen fra distributionscenter til slutkunde',
        'Levering til afsidesliggende øer',
        'Levering af reservedele'
    ],
    correct: 1,
    explanation: 'Sidste kilometer-levering (last mile) er den dyreste og mest komplekse del af leveringen: fra distributionscenteret til kundens adresse. Den udgør ofte op til 50% af de totale fragtomkostninger pga. mange små stop.'
},
{
    id: 115,
    category: 'Lager & Drift',
    q: 'Hvad er en reachtruck?',
    options: [
        'En lastbil med lang rækkevidde',
        'En gaffeltruck designet til smalle gange der kan løfte paller i stor højde',
        'Et transportbånd der strækker sig',
        'En kran der når ud over bygningen'
    ],
    correct: 1,
    explanation: 'En reachtruck har en fremskudt mast der kan "række" ind i reolen. Den er designet til smalle gange (2,7-3 m) og kan løfte paller op til 10-12 m højde. Ideel til højlagre.'
},
{
    id: 116,
    category: 'Stregkoder & QR',
    q: 'Hvad er UPC-A stregkoden primært brugt til?',
    options: [
        'Europæiske butikker',
        'Nordamerikansk detailhandel (USA og Canada)',
        'Kun bøger',
        'Kun fødevarer'
    ],
    correct: 1,
    explanation: 'UPC-A (Universal Product Code) med 12 cifre er den nordamerikanske standard for detailhandelsvarer. Den svarer til EAN-13 i Europa, og de to systemer er kompatible.'
},
{
    id: 117,
    category: 'Generelt Logistik',
    q: 'Hvad er ABC-zonering i et fysisk lager?',
    options: [
        'Maling af gulvet i tre farver',
        'Placering af A-varer nærmest pluk/forsendelse, B-varer lidt længere væk, C-varer fjernest',
        'Sortering af varer efter farve',
        'Inddeling af lageret i tre etager'
    ],
    correct: 1,
    explanation: 'ABC-zonering optimerer lagerlayoutet: A-varer (hyppigst plukket) placeres i "guldzonen" (golden zone) tættest på forsendelsen. B-varer i mellomzonen. C-varer fjernest. Det minimerer gangafstand og pluktid.'
},
{
    id: 118,
    category: 'LEAN',
    q: 'Hvad er et "Hvad-hvis" scenarie (What-If) i LEAN?',
    options: [
        'En risikoforsikring',
        'En simulering der viser effekten af at ændre én eller flere parametre',
        'En fejlanalyse efter en ulykke',
        'En type 5S-audit'
    ],
    correct: 1,
    explanation: 'Hvad-hvis scenariet (What-If) lader dig ændre parametre (f.eks. "Hvad hvis OEE stiger 5%?" eller "Hvad hvis efterspørgsel falder 10%?") og se den beregnede effekt. Det bruges til beslutningsstøtte og planlægning.'
},
{
    id: 119,
    category: 'Forsyningskæde',
    q: 'Hvad er "bullwhip-effekten"?',
    options: [
        'Et sikkerhedsproblem med paller',
        'At små udsving i kundeefterspørgsel forstærkes op gennem forsyningskæden',
        'En metode til at piske processer fremad',
        'Effekten af at bruge for mange leverandører'
    ],
    correct: 1,
    explanation: 'Bullwhip-effekten: små variationer i slutkundens efterspørgsel forstørres eksplosivt op gennem kæden (butik → lager → producent → leverandør). Løsning: del data, reducer gennemløbstider, undgå batch-bestilling.'
},
{
    id: 120,
    category: 'Generelt Logistik',
    q: 'Hvad er KPI?',
    options: [
        'Key Product Information',
        'Key Performance Indicator — nøgletalsindikator til at måle præstation',
        'Known Problem Issue',
        'Kanban Process Integration'
    ],
    correct: 1,
    explanation: 'KPI = Key Performance Indicator (nøgletal). Eksempler i logistik: Lageromsætning, leveringspræcision, plukkefejl-rate, OEE, lagerudnyttelse, ordrecyklustid. KPIer bør være SMART.'
}

];

// ============================================================
// QUIZ ENGINE
// ============================================================

const LearnQuiz = {
    currentQuestions: [],
    currentIndex: 0,
    answers: [],       // user's picked option index per question
    locked: [],        // whether each question is locked (answered)
    mode: null,        // 10, 25, or 35
    finished: false,

    // Fisher-Yates shuffle
    shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    },

    // Start a quiz with n questions
    start(n) {
        this.mode = n;
        this.finished = false;
        this.currentIndex = 0;
        this.answers = new Array(n).fill(-1);
        this.locked = new Array(n).fill(false);

        // Pick n random questions and randomize option order per question
        const shuffled = this.shuffle(learnQuizBank);
        this.currentQuestions = shuffled.slice(0, n).map(q => {
            // Shuffle options but track where the correct one moved
            const indices = q.options.map((_, i) => i);
            const shuffledIndices = this.shuffle(indices);
            return {
                ...q,
                options: shuffledIndices.map(i => q.options[i]),
                correct: shuffledIndices.indexOf(q.correct),
                originalCorrectText: q.options[q.correct]
            };
        });

        // Show quiz UI
        document.getElementById('quizModeSelect').classList.add('hidden');
        document.getElementById('quizArea').classList.remove('hidden');
        document.getElementById('quizResults').classList.add('hidden');
        this.renderQuestion();
        this.renderProgress();
    },

    renderQuestion() {
        const qData = this.currentQuestions[this.currentIndex];
        const container = document.getElementById('quizQuestionCard');
        const isLocked = this.locked[this.currentIndex];
        const userAnswer = this.answers[this.currentIndex];

        let optionsHtml = '';
        qData.options.forEach((opt, i) => {
            let cls = 'quiz-option';
            if (isLocked) {
                if (i === qData.correct) cls += ' quiz-option-correct';
                else if (i === userAnswer && i !== qData.correct) cls += ' quiz-option-wrong';
                else cls += ' quiz-option-disabled';
            } else if (userAnswer === i) {
                cls += ' quiz-option-selected';
            }
            const disabled = isLocked ? 'pointer-events: none;' : 'cursor: pointer;';
            optionsHtml += `<button class="${cls}" style="${disabled}" onclick="LearnQuiz.selectAnswer(${i})">
                <span class="quiz-option-letter">${String.fromCharCode(65 + i)}</span>
                <span>${opt}</span>
            </button>`;
        });

        let feedbackHtml = '';
        if (isLocked) {
            const isCorrect = userAnswer === qData.correct;
            if (isCorrect) {
                feedbackHtml = `<div class="quiz-feedback quiz-feedback-correct">
                    <span class="text-lg">✅</span>
                    <div><strong>Korrekt!</strong></div>
                </div>`;
            } else {
                feedbackHtml = `<div class="quiz-feedback quiz-feedback-wrong">
                    <span class="text-lg">❌</span>
                    <div>
                        <strong>Forkert.</strong> Det rigtige svar er: <strong>${qData.originalCorrectText}</strong>
                        <p class="mt-1 text-sm opacity-90">${qData.explanation}</p>
                    </div>
                </div>`;
            }
        }

        container.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">${qData.category}</span>
                <span class="text-sm text-gray-500 dark:text-gray-400">Spørgsmål ${this.currentIndex + 1} / ${this.mode}</span>
            </div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-5">${qData.q}</h3>
            <div class="space-y-2.5">${optionsHtml}</div>
            ${feedbackHtml}
            <div class="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button onclick="LearnQuiz.prev()" class="px-4 py-2 text-sm rounded-lg font-medium transition-colors ${this.currentIndex === 0 ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}" ${this.currentIndex === 0 ? 'disabled' : ''}>
                    ← Forrige
                </button>
                <div class="flex gap-2">
                    ${!isLocked && userAnswer >= 0 ? `<button onclick="LearnQuiz.confirmAnswer()" class="px-5 py-2 text-sm rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors">Bekræft svar</button>` : ''}
                    ${isLocked && this.currentIndex < this.mode - 1 ? `<button onclick="LearnQuiz.next()" class="px-5 py-2 text-sm rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors">Næste →</button>` : ''}
                    ${isLocked && this.currentIndex === this.mode - 1 ? `<button onclick="LearnQuiz.showResults()" class="px-5 py-2 text-sm rounded-lg font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors">Se resultater 🏆</button>` : ''}
                </div>
            </div>
        `;
    },

    renderProgress() {
        const bar = document.getElementById('quizProgressBar');
        const text = document.getElementById('quizProgressText');
        const answered = this.locked.filter(Boolean).length;
        const pct = Math.round((answered / this.mode) * 100);
        bar.style.width = pct + '%';
        text.textContent = `${answered} / ${this.mode} besvaret`;

        // Render dot navigator
        const nav = document.getElementById('quizDotNav');
        let dots = '';
        for (let i = 0; i < this.mode; i++) {
            let dotCls = 'quiz-dot';
            if (i === this.currentIndex) dotCls += ' quiz-dot-active';
            if (this.locked[i]) {
                dotCls += this.answers[i] === this.currentQuestions[i].correct ? ' quiz-dot-correct' : ' quiz-dot-wrong';
            }
            dots += `<button class="${dotCls}" onclick="LearnQuiz.goTo(${i})" title="Spørgsmål ${i+1}">${i+1}</button>`;
        }
        nav.innerHTML = dots;
    },

    selectAnswer(idx) {
        if (this.locked[this.currentIndex]) return;
        this.answers[this.currentIndex] = idx;
        this.renderQuestion();
    },

    confirmAnswer() {
        if (this.answers[this.currentIndex] < 0) return;
        this.locked[this.currentIndex] = true;
        this.renderQuestion();
        this.renderProgress();
    },

    next() {
        if (this.currentIndex < this.mode - 1) {
            this.currentIndex++;
            this.renderQuestion();
            this.renderProgress();
        }
    },

    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.renderQuestion();
            this.renderProgress();
        }
    },

    goTo(idx) {
        this.currentIndex = idx;
        this.renderQuestion();
        this.renderProgress();
    },

    showResults() {
        // Auto-lock any unanswered
        for (let i = 0; i < this.mode; i++) {
            if (!this.locked[i]) this.locked[i] = true;
        }
        this.finished = true;

        const correct = this.currentQuestions.reduce((sum, q, i) => sum + (this.answers[i] === q.correct ? 1 : 0), 0);
        const pct = Math.round((correct / this.mode) * 100);

        let grade = '';
        let gradeColor = '';
        let gradeEmoji = '';
        if (pct >= 92) { grade = '12 (A)'; gradeColor = 'text-green-600 dark:text-green-400'; gradeEmoji = '🏆'; }
        else if (pct >= 82) { grade = '10 (B)'; gradeColor = 'text-green-600 dark:text-green-400'; gradeEmoji = '🌟'; }
        else if (pct >= 70) { grade = '7 (C)'; gradeColor = 'text-blue-600 dark:text-blue-400'; gradeEmoji = '👍'; }
        else if (pct >= 55) { grade = '4 (D)'; gradeColor = 'text-yellow-600 dark:text-yellow-400'; gradeEmoji = '📖'; }
        else if (pct >= 40) { grade = '02 (E)'; gradeColor = 'text-orange-600 dark:text-orange-400'; gradeEmoji = '⚠️'; }
        else if (pct >= 20) { grade = '00 (Fx)'; gradeColor = 'text-red-600 dark:text-red-400'; gradeEmoji = '❌'; }
        else { grade = '-3 (F)'; gradeColor = 'text-red-700 dark:text-red-500'; gradeEmoji = '💀'; }

        document.getElementById('quizArea').classList.add('hidden');
        const results = document.getElementById('quizResults');
        results.classList.remove('hidden');

        // Summary card
        let summaryHtml = `
            <div class="text-center mb-8">
                <div class="text-6xl mb-3">${gradeEmoji}</div>
                <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Quiz Afsluttet!</h2>
                <p class="text-lg text-gray-600 dark:text-gray-400 mb-4">${this.mode === 35 ? 'EUC Lillebælt — Lager & Logistikoperatør Afslutningstest' : this.mode + ' spørgsmåls quiz'}</p>
                <div class="inline-flex items-center gap-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg px-8 py-5 border border-gray-200 dark:border-gray-700">
                    <div class="text-center">
                        <p class="text-4xl font-black ${correct === this.mode ? 'text-green-600' : pct >= 55 ? 'text-blue-600' : 'text-red-600'}">${correct}/${this.mode}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Rigtige svar</p>
                    </div>
                    <div class="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
                    <div class="text-center">
                        <p class="text-4xl font-black ${gradeColor}">${pct}%</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Score</p>
                    </div>
                    <div class="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
                    <div class="text-center">
                        <p class="text-4xl font-black ${gradeColor}">${grade}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Karakter (7-trins)</p>
                    </div>
                </div>
            </div>
        `;

        // Category breakdown
        const catStats = {};
        this.currentQuestions.forEach((q, i) => {
            if (!catStats[q.category]) catStats[q.category] = { total: 0, correct: 0 };
            catStats[q.category].total++;
            if (this.answers[i] === q.correct) catStats[q.category].correct++;
        });
        summaryHtml += `<div class="mb-6">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-3">📊 Resultater per kategori</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">`;
        for (const [cat, stats] of Object.entries(catStats)) {
            const catPct = Math.round((stats.correct / stats.total) * 100);
            const catColor = catPct >= 70 ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700' : catPct >= 50 ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700' : 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700';
            summaryHtml += `<div class="px-3 py-2 rounded-lg border ${catColor}">
                <p class="text-xs font-semibold text-gray-700 dark:text-gray-300">${cat}</p>
                <p class="text-lg font-bold">${stats.correct}/${stats.total} <span class="text-sm font-normal">(${catPct}%)</span></p>
            </div>`;
        }
        summaryHtml += `</div></div>`;

        // Detailed answers
        summaryHtml += `<div class="mb-4"><h3 class="text-lg font-bold text-gray-900 dark:text-white mb-3">📋 Detaljeret gennemgang</h3></div>`;
        summaryHtml += `<div class="space-y-3">`;
        this.currentQuestions.forEach((q, i) => {
            const isCorrect = this.answers[i] === q.correct;
            const borderCls = isCorrect
                ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/10'
                : 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/10';
            const icon = isCorrect ? '✅' : '❌';
            const userPick = this.answers[i] >= 0 ? q.options[this.answers[i]] : '(ingen svar)';
            const correctPick = q.options[q.correct];

            summaryHtml += `<div class="p-4 rounded-xl border-2 ${borderCls}">
                <div class="flex items-start gap-2 mb-2">
                    <span class="text-lg">${icon}</span>
                    <div class="flex-1">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">${q.category}</span>
                            <span class="text-xs text-gray-500 dark:text-gray-400">#${i + 1}</span>
                        </div>
                        <p class="font-semibold text-gray-900 dark:text-white mt-1">${q.q}</p>
                    </div>
                </div>`;

            if (!isCorrect) {
                summaryHtml += `
                    <div class="ml-7 space-y-1 text-sm">
                        <p class="text-red-700 dark:text-red-400"><strong>Dit svar:</strong> ${userPick}</p>
                        <p class="text-green-700 dark:text-green-400"><strong>Rigtigt svar:</strong> ${correctPick}</p>
                        <p class="text-gray-700 dark:text-gray-300 mt-2 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700"><strong>💡 Forklaring:</strong> ${q.explanation}</p>
                    </div>`;
            } else {
                summaryHtml += `<div class="ml-7 text-sm text-green-700 dark:text-green-400"><strong>Korrekt:</strong> ${correctPick}</div>`;
            }
            summaryHtml += `</div>`;
        });
        summaryHtml += `</div>`;

        // Action buttons
        summaryHtml += `
            <div class="flex flex-wrap gap-3 justify-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button onclick="LearnQuiz.start(${this.mode})" class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors">🔄 Prøv igen (${this.mode} spørgsmål)</button>
                <button onclick="LearnQuiz.backToMenu()" class="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold transition-colors">← Vælg anden quiz</button>
            </div>
        `;

        results.innerHTML = summaryHtml;
        results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    backToMenu() {
        document.getElementById('quizModeSelect').classList.remove('hidden');
        document.getElementById('quizArea').classList.add('hidden');
        document.getElementById('quizResults').classList.add('hidden');
    }
};


// ============================================================
// TRUE / FALSE QUESTION BANK
// 60 statements — half true, half false — covering all 10 cats
// ============================================================

const learnTrueFalseBank = [
// --- ABC Analyse ---
{ statement: 'I en ABC-analyse udgør A-varer typisk ca. 20% af varerne og ca. 80% af værdien.', answer: true, explanation: 'Korrekt — dette er Pareto-princippet (80/20-reglen) som ABC-analyse er baseret på.' },
{ statement: 'C-varer bør altid kasseres fra lageret, da de har lav værdi.', answer: false, explanation: 'Forkert — C-varer har lav værdi men kan stadig være nødvendige. De styres blot med enklere metoder og mindre overvågning.' },
{ statement: 'ABC-analyse kan kun anvendes på fysiske lagervarer.', answer: false, explanation: 'Forkert — ABC-analyse kan bruges på alt med værdifordeling: kunder, leverandører, projekter, services, osv.' },
{ statement: 'A-varer kræver tættere lagerstyring og hyppigere optælling end C-varer.', answer: true, explanation: 'Korrekt — A-varer er højværdi og bør overvåges tæt, fx med cyklisk optælling.' },
{ statement: 'I en standard ABC-analyse kan en vare kun tilhøre én kategori ad gangen.', answer: true, explanation: 'Korrekt — hver vare klassificeres som enten A, B eller C baseret på dens kumulative andel af totalværdien.' },
{ statement: 'Pareto-princippet siger at 50% af varerne står for 50% af værdien.', answer: false, explanation: 'Forkert — Pareto-princippet (80/20-reglen) siger at ca. 20% af varerne typisk udgør ca. 80% af værdien.' },

// --- ABC Dobbelt ---
{ statement: 'ABC Dobbelt Analyse kombinerer værdi og forbrugsmængde i en 3×3 matrix.', answer: true, explanation: 'Korrekt — man får 9 kategorier (AA, AB, AC, BA, BB, BC, CA, CB, CC) ved at krydse værdi-ABC med forbrugs-ABC.' },
{ statement: 'En AA-vare i ABC Dobbelt har høj værdi OG højt forbrug og kræver mindst opmærksomhed.', answer: false, explanation: 'Forkert — AA-varer kræver MEST opmærksomhed, da de er kritiske på begge dimensioner.' },
{ statement: 'En AC-vare og en CA-vare bør styres på præcis samme måde.', answer: false, explanation: 'Forkert — AC (høj værdi, lavt forbrug) styres anderledes end CA (lav værdi, højt forbrug). AC kræver sikring mod dyr kapitalbinding, CA kræver effektiv forsyning.' },
{ statement: 'ABC Dobbelt giver en mere nuanceret klassificering end standard ABC-analyse.', answer: true, explanation: 'Korrekt — ved at tilføje en ekstra dimension (forbrug) opnår man mere præcis styring af varer.' },

// --- Wilson EOQ ---
{ statement: 'Wilson\'s EOQ-formel finder den ordrestørrelse der minimerer de samlede lageromkostninger.', answer: true, explanation: 'Korrekt — EOQ = √(2DS/H) minimerer summen af ordreomkostninger og lageromkostninger.' },
{ statement: 'Hvis ordreomkostningen S stiger, vil den optimale ordrestørrelse (EOQ) falde.', answer: false, explanation: 'Forkert — S er i tælleren under kvadratroden. Højere S → større EOQ → man bestiller mere per gang for at reducere antallet af ordrer.' },
{ statement: 'EOQ-formlen antager at efterspørgslen er konstant og kendt.', answer: true, explanation: 'Korrekt — det er en af grundforudsætningerne for Wilson\'s formel.' },
{ statement: 'H i Wilson\'s formel er ordreomkostningen per ordre.', answer: false, explanation: 'Forkert — H er lageromkostningen per enhed per år (typisk pris × rente). S er ordreomkostningen.' },
{ statement: 'Ved EOQ er de årlige ordreomkostninger lig med de årlige lageromkostninger.', answer: true, explanation: 'Korrekt — dette er en matematisk egenskab ved EOQ: de to omkostningskomponenter er præcis lige store ved den optimale ordrestørrelse.' },
{ statement: 'EOQ tager højde for kapacitetsbegrænsninger på lageret.', answer: false, explanation: 'Forkert — basis-EOQ antager ubegrænset lagerkapacitet. Man bør justere resultatet manuelt for fysiske begrænsninger.' },

// --- Lagerstyring ---
{ statement: 'Genbestillingspunktet (ROP) beregnes som dagligt forbrug gange leveringstid plus sikkerhedslager.', answer: true, explanation: 'Korrekt — ROP = (d × L) + SS. Sikkerhedslager beskytter mod udsving i efterspørgsel og leveringstid.' },
{ statement: 'Et højere serviceniveau fører til et lavere sikkerhedslager.', answer: false, explanation: 'Forkert — højere serviceniveau (fx 99% vs 95%) kræver MERE sikkerhedslager for at undgå stockouts.' },
{ statement: 'I en periodisk gennemgangsmodel bestilles der ved faste tidsintervaller.', answer: true, explanation: 'Korrekt — fx hver 14. dag gennemgås lagersituationen og der bestilles op til et fastsat målniveau.' },
{ statement: 'Min/Max modellen bestiller altid den samme mængde ved genbestilling.', answer: false, explanation: 'Forkert i den periodiske variant — ordremængden er Maks minus nuværende beholdning, så den varierer. I den faste variant er ordremængden dog konstant.' },
{ statement: 'Lageromsætningshastighed beregnes som årligt forbrug divideret med gennemsnitligt lager.', answer: true, explanation: 'Korrekt — lageromsætning viser hvor mange gange lageret omsættes per år. Høj omsætning = effektiv lagerstyring.' },
{ statement: 'Sikkerhedslager er kun nødvendigt for A-varer.', answer: false, explanation: 'Forkert — alle varekategorier kan have sikkerhedslager, men størrelsen og niveauet varierer. A-varer har typisk mest nøjagtigt beregnet sikkerhedslager.' },

// --- LEAN ---
{ statement: '5S står for: Sortér, Systematisér, Skinnende rent, Standardisér, Selvdisciplin.', answer: true, explanation: 'Korrekt — de 5 S\'er (Seiri, Seiton, Seiso, Seiketsu, Shitsuke) er fundamentet i LEAN arbejdsplads-organisering.' },
{ statement: 'Muda betyder "værdi" på japansk.', answer: false, explanation: 'Forkert — Muda betyder spild. De 7 spildformer er: overproduktion, ventetid, transport, overbearbejdning, lager, bevægelse og fejl/defekter.' },
{ statement: 'Kanban er et pull-baseret system der styrer produktionen baseret på reelt behov.', answer: true, explanation: 'Korrekt — Kanban er et pull-system: først når en vare forbruges, signaleres genopfyldning. Modsat push-systemer der producerer baseret på prognoser (forecasts).' },
{ statement: 'OEE (Overall Equipment Effectiveness) beregnes som Tilgængelighed × Ydelse × Kvalitet.', answer: true, explanation: 'Korrekt — OEE = A × P × Q. Verdensklasse er typisk 85%+.' },
{ statement: 'Kaizen handler om store, sjældne forandringsprocesser.', answer: false, explanation: 'Forkert — Kaizen betyder "kontinuerlig forbedring" med mange små, daglige forbedringer over tid. Det er det modsatte af store engangstransformationer.' },
{ statement: 'Just-in-Time (JIT) betyder at man har store sikkerhedslagre for at undgå leveringsproblemer.', answer: false, explanation: 'Forkert — JIT handler om at modtage varer præcis når de skal bruges, med minimalt lager. Store sikkerhedslagre modarbejder JIT-princippet.' },
{ statement: 'En Gemba-walk bruges af ledere til at observere arbejdsprocesser direkte på gulvet.', answer: true, explanation: 'Korrekt — Gemba = "det virkelige sted". Ledere går ud på gulvet for at se processer, tale med medarbejdere og identificere forbedringer.' },
{ statement: 'Poka-Yoke er en japansk teknik til fejlsikring af processer.', answer: true, explanation: 'Korrekt — Poka-Yoke designer processer/produkter så fejl enten forhindres (prevention) eller opdages straks (detection).' },

// --- Supply Chain ---
{ statement: 'TCO (Total Cost of Ownership) inkluderer kun indkøbsprisen for en vare.', answer: false, explanation: 'Forkert — TCO inkluderer alle omkostninger over varens levetid: indkøb, transport, lager, vedligehold, kassation osv.' },
{ statement: 'Bullwhip-effekten beskriver hvordan små udsving i efterspørgsel forstærkes op gennem forsyningskæden.', answer: true, explanation: 'Korrekt — en lille ændring hos slutkunden kan skabe store svingninger i ordrer længere oppe i kæden.' },
{ statement: 'Cross-docking eliminerer lageropbevaring ved at omlade varer direkte fra indgående til udgående transport.', answer: true, explanation: 'Korrekt — varer ankommer og sorteres direkte til udgående forsendelser uden at blive lagt på lager.' },
{ statement: 'I en forsyningskæde er det altid billigst at have ét centralt lager.', answer: false, explanation: 'Forkert — det optimale antal lagre afhænger af transportomkostninger, leveringstider, og kundeservice-krav. Flere lagre kan reducere leveringstider men øger lageromkostninger.' },
{ statement: 'Sidste kilometer-levering (last mile) er typisk den billigste del af fragtprocessen.', answer: false, explanation: 'Forkert — Sidste kilometer-leveringen er typisk den dyreste del (op til 50% af total fragt) pga. mange små leveringer til individuelle adresser.' },
{ statement: 'En 3PL-udbyder er en tredjepart som håndterer logistikoperationer for en virksomhed.', answer: true, explanation: 'Korrekt — Third Party Logistics (3PL) udbydere varetager fx lager, plukning, pakning og transport for andre virksomheder.' },

// --- Warehouse ---
{ statement: 'FIFO-princippet betyder at de ældste varer udleveres først.', answer: true, explanation: 'Korrekt — First In, First Out sikrer at ældre varer bruges/sendes først, hvilket er vigtigt for fødevarer og varer med udløbsdato.' },
{ statement: 'I en stemmestyret plukløsning (voice picking) aflæser plukkeren stregkoder fra en liste.', answer: false, explanation: 'Forkert — Stemmestyret plukning (voice picking) bruger headset med stemmekommandoer. Plukkeren hører instruktioner og bekræfter mundtligt, hvilket giver frie hænder.' },
{ statement: 'Lysstyret plukning (pick-to-light) guider plukkeren med lysdioder der viser hvilken lokation der skal plukkes fra.', answer: true, explanation: 'Korrekt — lysdioder tændes ved den relevante lokation og viser antal der skal plukkes.' },
{ statement: 'Zone-plukning betyder at hele ordren plukkes af én person der går gennem alle zoner.', answer: false, explanation: 'Forkert — ved zone-plukning er lageret opdelt i zoner, og hver plukker arbejder kun i sin zone. Ordrerne samles derefter.' },
{ statement: 'Et WMS (Warehouse Management System) styrer og optimerer lageroperationer digitalt.', answer: true, explanation: 'Korrekt — WMS håndterer modtagelse, læggepladser, plukning, pakning, forsendelse og lageroptælling.' },
{ statement: 'Batch-plukning samler flere ordrer i én plukrunde for at spare gangtid.', answer: true, explanation: 'Korrekt — flere ordrer plukkes samtidig, sorteres bagefter. Effektivt ved mange små ordrer.' },

// --- Sikkerhed & ADR ---
{ statement: 'ADR omhandler international transport af farligt gods ad vej.', answer: true, explanation: 'Korrekt — ADR (Accord européen relatif au transport international des marchandises Dangereuses par Route) regulerer vejtransport af farligt gods i Europa.' },
{ statement: 'Ergonomisk løfteteknik anbefaler at man løfter med bøjet ryg og strakte ben.', answer: false, explanation: 'Forkert — korrekt løfteteknik er: bøjede knæ, ret ryg, tæt ved kroppen. Aldrig løft med bøjet ryg!' },
{ statement: 'Man skal altid bære sikkerhedssko i et lagerområde.', answer: true, explanation: 'Korrekt — sikkerhedssko med stålnæse er et minimumskrav i de fleste lageroperationer for at beskytte mod faldende genstande.' },
{ statement: 'Orange ADR-faresedler med bombesymbol angiver brandfarlige væsker.', answer: false, explanation: 'Forkert — bombesymbolet angiver eksplosive stoffer (klasse 1). Brandfarlige væsker har flammesymbolet (klasse 3).' },
{ statement: 'SDS (Safety Data Sheet) indeholder oplysninger om kemikaliers farlighed og håndtering.', answer: true, explanation: 'Korrekt — sikkerhedsdatablade er lovpligtige for farlige kemikalier og angiver bl.a. fareklasse, førstehjælp, opbevaringskrav og bortskaffelse.' },
{ statement: 'En truck kan køres uden certifikat, hvis man har almindeligt kørekort.', answer: false, explanation: 'Forkert — gaffeltruckkørsel kræver et specielt truckcertifikat/kørekort og relevant oplæring.' },

// --- Budget & Økonomi ---
{ statement: 'Variable omkostninger ændrer sig med produktionsmængden.', answer: true, explanation: 'Korrekt — variable omkostninger (fx råmaterialer, fragt per enhed) stiger og falder med aktivitetsniveauet.' },
{ statement: 'Dækningsbidrag beregnes som salgspris minus faste omkostninger.', answer: false, explanation: 'Forkert — dækningsbidrag = salgspris minus variable omkostninger. Det hedder dækningsbidrag fordi det skal "dække" de faste omkostninger.' },
{ statement: 'Break-even er det punkt hvor omsætningen præcis dækker alle omkostninger.', answer: true, explanation: 'Korrekt — ved break-even er profit = 0. Virksomheden tjener hverken penge eller taber.' },
{ statement: 'Lageromkostninger er typisk 15-30% af varens værdi per år.', answer: true, explanation: 'Korrekt — det inkluderer kapitalomkostning, forsikring, svind, forældelse, lagerplads og håndtering.' },

// --- Stregkoder / QR / Generelt ---
{ statement: 'EAN-13 er den standardstregkode der bruges på de fleste dagligvarer i Europa.', answer: true, explanation: 'Korrekt — EAN-13 (European Article Number) er den 13-cifrede stregkode man ser på stort set alle detailvarer.' },
{ statement: 'En QR-kode kan kun indeholde tal.', answer: false, explanation: 'Forkert — QR-koder kan indeholde tekst, URL\'er, kontaktinfo, WiFi-indstillinger, binære data og meget mere.' },
{ statement: 'RFID-tags kræver direkte synslinje for at kunne aflæses.', answer: false, explanation: 'Forkert — RFID kan aflæses uden synslinje, gennem emballage, kasser m.m. Det er en af de store fordele i forhold til stregkoder.' },
{ statement: 'CODE-128 kan indeholde alle 128 ASCII-tegn inklusiv tal og bogstaver.', answer: true, explanation: 'Korrekt — CODE-128 er en alsidig stregkode der understøtter hele ASCII-tegnsættet.' },
{ statement: 'KPI står for Key Performance Indicator og bruges til at måle virksomhedens præstation.', answer: true, explanation: 'Korrekt — KPIer er nøgletal der viser, hvor godt en proces eller virksomhed performer i forhold til fastsatte mål.' },
{ statement: 'IoT i logistik bruges kun til temperaturstyring af kølevarer.', answer: false, explanation: 'Forkert — IoT bruges også til GPS-tracking, lagerniveauovervågning, maskinsensorer, predictive maintenance og meget mere.' },
];


// ============================================================
// FLASHCARD ENGINE
// ============================================================

const LearnFlashcards = {
    cards: [],
    currentIndex: 0,
    flipped: false,
    known: [],
    mode: 'all',

    shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    },

    start(category) {
        this.mode = category || 'all';
        let pool = learnQuizBank;
        if (category && category !== 'all') {
            pool = learnQuizBank.filter(q => q.category === category);
        }
        this.cards = this.shuffle(pool);
        this.currentIndex = 0;
        this.flipped = false;
        this.known = new Array(this.cards.length).fill(null); // null=unseen, true=knew it, false=didn't

        document.getElementById('flashcardModeSelect').classList.add('hidden');
        document.getElementById('flashcardArea').classList.remove('hidden');
        document.getElementById('flashcardResults').classList.add('hidden');
        this.render();
    },

    render() {
        const card = this.cards[this.currentIndex];
        const total = this.cards.length;
        const progress = Math.round(((this.currentIndex) / total) * 100);
        const seen = this.known.filter(k => k !== null).length;
        const knewCount = this.known.filter(k => k === true).length;

        const container = document.getElementById('flashcardArea');
        container.innerHTML = `
            <div class="mb-4">
                <div class="flex items-center justify-between mb-1.5">
                    <span class="text-sm font-medium text-gray-600 dark:text-gray-400">${this.currentIndex + 1} / ${total} kort · <span class="text-green-600">${knewCount} vidste</span> · <span class="text-red-500">${seen - knewCount} lær</span></span>
                    <button onclick="LearnFlashcards.backToMenu()" class="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium">✕ Stop</button>
                </div>
                <div class="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300" style="width: ${progress}%"></div>
                </div>
            </div>

            <div class="flashcard-container mb-5" onclick="LearnFlashcards.flip()">
                <div class="flashcard ${this.flipped ? 'flashcard-flipped' : ''}">
                    <div class="flashcard-front">
                        <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 mb-3 inline-block">${card.category}</span>
                        <p class="text-lg font-semibold text-gray-900 dark:text-white leading-relaxed">${card.q}</p>
                        <p class="text-xs text-gray-400 dark:text-gray-500 mt-4">Klik for at vende kortet</p>
                    </div>
                    <div class="flashcard-back">
                        <p class="text-sm font-bold text-green-700 dark:text-green-400 mb-2">Svar:</p>
                        <p class="text-lg font-semibold text-gray-900 dark:text-white mb-3">${card.options[card.correct]}</p>
                        <div class="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                            <strong>💡</strong> ${card.explanation}
                        </div>
                    </div>
                </div>
            </div>

            ${this.flipped ? `
                <div class="flex justify-center gap-4 mb-4">
                    <button onclick="LearnFlashcards.markAndNext(false)" class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-2 border-red-300 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">❌ Vidste det ikke</button>
                    <button onclick="LearnFlashcards.markAndNext(true)" class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">✅ Vidste det</button>
                </div>
            ` : `
                <div class="flex justify-center gap-3">
                    ${this.currentIndex > 0 ? `<button onclick="LearnFlashcards.prev()" class="px-4 py-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">← Forrige</button>` : ''}
                    <button onclick="LearnFlashcards.flip()" class="px-5 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-semibold">Vis svar</button>
                </div>
            `}
        `;
    },

    flip() {
        this.flipped = !this.flipped;
        this.render();
    },

    markAndNext(knewIt) {
        this.known[this.currentIndex] = knewIt;
        if (this.currentIndex < this.cards.length - 1) {
            this.currentIndex++;
            this.flipped = false;
            this.render();
        } else {
            this.showResults();
        }
    },

    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.flipped = false;
            this.render();
        }
    },

    showResults() {
        const total = this.cards.length;
        const knewCount = this.known.filter(k => k === true).length;
        const missedCount = this.known.filter(k => k === false).length;
        const unseenCount = this.known.filter(k => k === null).length;
        const pct = Math.round((knewCount / total) * 100);

        document.getElementById('flashcardArea').classList.add('hidden');
        const results = document.getElementById('flashcardResults');
        results.classList.remove('hidden');

        let emoji = pct >= 90 ? '🏆' : pct >= 70 ? '🌟' : pct >= 50 ? '👍' : '📖';

        let html = `
            <div class="text-center mb-6">
                <div class="text-5xl mb-3">${emoji}</div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Flashcards færdig!</h2>
                <div class="inline-flex items-center gap-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg px-8 py-5 border border-gray-200 dark:border-gray-700">
                    <div class="text-center">
                        <p class="text-3xl font-black text-green-600">${knewCount}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Vidste det</p>
                    </div>
                    <div class="h-10 w-px bg-gray-300 dark:bg-gray-600"></div>
                    <div class="text-center">
                        <p class="text-3xl font-black text-red-500">${missedCount}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Skal øves</p>
                    </div>
                    <div class="h-10 w-px bg-gray-300 dark:bg-gray-600"></div>
                    <div class="text-center">
                        <p class="text-3xl font-black text-blue-600">${pct}%</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Korrekt</p>
                    </div>
                </div>
            </div>
        `;

        // Missed cards list
        const missed = this.cards.filter((_, i) => this.known[i] === false);
        if (missed.length > 0) {
            html += `<div class="mb-4"><h3 class="text-lg font-bold text-gray-900 dark:text-white mb-3">📖 Kort du bør gennemgå:</h3><div class="space-y-2">`;
            missed.forEach(card => {
                html += `<div class="p-3 rounded-xl border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
                    <p class="text-sm font-semibold text-gray-900 dark:text-white">${card.q}</p>
                    <p class="text-sm text-green-700 dark:text-green-400 mt-1"><strong>Svar:</strong> ${card.options[card.correct]}</p>
                </div>`;
            });
            html += `</div></div>`;
        }

        html += `
            <div class="flex flex-wrap gap-3 justify-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                ${missed.length > 0 ? `<button onclick="LearnFlashcards.retryMissed()" class="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-colors">🔄 Øv forkerte igen (${missed.length})</button>` : ''}
                <button onclick="LearnFlashcards.start('${this.mode}')" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors">🔄 Start forfra</button>
                <button onclick="LearnFlashcards.backToMenu()" class="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold transition-colors">← Tilbage</button>
            </div>
        `;
        results.innerHTML = html;
    },

    retryMissed() {
        const missed = this.cards.filter((_, i) => this.known[i] === false);
        this.cards = this.shuffle(missed);
        this.currentIndex = 0;
        this.flipped = false;
        this.known = new Array(this.cards.length).fill(null);
        document.getElementById('flashcardResults').classList.add('hidden');
        document.getElementById('flashcardArea').classList.remove('hidden');
        this.render();
    },

    backToMenu() {
        document.getElementById('flashcardModeSelect').classList.remove('hidden');
        document.getElementById('flashcardArea').classList.add('hidden');
        document.getElementById('flashcardResults').classList.add('hidden');
    }
};


// ============================================================
// TRUE / FALSE ENGINE
// ============================================================

const LearnTrueFalse = {
    questions: [],
    currentIndex: 0,
    answers: [],
    locked: [],
    timerStart: null,
    timerId: null,

    shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    },

    start(n) {
        this.questions = this.shuffle(learnTrueFalseBank).slice(0, n || 20);
        this.currentIndex = 0;
        this.answers = new Array(this.questions.length).fill(null);
        this.locked = new Array(this.questions.length).fill(false);
        this.timerStart = Date.now();

        document.getElementById('tfModeSelect').classList.add('hidden');
        document.getElementById('tfArea').classList.remove('hidden');
        document.getElementById('tfResults').classList.add('hidden');

        if (this.timerId) clearInterval(this.timerId);
        this.timerId = setInterval(() => this.updateTimer(), 1000);
        this.render();
    },

    updateTimer() {
        const el = document.getElementById('tfTimer');
        if (!el) return;
        const elapsed = Math.floor((Date.now() - this.timerStart) / 1000);
        const min = Math.floor(elapsed / 60);
        const sec = elapsed % 60;
        el.textContent = `${min}:${sec.toString().padStart(2, '0')}`;
    },

    render() {
        const q = this.questions[this.currentIndex];
        const total = this.questions.length;
        const answered = this.locked.filter(l => l).length;
        const progress = Math.round((answered / total) * 100);
        const isLocked = this.locked[this.currentIndex];
        const userAnswer = this.answers[this.currentIndex];

        const container = document.getElementById('tfArea');

        let feedbackHtml = '';
        if (isLocked) {
            const isCorrect = userAnswer === q.answer;
            feedbackHtml = `
                <div class="quiz-feedback ${isCorrect ? 'quiz-feedback-correct' : 'quiz-feedback-wrong'}">
                    <span class="text-lg">${isCorrect ? '✅' : '❌'}</span>
                    <div>
                        <p class="font-semibold mb-1">${isCorrect ? 'Korrekt!' : 'Forkert!'} Svaret er <strong>${q.answer ? 'SANDT' : 'FALSK'}</strong></p>
                        <p class="text-sm">${q.explanation}</p>
                    </div>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="mb-4">
                <div class="flex items-center justify-between mb-1.5">
                    <span class="text-sm font-medium text-gray-600 dark:text-gray-400">${this.currentIndex + 1} / ${total} · ${answered} besvaret</span>
                    <div class="flex items-center gap-3">
                        <span class="text-sm font-mono text-gray-500 dark:text-gray-400">⏱ <span id="tfTimer">0:00</span></span>
                        <button onclick="LearnTrueFalse.backToMenu()" class="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium">✕ Stop</button>
                    </div>
                </div>
                <div class="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-300" style="width: ${progress}%"></div>
                </div>
            </div>

            <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-4">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">Udsagn #${this.currentIndex + 1}</p>
                <p class="text-lg font-semibold text-gray-900 dark:text-white leading-relaxed mb-5">${q.statement}</p>

                <div class="flex gap-4 justify-center">
                    <button onclick="LearnTrueFalse.answer(true)" ${isLocked ? 'disabled' : ''} class="tf-btn ${userAnswer === true ? (q.answer === true ? 'tf-btn-correct' : 'tf-btn-wrong') : (isLocked && q.answer === true ? 'tf-btn-correct' : '')} ${isLocked ? 'opacity-80 cursor-default' : 'hover:scale-105'}">
                        <span class="text-2xl">✅</span>
                        <span class="font-bold text-lg">SANDT</span>
                    </button>
                    <button onclick="LearnTrueFalse.answer(false)" ${isLocked ? 'disabled' : ''} class="tf-btn ${userAnswer === false ? (q.answer === false ? 'tf-btn-correct' : 'tf-btn-wrong') : (isLocked && q.answer === false ? 'tf-btn-correct' : '')} ${isLocked ? 'opacity-80 cursor-default' : 'hover:scale-105'}">
                        <span class="text-2xl">❌</span>
                        <span class="font-bold text-lg">FALSK</span>
                    </button>
                </div>

                ${feedbackHtml}
            </div>

            <div class="flex justify-between">
                <button onclick="LearnTrueFalse.nav(-1)" ${this.currentIndex === 0 ? 'disabled class="invisible"' : 'class="px-4 py-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"'}>← Forrige</button>
                ${isLocked && this.currentIndex < total - 1 ? '<button onclick="LearnTrueFalse.nav(1)" class="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold">Næste →</button>' : ''}
                ${isLocked && this.currentIndex === total - 1 ? '<button onclick="LearnTrueFalse.showResults()" class="px-5 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-semibold">Se resultater 🏆</button>' : ''}
            </div>
        `;
    },

    answer(val) {
        if (this.locked[this.currentIndex]) return;
        this.answers[this.currentIndex] = val;
        this.locked[this.currentIndex] = true;
        this.render();

        // Auto-advance after 1.5s if correct
        const q = this.questions[this.currentIndex];
        if (val === q.answer && this.currentIndex < this.questions.length - 1) {
            setTimeout(() => {
                if (this.locked[this.currentIndex] && this.currentIndex < this.questions.length - 1) {
                    this.nav(1);
                }
            }, 1500);
        }
    },

    nav(dir) {
        this.currentIndex = Math.max(0, Math.min(this.questions.length - 1, this.currentIndex + dir));
        this.render();
    },

    showResults() {
        if (this.timerId) { clearInterval(this.timerId); this.timerId = null; }
        const elapsed = Math.floor((Date.now() - this.timerStart) / 1000);
        const min = Math.floor(elapsed / 60);
        const sec = elapsed % 60;
        const total = this.questions.length;
        const correct = this.questions.reduce((s, q, i) => s + (this.answers[i] === q.answer ? 1 : 0), 0);
        const pct = Math.round((correct / total) * 100);

        let grade, gradeColor, gradeEmoji;
        if (pct >= 92) { grade = '12 (A)'; gradeColor = 'text-green-600 dark:text-green-400'; gradeEmoji = '🏆'; }
        else if (pct >= 82) { grade = '10 (B)'; gradeColor = 'text-green-600 dark:text-green-400'; gradeEmoji = '🌟'; }
        else if (pct >= 70) { grade = '7 (C)'; gradeColor = 'text-blue-600 dark:text-blue-400'; gradeEmoji = '👍'; }
        else if (pct >= 55) { grade = '4 (D)'; gradeColor = 'text-yellow-600 dark:text-yellow-400'; gradeEmoji = '📖'; }
        else if (pct >= 40) { grade = '02 (E)'; gradeColor = 'text-orange-600 dark:text-orange-400'; gradeEmoji = '⚠️'; }
        else if (pct >= 20) { grade = '00 (Fx)'; gradeColor = 'text-red-600 dark:text-red-400'; gradeEmoji = '❌'; }
        else { grade = '-3 (F)'; gradeColor = 'text-red-700 dark:text-red-500'; gradeEmoji = '💀'; }

        document.getElementById('tfArea').classList.add('hidden');
        const results = document.getElementById('tfResults');
        results.classList.remove('hidden');

        let html = `
            <div class="text-center mb-6">
                <div class="text-5xl mb-3">${gradeEmoji}</div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sandt/Falsk Færdig!</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Tid: ${min}:${sec.toString().padStart(2, '0')}</p>
                <div class="inline-flex items-center gap-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg px-8 py-5 border border-gray-200 dark:border-gray-700">
                    <div class="text-center">
                        <p class="text-3xl font-black ${correct === total ? 'text-green-600' : pct >= 55 ? 'text-blue-600' : 'text-red-600'}">${correct}/${total}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Rigtige</p>
                    </div>
                    <div class="h-10 w-px bg-gray-300 dark:bg-gray-600"></div>
                    <div class="text-center">
                        <p class="text-3xl font-black ${gradeColor}">${pct}%</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Score</p>
                    </div>
                    <div class="h-10 w-px bg-gray-300 dark:bg-gray-600"></div>
                    <div class="text-center">
                        <p class="text-3xl font-black ${gradeColor}">${grade}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Karakter</p>
                    </div>
                </div>
            </div>
        `;

        // Detailed review
        html += `<div class="mb-4"><h3 class="text-lg font-bold text-gray-900 dark:text-white mb-3">📋 Gennemgang</h3></div><div class="space-y-2">`;
        this.questions.forEach((q, i) => {
            const isCorrect = this.answers[i] === q.answer;
            const borderCls = isCorrect
                ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/10'
                : 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/10';
            const icon = isCorrect ? '✅' : '❌';
            html += `<div class="p-3 rounded-xl border-2 ${borderCls}">
                <div class="flex items-start gap-2">
                    <span>${icon}</span>
                    <div class="flex-1">
                        <p class="text-sm font-semibold text-gray-900 dark:text-white">${q.statement}</p>
                        <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Svar: <strong>${q.answer ? 'SANDT' : 'FALSK'}</strong></p>
                        ${!isCorrect ? `<p class="text-xs text-gray-600 dark:text-gray-300 mt-1 bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700"><strong>💡</strong> ${q.explanation}</p>` : ''}
                    </div>
                </div>
            </div>`;
        });
        html += `</div>`;

        html += `
            <div class="flex flex-wrap gap-3 justify-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button onclick="LearnTrueFalse.start(${total})" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors">🔄 Prøv igen (${total})</button>
                <button onclick="LearnTrueFalse.backToMenu()" class="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold transition-colors">← Tilbage</button>
            </div>
        `;
        results.innerHTML = html;
        results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    backToMenu() {
        if (this.timerId) { clearInterval(this.timerId); this.timerId = null; }
        document.getElementById('tfModeSelect').classList.remove('hidden');
        document.getElementById('tfArea').classList.add('hidden');
        document.getElementById('tfResults').classList.add('hidden');
    }
};


// ============================================================
// CATEGORY QUIZ ENGINE (uses existing quiz bank with category filter)
// ============================================================

const LearnCategoryQuiz = {
    start(category) {
        // Filter questions by category, then use the main quiz engine
        const pool = learnQuizBank.filter(q => q.category === category);
        if (pool.length === 0) return;

        // Temporarily replace the quiz bank, run the quiz, then restore
        const originalBank = [...learnQuizBank];
        const n = Math.min(pool.length, pool.length); // use all from category

        LearnQuiz.mode = n;
        LearnQuiz.finished = false;
        LearnQuiz.currentIndex = 0;
        LearnQuiz.answers = new Array(n).fill(-1);
        LearnQuiz.locked = new Array(n).fill(false);

        const shuffled = LearnQuiz.shuffle(pool);
        LearnQuiz.currentQuestions = shuffled.slice(0, n).map(q => {
            const indices = q.options.map((_, i) => i);
            const shuffledIndices = LearnQuiz.shuffle(indices);
            return {
                ...q,
                options: shuffledIndices.map(i => q.options[i]),
                correct: shuffledIndices.indexOf(q.correct),
                originalCorrectText: q.options[q.correct]
            };
        });

        // Switch to quiz sub-tab so quizArea is visible
        switchLearnMode('quiz');
        document.getElementById('catQuizSelect').classList.add('hidden');
        document.getElementById('quizModeSelect').classList.add('hidden');
        document.getElementById('quizArea').classList.remove('hidden');
        document.getElementById('quizResults').classList.add('hidden');

        // Override backToMenu to return to category selection
        LearnQuiz._originalBackToMenu = LearnQuiz.backToMenu;
        LearnQuiz.backToMenu = function() {
            switchLearnMode('category');
            document.getElementById('catQuizSelect').classList.remove('hidden');
            document.getElementById('quizArea').classList.add('hidden');
            document.getElementById('quizResults').classList.add('hidden');
            document.getElementById('quizModeSelect').classList.remove('hidden');
            LearnQuiz.backToMenu = LearnQuiz._originalBackToMenu;
        };

        LearnQuiz.renderQuestion();
        LearnQuiz.renderProgress();
    }
};

// Helper: get unique categories and their counts
function getQuizCategories() {
    const cats = {};
    learnQuizBank.forEach(q => {
        if (!cats[q.category]) cats[q.category] = 0;
        cats[q.category]++;
    });
    return cats;
}

/* ============================================================
   LEARN MODE TAB SWITCHING
   ============================================================ */
function switchLearnMode(mode) {
    const modes = ['guided', 'quiz', 'tf', 'flashcards', 'category'];
    modes.forEach(m => {
        const panel = document.getElementById('learnMode-' + m);
        const tab = document.getElementById('learnTab-' + m);
        if (!panel || !tab) return;
        if (m === mode) {
            panel.classList.remove('hidden');
            tab.classList.add('learn-mode-tab-active');
            tab.classList.remove('border-transparent', 'text-gray-500', 'dark:text-gray-400');
        } else {
            panel.classList.add('hidden');
            tab.classList.remove('learn-mode-tab-active');
            tab.classList.add('border-transparent', 'text-gray-500', 'dark:text-gray-400');
        }
    });
}
