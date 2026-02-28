// ── PWA Install Prompt ────────────────────────────────────────────────────────
// Handles Chrome/Brave/Edge (beforeinstallprompt), iOS Safari, Firefox Android.
// Features: swipe-to-dismiss, safe-area insets, live dark-mode sync.

(function () {
  const DISMISSED_KEY  = 'slc-install-dismissed';
  const DISMISSED_DAYS = 7;

  // Already installed as standalone PWA — never show
  if (window.matchMedia('(display-mode: standalone)').matches) return;
  if (window.navigator.standalone === true) return;

  // Dismissed recently — skip
  const dismissedAt = localStorage.getItem(DISMISSED_KEY);
  if (dismissedAt) {
    const daysSince = (Date.now() - parseInt(dismissedAt, 10)) / 86400000;
    if (daysSince < DISMISSED_DAYS) return;
  }

  // ── Browser / platform detection ────────────────────────────────────────────
  const ua             = navigator.userAgent;
  const isIOS          = /iphone|ipad|ipod/i.test(ua) && !window.MSStream;
  const isAndroid      = /android/i.test(ua);
  const isFirefox      = /firefox|fxios/i.test(ua);
  const isFirefoxAndroid = isFirefox && isAndroid;
  const isSafari       = /safari/i.test(ua) && !/chrome|crios|fxios|firefox|edgios/i.test(ua);

  // ── Mode ─────────────────────────────────────────────────────────────────────
  // native  → Chrome / Brave / Edge: uses beforeinstallprompt
  // ios     → iOS Safari: manual Share → Add to Home Screen
  // firefox → Firefox Android: manual menu → Install
  // false   → not supported
  function getMode(deferredEvt) {
    if (deferredEvt)       return 'native';
    if (isIOS && isSafari) return 'ios';
    if (isFirefoxAndroid)  return 'firefox';
    return false;
  }

  // ── Is the app currently in dark mode? ───────────────────────────────────────
  function isDark() {
    return document.documentElement.classList.contains('dark') ||
           document.body.classList.contains('dark') ||
           window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  // ── Inject styles ────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.id = 'pwa-install-styles';
  style.textContent = `
    #pwa-backdrop {
      position: fixed; inset: 0;
      background: rgba(0,0,0,.5);
      z-index: 99998;
      backdrop-filter: blur(2px);
      -webkit-backdrop-filter: blur(2px);
      animation: pwaFadeIn .2s ease;
    }
    #pwa-sheet {
      position: fixed; bottom: 0; left: 0; right: 0;
      background: #fff;
      border-radius: 20px 20px 0 0;
      padding: 8px 24px 28px;
      padding-bottom: calc(28px + env(safe-area-inset-bottom, 0px));
      z-index: 99999;
      box-shadow: 0 -8px 40px rgba(0,0,0,.2);
      animation: pwaSlideUp .3s cubic-bezier(.22,.61,.36,1);
      max-width: 480px; margin: 0 auto;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      touch-action: pan-y;
      user-select: none;
      -webkit-user-select: none;
    }
    #pwa-sheet.dark-sheet { background: #1e293b; color: #f1f5f9; }
    #pwa-drag-handle {
      width: 40px; height: 4px;
      background: #d1d5db;
      border-radius: 2px;
      margin: 0 auto 18px;
      cursor: grab;
    }
    #pwa-sheet.dark-sheet #pwa-drag-handle { background: #475569; }
    .pwa-icon-wrap {
      display: flex; justify-content: center; margin-bottom: 14px;
    }
    .pwa-icon-wrap img {
      width: 64px; height: 64px;
      border-radius: 18px;
      box-shadow: 0 4px 20px rgba(59,130,246,.4);
    }
    .pwa-title {
      text-align: center; font-size: 1.15rem; font-weight: 700;
      margin: 0 0 6px; color: inherit;
    }
    .pwa-desc {
      text-align: center; font-size: .88rem;
      color: #64748b; margin: 0 0 20px; line-height: 1.55;
    }
    #pwa-sheet.dark-sheet .pwa-desc { color: #94a3b8; }
    .pwa-steps-box {
      background: #f1f5f9; border-radius: 12px;
      padding: 14px 16px; margin-bottom: 18px;
      display: flex; flex-direction: column; gap: 10px;
    }
    #pwa-sheet.dark-sheet .pwa-steps-box { background: #0f172a; }
    .pwa-step {
      display: flex; align-items: flex-start; gap: 10px;
      font-size: .85rem; line-height: 1.45; color: inherit;
    }
    .pwa-step-num {
      background: #3B82F6; color: #fff; border-radius: 50%;
      min-width: 22px; height: 22px; display: flex; align-items: center;
      justify-content: center; font-size: .72rem; font-weight: 700; flex-shrink: 0;
    }
    .pwa-actions { display: flex; gap: 10px; }
    .pwa-btn {
      flex: 1; border: none; border-radius: 12px;
      padding: 14px 8px; font-size: .92rem; font-weight: 600;
      cursor: pointer; min-height: 48px;
      transition: opacity .15s, transform .1s;
      -webkit-tap-highlight-color: transparent;
    }
    .pwa-btn:active { transform: scale(.97); opacity: .85; }
    .pwa-btn-secondary { background: #e2e8f0; color: #475569; }
    #pwa-sheet.dark-sheet .pwa-btn-secondary { background: #334155; color: #cbd5e1; }
    .pwa-btn-primary {
      background: linear-gradient(135deg, #3B82F6, #7C3AED); color: #fff;
      display: flex; align-items: center; justify-content: center;
    }
    @keyframes pwaFadeIn  { from { opacity:0 }               to { opacity:1 } }
    @keyframes pwaSlideUp { from { transform:translateY(100%) } to { transform:translateY(0) } }
    @keyframes pwaSlideDown { to { transform: translateY(110%) } }
    @keyframes pwaFadeOut   { to { opacity: 0 } }
  `;
  document.head.appendChild(style);

  // ── Build banner DOM ─────────────────────────────────────────────────────────
  function createBanner(mode) {
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
          <div class="pwa-step"><span class="pwa-step-num">1</span>Tap the <strong>menu button ⋮</strong> in the top-right of Firefox</div>
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
      native:  'Add to your home screen for instant access — works offline too.'
    };

    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.innerHTML = `
      <div id="pwa-backdrop"></div>
      <div id="pwa-sheet" role="dialog" aria-modal="true" aria-label="Install app"
           class="${isDark() ? 'dark-sheet' : ''}">
        <div id="pwa-drag-handle"></div>
        <div class="pwa-icon-wrap">
          <img src="icon-192.png" alt="SLC icon" loading="eager">
        </div>
        <h2 class="pwa-title">Smart Logistics Calculator</h2>
        <p class="pwa-desc">${descText[mode]}</p>
        ${stepsHtml[mode]}
      </div>
    `;
    return banner;
  }

  // ── Dismiss with animation ───────────────────────────────────────────────────
  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    const banner  = document.getElementById('pwa-install-banner');
    if (!banner) return;
    const sheet   = banner.querySelector('#pwa-sheet');
    const backdrop = banner.querySelector('#pwa-backdrop');
    if (sheet)    sheet.style.animation    = 'pwaSlideDown .25s ease forwards';
    if (backdrop) backdrop.style.animation = 'pwaFadeOut .25s ease forwards';
    setTimeout(() => banner.remove(), 280);
  }

  // ── Show ─────────────────────────────────────────────────────────────────────
  function show(deferredEvt) {
    const mode = getMode(deferredEvt);
    if (!mode) return;

    const banner = createBanner(mode);
    document.body.appendChild(banner);

    const sheet   = banner.querySelector('#pwa-sheet');
    const backdrop = banner.querySelector('#pwa-backdrop');

    backdrop.addEventListener('click', dismiss);
    banner.querySelector('#pwa-dismiss').addEventListener('click', dismiss);

    if (mode === 'native') {
      banner.querySelector('#pwa-install').addEventListener('click', async () => {
        dismiss();
        if (deferredEvt) {
          deferredEvt.prompt();
          await deferredEvt.userChoice;
        }
      });
    }

    // ── Swipe-down to dismiss ──────────────────────────────────────────────────
    let startY = 0, currentY = 0, dragging = false;
    const onStart = e => {
      const touch = e.touches ? e.touches[0] : e;
      startY   = touch.clientY;
      currentY = touch.clientY;
      dragging = true;
      sheet.style.transition = 'none';
    };
    const onMove = e => {
      if (!dragging) return;
      const touch = e.touches ? e.touches[0] : e;
      currentY = touch.clientY;
      const delta = Math.max(0, currentY - startY);
      sheet.style.transform = `translateY(${delta}px)`;
      backdrop.style.opacity = String(1 - delta / 300);
    };
    const onEnd = () => {
      if (!dragging) return;
      dragging = false;
      sheet.style.transition = '';
      sheet.style.transform  = '';
      backdrop.style.opacity = '';
      if (currentY - startY > 80) dismiss();
    };
    sheet.addEventListener('touchstart', onStart, { passive: true });
    sheet.addEventListener('touchmove',  onMove,  { passive: true });
    sheet.addEventListener('touchend',   onEnd);

    // Keep dark-sheet class in sync if user toggles theme while banner is open
    const obs = new MutationObserver(() => {
      sheet.classList.toggle('dark-sheet', isDark());
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    obs.observe(document.body,            { attributes: true, attributeFilter: ['class'] });
  }

  // ── Chrome / Brave / Edge ────────────────────────────────────────────────────
  let deferredEvt = null;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredEvt = e;
    setTimeout(() => show(deferredEvt), 2000);
  });

  // ── iOS Safari ───────────────────────────────────────────────────────────────
  if (isIOS && isSafari) {
    window.addEventListener('load', () => setTimeout(() => show(null), 2500));
  }

  // ── Firefox on Android ───────────────────────────────────────────────────────
  if (isFirefoxAndroid) {
    window.addEventListener('load', () => setTimeout(() => show(null), 2500));
  }

  // ── Already installed ────────────────────────────────────────────────────────
  window.addEventListener('appinstalled', () => {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) banner.remove();
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
  });
})();
