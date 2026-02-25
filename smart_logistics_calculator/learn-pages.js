/* ============================================================
   LEARN PAGES — Enhanced Education Module
   Smart Logistics Calculator v2.0
   ============================================================
   4-Page Structure:
   1. Hurtig Startguide — Interactive step-by-step onboarding
   2. Teori & Koncepter — Comprehensive theory with accordion
   3. Best Practices    — Domain-tabbed tips, checklists, do/don'ts
   4. Praktiske Øvelser — Guided exercises + quiz engines
   ============================================================ */

(function () {
    'use strict';

    /* ──────────────────────────────────────────────
       PROGRESS TRACKING (localStorage)
       ────────────────────────────────────────────── */
    const STORAGE_KEY = 'learnPagesProgress';

    function getProgress() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
    }
    function saveProgress(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
    window.markLearnStep = function (section, stepId) {
        const p = getProgress();
        if (!p[section]) p[section] = {};
        p[section][stepId] = true;
        saveProgress(p);
        updateProgressUI();
        // visual feedback on the checkbox
        const cb = document.querySelector(`[data-learn-check="${section}:${stepId}"]`);
        if (cb) {
            cb.checked = true;
            cb.closest('.learn-step-card')?.classList.add('learn-step-done');
        }
    };
    window.unmarkLearnStep = function (section, stepId) {
        const p = getProgress();
        if (p[section]) { delete p[section][stepId]; }
        saveProgress(p);
        updateProgressUI();
        const cb = document.querySelector(`[data-learn-check="${section}:${stepId}"]`);
        if (cb) {
            cb.checked = false;
            cb.closest('.learn-step-card')?.classList.remove('learn-step-done');
        }
    };
    function isStepDone(section, stepId) {
        const p = getProgress();
        return !!(p[section] && p[section][stepId]);
    }
    function countDone(section) {
        const p = getProgress();
        return p[section] ? Object.keys(p[section]).length : 0;
    }

    function updateProgressUI() {
        const totalGuide = 6, totalExercises = 8;
        const doneGuide = countDone('startguide');
        const doneExercises = countDone('exercises');
        const total = totalGuide + totalExercises;
        const done = Math.min(doneGuide, totalGuide) + Math.min(doneExercises, totalExercises);
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;

        const bar = document.getElementById('learnOverallProgress');
        const txt = document.getElementById('learnOverallProgressText');
        if (bar) bar.style.width = pct + '%';
        if (txt) txt.textContent = pct + '% fuldført';

        // badge counts
        const gb = document.getElementById('learnGuideBadge');
        const eb = document.getElementById('learnExBadge');
        if (gb) gb.textContent = doneGuide + '/' + totalGuide;
        if (eb) eb.textContent = doneExercises + '/' + totalExercises;
    }

    /* ──────────────────────────────────────────────
       PAGE SWITCHING (top-level 4 pages)
       ────────────────────────────────────────────── */
    window.switchLearnPage = function (page) {
        const pages = ['startguide', 'theory', 'bestpractices', 'exercises'];
        pages.forEach(function (p) {
            const content = document.getElementById('learnPageContent-' + p);
            const tab = document.getElementById('learnPage-' + p);
            if (!content || !tab) return;
            if (p === page) {
                content.classList.remove('hidden');
                tab.classList.add('learn-page-tab-active');
                tab.classList.remove('border-transparent', 'text-gray-500', 'dark:text-gray-400');
            } else {
                content.classList.add('hidden');
                tab.classList.remove('learn-page-tab-active');
                tab.classList.add('border-transparent', 'text-gray-500', 'dark:text-gray-400');
            }
        });
    };

    /* ──────────────────────────────────────────────
       ACCORDION TOGGLE (Theory, Best Practices)
       ────────────────────────────────────────────── */
    window.toggleLearnAccordion = function (id) {
        const el = document.getElementById(id);
        const icon = document.getElementById(id + '-icon');
        if (!el) return;
        const isHidden = el.classList.contains('hidden');
        el.classList.toggle('hidden');
        if (icon) icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
    };

    /* ──────────────────────────────────────────────
       BEST PRACTICES TAB SWITCHING
       ────────────────────────────────────────────── */
    window.switchBPTab = function (tab) {
        const tabs = ['abc', 'eoq', 'lagerstyring', 'lean', 'budget', 'generelt'];
        tabs.forEach(function (t) {
            const panel = document.getElementById('bp-panel-' + t);
            const btn = document.getElementById('bp-tab-' + t);
            if (!panel || !btn) return;
            if (t === tab) {
                panel.classList.remove('hidden');
                btn.classList.add('bp-tab-active');
            } else {
                panel.classList.add('hidden');
                btn.classList.remove('bp-tab-active');
            }
        });
    };

    /* ══════════════════════════════════════════════
       PAGE 1: HURTIG STARTGUIDE
       ══════════════════════════════════════════════ */
    function renderStartguide() {
        const c = document.getElementById('startguideContainer');
        if (!c) return;

        const steps = [
            {
                id: 'step1', icon: '⚙️', color: 'blue',
                title: 'Aktiver Uddannelsestilstand',
                desc: 'Gå til <strong>Indstillinger</strong> (tandhjul-ikon) og slå <strong>Uddannelsestilstand</strong> til. Derved får du adgang til hele lærings-sektionen, inkl. quiz, teori og øvelser.',
                action: '<button onclick="switchTab(\'settings\')" class="learn-action-btn bg-blue-600 hover:bg-blue-700">⚙️ Åbn Indstillinger</button>'
            },
            {
                id: 'step2', icon: '📂', color: 'green',
                title: 'Upload eller Indlæs Data',
                desc: 'Gå til <strong>ABC Analyse</strong>-fanen. Du kan enten uploade din egen CSV/Excel-fil (med kolonner: Varenavn, Forbrug, Pris) eller bruge et af de indbyggede eksempel-datasæt.',
                action: '<button onclick="switchTab(\'abc\')" class="learn-action-btn bg-green-600 hover:bg-green-700">📊 Gå til ABC-analyse</button>'
            },
            {
                id: 'step3', icon: '📊', color: 'purple',
                title: 'Kør ABC-Analyse',
                desc: 'Klik <strong>"Analyser Data"</strong> for at klassificere dine varer i A-, B- og C-kategorier. Se Pareto-diagrammet for at forstå fordelingen. A-varer udgør typisk 80% af den samlede værdi.',
                action: '<button onclick="switchTab(\'abc\')" class="learn-action-btn bg-purple-600 hover:bg-purple-700">📊 Kør analyse</button>'
            },
            {
                id: 'step4', icon: '📐', color: 'orange',
                title: 'Beregn Optimal Ordrestørrelse (EOQ)',
                desc: 'Brug <strong>Wilson EOQ-beregneren</strong> til at finde den optimale ordremængde. Indtast <em>Årligt Forbrug (D)</em>, <em>Ordreomkostning (S)</em>, <em>Pris</em> og <em>Rente</em>. Eller brug <strong>Batch Wilson</strong> til at beregne for flere varer på én gang.',
                action: '<button onclick="switchTab(\'wilson\')" class="learn-action-btn bg-orange-600 hover:bg-orange-700">📐 Wilson-beregner</button>'
            },
            {
                id: 'step5', icon: '📦', color: 'teal',
                title: 'Tjek Lagerstatus (ROP, Min/Max)',
                desc: 'Gå til <strong>Lagerstyring</strong> for at beregne <em>Genbestillingspunkt (ROP)</em>, <em>Sikkerhedslager</em>, <em>Periodisk gennemgang</em> og <em>Min/Max-niveauer</em>. Vælg den model der passer til dine varer.',
                action: '<button onclick="switchTab(\'inventory\')" class="learn-action-btn bg-teal-600 hover:bg-teal-700">📦 Lagerstyring</button>'
            },
            {
                id: 'step6', icon: '💾', color: 'pink',
                title: 'Eksporter Resultater',
                desc: 'Download resultater som <strong>CSV, Excel, PDF</strong> eller udskriv rapporter. Gå til <strong>Eksportcenter</strong> for samlet eksport, eller brug knapperne i de enkelte faner.',
                action: '<button onclick="switchTab(\'export\')" class="learn-action-btn bg-pink-600 hover:bg-pink-700">💾 Eksportcenter</button>'
            }
        ];

        let html = '';

        // Header
        html += `
        <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">🚀 Hurtig Startguide</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">Følg disse 6 trin for at komme i gang med Smart Logistics Calculator. Marker hvert trin som fuldført efterhånden.</p>
            <div class="mt-3 flex items-center gap-3">
                <div class="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div id="startguideProgressBar" class="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500" style="width:0%"></div>
                </div>
                <span id="learnGuideBadge" class="text-xs font-bold text-gray-500 dark:text-gray-400">0/6</span>
            </div>
        </div>`;

        // Steps
        html += '<div class="space-y-4">';
        steps.forEach(function (s, i) {
            const done = isStepDone('startguide', s.id);
            html += `
            <div class="learn-step-card ${done ? 'learn-step-done' : ''} bg-white dark:bg-gray-800/80 rounded-xl border-2 ${done ? 'border-green-300 dark:border-green-700' : 'border-gray-200 dark:border-gray-700'} overflow-hidden transition-all hover:shadow-lg">
                <div class="flex items-center gap-4 p-4 cursor-pointer" onclick="toggleLearnAccordion('startguide-step-${s.id}')">
                    <div class="flex-shrink-0 w-10 h-10 rounded-full bg-${s.color}-100 dark:bg-${s.color}-900/30 flex items-center justify-center text-xl">${s.icon}</div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-bold text-${s.color}-600 dark:text-${s.color}-400 uppercase tracking-wide">Trin ${i + 1}</span>
                            ${done ? '<span class="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">✓ Fuldført</span>' : ''}
                        </div>
                        <h3 class="font-bold text-gray-900 dark:text-white text-sm mt-0.5">${s.title}</h3>
                    </div>
                    <label class="flex items-center gap-2 cursor-pointer" onclick="event.stopPropagation()">
                        <input type="checkbox" ${done ? 'checked' : ''} data-learn-check="startguide:${s.id}"
                            onchange="this.checked ? markLearnStep('startguide','${s.id}') : unmarkLearnStep('startguide','${s.id}')"
                            class="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 text-green-500 focus:ring-green-400 cursor-pointer">
                    </label>
                    <span id="startguide-step-${s.id}-icon" class="text-gray-400 transition-transform duration-200 text-lg">▼</span>
                </div>
                <div id="startguide-step-${s.id}" class="hidden border-t border-gray-100 dark:border-gray-700 px-4 pb-4 pt-3 bg-gray-50/50 dark:bg-gray-900/30">
                    <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">${s.desc}</p>
                    ${s.action}
                </div>
            </div>`;
        });
        html += '</div>';

        // Try It Now section
        html += `
        <div class="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800">
            <div class="flex items-center gap-3 mb-4">
                <span class="text-4xl">⚡</span>
                <div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">Prøv det nu!</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Indlæs eksempeldata og klik "Analyser data" for at se systemet i aktion</p>
                </div>
            </div>
            <div class="grid md:grid-cols-3 gap-3">
                <button onclick="loadSampleDataset('retail'); switchTab('abc')" class="p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-blue-300 dark:border-blue-700 hover:shadow-xl hover:scale-[1.03] transition-all text-left">
                    <div class="text-3xl mb-2">🏪</div>
                    <h4 class="font-bold text-gray-900 dark:text-gray-100 text-sm">Butik (15 varer)</h4>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Simpelt — perfekt til at starte</p>
                </button>
                <button onclick="loadSampleDataset('warehouse'); switchTab('abc')" class="p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-green-300 dark:border-green-700 hover:shadow-xl hover:scale-[1.03] transition-all text-left">
                    <div class="text-3xl mb-2">📦</div>
                    <h4 class="font-bold text-gray-900 dark:text-gray-100 text-sm">Lager (50 varer)</h4>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Mellemstor sværhedsgrad</p>
                </button>
                <button onclick="loadSampleDataset('manufacturing'); switchTab('abc')" class="p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-purple-300 dark:border-purple-700 hover:shadow-xl hover:scale-[1.03] transition-all text-left">
                    <div class="text-3xl mb-2">🏭</div>
                    <h4 class="font-bold text-gray-900 dark:text-gray-100 text-sm">Produktion (100 varer)</h4>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Avancerede eksempler</p>
                </button>
            </div>
        </div>`;

        // FAQ section
        html += `
        <div class="mt-8">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">❓ Ofte Stillede Spørgsmål</h3>
            <div class="space-y-3">
                ${renderFAQ('faq1', 'Hvad er forskellen på ABC og ABC Dobbelt?', 'Standard ABC klassificerer kun efter <strong>værdi</strong> (forbrug × pris). ABC Dobbelt bruger <strong>to dimensioner</strong> — både værdi og forbrugsmængde — og skaber en 3×3 matrix (AA, AB, AC, BA, BB, BC, CA, CB, CC) der giver en mere nuanceret klassificering.')}
                ${renderFAQ('faq2', 'Hvornår skal jeg bruge Wilson EOQ?', 'Wilson EOQ bruges når du vil finde den <strong>optimale ordrestørrelse</strong> der minimerer de samlede lageromkostninger. Den er mest nøjagtig ved jævnt forbrug og kendte ordreomkostninger. For varer med meget svingende efterspørgsel kan andre metoder være bedre.')}
                ${renderFAQ('faq3', 'Hvad er et godt sikkerhedslager?', 'Det afhænger af din ønskede <strong>serviceniveau</strong> og forbrugets variation. Ved 95% serviceniveau bruges z-faktor 1,65. Formlen er: <em>SS = z × σ × √leveringstid</em>. For kritiske A-varer vælges typisk 97-99% service.')}
                ${renderFAQ('faq4', 'Kan jeg bruge systemet uden at uploade data?', 'Ja! Du kan bruge de <strong>indbyggede eksempel-datasæt</strong> (Butik, Lager, Produktion) til at prøve alle funktioner. Du kan også indtaste data manuelt i Wilson-beregneren og Lagerstyring.')}
                ${renderFAQ('faq5', 'Understøtter systemet engelske formler?', 'Ja, skift til <strong>English</strong> i Indstillinger. Alle formler, labels og forklaringer oversættes automatisk.')}
            </div>
        </div>`;

        c.innerHTML = html;
        updateStartguideProgress();
    }

    function renderFAQ(id, question, answer) {
        return `
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button onclick="toggleLearnAccordion('${id}')" class="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left">
                <span class="font-semibold text-sm text-gray-900 dark:text-white">${question}</span>
                <span id="${id}-icon" class="text-gray-400 transition-transform duration-200 flex-shrink-0 ml-2">▼</span>
            </button>
            <div id="${id}" class="hidden border-t border-gray-100 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-900/30">
                <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">${answer}</p>
            </div>
        </div>`;
    }

    function updateStartguideProgress() {
        const done = countDone('startguide');
        const pct = Math.round((done / 6) * 100);
        const bar = document.getElementById('startguideProgressBar');
        if (bar) bar.style.width = pct + '%';
    }


    /* ══════════════════════════════════════════════
       PAGE 2: TEORI & KONCEPTER
       ══════════════════════════════════════════════ */
    function renderTheory() {
        const c = document.getElementById('theoryContainer');
        if (!c) return;

        const topics = [
            {
                id: 'abc', icon: '📊', color: 'blue',
                title: 'ABC-Analyse (Pareto)',
                content: `
                <div class="space-y-4">
                    <p>ABC-analyse er en lagerstyringsteknik baseret på <strong>Pareto-princippet (80/20-reglen)</strong>, hvor varer klassificeres i tre kategorier efter deres økonomiske betydning.</p>

                    <div class="grid md:grid-cols-3 gap-3">
                        <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                            <h4 class="font-bold text-green-800 dark:text-green-300 text-sm">A-varer</h4>
                            <p class="text-xs text-gray-700 dark:text-gray-300 mt-1">~20% af varerne = ~80% af værdien</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Tight kontrol, hyppig genbestilling, nøjagtig forecast, daglig overvågning</p>
                        </div>
                        <div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
                            <h4 class="font-bold text-yellow-800 dark:text-yellow-300 text-sm">B-varer</h4>
                            <p class="text-xs text-gray-700 dark:text-gray-300 mt-1">~30% af varerne = ~15% af værdien</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Moderat kontrol, ugentlig review, automatisk genbestilling</p>
                        </div>
                        <div class="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500">
                            <h4 class="font-bold text-red-800 dark:text-red-300 text-sm">C-varer</h4>
                            <p class="text-xs text-gray-700 dark:text-gray-300 mt-1">~50% af varerne = ~5% af værdien</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Simpel kontrol, periodisk gennemgang, bulkordrer, two-bin-system</p>
                        </div>
                    </div>

                    <div class="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg">
                        <h4 class="font-bold text-sm text-gray-900 dark:text-white mb-2">Beregningsmetode</h4>
                        <ol class="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-decimal list-inside">
                            <li>Beregn <strong>totalværdi</strong> for hver vare: Forbrug × Enhedspris</li>
                            <li>Sortér varerne efter totalværdi i <strong>faldende</strong> rækkefølge</li>
                            <li>Beregn <strong>kumulativ procentdel</strong> af den samlede værdi</li>
                            <li>Klassificér: 0-80% → A, 80-95% → B, 95-100% → C</li>
                        </ol>
                    </div>

                    <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                        <p class="text-sm font-semibold text-blue-800 dark:text-blue-300">💡 Key Takeaway</p>
                        <p class="text-sm text-blue-700 dark:text-blue-400">Fokusér dine ressourcer på de ~20% af varerne (A-varer) der udgør ~80% af den samlede værdi. Det giver størst effekt med mindst indsats.</p>
                    </div>
                </div>`
            },
            {
                id: 'abcdouble', icon: '🎯', color: 'orange',
                title: 'ABC Dobbelt Analyse (3×3 Matrix)',
                content: `
                <div class="space-y-4">
                    <p>ABC Dobbelt Analyse udvider standard ABC ved at kombinere <strong>to dimensioner</strong>: værdi (forbrug × pris) og forbrugsmængde (antal enheder). Dette skaber en 3×3 matrix med 9 kategorier.</p>

                    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                        <h4 class="font-bold text-sm text-gray-900 dark:text-white mb-3 text-center">3×3 Klassificerings-Matrix</h4>
                        <div class="grid grid-cols-4 gap-1 text-xs">
                            <div></div>
                            <div class="text-center font-bold p-1">A Værdi</div>
                            <div class="text-center font-bold p-1">B Værdi</div>
                            <div class="text-center font-bold p-1">C Værdi</div>
                            <div class="font-bold p-1">A Forbrug</div>
                            <div class="bg-red-200 dark:bg-red-900/50 p-2 text-center font-bold rounded">AA<br><span class="font-normal">Kritisk</span></div>
                            <div class="bg-orange-200 dark:bg-orange-900/50 p-2 text-center font-bold rounded">AB</div>
                            <div class="bg-yellow-200 dark:bg-yellow-900/50 p-2 text-center font-bold rounded">AC</div>
                            <div class="font-bold p-1">B Forbrug</div>
                            <div class="bg-orange-200 dark:bg-orange-900/50 p-2 text-center font-bold rounded">BA</div>
                            <div class="bg-yellow-200 dark:bg-yellow-900/50 p-2 text-center font-bold rounded">BB<br><span class="font-normal">Moderat</span></div>
                            <div class="bg-green-200 dark:bg-green-900/50 p-2 text-center font-bold rounded">BC</div>
                            <div class="font-bold p-1">C Forbrug</div>
                            <div class="bg-yellow-200 dark:bg-yellow-900/50 p-2 text-center font-bold rounded">CA</div>
                            <div class="bg-green-200 dark:bg-green-900/50 p-2 text-center font-bold rounded">CB</div>
                            <div class="bg-blue-200 dark:bg-blue-900/50 p-2 text-center font-bold rounded">CC<br><span class="font-normal">Lav pri.</span></div>
                        </div>
                    </div>

                    <div class="grid md:grid-cols-2 gap-3 text-xs">
                        <div class="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <strong class="text-red-700 dark:text-red-400">AA (Kritisk):</strong>
                            <span class="text-gray-700 dark:text-gray-300"> Høj værdi + højt forbrug. Kræver tæt JIT-styring, daglig overvågning, leverandør-partnerskab.</span>
                        </div>
                        <div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <strong class="text-yellow-700 dark:text-yellow-400">AC/CA (Overraskere):</strong>
                            <span class="text-gray-700 dark:text-gray-300"> Høj i én dimension, lav i den anden. Kræver individuel analyse — f.eks. dyrt men sjældent brugt.</span>
                        </div>
                        <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <strong class="text-green-700 dark:text-green-400">BB (Moderat):</strong>
                            <span class="text-gray-700 dark:text-gray-300"> Midt i feltet. Standard lagerstyring med periodisk review.</span>
                        </div>
                        <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <strong class="text-blue-700 dark:text-blue-400">CC (Lav prioritet):</strong>
                            <span class="text-gray-700 dark:text-gray-300"> Lav værdi + lavt forbrug. Simpel kontrol, overvej at eliminere eller automatisere.</span>
                        </div>
                    </div>

                    <div class="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-700">
                        <p class="text-sm font-semibold text-orange-800 dark:text-orange-300">💡 Key Takeaway</p>
                        <p class="text-sm text-orange-700 dark:text-orange-400">ABC Dobbelt giver et mere nuanceret billede end standard ABC. Brug det til at identificere varer der kræver særlig opmærksomhed — f.eks. CA-varer (høj værdi, lavt forbrug) der nemt overses.</p>
                    </div>
                </div>`
            },
            {
                id: 'eoq', icon: '📐', color: 'green',
                title: 'Wilson EOQ (Economic Order Quantity)',
                content: `
                <div class="space-y-4">
                    <p>Wilson's formel beregner den <strong>optimale ordrestørrelse</strong> der minimerer de samlede lageromkostninger — altså balancen mellem ordreomkostninger og lageromkostninger.</p>

                    <div class="bg-white dark:bg-gray-800 p-5 rounded-xl border-2 border-green-300 dark:border-green-700 text-center">
                        <p class="text-2xl font-mono font-bold text-gray-900 dark:text-white mb-3">EOQ = √(2 × D × S / H)</p>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div class="bg-gray-50 dark:bg-gray-700 p-2 rounded"><strong>D</strong><br><span class="text-xs text-gray-500">Årligt forbrug</span></div>
                            <div class="bg-gray-50 dark:bg-gray-700 p-2 rounded"><strong>S</strong><br><span class="text-xs text-gray-500">Ordreomkostning</span></div>
                            <div class="bg-gray-50 dark:bg-gray-700 p-2 rounded"><strong>H</strong><br><span class="text-xs text-gray-500">Lageromk./enhed/år</span></div>
                            <div class="bg-gray-50 dark:bg-gray-700 p-2 rounded"><strong>H</strong> = <span class="text-xs text-gray-500">Pris × Rente</span></div>
                        </div>
                    </div>

                    <div class="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg">
                        <h4 class="font-bold text-sm text-gray-900 dark:text-white mb-2">Eksempel</h4>
                        <p class="text-sm text-gray-700 dark:text-gray-300">D = 5.000 stk/år, S = 200 kr/ordre, Pris = 50 kr, Rente = 5%</p>
                        <p class="text-sm text-gray-700 dark:text-gray-300 mt-1">H = 50 × 0,05 = 2,50 kr/enhed/år</p>
                        <p class="text-sm font-bold text-green-700 dark:text-green-400 mt-1">EOQ = √(2 × 5000 × 200 / 2,50) = √800.000 ≈ <strong>894 enheder</strong></p>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Antal ordrer/år = 5000/894 ≈ 5,6 ordrer</p>
                    </div>

                    <div class="grid md:grid-cols-2 gap-3 text-xs">
                        <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <strong class="text-green-700 dark:text-green-400">Forudsætninger:</strong>
                            <ul class="mt-1 space-y-0.5 text-gray-700 dark:text-gray-300 list-disc list-inside">
                                <li>Konstant, forudsigelig efterspørgsel</li>
                                <li>Fast ordreomkostning</li>
                                <li>Ingen mængderabatter</li>
                                <li>Øjeblikkelig levering (eller kendt leveringstid)</li>
                            </ul>
                        </div>
                        <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <strong class="text-blue-700 dark:text-blue-400">Afledte beregninger:</strong>
                            <ul class="mt-1 space-y-0.5 text-gray-700 dark:text-gray-300 list-disc list-inside">
                                <li>Antal ordrer = D / EOQ</li>
                                <li>Ordreinterval = 365 / Antal ordrer</li>
                                <li>Gns. lager = EOQ / 2</li>
                                <li>Total omk. = (D/EOQ)×S + (EOQ/2)×H</li>
                            </ul>
                        </div>
                    </div>

                    <div class="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-700">
                        <p class="text-sm font-semibold text-green-800 dark:text-green-300">💡 Key Takeaway</p>
                        <p class="text-sm text-green-700 dark:text-green-400">EOQ er robust — selv 20% afvigelse fra optimal ordrestørrelse giver kun ~2% ekstra omkostninger. Brug EOQ som udgangspunkt og juster for praktiske forhold.</p>
                    </div>
                </div>`
            },
            {
                id: 'inventory', icon: '📦', color: 'purple',
                title: 'Lagerstyring (ROP, Min/Max, Periodisk)',
                content: `
                <div class="space-y-4">
                    <p>Tre komplementære modeller til styring af genbestilling og lagerniveauer.</p>

                    <div class="space-y-4">
                        <div class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-500">
                            <h4 class="font-bold text-purple-800 dark:text-purple-300 mb-2">Genbestillingspunkt (ROP)</h4>
                            <div class="bg-white dark:bg-gray-800 p-3 rounded mb-2 text-center">
                                <code class="text-sm font-mono font-bold">ROP = (d × L) + SS</code>
                            </div>
                            <p class="text-xs text-gray-700 dark:text-gray-300"><strong>d</strong> = dagligt forbrug, <strong>L</strong> = leveringstid (dage), <strong>SS</strong> = sikkerhedslager</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1"><em>Sikkerhedslager:</em> SS = z × σ × √L (z = servicefaktor, σ = standardafvigelse)</p>
                            <p class="text-xs text-gray-500 mt-1">✅ Bedst til: A-varer med jævnt forbrug</p>
                        </div>

                        <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                            <h4 class="font-bold text-green-800 dark:text-green-300 mb-2">Periodisk Gennemgang</h4>
                            <div class="bg-white dark:bg-gray-800 p-3 rounded mb-2 text-center">
                                <code class="text-sm font-mono font-bold">Målniveau = d × (R + L) + SS</code><br>
                                <code class="text-sm font-mono">Ordre = Målniveau − Nuværende Lager</code>
                            </div>
                            <p class="text-xs text-gray-700 dark:text-gray-300"><strong>R</strong> = review-periode (dage), bestiller op til målniveau ved hver gennemgang</p>
                            <p class="text-xs text-gray-500 mt-1">✅ Bedst til: B-varer, faste leverandørbesøg, ruter</p>
                        </div>

                        <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                            <h4 class="font-bold text-blue-800 dark:text-blue-300 mb-2">Min/Max Model</h4>
                            <div class="bg-white dark:bg-gray-800 p-3 rounded mb-2 text-center">
                                <code class="text-sm font-mono font-bold">Min = SS + (d × L)</code><br>
                                <code class="text-sm font-mono">Max = Min + EOQ</code>
                            </div>
                            <p class="text-xs text-gray-700 dark:text-gray-300">Bestil når lager falder under Min, fyld op til Max. Simpel og visuel.</p>
                            <p class="text-xs text-gray-500 mt-1">✅ Bedst til: C-varer, warehouse, two-bin-system</p>
                        </div>
                    </div>

                    <div class="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
                        <p class="text-sm font-semibold text-purple-800 dark:text-purple-300">💡 Key Takeaway</p>
                        <p class="text-sm text-purple-700 dark:text-purple-400">Vælg model efter varetype: ROP for kritiske A-varer, Periodisk Review ved faste ruter, og Min/Max for simpel warehouse-styring. Kombiner gerne metoderne.</p>
                    </div>
                </div>`
            },
            {
                id: 'lean', icon: '🔧', color: 'teal',
                title: 'LEAN, 5S & Kaizen',
                content: `
                <div class="space-y-4">
                    <p>LEAN-filosofien handler om at <strong>eliminere spild (Muda)</strong> og skabe mere værdi med færre ressourcer. Kernekoncepterne er:</p>

                    <div class="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border-l-4 border-teal-500">
                        <h4 class="font-bold text-teal-800 dark:text-teal-300 mb-3">5S — Arbejdspladsorganisering</h4>
                        <div class="grid grid-cols-5 gap-2 text-center text-xs">
                            <div class="p-2 bg-white dark:bg-gray-800 rounded-lg"><strong class="text-red-600 block">1. Sortér</strong><span class="text-gray-500">(Seiri)</span><br>Fjern unødvendigt</div>
                            <div class="p-2 bg-white dark:bg-gray-800 rounded-lg"><strong class="text-orange-600 block">2. Systematisér</strong><span class="text-gray-500">(Seiton)</span><br>Fast plads til alt</div>
                            <div class="p-2 bg-white dark:bg-gray-800 rounded-lg"><strong class="text-yellow-600 block">3. Skinne</strong><span class="text-gray-500">(Seiso)</span><br>Rengør & inspicér</div>
                            <div class="p-2 bg-white dark:bg-gray-800 rounded-lg"><strong class="text-green-600 block">4. Standardisér</strong><span class="text-gray-500">(Seiketsu)</span><br>Faste procedurer</div>
                            <div class="p-2 bg-white dark:bg-gray-800 rounded-lg"><strong class="text-blue-600 block">5. Selvdisciplin</strong><span class="text-gray-500">(Shitsuke)</span><br>Fasthold vaner</div>
                        </div>
                    </div>

                    <div class="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-400">
                        <h4 class="font-bold text-red-800 dark:text-red-300 mb-2">7 Spildtyper (Muda)</h4>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            <span class="bg-white dark:bg-gray-800 p-1.5 rounded text-center">🚚 Transport</span>
                            <span class="bg-white dark:bg-gray-800 p-1.5 rounded text-center">📦 Lager (overflod)</span>
                            <span class="bg-white dark:bg-gray-800 p-1.5 rounded text-center">🚶 Bevægelse</span>
                            <span class="bg-white dark:bg-gray-800 p-1.5 rounded text-center">⏳ Ventetid</span>
                            <span class="bg-white dark:bg-gray-800 p-1.5 rounded text-center">🔄 Overproduktion</span>
                            <span class="bg-white dark:bg-gray-800 p-1.5 rounded text-center">⚙️ Overbearbejdning</span>
                            <span class="bg-white dark:bg-gray-800 p-1.5 rounded text-center">❌ Defekter</span>
                            <span class="bg-white dark:bg-gray-800 p-1.5 rounded text-center">🧠 Uudnyttet talent*</span>
                        </div>
                        <p class="text-xs text-gray-500 mt-2">* 8. spildtype er tilføjet i nyere LEAN-fortolkninger.</p>
                    </div>

                    <div class="grid md:grid-cols-2 gap-3">
                        <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <h4 class="font-bold text-sm text-blue-800 dark:text-blue-300 mb-1">Kaizen — Løbende Forbedring</h4>
                            <p class="text-xs text-gray-700 dark:text-gray-300">Små, daglige forbedringer der involverer alle medarbejdere. PDCA-cyklus: Plan → Do → Check → Act.</p>
                        </div>
                        <div class="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                            <h4 class="font-bold text-sm text-indigo-800 dark:text-indigo-300 mb-1">Kanban — Visuel Styring</h4>
                            <p class="text-xs text-gray-700 dark:text-gray-300">Pull-baseret system med signalkort. Ny ordre udløses kun når forrige er forbrugt. Reducerer overproduktion.</p>
                        </div>
                    </div>

                    <div class="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border-l-4 border-amber-500">
                        <h4 class="font-bold text-amber-800 dark:text-amber-300 mb-2">OEE — Overall Equipment Effectiveness</h4>
                        <div class="bg-white dark:bg-gray-800 p-3 rounded mb-2 text-center">
                            <code class="text-sm font-mono font-bold">OEE = Tilgængelighed × Ydelse × Kvalitet</code>
                        </div>
                        <p class="text-xs text-gray-700 dark:text-gray-300">Verdensklasse OEE er 85%+. De fleste virksomheder ligger på 60%.</p>
                        <p class="text-xs text-gray-500 mt-1">Eksempel: 90% × 85% × 98% = <strong>74,97% OEE</strong></p>
                    </div>

                    <div class="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-lg border border-teal-200 dark:border-teal-700">
                        <p class="text-sm font-semibold text-teal-800 dark:text-teal-300">💡 Key Takeaway</p>
                        <p class="text-sm text-teal-700 dark:text-teal-400">LEAN handler ikke om at gøre folk overflødige — det handler om at fjerne spild og gøre arbejdet lettere. Start med 5S som fundament, identificér de 7 spildtyper, og brug Kaizen til løbende forbedring.</p>
                    </div>
                </div>`
            },
            {
                id: 'supply', icon: '🌐', color: 'indigo',
                title: 'Forsyningskæde & Supply Chain',
                content: `
                <div class="space-y-4">
                    <p>Forsyningskæden (Supply Chain) er hele netværket fra <strong>råmateriale til slutkunde</strong>. Effektiv Supply Chain Management (SCM) koordinerer alle led.</p>

                    <div class="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                        <h4 class="font-bold text-sm text-indigo-800 dark:text-indigo-300 mb-3">Forsyningskædens led</h4>
                        <div class="flex items-center justify-center gap-2 text-xs flex-wrap">
                            <span class="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg font-bold">🏭 Leverandør</span>
                            <span class="text-indigo-400">→</span>
                            <span class="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg font-bold">🔧 Producent</span>
                            <span class="text-indigo-400">→</span>
                            <span class="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg font-bold">📦 Distributør</span>
                            <span class="text-indigo-400">→</span>
                            <span class="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg font-bold">🏪 Detailhandel</span>
                            <span class="text-indigo-400">→</span>
                            <span class="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg font-bold">👤 Kunde</span>
                        </div>
                    </div>

                    <div class="grid md:grid-cols-2 gap-3">
                        <div class="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <h4 class="font-bold text-sm text-orange-800 dark:text-orange-300 mb-1">🌊 Bullwhip-effekten</h4>
                            <p class="text-xs text-gray-700 dark:text-gray-300">Små udsving i slutkundens efterspørgsel forstærkes op gennem kæden. Resulterer i overproduktion, overskydende lager og ineffektivitet.</p>
                            <p class="text-xs text-gray-500 mt-1"><em>Modgift:</em> Informationsdeling, kortere kæder, VMI (Vendor Managed Inventory).</p>
                        </div>
                        <div class="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                            <h4 class="font-bold text-sm text-cyan-800 dark:text-cyan-300 mb-1">⚖️ JIT vs. JIC</h4>
                            <p class="text-xs text-gray-700 dark:text-gray-300"><strong>JIT</strong> (Just-In-Time): Minimalt lager, levering præcis når nødvendigt. Kræver pålidelige leverandører.</p>
                            <p class="text-xs text-gray-700 dark:text-gray-300 mt-1"><strong>JIC</strong> (Just-In-Case): Ekstra lager som buffer mod usikkerhed. Dyrere men sikrere.</p>
                        </div>
                    </div>

                    <div class="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                        <h4 class="font-bold text-sm text-gray-900 dark:text-white mb-2">Vigtige KPI'er i Supply Chain</h4>
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                            <div class="bg-white dark:bg-gray-800 p-2 rounded"><strong>Leveringspræcision:</strong> % leveret til tiden</div>
                            <div class="bg-white dark:bg-gray-800 p-2 rounded"><strong>Lageromsætning:</strong> Forbrug / Gns. lagerbeholdning</div>
                            <div class="bg-white dark:bg-gray-800 p-2 rounded"><strong>Fill Rate:</strong> % af ordrer fuldt leveret</div>
                            <div class="bg-white dark:bg-gray-800 p-2 rounded"><strong>Lead Time:</strong> Tid fra ordre til levering</div>
                            <div class="bg-white dark:bg-gray-800 p-2 rounded"><strong>Total Cost of Ownership:</strong> Alle omkostninger</div>
                            <div class="bg-white dark:bg-gray-800 p-2 rounded"><strong>Cash-to-Cash:</strong> Dage fra betaling til indtægt</div>
                        </div>
                    </div>

                    <div class="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700">
                        <p class="text-sm font-semibold text-indigo-800 dark:text-indigo-300">💡 Key Takeaway</p>
                        <p class="text-sm text-indigo-700 dark:text-indigo-400">En effektiv forsyningskæde kræver synlighed, samarbejde og informationsdeling på tværs af alle led. Fokusér på at reducere Bullwhip-effekten og optimér lead times.</p>
                    </div>
                </div>`
            },
            {
                id: 'safety', icon: '⚠️', color: 'red',
                title: 'Sikkerhed, Ergonomi & ADR',
                content: `
                <div class="space-y-4">
                    <p>Arbejdsmiljø og sikkerhed er fundamentalt for enhver logistik- og lageroperation. Korrekt håndtering reducerer ulykker, sygefravær og omkostninger.</p>

                    <div class="grid md:grid-cols-2 gap-3">
                        <div class="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-400">
                            <h4 class="font-bold text-sm text-red-800 dark:text-red-300 mb-2">🏋️ Ergonomi — Løfteteknik</h4>
                            <ul class="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                                <li>Max. løft: <strong>11-12 kg</strong> tæt på krop (DK anbefaling)</li>
                                <li>Hold ryggen ret, bøj i knæene</li>
                                <li>Undgå vrid i ryggen under løft</li>
                                <li>Brug hjælpemidler ved tunge emner (>15 kg)</li>
                                <li>Variér arbejdsstillinger — undgå ensidigt arbejde</li>
                            </ul>
                        </div>
                        <div class="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-400">
                            <h4 class="font-bold text-sm text-orange-800 dark:text-orange-300 mb-2">🚨 ADR — Farligt Gods</h4>
                            <ul class="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                                <li><strong>ADR</strong> = European Agreement on Dangerous Goods</li>
                                <li>9 fareklasser (eksplosiver, gasser, brandfarlige, gift, radioaktivt...)</li>
                                <li>Kræver korrekt mærkning, emballage og dokumentation</li>
                                <li>Chauffører skal have <strong>ADR-bevis</strong></li>
                                <li>Sikkerhedsdatablad (SDS) skal altid medfølge</li>
                            </ul>
                        </div>
                    </div>

                    <div class="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <h4 class="font-bold text-sm text-yellow-800 dark:text-yellow-300 mb-2">🔒 Lager-sikkerhed</h4>
                        <div class="grid grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300">
                            <div class="flex items-start gap-1"><span class="text-green-500">✓</span> Sikkerhedssko med stålnæse</div>
                            <div class="flex items-start gap-1"><span class="text-green-500">✓</span> Refleksvest i truck-områder</div>
                            <div class="flex items-start gap-1"><span class="text-green-500">✓</span> Truck-certifikat (B-kørekort er IKKE nok)</div>
                            <div class="flex items-start gap-1"><span class="text-green-500">✓</span> Mærkede gangarealer og flugtveje</div>
                            <div class="flex items-start gap-1"><span class="text-green-500">✓</span> Reolinspektion mindst 1× årligt</div>
                            <div class="flex items-start gap-1"><span class="text-green-500">✓</span> Brandslukker og førstehjælpskasser</div>
                        </div>
                    </div>

                    <div class="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-700">
                        <p class="text-sm font-semibold text-red-800 dark:text-red-300">💡 Key Takeaway</p>
                        <p class="text-sm text-red-700 dark:text-red-400">Sikkerhed er ikke valgfrit — det er lovkrav. Investér i træning (truck-certifikat, ADR-bevis), korrekt udstyr og regelmæssig vedligeholdelse. Forebyg er billigere end ulykker.</p>
                    </div>
                </div>`
            },
            {
                id: 'budget', icon: '💰', color: 'pink',
                title: 'Budget & Økonomi',
                content: `
                <div class="space-y-4">
                    <p>Forståelse af økonomi og budgettering er essentielt for logistik-optimering. Her er de vigtigste begreber:</p>

                    <div class="grid md:grid-cols-2 gap-3">
                        <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400">
                            <h4 class="font-bold text-sm text-blue-800 dark:text-blue-300">Faste Omkostninger</h4>
                            <p class="text-xs text-gray-700 dark:text-gray-300 mt-1">Ændrer sig <strong>ikke</strong> med produktionen/salget: husleje, forsikring, faste lønninger, afskrivninger, leasing.</p>
                        </div>
                        <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-400">
                            <h4 class="font-bold text-sm text-green-800 dark:text-green-300">Variable Omkostninger</h4>
                            <p class="text-xs text-gray-700 dark:text-gray-300 mt-1">Stiger/falder med aktivitet: materialer, transport, emballage, provision, overtime.</p>
                        </div>
                    </div>

                    <div class="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                        <h4 class="font-bold text-sm text-gray-900 dark:text-white mb-2">Nøgletal</h4>
                        <div class="space-y-2 text-sm">
                            <div class="bg-white dark:bg-gray-800 p-3 rounded">
                                <strong>Dækningsbidrag (DB)</strong> = Salgspris − Variable Omkostninger<br>
                                <span class="text-xs text-gray-500">Bidraget til at dække faste omkostninger + profit</span>
                            </div>
                            <div class="bg-white dark:bg-gray-800 p-3 rounded">
                                <strong>Dækningsgrad (DG)</strong> = DB / Salgspris × 100%<br>
                                <span class="text-xs text-gray-500">Procentdel af omsætningen der dækker faste omkostninger</span>
                            </div>
                            <div class="bg-white dark:bg-gray-800 p-3 rounded">
                                <strong>Break-even</strong> = Faste Omkostninger / DG<br>
                                <span class="text-xs text-gray-500">Den omsætning hvor du hverken tjener eller taber</span>
                            </div>
                        </div>
                    </div>

                    <div class="bg-pink-50 dark:bg-pink-900/20 p-3 rounded-lg border border-pink-200 dark:border-pink-700">
                        <p class="text-sm font-semibold text-pink-800 dark:text-pink-300">💡 Key Takeaway</p>
                        <p class="text-sm text-pink-700 dark:text-pink-400">Et godt budget er dit vigtigste styringsredskab. Forstå forskellen mellem faste og variable omkostninger, og brug dækningsbidrag til at prioritere varer og aktiviteter.</p>
                    </div>
                </div>`
            }
        ];

        let html = `
        <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">📚 Teori & Koncepter</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">Klik på et emne for at udvide det. Alle vigtige begreber fra lager, logistik og supply chain samlet ét sted.</p>
        </div>
        <div class="space-y-3">`;

        topics.forEach(function (t) {
            html += `
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden learn-theory-card">
                <button onclick="toggleLearnAccordion('theory-${t.id}')" class="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left">
                    <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-${t.color}-100 dark:bg-${t.color}-900/30 flex items-center justify-center text-xl">${t.icon}</div>
                    <span class="flex-1 font-bold text-gray-900 dark:text-white text-sm">${t.title}</span>
                    <span id="theory-${t.id}-icon" class="text-gray-400 transition-transform duration-200 flex-shrink-0">▼</span>
                </button>
                <div id="theory-${t.id}" class="hidden border-t border-gray-100 dark:border-gray-700 p-5 bg-gray-50/30 dark:bg-gray-900/20 text-sm text-gray-700 dark:text-gray-300">
                    ${t.content}
                </div>
            </div>`;
        });

        html += '</div>';
        c.innerHTML = html;
    }


    /* ══════════════════════════════════════════════
       PAGE 3: BEST PRACTICES GUIDE
       ══════════════════════════════════════════════ */
    function renderBestPractices() {
        const c = document.getElementById('bestpracticesContainer');
        if (!c) return;

        const domains = {
            abc: {
                label: '📊 ABC', color: 'blue',
                doList: [
                    'Opdater ABC-analyse mindst kvartalsvis',
                    'Brug stramme grænser for A-varer: 70-80% af værdi',
                    'Kombiner med ABC Dobbelt for bedre indsigt',
                    'Inddrag sæsonudsving i analysen',
                    'Brug for prioritering af tællefrekvens'
                ],
                dontList: [
                    'Ignorer C-varer fuldstændigt',
                    'Brug forældede data (>6 måneder)',
                    'Anvend samme strategi for alle kategorier',
                    'Glem kritiske reservedele blot fordi de er "C"',
                    'Undlad at revidere grænserne'
                ],
                tips: [
                    { title: 'Retail', text: 'Fokus på hurtige A-varer. Sæsonkorrektion. Typisk 85/10/5 fordeling.' },
                    { title: 'Produktion', text: 'Gruppér per produktionslinje. Sikkerhedslager for kritiske dele.' },
                    { title: 'Distribution', text: 'Strammere ABC (70/25/5). Konsolider ordrer. Regional analyse.' },
                    { title: 'Fødevarer', text: 'Holdbarhed trumfer pris. Hyppig genbestilling. Minimal lager.' }
                ]
            },
            eoq: {
                label: '📐 EOQ', color: 'green',
                doList: [
                    'Brug EOQ som udgangspunkt, ikke absolut sandhed',
                    'Opdater D, S og H mindst en gang årligt',
                    'Afrund EOQ til praktiske ordrestørrelser (pakninger, paller)',
                    'Kombiner EOQ med ROP for komplet system',
                    'Overvej mængderabatter separat'
                ],
                dontList: [
                    'Brug EOQ ved meget svingende efterspørgsel',
                    'Ignorer leverandørens minimum ordrestørrelse',
                    'Glem at inkludere alle ordreomkostninger i S',
                    'Antag at renten er fast — tjek årligt',
                    'Brug EOQ for bedærvelige varer uden tilpasning'
                ],
                tips: [
                    { title: 'EOQ < Nuværende', text: 'Bestil mindre ad gangen. Du binder for mange penge i lager.' },
                    { title: 'EOQ > Nuværende', text: 'Bestil mere ad gangen. Du bruger for mange penge på ordreomkostninger.' },
                    { title: 'Følsomhed', text: 'EOQ er robust — 20% afvigelse giver kun ~2% ekstra omkostning.' },
                    { title: 'Batch Wilson', text: 'Brug Batch Wilson til at beregne EOQ for flere varer samtidig.' }
                ]
            },
            lagerstyring: {
                label: '📦 Lager', color: 'purple',
                doList: [
                    'Vælg model efter varetype: ROP for A, Min/Max for C',
                    'Beregn sikkerhedslager baseret på ønsket serviceniveau',
                    'Opdater leveringstider regelmæssigt',
                    'Overvåg lageromsætningshastighed',
                    'Implementer cycle counting istedet for fuld optælling'
                ],
                dontList: [
                    'Brug samme lagerpolitik for alle varer',
                    'Ignorer leverandørens leveringstid-variationer',
                    'Sæt for lavt sikkerhedslager for kritiske varer',
                    'Overbehold — det koster penge (typisk 15-25% p.a.)',
                    'Spring reolinspektion over'
                ],
                tips: [
                    { title: 'z-faktor', text: '90% = 1,28 · 95% = 1,65 · 97% = 1,88 · 99% = 2,33 · 99,9% = 3,09' },
                    { title: 'FIFO', text: 'Altid FIFO (First In, First Out) for at undgå forældelse.' },
                    { title: 'Lokation', text: 'A-varer tæt på udgangen. C-varer bagerst/øverst.' },
                    { title: 'ABC + ROP', text: 'Kombiner ABC-klassificering med individuelle ROP-beregninger.' }
                ]
            },
            lean: {
                label: '🔧 LEAN', color: 'teal',
                doList: [
                    'Start med 5S som fundament',
                    'Involver alle medarbejdere i forbedringer',
                    'Visualisér processer med value stream mapping',
                    'Implementer daglige stand-up møder (15 min)',
                    'Mål OEE regelmæssigt og sæt forbedrlingsmål'
                ],
                dontList: [
                    'Implementer alt på én gang — start småt',
                    'Fyr folk som resultat af LEAN (dræber motivation)',
                    'Ignorer medarbejdernes input',
                    'Forveksler "lean" med "budget-cutting"',
                    'Glem at standardisere forbedringer'
                ],
                tips: [
                    { title: 'OEE Benchmark', text: 'Verdensklasse: 85%+. Typisk: 60%. Under 40% = akut behov.' },
                    { title: 'Kaizen-tavle', text: 'Opsæt en fysisk/digital tavle med forbedringsforslag og fremdrift.' },
                    { title: 'Gemba Walk', text: 'Gå dagligt til arbejdspladsen. Observer, spørg, forstå.' },
                    { title: 'PDCA', text: 'Plan-Do-Check-Act. Gentag cyklussen for kontinuerlig forbedring.' }
                ]
            },
            budget: {
                label: '💰 Budget', color: 'pink',
                doList: [
                    'Adskil faste og variable omkostninger klart',
                    'Budgettér konservativt — hellere positivt overrasket',
                    'Review budget vs. faktisk månedligt',
                    'Inkludér buffer til uforudsete udgifter (5-10%)',
                    'Brug historiske data som grundlag'
                ],
                dontList: [
                    'Ignorer sæsonudsving i budgettet',
                    'Budgettér kun indtægter uden omkostninger',
                    'Glem afskrivninger og vedligehold',
                    'Undervurder transportomkostninger',
                    'Drop budget-opfølgning efter Q1'
                ],
                tips: [
                    { title: 'Logistik-andel', text: 'Logistik udgør typisk 8-12% af omsætningen. Over 15% = behov for optimering.' },
                    { title: 'TCO', text: 'Total Cost of Ownership: Indkøbspris + transport + lager + håndtering + svind.' },
                    { title: 'KPI Tracking', text: 'Mål: Lageromk./omsætning, transportomk./enhed, ordreomk./ordre.' },
                    { title: 'Break-even', text: 'Beregn break-even for nye produkter/projekter INDEN lancering.' }
                ]
            },
            generelt: {
                label: '🎓 Generelt', color: 'gray',
                doList: [
                    'Hold dine data rene og opdaterede',
                    'Brug flere analyse-metoder sammen for bedst indsigt',
                    'Dokumentér beslutninger og antagelser',
                    'Investér i medarbejderuddannelse',
                    'Benchmark mod branchestandarder'
                ],
                dontList: [
                    'Stol blindt på én metode alene',
                    'Ignorer kvalitative faktorer (kritikalitet, leverandørrisiko)',
                    'Overkomplicér ting — start simpelt',
                    'Undlad at følge op på implementerede ændringer',
                    'Glem kundeperspektivet i optimeringen'
                ],
                tips: [
                    { title: 'Stregkoder', text: 'EAN-13 til varer i butik. CODE-128 til intern lager. GS1-standarder.' },
                    { title: 'WMS', text: 'Warehouse Management System: Automatisér pluk, modtagelse og lokation.' },
                    { title: 'ERP', text: 'Enterprise Resource Planning: Integrer lager, indkøb, salg og finans.' },
                    { title: 'Bæredygtighed', text: 'Optimér ruter, reducer emballage, genbrug paller. Grøn logistik.' }
                ]
            }
        };

        let html = `
        <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">💡 Best Practices Guide</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">Praktiske anbefalinger organiseret efter fagområde. Lær hvad du bør gøre — og hvad du bør undgå.</p>
        </div>`;

        // Domain tabs
        html += '<div class="flex flex-wrap gap-2 mb-5">';
        let first = true;
        Object.keys(domains).forEach(function (key) {
            const d = domains[key];
            html += `<button onclick="switchBPTab('${key}')" id="bp-tab-${key}" class="bp-tab px-4 py-2 rounded-lg text-sm font-semibold transition-all border-2 ${first ? 'bp-tab-active' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400'}">${d.label}</button>`;
            first = false;
        });
        html += '</div>';

        // Domain panels
        first = true;
        Object.keys(domains).forEach(function (key) {
            const d = domains[key];
            html += `<div id="bp-panel-${key}" class="${first ? '' : 'hidden'}">`;

            // Do / Don't cards
            html += `<div class="grid md:grid-cols-2 gap-4 mb-5">`;
            // DO
            html += `<div class="bg-green-50 dark:bg-green-900/10 rounded-xl p-4 border-2 border-green-200 dark:border-green-800">
                <h3 class="font-bold text-green-800 dark:text-green-300 text-sm mb-3 flex items-center gap-2">✅ Gør dette</h3>
                <ul class="space-y-2">`;
            d.doList.forEach(function (item) {
                html += `<li class="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"><span class="text-green-500 font-bold mt-0.5 flex-shrink-0">✓</span>${item}</li>`;
            });
            html += '</ul></div>';

            // DON'T
            html += `<div class="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 border-2 border-red-200 dark:border-red-800">
                <h3 class="font-bold text-red-800 dark:text-red-300 text-sm mb-3 flex items-center gap-2">❌ Undgå dette</h3>
                <ul class="space-y-2">`;
            d.dontList.forEach(function (item) {
                html += `<li class="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"><span class="text-red-500 font-bold mt-0.5 flex-shrink-0">✗</span>${item}</li>`;
            });
            html += '</ul></div>';
            html += '</div>';

            // Tips
            html += `<div class="grid md:grid-cols-2 gap-3">`;
            d.tips.forEach(function (tip) {
                html += `<div class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 class="font-bold text-xs text-${d.color}-600 dark:text-${d.color}-400 uppercase tracking-wide mb-1">${tip.title}</h4>
                    <p class="text-sm text-gray-700 dark:text-gray-300">${tip.text}</p>
                </div>`;
            });
            html += '</div>';

            html += '</div>';
            first = false;
        });

        c.innerHTML = html;
    }


    /* ══════════════════════════════════════════════
       PAGE 4: GUIDED EXERCISES (sub-tab)
       ══════════════════════════════════════════════ */
    function renderGuidedExercises() {
        const c = document.getElementById('guidedExercisesContainer');
        if (!c) return;

        const exercises = [
            {
                id: 'ex1', icon: '📊', difficulty: 1, color: 'blue', time: '10 min',
                title: 'ABC Klassificering',
                desc: 'Lær at klassificere varer i A, B og C kategorier baseret på deres økonomiske værdi.',
                steps: [
                    'Klik <strong>"Start Øvelse"</strong> herunder — butiksdatasættet indlæses automatisk',
                    'Klik <strong>"Analyser Data"</strong> for at køre ABC-analysen',
                    'Identificér <strong>A-varer</strong> — hvor mange er der? Hvad er deres fælles kendetegn?',
                    'Se <strong>Pareto-diagrammet</strong> — bekræft 80/20-reglen: Udgør A-varer ca. 80% af værdien?',
                    'Sammenlign A- og C-varer — hvad er forskellen i kontrol-strategi?'
                ],
                action: "loadSampleDataset('retail'); switchTab('abc')"
            },
            {
                id: 'ex2', icon: '📐', difficulty: 1, color: 'green', time: '10 min',
                title: 'Wilson EOQ Beregning',
                desc: 'Beregn den optimale ordrestørrelse med Wilson-formlen og forstå resultatet.',
                steps: [
                    'Gå til <strong>Wilson EOQ</strong>-fanen',
                    'Indtast: <strong>D = 5.000</strong>, <strong>S = 200 kr</strong>, <strong>Pris = 50 kr</strong>, <strong>Rente = 5%</strong>',
                    'Klik <strong>Beregn</strong> og se resultatet (~894 stk)',
                    'Prøv at <strong>fordoble ordreomkostningen</strong> (S=400) — hvad sker med EOQ?',
                    'Prøv at <strong>halvere renten</strong> (2,5%) — hvad sker med EOQ?',
                    'Forstå: Højere S → større EOQ, Højere H → mindre EOQ'
                ],
                action: "switchTab('wilson')"
            },
            {
                id: 'ex3', icon: '📦', difficulty: 2, color: 'purple', time: '15 min',
                title: 'Genbestillingspunkt (ROP)',
                desc: 'Beregn genbestillingspunkt og sikkerhedslager for en vare med variabel efterspørgsel.',
                steps: [
                    'Gå til <strong>Lagerstyring</strong>-fanen',
                    'Vælg <strong>Genbestillingspunkt (ROP)</strong>-modellen',
                    'Indtast: <strong>d = 20 stk/dag</strong>, <strong>leveringstid = 7 dage</strong>',
                    'Sæt <strong>serviceniveau = 95%</strong> og en passende standardafvigelse',
                    'Se sikkerhedslager-beregningen og forstå z-faktoren (1,65 for 95%)',
                    'Prøv 99% serviceniveau — hvad sker med sikkerhedslageret?',
                    'Reflektér: Hvornår er 95% vs 99% det rigtige valg for A- vs C-varer?'
                ],
                action: "switchTab('inventory')"
            },
            {
                id: 'ex4', icon: '🎯', difficulty: 2, color: 'orange', time: '15 min',
                title: 'ABC Dobbelt Analyse',
                desc: 'Udforsk den avancerede 3×3 klassificerings-matrix med to dimensioner.',
                steps: [
                    'Klik <strong>"Start Øvelse"</strong> herunder — lagerdatasættet indlæses automatisk',
                    'Klik <strong>"Analyser Data"</strong> og skift til <strong>ABC Dobbelt</strong>-visningen',
                    'Find <strong>AA-varerne</strong> — hvorfor er de de mest kritiske?',
                    'Find <strong>CA- og AC-varerne</strong> — hvad kendetegner dem? Hvorfor kræver de særlig opmærksomhed?',
                    'Sammenlign standard ABC med ABC Dobbelt — hvilke varer skifter kategori?',
                    'Overvej: Hvilken lagerstrategi passer til hver kombination i 3×3-matricen?'
                ],
                action: "loadSampleDataset('warehouse'); switchTab('abc')"
            },
            {
                id: 'ex5', icon: '🔧', difficulty: 2, color: 'teal', time: '10 min',
                title: 'OEE Beregning',
                desc: 'Beregn Overall Equipment Effectiveness og forstå de tre komponenter.',
                steps: [
                    'Gå til <strong>LEAN Tools</strong>-fanen',
                    'Find <strong>OEE-beregneren</strong>',
                    'Indtast: <strong>Tilgængelighed 90%</strong>, <strong>Ydelse 85%</strong>, <strong>Kvalitet 98%</strong>',
                    'Beregn OEE (forventet: ~75%) — er det verdensklasse?',
                    'Eksperimenter: Hvilken komponent har størst effekt på OEE?',
                    'Prøv at opnå <strong>85% OEE</strong> — hvilke forbedringer kræves?'
                ],
                action: "switchTab('lean')"
            },
            {
                id: 'ex6', icon: '💰', difficulty: 2, color: 'pink', time: '15 min',
                title: 'Budget Planlægning',
                desc: 'Opret et realistisk logistikbudget med faste og variable omkostninger.',
                steps: [
                    'Gå til <strong>Budget</strong>-fanen',
                    'Opret et nyt budget med <strong>12 måneder</strong>',
                    'Tilføj faste poster: <strong>Husleje</strong> (15.000/md), <strong>Forsikring</strong> (2.000/md)',
                    'Tilføj variable poster: <strong>Transport</strong>, <strong>Emballage</strong>, <strong>Vikarer</strong>',
                    'Tilføj <strong>indtægter</strong> og beregn dækningsbidrag',
                    'Analysér: Hvilke måneder er break-even? Hvor er der mest profit?'
                ],
                action: "switchTab('budget')"
            },
            {
                id: 'ex7', icon: '🏆', difficulty: 3, color: 'amber', time: '25 min',
                title: 'Komplet Lageroptimering',
                desc: 'Kombinér ABC, EOQ og ROP for en komplet lageroptimering af et datasæt.',
                steps: [
                    'Indlæs <strong>produktionsdatasættet</strong> (100 varer) via knappen herunder',
                    'Kør <strong>ABC-analyse</strong> — identificér A-, B- og C-varer',
                    'Vælg 3 A-varer og beregn <strong>EOQ</strong> for hver i Wilson-beregneren',
                    'Beregn <strong>ROP + sikkerhedslager</strong> for de samme varer (95-99% service)',
                    'Skift til <strong>ABC Dobbelt</strong> — ændrer klassificeringen sig?',
                    'Udforsk <strong>Min/Max</strong>-modellen for C-varerne',
                    'Saml dine konklusioner: Hvilken lagerstrategi anbefaler du for A vs. B vs. C?'
                ],
                action: "loadSampleDataset('manufacturing'); switchTab('abc')"
            },
            {
                id: 'ex8', icon: '🌐', difficulty: 3, color: 'indigo', time: '20 min',
                title: 'Supply Chain Case Study',
                desc: 'Analysér et komplet scenarie med fokus på forsyningskæde-optimering.',
                steps: [
                    'Indlæs <strong>lagerdatasættet</strong> og kør ABC-analyse',
                    'Identificér de <strong>5 vigtigste A-varer</strong> — hvem er leverandørerne?',
                    'Beregn <strong>EOQ og ROP</strong> for disse varer',
                    'Overvej <strong>leverandørstrategi</strong>: JIT for AA-varer? Consolidering for CC?',
                    'Beregn <strong>total lageromkostning</strong> (gns. lager × H)',
                    'Estimér <strong>besparelse</strong> ved at implementere EOQ vs. nuværende ordrestørrelser',
                    'Skriv en kort opsummering af dine anbefalinger'
                ],
                action: "loadSampleDataset('warehouse'); switchTab('abc')"
            }
        ];

        const diffLabels = { 1: 'Begynder', 2: 'Mellem', 3: 'Avanceret' };
        const diffColors = { 1: 'green', 2: 'yellow', 3: 'red' };

        let html = `
        <div class="mb-5">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">📋 Guidede Øvelser</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">Hands-on øvelser der bruger kalkulatoren. Følg trinene, marker som fuldført, og byg dine kompetencer op.</p>
            <div class="mt-3 flex items-center gap-3">
                <div class="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div id="guidedExProgressBar" class="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500" style="width:0%"></div>
                </div>
                <span id="learnExBadge" class="text-xs font-bold text-gray-500 dark:text-gray-400">0/8</span>
            </div>
        </div>

        <div class="grid md:grid-cols-2 gap-4">`;

        exercises.forEach(function (ex) {
            const done = isStepDone('exercises', ex.id);
            const dc = diffColors[ex.difficulty];
            html += `
            <div class="learn-exercise-card ${done ? 'learn-step-done' : ''} bg-white dark:bg-gray-800 rounded-xl border-2 ${done ? 'border-green-300 dark:border-green-700' : 'border-gray-200 dark:border-gray-700'} overflow-hidden transition-all hover:shadow-lg">
                <div class="p-4">
                    <div class="flex items-start justify-between mb-2">
                        <div class="flex items-center gap-2">
                            <span class="text-2xl">${ex.icon}</span>
                            <div>
                                <h3 class="font-bold text-gray-900 dark:text-white text-sm">${ex.title}</h3>
                                <div class="flex items-center gap-2 mt-0.5">
                                    <span class="text-xs px-2 py-0.5 rounded-full font-medium bg-${dc}-100 text-${dc}-700 dark:bg-${dc}-900/30 dark:text-${dc}-400">${'★'.repeat(ex.difficulty)} ${diffLabels[ex.difficulty]}</span>
                                    <span class="text-xs text-gray-400">⏱ ${ex.time}</span>
                                </div>
                            </div>
                        </div>
                        <label class="flex items-center cursor-pointer" onclick="event.stopPropagation()" title="Marker som fuldført">
                            <input type="checkbox" ${done ? 'checked' : ''} data-learn-check="exercises:${ex.id}"
                                onchange="this.checked ? markLearnStep('exercises','${ex.id}') : unmarkLearnStep('exercises','${ex.id}')"
                                class="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 text-green-500 focus:ring-green-400 cursor-pointer">
                        </label>
                    </div>
                    <p class="text-xs text-gray-600 dark:text-gray-400 mb-3">${ex.desc}</p>

                    <button onclick="toggleLearnAccordion('guide-${ex.id}')" class="text-xs font-semibold text-${ex.color}-600 dark:text-${ex.color}-400 hover:underline mb-2 flex items-center gap-1">
                        📖 Vis trin <span id="guide-${ex.id}-icon" class="transition-transform duration-200 text-[10px]">▼</span>
                    </button>
                    <div id="guide-${ex.id}" class="hidden mb-3">
                        <ol class="space-y-1.5 text-xs text-gray-700 dark:text-gray-300 list-decimal list-inside">
                            ${ex.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('')}
                        </ol>
                    </div>

                    <button onclick="${ex.action}" class="w-full text-xs px-3 py-2 bg-${ex.color}-600 hover:bg-${ex.color}-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-1">
                        🚀 Start Øvelse
                    </button>
                </div>
            </div>`;
        });

        html += '</div>';
        c.innerHTML = html;
        updateGuidedProgress();
    }

    function updateGuidedProgress() {
        const done = countDone('exercises');
        const pct = Math.round((done / 8) * 100);
        const bar = document.getElementById('guidedExProgressBar');
        if (bar) bar.style.width = pct + '%';
    }


    /* ══════════════════════════════════════════════
       INITIALIZATION
       ══════════════════════════════════════════════ */
    function initLearnPages() {
        renderStartguide();
        renderTheory();
        renderBestPractices();
        renderGuidedExercises();
        updateProgressUI();
    }

    // DOMContentLoaded or immediate
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLearnPages);
    } else {
        // defer slightly to ensure DOM is fully available
        setTimeout(initLearnPages, 50);
    }

})();
