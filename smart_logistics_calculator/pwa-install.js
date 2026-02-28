// ── PWA Install Prompt ────────────────────────────────────────────────────────
// Shows a custom install dialog when the browser signals the app is installable.
// Handles Chrome/Brave/Edge (beforeinstallprompt), iOS Safari, Firefox Android.

(function () {
  const DISMISSED_KEY = 'slc-install-dismissed';
  const DISMISSED_DAYS = 7; // don't re-prompt for this many days after dismissal

  // Don't show if already installed (running as standalone PWA)
  if (window.matchMedia('(display-mode: standalone)').matches) return;
  if (window.navigator.standalone === true) return; // iOS installed

  // Don't show if recently dismissed
  const dismissedAt = localStorage.getItem(DISMISSED_KEY);
  if (dismissedAt) {
    const daysSince = (Date.now() - parseInt(dismissedAt, 10)) / 86400000;
    if (daysSince < DISMISSED_DAYS) return;
  }

  // ── Browser / platform detection ────────────────────────────────────────────
  const ua = navigator.userAgent;
  const isIOS        = /iphone|ipad|ipod/i.test(ua) && !window.MSStream;
  const isAndroid    = /android/i.test(ua);
  const isFirefox    = /firefox|fxios/i.test(ua);
  const isFirefoxAndroid = isFirefox && isAndroid;
  // isSafari: has "Safari" in UA but is NOT Chrome, Brave-iOS, Firefox, or Edge
  const isSafari = /safari/i.test(ua) && !/chrome|crios|fxios|firefox|edgios/i.test(ua);

  // ── Decide which mode to use ─────────────────────────────────────────────────
  // 'native'  → browser fires beforeinstallprompt (Chrome, Brave, Edge on Android/desktop)
  // 'ios'     → iOS Safari or Brave iOS — manual Share → Add to Home Screen steps
  // 'firefox' → Firefox on Android — manual menu steps
  // false     → unsupported (Firefox desktop, Firefox iOS) — don't show anything

  function getMode(deferredPrompt) {
    if (deferredPrompt) return 'native';
    if (isIOS && isSafari) return 'ios';
    if (isFirefoxAndroid)  return 'firefox';
    return false;
  }

  // ── Build the banner HTML ────────────────────────────────────────────────────
  function createBanner(mode) {
    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';

    const stepsHtml = {
      ios: `
        <div class="pwa-steps-box">
          <div class="pwa-step"><span class="pwa-step-num">1</span>Tap the <strong>Share</strong> button ⎋ at the bottom of Safari</div>
          <div class="pwa-step"><span class="pwa-step-num">2</span>Scroll down and tap <strong>"Add to Home Screen"</strong></div>
          <div class="pwa-step"><span class="pwa-step-num">3</span>Tap <strong>"Add"</strong> in the top-right corner</div>
        </div>
        <button id="pwa-dismiss" class="pwa-btn pwa-btn-primary">Got it</button>`,
      firefox: `
        <div class="pwa-steps-box">
          <div class="pwa-step"><span class="pwa-step-num">1</span>Tap the <strong>menu button ⋮</strong> in the top-right corner of Firefox</div>
          <div class="pwa-step"><span class="pwa-step-num">2</span>Tap <strong>"Install"</strong> or <strong>"Add to Home Screen"</strong></div>
        </div>
        <button id="pwa-dismiss" class="pwa-btn pwa-btn-primary">Got it</button>`,
      native: `
        <div class="pwa-actions">
          <button id="pwa-dismiss" class="pwa-btn pwa-btn-secondary">Not now</button>
          <button id="pwa-install" class="pwa-btn pwa-btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px"><path d="M12 2v13M7 10l5 5 5-5"/><path d="M4 20h16"/></svg>
            Install App
          </button>
        </div>`
    };

    const descText = {
      ios:     'Tap <strong>Share</strong> then <strong>"Add to Home Screen"</strong> to install.',
      firefox: 'Tap the <strong>menu ⋮</strong> then <strong>"Install"</strong> to add this app.',
      native:  'Add this app to your home screen for quick access — works offline too.'
    };

    banner.innerHTML = `
      <div id="pwa-backdrop"></div>
      <div id="pwa-sheet" role="dialog" aria-modal="true" aria-label="Install app">
        <div class="pwa-icon-wrap">
          <img src="icon-192.png" alt="App icon" width="56" height="56">
        </div>
        <h2 class="pwa-title">Install Smart Logistics Calculator</h2>
        <p class="pwa-desc">${descText[mode]}</p>
        ${stepsHtml[mode]}
      </div>
    `;
    return banner;
  }

  // ── Styles ───────────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #pwa-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,.45);
      z-index: 99998; animation: pwaFadeIn .25s ease;
    }
    #pwa-sheet {
      position: fixed; bottom: 0; left: 0; right: 0;
      background: #fff; border-radius: 20px 20px 0 0;
      padding: 28px 24px 36px; z-index: 99999;
      box-shadow: 0 -8px 40px rgba(0,0,0,.18);
      animation: pwaSlideUp .3s cubic-bezier(.22,.61,.36,1);
      max-width: 480px; margin: 0 auto;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    @media (prefers-color-scheme: dark) {
      #pwa-sheet { background: #1e293b; color: #f1f5f9; }
    }
    .dark #pwa-sheet { background: #1e293b; color: #f1f5f9; }
    .pwa-icon-wrap { display: flex; justify-content: center; margin-bottom: 14px; }
    .pwa-icon-wrap img { border-radius: 16px; box-shadow: 0 4px 16px rgba(59,130,246,.35); }
    .pwa-title { text-align: center; font-size: 1.15rem; font-weight: 700; margin: 0 0 8px; color: inherit; }
    .pwa-desc  { text-align: center; font-size: .9rem; color: #64748b; margin: 0 0 20px; line-height: 1.5; }
    @media (prefers-color-scheme: dark) { .pwa-desc { color: #94a3b8; } }
    .dark .pwa-desc { color: #94a3b8; }
    .pwa-steps-box {
      background: #f8fafc; border-radius: 12px; padding: 14px 16px;
      margin-bottom: 20px; display: flex; flex-direction: column; gap: 10px;
    }
    @media (prefers-color-scheme: dark) { .pwa-steps-box { background: #0f172a; } }
    .dark .pwa-steps-box { background: #0f172a; }
    .pwa-step { display: flex; align-items: flex-start; gap: 10px; font-size: .88rem; line-height: 1.4; }
    .pwa-step-num {
      background: #3B82F6; color: #fff; border-radius: 50%;
      min-width: 22px; height: 22px; display: flex; align-items: center;
      justify-content: center; font-size: .75rem; font-weight: 700; flex-shrink: 0;
    }
    .pwa-actions { display: flex; gap: 10px; }
    .pwa-btn {
      flex: 1; border: none; border-radius: 12px; padding: 13px 8px;
      font-size: .95rem; font-weight: 600; cursor: pointer;
      transition: opacity .15s, transform .1s;
    }
    .pwa-btn:active { transform: scale(.97); opacity: .85; }
    .pwa-btn-secondary { background: #e2e8f0; color: #475569; }
    @media (prefers-color-scheme: dark) { .pwa-btn-secondary { background: #334155; color: #cbd5e1; } }
    .dark .pwa-btn-secondary { background: #334155; color: #cbd5e1; }
    .pwa-btn-primary {
      background: linear-gradient(135deg, #3B82F6, #7C3AED);
      color: #fff; display: flex; align-items: center; justify-content: center;
    }
    @keyframes pwaFadeIn  { from { opacity:0 } to { opacity:1 } }
    @keyframes pwaSlideUp { from { transform:translateY(100%) } to { transform:translateY(0) } }
  `;
  document.head.appendChild(style);

  // ── Show / hide helpers ──────────────────────────────────────────────────────
  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      const sheet   = banner.querySelector('#pwa-sheet');
      const backdrop = banner.querySelector('#pwa-backdrop');
      const exit = document.createElement('style');
      exit.textContent = `
        @keyframes pwaSlideDown { to { transform: translateY(110%) } }
        @keyframes pwaFadeOut   { to { opacity: 0 } }
      `;
      document.head.appendChild(exit);
      if (sheet)    sheet.style.animation    = 'pwaSlideDown .25s ease forwards';
      if (backdrop) backdrop.style.animation = 'pwaFadeOut .25s ease forwards';
      setTimeout(() => banner.remove(), 300);
    }
  }

  function show(deferredPrompt) {
    const mode = getMode(deferredPrompt);
    if (!mode) return;

    const banner = createBanner(mode);
    document.body.appendChild(banner);

    document.getElementById('pwa-dismiss').addEventListener('click', dismiss);
    document.getElementById('pwa-backdrop').addEventListener('click', dismiss);

    if (mode === 'native') {
      document.getElementById('pwa-install').addEventListener('click', async () => {
        dismiss();
        if (deferredPrompt) {
          deferredPrompt.prompt();
          await deferredPrompt.userChoice;
        }
      });
    }
  }

  // ── Chrome / Brave / Edge — intercept beforeinstallprompt ───────────────────
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    setTimeout(() => show(deferredPrompt), 2000);
  });

  // ── iOS Safari / Brave iOS — show manual steps ───────────────────────────────
  if (isIOS && isSafari) {
    window.addEventListener('load', () => setTimeout(() => show(null), 2500));
  }

  // ── Firefox on Android — show manual steps ───────────────────────────────────
  if (isFirefoxAndroid) {
    window.addEventListener('load', () => setTimeout(() => show(null), 2500));
  }

  // ── Hide banner if app gets installed ────────────────────────────────────────
  window.addEventListener('appinstalled', () => {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) banner.remove();
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
  });
})();

  const DISMISSED_KEY = 'slc-install-dismissed';
  const DISMISSED_DAYS = 7; // don't re-prompt for this many days after dismissal

  // Don't show if already installed (running as standalone PWA)
  if (window.matchMedia('(display-mode: standalone)').matches) return;
  if (window.navigator.standalone === true) return; // iOS installed

  // Don't show if recently dismissed
  const dismissedAt = localStorage.getItem(DISMISSED_KEY);
  if (dismissedAt) {
    const daysSince = (Date.now() - parseInt(dismissedAt, 10)) / 86400000;
    if (daysSince < DISMISSED_DAYS) return;
  }

  // ── Detect iOS ──────────────────────────────────────────────────────────────
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
  const isSafari = /safari/i.test(navigator.userAgent) && !/chrome|crios|fxios/i.test(navigator.userAgent);

  // ── Build the banner HTML ────────────────────────────────────────────────────
  function createBanner(isIosManual) {
    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.innerHTML = `
      <div id="pwa-backdrop"></div>
      <div id="pwa-sheet" role="dialog" aria-modal="true" aria-label="Install app">
        <div class="pwa-icon-wrap">
          <img src="icon.svg" alt="App icon" width="56" height="56">
        </div>
        <h2 class="pwa-title">Install Smart Logistics Calculator</h2>
        <p class="pwa-desc">
          ${isIosManual
            ? 'Tap <strong>Share <span class="pwa-share-icon">⎋</span></strong> then <strong>"Add to Home Screen"</strong> to install.'
            : 'Add this app to your home screen for quick access — works offline too.'}
        </p>
        ${isIosManual ? `
          <div class="pwa-ios-steps">
            <div class="pwa-step"><span class="pwa-step-num">1</span> Tap the <strong>Share</strong> button <span class="pwa-share-icon">⎋</span> at the bottom of Safari</div>
            <div class="pwa-step"><span class="pwa-step-num">2</span> Scroll down and tap <strong>"Add to Home Screen"</strong></div>
            <div class="pwa-step"><span class="pwa-step-num">3</span> Tap <strong>"Add"</strong> in the top-right corner</div>
          </div>
          <button id="pwa-dismiss" class="pwa-btn pwa-btn-primary">Got it</button>
        ` : `
          <div class="pwa-actions">
            <button id="pwa-dismiss" class="pwa-btn pwa-btn-secondary">Not now</button>
            <button id="pwa-install" class="pwa-btn pwa-btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px"><path d="M12 2v13M7 10l5 5 5-5"/><path d="M4 20h16"/></svg>
              Install App
            </button>
          </div>
        `}
      </div>
    `;
    return banner;
  }

  // ── Styles ───────────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #pwa-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,.45);
      z-index: 99998; animation: pwaFadeIn .25s ease;
    }
    #pwa-sheet {
      position: fixed; bottom: 0; left: 0; right: 0;
      background: #fff; border-radius: 20px 20px 0 0;
      padding: 28px 24px 36px; z-index: 99999;
      box-shadow: 0 -8px 40px rgba(0,0,0,.18);
      animation: pwaSlideUp .3s cubic-bezier(.22,.61,.36,1);
      max-width: 480px; margin: 0 auto;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    @media (prefers-color-scheme: dark) {
      #pwa-sheet { background: #1e293b; color: #f1f5f9; }
    }
    .dark #pwa-sheet { background: #1e293b; color: #f1f5f9; }
    .pwa-icon-wrap {
      display: flex; justify-content: center; margin-bottom: 14px;
    }
    .pwa-icon-wrap img {
      border-radius: 16px;
      box-shadow: 0 4px 16px rgba(59,130,246,.35);
    }
    .pwa-title {
      text-align: center; font-size: 1.15rem; font-weight: 700;
      margin: 0 0 8px; color: inherit;
    }
    .pwa-desc {
      text-align: center; font-size: .9rem; color: #64748b;
      margin: 0 0 20px; line-height: 1.5;
    }
    .dark .pwa-desc, @media (prefers-color-scheme:dark) { .pwa-desc { color: #94a3b8; } }
    .pwa-share-icon { font-style: normal; }
    .pwa-ios-steps {
      background: #f8fafc; border-radius: 12px; padding: 14px 16px;
      margin-bottom: 20px; display: flex; flex-direction: column; gap: 10px;
    }
    .dark .pwa-ios-steps { background: #0f172a; }
    .pwa-step { display: flex; align-items: flex-start; gap: 10px; font-size: .88rem; line-height: 1.4; }
    .pwa-step-num {
      background: #3B82F6; color: #fff; border-radius: 50%;
      min-width: 22px; height: 22px; display: flex; align-items: center;
      justify-content: center; font-size: .75rem; font-weight: 700; flex-shrink: 0;
    }
    .pwa-actions { display: flex; gap: 10px; }
    .pwa-btn {
      flex: 1; border: none; border-radius: 12px; padding: 13px 8px;
      font-size: .95rem; font-weight: 600; cursor: pointer;
      transition: opacity .15s, transform .1s;
    }
    .pwa-btn:active { transform: scale(.97); opacity: .85; }
    .pwa-btn-secondary { background: #e2e8f0; color: #475569; }
    .dark .pwa-btn-secondary { background: #334155; color: #cbd5e1; }
    .pwa-btn-primary {
      background: linear-gradient(135deg, #3B82F6, #7C3AED);
      color: #fff; display: flex; align-items: center; justify-content: center;
    }
    @keyframes pwaFadeIn  { from { opacity:0 } to { opacity:1 } }
    @keyframes pwaSlideUp { from { transform:translateY(100%) } to { transform:translateY(0) } }
  `;
  document.head.appendChild(style);

  // ── Show / hide helpers ──────────────────────────────────────────────────────
  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.style.animation = 'none';
      const sheet = banner.querySelector('#pwa-sheet');
      const backdrop = banner.querySelector('#pwa-backdrop');
      if (sheet)    sheet.style.animation    = 'pwaSlideDown .25s ease forwards';
      if (backdrop) backdrop.style.animation = 'pwaFadeOut .25s ease forwards';
      // add keyframes for exit
      const exit = document.createElement('style');
      exit.textContent = `
        @keyframes pwaSlideDown { to { transform: translateY(110%) } }
        @keyframes pwaFadeOut   { to { opacity: 0 } }
      `;
      document.head.appendChild(exit);
      setTimeout(() => banner.remove(), 300);
    }
  }

  function show(deferredPrompt) {
    const isIosManual = isIOS && isSafari && !deferredPrompt;
    const banner = createBanner(isIosManual);
    document.body.appendChild(banner);

    document.getElementById('pwa-dismiss').addEventListener('click', dismiss);
    document.getElementById('pwa-backdrop').addEventListener('click', dismiss);

    if (!isIosManual) {
      document.getElementById('pwa-install').addEventListener('click', async () => {
        dismiss();
        if (deferredPrompt) {
          deferredPrompt.prompt();
          await deferredPrompt.userChoice;
        }
      });
    }
  }

  // ── Android / Chrome / Edge — intercept beforeinstallprompt ─────────────────
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    // Slight delay so the page finishes loading before the banner appears
    setTimeout(() => show(deferredPrompt), 2000);
  });

  // ── iOS Safari — show manual instructions ────────────────────────────────────
  if (isIOS && isSafari) {
    window.addEventListener('load', () => setTimeout(() => show(null), 2500));
  }

  // ── Hide banner if app gets installed ────────────────────────────────────────
  window.addEventListener('appinstalled', () => {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) banner.remove();
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
  });
})();
