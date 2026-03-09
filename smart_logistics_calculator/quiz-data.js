// ============================================================
// LAGER & LOGISTIK QUIZ — Smart Logistics Calculator
// 220 multiple choice spørgsmål til TUR-eksamensforberedelse
// Emner: lagerstyring, lean, supply chain, ERP, WMS,
// leveringsbetingelser, transport, sikkerhed, virksomhed m.m.
// ============================================================

const learnQuizBank = [

// ============================
// LAGERSTYRING & LAGERINDRETNING
// ============================
{
    id: 1,
    category: 'Lagerstyring',
    q: 'Hvad står FIFO for i lagersammenhæng?',
    options: [
        'First In, First Out — de ældste varer sendes ud først',
        'Fast Inventory for Operations',
        'Final Inspection and Forwarding Order',
        'Freight In, Freight Out'
    ],
    correct: 0,
    explanation: 'FIFO betyder First In, First Out. De varer der kom ind på lageret først, sendes også ud først. Det er især vigtigt for fødevarer og varer med udløbsdato, så intet bliver for gammelt.'
},
{
    id: 2,
    category: 'Lagerstyring',
    q: 'Hvad er hovedformålet med et sikkerhedslager?',
    options: [
        'At opbevare faremærkede varer adskilt fra resten',
        'At have et reservelager i en anden bygning',
        'At beskytte mod uforudsete udsving i efterspørgsel eller leveringstid',
        'At sikre lageret mod indbrud og tyveri'
    ],
    correct: 2,
    explanation: 'Sikkerhedslageret er en buffer. Hvis leverandøren pludselig er forsinket, eller der kommer en uventet stor ordre, har man stadig varer at levere fra. Uden sikkerhedslager risikerer man tomme hylder og utilfredse kunder.'
},
{
    id: 3,
    category: 'Lagerstyring',
    q: 'En virksomhed bruger varer for 1.500.000 kr. om året. Gennemsnitligt lager er 150.000 kr. Hvad er lageromsætningshastigheden?',
    options: [
        '100',
        '10',
        '15',
        '1,5'
    ],
    correct: 1,
    explanation: 'Lageromsætningshastighed = årligt vareforbrug / gennemsnitslager = 1.500.000 / 150.000 = 10. Det vil sige, lageret omsættes 10 gange om året. Jo højere tal, jo mere effektiv lagerstyring.'
},
{
    id: 4,
    category: 'Lagerstyring',
    q: 'Hvad er genbestillingspunktet (ROP)?',
    options: [
        'Det tidspunkt hvor lageret lukker for dagen',
        'Prisen hvor det kan betale sig at købe større mængder',
        'Den hastighed man plukker varer med',
        'Det lagerniveau hvor en ny bestilling skal afgives'
    ],
    correct: 3,
    explanation: 'Genbestillingspunktet er det antal varer på lager, hvor man siger: nu skal vi bestille hjem. Det beregnes som dagsforbrug × leveringstid + sikkerhedslager. Bestiller man for sent risikerer man at løbe tør.'
},
{
    id: 5,
    category: 'Lagerstyring',
    q: 'Hvad kendetegner et flydende lagerplads-system?',
    options: [
        'Alle varer har en fast, reserveret plads de altid står på',
        'Varer placeres på den første ledige plads i lageret',
        'Varerne opbevares i vandtanke',
        'Systemet bruges udelukkende til flydende væsker'
    ],
    correct: 1,
    explanation: 'I et flydende system er ingen plads reserveret til bestemte varer. En vare placeres på den første ledige plads. Det giver bedre udnyttelse af pladsen, men kræver et godt WMS-system, der holder styr på lokationerne.'
},
{
    id: 6,
    category: 'Lagerstyring',
    q: 'Hvad er formålet med en ABC-analyse i lagerstyring?',
    options: [
        'At klassificere varer efter deres værdi, så de vigtigste får mest opmærksomhed',
        'At sortere varer efter farve og størrelse',
        'At vurdere om lagerbygningen er stor nok',
        'At fordele medarbejderne i tre hold'
    ],
    correct: 0,
    explanation: 'ABC-analyse bygger på Pareto-princippet (80/20-reglen). A-varer udgør typisk 20% af varerne men 80% af værdien, og de styres stramt. C-varer udgør 50% af varerne men kun 5% af værdien og styres enklere.'
},
{
    id: 7,
    category: 'Lagerstyring',
    q: 'Hvad er zone-plukning?',
    options: [
        'Lageret opdeles i zoner, og plukkere arbejder i hver sin zone',
        'Én plukker løber alle zoner igennem med hele ordren',
        'Man plukker kun fra den zone der er tættest på udleveringen',
        'En metode hvor robotter henter varerne for plukkeren'
    ],
    correct: 0,
    explanation: 'I zone-plukning er lageret delt op, og hver plukker har ansvar for sin zone. Ordrerne deles op, plukkes i de enkelte zoner og samles igen bagefter. Det minimerer gangafstande.'
},
{
    id: 8,
    category: 'Lagerstyring',
    q: 'Hvad er batch-plukning?',
    options: [
        'At plukke varer efter et fast tidsinterval fx hver time',
        'At plukke én ordre ad gangen med stor præcision',
        'At plukke hele paller ad gangen',
        'At samle flere ordrer og plukke dem i én runde for at spare gangtid'
    ],
    correct: 3,
    explanation: 'I batch-plukning slår man flere ordrer sammen, så plukkeren kun skal gå forbi den samme lokation én gang. Bagefter sorteres varerne til de enkelte ordrer. Det er effektivt ved mange små ordrer.'
},
{
    id: 9,
    category: 'Lagerstyring',
    q: 'Hvilket lagerstyringsprincip bruges typisk til fødevarer og medicin?',
    options: [
        'LIFO — Last In, First Out',
        'HIFO — Highest In, First Out',
        'FIFO — First In, First Out',
        'Random plukning efter bekvemmelighed'
    ],
    correct: 2,
    explanation: 'FIFO sikrer, at de ældste varer altid udleveres først. For fødevarer og medicin er det afgørende, at varer med kortest holdbarhed ikke bliver liggende bagerst og udløber.'
},
{
    id: 10,
    category: 'Lagerstyring',
    q: 'Hvad er en "pick-by-light" løsning?',
    options: [
        'En energibesparende LED-belysning til lagerområdet',
        'Et system hvor lysdioder ved lagerpladserne viser plukkeren hvor og hvor meget der skal plukkes',
        'Lommelygter som plukkere bruger i mørke gange',
        'Et alarmsystem der blinker når der plukkes forkert'
    ],
    correct: 1,
    explanation: 'Pick-by-light bruger displays og lysdioder ved hver lokation. Når plukkeren skal hente varer, lyser den relevante plads op og viser antal. Det giver hurtig og præcis plukning, især i zoner med høj aktivitet.'
},
{
    id: 11,
    category: 'Lagerstyring',
    q: 'Hvad er voice picking?',
    options: [
        'Et system hvor lagerchefen dikterer ordrer over højttaleren',
        'At diskutere plukkelister mundtligt med kollegaer',
        'Et oversættelsesprogram til flersprogede lagre',
        'Plukkeren får stemmeinstruktioner via headset og bekræfter mundtligt, så hænderne er frie'
    ],
    correct: 3,
    explanation: 'Voice picking giver plukkeren instruktioner direkte i øret via headset. Plukkeren bekræfter plukket med sin stemme. Begge hænder er frie til at arbejde. Det reducerer fejl og øger hastigheden.'
},
{
    id: 12,
    category: 'Lagerstyring',
    q: 'Hvad er cyklisk optælling?',
    options: [
        'At tælle hele lagerbeholdningen fra start til slut én gang om året',
        'En metode hvor man løbende tæller udvalgte varegrupper, så hele lageret dækkes over tid',
        'At cykle rundt i lageret og tælle samtidig',
        'At tælle antallet af reoler i lageret'
    ],
    correct: 1,
    explanation: 'I stedet for den store årlige optælling tæller man løbende: fx A-varer ugentligt, B-varer månedligt, C-varer kvartalsvis. Det holder lagersaldoen mere nøjagtig hele året og forstyrrer driften mindre.'
},

// ============================
// LEAN
// ============================
{
    id: 13,
    category: 'Lean',
    q: 'Hvad betyder det japanske ord "Muda"?',
    options: [
        'Værdi',
        'Forbedring',
        'Spild',
        'Standard'
    ],
    correct: 2,
    explanation: 'Muda = spild. Lean handler om at fjerne alt, der ikke skaber værdi for kunden. De 7 spildtyper er: overproduktion, ventetid, transport, overforarbejdning, lagerbeholdning, unødvendig bevægelse og defekter.'
},
{
    id: 14,
    category: 'Lean',
    q: 'Hvilket af disse er IKKE en af de 7 spildtyper i Lean?',
    options: [
        'Markedsføring',
        'Overproduktion',
        'Ventetid',
        'Unødvendig lagerbeholdning'
    ],
    correct: 0,
    explanation: 'De 7 spildtyper er: overproduktion, ventetid, unødvendig transport, overforarbejdning, lagerbeholdning, unødvendig bevægelse og defekter/fejl. Markedsføring er en normal forretningsaktivitet og indgår ikke.'
},
{
    id: 15,
    category: 'Lean',
    q: 'Hvad står de 5S for i Lean?',
    options: [
        'Sælg, Sortér, Saml, Standard, Slut',
        'Sikkerhed, Styring, Service, Salg, Status',
        'Sortér, Systematisér, Skinnende rent, Standardisér, Selvdisciplin',
        'Speed, System, Support, Structure, Strategy'
    ],
    correct: 2,
    explanation: '5S er: 1) Sortér (fjern alt unødvendigt), 2) Systematisér (alt har sin plads), 3) Skinnende rent (gør rent og inspicer), 4) Standardisér (lav faste rutiner), 5) Selvdisciplin (hold standarden ved lige). Det er fundamentet for en velfungerende arbejdsplads.'
},
{
    id: 16,
    category: 'Lean',
    q: 'Hvad er Kaizen?',
    options: [
        'Et japansk kampsportssystem til teambuilding',
        'Store revolutionerende omstruktureringer af hele virksomheden',
        'Et kvalitetscertifikat udstedt i Japan',
        'Filosofien om løbende forbedringer i mange små skridt'
    ],
    correct: 3,
    explanation: 'Kaizen betyder "forandring til det bedre". Ideen er, at alle medarbejdere hele tiden foreslår og gennemfører små forbedringer i hverdagen. Over tid giver tusind små skridt en kæmpe effekt.'
},
{
    id: 17,
    category: 'Lean',
    q: 'Hvad kendetegner et Kanban-system?',
    options: [
        'Det er push-baseret og bygger på prognoser',
        'Produktion og genopfyldning styres af faktisk forbrug — et pull-system',
        'Det bruges kun i bilindustrien i Japan',
        'Det kræver altid store sikkerhedslagre for at fungere'
    ],
    correct: 1,
    explanation: 'Kanban er et pull-system: først når en vare er forbrugt, sendes et signal om at genopfylde. Det modvirker overproduktion og overskydende lager. Kanban-kort eller digitale signaler styrer flowet.'
},
{
    id: 18,
    category: 'Lean',
    q: 'Hvad er formålet med Poka-Yoke?',
    options: [
        'At fejlsikre processer, så fejl enten forebygges helt eller opdages med det samme',
        'At belønne medarbejdere der aldrig laver fejl',
        'At producere i store partier for at minimere risikoen',
        'At lave japansk-inspirerede procesdiagrammer'
    ],
    correct: 0,
    explanation: 'Poka-Yoke er fejlsikring. Et USB-stik der kun kan sættes i på én måde er et godt eksempel. I lageret kan det være en scanner der afviser en forkert vare, eller en skabelon der kun tillader korrekt emballering.'
},
{
    id: 19,
    category: 'Lean',
    q: 'Hvad er JIT (Just-in-Time)?',
    options: [
        'At producere store mængder på forhånd, så man er klar til alt',
        'At sende ordrer afsted hurtigere end aftalt',
        'At have store sikkerhedslagre spredt flere steder',
        'At levere og producere præcis det der skal bruges, lige når det skal bruges'
    ],
    correct: 3,
    explanation: 'JIT eliminerer unødvendigt lager ved at sørge for, at materialer ankommer præcis når de skal bruges — ikke før, ikke efter. Det kræver pålidelige leverandører, korte leveringstider og god planlægning.'
},
{
    id: 20,
    category: 'Lean',
    q: 'Hvad er OEE (Overall Equipment Effectiveness)?',
    options: [
        'Et mål for maskineffektivitet: Tilgængelighed × Ydelse × Kvalitet',
        'Et regnskabsbegreb for årlig omsætning per afdeling',
        'Et mål for lagerkapacitet i kubikmeter',
        'En forkortelse for Operational Employee Evaluation'
    ],
    correct: 0,
    explanation: 'OEE viser hvor effektivt maskiner udnyttes. 100% OEE er perfekt: ingen nedbrud, fuld hastighed, nul fejl. Verdensklasse er ca. 85%. De tre faktorer ganges sammen: fx 90% tilgængelighed × 95% ydelse × 99% kvalitet = 84,6%.'
},
{
    id: 21,
    category: 'Lean',
    q: 'Hvad er en Gemba-walk?',
    options: [
        'En løbetur som del af virksomhedens sundhedsprogram',
        'En brandøvelse med fuld evakuering af lageret',
        'En leder går ud på gulvet for at observere processerne der, hvor arbejdet faktisk foregår',
        'En rundvisning for nye kunder'
    ],
    correct: 2,
    explanation: 'Gemba er japansk for "det virkelige sted". En Gemba-walk er, når en leder selv går ud i lageret eller produktionen for at se, spørge og forstå — ikke for at kontrollere, men for at finde forbedringer sammen med medarbejderne.'
},
{
    id: 22,
    category: 'Lean',
    q: 'Hvad er "Value Stream Mapping" (VSM)?',
    options: [
        'Et regnskabsværktøj til at beregne varelagerets samlede værdi',
        'En visuel kortlægning af alle trin i en proces fra start til slut, der afslører spild',
        'Et GPS-system til at spore varebiler på ruten',
        'En metode til at måle medarbejdernes markedsværdi'
    ],
    correct: 1,
    explanation: 'VSM tegner hele flowet fra kundeordre til levering. Hvert trin analyseres: skaber det værdi, eller er det spild? Typisk finder man ventetid, unødvendige godkendelser og overskydende lager.'
},

// ============================
// SUPPLY CHAIN MANAGEMENT
// ============================
{
    id: 23,
    category: 'Supply Chain',
    q: 'Hvad er bullwhip-effekten?',
    options: [
        'En metode til at øge produktionshastigheden markant',
        'At leverandører altid leverer mere end bestilt',
        'En teknik til at udglatte sæsonudsving i efterspørgslen',
        'Små udsving i kundernes efterspørgsel forstørres kraftigt op gennem forsyningskæden'
    ],
    correct: 3,
    explanation: 'Bullwhip-effekten: hvis kunderne efterspørger 5% mere, bestiller butikken måske 10% ekstra, grossisten 20% ekstra, og fabrikken 40% ekstra. Hvert led overreagerer. Løsningen er at dele realtidsdata på tværs af kæden.'
},
{
    id: 24,
    category: 'Supply Chain',
    q: 'Hvad er cross-docking?',
    options: [
        'At stable paller i krydsformation for bedre stabilitet',
        'At omlaste varer direkte fra indgående til udgående transport uden mellemlager',
        'Et sikkerhedstjek ved lagerets ind- og udgang',
        'At bytte varer mellem to forskellige lagre'
    ],
    correct: 1,
    explanation: 'Cross-docking eliminerer traditionel lagring. Varer ankommer ved én rampe, sorteres med det samme og sendes videre via en anden rampe — typisk samme dag. Det sparer lagerplads, tid og håndteringsomkostninger.'
},
{
    id: 25,
    category: 'Supply Chain',
    q: 'Hvad er TCO (Total Cost of Ownership)?',
    options: [
        'Den pris man betaler i kasseapparatet',
        'Kun transportomkostningen fra leverandøren',
        'Alle omkostninger forbundet med en vare over dens levetid: indkøb, fragt, lager, vedligehold, bortskaffelse m.m.',
        'Told og afgifter ved grænsepassage'
    ],
    correct: 2,
    explanation: 'TCO kigger på det fulde billede. En billig vare kan ende dyrt, hvis fragten er høj, den ofte går i stykker eller kræver dyr opbevaring. TCO hjælper med at vælge det reelt billigste alternativ.'
},
{
    id: 26,
    category: 'Supply Chain',
    q: 'Hvad er en 3PL-udbyder?',
    options: [
        'En tredjepart der varetager logistikoperationer som lager, plukning og transport for andre virksomheder',
        'En tredjepartsforsikring mod transportskader',
        'Et tredjepartsprogram til bogføring og fakturering',
        'Den tredje prioritetsleverandør i virksomhedens indkøbsaftaler'
    ],
    correct: 0,
    explanation: '3PL = Third Party Logistics. Virksomheder outsourcer dele af deres logistik til en specialist, der har lagre, chauffører og systemer klar. Det frigør virksomheden til at fokusere på sine egne produkter.'
},
{
    id: 27,
    category: 'Supply Chain',
    q: 'Hvad er "lead time" i logistik?',
    options: [
        'Den tid en medarbejder bruger på at gå fra A til B i lageret',
        'Tiden for at lukke computersystemet ned om aftenen',
        'Lederen har tid til at tjekke lagerbeholdningen',
        'Den samlede tid fra en bestilling afgives til varerne er modtaget og klar til brug'
    ],
    correct: 3,
    explanation: 'Lead time er den totale gennemløbstid. Kort lead time giver hurtigere levering, lavere lager og mere tilfredse kunder. Det er en af de vigtigste KPIer i supply chain management.'
},
{
    id: 28,
    category: 'Supply Chain',
    q: 'Hvad er formålet med VMI (Vendor Managed Inventory)?',
    options: [
        'At kunden selv henter varer direkte hos leverandøren',
        'At leverandøren overtager ansvaret for at holde kundens lager fyldt op',
        'At lageret styres af en ekstern frivillig organisation',
        'At leverandøren besøger kundens lager én gang årligt for inspektion'
    ],
    correct: 1,
    explanation: 'I VMI deler kunden salgs- og lagerdata med leverandøren, som selv sørger for genbestilling og levering. Det reducerer risikoen for tomme hylder og sparer administrativt arbejde for begge parter.'
},
{
    id: 29,
    category: 'Supply Chain',
    q: 'Hvad er forskellen på "push" og "pull" i en forsyningskæde?',
    options: [
        'Push handler om at skubbe paller, pull om at trække dem',
        'De to begreber dækker over præcis det samme',
        'Push: man producerer ud fra prognoser. Pull: man producerer ud fra faktisk efterspørgsel',
        'Push bruges kun i stor industri, pull kun i detailhandlen'
    ],
    correct: 2,
    explanation: 'Push producerer på forhånd baseret på, hvad man forventer at sælge — risiko for overproduktion. Pull producerer først, når kunden bestiller — lavere lager, men kræver kort leveringstid og fleksible processer.'
},

// ============================
// LEVERINGSBETINGELSER & INCOTERMS
// ============================
{
    id: 30,
    category: 'Leveringsbetingelser',
    q: 'Hvad betyder det, at en levering er "franco"?',
    options: [
        'Leverandøren betaler fragten til det aftalte leveringssted',
        'Varerne er gratis for kunden',
        'Kunden skal selv afhente varerne hos leverandøren',
        'Leverancen kommer fra Frankrig'
    ],
    correct: 0,
    explanation: 'Franco = frit leveret. Sælgeren betaler transporten. Mange leverandører har en franco-grænse: fx "Franco ved køb over 5.000 kr." — under det beløb betaler kunden selv fragten.'
},
{
    id: 31,
    category: 'Leveringsbetingelser',
    q: 'Hvad betyder "ufranco" levering?',
    options: [
        'Levering med ekspresbudtjeneste',
        'Levering er gratis for kunden',
        'Varerne sendes retur til leverandøren',
        'Kunden (køber) betaler fragten'
    ],
    correct: 3,
    explanation: 'Ufranco = køber betaler fragten selv. Det modsatte af franco. I praksis er mange ordrer under en vis beløbsgrænse ufranco, mens store ordrer sendes franco.'
},
{
    id: 32,
    category: 'Leveringsbetingelser',
    q: 'Hvad er Incoterms?',
    options: [
        'En national standard for emballering og pakning',
        'Et IT-system til toldberegning',
        'Internationale handelsregler der fastlægger ansvar, risiko og omkostninger mellem køber og sælger',
        'Internationale regler for truckcertificering'
    ],
    correct: 2,
    explanation: 'Incoterms (International Commercial Terms) udgives af ICC og opdateres løbende. De standardiserer, hvem der betaler hvad, hvem der bærer risikoen, og hvornår ansvaret overgår fra sælger til køber.'
},
{
    id: 33,
    category: 'Leveringsbetingelser',
    q: 'Hvad betyder Incoterm "EXW" (Ex Works)?',
    options: [
        'Sælger leverer varen helt til købers adresse inkl. toldbehandling',
        'Sælger stiller varen til rådighed ved sit eget sted — køber bærer al risiko og alle omkostninger derfra',
        'Sælger betaler fragt og forsikring frem til destinationshavnen',
        'Sælger sørger for transport til nærmeste grænseovergang'
    ],
    correct: 1,
    explanation: 'EXW giver mindst ansvar til sælgeren. Sælger gør blot varen klar til afhentning på fx sin fabrik. Alt derfra — transport, told, forsikring — er købers ansvar og risiko.'
},
{
    id: 34,
    category: 'Leveringsbetingelser',
    q: 'Hvad betyder Incoterm "DAP" (Delivered at Place)?',
    options: [
        'Varen afleveres frit på kajen ved afgangshavnen',
        'Køber afhenter selv varen på fabrikken',
        'Sælger betaler kun fragt frem til nærmeste lufthavn',
        'Sælger leverer varen til det aftalte sted — køber klarer importtold og aflæsning'
    ],
    correct: 3,
    explanation: 'DAP: sælger bærer alle omkostninger og risici, indtil varen ankommer til det aftalte leveringssted. Køber står kun for importtold/-afgifter og aflæsning. Det er en af de mest brugte Incoterms.'
},

// ============================
// ERP, WMS & IT
// ============================
{
    id: 35,
    category: 'ERP & IT',
    q: 'Hvad står ERP for?',
    options: [
        'Electronic Retail Platform — et system til onlinesalg',
        'Estimated Revenue Prediction — en metode til indtægtsprognoser',
        'Emergency Recovery Protocol — en nødplan ved IT-nedbrud',
        'Enterprise Resource Planning — et samlet IT-system til virksomhedens ressourcer'
    ],
    correct: 3,
    explanation: 'ERP = Enterprise Resource Planning. Det er ét samlet system, der binder virksomhedens funktioner sammen: økonomi, lager, indkøb, produktion, HR m.m. deler data i én database, så alle arbejder med de samme tal.'
},
{
    id: 36,
    category: 'ERP & IT',
    q: 'Hvad er et WMS (Warehouse Management System)?',
    options: [
        'Et system til at styre medarbejdernes vagtplaner',
        'Et IT-system der styrer lageroperationer: modtagelse, placering, plukning, pakning og forsendelse',
        'En type operativsystem til bærbare computere',
        'Et system til at styre virksomhedens marketingkampagner'
    ],
    correct: 1,
    explanation: 'WMS styrer lageret digitalt. Det bestemmer hvor varer skal placeres, optimerer plukruter, holder styr på lokationer og giver realtidsoverblik over hele lagerbeholdningen.'
},
{
    id: 37,
    category: 'ERP & IT',
    q: 'Hvad er EDI (Electronic Data Interchange)?',
    options: [
        'En intern e-mailservice for lagermedarbejdere',
        'Et system til elektronisk overvågning af gaffeltrucks',
        'Elektronisk udveksling af forretningsdokumenter direkte mellem virksomheders IT-systemer',
        'En type avanceret holografisk stregkode'
    ],
    correct: 2,
    explanation: 'EDI gør det muligt at udveksle ordrer, fakturaer, forsendelsesmeddelelser m.m. automatisk system-til-system. Det fjerner behovet for manuel dataindtastning og reducerer fejl drastisk.'
},
{
    id: 38,
    category: 'ERP & IT',
    q: 'Hvad er den primære fordel ved RFID frem for stregkoder?',
    options: [
        'RFID kan kun bruges til dyre produkter',
        'Stregkoder er altid hurtigere at aflæse end RFID',
        'Der er ingen praktisk forskel mellem de to teknologier',
        'RFID kan læses uden direkte synslinje og kan scanne mange tags på én gang'
    ],
    correct: 3,
    explanation: 'RFID bruger radiobølger og kan læses igennem emballage, på afstand og mange tags samtidig. Stregkoder kræver direkte synslinje og kan kun scannes én ad gangen. RFID er dog dyrere per enhed.'
},
{
    id: 39,
    category: 'ERP & IT',
    q: 'Hvad er MRP (Material Requirements Planning)?',
    options: [
        'Et system der beregner materialebehov ud fra produktionsplaner og styklister',
        'En metode til at evaluere medarbejdernes præstation',
        'Et marketingsystem til at planlægge reklamekampagner',
        'Et system til at måle rumtemperaturen i lageret'
    ],
    correct: 0,
    explanation: 'MRP tager udgangspunkt i produktionsplanen og bryder den ned: Hvad skal produceres? Hvad kræver det af materialer? Hvad har vi på lager? Hvad skal bestilles hjem — og hvornår? Det sikrer at alt er klar uden overbeholdning.'
},

// ============================
// TRANSPORT & DISTRIBUTION
// ============================
{
    id: 40,
    category: 'Transport',
    q: 'Hvad er intermodal transport?',
    options: [
        'Transport der udelukkende bruger lastbiler på motorvejen',
        'Transport der kombinerer flere transportformer, fx lastbil, tog og skib',
        'Transport kun til søs mellem to europæiske havne',
        'Transport med helikopter til svært tilgængelige steder'
    ],
    correct: 1,
    explanation: 'Intermodal transport kombinerer flere transportformer. Fx kan en container køres med lastbil til jernbanen, fragtes med tog til en havn, og sejles med skib til modtagerlandet. Det udnytter styrkerne ved hver transportform.'
},
{
    id: 41,
    category: 'Transport',
    q: 'Hvad er et CMR-fragtbrev?',
    options: [
        'Et certifikat man får efter at have bestået lastbilkøreprøven',
        'En kvittering fra en tankstation til brug i regnskabet',
        'Et standardiseret internationalt vejtransportdokument der dokumenterer fragtaftalen',
        'En månedlig opgørelse over virksomhedens transportomkostninger'
    ],
    correct: 2,
    explanation: 'CMR-fragtbrevet bruges ved international godstransport ad vej i Europa. Det dokumenterer hvem der sender, hvem der modtager, hvad der fragtes, og hvad der er aftalt. Det er lovpligtigt ved grænseoverskridende transport.'
},
{
    id: 42,
    category: 'Transport',
    q: 'Hvad er "colli" i transportsammenhæng?',
    options: [
        'Et italiensk ord for lastbil',
        'En type gaffeltruck til havnekraner',
        'Et bestemt mærke transportemballage',
        'En betegnelse for de enkelte stykker gods i en forsendelse (pakker/kasser)'
    ],
    correct: 3,
    explanation: 'Colli er flertal af kollo og betegner de enkelte stykker gods. "Forsendelsen består af 5 colli" betyder 5 separate pakker/kasser. Det bruges på fragtbreve og ved modtagekontrol.'
},
{
    id: 43,
    category: 'Transport',
    q: 'Hvad er "last mile delivery" (sidste kilometer-levering)?',
    options: [
        'Den sidste del af leveringen fra distributionscenter til slutkunden — ofte den dyreste del',
        'Den billigste og korteste del af hele fragtprocessen',
        'Et begreb der kun bruges ved international transport',
        'En forsikringstype der dækker skader på den sidste del af ruten'
    ],
    correct: 0,
    explanation: 'Sidste kilometer-leveringen er den dyreste del af transporten — op til 50% af den totale fragtomkostning — fordi den involverer mange individuelle stop med små mængder. Det er her, kundetilfredsheden afgøres.'
},
{
    id: 44,
    category: 'Transport',
    q: 'Hvad er kabotage inden for godstransport?',
    options: [
        'Transport af farligt gods over vandveje i Europa',
        'Indenrigskørsel i et land, udført af et transportfirma fra et andet land',
        'Transport med kabiner i bjergområder',
        'En type søtransport mellem to havne inden for samme land'
    ],
    correct: 1,
    explanation: 'Kabotage er fx når en polsk vognmand kører en indenrigstur i Danmark. EU har strenge regler: typisk maks 3 kabotage-ture inden for 7 dage efter en international levering til landet.'
},

// ============================
// SIKKERHED & ARBEJDSMILJØ
// ============================
{
    id: 45,
    category: 'Sikkerhed',
    q: 'Hvad dækker ADR-reglerne?',
    options: [
        'Regler for parkering af lastbiler i byområder',
        'Krav til hygiejne i fødevarelagre',
        'Internationale regler for sikker vejtransport af farligt gods',
        'Regler for automatisk dørlukning i lagerbygninger'
    ],
    correct: 2,
    explanation: 'ADR regulerer transport af farligt gods ad vej i Europa. Det omfatter klassificering, emballering, mærkning, dokumentation og krav til chauffør og køretøj ved transport af kemikalier, brændstoffer, sprængstoffer m.m.'
},
{
    id: 46,
    category: 'Sikkerhed',
    q: 'Hvad kræves for at måtte køre gaffeltruck på et lager?',
    options: [
        'Et almindeligt B-kørekort er tilstrækkeligt',
        'Man skal bare have fyldt 16 år og fået en instruktion',
        'En kollega kan godkende dig efter en times oplæring',
        'Et gyldigt gaffeltruckcertifikat efter bestået teori og praksis'
    ],
    correct: 3,
    explanation: 'Man skal have et truckcertifikat (gaffeltruckkørekort) for at betjene gaffeltrucks. Det fås efter et godkendt kursus med teori om sikkerhed, stabilitet og praksis med selve trucken.'
},
{
    id: 47,
    category: 'Sikkerhed',
    q: 'Hvad er korrekt løfteteknik ifølge ergonomiske retningslinjer?',
    options: [
        'Bøj i knæene, hold ryggen ret og løft tæt ved kroppen',
        'Bøj ryggen og hold armene så strakte som muligt',
        'Løft med strakte ben og bøjet ryg for mere kraft',
        'Det er ligegyldigt, bare man gør det hurtigt så musklerne ikke overbelastes'
    ],
    correct: 0,
    explanation: 'Korrekt teknik: bøj i knæene, hold ryggen ret, byrden tæt på kroppen, spænd maven og undgå at vride. Forkert løfteteknik er en af de hyppigste årsager til rygskader i lagerjobs.'
},
{
    id: 48,
    category: 'Sikkerhed',
    q: 'Hvad indeholder et sikkerhedsdatablad (SDS)?',
    options: [
        'Medarbejdernes ferieplan og vagtoversigt',
        'Oplysninger om et kemisk produkts farlighed, korrekt håndtering, førstehjælp og opbevaring',
        'En oversigt over lagerets brandudgange og nødplaner',
        'Virksomhedens årsregnskab og økonomiske nøgletal'
    ],
    correct: 1,
    explanation: 'SDS (Safety Data Sheet) er lovpligtigt for alle farlige kemikalier. Det har 16 sektioner med info om fareidentifikation, førstehjælp, brandbekæmpelse, personlige værnemidler, opbevaring og bortskaffelse.'
},
{
    id: 49,
    category: 'Sikkerhed',
    q: 'Hvilke personlige værnemidler (PV) er typisk påkrævet i et lager?',
    options: [
        'Jakkesæt, slips og pæne sko',
        'Kun en synlig ID-badge er nok',
        'Sikkerhedssko med stålnæse og evt. handsker og refleksvest',
        'Hjelm er det eneste lovmæssige krav'
    ],
    correct: 2,
    explanation: 'Typiske værnemidler i lageret: sikkerhedssko med stålnæse (mod faldende genstande), handsker (mod skarpe kanter), refleksvest (synlighed). Fryselagre kræver desuden termotøj. Det afhænger af den konkrete arbejdsmiljøvurdering.'
},

// ============================
// VIRKSOMHED, ORGANISATION & ØKONOMI
// ============================
{
    id: 50,
    category: 'Virksomhed',
    q: 'Hvad er dækningsbidrag?',
    options: [
        'Den samlede omsætning i virksomheden på et år',
        'Den pris kunden betaler for varen i butikken',
        'Salgspris minus faste omkostninger',
        'Salgspris minus variable omkostninger'
    ],
    correct: 3,
    explanation: 'Dækningsbidrag = salgspris minus variable omkostninger (fx materialer, fragt per enhed). Det beløb der er tilbage skal dække de faste omkostninger (husleje, løn) og derefter give overskud.'
},
{
    id: 51,
    category: 'Virksomhed',
    q: 'Hvad er break-even?',
    options: [
        'Det punkt hvor omsætningen præcis dækker alle omkostninger — hverken overskud eller underskud',
        'Når lageret er helt tomt og skal genopfyldes',
        'Når virksomheden officielt lukker ned for drift',
        'Når medarbejderne holder frokostpause'
    ],
    correct: 0,
    explanation: 'Break-even er nulpunktet. Omsætningen er præcis lig med de samlede omkostninger (faste + variable). Sælger man mere end break-even, tjener man penge. Sælger man mindre, har man underskud.'
},
{
    id: 52,
    category: 'Virksomhed',
    q: 'Hvad er forskellen på faste og variable omkostninger?',
    options: [
        'Faste omkostninger stiger, når produktionen øges',
        'Faste er konstante uanset aktivitetsniveau; variable ændres med produktions- og salgsvolumen',
        'Variable omkostninger er altid højere end faste',
        'Der er ingen forskel — begge stiger og falder med aktiviteten'
    ],
    correct: 1,
    explanation: 'Faste omkostninger (husleje, forsikring, direktørens løn) er de samme, hvad enten man producerer 0 eller 10.000 stk. Variable omkostninger (råvarer, emballage, fragt per enhed) stiger proportionalt med aktiviteten.'
},
{
    id: 53,
    category: 'Virksomhed',
    q: 'Hvad er en KPI i virksomhedssammenhæng?',
    options: [
        'Key Profit Index — en indeks over virksomhedens aktiekurs',
        'Kanban Process Integration — et Lean-værktøj',
        'Key Performance Indicator — et nøgletal til at måle præstation',
        'Knowledge Platform Interface — et videnssystem'
    ],
    correct: 2,
    explanation: 'KPI = Key Performance Indicator. I logistik måler man fx leveringspræcision, lageromsætning, plukkefejlrate og ordrebehandlingstid. KPIer omsætter strategi til konkrete, målbare tal.'
},
{
    id: 54,
    category: 'Virksomhed',
    q: 'Hvad er en funktionsopdelt organisation?',
    options: [
        'En virksomhed der kun har én afdeling til alt',
        'En organisation hvor alle medarbejdere roterer roller dagligt',
        'En organisation der kun fungerer i bestemte sæsoner',
        'En virksomhed opdelt i faglige afdelinger som indkøb, lager, salg og økonomi'
    ],
    correct: 3,
    explanation: 'I en funktionsopdelt organisation er afdelingerne organiseret efter fagområder. Det giver specialisering, men kan skabe silotænkning, hvor afdelingerne ikke samarbejder godt nok.'
},
{
    id: 55,
    category: 'Virksomhed',
    q: 'Hvad er lageromkostninger typisk i procent af varens værdi per år?',
    options: [
        '15-30% af varens værdi per år',
        '1-2% af varens værdi per år',
        '50-80% af varens værdi per år',
        '90-100% af varens værdi per år'
    ],
    correct: 0,
    explanation: 'Lageromkostninger inkluderer kapitalbinding, forsikring, svind, forældelse, lagerplads og håndtering. Samlet ender det typisk på 15-30% af varens værdi om året. Derfor er unødvendigt lager dyrt.'
},

// ============================
// GENERELT LOGISTIK & EKSTRA
// ============================
{
    id: 56,
    category: 'Generelt Logistik',
    q: 'Hvad er "reverse logistics"?',
    options: [
        'At køre baglæns med gaffeltrucken i smalle gange',
        'At håndtere returvarer, genanvendelse og bortskaffelse — logistikken "den anden vej"',
        'At sende varer til forkerte adresser med vilje som test',
        'En metode til at vende pallerne om, så de kan genbruges'
    ],
    correct: 1,
    explanation: 'Reverse logistics dækker returhåndtering, reparation, genanvendelse og bortskaffelse. Med stigende e-handel og krav om bæredygtighed er det blevet en vigtig del af moderne logistik.'
},
{
    id: 57,
    category: 'Generelt Logistik',
    q: 'Hvad bruges Wilsons EOQ-formel til?',
    options: [
        'At beregne antallet af nødvendige medarbejdere i et lager',
        'At finde lagerets optimale areal i kvadratmeter',
        'At beregne den optimale ordrestørrelse der minimerer de samlede lageromkostninger',
        'At beregne fragtpriser til udenlandske kunder'
    ],
    correct: 2,
    explanation: 'EOQ = √(2DS/H). D er efterspørgsel, S er ordreomkostning, H er lageromkostning per enhed per år. Ved EOQ er ordreomkostningerne præcis lige store som lageromkostningerne — det billigste punkt.'
},
{
    id: 58,
    category: 'Generelt Logistik',
    q: 'Hvad er en forsyningskæde (supply chain)?',
    options: [
        'En kæde man sætter på lagerdøren for at sikre den',
        'Udelukkende forholdet mellem en virksomhed og dens slutkunder',
        'Et andet ord for produktionens samlebånd',
        'Hele kæden fra råvare til slutkunde: leverandører, producenter, lagre, transport og salg'
    ],
    correct: 3,
    explanation: 'Forsyningskæden er alle virksomheder og aktiviteter, der bringer et produkt fra råvare til slutkunden. God supply chain management handler om at få alle led til at arbejde sammen effektivt.'
},
{
    id: 59,
    category: 'Generelt Logistik',
    q: 'Hvad er ISO 9001?',
    options: [
        'En international standard for kvalitetsledelsessystemer',
        'En national standard for truckcertificering i Danmark',
        'En miljølovgivning om sortering af affald på lagre',
        'En standard for elektrisk sikkerhed i industribygninger'
    ],
    correct: 0,
    explanation: 'ISO 9001 er verdens mest udbredte kvalitetsstandard. Den stiller krav til dokumentation, kundefokus, løbende forbedring og ledelsens ansvar. Certificering viser kunder og partnere, at virksomheden har styr på kvaliteten.'
},
{
    id: 60,
    category: 'Generelt Logistik',
    q: 'Hvad er "lean warehousing"?',
    options: [
        'Et lager der kun opbevarer letvægtsprodukter',
        'At reducere lagerbygningens fysiske størrelse til det mindst mulige',
        'Brugen af lean-principper i lagerdrift for at fjerne spild og øge effektiviteten',
        'At ansætte færre medarbejdere for at spare på lønbudgettet'
    ],
    correct: 2,
    explanation: 'Lean warehousing anvender 5S, Kaizen, standardiseret arbejde og systematisk spildjagt i lagerprocesser. Målet er at gøre mere med mindre — højere hastighed, færre fejl, lavere omkostninger — uden at kvaliteten falder.'
},

// ============================
// EKSTRA: LAGERSTYRING & LAGER (61-75)
// ============================
{
    id: 61,
    category: 'Lagerstyring',
    q: 'Hvad er LIFO-princippet?',
    options: [
        'De ældste varer sendes ud først',
        'De nyeste varer sendes ud først — Last In, First Out',
        'Letteste varer sendes ud først',
        'De varer der fylder mindst sendes ud først'
    ],
    correct: 1,
    explanation: 'LIFO = Last In, First Out. De senest modtagne varer udleveres først. Det bruges fx ved bulkvarer som grus eller kul, hvor det nyeste fyld ligger ovenpå. LIFO er IKKE egnet til varer med udløbsdato.'
},
{
    id: 62,
    category: 'Lagerstyring',
    q: 'Hvad er et konsolideringslager?',
    options: [
        'Et lager med klimakontrol til skrøbelige varer',
        'Et lager der samler flere mindre forsendelser til én stor',
        'Et lager kun til returnerede varer',
        'Et midlertidigt lager under bygningsrenovering'
    ],
    correct: 1,
    explanation: 'I et konsolideringslager samles mange mindre forsendelser fra forskellige leverandører til færre, større forsendelser. Det reducerer transportomkostninger, fordi lastbilerne kører med fuld last i stedet for halvtomme.'
},
{
    id: 63,
    category: 'Lagerstyring',
    q: 'Hvad er svind i lagersammenhæng?',
    options: [
        'Når luftfugtigheden er for høj i lagerbygningen',
        'Forskellen mellem den registrerede og den faktiske lagerbeholdning pga. tyveri, fejl eller beskadigelse',
        'Et andet ord for kapacitetsudnyttelse',
        'Antal medarbejdere der har sagt op inden for et år'
    ],
    correct: 1,
    explanation: 'Svind dækker over varer, der "forsvinder" fra lageret: tyveri, skader, varer der er gået ud på dato, tællefejl eller forkert registrering. Svind koster virksomheder mange penge årligt, og det er derfor man tæller op.'
},
{
    id: 64,
    category: 'Lagerstyring',
    q: 'Hvad er en pallereol?',
    options: [
        'En type lastbil designet kun til palletransport',
        'Et system af vertikale reoler med bjælker, hvor paller placeres i flere niveauer',
        'En maskine der automatisk pakker varer på paller',
        'Et konsekvensdiagram over palleflow i lageret'
    ],
    correct: 1,
    explanation: 'Pallereolen er det mest udbredte lagerreolsystem. Paller placeres på vandrette bjælker i flere niveauer. Det udnytter lagerets højde og giver nem adgang med gaffeltruck. Finnes i mange typer: standard, gennemløb, drive-in osv.'
},
{
    id: 65,
    category: 'Lagerstyring',
    q: 'Hvad er en drive-in reol?',
    options: [
        'En kørende reol der bevæger sig på skinner',
        'Et reolsystem hvor gaffeltrucken kører ind i selve reolen for at placere/hente paller',
        'En reol med indbygget motor som roterer varerne',
        'En reol der kun bruges i drive-in restauranters lagre'
    ],
    correct: 1,
    explanation: 'Drive-in reol: trucken kører ind i reolens gange for at sætte paller ind fra den ene side. Det giver meget høj pladsudnyttelse, men begrænset adgang — man kan kun nå den forreste/bagerste palle. Velegnet til store mængder af få varetyper.'
},
{
    id: 66,
    category: 'Lagerstyring',
    q: 'Hvad er gennemløbsreol (flow rack)?',
    options: [
        'En reol med rullende baner, hvor paller eller kasser glider fra bagsiden til forsiden ved hjælp af tyngdekraften',
        'En type bogreol til kontordokumentation',
        'En reol der automatisk roterer varer som et pariserhjul',
        'En reol kun til små reservedele'
    ],
    correct: 0,
    explanation: 'Gennemløbsreoler har skrå baner med ruller. Man fylder på fra bagsiden, og varerne glider ned til forsiden via tyngdekraften. Det sikrer automatisk FIFO, da de ældste varer altid plukkes først fra fronten.'
},
{
    id: 67,
    category: 'Lagerstyring',
    q: 'Hvad er "golden zone" i lagerindretning?',
    options: [
        'Det luksuriøse kontor til lagerchefen',
        'Et aflåst område til særligt værdifulde varer',
        'Højdeområdet mellem hofte og skulderhøjde, hvor plukning er lettest og hurtigst',
        'Zone belagt med guldfarvet gulvmærkning'
    ],
    correct: 2,
    explanation: 'Golden zone (guldzonen) er det ergonomisk ideelle plukkeområde — ca. fra hofte- til skulderhøjde. Her placeres A-varer, fordi de plukkes mest. Man undgår at bøje sig eller strække sig, hvilket er hurtigere og skåner kroppen.'
},
{
    id: 68,
    category: 'Lagerstyring',
    q: 'Hvad er en plukkefejlrate?',
    options: [
        'Antal gange en plukker dropper en vare på gulvet',
        'Den procentdel af pluk hvor den forkerte vare eller forkert antal er plukket',
        'Hastigheden i meter per sekund som plukkeren går med',
        'Antallet af ordrer der annulleres efter plukning'
    ],
    correct: 1,
    explanation: 'Plukkefejlraten måler kvaliteten af plukningen. Typisk mål er under 0,1% fejl. Fejl koster dyrt: returnering, ny forsendelse, irriterede kunder. Pick-to-light og voice picking hjælper med at reducere fejlraten.'
},
{
    id: 69,
    category: 'Lagerstyring',
    q: 'Hvad er en stregkode af typen EAN-13 mest brugt til?',
    options: [
        'Identifikation af medarbejdere med adgangskort',
        'Mærkning af dagligvarer og detailvarer i butikker',
        'GPS-sporing af lastbiler',
        'Kryptering af fortrolige regnskabsdata'
    ],
    correct: 1,
    explanation: 'EAN-13 (European Article Number) er den 13-cifrede stregkode du ser på næsten alle varer i dagligvarebutikker. Den identificerer producent og produkt entydigt og bruges på verdensplan.'
},
{
    id: 70,
    category: 'Lagerstyring',
    q: 'Hvad er et lokationssystem i et lager?',
    options: [
        'Et GPS-system til at spore gaffeltrucks udendørs',
        'Et system der giver hver lagerplads en unik adresse, fx gang-reol-hylde-plads',
        'Et alarm- og overvågningssystem med kameraer',
        'Et system til at finde ledige parkeringspladser for lastbiler'
    ],
    correct: 1,
    explanation: 'Lokationssystemet er lagerets "adressesystem". Hver plads har en unik kode, fx A-03-2-1 (gang A, reol 3, hylde 2, plads 1). Uden det ved ingen, hvor tingene står — og plukningen bliver kaos.'
},
{
    id: 71,
    category: 'Lagerstyring',
    q: 'Hvad er krydstjek ved varemodtagelse?',
    options: [
        'At kontrollere om der er kryds på emballagen',
        'At sammenligne leverancen med følgeseddel og indkøbsordren for at bekræfte rigtig vare, mængde og kvalitet',
        'At tjekke om krydsfiner er brugt i emballagen',
        'At lade to medarbejdere konkurrere om at tælle hurtigst'
    ],
    correct: 1,
    explanation: 'Et krydstjek sikrer, at det man har bestilt (indkøbsordren) stemmer med det leverandøren siger han sender (følgesedlen) og det man rent faktisk modtager (fysisk kontrol). Uoverensstemmelser kræver reklamation.'
},
{
    id: 72,
    category: 'Lagerstyring',
    q: 'Hvad er wave picking?',
    options: [
        'En plukmetode hvor medarbejderen vinker til kollegaer, når en ordre er klar',
        'At plukke ordrer i tidsbaserede bølger, hvor alle ordrer i en bestemt forsendelsesperiode samles og plukkes på én gang',
        'En teknik til at plukke bølgepapemballage fra hylderne',
        'En plukmetode der kun bruges i surfshops'
    ],
    correct: 1,
    explanation: 'Wave picking grupperer ordrer efter forsendelsestidspunkt. Alle ordrer der fx skal afsendes kl. 14: plukkes, pakkes og gøres klar i samme bølge. Det synkroniserer plukning med transport og giver jævnt arbejdsflow.'
},
{
    id: 73,
    category: 'Lagerstyring',
    q: 'Hvad er formålet med ABC-zonering af lageret?',
    options: [
        'At male gangene i tre forskellige farver',
        'At placere A-varer tættest på forsendelsesområdet, så gangafstanden for de mest plukket varer minimeres',
        'At opdele lageret efter varestørrelse: lille, mellem og stor',
        'At sortere varer efter leverandørens navn i alfabetisk rækkefølge'
    ],
    correct: 1,
    explanation: 'ABC-zonering placerer A-varer (de 20% der plukkes mest) tættest på pakke- og forsendelsesområdet. B-varer ligger i midten. C-varer længst væk. Det minimerer den daglige gangafstand og øger plukhastigheden.'
},
{
    id: 74,
    category: 'Lagerstyring',
    q: 'Hvad er et automatiseret højlager (AS/RS)?',
    options: [
        'Et lager med ekstra høje reoler som medarbejdere klatrer op i',
        'Et højteknologisk alarmsystem til lagersikkerhed',
        'Et computerstyret lager med kraner eller shuttles der automatisk lagrer og henter paller eller kasser',
        'Et lager der kun har én etage men med meget høje varer'
    ],
    correct: 2,
    explanation: 'AS/RS (Automated Storage and Retrieval System) bruger computerstyrede kraner til at lagre og hente varer i meget høje reoler (op til 40 meter). Det sparer plads, eliminerer fejl og arbejder 24/7 uden gaffeltrucks.'
},
{
    id: 75,
    category: 'Lagerstyring',
    q: 'Hvad er en "pick-and-pack" station?',
    options: [
        'Et tilbud i en takeaway-restaurant',
        'En arbejdsstation hvor ordrer plukkes og pakkes i forsendelsesklar emballage i ét sammenhængende flow',
        'Et sted hvor medarbejderne vælger deres eget frokostmad',
        'En særlig type gaffeltruck med indbygget pakkebord'
    ],
    correct: 1,
    explanation: 'Pick-and-pack kombinerer plukning og pakning i ét flow. Plukkeren lægger varerne direkte i forsendelseskassen i stedet for først at samle dem i en bakke. Det er effektivt til e-handel med mange enkeltordrer.'
},

// ============================
// EKSTRA: LEAN & KVALITET (76-88)
// ============================
{
    id: 76,
    category: 'Lean',
    q: 'Hvad er de 7 spildtyper (Muda) i Lean?',
    options: [
        'Overproduktion, ventetid, transport, overforarbejdning, lagerbeholdning, bevægelse, defekter',
        'Planlægning, indkøb, produktion, lager, salg, levering, retur',
        'Råvarer, halvfabrikata, færdigvarer, emballage, energi, vand, luft',
        'Maskiner, bygninger, lastbiler, computere, ansatte, lagre, kontorer'
    ],
    correct: 0,
    explanation: 'De 7 Muda er: 1) Overproduktion (lave mere end der er brug for), 2) Ventetid, 3) Unødvendig transport, 4) Overforarbejdning, 5) Lagerbeholdning (for meget lager), 6) Unødvendig bevægelse, 7) Defekter/fejl. Nogle tilføjer en 8.: uudnyttet talent.'
},
{
    id: 77,
    category: 'Lean',
    q: 'Hvad er et "Andon"-system i Lean?',
    options: [
        'Et GPS-sporingssystem til lastbiler',
        'En type japansk medarbejderuniform',
        'Et visuelt signal- eller alarmsystem der fortæller om en problems status, fx rødt/gult/grønt lys',
        'Et regnskabsprogram til lean-budgettering'
    ],
    correct: 2,
    explanation: 'Andon er et visuelt styringssystem. I fabrikken trækker en medarbejder fx i en snor, og en lampe lyser op — rødt for stop, gult for hjælp, grønt for OK. Det giver alle overblik over status og problemer med det samme.'
},
{
    id: 78,
    category: 'Lean',
    q: 'Hvad er "Takt Time"?',
    options: [
        'Den tid det tager at rengøre en maskine efter brug',
        'Hvorlænge en medarbejder må holde pause',
        'Den takt eller rytme som produktionen skal køre i for at matche kundeefterspørgslen',
        'Varslet tid for en planlagt maskinreparation'
    ],
    correct: 2,
    explanation: 'Takt Time = tilgængelig produktionstid / kundeefterspørgsel. Hvis kunderne vil have 480 stk. på en 8-timers dag (480 min.), er Takt Time 1 min. per enhed. Det sætter rytmen for hele produktionen.'
},
{
    id: 79,
    category: 'Lean',
    q: 'Hvad er "Heijunka" i Lean?',
    options: [
        'En type japansk sushi serveret i kantinen',
        'En udjævning af produktionen, så man producerer jævnt i stedet for i store svingninger',
        'En japansk hilseform mellem kolleger',
        'Det japanske ord for overtidsbetaling'
    ],
    correct: 1,
    explanation: 'Heijunka = produktionsudjævning. I stedet for at producere 1000 stk. af produkt A mandag og 1000 stk. af B tirsdag, producerer man lidt af begge hver dag. Det giver jævnere flow, mindre lager og mere forudsigelig drift.'
},
{
    id: 80,
    category: 'Lean',
    q: 'Hvad er PDCA-cyklussen?',
    options: [
        'Price, Demand, Cost, Action — en prismodel',
        'Product, Design, Control, Audit — en kvalitetsprocedure',
        'Plan, Do, Check, Act — en forbedringscyklus der gentages kontinuerligt',
        'Pack, Deliver, Confirm, Archive — en forsendelsesrutine'
    ],
    correct: 2,
    explanation: 'PDCA (Deming-cirklen): Plan (planlæg forbedringen), Do (gennemfør den), Check (mål resultaterne), Act (justér og standardisér). Cyklussen gentages — derfor er det en cirkel af løbende forbedring.'
},
{
    id: 81,
    category: 'Lean',
    q: 'Hvad er "standardiseret arbejde" i Lean?',
    options: [
        'At alle medarbejdere får fuldstændig samme løn',
        'At man dokumenterer den bedst kendte og sikreste måde at udføre en opgave og følger den konsekvent',
        'At man kun bruger standardpaller til alt gods',
        'At ledelsen bestemmer alting uden medarbejderinddragelse'
    ],
    correct: 1,
    explanation: 'Standardiseret arbejde fastlægger den bedste kendte metode for en opgave: rækkefølge, tid, kvalitetskrav. Alle følger den — det giver ensartet kvalitet og er udgangspunktet for forbedringer. Man kan ikke forbedre noget, der ikke har en standard.'
},
{
    id: 82,
    category: 'Lean',
    q: 'Hvad er et Spaghetti-diagram?',
    options: [
        'En opskrift brugt i kantinens madsystem',
        'Et diagram der viser maskinernes serienumre',
        'Et diagram der viser strømmen af elektriske kabler i lageret',
        'En visuel tegning af de fysiske bevægelser en person eller vare laver — afslører unødvendig gangafstand'
    ],
    correct: 3,
    explanation: 'Man tegner ruten en plukker eller vare tager på et lagerplankort. De mange krydsende linjer ligner kogt spaghetti. Det afslører spild i form af unødvendige bevægelser, omveje og krydsende flows — og viser præcist, hvad der kan forbedres.'
},
{
    id: 83,
    category: 'Lean',
    q: 'Hvad er en "A3-rapport" i Lean?',
    options: [
        'En personlighedstest for lagermedarbejdere',
        'En rapport der er præcis 3 sider lang med grafer',
        'Et problemløsningsværktøj på ét A3-ark: problem, analyse, handlingsplan og opfølgning',
        'En rapport om de 3 vigtigste A-varer i ABC-analysen'
    ],
    correct: 2,
    explanation: 'A3-rapporten tvinger dig til at strukturere hele problemløsningen på ét A3-ark: hvad er problemet, baggrund, nuværende situation, årsagsanalyse, foreslået løsning, plan og opfølgning. Begrænsningen i plads tvinger til klart og fokuseret tænkning.'
},
{
    id: 84,
    category: 'Lean',
    q: 'Hvad er "5 Hvorfor" (5 Why)?',
    options: [
        'Fem spørgsmål man stiller til nye medarbejdere under ansættelse',
        'Fem grunde til at implementere Lean i virksomheden',
        'En teknik hvor man spørger "hvorfor?" gentagne gange for at finde den egentlige grundårsag til et problem',
        'En regel om at have mindst fem leverandører per varegruppe'
    ],
    correct: 2,
    explanation: 'Man spørger "Hvorfor?" 5 gange (eller flere). Fx: Kunden fik forkert vare → Hvorfor? Plukkeren tog fra forkert hylde → Hvorfor? Skiltet var ulæseligt → Hvorfor? Det var ikke blevet udskiftet → Grundårsag fundet! Så fikser man DÉT.'
},
{
    id: 85,
    category: 'Lean',
    q: 'Hvad er "Mura" i Lean?',
    options: [
        'En type lagerrobot fra Japan',
        'Ujævnhed og variation i processer — ulige fordeling af arbejdsbyrden',
        'Det japanske ord for perfekt kvalitet',
        'Navnet på grundlæggeren af Toyota Production System'
    ],
    correct: 1,
    explanation: 'Mura = ujævnhed. Når arbejdsbyrden svinger — travlt den ene dag, tomt den næste — skaber det kaos og stress. Lean stræber efter jævne flows (Heijunka) for at eliminere Mura. Mura fører ofte til Muda (spild) og Muri (overbelastning).'
},
{
    id: 86,
    category: 'Lean',
    q: 'Hvad er "Muri" i Lean?',
    options: [
        'Overbelastning af maskiner eller medarbejdere ud over hvad der er rimeligt og sikkert',
        'Det japanske ord for smartere arbejde',
        'En forkortelse for Multiple Resource Integration',
        'En metode til at beregne gennemsnitlig arbejdstid'
    ],
    correct: 0,
    explanation: 'Muri = overbelastning. Når man kræver for meget af medarbejdere eller maskiner, stiger risikoen for nedbrud, sygdom og fejl. Lean bekæmper Muda (spild), Mura (ujævnhed) OG Muri (overbelastning) — alle tre hænger sammen.'
},
{
    id: 87,
    category: 'Lean',
    q: 'Hvad er en Ishikawa-diagram (fiskebensdiagram)?',
    options: [
        'En graf over fiskesalg i japanske supermarkeder',
        'Et diagram der viser alle mulige årsager til et problem, organiseret i kategorier som grener fra en fiskerygrad',
        'Et arkitekttegning af et fiskeformet lagerbygning',
        'Et flowdiagram over vandforsyningen i lageret'
    ],
    correct: 1,
    explanation: 'Fiskebensdiagrammet (opfundet af Kaoru Ishikawa) bruges til årsagsanalyse. Problemet er "hovedet", og årsagerne fordeles som "ben" i kategorier: Mennesker, Maskiner, Materialer, Metoder, Miljø, Målinger. Det giver overblik over alle mulige årsager.'
},
{
    id: 88,
    category: 'Lean',
    q: 'Hvad er forskellen på "push" og "pull" i Lean-produktion?',
    options: [
        'Push bruger kun maskiner, pull bruger kun mennesker',
        'Push er hurtigere end pull',
        'Push producerer baseret på prognoser, pull producerer først når kunden bestiller',
        'Der er ingen reel forskel, det er bare to ord for det samme'
    ],
    correct: 2,
    explanation: 'Push: man fremstiller baseret på hvad man TROR der sælges (prognoser). Risiko for overproduktion og store lagre. Pull: man fremstiller først, når der er et reelt behov (ordre/signal). Lean foretrækker pull, da det reducerer spild.'
},

// ============================
// EKSTRA: SUPPLY CHAIN & INDKØB (89-100)
// ============================
{
    id: 89,
    category: 'Supply Chain',
    q: 'Hvad er "Just-in-Sequence" (JIS)?',
    options: [
        'At levere varer præcis i den rækkefølge de skal bruges i produktionen — ikke bare til tiden, men i sekvens',
        'At ordrer behandles i kronologisk rækkefølge',
        'At ansatte arbejder i sekvensielle skift',
        'At lageret tælles op i en bestemt rækkefølge'
    ],
    correct: 0,
    explanation: 'JIS går et skridt videre end JIT. Ikke bare leveres varerne til rette tid — de leveres også i præcis den rækkefølge de skal monteres. Bruges især i bilindustrien, hvor sæder, instrumentpaneler osv. skal passe til den specifikke bil på båndet.'
},
{
    id: 90,
    category: 'Supply Chain',
    q: 'Hvad er et distributionscenter?',
    options: [
        'Et kontor hvor marketingmateriale designes og distribueres til butikker',
        'Et stort lager fokuseret på hurtig modtagelse, sortering og videreforsendelse af varer til butikker eller slutkunder',
        'En afdeling i virksomheden der fordeler opgaver til medarbejderne',
        'Et teknologicenter der distribuerer software til virksomhedens computere'
    ],
    correct: 1,
    explanation: 'Et distributionscenter modtager varer fra producenter, sorterer dem og sender dem hurtigt videre til butikker eller kunder. Fokus er på flow og gennemløb — varer skal ikke ligge længe. Det adskiller sig fra et traditionelt opbevaringslager.'
},
{
    id: 91,
    category: 'Supply Chain',
    q: 'Hvad er "safety stock" (sikkerhedslager) sat i forhold til?',
    options: [
        'Virksomhedens omsætning og antal ansatte',
        'Bygningens brandsikkerhedskrav',
        'Usikkerhed i efterspørgsel, leveringstid og det ønskede serviceniveau',
        'Prisen på den billigste alternativleverandør'
    ],
    correct: 2,
    explanation: 'Sikkerhedslageret beregnes ud fra, hvor usikker efterspørgslen og leveringstiden er, og hvor højt serviceniveau man vil give (fx 95% eller 99% leveringsdygtighed). Højere usikkerhed eller højere servicekrav = mere sikkerhedslager.'
},
{
    id: 92,
    category: 'Supply Chain',
    q: 'Hvad er "postponement" i supply chain?',
    options: [
        'At aflyse alle ordrer i en travl periode',
        'At udskyde den endelige tilpasning af et produkt til så sent som muligt i forsyningskæden',
        'At udskyde leverandørbetaling så længe som muligt',
        'At udsætte ansættelse af nye medarbejdere'
    ],
    correct: 1,
    explanation: 'Postponement: fx lager man en basis-t-shirt uden tryk. Først når ordren kommer ind, trykker man det rigtige design på. Ved at vente med den endelige tilpasning reducerer man risikoen for at producere noget, ingen vil købe.'
},
{
    id: 93,
    category: 'Supply Chain',
    q: 'Hvad er en "single source"-strategi i indkøb?',
    options: [
        'At man kun sælger ét produkt',
        'At man frivilligt vælger kun at købe en bestemt vare fra én leverandør',
        'At man aldrig forhandler priser med leverandører',
        'At man har en enkelt lagerplads for alle varer'
    ],
    correct: 1,
    explanation: 'Single sourcing: man vælger bevidst kun én leverandør for at opbygge et tæt samarbejde, forhandle bedre priser og forenkle logistikken. Risikoen er stor afhængighed — hvis leverandøren fejler, har man ikke et alternativ. Modsat: dual/multi sourcing.'
},
{
    id: 94,
    category: 'Supply Chain',
    q: 'Hvad er "vendor rating"?',
    options: [
        'At kunderne giver stjerner til virksomheden online',
        'En systematisk vurdering og scoring af leverandørers præstation på parametre som pris, kvalitet, levering og service',
        'En pris som leverandøren betaler for at komme på virksomhedens liste',
        'Antallet af maskiner som leverandøren ejer'
    ],
    correct: 1,
    explanation: 'Vendor rating scorer leverandører løbende: overholder de leveringstider? Er kvaliteten i orden? Er priserne konkurrencedygtige? Har de god kommunikation? Det bruges til at vælge de bedste leverandører og frasortere de dårlige.'
},
{
    id: 95,
    category: 'Supply Chain',
    q: 'Hvad er en forsyningskædens "upstream" og "downstream"?',
    options: [
        'Upstream er vandforsyningen til lageret, downstream er kloakken',
        'Upstream er leverandørsiden (indadgående), downstream er kundesiden (udadgående)',
        'Upstream er topledelsen, downstream er lagermedarbejderne',
        'Upstream er morgenholdet, downstream er aftenholdet'
    ],
    correct: 1,
    explanation: 'Upstream = opad i kæden mod leverandører og råvarer. Downstream = nedad mod kunder og slutbrugere. Virksomheden sidder i midten og har upstream leverandører og downstream kunder.'
},
{
    id: 96,
    category: 'Supply Chain',
    q: 'Hvad er "milk run" i logistik?',
    options: [
        'En rute hvor en lastbil kører rundt til flere leverandører og samler gods op, i stedet for at alle leverer hver for sig',
        'En specialtransport kun til mejeriprodukter',
        'En morgenrutine for lagermedarbejdere',
        'En test af lastbilens bremser på glatte veje'
    ],
    correct: 0,
    explanation: 'Milk run (som mælkemanden der kørte rundt): én lastbil kører en fast rute og henter gods hos 5-6 leverandører i stedet for at alle 5-6 leverandører sender hver sin halvtomme lastbil. Det sparer transportomkostninger og er bedre for miljøet.'
},
{
    id: 97,
    category: 'Supply Chain',
    q: 'Hvad er "supply chain visibility"?',
    options: [
        'At lageret har god belysning, så medarbejderne kan se',
        'At man kan se leverandørens fabrik fra virksomhedens vinduer',
        'Evnen til at spore og se status på varer, ordrer og forsendelser i realtid på tværs af hele forsyningskæden',
        'At sælgerne bærer synlige ID-badges'
    ],
    correct: 2,
    explanation: 'Supply chain visibility handler om gennemsigtighed. Man ved hvor varerne er, hvornår de ankommer, og om noget er forsinket — i realtid. Det kræver gode IT-systemer, datadeling og integration mellem partnere. Det reducerer overraskelser og lagerbehov.'
},
{
    id: 98,
    category: 'Supply Chain',
    q: 'Hvad er en ABC-XYZ-analyse?',
    options: [
        'En alfabetiseringsmetode til arkivering af dokumenter',
        'En kombination der klassificerer varer efter værdi (ABC) og efterspørgslens forudsigelighed (XYZ)',
        'En laboratorietest af varekvalitet',
        'En analyse kun brugt i farmaceutisk industri'
    ],
    correct: 1,
    explanation: 'ABC sorterer efter værdi (A = høj). XYZ sorterer efter forudsigelighed (X = stabil, Y = svingende, Z = uforudsigelig). En AX-vare er højværdi med stabil efterspørgsel — nem at styre. En CZ-vare er lavværdi og uforudsigelig — svær at planlægge.'
},
{
    id: 99,
    category: 'Supply Chain',
    q: 'Hvad er "landed cost"?',
    options: [
        'Prisen for at lande et fly med gods i en lufthavn',
        'Den samlede pris for en vare inkl. indkøb, told, afgifter, fragt, forsikring og alle andre udgifter indtil varen er i dit lager',
        'Regningen for grundskyld og ejendomsskat for lagerbygningen',
        'Den pris man betaler for at købe et stykke jord til et nyt lager'
    ],
    correct: 1,
    explanation: 'Landed cost er den reelle totalpris. En vare fra Kina til 10 kr. kan i virkeligheden koste 18 kr. når man lægger fragt, forsikring, told, afgifter, håndtering og transport til lageret oveni. Det er landed cost.'
},
{
    id: 100,
    category: 'Supply Chain',
    q: 'Hvad er en "safety lead time"?',
    options: [
        'Den tid sikkerhedsvagten bruger på at patruljere lageret',
        'Den ekstra tid man lægger oven i den normale leveringstid for at beskytte mod forsinkelser',
        'Tiden det tager at montere sikkerhedsudstyr på en gaffeltruck',
        'Minimum antal timer mellem to skift for medarbejdersikkerhed'
    ],
    correct: 1,
    explanation: 'Sikkerhedstid er en buffer i tid. Hvis normal leveringstid er 5 dage, bestiller man måske allerede efter 3 dage. De 2 ekstra dage er sikkerhedstiden, der beskytter mod forsinkelser. Det er tidens version af sikkerhedslageret.'
},

// ============================
// EKSTRA: TRANSPORT & LEVERINGSBETINGELSER (101-108)
// ============================
{
    id: 101,
    category: 'Transport',
    q: 'Hvad er en "full truck load" (FTL)?',
    options: [
        'Når lastbilen er overfyldt og kører ulovligt',
        'En forsendelse der fylder hele lastbilen — én afsender, én modtager',
        'En bestemt type truck der kun bruges ved fuld kapacitet',
        'Et certifikat truckchauffører modtager efter uddannelse'
    ],
    correct: 1,
    explanation: 'FTL: én afsender fylder hele lastbilen, der kører direkte til én modtager. Det er billigere per kilo end LTL (Less Than Truckload), fordi der ikke er omlastning og sortering undervejs.'
},
{
    id: 102,
    category: 'Transport',
    q: 'Hvad er "LTL" (Less Than Truckload)?',
    options: [
        'En forsendelse der er for tung til en lastbil og kræver specialtransport',
        'En forsendelse der ikke fylder en hel lastbil — flere kunders gods kombineres',
        'En lastbil der er lettere end normalt pga. special materialer',
        'Et udtryk for godstransport med lette varebiler under 3,5 ton'
    ],
    correct: 1,
    explanation: 'LTL samler flere kunders varer på samme lastbil. Det er billigere for den enkelte, men tager længere tid pga. stop og omlastning. Det passer til forsendelser der er for store til pakkepost men for små til at fylde en hel lastbil.'
},
{
    id: 103,
    category: 'Transport',
    q: 'Hvad er et B/L (Bill of Lading)?',
    options: [
        'En faktura for benzin til lastbiler',
        'Et konnossement — et transportdokument ved søfragt der er bevis for fragtaftalen og varernes modtagelse',
        'En licens til at drive ballastvands-rensningsanlæg',
        'En forsikringspolice for lastbilchauffører'
    ],
    correct: 1,
    explanation: 'Bill of Lading (konnossement) er det vigtigste dokument i søfragt. Det er: 1) bevis for fragtaftalen, 2) kvittering for at godset er modtaget af rederiet, 3) et dokument der giver ret til udlevering af godset ved destinationen.'
},
{
    id: 104,
    category: 'Leveringsbetingelser',
    q: 'Hvad betyder Incoterm "CIF" (Cost, Insurance and Freight)?',
    options: [
        'Kunden betaler alle omkostninger fra fabrik til levering',
        'Sælger betaler varens pris, forsikring og fragt til ankomsthavnen, men risiko overgår ved lastning',
        'Begge parter deler alle omkostninger 50/50',
        'CIF har ingen standard betydning og forhandles frit'
    ],
    correct: 1,
    explanation: 'CIF: sælger betaler varen, forsikring og fragt til destinationshavnen. MEN: risikoen overgår til køber allerede når varen lastes på skibet i afgangshavnen. Bruges kun ved sø- og indenlandsvandtransport.'
},
{
    id: 105,
    category: 'Leveringsbetingelser',
    q: 'Hvad betyder Incoterm "FOB" (Free On Board)?',
    options: [
        'Kunden afhenter varen frit på fabrikken',
        'Varen leveres gratis til modtagerens kontor',
        'Sælger leverer varen om bord på skibet — risikoen overgår til køber når varen er lastet',
        'Varen leveres frit til den første omlastningsstation'
    ],
    correct: 2,
    explanation: 'FOB: sælger bærer alle risici og omkostninger indtil varen er lastet om bord. Derefter overtager køber. Bruges kun til sø- og indlandsvandtransport. FOB er en af de mest kendte og brugte Incoterms.'
},
{
    id: 106,
    category: 'Leveringsbetingelser',
    q: 'Hvad er en "franco-grænse" i en leveringsaftale?',
    options: [
        'Landegrænsen mellem to EU-lande',
        'Det minimumsbeløb en ordre skal have før leverandøren betaler fragten',
        'Den fysiske grænsemarkering omkring leverandørens fabriksområde',
        'Grænsen for hvor mange varer man må købe ad gangen'
    ],
    correct: 1,
    explanation: 'Franco-grænsen er typisk et beløb, fx 5.000 kr. Bestiller du for over 5.000 kr., betaler leverandøren fragten (franco). Under 5.000 kr. betaler du selv (ufranco). Det motiverer kunder til at samle ordrer og bestille større mængder.'
},
{
    id: 107,
    category: 'Transport',
    q: 'Hvad er et TMS (Transportation Management System)?',
    options: [
        'Et termometerstyringsystem til køletransport',
        'En type truckmotor specifikt til store lagre',
        'Et IT-system til planlægning, udførelse og optimering af godstransport',
        'Et manuelt tidsmålingssystem for chauffører'
    ],
    correct: 2,
    explanation: 'TMS er software der hjælper med at planlægge den bedste rute, vælge den billigste fragtmulighed, booke transportører, spore forsendelser og analysere transportomkostninger. Det er transportens svar på WMS for lageret.'
},
{
    id: 108,
    category: 'Transport',
    q: 'Hvad er "pallebytte" (pallet exchange)?',
    options: [
        'At man bytter en gammel palle ud med en ny for ekstra betaling',
        'At chaufføren og modtageren bytter lige mange paller: for hver fyldt palle der aflæsses, gives en tom palle tilbage',
        'At man bytter varer mellem to paller for at optimere pladsudnyttelsen',
        'At man sender paller til genbrug hos en palleproducent'
    ],
    correct: 1,
    explanation: 'I pallebytteordninger (typisk EUR-paller) giver modtageren tomme paller tilbage for hver fyldte palle, der leveres. Det sikrer et cirkulært flow af paller, og ingen ender med at mangle. Det er standard praksis med EUR/EPAL-paller.'
},

// ============================
// EKSTRA: SIKKERHED & MILJØ (109-115)
// ============================
{
    id: 109,
    category: 'Sikkerhed',
    q: 'Hvad betyder GHS i sikkerhedssammenhæng?',
    options: [
        'General Health Standard — et frivilligt sundhedsprogram for lagre',
        'Globally Harmonized System — et internationalt system til klassificering og mærkning af kemikalier',
        'Green House Safety — en miljøcertificering for lagerbygninger',
        'Ground Handling Services — krav til godshåndtering i lufthavne'
    ],
    correct: 1,
    explanation: 'GHS er et verdensomspændende system der giver standardiserede symboler, signalord og sætninger til at kommunikere kemiske farer. De rødkantede ruder med symboler (flammer, dødningehoved osv.) er GHS-piktogrammer.'
},
{
    id: 110,
    category: 'Sikkerhed',
    q: 'Hvad er en APV (Arbejdspladsvurdering)?',
    options: [
        'En opgørelse over virksomhedens samlede aktivværdi',
        'En vurdering af medarbejdernes lønninger i forhold til markedet',
        'En systematisk gennemgang af arbejdsmiljøet for at finde og forebygge risici',
        'En vurdering af lagerets ejendomsværdi'
    ],
    correct: 2,
    explanation: 'APV er lovpligtig i Danmark. Virksomheden skal regelmæssigt vurdere alle arbejdsmiljøforhold: fysiske, psykiske, kemiske og ergonomiske risici. Formålet er at forebygge ulykker og arbejdsrelaterede sygdomme.'
},
{
    id: 111,
    category: 'Sikkerhed',
    q: 'Hvor mange fareklasser har ADR-systemet?',
    options: [
        '3 klasser',
        '5 klasser',
        '9 klasser',
        '13 klasser'
    ],
    correct: 2,
    explanation: '9 ADR-fareklasser: 1) Eksplosiver, 2) Gasser, 3) Brandfarlige væsker, 4) Brandfarlige faste stoffer, 5) Oxiderende stoffer, 6) Giftige stoffer, 7) Radioaktivt, 8) Ætsende stoffer, 9) Diverse farlige stoffer. Hver klasse har underklasser.'
},
{
    id: 112,
    category: 'Sikkerhed',
    q: 'Hvad er en nær-ved ulykke?',
    options: [
        'En ulykke der skete for lang tid siden',
        'En hændelse der kunne have ført til en ulykke, men ingen kom til skade denne gang',
        'En ulykke der kun rammer vikarer, ikke fastansatte',
        'En ulykke der sker i nærheden af lageret, men uden for virksomhedens grund'
    ],
    correct: 1,
    explanation: 'En nær-ved ulykke er en advarsel. Fx falder en kasse ned, men rammer ingen. Næste gang er man måske ikke så heldig. Derfor skal nær-ved ulykker rapporteres og undersøges, så man forebygger den rigtige ulykke.'
},
{
    id: 113,
    category: 'Sikkerhed',
    q: 'Hvad er max tilladelig løftemasse for én person ifølge Arbejdstilsynets vejledning?',
    options: [
        'Der er ingen grænse, bare man bruger korrekt teknik',
        'Op til 50 kg under alle omstændigheder',
        'Op til 25 kg under optimale forhold (tæt ved kroppen, god højde, køn/fysik vurderes)',
        'Præcis 10 kg uanset omstændighederne'
    ],
    correct: 2,
    explanation: 'Arbejdstilsynet anbefaler max ca. 25 kg under optimale forhold (byrde tæt på kroppen, i god højde, uden vridning). Ved dårlige forhold (rækkeafstand, vridning, højde, hyppighed) sænkes grænsen til 12 kg eller mindre.'
},
{
    id: 114,
    category: 'Sikkerhed',
    q: 'Hvad skal man gøre FØRST ved en arbejdsulykke på lageret?',
    options: [
        'Ringe til forsikringsselskabet',
        'Sørge for at sikre ulykkesstedet og yde førstehjælp',
        'Skrive en rapport til ledelsen',
        'Tage billeder til sociale medier'
    ],
    correct: 1,
    explanation: 'Først: sørg for sikkerheden (stop farekilden, afspær området). Yd førstehjælp. Ring 112 ved alvorlige skader. Derefter: rapportér ulykken, dokumentér og undersøg årsagen for at forebygge gentagelse.'
},
{
    id: 115,
    category: 'Sikkerhed',
    q: 'Hvad er formålet med gangbredde-krav i et lager?',
    options: [
        'At sikre nok plads til at dekorere gangene med planter og kunst',
        'At sørge for der er plads til truckturning, sikker passage af personer og overholdelse af brandveje',
        'At give plads til at parkere medarbejdernes biler inde i lageret',
        'Gangbredden har ingen praktisk betydning'
    ],
    correct: 1,
    explanation: 'Korrekt gangbredde sikrer at gaffeltrucks kan manøvrere sikkert, at medarbejdere kan passere, og at brandveje er frie. For smalle gange kræves smalgangs-trucks. For brede gange bruges modvægtstruck. Branddøre og nødudgange må ALDRIG blokeres.'
},

// ============================
// EKSTRA: VIRKSOMHED & ØKONOMI (116-120)
// ============================
{
    id: 116,
    category: 'Virksomhed',
    q: 'Hvad er formålet med en SWOT-analyse?',
    options: [
        'At beregne virksomhedens skatteforpligtelser',
        'At vurdere virksomhedens Strengths, Weaknesses, Opportunities og Threats — styrker, svagheder, muligheder og trusler',
        'At sortere medarbejdere efter kompetenceniveau',
        'At planlægge virksomhedens sommerfest'
    ],
    correct: 1,
    explanation: 'SWOT giver et strategisk overblik. Styrker og svagheder er interne (hvad er vi gode/dårlige til?). Muligheder og trusler er eksterne (hvad sker i markedet?). Det bruges til at planlægge strategien og prioritere indsatser.'
},
{
    id: 117,
    category: 'Virksomhed',
    q: 'Hvad er "kapitalbinding" i lagersammenhæng?',
    options: [
        'Pengene der er brugt til at købe lagerbygningen',
        'De penge der er bundet i varer på lageret og ikke kan bruges til andet, før varerne er solgt',
        'Et investeringsbevis fra banken',
        'Udgiften til at binde paller sammen med plastfolie'
    ],
    correct: 1,
    explanation: 'Når du har varer for 1 mio. kr. på lageret, er 1 mio. kr. "frosset" — de kan ikke bruges til investeringer, markedsføring eller lønninger. Jo mere lager, jo mere kapital er bundet. Derfor er det dyrt at have for stort lager.'
},
{
    id: 118,
    category: 'Virksomhed',
    q: 'Hvad er "throughput" i et lager?',
    options: [
        'Gennemstrømningen — den samlede mængde varer der modtages, behandles og sendes videre per tidsenhed',
        'Det hul i væggen man kører gaffeltrucken igennem',
        'Antallet af pauser medarbejderne gennemfører på en dag',
        'Den tid en medarbejder bruger på at gå hele vejen igennem lageret'
    ],
    correct: 0,
    explanation: 'Throughput er mængden af varer der "flyder igennem" lageret. Fx 500 ordrer per dag eller 200 paller per time. Højere throughput med samme ressourcer = højere produktivitet. Det er en af de vigtigste KPIer for lagerdrift.'
},
{
    id: 119,
    category: 'Virksomhed',
    q: 'Hvad er leveringspræcision som KPI?',
    options: [
        'Hvor mange leveringer der ankommer i ét stykke uden skader',
        'Procentdelen af ordrer der leveres til kunden til den aftalte tid med det rigtige indhold',
        'Gennemsnitshastigheden på leveringsbilerne i km/t',
        'Antal leverancer per chauffør per uge'
    ],
    correct: 1,
    explanation: 'Leveringspræcision (OTIF — On Time In Full) måler om kunden får den rigtige vare, i den rigtige mængde, til den aftalte tid. Det er en afgørende KPI, fordi den viser kundetilfredsheden direkte. Mål: typisk 95%+ for gode virksomheder.'
},
{
    id: 120,
    category: 'Virksomhed',
    q: 'Hvad er en reklamation?',
    options: [
        'En reklame i et fagblad for lager og logistik',
        'En kundes officielle klage over en vare eller leverance der ikke lever op til det aftalte',
        'En invitation til virksomhedens jubilæumsfest',
        'En positiv kundeanmeldelse på virksomhedens hjemmeside'
    ],
    correct: 1,
    explanation: 'En reklamation er en formel klage. Kunden informerer leverandøren om fejl: forkert vare, beskadiget gods, manglende enheder, for sen levering. Reklamationer skal håndteres hurtigt og registreres for at forbedre fremtidige processer.'
},

// ============================
// EKSTRA: LAGERSTYRING AVANCERET (121-135)
// ============================
{
    id: 121,
    category: 'Lagerstyring',
    q: 'Hvad er en cyklusoptælling?',
    options: [
        'En årlig optælling af alle varer på lageret samtidigt',
        'En løbende optælling hvor man tæller en del af lageret ad gangen, fordelt over hele året',
        'En optælling af antal cykler parkeret foran lageret',
        'En optælling der kun foretages, når der opdages fejl'
    ],
    correct: 1,
    explanation: 'Cyklusoptælling (cycle counting) er en løbende metode, hvor man tæller en lille del af lageret hver dag — typisk styret af ABC-klassificering. A-varer tælles oftere end C-varer. Det erstatter den store, forstyrrende årsoptælling.'
},
{
    id: 122,
    category: 'Lagerstyring',
    q: 'Hvad er en EUR-palle (EPAL)?',
    options: [
        'En palle med målene 120 × 80 cm, standardiseret i Europa med mærkerne EUR og EPAL',
        'En specialpalle lavet af genanvendt plast fra Europa',
        'En palle der kan modstå eurofarve kemikalier',
        'En palle der kun anvendes i euroområdet og ikke i Norden'
    ],
    correct: 0,
    explanation: 'EUR-pallen (120 × 80 cm) er den mest brugte palle i Europa. Den er standardiseret, kan holde op til 1.500 kg, og indgår i et bytteordning (pallecirkulering). Den er mærket med EUR og EPAL og fremstillet efter faste kvalitetskrav.'
},
{
    id: 123,
    category: 'Lagerstyring',
    q: 'Hvad er en halvpalle?',
    options: [
        'En palle der er halvt ødelagt og skal kasseres',
        'En palle med målene 80 × 60 cm, ofte brugt til displayformål i butikker',
        'En palle der kun bruges i halvdelen af året',
        'En palle lastet til halvdelen af sin kapacitet'
    ],
    correct: 1,
    explanation: 'Halvpallen (80 × 60 cm) er præcis en halv EUR-palle. Den bruges ofte til butiksdisplay — man kører den direkte ud i butikken med varer på. Det sparer ompakning og opstilling. Optimeret til at passe i standard EUR-pallereol.'
},
{
    id: 124,
    category: 'Lagerstyring',
    q: 'Hvad er en WMS "put-away" strategi?',
    options: [
        'Regler for hvornår varer skal kasseres og smides ud',
        'Systemets logik for hvor indgående varer skal placeres i lageret',
        'En metode til at fjerne defekte varer fra salg',
        'En backup-plan for hvad der sker, hvis WMS-systemet fejler'
    ],
    correct: 1,
    explanation: 'Put-away strategien bestemmer automatisk, hvor varer skal stilles hen. Fx: A-varer i golden zone, tunge varer i bund, temperaturkrævende i kølezone, farligt gods i farligt-gods-zone. Det optimerer pladsudnyttelse og plukkadgang.'
},
{
    id: 125,
    category: 'Lagerstyring',
    q: 'Hvad er "slotting" i lagersammenhæng?',
    options: [
        'At indsætte mønter i automater på lageret',
        'At udvælge det optimale tidsslot for levering',
        'Den analytiske proces med at bestemme den bedste placering af hver vare i lageret for at optimere plukning',
        'At skære spalter i emballage for at sikre ventilation'
    ],
    correct: 2,
    explanation: 'Slotting optimerer hvor hver SKU står i lageret. Hurtigtløbende varer placeres tæt på pakkebordet i golden zone. Tungere varer i bund. Varer der ofte bestilles sammen, placeres tæt på hinanden. Det reducerer gangafstand og pluktid markant.'
},
{
    id: 126,
    category: 'Lagerstyring',
    q: 'Hvad er "pick-to-light"?',
    options: [
        'Et system der vejer varer ved hjælp af lysbaseret teknologi',
        'En metode der bruger lysindikatorer på hylderne til at guide plukkeren til den rigtige vare og mængde',
        'En dimmer-funktion til lagerlys for at spare energi',
        'En type lommelygte godkendt til brug på lageret'
    ],
    correct: 1,
    explanation: 'Pick-to-light: en lampe lyser op ved den hylde, plukkeren skal plukke fra, og et display viser antal. Plukkeren trykker på en knap efter plukning. Det er hurtigt, reducerer fejl, og kræver ingen papir eller scanner. Brugt i højfreklvente plukzoner.'
},
{
    id: 127,
    category: 'Lagerstyring',
    q: 'Hvad er "voice picking"?',
    options: [
        'En metode hvor medarbejderne stemmer om hvilke ordrer der skal plukkes først',
        'En plukmetode hvor plukkeren modtager instruktioner via en hovedtelefon og bekræfter mundtligt',
        'En sangkonkurrence afholdt i frokosten for at øge moralen',
        'Et stemmestyringssystem til lagerlys og temperatur'
    ],
    correct: 1,
    explanation: 'Voice picking: plukkeren bærer et headset og modtager instrukser via tale — "gå til lokation A-03-2, pluk 5 stk." Plukkeren bekræfter ved at sige et kontroltal. Begge hænder er fri til at plukke. Fejlraten falder typisk med 25-50% sammenlignet med papirlister.'
},
{
    id: 128,
    category: 'Lagerstyring',
    q: 'Hvad er batch picking?',
    options: [
        'En plukmetode hvor man samler varer til flere ordrer samtidigt i én tur gennem lageret',
        'En metode kun brugt til at plukke bagerivarer i batches',
        'At plukke alle ordrer i den rækkefølge de blev modtaget',
        'At plukke varer der har samme batchnummer eller udløbsdato'
    ],
    correct: 0,
    explanation: 'Batch picking: plukkeren samler varer til 10-20 ordrer ad gangen i én runde. Fx plukker man alle bestilte tusch fra hylde B-12 til alle ordrer i stedet for at gå til B-12 separat for hver ordre. Det reducerer gangafstand dramatisk.'
},
{
    id: 129,
    category: 'Lagerstyring',
    q: 'Hvad er zone picking?',
    options: [
        'Når plukkere kun er ansvarlige for at plukke varer i deres tildelte zone af lageret',
        'At opdele lageret i zoner baseret på temperatur',
        'En plukmetode der kun bruges i zoologiske haver',
        'At plukke varer baseret på tidszoner for internationale kunder'
    ],
    correct: 0,
    explanation: 'Zone picking: lageret opdeles i zoner, og hver plukker plukker kun i sin zone. Ordren bevæger sig fra zone til zone ("pick and pass") eller zonerne plukker parallelt og samles bagefter. Det reducerer gangafstand og øger specialisering.'
},
{
    id: 130,
    category: 'Lagerstyring',
    q: 'Hvad er cross-docking?',
    options: [
        'Når varer krydser en bro over vand under transport',
        'At varer modtages på den ene side af lageret og sendes direkte ud fra den anden uden at blive opbevaret',
        'At skibscontainere flyttes fra skibssiden til landsiden af en havn',
        'En metode til at parkere lastbiler på tværs i stedet for langs'
    ],
    correct: 1,
    explanation: 'Cross-docking: varer modtages, sorteres og sendes videre inden for timer — de opbevares ikke. Indleveringsdokker på den ene side, udleveringsdokker på den modsatte. Det reducerer lageromkostninger og gennemløbstid dramatisk. Bruges fx i detailhandel.'
},
{
    id: 131,
    category: 'Lagerstyring',
    q: 'Hvad er en SKU (Stock Keeping Unit)?',
    options: [
        'Et forsikringskrav til lager- og logistikbranche',
        'En entydig identifikationskode der repræsenterer én specifik varetype i lagersystemet',
        'En type lagerreol fremstillet i Sverige',
        'En forkortelse for den skandinaviske krone-enhed'
    ],
    correct: 1,
    explanation: 'SKU er varenummeret — en unik kode for hver enkelt varetype. Fx er en blå t-shirt i størrelse L én SKU, mens den samme t-shirt i M er en anden SKU. Et typisk lager har tusindvis af SKUer.'
},
{
    id: 132,
    category: 'Lagerstyring',
    q: 'Hvad er en kolli?',
    options: [
        'En type trælim til emballagebrug',
        'En samlet enhed af gods — fx en kasse, en sæk, en tønde eller et bundt der kan håndteres som ét styk',
        'En kollegial betegnelse for en lagermedarbejder',
        'En type sikkerhedshjelm specielt til lagerarbejdere'
    ],
    correct: 1,
    explanation: 'Kolli (flertal: kolli eller kollis) er den mindste håndterbare enhed af gods. Én kolli kan være en kasse, en sæk, en tromle eller et bundt. Følgesedler og fragtbreve angiver antal kolli, så man kan kontrollere at alt er med.'
},
{
    id: 133,
    category: 'Lagerstyring',
    q: 'Hvad er en SSCC (Serial Shipping Container Code)?',
    options: [
        'En kode til at låse containere op i havne',
        'En 18-cifret unik stregkode til at identificere en individuel palle, kasse eller forsendelse i hele forsyningskæden',
        'Et sikkerhedscertifikat for containerskibe',
        'En forkortelse for Standard Safety Control Check'
    ],
    correct: 1,
    explanation: 'SSCC er en unik 18-cifret GS1-kode der identificerer én fysisk logistisk enhed (fx en palle). Den gør det muligt at spore pallen digitalt gennem hele forsyningskæden — fra producent til lager til butik.'
},
{
    id: 134,
    category: 'Lagerstyring',
    q: 'Hvad er shrink-wrap?',
    options: [
        'En psykologisk behandlingsmetode for stressede lagerchefer',
        'En type lagerreol der kan skrumpe i størrelse',
        'Klar plastfolie der vikles stramt om varer eller en palle for at sikre lasten under transport',
        'En rengøringsmetode til lagergulve'
    ],
    correct: 2,
    explanation: 'Shrink-wrap (stretchfolie) vikles rundt om pallen eller varerne for at holde dem samlet og stabile under transport. Det beskytter mod fugt, støv og tyveri, og forhindrer at varer forskubber sig. Kan også varmesvejses til tæt forsegling.'
},
{
    id: 135,
    category: 'Lagerstyring',
    q: 'Hvad er forskellen på kaotisk og fast lokation i et lager?',
    options: [
        'Kaotisk bruger robotter, fast bruger mennesker',
        'Kaotisk lager: varer placeres på den først ledige plads. Fast lokation: hver vare har en fast tildelt hylde',
        'Kaotisk er et midlertidigt lager, fast er permanent',
        'Der er ingen forskel — det er to ord for det samme'
    ],
    correct: 1,
    explanation: 'Kaotisk (randomiseret/dynamisk) lokation: WMS bestemmer, hvor varen placeres — hvor der er plads. Giver bedre pladsudnyttelse. Fast lokation: SKU A er altid på plads B-04. Nemmere at finde manuelt, men lavere pladsudnyttelse, da tomme pladser reserveres.'
},

// ============================
// EKSTRA: ERP & IT SYSTEMER (136-148)
// ============================
{
    id: 136,
    category: 'ERP & IT',
    q: 'Hvad er forskellen på ERP og WMS?',
    options: [
        'ERP og WMS er det samme system, bare med forskellige navne',
        'ERP styrer hele virksomheden (økonomi, salg, HR osv.), mens WMS er specialiseret til at styre lageroperationer som plukning, placering og optælling',
        'WMS er en dyrere version af ERP',
        'ERP bruges kun af store virksomheder, WMS kun af små'
    ],
    correct: 1,
    explanation: 'ERP (Enterprise Resource Planning) er virksomhedens hovedsystem til alt: økonomi, salg, indkøb, produktion, HR. WMS (Warehouse Management System) er special-software til selve lagerdriften. De to systemer integreres ofte, så ordrer flyder automatisk.'
},
{
    id: 137,
    category: 'ERP & IT',
    q: 'Hvad er EDI (Electronic Data Interchange)?',
    options: [
        'En type USB-stik til lagercomputere',
        'En standardiseret elektronisk udveksling af forretningsdokumenter (ordrer, fakturaer, følgesedler) mellem virksomheder',
        'En energibesparende dimmerfunktion til lagerlys',
        'Et internt e-mail system kun til lagermedarbejdere'
    ],
    correct: 1,
    explanation: 'EDI sender forretningsdokumenter automatisk mellem virksomheders systemer. Fx sender kundens ERP automatisk en indkøbsordre til leverandørens ERP — ingen manuelle e-mails eller faxer. Det sparer tid, reducerer fejl og øger hastigheden i forsyningskæden.'
},
{
    id: 138,
    category: 'ERP & IT',
    q: 'Hvad er en RFID-tag?',
    options: [
        'En type klistermærke med virksomhedens logo til markedsføring',
        'En lille chip med antenne der kan sende produktdata trådløst uden at scanneren behøver direkte synscontakt',
        'Et manuelt skrevet prisskilt på varer i butikken',
        'En type USB-flashdrev til lagerstyringssoftware'
    ],
    correct: 1,
    explanation: 'RFID (Radio Frequency Identification): en chip sender data via radiobølger. Fordel over stregkode: man kan scanne mange tags på én gang og behøver ikke sigte direkte på dem. Man kan tælle en hel palle på sekunder. Bruges i lager, butik, produktion og logistik.'
},
{
    id: 139,
    category: 'ERP & IT',
    q: 'Hvad er IoT (Internet of Things) i lagersammenhæng?',
    options: [
        'Et socialt medie kun for lager- og logistikfolk',
        'Sensorer og enheder i lageret der er koblet til internettet og leverer realtidsdata om temperatur, fugtighed, beholdning, lokation osv.',
        'Et onlinebutikssystem til at sælge lagerudstyr',
        'Et programmeringssprog til lagerrobotter'
    ],
    correct: 1,
    explanation: 'IoT i lageret: temperatursensorer i kølezoner, vægtsensorer på hylder (giver alarm når stock er lav), GPS på gaffeltrucks, RFID-porte der automatisk registrerer varer der passerer. Alt sender data til et dashboard — man kan overvåge lageret i realtid.'
},
{
    id: 140,
    category: 'ERP & IT',
    q: 'Hvad er en GS1-128 (tidligere EAN-128) stregkode?',
    options: [
        'En type stregkode kun brugt i 128 lande',
        'En stregkode der kun kan scanne priser',
        'En avanceret stregkode der kan indeholde mange typer data: batchnummer, udløbsdato, vægt, serienummer osv.',
        'En kode til at låse op for premium-funktioner i WMS-software'
    ],
    correct: 2,
    explanation: 'GS1-128 bruger Application Identifiers (AI) til at kode mange informationer i én stregkode. AI(01) = varenummer, AI(10) = batchnummer, AI(17) = udløbsdato, AI(310x) = nettovægt osv. Den er vigtig for sporbarhed i fødevarer og medicin.'
},
{
    id: 141,
    category: 'ERP & IT',
    q: 'Hvad er en QR-kode i logistiksammenhæng?',
    options: [
        'En forkortelse for "Quality Rating" — en kvalitetskode',
        'En todimensionel stregkode der kan indeholde langt mere data end en traditionel stregkode og scannes med en smartphone',
        'En kode for at rate en leverandørs kvartalspræstation',
        'En type alarm-kode der aktiveres ved tyveri'
    ],
    correct: 1,
    explanation: 'QR (Quick Response) koder er 2D-stregkoder der kan lagre tusindvis af tegn: URL, serienumre, produktinfo, sporingsdata. De kan scannes med en almindelig smartphone. Bruges til track-and-trace, produktinformation og hurtig registrering.'
},
{
    id: 142,
    category: 'ERP & IT',
    q: 'Hvad er "master data" i et ERP-system?',
    options: [
        'Data der kun er tilgængelig for virksomhedens direktør',
        'De grundlæggende stamdata som varer, kunder, leverandører og priser — den faste data som transaktioner bygger på',
        'Historisk data om alle transaktioner de seneste 10 år',
        'Data om virksomhedens mesterlærlinge'
    ],
    correct: 1,
    explanation: 'Master data (stamdata) er den grundlæggende information: varenumre, varebeskrivelser, priser, leverandøradresser, kundedata. Det er fundamentet. Alle transaktioner (ordrer, fakturaer, pluk) refererer til stamdata. Dårlig stamdata → fejl overalt.'
},
{
    id: 143,
    category: 'ERP & IT',
    q: 'Hvad er et MRP-system (Material Requirements Planning)?',
    options: [
        'Et system til planlægning og styring af materialebehov baseret på styklister, lagerstatus og produktionsplaner',
        'Et system til at registrere medarbejdernes pauser',
        'Et system til at reservere mødelokaler i virksomheden',
        'Et system til mappestruktur på virksomhedens filserver'
    ],
    correct: 0,
    explanation: 'MRP besvarer: Hvad skal vi bruge? Hvor meget? Hvornår? Ved at kende produktionsplanen, styklisterne og lagerstatus beregner MRP, hvad der skal bestilles hvornår. Det sikrer at materialer er klar til produktion — hverken for tidligt eller for sent.'
},
{
    id: 144,
    category: 'ERP & IT',
    q: 'Hvad er en "pick list" (plukliste)?',
    options: [
        'En liste over medarbejdere til udvælgelse ved fyring',
        'En prioriteret liste over lagerforbedringsprojekter',
        'Et dokument eller digitalt display der viser plukkeren præcis hvilke varer, mængder og lokationer der skal plukkes til en ordre',
        'En liste over de mest populære varer i webshoppen'
    ],
    correct: 2,
    explanation: 'Pluklisten genereres af WMS og fortæller plukkeren: gå til lokation A-05-3, pluk 2 stk. varenummer 4711, dernæst til B-12-1 for 1 stk. varenummer 8800. Den optimerer ofte ruten gennem lageret for at minimere gangafstand.'
},
{
    id: 145,
    category: 'ERP & IT',
    q: 'Hvad er et YMS (Yard Management System)?',
    options: [
        'Et system til at styre havebeplantning ved lagerbygningen',
        'Et system til at styre og optimere aktiviteter på virksomhedens udendørs pladsområde: lastbilparkering, dockbooking, traileradministration',
        'Et system der måler gårdafstande mellem lagerbygninger',
        'Et system til forvaltning af virksomhedens ejendomsportefølje'
    ],
    correct: 1,
    explanation: 'YMS styrer alt på "gårdspladsen" (yard): hvilke trailere holder hvor, hvornår de skal til and fra dock, prioritering af lastning/losning. Det reducerer ventetider for chauffører og sikrer, at de rigtige trailere er ved de rigtige porte til tiden.'
},
{
    id: 146,
    category: 'ERP & IT',
    q: 'Hvad er barcoding versus RFID — den vigtigste forskel?',
    options: [
        'Stregkode kræver direkte synslinje og scanner én ad gangen; RFID kan scanne mange tags trådløst uden synslinje',
        'RFID er billigere end stregkode',
        'Stregkode er nyere teknologi end RFID',
        'Der er ingen funktionel forskel — det er samme teknologi med to navne'
    ],
    correct: 0,
    explanation: 'Stregkode: scanner skal "se" koden direkte, og man scanner én ad gangen. RFID: radiobølger, ingen synslinje nødvendig, kan scanne hundredvis af tags på få sekunder. RFID er dyrere per tag, men sparer enormt på arbejdstiden ved masseaflæsning.'
},
{
    id: 147,
    category: 'ERP & IT',
    q: 'Hvad er "blockchain" potentielt brugt til i supply chain?',
    options: [
        'At bygge fysiske kæder til at låse containere',
        'At spore varer uforanderligt og gennemsigtigt gennem hele forsyningskæden, da data ikke kan ændres bagefter',
        'At blokere uautoriseret adgang til lagerbygninger',
        'At kæde lastbiler sammen i konvojer for brændstofbesparelse'
    ],
    correct: 1,
    explanation: 'Blockchain i supply chain: hver transaktion (produktion, forsendelse, modtagelse) registreres i en kæde, der ikke kan manipuleres. Det giver fuld sporbarhed — fx kan man bevise at en fisk er fanget bæredygtigt, eller at en medicin er ægte.'
},
{
    id: 148,
    category: 'ERP & IT',
    q: 'Hvad er en "digital twin" i lagersammenhæng?',
    options: [
        'En kopi af lagerchefens adgangskort til nødsituationer',
        'En virtual reality-oplevelse til medarbejdertræning',
        'En digital, realtidsopdateret kopi af det fysiske lager, brugt til simulering, optimering og overvågning',
        'Et backup-lager i en anden by'
    ],
    correct: 2,
    explanation: 'En digital twin er en digital model af lageret der opdateres i realtid. Man kan simulere ændringer — fx hvad sker der, hvis vi omplacerer alle A-varer? — uden at forstyrre det rigtige lager. Det giver datadrevet optimering uden risiko.'
},

// ============================
// EKSTRA: LEVERINGSBETINGELSER & DOKUMENTER (149-160)
// ============================
{
    id: 149,
    category: 'Leveringsbetingelser',
    q: 'Hvad er Incoterm "EXW" (Ex Works)?',
    options: [
        'Sælger leverer varen helt til kundens dør inkl. al forsikring',
        'Varen stilles til rådighed hos sælger — køber bærer alle omkostninger og risici fra det øjeblik',
        'Varen sendes ekspres med garanti for levering næste dag',
        'Sælger betaler fragt til nærmeste grænseovergang'
    ],
    correct: 1,
    explanation: 'EXW er den "mindste" forpligtelse for sælger: varen står klar på lager/fabrik, køber henter den og betaler ALT selv — lastning, transport, told, forsikring. Sælgers eneste pligt er at gøre varen tilgængelig.'
},
{
    id: 150,
    category: 'Leveringsbetingelser',
    q: 'Hvad er Incoterm "DDP" (Delivered Duty Paid)?',
    options: [
        'Køber betaler alle told- og afgiftsomkostninger selv',
        'Sælger leverer varen helt til købers adresse med alt betalt inkl. told, afgifter og transport — køber gør intet',
        'Fragten betales af en tredjepart (speditør)',
        'Varen leveres fortoldet men afhentes selv'
    ],
    correct: 1,
    explanation: 'DDP er den "største" forpligtelse for sælger — og det modsatte af EXW. Sælger betaler ALT: transport, forsikring, told, afgifter, levering til dør. Køber skal bare modtage varen. Det er den dyreste Incoterm for sælger.'
},
{
    id: 151,
    category: 'Leveringsbetingelser',
    q: 'Hvad er Incoterm "DAP" (Delivered At Place)?',
    options: [
        'Sælger leverer varen til den aftalte destination, klar til aflæsning — men køber betaler tolden',
        'Køber henter varen på lufthavnen',
        'Varen leveres til midtpunktet mellem sælger og køber',
        'Sælger leverer til nærmeste havn og stopper der'
    ],
    correct: 0,
    explanation: 'DAP: sælger betaler transport til den aftalte destination og bærer risikoen frem til varen er klar til aflæsning. Men importtold og -afgifter er købers ansvar. Det adskiller DAP fra DDP, hvor sælger også betaler tolden.'
},
{
    id: 152,
    category: 'Leveringsbetingelser',
    q: 'Hvad er Incoterm "FCA" (Free Carrier)?',
    options: [
        'Varen er gratis for alle transportører',
        'Sælger leverer varen til den af køber anviste fragtfører eller et navngivet sted — risikoen overgår ved overlevering',
        'Varen transporteres med gratis fragtskib',
        'Fragten betales i afdrag uden renter'
    ],
    correct: 1,
    explanation: 'FCA er meget fleksibel: man aftaler et overgivelsessted (fx sælgers rampe, en transportterminal, en lufthavn). Når varen leveres til fragtføreren dér, overgår risiko og ansvar til køber. FCA bruges til alle transportformer.'
},
{
    id: 153,
    category: 'Leveringsbetingelser',
    q: 'Hvad er en proforma-faktura?',
    options: [
        'En falsk faktura bruges til skattesvindel',
        'En foreløbig faktura der beskriver varens pris, indhold og vilkår — bruges som tilbud og til toldformål, men er IKKE betalingskrav',
        'En faktura der kun udstedes for professionelle kunder',
        'En faktura der er betalt på forhånd'
    ],
    correct: 1,
    explanation: 'En proforma-faktura ser ud som en faktura, men er kun et tilbud/estimat. Den bruges ofte til toldangivelse, importlicenser og forundersøgelser. Den skaber IKKE et juridisk betalingskrav — det gør kun den rigtige handelsfaktura.'
},
{
    id: 154,
    category: 'Leveringsbetingelser',
    q: 'Hvad er en CMR-fragtbrev?',
    options: [
        'Et dokument kun brugt i container-skibsfart',
        'En faktura for vejafgifter i Europa',
        'Et internationalt fragtbrev for godstransport ad landevej der dokumenterer fragtaftalen og varernes tilstand',
        'En certifikat til chauffører der kører med farligt gods'
    ],
    correct: 2,
    explanation: 'CMR-fragtbrevet (Convention on the Contract for the International Carriage of Goods by Road) følger varen ved international landevejstransport. Det dokumenterer afsender, modtager, gods, eventuelle forbehold og er bevis for fragtaftalen.'
},
{
    id: 155,
    category: 'Leveringsbetingelser',
    q: 'Hvad er en toldangivelse?',
    options: [
        'En skriftlig klage over toldbetjentens opførsel',
        'En erklæring til toldmyndighederne der beskriver varernes art, mængde, værdi og oprindelse for at beregne told og afgifter',
        'En liste over medarbejdere der har toldkort',
        'En oversigt over toldfrie butikker i lufthavnen'
    ],
    correct: 1,
    explanation: 'Toldangivelsen er det centrale importdokument: man oplyser varetype, HS-kode (toldbetegnelse), mængde, værdi, oprindelsesland osv. Toldmyndigheden bruger det til at beregne told, moms og eventuelle afgifter. For EU-intern handel er der ikke told.'
},
{
    id: 156,
    category: 'Leveringsbetingelser',
    q: 'Hvad er en HS-kode (Harmonized System)?',
    options: [
        'En type sikkerhedskode til lagerdøre',
        'Et internationalt 6-cifret klassifikationssystem der kategoriserer alle varer til brug ved toldhåndtering',
        'Et sundhedscertifikat krævet for fødevareimport',
        'En forkortelse for "High Security" — en sikkerhedsklassificering'
    ],
    correct: 1,
    explanation: 'HS-koden er et verdensomspændende system til at klassificere varer. De første 6 cifre er ens globalt — fx 0901.11 er ubrændt kaffe. Lande tilføjer ekstra cifre for detaljer. HS-koden bestemmer toldsats, importregler og handelsstatistik.'
},
{
    id: 157,
    category: 'Leveringsbetingelser',
    q: 'Hvad er en letter of credit (remburs)?',
    options: [
        'Et brev med klager til leverandøren',
        'En bankgaranti der sikrer at sælger får betaling når bestemte dokumenter fremvises — en sikkerhed for begge parter i international handel',
        'Et kreditkort specielt til indkøb af lagervarer',
        'Et brev der giver kredit til medarbejdere i kantinen'
    ],
    correct: 1,
    explanation: 'Remburs: købers bank lover at betale sælger, når sælger fremviser de rigtige dokumenter (fx B/L, faktura, certifikater). Det beskytter sælger (sikker betaling) og køber (betaler først når dokumentation er i orden). Brugt ved store internationale handler.'
},
{
    id: 158,
    category: 'Leveringsbetingelser',
    q: 'Hvad er en "packing list" (pakkeliste)?',
    options: [
        'En liste over alle ansatte der arbejder i pakkeafdelingen',
        'En detaljeret oversigt over indholdet af en forsendelse: varenumre, beskrivelser, mængder, vægt og kolli — bruges til modtagekontrol og told',
        'En indkøbsliste til emballagematerialer',
        'En checkliste over alt hvad man skal pakke til en forretningsrejse'
    ],
    correct: 1,
    explanation: 'Pakkelisten følger forsendelsen og beskriver nøjagtigt, hvad der er i hver kolli: varenummer, varebeskrivelse, antal, nettovægt, bruttovægt. Modtageren bruger den til at krydstjekke, og toldmyndighederne bruger den ved fortoldning.'
},
{
    id: 159,
    category: 'Leveringsbetingelser',
    q: 'Hvad er "certificate of origin" (oprindelsescertifikat)?',
    options: [
        'Et certifikat der beviser at lagermedarbejderen er født i Danmark',
        'Et dokument der bekræfter i hvilket land varen er produceret — bruges til toldsatser og handelsaftaler',
        'Et bevis for at virksomheden er original og ikke en kopi',
        'Et certifikat der bruges til at certificere økologiske varer'
    ],
    correct: 1,
    explanation: 'Oprindelsescertifikatet dokumenterer, hvor varen er fremstillet. Det er afgørende for toldsatser, fordi mange lande har frihandelsaftaler — fx kan varer fra EU til Norge have lavere told med et korrekt certifikat. Uden det betaler man fuld told.'
},
{
    id: 160,
    category: 'Leveringsbetingelser',
    q: 'Hvad er "dangerous goods declaration" (farligt gods erklæring)?',
    options: [
        'En udtalelse om at lagergulvet er glat',
        'En oversigt over alle nødudgange i lagerbygningen',
        'Et dokument der beskriver farligt gods: UN-nummer, fareklasse, emballagegruppe og korrekt forsendelsesnavn — krævet ved transport',
        'En medarbejders erklæring om aldrig at komme i fare'
    ],
    correct: 2,
    explanation: 'Ved transport af farligt gods (kemikalier, gasser, brandbare væsker osv.) kræves en erklæring med UN-nummer, korrekt forsendelsesnavn, fareklasse, emballagegruppe og mængde. Uden den må transportøren nægte at medtage godset.'
},

// ============================
// EKSTRA: TRANSPORT & DISTRIBUTION (161-170)
// ============================
{
    id: 161,
    category: 'Transport',
    q: 'Hvad er intermodal transport?',
    options: [
        'Transport der kun bruger én transportform hele vejen',
        'Transport med mindst to forskellige transportformer (fx lastbil + tog + skib) hvor godset forbliver i samme container',
        'Transport mellem internationale modetermiter',
        'En type intern transport på lagergulvet'
    ],
    correct: 1,
    explanation: 'Intermodal transport: godset flyttes i samme container fra lastbil til tog til skib. Containeren åbnes ikke undervejs. Det kombinerer styrker: lastbil (fleksibel first/last mile), tog (billigt på lang strækning), skib (billigst til oversøisk).'
},
{
    id: 162,
    category: 'Transport',
    q: 'Hvad er en TEU (Twenty-foot Equivalent Unit)?',
    options: [
        'En måleenhed for lastbilers motorkraft',
        'En standardenhed baseret på en 20-fods container — bruges til at angive skibes og terminalsers kapacitet',
        'En type temperatorenhed brugt i køletransport',
        'En forkortelse for "Total Economic Utility"'
    ],
    correct: 1,
    explanation: 'TEU = en 20-fods container (6,1 m lang). En 40-fods container = 2 TEU. Når man siger "et containerskib på 20.000 TEU," kan det rumme 20.000 20-fods containere. Det er standardmålet for kapacitet i containertransport.'
},
{
    id: 163,
    category: 'Transport',
    q: 'Hvad er cabotage i transportsammenhæng?',
    options: [
        'En type lastbilkabine med soveplads',
        'Når en udenlandsk transportør udfører indenlandsk transport i et andet land end sit eget — strengt reguleret i EU',
        'En kombination af cab og transport — ét ord for taxikørsel',
        'En type transportforsikring mod kabelbrud'
    ],
    correct: 1,
    explanation: 'Cabotage: fx en polsk lastbil leverer gods i Danmark og tager derefter en indenlandsk dansk transport. I EU er det begrænset: max 3 cabotage-ture inden for 7 dage efter international levering. Det beskytter nationale transportører mod unfair konkurrence.'
},
{
    id: 164,
    category: 'Transport',
    q: 'Hvad er køre- og hviletidsregler for lastbilchauffører?',
    options: [
        'Chauffører må køre ubegrænset så længe de holder kaffe-pauser',
        'Max 4,5 timers kørsel, derefter 45 min pause. Max 9 timers daglig kørsel (2 gange 10 timer per uge). Min 11 timers daglig hvile',
        'Max 12 timers kørsel per dag uden pause',
        'Reglerne varierer fra by til by'
    ],
    correct: 1,
    explanation: 'EU-regler (forordning 561/2006): Max 4,5 timers kørsel → 45 min pause. Max 9 timer daglig kørsel (kan forlænges til 10 timer 2x/uge). Ugentlig max 56 timer. Min 11 timers daglig hvile (kan reduceres til 9 timer 3x/uge). Overvåges via takograf.'
},
{
    id: 165,
    category: 'Transport',
    q: 'Hvad er en takograf?',
    options: [
        'Et instrument der optager chauffører med video under kørsel',
        'Et apparat i lastbilen der registrerer køretid, hastighed, hvileperioder og pauser — lovpligtigt i EU for lastbiler over 3,5 ton',
        'Et overfaldsalarm til chauffører der kører med værdifuld last',
        'En type navigationssystem specielt udviklet til lastbiler'
    ],
    correct: 1,
    explanation: 'Takografen (digital siden 2006) registrerer uafbrudt: kørsel, andet arbejde, rådighed, hvile. Politiet kan kontrollere data ved vejsiden. Overtrædelse af køre-hviletifsregler giver bøder til både chauffør og vognmand. Formålet er trafiksikkerhed.'
},
{
    id: 166,
    category: 'Transport',
    q: 'Hvad er en speditør?',
    options: [
        'En mekaniker der reparerer lastbiler',
        'Et firma der arrangerer og koordinerer transport af gods på vegne af afsenderen — uden nødvendigvis selv at eje transportmidlerne',
        'En person der holder opsyn med farten på motorvejen',
        'En type højhastighedstransport kun til eksprespakker'
    ],
    correct: 1,
    explanation: 'Speditøren er "transportens rejsebureau." De finder den bedste transportløsning: vælger rute, fragtmåde (sø, luft, vej), booker plads, håndterer tolddokumentation. De ejer sjældent selv lastbiler — de koordinerer. DFDS, DSV, DB Schenker er speditører.'
},
{
    id: 167,
    category: 'Transport',
    q: 'Hvad er en "last mile" i logistik?',
    options: [
        'Den sidste mil inden lastbilens motor slukkes for altid',
        'Den sidste etape af leveringen fra distributionscenter til slutkundens dør — ofte den dyreste og mest komplekse del',
        'Den siste kilometer af motorvejen inden rasthuset',
        'En type langdistanceløb arrangeret af logistikvirksomheder'
    ],
    correct: 1,
    explanation: 'Last mile er den dyreste del: mange små leveringer til private adresser, ingen hjemme, parkeringsproblemer, tidsvindue-krav. I e-handel udgør last mile ofte 40-50% af de samlede forsendelsesomkostninger. Pakkeboxe og afhentningssteder reducerer problemet.'
},
{
    id: 168,
    category: 'Transport',
    q: 'Hvad er ADR i transportsammenhæng?',
    options: [
        'An international aftale om transport af farligt gods ad landevej — chauffører skal have ADR-bevis',
        'En automatisk dørring til lastbilernes lasterum',
        'En type anti-drap rude på lastbilvinduer',
        'Automatic Delivery Registration — et system til leveringsbekræftelse'
    ],
    correct: 0,
    explanation: 'ADR (Accord européen relatif au transport international des marchandises Dangereuses par Route): internationale regler for transport af farligt gods. Chauffører skal gennemgå ADR-kursus, og køretøjer skal have ADR-udstyr (brandslukkere, advarselsskilte, øjenskyllere).'
},
{
    id: 169,
    category: 'Transport',
    q: 'Hvad er en "hub-and-spoke" model i distribution?',
    options: [
        'Et kredsløbssystem i lastbilens motor',
        'En model med et centralt hub (nav) hvorfra varer distribueres ud ad eger (spokes) til mindre destinationer — som et hjuls nav og eger',
        'En cykelhjulsformet lagerbygning',
        'En metode hvor gods altid transporteres i cirkler'
    ],
    correct: 1,
    explanation: 'Hub-and-spoke: alt gods samles i ét centralt hub (fx Billund for pakkepost), sorteres, og sendes ud ad "eger" til lokale terminaler/kunder. Det giver effektiv konsolidering og sortering, men kræver at alt passerer hubbet — så det tager lidt længere tid.'
},
{
    id: 170,
    category: 'Transport',
    q: 'Hvad er "reverse logistics" (returlogistik)?',
    options: [
        'At køre baglæns med lastbilen til lageret',
        'Logistikken for at håndtere varer der flyder den modsatte vej: returnerede varer, emballage, genbrugsmaterialer fra kunde tilbage til virksomhed',
        'At læse lagerlisten bagfra for at finde fejl',
        'En strategi hvor leverandøren besøger kunden i stedet for omvendt'
    ],
    correct: 1,
    explanation: 'Reverse logistics håndterer alt der flyder modstrøms: returneringer, reparationer, genbrug, genvinding, bortskaffelse. Med e-handel returneres 25-30% af alle varer — så reverse logistics er blevet en enorm og vigtig disciplin.'
},

// ============================
// EKSTRA: SUPPLY CHAIN & ØKONOMI (171-185)
// ============================
{
    id: 171,
    category: 'Supply Chain',
    q: 'Hvad er "bullwhip effect" (piskeefekt)?',
    options: [
        'En teknik til at motivere medarbejdere til at arbejde hurtigere',
        'Når små udsving i efterspørgslen hos slutkunden forstærkes og skaber store svingninger opad i forsyningskæden',
        'En lydbølge-effekt i store lagerhaller',
        'En fysisk træningsmetode for lagermedarbejdere'
    ],
    correct: 1,
    explanation: 'Bullwhip-effekten: supermarkedet sælger 5% mere mælk → detailkæden bestiller 10% mere → mejeriet producerer 20% mere → landmanden investerer i 30% flere køer. Små kundeændringer forstærkes opad pga. prognoser, batchbestilling og sikkerhedslagre.'
},
{
    id: 172,
    category: 'Supply Chain',
    q: 'Hvad er forskellen på "lead time" og "cycle time"?',
    options: [
        'De er præcis det samme — to ord for det samme',
        'Lead time er den samlede tid fra ordre til levering; cycle time er tiden for at gennemføre én produktions- eller procescyklus',
        'Lead time er længere end 1 år; cycle time er under 1 dag',
        'Lead time bruges kun i bilindustrien; cycle time bruges kun i IT'
    ],
    correct: 1,
    explanation: 'Lead time: total tid fra kundeordre til kunden modtager varen (kan inkludere ventetid, produktion, transport). Cycle time: den faktiske proceseringstid for ét trin (fx tiden for at plukke og pakke én ordre). Lead time = summen af cycle times + ventetider.'
},
{
    id: 173,
    category: 'Supply Chain',
    q: 'Hvad er "Total Cost of Ownership" (TCO)?',
    options: [
        'Den samlede pris for at eje og drive et aktiv over hele dets levetid: indkøb, drift, vedligehold, bortskaffelse',
        'Den pris virksomhedsejeren betalte for at starte virksomheden',
        'Summen af alle medarbejderlønninger i virksomheden',
        'En rabat man får når man køber alle produkter fra én leverandør'
    ],
    correct: 0,
    explanation: 'TCO: en billig gaffeltruck til 100.000 kr. med høje vedligeholdelsesomkostninger kan koste mere over 10 år end en dyr truck til 200.000 kr. med lave driftsomkostninger. TCO afslører den reelle pris over tid — ikke bare indkøbsprisen.'
},
{
    id: 174,
    category: 'Supply Chain',
    q: 'Hvad er "demand forecasting" (efterspørgselsprognose)?',
    options: [
        'At forudsige vejret for at planlægge udendørs levering',
        'Brugen af historiske data, trends og statistiske modeler til at forudse fremtidig kundeefterspørgsel',
        'At spørge kunderne direkte hvad de vil købe',
        'At kopiere konkurrentens salgstal og bruge dem som prognose'
    ],
    correct: 1,
    explanation: 'Demand forecasting bruger historiske salgsdata, sæsonmønstre, trends og statistik til at forudsige fremtidigt salg. En god prognose reducerer lageromkostninger (ikke for meget) og undgår stockout (ikke for lidt). Det er en af de sværeste discipliner i supply chain.'
},
{
    id: 175,
    category: 'Supply Chain',
    q: 'Hvad er VMI (Vendor Managed Inventory)?',
    options: [
        'Når medarbejderne selv styrer deres eget lager uden chefens tilsyn',
        'Når leverandøren har ansvaret for at overvåge og genopfylde kundens lager — leverandøren bestemmer hvad og hvornår der genbestilles',
        'Når lageret styres af virtuelle maskiner (VM)',
        'En type antivirus-software til WMS-systemer'
    ],
    correct: 1,
    explanation: 'VMI: leverandøren overvåger kundens lagerbeholdning (fx via EDI) og genopfylder automatisk. Fordel: leverandøren kender sit eget produkt bedst og kan planlægge produktion jævnere. Kunden slipper for at bestille. Bruges fx i dagligvarehandel og industri.'
},
{
    id: 176,
    category: 'Supply Chain',
    q: 'Hvad er "consignment stock" (konsignationslager)?',
    options: [
        'Et lager med kun konsumvarer (fødevarer og drikkevarer)',
        'Varer der ligger på kundens lager, men som ejes af leverandøren indtil kunden tager dem i brug',
        'Et lager hvor varerne er konsigneret til destruktion',
        'Et lager der drives af en konsulent på midlertidig basis'
    ],
    correct: 1,
    explanation: 'Konsignationslager: leverandørens varer ligger hos kunden, men leverandøren ejer dem stadig. Kunden betaler først, når varerne bruges eller sælges. Det giver kunden lav kapitalbinding, men leverandøren bærer lageromkostningen og risikoen.'
},
{
    id: 177,
    category: 'Supply Chain',
    q: 'Hvad er "3PL" (Third-Party Logistics)?',
    options: [
        'Tredje parkeringsplads til venstre',
        'Når en virksomhed outsourcer sine logistikfunktioner (lager, transport, ordrehåndtering) til en specialiseret ekstern logistikpartner',
        'Et lager med præcis 3 platforme',
        'En logistikmodel der kun bruger 3 lastbiler'
    ],
    correct: 1,
    explanation: '3PL: virksomheden outsourcer lager, distribution og evt. ordrehåndtering til en logistikpartner som DSV, DHL eller PostNord. Virksomheden fokuserer på sine kernekompetencer, mens 3PL-udbyderen leverer logistikekspertise og skalerbarhed.'
},
{
    id: 178,
    category: 'Supply Chain',
    q: 'Hvad er "4PL" (Fourth-Party Logistics)?',
    options: [
        'Et firma der har 4 lagre placeret symmetrisk',
        'En logistikintegrator der styrer og koordinerer flere 3PL-partnere og hele forsyningskæden på kundens vegne',
        'Fire parallelle logistikafdelinger i virksomheden',
        'En model med 4 leverancer per dag'
    ],
    correct: 1,
    explanation: '4PL er et lag oven på 3PL: en 4PL-partner styrer hele logistikken og koordinerer flere 3PL-udbydere, transportører og lagre. De optimerer den samlede forsyningskæde — som en dirigent der koordinerer hele orkestret.'
},
{
    id: 179,
    category: 'Virksomhed',
    q: 'Hvad er lageromkostninger typisk sammensat af?',
    options: [
        'Kun huslejen for lagerbygningen',
        'Kapitalbinding + lagerhusets driftsomkostninger + svind + forsikring + forældelse + håndtering',
        'Kun medarbejderlønninger',
        'Kun indkøbsprisen for varerne'
    ],
    correct: 1,
    explanation: 'Lageromkostninger = kapitalbinding (pengene bundet i varer), drift (husleje, strøm, udstyr, løn), svind (tyveri/skader), forsikring, forældelse (varer der går ud på dato eller mode) og håndtering. Tommelfingerregel: lageromkostningerne er 15-30% af varernes værdi per år.'
},
{
    id: 180,
    category: 'Virksomhed',
    q: 'Hvad er lageromsætningshastighed?',
    options: [
        'Hvor hurtigt gaffeltruckerne kører rundt i lageret',
        'Antal gange lageret omsættes (tømmes og genfyldes) per år — beregnet som forbrug/gennemsnitslager',
        'Hastighed i km/t som varer bevæger sig på transportbånd',
        'Antal jobskift blandt lagermedarbejdere per år'
    ],
    correct: 1,
    explanation: 'Lageromsætningshastighed = årligt forbrug (i kr. eller enheder) / gennemsnitslager. Hvis du sælger for 10 mio. kr. og har et gennemsnitslager på 2 mio. kr., er omsætningshastigheden 5. Højere er bedre — det betyder færre penge bundet i lager.'
},
{
    id: 181,
    category: 'Virksomhed',
    q: 'Hvad er dækningsbidrag?',
    options: [
        'Det beløb virksomheden bidrager med til velgørenhed',
        'Salgsprisen minus de variable omkostninger — det der er "tilovers" til at dække faste omkostninger og give profit',
        'Lønnen til dækchefen i virksomhedens lastbilflåde',
        'Antallet af dæk skiftet på gaffeltrucks per år'
    ],
    correct: 1,
    explanation: 'Dækningsbidrag (DB) = salgspris - variable omkostninger (fx indkøbspris, emballage, fragt). Hvis en vare sælges for 100 kr. og de variable omkostninger er 60 kr., er DB 40 kr. De 40 kr. skal dække faste omkostninger (husleje, løn) og give overskud.'
},
{
    id: 182,
    category: 'Virksomhed',
    q: 'Hvad er "fill rate" som KPI?',
    options: [
        'Hvor fuld lagerbygningen er i procent',
        'Procentdelen af kundeordrer der kan leveres komplet fra lagerbeholdning — med det samme, uden restordre',
        'Hvor hurtigt man kan fylde en lastbil med gods',
        'Procentdelen af luften i lageret der er CO2'
    ],
    correct: 1,
    explanation: 'Fill rate (opfyldelsesgrad) = antal ordrelinjer leveret direkte fra lager / totale ordrelinjer. Mål: typisk 95-98%. 100% kræver enormt lager. Fx: 95 ud af 100 ordrelinjer kan leveres straks → 95% fill rate. De resterende 5 er "backorder."'
},
{
    id: 183,
    category: 'Virksomhed',
    q: 'Hvad er "dead stock" (dødt lager)?',
    options: [
        'Varer der er gået i stykker under transport',
        'Varer der har ligget på lageret i lang tid uden at blive solgt eller brugt — binder kapital og fylder',
        'Et lager der er lukket ned permanent',
        'Varer der er så tunge at de ikke kan flyttes'
    ],
    correct: 1,
    explanation: 'Dead stock er varer der bare samler støv. De binder kapital, fylder plads der kunne bruges bedre, og taber ofte værdi over tid. Løsning: nedsættelse, bortskaffelse, donation eller genbrug. Forebyggelse: bedre prognoser og indkøbsdisciplin.'
},
{
    id: 184,
    category: 'Virksomhed',
    q: 'Hvad er "order lead time" (ordregennemløbstid)?',
    options: [
        'Tiden fra kunden placerer en ordre til kunden modtager varen',
        'Tiden det tager at lede efter en mistet ordre',
        'Antal dage en ordre venter på godkendelse fra ledelsen',
        'Tiden det tager at taste en ordre ind i ERP-systemet'
    ],
    correct: 0,
    explanation: 'Order lead time = total tid fra ordremodtagelse til levering hos kunden. Den inkluderer ordrebehandling, plukning, pakning, forsendelse og transport. Kortere OLT = højere kundetilfredshed. Amazon har presset standarden ned mod 1-2 dage for e-handel.'
},
{
    id: 185,
    category: 'Virksomhed',
    q: 'Hvad er en SLA (Service Level Agreement)?',
    options: [
        'Et standard leveringsadresse-format',
        'En aftale der specificerer det forventede serviceniveau mellem to parter — fx leveringstider, svartider og kvalitetsmål',
        'En salgslicensaftale for alkohol',
        'En standard lager-audit gennemført hvert kvartal'
    ],
    correct: 1,
    explanation: 'SLA: en formel aftale. Fx: "Vi leverer 98% af alle ordrer inden 24 timer. Fejlraten skal være under 0,5%. Svartid på forespørgsler max 4 timer." Hvis ikke SLA overholdes, kan der være bøder eller kontraktopsigelse. Det sikrer klare forventninger.'
},

// ============================
// EKSTRA: BÆREDYGTIGHED & MILJØ (186-195)
// ============================
{
    id: 186,
    category: 'Generelt Logistik',
    q: 'Hvad er "grøn logistik"?',
    options: [
        'At male alle lastbiler grønne',
        'Logistik med fokus på at minimere miljøpåvirkningen: reducere CO2-udledning, spild, emballage og energiforbrug i forsyningskæden',
        'Transport af planter og blomster',
        'Logistik der kun bruger gangstier i stedet for veje'
    ],
    correct: 1,
    explanation: 'Grøn logistik handler om bæredygtig forsyningskæde: optimere ruter for lavere brændstofforbrug, bruge el-køretøjer, minimere emballage, genanvende, reducere tomkørsel, bruge tog i stedet for lastbil osv. Det er både godt for miljøet og kan spare penge.'
},
{
    id: 187,
    category: 'Generelt Logistik',
    q: 'Hvad er "carbon footprint" i logistik?',
    options: [
        'Mærket som lastbilens dæk efterlader på vejen',
        'Den samlede CO2-udledning fra en virksomheds logistikaktiviteter: transport, lagerdrift, emballage, energiforbrug',
        'Et klimaanlæg i lagerbygningen',
        'En type affaldsbeholder med kulfilter'
    ],
    correct: 1,
    explanation: 'Carbon footprint måler den samlede CO2-udledning. I logistik kommer den primært fra transport (lastbiler, skibe, fly, tog), energi til opvarmning/køling af lagre, og produktion af emballagematerialer. Mange virksomheder har mål om CO2-neutralitet.'
},
{
    id: 188,
    category: 'Generelt Logistik',
    q: 'Hvad er "cirkulær økonomi" i en forsyningskæde?',
    options: [
        'At lastbilerne kører i cirkler for at levere varer',
        'At varer aldrig sælges men kun udlejes',
        'En model hvor materialer genbruges, repareres og genanvendes i stedet for at blive smidt ud efter brug — fra "tag-brug-smid-ud" til "tag-brug-genbrug"',
        'En økonomisk model hvor alle betaler den samme pris'
    ],
    correct: 2,
    explanation: 'Cirkulær økonomi erstatter den lineære model (udvind → producér → brug → smid ud) med et kredsløb: design til holdbarhed, reparation, genbrug, genfremstilling, genanvendelse. Det reducerer ressourceforbrug og affald. Logistikken spiller en nøglerolle i returflow.'
},
{
    id: 189,
    category: 'Generelt Logistik',
    q: 'Hvad er "tomkørsel" (empty running)?',
    options: [
        'Når lagermedarbejdere løber tomhændede rundt i lageret',
        'Når en lastbil kører uden last — den returnerer tom efter levering, hvilket spilder brændstof og kapacitet',
        'Når et transportbånd kører uden varer på',
        'Når en gaffeltruck kører med tændt motor men uden fører'
    ],
    correct: 1,
    explanation: 'Tomkørsel er en af de største spildkilder i transport. I EU kører ca. 25% af alle lastbilkilometer med tom trailer. Løsninger: fragtbørser (finder returlast), milk run-ruter, bedre ruteoptimering og samarbejde mellem transportører.'
},
{
    id: 190,
    category: 'Generelt Logistik',
    q: 'Hvad er formålet med en "miljøcertificering" som ISO 14001?',
    options: [
        'At certificere at produkterne er lavet af 100% genbrugsmateriale',
        'At virksomheden har et dokumenteret og systematisk miljøledelsessystem til løbende at forbedre sin miljøpræstation',
        'At alla medarbejdere har bestået en miljøeksamen',
        'At lagerbygningen er LEGO-certificeret'
    ],
    correct: 1,
    explanation: 'ISO 14001: virksomheden har et miljøledelsessystem — man identificerer miljøpåvirkninger, sætter mål, gennemfører forbedringer og dokumenterer det hele. Det er IKKE en garanti for grøn drift, men et system til løbende at blive bedre.'
},
{
    id: 191,
    category: 'Generelt Logistik',
    q: 'Hvad er "konsolidering af forsendelser"?',
    options: [
        'At pakke varer i solide kasser der kan modstå stød',
        'At samle flere mindre forsendelser til en stor for at udnytte transportkapaciteten bedre og reducere omkostninger',
        'At cementere varer fast til pallen for at forhindre bevægelse',
        'At kondensere dampformige varer til væske'
    ],
    correct: 1,
    explanation: 'I stedet for at sende 5 halvtomme lastbiler, samler man gods fra 5 kunder i 1-2 fulde lastbiler. Det reducerer transportomkostninger (per kg), CO2-udledning (færre ture), og trængsel på vejene. Speditører og 3PL-udbydere gør det dagligt.'
},
{
    id: 192,
    category: 'Generelt Logistik',
    q: 'Hvad er "rightsizing" af emballage?',
    options: [
        'At lave emballagen i den exakt rigtige størrelse til produktet for at undgå at sende luft og reducere materialeforbruget',
        'At bruge kun højrehåndede maskiner til emballeringen',
        'At standardisere alle kasser til én enhedsstørrelse',
        'At gøre emballagen så lille som muligt uanset produktet'
    ],
    correct: 0,
    explanation: 'Rightsizing: tilpasse kassestørrelsen til varen. Amazons problem i starten: en lille USB-stick i en kæmpekasse fuld af fyidemateriale. Rightsizing reducerer emballageforbrug, fyldmateriale, transportvolumen (flere kasser per lastbil) og affald. Win-win-win.'
},
{
    id: 193,
    category: 'Generelt Logistik',
    q: 'Hvad er "scope 3 emissioner" i logistik?',
    options: [
        'CO2-udslip der sker præcis 3 km fra lageret',
        'Indirekte udledninger i den samlede forsyningskæde som virksomheden ikke direkte kontrollerer — fx underleverandørers transport og kunders brug af produktet',
        'Emissioner fra præcis 3 lastbiler',
        'Udledning der er opgort over 3 år'
    ],
    correct: 1,
    explanation: 'Scope 1: direkte udledning (egne biler/maskiner). Scope 2: indkøbt energi (el, varme). Scope 3: alt andet i værdikæden — råvarer, indkøbt transport, medarbejderpendling, bortskaffelse af solgte produkter. Scope 3 udgør typisk 70-90% af den samlede CO2 — det er her de store gevinster er.'
},
{
    id: 194,
    category: 'Generelt Logistik',
    q: 'Hvad er et "returcenter"?',
    options: [
        'Et center der vender retursendinger: tjekker, sorterer, oparbejder, genopfylder eller bortskaffer returnerede varer',
        'Et kontor der returnerer ubesvarede opkald',
        'Et center der kun modtager paller i retur',
        'Et rehabiliteringscenter for stressede logistikchefer'
    ],
    correct: 0,
    explanation: 'Returcentre håndterer det "omvendte flow": modtagelse af returnerede varer, kvalitetskontrol (kan varen videresælges?), reparation, ompakning, genanvendelse eller bortskaffelse. Med e-handelens høje returprocent er effektive returcentre blevet afgørende for indtjeningen.'
},
{
    id: 195,
    category: 'Generelt Logistik',
    q: 'Hvad er formålet med emballagekravene i EU (Packaging and Packaging Waste Directive)?',
    options: [
        'At sikre at al emballage er lavet af guld',
        'At sætte mål for genbrug og genanvendelse af emballage, minimere emballageaffald og fremme cirkulær økonomi',
        'At forbyde al brug af plast i Europa',
        'At standardisere alle emballagefarver til hvid'
    ],
    correct: 1,
    explanation: 'EU-direktivet kræver at medlemsstater når bestemte mål for genbrug og genanvendelse af emballage (papir, glas, metal, plast, træ). Producenter har "producentansvar" — de skal bidrage finansielt til indsamling og genbrug af den emballage de sætter på markedet.'
},

// ============================
// EKSTRA: SIKKERHED & ERGONOMI (196-205)
// ============================
{
    id: 196,
    category: 'Sikkerhed',
    q: 'Hvad kræves for at føre gaffeltruck i Danmark?',
    options: [
        'Man behøver ingen uddannelse — alle må køre gaffeltruck',
        'Kun et almindeligt kørekort til bil',
        'Et gyldigt gaffeltruckcertifikat (typisk A eller B) udstedt efter godkendt uddannelse',
        'Man skal blot have arbejdsgiverens mundtlige tilladelse'
    ],
    correct: 2,
    explanation: 'I Danmark kræves certifikat. Type A: lavt-løftende palleløfter. Type B: gaffeltruck med løftehøjde over 1 meter. Uddannelsen omfatter teori og praktik. Arbejdstilsynet kan give bøder, hvis ukvalificerede fører truck. Det handler om sikkerhed for alle.'
},
{
    id: 197,
    category: 'Sikkerhed',
    q: 'Hvad er korrekt procedure ved kørsel med gaffeltruck med byrde?',
    options: [
        'Gaflerne holdes højt for bedre udsyn',
        'Man kører altid fremad uanset omstændigheder',
        'Gaflerne holdes lavt (15-20 cm fra gulv), mast tiltet bagud, man kører baglæns ned ad rampe, og aldrig over hastigheds- grænsen',
        'Man kører så hurtigt som muligt for at spare tid'
    ],
    correct: 2,
    explanation: 'Lavt tyngdepunkt = stabil truck. Gafler 15-20 cm over gulv. Mast tiltet bagud. Ned ad rampe: baglæns med byrde (byrden opad). Op ad rampe: fremad med byrde. Aldrig bratte sving — truck kan vælte. Husk: gaffeltrucks dræber mennesker hvert år.'
},
{
    id: 198,
    category: 'Sikkerhed',
    q: 'Hvad er et sikkerhedsdatablad (SDS)?',
    options: [
        'Et datablad med medarbejdernes CPR-numre',
        'Et regneark med virksomhedens sikkerhedsbudget',
        'Et dokument med 16 sektioner der beskriver et kemisk produkts farer, håndtering, opbevaring, bortskaffelse og førstehjælp',
        'En database over alle lagerhylder og deres max belastning'
    ],
    correct: 2,
    explanation: 'SDS (16 standardiserede sektioner): identifikation, fareidentifikation, sammensætning, førstehjælp, brandbekæmpelse, udslip, håndtering og opbevaring, eksponeringskontrol/personlig beskyttelse, fysisk-kemiske egenskaber, stabilitet osv. Skal medfølge alle kemikalier.'
},
{
    id: 199,
    category: 'Sikkerhed',
    q: 'Hvad er PPE (Personal Protective Equipment)?',
    options: [
        'Et bonusprogram for produktive plukkere',
        'Personlige værnemidler: sikkerhedssko, hjelm, handsker, høreværn, sikkerhedsbriller, refleksvest osv.',
        'Et IT-program til personlig planlægning og evaluering',
        'En type plastpalle der er ekstra let'
    ],
    correct: 1,
    explanation: 'PPE/værnemidler er udstyr der beskytter medarbejderen: sikkerhedssko (mod tunge genstande der falder ned), hjelm (i truckomr.), handsker (skarpe kanter), høreværn (støj), refleksvest (synlighed), sikkerhedsbriller (kemikaler/støv). Det er arbejdsgiverens pligt at stille PPE til rådighed.'
},
{
    id: 200,
    category: 'Sikkerhed',
    q: 'Hvad er ergonomi i lagerarbejde?',
    options: [
        'Studiet af økonomi i ergonomiske møbler',
        'Tilpasning af arbejdet til mennesket for at forebygge belastningsskader — korrekt løfteteknik, god arbejdshøjde, variation i opgaver',
        'En type energidrik til lagermedarbejdere',
        'Et automatisk truckstyringssystem'
    ],
    correct: 1,
    explanation: 'Ergonomi i lageret: justérbare pakkeborde (arbejde i korrekt højde), palleløftere der hæver pallen til plukhøjde, rotation mellem opgaver (variation reducerer ensidigt gentaget arbejde), korrekt løfteteknik (brug benene, hold byrden tæt).'
},
{
    id: 201,
    category: 'Sikkerhed',
    q: 'Hvad er en risikovurdering (risk assessment)?',
    options: [
        'En vurdering af risikoen for inflation i økonomien',
        'En systematisk gennemgang for at identificere farer, vurdere risici og fastlægge forebyggende foranstaltninger i arbejdsmiljøet',
        'En vurdering af hvor risikabelt det er at investere i aktier',
        'En vurdering af lastbilens risiko for punktering'
    ],
    correct: 1,
    explanation: 'Risikovurdering: 1) Find farerne (fx kemikalier, tung løft, truck-trafik). 2) Hvem kan blive skadet og hvordan? 3) Vurdér risiko (sandsynlighed × konsekvens). 4) Beslut forebyggelse (fjern fare, beskyt, instruér). 5) Dokumentér og revider regelmæssigt.'
},
{
    id: 202,
    category: 'Sikkerhed',
    q: 'Hvad er formålet med gulvmærkning (floor marking) i et lager?',
    options: [
        'At gøre lageret mere farverigt og indbydende',
        'At adskille gangarealer, truckzoner, fodgængerområder, opbevaringsarealer og nødudgange visuelt med farvede linjer',
        'At angive hvor gulvet er nyligt poleret og glat',
        'At vise medarbejderne den hurtigste rute til kantinen'
    ],
    correct: 1,
    explanation: 'Gulvmærkning: gul = gangarealer/truckruter, grøn = fodgængerstier, rød = brandslukkere/nødudgange (skal holdes fri!), hvid/sorts skravering = farezone. Det skaber visuelt overblik og adskiller truck- og persontrafik. Det er Lean-princippet "visual management" i praksis.'
},
{
    id: 203,
    category: 'Sikkerhed',
    q: 'Hvad er forbudt ved stabling af gods på paller?',
    options: [
        'At placere lette varer på toppen',
        'At stable tungere og mere stabile varer i bunden',
        'At stable højere end reolens tilladte belastning, med overhæng ud over pallen, eller med ustabil opbygning der kan vælte',
        'At bruge stretchfolie til at holde lasten sammen'
    ],
    correct: 2,
    explanation: 'Regler: overhold reolens løstige belastning (skiltet på reolen). Ingen overhæng over palle-kanten. Stabil opbygning: tungt i bund, let på top. Wrap/stretchfolie rundt om. Gods der stikkeder ud over pallen kan falde ned og ramme nogen.'
},
{
    id: 204,
    category: 'Sikkerhed',
    q: 'Hvad er en brandsektion i et lager?',
    options: [
        'En afdeling der specialiserer sig i at sælge brandudstyr',
        'Et afgrænset område i lageret adskilt af brandvægge og branddøre for at forhindre brand i at sprede sig',
        'Et område hvor det er tilladt at ryge',
        'Det afsnit af lageret der opbevarer brændbart væske'
    ],
    correct: 1,
    explanation: 'Brandsektionering deler lageret op, så en brand i én sektion ikke spreder sig til nabosektionerne. Brandvægge, branddøre og sprinkleranlæg begrænser branden. Krav afhænger af lagerstørrelse, varetype og risiko. Branddøre må ALDRIG kiiles op.'
},
{
    id: 205,
    category: 'Sikkerhed',
    q: 'Hvad er en evakueringsplan?',
    options: [
        'En plan for at evaluere medarbejdernes præstation',
        'En forud fastlagt plan der viser flugtveje, samlingspladser og procedurer for sikker evakuering ved brand, gasudslip eller anden fare',
        'En plan for at flytte lageret til en ny lokation',
        'En plan for at reducere antallet af ansatte'
    ],
    correct: 1,
    explanation: 'Evakueringsplanen skal kendes af alle: Hvor er nødudgangene? Hvor er samlingsstedet? Hvem tæller folk? Hvem kontakter beredskabet? Planen skal øves min. en gang om året. Planer hænger synligt i lageret med kort over flugtuveje.'
},

// ============================
// EKSTRA: AVANCERET LOGISTIK & TRENDS (206-225)
// ============================
{
    id: 206,
    category: 'Generelt Logistik',
    q: 'Hvad er "omnichannel logistics"?',
    options: [
        'At bruge kun én salgskanal ad gangen',
        'Logistik der integrerer alle salgskanaler (butik, webshop, app, marketplace) så kunden oplever en sømløs oplevelse uanset kanal',
        'En tv-kanal udelukkende om logistik',
        'At have separate lagre for hver salgskanal'
    ],
    correct: 1,
    explanation: 'Omnichannel: kunden bestiller online, returnerer i butik. Eller køber i butik, får leveret hjem. Lageret skal servicere alle kanaler fra ét sted. Det kræver fleksible WMS-systemer, integration og realtidsoverblik over beholdning på tværs af alle salgskanaler.'
},
{
    id: 207,
    category: 'Generelt Logistik',
    q: 'Hvad er en AGV (Automated Guided Vehicle)?',
    options: [
        'Et automatisk genereret vognnummer til lastbiler',
        'Et førerløst køretøj der navigerer autonomt i lageret via magneter, sensorer eller lasere for at transportere varer',
        'Et system til automatisk at guide gæster rundt på lagerbesøg',
        'Et køretøj med automatik gearkasse'
    ],
    correct: 1,
    explanation: 'AGVer kører selv rundt i lageret og transporterer paller, kasser eller reoler. De følger magnetbånd i gulvet, bruger lasersensorer eller kameraer til navigation. De kører 24/7, aldrig holder frokostpause, og reducerer ulykker med gaffeltrucks.'
},
{
    id: 208,
    category: 'Generelt Logistik',
    q: 'Hvad er en AMR (Autonomous Mobile Robot)?',
    options: [
        'En automatisk murer-robot til bygning af lagerhaller',
        'En avanceret lagerrobot der navigerer selvstændigt uden faste ruter — bruger kameraer, sensorer og AI til at finde vej',
        'Et antimissil-radarsystem til nationale lagre',
        'En automatisk mailrobot der distribuerer post i kontoret'
    ],
    correct: 1,
    explanation: 'AMR er næste generation efter AGV. Hvor AGVer følger faste ruter (magneter/bånd), navigerer AMRer frit ved hjælp af kameraer, lidar og AI. De kan undvige forhindringer, finde korteste rute og tilpasse sig ændringer i lagerlayoutet. Fx Amazons Kiva-robotter.'
},
{
    id: 209,
    category: 'Generelt Logistik',
    q: 'Hvad er "goods-to-person" (GTP) teknologi?',
    options: [
        'En leveringsservice der bringer dagligvarer til ældre borgere',
        'Robotter eller automatiserede systemer der bringer varerne hen til plukkeren i stedet for at plukkeren går hen til varerne',
        'En person der manuelt bærer gods fra A til B',
        'En type kundeservice-chat om godsleverancer'
    ],
    correct: 1,
    explanation: 'GTP vender traditionelt lagerprincipper på hovedet: plukkeren står stille, og robotter (fx AutoStore, Kiva) bringer de rigtige hylder/kasser til plukkestationen. Det eliminerer gangafstand, øger plukhastigheden 4-5 gange og reducerer pladsbehov.'
},
{
    id: 210,
    category: 'Generelt Logistik',
    q: 'Hvad er "AutoStore" i lagersammenhæng?',
    options: [
        'En funktion i WMS der automatisk gemmer dokumenter',
        'Et automatisk butikskoncept uden personale',
        'Et robotbaseret lagersystem hvor robotter kører oven på et gitter og henter kasser fra en tætpakket stabel — ekstremt pladsbesparende',
        'Et automatisk dørsystem til lagerporten'
    ],
    correct: 2,
    explanation: 'AutoStore: plastikbeholdere stables tæt i et gitter. Robotter kører oven på gitteret og graver de rigtige kasser frem. Plukkeren står ved en port (port), og robotten bringer kassen til dem. Det udnytter 4 gange mindre plads end traditionelle lager. Norsk opfindelse.'
},
{
    id: 211,
    category: 'Generelt Logistik',
    q: 'Hvad er "predictive analytics" i logistik?',
    options: [
        'Software der forudsiger hvornår medarbejdere vil sige op',
        'Brugen af historiske data, maskinlæring og statistik til at forudsige fremtidige begivenheder som efterspørgsel, forsinkelser eller maskinnedbrud',
        'Analytiske beregninger der altid forudsiger det rigtige — med 100% nøjagtighed',
        'En type psykisk evne mennesker i logistik udvikler over tid'
    ],
    correct: 1,
    explanation: 'Predictive analytics: algoritmer analyserer store datamængder og identificerer mønstre. Fx: "baseret på tidligere data og vejrudsigten vil efterspørgslen stige 15% i uge 48." Eller: "Transportforsinkelse sandsynlig på rute X pga. vejarbejde." Det giver proaktiv handling.'
},
{
    id: 212,
    category: 'Generelt Logistik',
    q: 'Hvad er "dark warehouse" (mørkt lager)?',
    options: [
        'Et lager med defekt belysning',
        'Et fuldt automatiseret lager der kører uden mennesker og lys — robotter behøver ikke lys og kan arbejde 24/7 i mørke',
        'Et lager der kun er åbent om natten',
        'Et lager med sortmalede vægge for at reducere refleksioner'
    ],
    correct: 1,
    explanation: 'Dark warehouse: ingen mennesker, intet lys nødvendigt. Robotter og AS/RS-systemer klarer al ind- og udlagring, plukning og transport. Fordelene: lavere energiforbrug (intet lys, ingen opvarmning), 24/7 drift, ingen personalomkostninger, færre fejl.'
},
{
    id: 213,
    category: 'Generelt Logistik',
    q: 'Hvad er "e-commerce fulfillment"?',
    options: [
        'At opfylde medarbejdernes drømme om at arbejde i e-handel',
        'Den samlede proces fra onlineordre til levering: modtag ordre, pluk, pak, forsend, levér og håndtér eventuelle returneringer',
        'At oprette en e-commerce hjemmeside',
        'At sende reklame-emails til kunder'
    ],
    correct: 1,
    explanation: 'E-commerce fulfillment er hele ordreprocessen: ordremodtagelse fra webshoppen → plukning → pakning (ofte individuelt tilpasset) → forsendelse → track-and-trace → evt. returnering. Hastighed og præcision er afgørende — kunden forventer 1-2 dages levering.'
},
{
    id: 214,
    category: 'Generelt Logistik',
    q: 'Hvad er "dropshipping"?',
    options: [
        'En model hvor sælger aldrig har varerne fysisk — ordrer sendes direkte fra leverandøren til slutkunden',
        'En teknik til at droppe pakker fra droner',
        'At slippe varer ned fra øverste hylde',
        'En metode til at skippere varer over vand'
    ],
    correct: 0,
    explanation: 'Dropshipping: du sælger varer i din webshop, men ejer intet lager. Når kunden bestiller, sendes ordren til din leverandør, som sender direkte til kunden i dit navn. Fordel: ingen lagerrisiko. Ulempe: lavere marginer, ingen kontrol over kvalitet/levering.'
},
{
    id: 215,
    category: 'Generelt Logistik',
    q: 'Hvad er "micro-fulfillment center" (MFC)?',
    options: [
        'En lillebitte fabrik der fremstiller mikrochips',
        'Et lille, ofte automatiseret lager placeret tæt på slutkunden (fx i baglokalet af et supermarked) for ultrahurtig levering',
        'Et minimalt kontor til administration af opfyldningsordrer',
        'Et center der måler mikrobølger fra lagerudstyr'
    ],
    correct: 1,
    explanation: 'MFC: minilagre (500-3000 m²) placeret i byer, tæt på kunderne. Ofte med AutoStore eller shuttlesystemer. De muliggør levering inden for 1-2 timer. Brugt af supermarkeder til online dagligvarerer og af retailere til same-day delivery. Tendensen vokser eksplosivt.'
},
{
    id: 216,
    category: 'Generelt Logistik',
    q: 'Hvad er "dronelevering" i logistik?',
    options: [
        'At en drone overvåger medarbejderne',
        'Brug af ubemandede flyvende droner til at levere pakker direkte til kundens dør — typisk for lette pakker over korte afstande',
        'At bruge droner til at optage reklamefilm for logistikfirmaer',
        'En metode til at inspicere taget på lagerbygningen'
    ],
    correct: 1,
    explanation: 'Dronelevering: droner flyver pakker (typisk under 5 kg) direkte til kunden over 5-15 km. Testpilotprojekter kører hos Amazon (Prime Air), Google (Wing) og andre. Udfordringer: regulering, rækkevidde, vægt, vejrforhold, støj og luftrumskontrol.'
},
{
    id: 217,
    category: 'Lagerstyring',
    q: 'Hvad er Wilsons formel (EOQ) brugt til?',
    options: [
        'At beregne den optimale ordrestørrelse der minimerer de samlede lager- og ordreomkostninger',
        'At beregne lagerbygningens optimale temperatur',
        'At beregne hvor mange medarbejdere der skal ansættes',
        'At beregne transporttiden mellem to byer'
    ],
    correct: 0,
    explanation: 'EOQ (Economic Order Quantity) = √(2DS/H), hvor D = årligt forbrug, S = ordreomkostning, H = lageromkostning per enhed per år. Den finder det sweet spot hvor man bestiller nok til at holde ordreomkostningerne lave, men ikke så meget at lageromkostningerne eksploderer.'
},
{
    id: 218,
    category: 'Lagerstyring',
    q: 'Hvad er en genbestillingspunkt (reorder point)?',
    options: [
        'Det tidspunkt på dagen hvor man helst skal genbestille (kl. 9.00)',
        'Den lagerbeholdning hvor man skal bestille nye varer for at undgå at gå tom — beregnet som forbrug i leveringstiden + sikkerhedslager',
        'Det punkt i lageret hvor genbrugsaffald opsamles',
        'Den dato hvor leverandøren genbestiller fra sin leverandør'
    ],
    correct: 1,
    explanation: 'Genbestillingspunkt = dagsforbrug × leveringstid + sikkerhedslager. Fx: bruger du 10 stk./dag, og leveringstid er 5 dage, med sikkerhedslager 20 stk., er dit genbestillingspunkt 10×5+20 = 70 stk. Når lageret rammer 70, bestiller du.'
},
{
    id: 219,
    category: 'Lagerstyring',
    q: 'Hvad er "sæsonlager"?',
    options: [
        'Et midlertidigt lager der kun eksisterer om sommeren',
        'Ekstra lager der opbygges før en forventet sæsonmæssig stigning i efterspørgslen',
        'Et lager til opbevaring af julepynt og påskeæg',
        'Et lager med naturlig ventilation der kun virker i foråret'
    ],
    correct: 1,
    explanation: 'Sæsonlager: man producerer eller indkøber på forhånd for at være klar til sæsonen. Fx bygger isgrossisten lager op i vinter/forår for at dække sommerens efterspørgsel. Det udjævner produktionen men binder kapital og kræver plads. Alternativ: fleksibel kapacitet.'
},
{
    id: 220,
    category: 'Generelt Logistik',
    q: 'Hvad er formålet med et "control tower" i supply chain?',
    options: [
        'Et højt kontroltårn midt i lageret for at overvåge medarbejderne',
        'Et flyveledertårn i en lufthavn',
        'En central funktion der giver realtidsoverblik over hele forsyningskæden og muliggør proaktiv styring af forsinkelser og problemer',
        'Et tårn af containere stablet oven på hinanden'
    ],
    correct: 2,
    explanation: 'Supply chain control tower: et centralt overblikscenter med dashboards der viser status i realtid — hvor er varerne, er noget forsinket, hvad er lagerniveauerne, hvor er der risici? Det giver evnen til at handle proaktivt i stedet for at reagere, når problemet allerede er opstått.'
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
// 50 statements covering all categories
// ============================================================

const learnTrueFalseBank = [
// --- Lagerstyring ---
{ statement: 'FIFO betyder at de ældste varer udleveres først.', answer: true, explanation: 'Korrekt — First In, First Out sikrer, at varer med ældst modtagelsesdato sendes ud først. Vigtigt for fødevarer og varer med udløbsdato.' },
{ statement: 'Et sikkerhedslager er kun nødvendigt for A-varer i en ABC-analyse.', answer: false, explanation: 'Forkert — alle varekategorier kan have sikkerhedslager, men størrelsen og beregningen varierer. A-varer kræver typisk mere præcist beregnet sikkerhedslager.' },
{ statement: 'I et flydende lagerplads-system har varer ikke en fast reserveret plads.', answer: true, explanation: 'Korrekt — varer placeres på den første ledige plads. Det giver bedre pladsudnyttelse, men kræver et WMS-system til at holde styr på lokationerne.' },
{ statement: 'Lageromsætningshastighed beregnes som gennemsnitslager divideret med årsforbrug.', answer: false, explanation: 'Forkert — det er omvendt: lageromsætningshastighed = årligt forbrug / gennemsnitslager. Jo højere tal, jo mere effektiv omsætning af varer.' },
{ statement: 'Genbestillingspunktet (ROP) beregnes som dagsforbrug × leveringstid + sikkerhedslager.', answer: true, explanation: 'Korrekt — ROP = (d × L) + SS. Det sikrer, at man bestiller nye varer i tide, så lageret ikke løber tørt inden leverancen ankommer.' },
{ statement: 'ABC-analyse bygger på Pareto-princippet (80/20-reglen).', answer: true, explanation: 'Korrekt — ca. 20% af varerne udgør typisk 80% af den samlede lagerværdi (A-varer). Derfor prioriterer man sin styring efter varernes vigtighed.' },
{ statement: 'A-varer i en ABC-analyse udgør typisk 50% af varerne og 50% af værdien.', answer: false, explanation: 'Forkert — A-varer udgør typisk kun ca. 20% af antallet, men hele ca. 80% af den samlede værdi. Det er netop pointen med ABC-analyse.' },
{ statement: 'Cyklisk optælling erstatter den årlige totaltælling med løbende optælling af udvalgte varer.', answer: true, explanation: 'Korrekt — man tæller løbende: fx A-varer ugentligt, B-varer månedligt, C-varer kvartalsvis. Det holder lagersaldoen mere nøjagtig hele året.' },

// --- Lean ---
{ statement: '5S står for: Sortér, Systematisér, Skinnende rent, Standardisér, Selvdisciplin.', answer: true, explanation: 'Korrekt — de 5S (Seiri, Seiton, Seiso, Seiketsu, Shitsuke) er fundamentet for en velorganiseret arbejdsplads i Lean.' },
{ statement: 'Muda betyder "værdi" på japansk.', answer: false, explanation: 'Forkert — Muda betyder spild. Alt der ikke skaber værdi for kunden betragtes som spild i Lean-tankegang.' },
{ statement: 'Kanban er et pull-baseret system, der styrer produktion efter reelt forbrug.', answer: true, explanation: 'Korrekt — først når en vare er brugt, sendes et signal om genopfyldning. Det modvirker overproduktion og for store lagre.' },
{ statement: 'Kaizen handler om store, sjældne forandringsprocesser.', answer: false, explanation: 'Forkert — Kaizen handler om mange små, daglige forbedringer. Det er det modsatte af store engangstransformationer.' },
{ statement: 'OEE beregnes som Tilgængelighed × Ydelse × Kvalitet.', answer: true, explanation: 'Korrekt — OEE (Overall Equipment Effectiveness) = A × P × Q. Verdensklasse er typisk 85% eller derover.' },
{ statement: 'Just-in-Time (JIT) kræver store sikkerhedslagre for at fungere.', answer: false, explanation: 'Forkert — JIT handler netop om at minimere lager. Varer ankommer præcis når de skal bruges. Store lagre modarbejder JIT-princippet.' },
{ statement: 'Poka-Yoke er en fejlsikringsteknik der forhindrer eller opdager fejl med det samme.', answer: true, explanation: 'Korrekt — Poka-Yoke designer processer, så fejl enten ikke kan ske, eller opdages straks. Et USB-stik der kun passer én vej er et godt eksempel.' },
{ statement: 'En Gemba-walk bruges af ledere til at observere arbejdsprocesser direkte på gulvet.', answer: true, explanation: 'Korrekt — Gemba = "det virkelige sted". Lederen går ud på gulvet for at se, spørge og forstå — ikke for at kontrollere.' },
{ statement: 'Value Stream Mapping (VSM) er et regnskabsværktøj til at beregne lagerværdi.', answer: false, explanation: 'Forkert — VSM er en Lean-teknik, der visuelt kortlægger alle trin i en proces fra start til slut for at identificere spild og forbedringspotentiale.' },

// --- Supply Chain ---
{ statement: 'Bullwhip-effekten beskriver, at små udsving i efterspørgsel forstærkes op gennem forsyningskæden.', answer: true, explanation: 'Korrekt — en lille ændring hos slutkunden kan skabe store ordresvingninger længere oppe i kæden, fordi hvert led overreagerer.' },
{ statement: 'TCO inkluderer kun selve indkøbsprisen for en vare.', answer: false, explanation: 'Forkert — TCO (Total Cost of Ownership) inkluderer alle omkostninger: indkøb, transport, lager, vedligehold, bortskaffelse osv.' },
{ statement: 'Cross-docking eliminerer lageropbevaring ved at omlaste direkte fra indgående til udgående transport.', answer: true, explanation: 'Korrekt — varer sorteres og sendes videre med det samme, uden at blive lagt på lager. Det sparer tid og plads.' },
{ statement: 'I en forsyningskæde er det altid billigst at have kun ét centralt lager.', answer: false, explanation: 'Forkert — det optimale antal lagre afhænger af transportomkostninger, leveringstider og kundeservice-krav. Flere lagre kan give bedre service.' },
{ statement: 'Sidste kilometer-levering (last mile) er typisk den dyreste del af fragtprocessen.', answer: true, explanation: 'Korrekt — op til 50% af fragtens totalomkostning kan ligge i sidste kilometer, fordi der er mange individuelle stop med små leverancer.' },
{ statement: '3PL står for Third Party Logistics og handler om outsourcing af logistikoperationer.', answer: true, explanation: 'Korrekt — 3PL-udbydere varetager lager, distribution og transport for andre virksomheder, så de kan fokusere på deres kerneprodukter.' },
{ statement: 'Lead time er den tid en medarbejder bruger på frokostpause.', answer: false, explanation: 'Forkert — lead time er den samlede tid fra bestilling afgives til varerne er modtaget og klar til brug. Det er en af de vigtigste KPIer i logistik.' },

// --- Leveringsbetingelser ---
{ statement: 'Franco levering betyder at sælger betaler fragten til leveringsstedet.', answer: true, explanation: 'Korrekt — franco = frit leveret. Sælger betaler transporten. Mange leverandører har en beløbsgrænse for franco-levering.' },
{ statement: 'Ufranco levering betyder at varerne er gratis for kunden.', answer: false, explanation: 'Forkert — ufranco betyder at kunden betaler fragten. Det har ingenting med varens pris at gøre.' },
{ statement: 'Incoterms er internationale handelsregler udgivet af ICC.', answer: true, explanation: 'Korrekt — Incoterms standardiserer ansvar og omkostningsfordeling mellem køber og sælger i international handel.' },
{ statement: 'EXW (Ex Works) giver mest ansvar til sælgeren af alle Incoterms.', answer: false, explanation: 'Forkert — EXW giver MINDST ansvar til sælgeren. Sælger gør kun varen klar til afhentning. Alt andet er købers risiko og omkostning.' },

// --- ERP & IT ---
{ statement: 'ERP står for Enterprise Resource Planning og er et samlet IT-system for hele virksomheden.', answer: true, explanation: 'Korrekt — ERP integrerer økonomi, lager, indkøb, produktion, HR m.m. i én database, så alle arbejder med de samme data.' },
{ statement: 'Et WMS-system styrer kun kasseopgørelser og regnskab.', answer: false, explanation: 'Forkert — WMS (Warehouse Management System) styrer lageroperationer: modtagelse, placering, plukning, pakning og forsendelse.' },
{ statement: 'RFID kan aflæses uden direkte synslinje, i modsætning til stregkoder.', answer: true, explanation: 'Korrekt — RFID bruger radiobølger og kan læses gennem emballage og på afstand. Stregkoder kræver direkte synslinje.' },
{ statement: 'EDI bruges til at sende ferieansøgninger mellem medarbejdere.', answer: false, explanation: 'Forkert — EDI (Electronic Data Interchange) er elektronisk udveksling af forretningsdokumenter (ordrer, fakturaer, forsendelsesdata) mellem virksomheders IT-systemer.' },

// --- Transport ---
{ statement: 'Intermodal transport kombinerer flere transportformer, fx lastbil, tog og skib.', answer: true, explanation: 'Korrekt — intermodal transport udnytter styrkerne ved flere transportformer for at optimere pris, hastighed og miljøbelastning.' },
{ statement: 'Et CMR-fragtbrev er kun påkrævet ved indenrigs transport i Danmark.', answer: false, explanation: 'Forkert — CMR bruges ved international vejtransport i Europa. Det dokumenterer fragtaftalen og godsdetaljerne.' },
{ statement: 'Kabotage er indenrigskørsel i et land udført af et udenlandsk transportfirma.', answer: true, explanation: 'Korrekt — fx en polsk vognmand der kører en tur fra Aalborg til København. EU har regler der begrænser antal kabotage-ture.' },

// --- Sikkerhed ---
{ statement: 'ADR regulerer vejtransport af farligt gods i Europa.', answer: true, explanation: 'Korrekt — ADR sikrer, at farligt gods (kemikalier, brændstoffer, eksplosiver) transporteres sikkert med korrekt mærkning, emballage og dokumentation.' },
{ statement: 'Man kan køre gaffeltruck uden certifikat, hvis man har et almindeligt kørekort.', answer: false, explanation: 'Forkert — gaffeltruckkørsel kræver et specielt truckcertifikat efter bestået teori og praktisk prøve.' },
{ statement: 'Korrekt løfteteknik er: bøjede knæ, ret ryg og byrden tæt ved kroppen.', answer: true, explanation: 'Korrekt — forkert løfteteknik er en af de mest almindelige årsager til rygskader i lagerjobs.' },
{ statement: 'SDS (Safety Data Sheet) indeholder oplysninger om kemikaliers farlighed og håndtering.', answer: true, explanation: 'Korrekt — sikkerhedsdatablade er lovpligtige for farlige kemikalier og indeholder 16 sektioner om alt fra fareidentifikation til bortskaffelse.' },
{ statement: 'Sikkerhedssko med stålnæse er kun påkrævet i fødevarelagre.', answer: false, explanation: 'Forkert — sikkerhedssko er typisk påkrævet i de fleste lagertyper for at beskytte mod faldende genstande og klemskader.' },

// --- Virksomhed & Økonomi ---
{ statement: 'Dækningsbidrag beregnes som salgspris minus variable omkostninger.', answer: true, explanation: 'Korrekt — dækningsbidraget skal "dække" de faste omkostninger. Det der er til overs derefter er overskud.' },
{ statement: 'Dækningsbidrag beregnes som salgspris minus faste omkostninger.', answer: false, explanation: 'Forkert — dækningsbidrag = salgspris minus VARIABLE omkostninger. De faste omkostninger trækkes fra dækningsbidraget for at finde resultatet (overskud/underskud).' },
{ statement: 'Break-even er det punkt hvor omsætningen præcis dækker alle omkostninger.', answer: true, explanation: 'Korrekt — ved break-even er profit = 0. Virksomheden hverken tjener eller taber penge.' },
{ statement: 'Variable omkostninger er konstante uanset produktionsmængden.', answer: false, explanation: 'Forkert — variable omkostninger ændrer sig med aktiviteten. Flere producerede enheder = højere variable omkostninger (råvarer, emballage osv.).' },
{ statement: 'Lageromkostninger udgør typisk 15-30% af varens værdi per år.', answer: true, explanation: 'Korrekt — det inkluderer kapitalbinding, forsikring, svind, forældelse, lagerplads og håndtering.' },
{ statement: 'KPI står for Key Performance Indicator og bruges til at måle præstation.', answer: true, explanation: 'Korrekt — KPIer omsætter strategi til målbare tal, fx leveringspræcision, lageromsætning og plukkefejlrate.' },

// --- Generelt Logistik ---
{ statement: 'Wilsons EOQ-formel finder den ordrestørrelse der minimerer samlede lageromkostninger.', answer: true, explanation: 'Korrekt — EOQ = √(2DS/H) minimerer summen af ordreomkostninger og lageromkostninger.' },
{ statement: 'ISO 9001 er en standard for truckcertificering.', answer: false, explanation: 'Forkert — ISO 9001 er en international standard for kvalitetsledelsessystemer. Den handler om virksomhedens kvalitetsstyring, ikke om truckkørsel.' },
{ statement: 'Reverse logistics handler om returnering, genanvendelse og bortskaffelse af produkter.', answer: true, explanation: 'Korrekt — reverse logistics er logistikken "den anden vej" — fra kunde tilbage til virksomheden eller til genbrug/bortskaffelse.' },
{ statement: 'Lean warehousing handler udelukkende om at reducere antallet af medarbejdere.', answer: false, explanation: 'Forkert — lean warehousing handler om at fjerne spild i processer og øge effektiviteten. Det handler om smartere arbejde, ikke nødvendigvis færre medarbejdere.' },
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
                        ${!isCorrect ? `<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${q.explanation}</p>` : ''}
                    </div>
                </div>
            </div>`;
        });
        html += `</div>`;

        html += `
            <div class="flex flex-wrap gap-3 justify-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button onclick="LearnTrueFalse.start(${this.questions.length})" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors">🔄 Prøv igen</button>
                <button onclick="LearnTrueFalse.backToMenu()" class="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold transition-colors">← Tilbage</button>
            </div>
        `;
        results.innerHTML = html;
    },

    backToMenu() {
        if (this.timerId) { clearInterval(this.timerId); this.timerId = null; }
        document.getElementById('tfModeSelect').classList.remove('hidden');
        document.getElementById('tfArea').classList.add('hidden');
        document.getElementById('tfResults').classList.add('hidden');
    }
};


// ============================================================
// CATEGORY QUIZ
// ============================================================

const CategoryQuiz = {
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
