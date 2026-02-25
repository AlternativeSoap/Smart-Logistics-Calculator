// ==================================================================================
// Interactive Warehouse Floor Plan Builder — Advanced Edition
// Features: Zoom/Pan, Resize Handles, Multi-select, Copy/Paste, Rotation, Snap Guides,
//           Layers, Real Dimensions, Mini-map, Templates, Measurement, Context Menu,
//           15 Element Types, SVG Export, Collision Detection
// ==================================================================================

const WarehouseLayout = (function () {
    'use strict';

    // ─── Helpers ────────────────────────────
    const t = (key, fallback) => {
        if (typeof translations !== 'undefined' && typeof currentLanguage !== 'undefined') {
            return translations[currentLanguage]?.[key] || fallback;
        }
        return fallback;
    };
    const isDa = () => typeof currentLanguage !== 'undefined' && currentLanguage === 'da';
    const isDark = () => document.documentElement.classList.contains('dark');

    // ─── Config ─────────────────────────────
    const STORAGE_KEY = 'warehouse_layout';
    const MAX_HISTORY = 80;
    const HANDLE_SIZE = 8;
    const SNAP_THRESHOLD = 6;
    const MIN_ZOOM = 0.25;
    const MAX_ZOOM = 4;
    const ZOOM_STEP = 0.15;

    // Real-world dimensions (meters)
    let warehouseWidth = 60;
    let warehouseDepth = 40;
    let gridSizeM = 2;

    // Derived grid
    let COLS, ROWS, CELL, W, H;
    function recalcGrid() {
        COLS = Math.ceil(warehouseWidth / gridSizeM);
        ROWS = Math.ceil(warehouseDepth / gridSizeM);
        CELL = 32;
        W = COLS * CELL;
        H = ROWS * CELL;
    }
    recalcGrid();

    // ─── Element Types (15) ─────────────────
    const ELEMENT_TYPES = {
        rack:       { label: '📦 Reoler',         color: '#6366f1', darkColor: '#818cf8', icon: '📦', minW: 2, minH: 1 },
        wall:       { label: '🧱 Væg',            color: '#64748b', darkColor: '#94a3b8', icon: '🧱', minW: 1, minH: 1 },
        dock:       { label: '🚛 Rampe',          color: '#f59e0b', darkColor: '#fbbf24', icon: '🚛', minW: 3, minH: 2 },
        office:     { label: '🏢 Kontor',         color: '#10b981', darkColor: '#34d399', icon: '🏢', minW: 3, minH: 3 },
        aisle:      { label: '➡️ Gang',           color: '#e2e8f0', darkColor: '#475569', icon: '➡️', minW: 1, minH: 1 },
        packing:    { label: '📋 Pakkestation',   color: '#ec4899', darkColor: '#f472b6', icon: '📋', minW: 2, minH: 2 },
        cold:       { label: '❄️ Kølerum',        color: '#06b6d4', darkColor: '#22d3ee', icon: '❄️', minW: 3, minH: 3 },
        hazmat:     { label: '⚠️ Farligt gods',   color: '#ef4444', darkColor: '#f87171', icon: '⚠️', minW: 2, minH: 2 },
        staging:    { label: '🔄 Staging',        color: '#8b5cf6', darkColor: '#a78bfa', icon: '🔄', minW: 2, minH: 2 },
        forklift:   { label: '🏗️ Truckvej',      color: '#fde68a', darkColor: '#fcd34d', icon: '🏗️', minW: 1, minH: 1 },
        conveyor:   { label: '⚙️ Transportbånd',  color: '#14b8a6', darkColor: '#2dd4bf', icon: '⚙️', minW: 3, minH: 1 },
        charging:   { label: '🔋 Opladning',      color: '#84cc16', darkColor: '#a3e635', icon: '🔋', minW: 2, minH: 1 },
        exit:       { label: '🚪 Nødudgang',      color: '#fb923c', darkColor: '#fdba74', icon: '🚪', minW: 1, minH: 1 },
        elevator:   { label: '🛗 Elevator',       color: '#38bdf8', darkColor: '#7dd3fc', icon: '🛗', minW: 2, minH: 2 },
        returns:    { label: '↩️ Returvarer',     color: '#f43f5e', darkColor: '#fb7185', icon: '↩️', minW: 3, minH: 2 },
        mezzanine:  { label: '🏗️ Mezzanin',      color: '#7c3aed', darkColor: '#a78bfa', icon: '🏗️', minW: 4, minH: 3 },
        restroom:   { label: '🚻 Toiletter',      color: '#0ea5e9', darkColor: '#38bdf8', icon: '🚻', minW: 2, minH: 2 },
        security:   { label: '🔒 Sikkerhed',      color: '#dc2626', darkColor: '#f87171', icon: '🔒', minW: 1, minH: 1 },
        breakroom:  { label: '☕ Pauserum',        color: '#d97706', darkColor: '#fbbf24', icon: '☕', minW: 3, minH: 2 },
        waste:      { label: '🗑️ Affald',         color: '#78716c', darkColor: '#a8a29e', icon: '🗑️', minW: 2, minH: 2 },
        picker:     { label: '🎯 Plukstation',    color: '#e11d48', darkColor: '#fb7185', icon: '🎯', minW: 2, minH: 1 },
        crossdock:  { label: '🔀 Crossdock',      color: '#0891b2', darkColor: '#22d3ee', icon: '🔀', minW: 4, minH: 2 },
        bulk:       { label: '📐 Bulklager',      color: '#4338ca', darkColor: '#818cf8', icon: '📐', minW: 4, minH: 3 },
        quarantine: { label: '🔬 Karantæne',      color: '#be185d', darkColor: '#f472b6', icon: '🔬', minW: 2, minH: 2 },
        electrical: { label: '⚡ Eltavle',        color: '#eab308', darkColor: '#facc15', icon: '⚡', minW: 1, minH: 1 },
    };

    // ABC zone colours
    const ABC_COLORS = {
        A: { bg: 'rgba(239,68,68,0.15)', border: '#ef4444', label: 'A-zone' },
        B: { bg: 'rgba(245,158,11,0.15)', border: '#f59e0b', label: 'B-zone' },
        C: { bg: 'rgba(34,197,94,0.15)',  border: '#22c55e', label: 'C-zone' },
    };

    // ─── State ──────────────────────────────
    let canvas, ctx, overlay, overlayCtx, container;
    let minimapCanvas, minimapCtx;
    let elements = [];
    let selectedIds = new Set();
    let clipboard = [];
    let dragState = null;
    let placingType = null;
    let hoveredCell = null;
    let nextId = 1;
    let history = [];
    let historyIndex = -1;

    // View state
    let zoom = 1;
    let panX = 0, panY = 0;
    let isPanning = false;
    let panStart = { x: 0, y: 0, px: 0, py: 0 };

    // Tool toggles
    let gridVisible = true;
    let snapEnabled = true;
    let abcOverlay = false;
    let measureMode = false;
    let measureStart = null;
    let measureEnd = null;

    // Layers visibility
    let hiddenTypes = new Set();

    // Selection rectangle
    let selectRect = null;

    // Snap guides to render
    let activeGuides = [];

    // Resize state
    let resizeState = null;

    let _initialized = false;
    let _boundKeydown = null;

    // ─── Initialise ─────────────────────────
    function init() {
        canvas = document.getElementById('warehouseCanvas');
        overlay = document.getElementById('warehouseOverlay');
        container = document.getElementById('whCanvasContainer');
        minimapCanvas = document.getElementById('whMinimapCanvas');
        if (!canvas || !overlay || !container) return;

        const dimW = document.getElementById('whDimWidth');
        const dimD = document.getElementById('whDimDepth');
        const gridSel = document.getElementById('whGridSize');
        if (dimW) warehouseWidth = +dimW.value || 60;
        if (dimD) warehouseDepth = +dimD.value || 40;
        if (gridSel) gridSizeM = +gridSel.value || 2;
        recalcGrid();

        canvas.width = W;
        canvas.height = H;
        overlay.width = W;
        overlay.height = H;
        ctx = canvas.getContext('2d');
        overlayCtx = overlay.getContext('2d');

        if (minimapCanvas) {
            minimapCtx = minimapCanvas.getContext('2d');
        }

        load();
        if (history.length === 0) pushHistory();
        if (!_initialized) {
            bindEvents();
            _initialized = true;
        }
        zoomToFit();
        render();
        updateLayersPanel();
        updateDimensionsDisplay();
    }

    // ─── Persistence ────────────────────────
    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                elements, nextId, warehouseWidth, warehouseDepth, gridSizeM
            }));
        } catch (e) { /* quota */ }
    }
    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const data = JSON.parse(raw);
                elements = data.elements || [];
                nextId = data.nextId || (elements.length ? Math.max(...elements.map(e => e.id)) + 1 : 1);
                if (data.warehouseWidth) warehouseWidth = data.warehouseWidth;
                if (data.warehouseDepth) warehouseDepth = data.warehouseDepth;
                if (data.gridSizeM) gridSizeM = data.gridSizeM;
                recalcGrid();
                const dimW = document.getElementById('whDimWidth');
                const dimD = document.getElementById('whDimDepth');
                const gridSel = document.getElementById('whGridSize');
                if (dimW) dimW.value = warehouseWidth;
                if (dimD) dimD.value = warehouseDepth;
                if (gridSel) gridSel.value = gridSizeM;
            }
        } catch (e) { elements = []; nextId = 1; }
    }

    // ─── Dimensions ─────────────────────────
    function setDimensions() {
        const dimW = document.getElementById('whDimWidth');
        const dimD = document.getElementById('whDimDepth');
        if (dimW) warehouseWidth = Math.max(10, Math.min(500, +dimW.value || 60));
        if (dimD) warehouseDepth = Math.max(10, Math.min(500, +dimD.value || 40));
        recalcGrid();
        canvas.width = W;
        canvas.height = H;
        overlay.width = W;
        overlay.height = H;
        elements.forEach(el => {
            el.x = Math.min(el.x, COLS - el.w);
            el.y = Math.min(el.y, ROWS - el.h);
        });
        pushHistory();
        save();
        zoomToFit();
        render();
        updateDimensionsDisplay();
    }
    function setGridSize(val) {
        gridSizeM = Math.max(1, Math.min(10, val));
        recalcGrid();
        canvas.width = W;
        canvas.height = H;
        overlay.width = W;
        overlay.height = H;
        elements.forEach(el => {
            el.x = Math.min(el.x, Math.max(0, COLS - el.w));
            el.y = Math.min(el.y, Math.max(0, ROWS - el.h));
        });
        pushHistory();
        save();
        zoomToFit();
        render();
        updateDimensionsDisplay();
    }
    function updateDimensionsDisplay() {
        const area = document.getElementById('whAreaDisplay');
        const scale = document.getElementById('whScaleDisplay');
        const scaleLabel = document.getElementById('whScaleLabel');
        if (area) area.textContent = (warehouseWidth * warehouseDepth).toLocaleString() + ' m²';
        if (scale) scale.textContent = '1 ' + (isDa() ? 'celle' : 'cell') + ' = ' + gridSizeM + ' m';
        if (scaleLabel) {
            const metersPerPx = gridSizeM / (CELL * zoom);
            const barMeters = metersPerPx * 64;
            scaleLabel.textContent = barMeters < 1 ? (barMeters * 100).toFixed(0) + ' cm' : barMeters.toFixed(1) + ' m';
        }
    }

    // ─── History ────────────────────────────
    function pushHistory() {
        historyIndex++;
        history = history.slice(0, historyIndex);
        history.push(JSON.stringify(elements));
        if (history.length > MAX_HISTORY) { history.shift(); historyIndex--; }
    }
    function undo() {
        if (historyIndex <= 0) return;
        historyIndex--;
        elements = JSON.parse(history[historyIndex]);
        selectedIds.clear();
        save(); render();
    }
    function redo() {
        if (historyIndex >= history.length - 1) return;
        historyIndex++;
        elements = JSON.parse(history[historyIndex]);
        selectedIds.clear();
        save(); render();
    }

    // ─── Zoom / Pan ─────────────────────────
    function applyTransform() {
        var tx = 'translate(' + panX + 'px, ' + panY + 'px) scale(' + zoom + ')';
        canvas.style.transformOrigin = '0 0';
        canvas.style.transform = tx;
        overlay.style.transformOrigin = '0 0';
        overlay.style.transform = tx;
        var display = document.getElementById('whZoomDisplay');
        if (display) display.textContent = Math.round(zoom * 100) + '%';
        updateDimensionsDisplay();
    }
    function zoomIn() { setZoom(zoom + ZOOM_STEP); }
    function zoomOut() { setZoom(zoom - ZOOM_STEP); }
    function setZoom(newZoom, cx, cy) {
        var clamped = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
        if (!cx || !cy) {
            var rect = container.getBoundingClientRect();
            cx = rect.width / 2;
            cy = rect.height / 2;
        }
        var worldX = (cx - panX) / zoom;
        var worldY = (cy - panY) / zoom;
        zoom = clamped;
        panX = cx - worldX * zoom;
        panY = cy - worldY * zoom;
        applyTransform();
        renderMinimap();
    }
    function zoomReset() { zoomToFit(); }
    function zoomToFit() {
        if (!container) return;
        var rect = container.getBoundingClientRect();
        var pad = 20;
        var scaleX = (rect.width - pad * 2) / W;
        var scaleY = (rect.height - pad * 2) / H;
        zoom = Math.min(scaleX, scaleY, 2);
        panX = (rect.width - W * zoom) / 2;
        panY = (rect.height - H * zoom) / 2;
        applyTransform();
        renderMinimap();
    }

    // ─── Coordinate Conversion ──────────────
    function screenToWorld(sx, sy) {
        var rect = container.getBoundingClientRect();
        return {
            x: (sx - rect.left - (container.clientLeft || 0) - panX) / zoom,
            y: (sy - rect.top - (container.clientTop || 0) - panY) / zoom,
        };
    }
    function worldToCell(wx, wy) {
        return {
            x: Math.floor(wx / CELL),
            y: Math.floor(wy / CELL),
        };
    }
    function getCellFromEvent(e) {
        var p = screenToWorld(e.clientX, e.clientY);
        return worldToCell(p.x, p.y);
    }
    function getWorldFromEvent(e) {
        return screenToWorld(e.clientX, e.clientY);
    }

    // ─── Drawing ────────────────────────────
    function render() {
        var dark = isDark();
        ctx.clearRect(0, 0, W, H);

        // Background
        ctx.fillStyle = dark ? '#1e293b' : '#f8fafc';
        ctx.fillRect(0, 0, W, H);

        if (gridVisible) drawGrid(dark);
        if (abcOverlay) drawABCOverlay(dark);

        elements.forEach(function(el) {
            if (hiddenTypes.has(el.type)) return;
            drawElement(el, dark);
        });

        if (selectRect) drawSelectionRect();
        activeGuides.forEach(function(g) { drawSnapGuide(g); });
        if (measureMode && measureStart && measureEnd) drawMeasureLine();

        drawOverlay();
        renderMinimap();
        updateStats();
    }

    function drawGrid(dark) {
        ctx.strokeStyle = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
        ctx.lineWidth = 0.5;
        for (var x = 0; x <= W; x += CELL) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        for (var y = 0; y <= H; y += CELL) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }
        // Major gridlines every 5 cells
        ctx.strokeStyle = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)';
        ctx.lineWidth = 1;
        for (var x2 = 0; x2 <= W; x2 += CELL * 5) {
            ctx.beginPath(); ctx.moveTo(x2, 0); ctx.lineTo(x2, H); ctx.stroke();
        }
        for (var y2 = 0; y2 <= H; y2 += CELL * 5) {
            ctx.beginPath(); ctx.moveTo(0, y2); ctx.lineTo(W, y2); ctx.stroke();
        }
        // Ruler ticks
        ctx.fillStyle = dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.20)';
        ctx.font = '9px system-ui';
        ctx.textBaseline = 'top';
        ctx.textAlign = 'center';
        for (var c = 0; c < COLS; c += 5) {
            ctx.fillText((c * gridSizeM) + '', c * CELL + CELL / 2, 2);
        }
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        for (var r = 0; r < ROWS; r += 5) {
            ctx.fillText((r * gridSizeM) + '', 2, r * CELL + CELL / 2);
        }
    }

    function drawElement(el, dark) {
        var typeDef = ELEMENT_TYPES[el.type] || ELEMENT_TYPES.rack;
        var px = el.x * CELL;
        var py = el.y * CELL;
        var pw = el.w * CELL;
        var ph = el.h * CELL;
        var isSelected = selectedIds.has(el.id);

        // Collision check
        var hasCollision = elements.some(function(other) {
            return other.id !== el.id &&
                !hiddenTypes.has(other.type) &&
                el.x < other.x + other.w && el.x + el.w > other.x &&
                el.y < other.y + other.h && el.y + el.h > other.y;
        });

        if (isSelected) {
            ctx.shadowColor = dark ? 'rgba(96,165,250,0.5)' : 'rgba(59,130,246,0.4)';
            ctx.shadowBlur = 12;
        }

        var baseColor = dark ? typeDef.darkColor : typeDef.color;
        ctx.fillStyle = baseColor + '33';
        ctx.beginPath();
        var radius = Math.min(4, CELL / 4);
        roundRect(ctx, px + 1, py + 1, pw - 2, ph - 2, radius);
        ctx.fill();

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        ctx.strokeStyle = hasCollision ? '#ef4444' : baseColor;
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        if (hasCollision) ctx.setLineDash([4, 3]);
        ctx.beginPath();
        roundRect(ctx, px + 1, py + 1, pw - 2, ph - 2, radius);
        ctx.stroke();
        ctx.setLineDash([]);

        // ABC zone stripe
        if (el.abcZone && ABC_COLORS[el.abcZone]) {
            ctx.fillStyle = ABC_COLORS[el.abcZone].border + '44';
            ctx.fillRect(px + 1, py + ph - 5, pw - 2, 4);
        }

        // Content
        ctx.fillStyle = dark ? typeDef.darkColor : typeDef.color;
        var fontSize = Math.max(10, Math.min(CELL - 6, 14));
        ctx.font = fontSize + 'px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        var displayLabel = el.label || '';
        if (pw > CELL * 1.5 && ph > CELL * 1.5) {
            ctx.font = Math.min(18, pw / 3) + 'px system-ui';
            ctx.fillText(typeDef.icon, px + pw / 2, py + ph / 2 - (displayLabel ? 8 : 0));
            if (displayLabel) {
                ctx.font = Math.min(11, pw / el.w / 1.5) + 'px system-ui';
                var truncated = displayLabel;
                while (ctx.measureText(truncated).width > pw - 10 && truncated.length > 2) {
                    truncated = truncated.slice(0, -2) + '\u2026';
                }
                ctx.fillText(truncated, px + pw / 2, py + ph / 2 + 10);
            }
        } else {
            var text = typeDef.icon + (displayLabel ? ' ' + displayLabel : '');
            var trunc = text;
            while (ctx.measureText(trunc).width > pw - 6 && trunc.length > 2) {
                trunc = trunc.slice(0, -2) + '\u2026';
            }
            ctx.fillText(trunc, px + pw / 2, py + ph / 2);
        }

        // Rotation indicator
        if (el.rotation) {
            ctx.save();
            ctx.fillStyle = dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)';
            ctx.font = '9px system-ui';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'top';
            ctx.fillText(el.rotation + '\u00b0', px + pw - 3, py + 2);
            ctx.restore();
        }

        // Selection handles (8: corners + midpoints)
        if (isSelected) {
            var hs = HANDLE_SIZE;
            ctx.fillStyle = dark ? '#60a5fa' : '#3b82f6';
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            getHandles(el).forEach(function(h) {
                ctx.fillRect(h.x - hs / 2, h.y - hs / 2, hs, hs);
                ctx.strokeRect(h.x - hs / 2, h.y - hs / 2, hs, hs);
            });
        }

        // Real-world size label when selected
        if (isSelected) {
            var realW = (el.w * gridSizeM).toFixed(0);
            var realH = (el.h * gridSizeM).toFixed(0);
            ctx.fillStyle = dark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.6)';
            ctx.font = 'bold 9px system-ui';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(realW + '\u00d7' + realH + ' m', px + pw / 2, py - 3);
        }
    }

    function roundRect(ctx, x, y, w, h, r) {
        r = Math.min(r, w / 2, h / 2);
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.arcTo(x + w, y, x + w, y + r, r);
        ctx.lineTo(x + w, y + h - r);
        ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
        ctx.lineTo(x + r, y + h);
        ctx.arcTo(x, y + h, x, y + h - r, r);
        ctx.lineTo(x, y + r);
        ctx.arcTo(x, y, x + r, y, r);
        ctx.closePath();
    }

    function getHandles(el) {
        var px = el.x * CELL;
        var py = el.y * CELL;
        var pw = el.w * CELL;
        var ph = el.h * CELL;
        return [
            { x: px,          y: py,          cursor: 'nw-resize', handle: 'nw' },
            { x: px + pw / 2, y: py,          cursor: 'n-resize',  handle: 'n'  },
            { x: px + pw,     y: py,          cursor: 'ne-resize', handle: 'ne' },
            { x: px + pw,     y: py + ph / 2, cursor: 'e-resize',  handle: 'e'  },
            { x: px + pw,     y: py + ph,     cursor: 'se-resize', handle: 'se' },
            { x: px + pw / 2, y: py + ph,     cursor: 's-resize',  handle: 's'  },
            { x: px,          y: py + ph,     cursor: 'sw-resize', handle: 'sw' },
            { x: px,          y: py + ph / 2, cursor: 'w-resize',  handle: 'w'  },
        ];
    }

    function drawABCOverlay(dark) {
        var zones = ['A', 'B', 'C'];
        var zoneH = Math.floor(ROWS / 3);
        zones.forEach(function(z, i) {
            var yStart = i * zoneH * CELL;
            var height = (i === 2 ? ROWS - 2 * zoneH : zoneH) * CELL;
            ctx.fillStyle = ABC_COLORS[z].bg;
            ctx.fillRect(0, yStart, W, height);
            ctx.strokeStyle = ABC_COLORS[z].border;
            ctx.lineWidth = 1;
            ctx.setLineDash([6, 4]);
            ctx.strokeRect(0, yStart, W, height);
            ctx.setLineDash([]);
            ctx.fillStyle = dark ? '#e2e8f0' : '#334155';
            ctx.font = 'bold 11px system-ui';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            var label = ABC_COLORS[z].label + (isDa() ?
                (z === 'A' ? ' (hurtige varer)' : z === 'B' ? ' (medium)' : ' (langsomme varer)') :
                (z === 'A' ? ' (fast movers)' : z === 'B' ? ' (medium)' : ' (slow movers)'));
            ctx.fillText(label, 6, yStart + 4);
        });
    }

    function drawOverlay() {
        overlayCtx.clearRect(0, 0, W, H);
        if (!placingType || !hoveredCell) return;
        var typeDef = ELEMENT_TYPES[placingType];
        var px = hoveredCell.x * CELL;
        var py = hoveredCell.y * CELL;
        var pw = typeDef.minW * CELL;
        var ph = typeDef.minH * CELL;

        overlayCtx.fillStyle = typeDef.color + '44';
        overlayCtx.fillRect(px, py, pw, ph);
        overlayCtx.strokeStyle = typeDef.color;
        overlayCtx.lineWidth = 2;
        overlayCtx.setLineDash([4, 4]);
        overlayCtx.strokeRect(px, py, pw, ph);
        overlayCtx.setLineDash([]);

        overlayCtx.fillStyle = isDark() ? '#e2e8f0' : '#1e293b';
        overlayCtx.font = 'bold 10px system-ui';
        overlayCtx.textAlign = 'center';
        overlayCtx.textBaseline = 'bottom';
        overlayCtx.fillText(typeDef.minW * gridSizeM + '\u00d7' + typeDef.minH * gridSizeM + ' m', px + pw / 2, py - 3);
    }

    function drawSelectionRect() {
        overlayCtx.strokeStyle = '#3b82f6';
        overlayCtx.lineWidth = 1.5;
        overlayCtx.setLineDash([4, 4]);
        overlayCtx.fillStyle = 'rgba(59,130,246,0.08)';
        var x = Math.min(selectRect.x1, selectRect.x2);
        var y = Math.min(selectRect.y1, selectRect.y2);
        var w = Math.abs(selectRect.x2 - selectRect.x1);
        var h = Math.abs(selectRect.y2 - selectRect.y1);
        overlayCtx.fillRect(x, y, w, h);
        overlayCtx.strokeRect(x, y, w, h);
        overlayCtx.setLineDash([]);
    }

    function drawSnapGuide(guide) {
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        if (guide.axis === 'x') {
            ctx.moveTo(guide.pos * CELL, 0);
            ctx.lineTo(guide.pos * CELL, H);
        } else {
            ctx.moveTo(0, guide.pos * CELL);
            ctx.lineTo(W, guide.pos * CELL);
        }
        ctx.stroke();
        ctx.setLineDash([]);
    }

    function drawMeasureLine() {
        var sx = measureStart.x * CELL + CELL / 2;
        var sy = measureStart.y * CELL + CELL / 2;
        var ex = measureEnd.x * CELL + CELL / 2;
        var ey = measureEnd.y * CELL + CELL / 2;

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.setLineDash([]);

        [{ x: sx, y: sy }, { x: ex, y: ey }].forEach(function(p) {
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        var dx = Math.abs(measureEnd.x - measureStart.x) * gridSizeM;
        var dy = Math.abs(measureEnd.y - measureStart.y) * gridSizeM;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var midX = (sx + ex) / 2;
        var midY = (sy + ey) / 2;
        ctx.fillStyle = isDark() ? '#fbbf24' : '#92400e';
        ctx.font = 'bold 12px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(dist.toFixed(1) + ' m', midX, midY - 6);
        if (dx > 0 && dy > 0) {
            ctx.font = '10px system-ui';
            ctx.fillStyle = isDark() ? 'rgba(251,191,36,0.7)' : 'rgba(146,64,14,0.6)';
            ctx.fillText('\u2194 ' + dx.toFixed(1) + ' m  \u2195 ' + dy.toFixed(1) + ' m', midX, midY + 14);
        }
    }

    // ─── Mini-map ───────────────────────────
    function renderMinimap() {
        if (!minimapCtx) return;
        var mw = minimapCanvas.width;
        var mh = minimapCanvas.height;
        minimapCtx.clearRect(0, 0, mw, mh);

        var dark = isDark();
        minimapCtx.fillStyle = dark ? '#1e293b' : '#f1f5f9';
        minimapCtx.fillRect(0, 0, mw, mh);

        var scale = Math.min(mw / W, mh / H);

        elements.forEach(function(el) {
            if (hiddenTypes.has(el.type)) return;
            var typeDef = ELEMENT_TYPES[el.type] || ELEMENT_TYPES.rack;
            minimapCtx.fillStyle = (dark ? typeDef.darkColor : typeDef.color) + '88';
            minimapCtx.fillRect(
                el.x * CELL * scale,
                el.y * CELL * scale,
                el.w * CELL * scale,
                el.h * CELL * scale
            );
        });

        if (container) {
            var rect = container.getBoundingClientRect();
            var vx = (-panX / zoom) * scale;
            var vy = (-panY / zoom) * scale;
            var vw = (rect.width / zoom) * scale;
            var vh = (rect.height / zoom) * scale;
            minimapCtx.strokeStyle = '#3b82f6';
            minimapCtx.lineWidth = 2;
            minimapCtx.strokeRect(vx, vy, vw, vh);
        }
    }

    // ─── Event Binding ──────────────────────
    function bindEvents() {
        overlay.addEventListener('mousedown', onMouseDown);
        overlay.addEventListener('mousemove', onMouseMove);
        overlay.addEventListener('mouseup', onMouseUp);
        overlay.addEventListener('mouseleave', onMouseLeave);
        overlay.addEventListener('dblclick', onDblClick);
        overlay.addEventListener('contextmenu', onContextMenu);

        container.addEventListener('wheel', onWheel, { passive: false });

        _boundKeydown = onKeyDown;
        document.addEventListener('keydown', _boundKeydown);

        document.addEventListener('click', function(e) {
            var menu = document.getElementById('whContextMenu');
            if (menu && !menu.contains(e.target)) hideContextMenu();
        });
    }

    function onWheel(e) {
        e.preventDefault();
        if (e.ctrlKey || e.metaKey) {
            var delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
            setZoom(zoom + delta, e.clientX, e.clientY);
        } else {
            panX -= e.deltaX * 0.8;
            panY -= e.deltaY * 0.8;
            applyTransform();
            renderMinimap();
        }
    }

    function onKeyDown(e) {
        var sec = document.getElementById('warehouse-section');
        if (!sec || sec.classList.contains('hidden')) return;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

        var ctrl = e.ctrlKey || e.metaKey;

        switch (e.key) {
            case 'z': case 'Z':
                if (ctrl && e.shiftKey) { e.preventDefault(); redo(); }
                else if (ctrl) { e.preventDefault(); undo(); }
                break;
            case 'y': case 'Y':
                if (ctrl) { e.preventDefault(); redo(); }
                break;
            case 'Delete': case 'Backspace':
                if (selectedIds.size) { e.preventDefault(); removeSelected(); }
                break;
            case 'Escape':
                placingType = null;
                selectedIds.clear();
                measureMode = false;
                measureStart = null;
                measureEnd = null;
                document.querySelectorAll('.wh-palette-btn').forEach(function(b) { b.classList.remove('ring-2', 'ring-offset-2'); });
                updateToolbarStates();
                render();
                updatePropertiesPanel();
                break;
            case 'a': case 'A':
                if (ctrl) { e.preventDefault(); selectAll(); }
                break;
            case 'c': case 'C':
                if (ctrl) { e.preventDefault(); ctxCopy(); }
                break;
            case 'v': case 'V':
                if (ctrl) { e.preventDefault(); ctxPaste(); }
                break;
            case 'x': case 'X':
                if (ctrl) { e.preventDefault(); ctxCut(); }
                break;
            case 'd': case 'D':
                if (ctrl && selectedIds.size) { e.preventDefault(); duplicateSelected(); }
                break;
            case 'r': case 'R':
                if (!ctrl && selectedIds.size) { e.preventDefault(); rotateSelected(); }
                break;
            case 'g': case 'G':
                if (!ctrl) { e.preventDefault(); toggleGrid(); }
                break;
            case 's': case 'S':
                if (!ctrl) { e.preventDefault(); toggleSnap(); }
                break;
            case 'm': case 'M':
                if (!ctrl) { e.preventDefault(); toggleMeasure(); }
                break;
            case '+': case '=':
                e.preventDefault(); zoomIn();
                break;
            case '-': case '_':
                e.preventDefault(); zoomOut();
                break;
            case '0':
                if (!ctrl) { e.preventDefault(); zoomToFit(); }
                break;
            case 'ArrowLeft':
                if (selectedIds.size && !ctrl) { e.preventDefault(); nudgeSelection(-1, 0); }
                break;
            case 'ArrowRight':
                if (selectedIds.size && !ctrl) { e.preventDefault(); nudgeSelection(1, 0); }
                break;
            case 'ArrowUp':
                if (selectedIds.size && !ctrl) { e.preventDefault(); nudgeSelection(0, -1); }
                break;
            case 'ArrowDown':
                if (selectedIds.size && !ctrl) { e.preventDefault(); nudgeSelection(0, 1); }
                break;
        }
    }

    // ─── Mouse Events ───────────────────────
    function onMouseDown(e) {
        hideContextMenu();
        if (e.button === 2) return;

        var world = getWorldFromEvent(e);
        var cell = worldToCell(world.x, world.y);

        if (e.button === 1) {
            e.preventDefault();
            startPan(e);
            return;
        }

        if (measureMode) {
            if (!measureStart) {
                measureStart = cell;
            } else {
                measureEnd = cell;
                render();
                measureStart = null;
                measureEnd = null;
            }
            return;
        }

        if (placingType) {
            placeElement(cell);
            return;
        }

        // Check resize handle first
        if (selectedIds.size === 1) {
            var selEl = elements.find(function(e) { return selectedIds.has(e.id); });
            if (selEl) {
                var handle = hitTestHandle(selEl, world.x, world.y);
                if (handle) {
                    resizeState = {
                        el: selEl, handle: handle.handle,
                        startWX: world.x, startWY: world.y,
                        origX: selEl.x, origY: selEl.y, origW: selEl.w, origH: selEl.h
                    };
                    return;
                }
            }
        }

        var hit = hitTest(cell);
        if (hit) {
            if (e.shiftKey) {
                if (selectedIds.has(hit.id)) {
                    selectedIds.delete(hit.id);
                } else {
                    selectedIds.add(hit.id);
                }
            } else if (!selectedIds.has(hit.id)) {
                selectedIds.clear();
                selectedIds.add(hit.id);
            }
            dragState = {
                mode: 'move',
                startCell: cell,
                startWorldCell: { x: world.x / CELL, y: world.y / CELL },
                origPositions: Array.from(selectedIds).map(function(id) {
                    var el = elements.find(function(e) { return e.id === id; });
                    return { id: id, x: el.x, y: el.y };
                }),
            };
            if (selectedIds.size === 1) {
                dragState.grabOffset = {
                    x: (world.x / CELL) - hit.x,
                    y: (world.y / CELL) - hit.y,
                };
            }
            render();
            updatePropertiesPanel();
        } else {
            if (!e.shiftKey) selectedIds.clear();
            selectRect = { x1: world.x, y1: world.y, x2: world.x, y2: world.y };
            render();
            updatePropertiesPanel();
        }
    }

    function onMouseMove(e) {
        var world = getWorldFromEvent(e);
        var cell = worldToCell(world.x, world.y);
        hoveredCell = cell;

        updateCoordDisplay(cell);

        if (isPanning) {
            panX = panStart.px + (e.clientX - panStart.x);
            panY = panStart.py + (e.clientY - panStart.y);
            applyTransform();
            renderMinimap();
            return;
        }

        if (resizeState) {
            performResize(world);
            render();
            return;
        }

        if (dragState && dragState.mode === 'move') {
            activeGuides = [];

            if (selectedIds.size === 1 && dragState.grabOffset) {
                var onlyOrig = dragState.origPositions[0];
                var onlyEl = elements.find(function(e) { return e.id === onlyOrig.id; });
                if (onlyEl) {
                    var nxSingle = Math.round((world.x / CELL) - dragState.grabOffset.x);
                    var nySingle = Math.round((world.y / CELL) - dragState.grabOffset.y);

                    if (snapEnabled) {
                        var snappedSingle = calcSnap(onlyEl, nxSingle, nySingle);
                        nxSingle = snappedSingle.x;
                        nySingle = snappedSingle.y;
                        activeGuides = snappedSingle.guides;
                    }

                    onlyEl.x = Math.max(0, Math.min(COLS - onlyEl.w, nxSingle));
                    onlyEl.y = Math.max(0, Math.min(ROWS - onlyEl.h, nySingle));
                }
            } else {
                var dx = Math.round((world.x / CELL) - dragState.startWorldCell.x);
                var dy = Math.round((world.y / CELL) - dragState.startWorldCell.y);

                dragState.origPositions.forEach(function(orig) {
                    var el = elements.find(function(e) { return e.id === orig.id; });
                    if (!el) return;
                    var nx = orig.x + dx;
                    var ny = orig.y + dy;

                    el.x = Math.max(0, Math.min(COLS - el.w, nx));
                    el.y = Math.max(0, Math.min(ROWS - el.h, ny));
                });
            }
            render();
            return;
        }

        if (selectRect) {
            selectRect.x2 = world.x;
            selectRect.y2 = world.y;
            var rx1 = Math.min(selectRect.x1, selectRect.x2) / CELL;
            var ry1 = Math.min(selectRect.y1, selectRect.y2) / CELL;
            var rx2 = Math.max(selectRect.x1, selectRect.x2) / CELL;
            var ry2 = Math.max(selectRect.y1, selectRect.y2) / CELL;
            selectedIds.clear();
            elements.forEach(function(el) {
                if (hiddenTypes.has(el.type)) return;
                if (el.x + el.w > rx1 && el.x < rx2 && el.y + el.h > ry1 && el.y < ry2) {
                    selectedIds.add(el.id);
                }
            });
            render();
            return;
        }

        if (measureMode && measureStart) {
            measureEnd = cell;
            render();
            return;
        }

        if (selectedIds.size === 1 && !placingType) {
            var sel = elements.find(function(e) { return selectedIds.has(e.id); });
            if (sel) {
                var h = hitTestHandle(sel, world.x, world.y);
                overlay.style.cursor = h ? h.cursor : 'default';
            }
        } else if (placingType) {
            overlay.style.cursor = 'crosshair';
        }

        if (placingType) drawOverlay();
    }

    function onMouseUp(e) {
        if (isPanning) {
            isPanning = false;
            overlay.style.cursor = placingType ? 'crosshair' : 'default';
            return;
        }
        if (resizeState) {
            resizeState = null;
            pushHistory();
            save();
            activeGuides = [];
            render();
            updatePropertiesPanel();
            return;
        }
        if (dragState) {
            activeGuides = [];
            pushHistory();
            save();
            dragState = null;
            render();
            return;
        }
        if (selectRect) {
            selectRect = null;
            render();
            updatePropertiesPanel();
            return;
        }
    }

    function onMouseLeave() {
        hoveredCell = null;
        drawOverlay();
        var coord = document.getElementById('whCoordDisplay');
        if (coord) coord.style.opacity = '0';
    }

    function onDblClick(e) {
        var cell = getCellFromEvent(e);
        var el = hitTest(cell);
        if (el) {
            var newLabel = prompt(
                isDa() ? 'Indtast navn for dette element:' : 'Enter label for this element:',
                el.label || ''
            );
            if (newLabel !== null) {
                el.label = newLabel;
                pushHistory();
                save();
                render();
                updatePropertiesPanel();
            }
        }
    }

    function onContextMenu(e) {
        e.preventDefault();
        var cell = getCellFromEvent(e);
        var hit = hitTest(cell);
        if (hit && !selectedIds.has(hit.id)) {
            selectedIds.clear();
            selectedIds.add(hit.id);
            render();
            updatePropertiesPanel();
        }
        showContextMenu(e.clientX, e.clientY);
    }

    function startPan(e) {
        isPanning = true;
        panStart = { x: e.clientX, y: e.clientY, px: panX, py: panY };
        overlay.style.cursor = 'grabbing';
    }

    function updateCoordDisplay(cell) {
        var coord = document.getElementById('whCoordDisplay');
        if (!coord) return;
        coord.style.opacity = '1';
        var mx = (cell.x * gridSizeM).toFixed(0);
        var my = (cell.y * gridSizeM).toFixed(0);
        coord.textContent = mx + ', ' + my + ' m';
    }

    // ─── Hit Testing ────────────────────────
    function hitTest(cell) {
        for (var i = elements.length - 1; i >= 0; i--) {
            var el = elements[i];
            if (hiddenTypes.has(el.type)) continue;
            if (cell.x >= el.x && cell.x < el.x + el.w && cell.y >= el.y && cell.y < el.y + el.h) {
                return el;
            }
        }
        return null;
    }

    function hitTestHandle(el, wx, wy) {
        var hs = HANDLE_SIZE / zoom + 4;
        var handles = getHandles(el);
        for (var i = 0; i < handles.length; i++) {
            var h = handles[i];
            if (Math.abs(wx - h.x) < hs && Math.abs(wy - h.y) < hs) return h;
        }
        return null;
    }

    // ─── Snap Guides ────────────────────────
    function calcSnap(el, nx, ny) {
        var guides = [];
        var bestX = nx, bestY = ny;
        var snapDistX = Infinity, snapDistY = Infinity;

        elements.forEach(function(other) {
            if (selectedIds.has(other.id) || hiddenTypes.has(other.type)) return;

            var edges = [
                { myVal: nx,              otherVal: other.x,              axis: 'x' },
                { myVal: nx,              otherVal: other.x + other.w,    axis: 'x' },
                { myVal: nx + el.w,       otherVal: other.x,              axis: 'x' },
                { myVal: nx + el.w,       otherVal: other.x + other.w,    axis: 'x' },
                { myVal: ny,              otherVal: other.y,              axis: 'y' },
                { myVal: ny,              otherVal: other.y + other.h,    axis: 'y' },
                { myVal: ny + el.h,       otherVal: other.y,              axis: 'y' },
                { myVal: ny + el.h,       otherVal: other.y + other.h,    axis: 'y' },
                { myVal: nx + el.w / 2,   otherVal: other.x + other.w / 2, axis: 'x' },
                { myVal: ny + el.h / 2,   otherVal: other.y + other.h / 2, axis: 'y' },
            ];

            edges.forEach(function(edge) {
                var dist = Math.abs(edge.myVal - edge.otherVal);
                var threshold = SNAP_THRESHOLD / (CELL * zoom);
                if (dist < threshold) {
                    var delta = edge.otherVal - edge.myVal;
                    if (edge.axis === 'x' && dist < snapDistX) {
                        snapDistX = dist;
                        bestX = nx + delta;
                        guides.push({ axis: 'x', pos: edge.otherVal });
                    }
                    if (edge.axis === 'y' && dist < snapDistY) {
                        snapDistY = dist;
                        bestY = ny + delta;
                        guides.push({ axis: 'y', pos: edge.otherVal });
                    }
                }
            });
        });

        return { x: bestX, y: bestY, guides: guides.slice(-4) };
    }

    // ─── Resize ─────────────────────────────
    function performResize(world) {
        var rs = resizeState;
        var el = rs.el;
        var typeDef = ELEMENT_TYPES[el.type] || ELEMENT_TYPES.rack;
        var minW = typeDef.minW;
        var minH = typeDef.minH;
        var cellX = Math.max(0, Math.min(COLS, Math.round(world.x / CELL)));
        var cellY = Math.max(0, Math.min(ROWS, Math.round(world.y / CELL)));

        switch (rs.handle) {
            case 'se':
                el.w = Math.max(minW, cellX - el.x);
                el.h = Math.max(minH, cellY - el.y);
                break;
            case 'e':
                el.w = Math.max(minW, cellX - el.x);
                break;
            case 's':
                el.h = Math.max(minH, cellY - el.y);
                break;
            case 'nw':
                el.w = Math.max(minW, rs.origX + rs.origW - cellX);
                el.h = Math.max(minH, rs.origY + rs.origH - cellY);
                el.x = rs.origX + rs.origW - el.w;
                el.y = rs.origY + rs.origH - el.h;
                break;
            case 'ne':
                el.w = Math.max(minW, cellX - el.x);
                el.h = Math.max(minH, rs.origY + rs.origH - cellY);
                el.y = rs.origY + rs.origH - el.h;
                break;
            case 'sw':
                el.w = Math.max(minW, rs.origX + rs.origW - cellX);
                el.h = Math.max(minH, cellY - el.y);
                el.x = rs.origX + rs.origW - el.w;
                break;
            case 'n':
                el.h = Math.max(minH, rs.origY + rs.origH - cellY);
                el.y = rs.origY + rs.origH - el.h;
                break;
            case 'w':
                el.w = Math.max(minW, rs.origX + rs.origW - cellX);
                el.x = rs.origX + rs.origW - el.w;
                break;
        }
        el.x = Math.max(0, Math.min(COLS - el.w, el.x));
        el.y = Math.max(0, Math.min(ROWS - el.h, el.y));
    }

    // ─── Element CRUD ───────────────────────
    function placeElement(cell) {
        var typeDef = ELEMENT_TYPES[placingType];
        var newEl = {
            id: nextId++,
            type: placingType,
            x: Math.max(0, Math.min(COLS - typeDef.minW, cell.x)),
            y: Math.max(0, Math.min(ROWS - typeDef.minH, cell.y)),
            w: typeDef.minW,
            h: typeDef.minH,
            label: '',
            abcZone: '',
            rotation: 0,
        };
        elements.push(newEl);
        selectedIds.clear();
        selectedIds.add(newEl.id);
        pushHistory();
        save();
        render();
        updatePropertiesPanel();
    }

    function removeSelected() {
        if (!selectedIds.size) return;
        elements = elements.filter(function(e) { return !selectedIds.has(e.id); });
        selectedIds.clear();
        pushHistory();
        save();
        render();
        updatePropertiesPanel();
    }

    function removeElement(id) {
        elements = elements.filter(function(e) { return e.id !== id; });
        selectedIds.delete(id);
        pushHistory();
        save();
        render();
        updatePropertiesPanel();
    }

    function selectAll() {
        selectedIds.clear();
        elements.forEach(function(el) {
            if (!hiddenTypes.has(el.type)) selectedIds.add(el.id);
        });
        render();
        updatePropertiesPanel();
    }

    // ─── Copy / Paste / Cut ─────────────────
    function ctxCopy() {
        hideContextMenu();
        clipboard = elements.filter(function(e) { return selectedIds.has(e.id); }).map(function(e) { return Object.assign({}, e); });
    }
    function ctxPaste() {
        hideContextMenu();
        if (!clipboard.length) return;
        selectedIds.clear();
        clipboard.forEach(function(src) {
            var dup = Object.assign({}, src, {
                id: nextId++,
                x: Math.min(src.x + 2, COLS - src.w),
                y: Math.min(src.y + 2, ROWS - src.h),
            });
            elements.push(dup);
            selectedIds.add(dup.id);
        });
        clipboard = clipboard.map(function(c) { return Object.assign({}, c, { x: Math.min(c.x + 2, COLS - c.w), y: Math.min(c.y + 2, ROWS - c.h) }); });
        pushHistory();
        save();
        render();
        updatePropertiesPanel();
    }
    function ctxCut() {
        hideContextMenu();
        ctxCopy();
        removeSelected();
    }

    // ─── Duplicate ──────────────────────────
    function duplicateSelected() {
        hideContextMenu();
        var toDup = elements.filter(function(e) { return selectedIds.has(e.id); });
        if (!toDup.length) return;
        selectedIds.clear();
        toDup.forEach(function(src) {
            var dup = Object.assign({}, src, {
                id: nextId++,
                x: Math.min(src.x + 1, COLS - src.w),
                y: Math.min(src.y + 1, ROWS - src.h),
            });
            elements.push(dup);
            selectedIds.add(dup.id);
        });
        pushHistory();
        save();
        render();
        updatePropertiesPanel();
    }

    // ─── Rotate ─────────────────────────────
    function rotateSelected() {
        hideContextMenu();
        elements.forEach(function(el) {
            if (!selectedIds.has(el.id)) return;
            var oldW = el.w, oldH = el.h;
            el.w = oldH;
            el.h = oldW;
            el.rotation = ((el.rotation || 0) + 90) % 360;
            el.x = Math.max(0, Math.min(COLS - el.w, el.x));
            el.y = Math.max(0, Math.min(ROWS - el.h, el.y));
        });
        pushHistory();
        save();
        render();
        updatePropertiesPanel();
    }

    // ─── Nudge (Arrow Keys) ─────────────────
    function nudgeSelection(dx, dy) {
        elements.forEach(function(el) {
            if (!selectedIds.has(el.id)) return;
            el.x = Math.max(0, Math.min(COLS - el.w, el.x + dx));
            el.y = Math.max(0, Math.min(ROWS - el.h, el.y + dy));
        });
        pushHistory();
        save();
        render();
    }

    // ─── Z-Order ────────────────────────────
    function bringToFront() {
        hideContextMenu();
        var sel = elements.filter(function(e) { return selectedIds.has(e.id); });
        elements = elements.filter(function(e) { return !selectedIds.has(e.id); });
        elements = elements.concat(sel);
        pushHistory(); save(); render();
    }
    function sendToBack() {
        hideContextMenu();
        var sel = elements.filter(function(e) { return selectedIds.has(e.id); });
        elements = elements.filter(function(e) { return !selectedIds.has(e.id); });
        elements = sel.concat(elements);
        pushHistory(); save(); render();
    }

    // ─── Context Menu ───────────────────────
    function showContextMenu(x, y) {
        var menu = document.getElementById('whContextMenu');
        if (!menu) return;
        menu.style.display = 'block';
        menu.classList.remove('hidden');
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';
        var rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) menu.style.left = (x - rect.width) + 'px';
        if (rect.bottom > window.innerHeight) menu.style.top = (y - rect.height) + 'px';
    }
    function hideContextMenu() {
        var menu = document.getElementById('whContextMenu');
        if (menu) { menu.style.display = 'none'; menu.classList.add('hidden'); }
    }

    // ─── Properties Panel ───────────────────
    function updatePropertiesPanel() {
        var panel = document.getElementById('whPropertiesPanel');
        if (!panel) return;

        if (selectedIds.size === 0) {
            panel.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-xs italic" data-i18n="wh-no-selection">' + t('wh-no-selection', 'V\u00e6lg et element for at redigere') + '</p>';
            if (typeof applyTranslations === 'function') applyTranslations();
            return;
        }

        if (selectedIds.size > 1) {
            var da = isDa();
            panel.innerHTML = '<div class="text-xs text-gray-600 dark:text-gray-400 mb-2">' + selectedIds.size + ' ' + (da ? 'elementer valgt' : 'elements selected') + '</div>' +
                '<div class="flex gap-1">' +
                    '<button onclick="WarehouseLayout.rotateSelected()" class="flex-1 px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-200"><i class="fas fa-sync-alt mr-1"></i>' + (da ? 'Roter' : 'Rotate') + '</button>' +
                    '<button onclick="WarehouseLayout.duplicateSelected()" class="flex-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs hover:bg-blue-200"><i class="fas fa-clone mr-1"></i>' + (da ? 'Dupliker' : 'Duplicate') + '</button>' +
                    '<button onclick="WarehouseLayout.removeSelected()" class="flex-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-xs hover:bg-red-200"><i class="fas fa-trash mr-1"></i>' + (da ? 'Slet' : 'Delete') + '</button>' +
                '</div>';
            return;
        }

        var elId = Array.from(selectedIds)[0];
        var el = elements.find(function(e) { return e.id === elId; });
        if (!el) return;
        var typeDef = ELEMENT_TYPES[el.type];
        var realW = (el.w * gridSizeM).toFixed(0);
        var realH = (el.h * gridSizeM).toFixed(0);
        var realArea = (el.w * gridSizeM * el.h * gridSizeM).toFixed(0);
        var da2 = isDa();

        panel.innerHTML = '<div class="space-y-2">' +
            '<div class="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">' +
                '<span class="text-lg">' + typeDef.icon + '</span>' +
                '<span class="font-bold text-xs text-gray-800 dark:text-white">' + typeDef.label + '</span>' +
            '</div>' +
            '<div>' +
                '<label class="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-0.5" data-i18n="wh-label">' + t('wh-label', 'Navn') + '</label>' +
                '<input type="text" id="whPropLabel" value="' + (el.label || '') + '" class="input-field text-xs py-1" placeholder="' + typeDef.label + '" oninput="WarehouseLayout.updateProp(\'label\', this.value)">' +
            '</div>' +
            '<div class="grid grid-cols-2 gap-1.5">' +
                '<div>' +
                    '<label class="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">' + t('wh-width', 'Bredde') + ' (' + (da2 ? 'celler' : 'cells') + ')</label>' +
                    '<input type="number" id="whPropW" value="' + el.w + '" min="' + typeDef.minW + '" max="' + COLS + '" class="input-field text-xs py-1" oninput="WarehouseLayout.updateProp(\'w\', +this.value)">' +
                '</div>' +
                '<div>' +
                    '<label class="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">' + t('wh-height', 'H\u00f8jde') + ' (' + (da2 ? 'celler' : 'cells') + ')</label>' +
                    '<input type="number" id="whPropH" value="' + el.h + '" min="' + typeDef.minH + '" max="' + ROWS + '" class="input-field text-xs py-1" oninput="WarehouseLayout.updateProp(\'h\', +this.value)">' +
                '</div>' +
            '</div>' +
            '<div class="text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 rounded px-2 py-1">' +
                (da2 ? 'Reelt' : 'Real') + ': ' + realW + '\u00d7' + realH + ' m = ' + realArea + ' m\u00b2' +
            '</div>' +
            '<div>' +
                '<label class="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-0.5" data-i18n="wh-abc-zone">' + t('wh-abc-zone', 'ABC Zone') + '</label>' +
                '<select id="whPropABC" class="input-field text-xs py-1" onchange="WarehouseLayout.updateProp(\'abcZone\', this.value)">' +
                    '<option value=""' + (!el.abcZone ? ' selected' : '') + '>\u2014</option>' +
                    '<option value="A"' + (el.abcZone === 'A' ? ' selected' : '') + '>A</option>' +
                    '<option value="B"' + (el.abcZone === 'B' ? ' selected' : '') + '>B</option>' +
                    '<option value="C"' + (el.abcZone === 'C' ? ' selected' : '') + '>C</option>' +
                '</select>' +
            '</div>' +
            '<div class="flex flex-wrap gap-1 pt-1">' +
                '<button onclick="WarehouseLayout.rotateSelected()" class="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-[10px] hover:bg-gray-200" title="R"><i class="fas fa-sync-alt"></i> ' + (el.rotation || 0) + '\u00b0</button>' +
                '<button onclick="WarehouseLayout.duplicateSelected()" class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-[10px] hover:bg-blue-200"><i class="fas fa-clone"></i></button>' +
                '<button onclick="WarehouseLayout.bringToFront()" class="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-[10px] hover:bg-gray-200" title="Bring to front"><i class="fas fa-arrow-up"></i></button>' +
                '<button onclick="WarehouseLayout.sendToBack()" class="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-[10px] hover:bg-gray-200" title="Send to back"><i class="fas fa-arrow-down"></i></button>' +
                '<button onclick="WarehouseLayout.removeSelected()" class="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-[10px] hover:bg-red-200"><i class="fas fa-trash"></i></button>' +
            '</div>' +
        '</div>';
        if (typeof applyTranslations === 'function') applyTranslations();
    }

    function updateProp(key, value) {
        var el = elements.find(function(e) { return selectedIds.has(e.id); });
        if (!el) return;
        el[key] = value;
        if (key === 'w') el.x = Math.min(el.x, COLS - el.w);
        if (key === 'h') el.y = Math.min(el.y, ROWS - el.h);
        pushHistory();
        save();
        render();
    }

    // ─── Layers Panel ───────────────────────
    function updateLayersPanel() {
        var panel = document.getElementById('whLayersPanel');
        if (!panel) return;
        var typeCounts = {};
        elements.forEach(function(el) { typeCounts[el.type] = (typeCounts[el.type] || 0) + 1; });

        var html = '';
        Object.keys(ELEMENT_TYPES).forEach(function(key) {
            var def = ELEMENT_TYPES[key];
            var count = typeCounts[key] || 0;
            var hidden = hiddenTypes.has(key);
            html += '<label class="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer ' + (hidden ? 'opacity-40' : '') + '">' +
                '<input type="checkbox" ' + (!hidden ? 'checked' : '') + ' onchange="WarehouseLayout.toggleLayer(\'' + key + '\')" class="rounded text-indigo-500 w-3 h-3">' +
                '<span class="text-xs">' + def.icon + '</span>' +
                '<span class="text-[10px] text-gray-700 dark:text-gray-300 flex-1 truncate">' + def.label.replace(/^[^\s]+\s/, '') + '</span>' +
                '<span class="text-[10px] text-gray-400 font-mono">' + count + '</span>' +
            '</label>';
        });
        panel.innerHTML = html;
    }

    function toggleLayer(type) {
        if (hiddenTypes.has(type)) hiddenTypes.delete(type);
        else hiddenTypes.add(type);
        render();
        updateLayersPanel();
    }

    // ─── Palette ────────────────────────────
    function selectPaletteType(type) {
        if (placingType === type) {
            placingType = null;
            overlay.style.cursor = 'default';
            document.querySelectorAll('.wh-palette-btn').forEach(function(b) { b.classList.remove('ring-2', 'ring-offset-2'); });
        } else {
            placingType = type;
            selectedIds.clear();
            overlay.style.cursor = 'crosshair';
            measureMode = false;
            measureStart = measureEnd = null;
            document.querySelectorAll('.wh-palette-btn').forEach(function(b) { b.classList.remove('ring-2', 'ring-offset-2'); });
            var btn = document.querySelector('[data-wh-type="' + type + '"]');
            if (btn) btn.classList.add('ring-2', 'ring-offset-2');
        }
        updateToolbarStates();
        render();
    }

    // ─── Toggle Tools ───────────────────────
    function toggleGrid() {
        gridVisible = !gridVisible;
        updateToolbarStates();
        render();
    }
    function toggleSnap() {
        snapEnabled = !snapEnabled;
        updateToolbarStates();
    }
    function toggleABC() {
        abcOverlay = !abcOverlay;
        updateToolbarStates();
        render();
    }
    function toggleMeasure() {
        measureMode = !measureMode;
        if (measureMode) {
            placingType = null;
            selectedIds.clear();
            document.querySelectorAll('.wh-palette-btn').forEach(function(b) { b.classList.remove('ring-2', 'ring-offset-2'); });
            overlay.style.cursor = 'crosshair';
        } else {
            measureStart = measureEnd = null;
            overlay.style.cursor = 'default';
        }
        updateToolbarStates();
        render();
    }

    function updateToolbarStates() {
        var setState = function(id, active) {
            var btn = document.getElementById(id);
            if (btn) btn.classList.toggle('wh-tb-active', active);
        };
        setState('whBtnGrid', gridVisible);
        setState('whBtnSnap', snapEnabled);
        setState('whBtnABC', abcOverlay);
        setState('whBtnMeasure', measureMode);
    }

    // ─── Stats ──────────────────────────────
    function updateStats() {
        var statsEl = document.getElementById('whStats');
        if (!statsEl) return;

        var visibleEls = elements.filter(function(e) { return !hiddenTypes.has(e.type); });
        var totalAreaM2 = warehouseWidth * warehouseDepth;
        var usedAreaM2 = 0;
        var typeCounts = {};
        visibleEls.forEach(function(el) {
            usedAreaM2 += el.w * el.h * gridSizeM * gridSizeM;
            typeCounts[el.type] = (typeCounts[el.type] || 0) + 1;
        });
        var utilPct = totalAreaM2 > 0 ? Math.round((usedAreaM2 / totalAreaM2) * 100) : 0;

        var topTypes = Object.entries(typeCounts)
            .sort(function(a, b) { return b[1] - a[1]; })
            .slice(0, 4)
            .map(function(entry) { return (ELEMENT_TYPES[entry[0]] ? ELEMENT_TYPES[entry[0]].icon : '') + ' ' + entry[1]; })
            .join('  ');

        var abcCounts = { A: 0, B: 0, C: 0, '': 0 };
        visibleEls.forEach(function(el) { abcCounts[el.abcZone || ''] = (abcCounts[el.abcZone || ''] || 0) + 1; });

        var collisions = 0;
        for (var i = 0; i < visibleEls.length; i++) {
            for (var j = i + 1; j < visibleEls.length; j++) {
                var a = visibleEls[i], b = visibleEls[j];
                if (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y) collisions++;
            }
        }

        var da = isDa();
        var html = '<div class="flex flex-wrap gap-x-5 gap-y-1 text-xs items-center">' +
            '<div class="flex items-center gap-1.5">' +
                '<i class="fas fa-cubes text-gray-400"></i>' +
                '<span class="text-gray-500 dark:text-gray-400">' + t('wh-elements-label', 'Elementer') + ':</span>' +
                '<span class="font-bold text-gray-800 dark:text-white">' + visibleEls.length + '</span>' +
            '</div>' +
            '<div class="flex items-center gap-1.5">' +
                '<i class="fas fa-percentage text-gray-400"></i>' +
                '<span class="text-gray-500 dark:text-gray-400">' + t('wh-utilization-label', 'Udnyttelse') + ':</span>' +
                '<span class="font-bold ' + (utilPct > 85 ? 'text-red-600' : utilPct > 60 ? 'text-yellow-600' : 'text-green-600') + '">' + utilPct + '%</span>' +
                '<span class="text-gray-400">(' + usedAreaM2.toLocaleString() + ' / ' + totalAreaM2.toLocaleString() + ' m\u00b2)</span>' +
            '</div>' +
            '<div class="flex items-center gap-1.5">' +
                '<span class="text-gray-500 dark:text-gray-400">' + t('wh-top-types-label', 'Top typer') + ':</span>' +
                '<span class="font-medium text-gray-700 dark:text-gray-300">' + (topTypes || '\u2014') + '</span>' +
            '</div>';
        if (abcCounts.A + abcCounts.B + abcCounts.C > 0) {
            html += '<div class="flex items-center gap-1.5">' +
                '<span class="text-gray-500">ABC:</span>' +
                '<span class="text-red-600 font-medium">A:' + abcCounts.A + '</span>' +
                '<span class="text-yellow-600 font-medium">B:' + abcCounts.B + '</span>' +
                '<span class="text-green-600 font-medium">C:' + abcCounts.C + '</span>' +
            '</div>';
        }
        if (collisions > 0) {
            html += '<div class="flex items-center gap-1.5 text-red-500">' +
                '<i class="fas fa-exclamation-triangle"></i>' +
                '<span>' + collisions + ' overlap' + (collisions > 1 ? 's' : '') + '</span>' +
            '</div>';
        }
        html += '</div>';
        statsEl.innerHTML = html;
    }

    // ─── Templates ──────────────────────────
    function loadTemplate(name) {
        if (!name) return;
        var da = isDa();
        if (!confirm(da ? 'Indl\u00e6s skabelon? Eksisterende layout slettes.' : 'Load template? Current layout will be replaced.')) {
            document.getElementById('whTemplateSelect').value = '';
            return;
        }

        elements = [];
        selectedIds.clear();
        nextId = 1;

        if (name === 'small') {
            warehouseWidth = 20; warehouseDepth = 15; gridSizeM = 1;
            recalcGrid();
            addTemplateElements([
                { type: 'dock', x: 0, y: 0, w: 4, h: 2 },
                { type: 'office', x: 16, y: 0, w: 4, h: 3 },
                { type: 'rack', x: 1, y: 4, w: 4, h: 1 }, { type: 'rack', x: 1, y: 6, w: 4, h: 1 },
                { type: 'rack', x: 1, y: 8, w: 4, h: 1 }, { type: 'rack', x: 1, y: 10, w: 4, h: 1 },
                { type: 'rack', x: 8, y: 4, w: 4, h: 1 }, { type: 'rack', x: 8, y: 6, w: 4, h: 1 },
                { type: 'rack', x: 8, y: 8, w: 4, h: 1 }, { type: 'rack', x: 8, y: 10, w: 4, h: 1 },
                { type: 'packing', x: 15, y: 5, w: 3, h: 3 },
                { type: 'exit', x: 19, y: 14, w: 1, h: 1 },
                { type: 'aisle', x: 6, y: 4, w: 1, h: 7 }, { type: 'aisle', x: 13, y: 4, w: 1, h: 7 },
            ]);
        } else if (name === 'medium') {
            warehouseWidth = 60; warehouseDepth = 40; gridSizeM = 2;
            recalcGrid();
            addTemplateElements([
                { type: 'dock', x: 0, y: 0, w: 4, h: 2 }, { type: 'dock', x: 5, y: 0, w: 4, h: 2 },
                { type: 'staging', x: 0, y: 3, w: 3, h: 2 }, { type: 'staging', x: 4, y: 3, w: 3, h: 2 },
                { type: 'office', x: 25, y: 0, w: 4, h: 3 },
                { type: 'rack', x: 1, y: 6, w: 3, h: 1, label: 'A-1', abcZone: 'A' },
                { type: 'rack', x: 1, y: 8, w: 3, h: 1, label: 'A-2', abcZone: 'A' },
                { type: 'rack', x: 1, y: 10, w: 3, h: 1, label: 'A-3', abcZone: 'A' },
                { type: 'rack', x: 6, y: 6, w: 3, h: 1, label: 'A-4', abcZone: 'A' },
                { type: 'rack', x: 6, y: 8, w: 3, h: 1, label: 'A-5', abcZone: 'A' },
                { type: 'rack', x: 6, y: 10, w: 3, h: 1, label: 'A-6', abcZone: 'A' },
                { type: 'rack', x: 11, y: 6, w: 3, h: 1, label: 'B-1', abcZone: 'B' },
                { type: 'rack', x: 11, y: 8, w: 3, h: 1, label: 'B-2', abcZone: 'B' },
                { type: 'rack', x: 11, y: 10, w: 3, h: 1, label: 'B-3', abcZone: 'B' },
                { type: 'rack', x: 16, y: 6, w: 3, h: 1, label: 'B-4', abcZone: 'B' },
                { type: 'rack', x: 16, y: 8, w: 3, h: 1, label: 'C-1', abcZone: 'C' },
                { type: 'rack', x: 16, y: 10, w: 3, h: 1, label: 'C-2', abcZone: 'C' },
                { type: 'packing', x: 22, y: 6, w: 3, h: 3 },
                { type: 'conveyor', x: 22, y: 10, w: 4, h: 1 },
                { type: 'cold', x: 22, y: 14, w: 4, h: 3 },
                { type: 'charging', x: 0, y: 18, w: 2, h: 1 },
                { type: 'exit', x: 29, y: 19, w: 1, h: 1 }, { type: 'exit', x: 0, y: 19, w: 1, h: 1 },
                { type: 'forklift', x: 5, y: 6, w: 1, h: 5 }, { type: 'forklift', x: 10, y: 6, w: 1, h: 5 },
                { type: 'forklift', x: 15, y: 6, w: 1, h: 5 },
                { type: 'returns', x: 22, y: 0, w: 3, h: 2 },
            ]);
        } else if (name === 'large') {
            warehouseWidth = 120; warehouseDepth = 80; gridSizeM = 2;
            recalcGrid();
            addTemplateElements([
                { type: 'dock', x: 0, y: 0, w: 5, h: 3 }, { type: 'dock', x: 6, y: 0, w: 5, h: 3 }, { type: 'dock', x: 12, y: 0, w: 5, h: 3 },
                { type: 'staging', x: 0, y: 4, w: 4, h: 3 }, { type: 'staging', x: 5, y: 4, w: 4, h: 3 }, { type: 'staging', x: 10, y: 4, w: 4, h: 3 },
                { type: 'office', x: 54, y: 0, w: 5, h: 4 },
                { type: 'returns', x: 50, y: 0, w: 4, h: 3 },
            ]);
            for (var row = 0; row < 6; row++) {
                for (var col = 0; col < 8; col++) {
                    var zone = row < 2 ? 'A' : row < 4 ? 'B' : 'C';
                    elements.push({
                        id: nextId++, type: 'rack',
                        x: 1 + col * 7, y: 9 + row * 4,
                        w: 5, h: 2, label: zone + '-' + (row * 8 + col + 1),
                        abcZone: zone, rotation: 0,
                    });
                }
            }
            for (var c2 = 0; c2 < 8; c2++) {
                elements.push({ id: nextId++, type: 'forklift', x: c2 * 7, y: 9, w: 1, h: 24, label: '', abcZone: '', rotation: 0 });
            }
            addTemplateElements([
                { type: 'packing', x: 2, y: 35, w: 5, h: 3 }, { type: 'packing', x: 8, y: 35, w: 5, h: 3 },
                { type: 'conveyor', x: 14, y: 36, w: 8, h: 1 },
                { type: 'cold', x: 50, y: 5, w: 5, h: 4 },
                { type: 'hazmat', x: 50, y: 10, w: 4, h: 3 },
                { type: 'charging', x: 0, y: 38, w: 3, h: 1 }, { type: 'charging', x: 4, y: 38, w: 3, h: 1 },
                { type: 'elevator', x: 55, y: 5, w: 3, h: 3 },
                { type: 'exit', x: 59, y: 39, w: 1, h: 1 }, { type: 'exit', x: 0, y: 39, w: 1, h: 1 },
                { type: 'exit', x: 30, y: 39, w: 1, h: 1 },
            ]);
        }

        var dimW = document.getElementById('whDimWidth');
        var dimD = document.getElementById('whDimDepth');
        var gridSel = document.getElementById('whGridSize');
        if (dimW) dimW.value = warehouseWidth;
        if (dimD) dimD.value = warehouseDepth;
        if (gridSel) gridSel.value = gridSizeM;

        recalcGrid();
        canvas.width = W;
        canvas.height = H;
        overlay.width = W;
        overlay.height = H;
        pushHistory();
        save();
        zoomToFit();
        render();
        updateLayersPanel();
        updateDimensionsDisplay();
        updatePropertiesPanel();
        document.getElementById('whTemplateSelect').value = '';

        if (typeof showToast === 'function') {
            showToast(da ? 'Skabelon indl\u00e6st!' : 'Template loaded!', 'success');
        }
    }

    function addTemplateElements(defs) {
        defs.forEach(function(d) {
            elements.push({
                id: nextId++,
                type: d.type,
                x: d.x, y: d.y,
                w: d.w || ELEMENT_TYPES[d.type].minW,
                h: d.h || ELEMENT_TYPES[d.type].minH,
                label: d.label || '',
                abcZone: d.abcZone || '',
                rotation: 0,
            });
        });
    }

    // ─── Clear / Auto-suggest ───────────────
    function clearAll() {
        if (!confirm(isDa() ? 'Ryd hele layoutet?' : 'Clear entire layout?')) return;
        elements = [];
        selectedIds.clear();
        nextId = 1;
        pushHistory();
        save();
        render();
        updatePropertiesPanel();
        updateLayersPanel();
    }

    function autoSuggest() {
        var da = isDa();
        if (typeof abcResults === 'undefined' || !abcResults || abcResults.length === 0) {
            if (typeof showToast === 'function') showToast(da ? 'K\u00f8r ABC-analyse f\u00f8rst' : 'Run ABC analysis first', 'warning');
            return;
        }
        var groups = { A: 0, B: 0, C: 0 };
        abcResults.forEach(function(item) { if (groups[item.group] !== undefined) groups[item.group]++; });

        elements = elements.filter(function(e) { return !e.abcZone; });

        var zones = [
            { zone: 'A', count: Math.max(1, Math.min(12, groups.A)), startRow: 1 },
            { zone: 'B', count: Math.max(1, Math.min(10, groups.B)), startRow: Math.floor(ROWS / 3) + 1 },
            { zone: 'C', count: Math.max(1, Math.min(8, groups.C)), startRow: Math.floor(ROWS * 2 / 3) + 1 },
        ];

        zones.forEach(function(z) {
            var cols = Math.min(Math.floor(COLS / 4), 10);
            for (var i = 0; i < z.count; i++) {
                elements.push({
                    id: nextId++, type: 'rack',
                    x: 1 + (i % cols) * 4,
                    y: z.startRow + Math.floor(i / cols) * 2,
                    w: 3, h: 1,
                    label: z.zone + '-' + (i + 1),
                    abcZone: z.zone,
                    rotation: 0,
                });
            }
        });

        pushHistory(); save(); render();
        updateLayersPanel();
        if (typeof showToast === 'function') showToast(da ? 'ABC-layoutforslag genereret!' : 'ABC layout suggestion generated!', 'success');
    }

    // ─── Export PNG ─────────────────────────
    function exportPNG() {
        var tmpCanvas = document.createElement('canvas');
        var legendH = 60;
        tmpCanvas.width = W;
        tmpCanvas.height = H + legendH;
        var tCtx = tmpCanvas.getContext('2d');

        tCtx.drawImage(canvas, 0, 0);

        tCtx.fillStyle = isDark() ? '#1e293b' : '#f1f5f9';
        tCtx.fillRect(0, H, W, legendH);
        tCtx.strokeStyle = isDark() ? '#334155' : '#e2e8f0';
        tCtx.lineWidth = 1;
        tCtx.strokeRect(0, H, W, legendH);

        tCtx.fillStyle = isDark() ? '#e2e8f0' : '#1e293b';
        tCtx.font = 'bold 12px system-ui';
        tCtx.textAlign = 'left';
        tCtx.textBaseline = 'top';
        tCtx.fillText((isDa() ? 'Lagerplan' : 'Warehouse Layout') + ' \u2014 ' + warehouseWidth + '\u00d7' + warehouseDepth + ' m (' + (warehouseWidth * warehouseDepth).toLocaleString() + ' m\u00b2)', 8, H + 6);

        var usedTypes = [];
        var seen = {};
        elements.forEach(function(e) { if (!seen[e.type]) { seen[e.type] = true; usedTypes.push(e.type); } });
        var lx = 8;
        tCtx.font = '10px system-ui';
        var ly = H + 28;
        usedTypes.forEach(function(type) {
            var def = ELEMENT_TYPES[type];
            tCtx.fillStyle = def.color;
            tCtx.fillRect(lx, ly, 12, 12);
            tCtx.strokeStyle = def.color;
            tCtx.strokeRect(lx, ly, 12, 12);
            lx += 16;
            tCtx.fillStyle = isDark() ? '#e2e8f0' : '#334155';
            tCtx.fillText(def.label, lx, ly + 1);
            lx += tCtx.measureText(def.label).width + 14;
        });

        tCtx.fillStyle = isDark() ? '#94a3b8' : '#64748b';
        tCtx.font = '9px system-ui';
        tCtx.textAlign = 'right';
        tCtx.fillText(new Date().toLocaleString(), W - 8, H + 48);

        var link = document.createElement('a');
        link.download = 'warehouse-layout.png';
        link.href = tmpCanvas.toDataURL('image/png');
        link.click();
        if (typeof showToast === 'function') showToast(isDa() ? 'PNG eksporteret' : 'PNG exported', 'success');
    }

    // ─── Export SVG ─────────────────────────
    function exportSVG() {
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">\n';
        svg += '<rect width="' + W + '" height="' + H + '" fill="#f8fafc"/>\n';

        if (gridVisible) {
            svg += '<g stroke="#e2e8f0" stroke-width="0.5">\n';
            for (var x = 0; x <= W; x += CELL) svg += '<line x1="' + x + '" y1="0" x2="' + x + '" y2="' + H + '"/>\n';
            for (var y = 0; y <= H; y += CELL) svg += '<line x1="0" y1="' + y + '" x2="' + W + '" y2="' + y + '"/>\n';
            svg += '</g>\n';
        }

        elements.forEach(function(el) {
            var def = ELEMENT_TYPES[el.type] || ELEMENT_TYPES.rack;
            var px = el.x * CELL, py = el.y * CELL, pw = el.w * CELL, ph = el.h * CELL;
            svg += '<rect x="' + (px + 1) + '" y="' + (py + 1) + '" width="' + (pw - 2) + '" height="' + (ph - 2) + '" rx="3" fill="' + def.color + '22" stroke="' + def.color + '" stroke-width="1.5"/>\n';
            svg += '<text x="' + (px + pw / 2) + '" y="' + (py + ph / 2) + '" text-anchor="middle" dominant-baseline="central" fill="' + def.color + '" font-size="12" font-family="system-ui">' + def.icon + ' ' + (el.label || '') + '</text>\n';
        });

        svg += '</svg>';
        var blob = new Blob([svg], { type: 'image/svg+xml' });
        var link = document.createElement('a');
        link.download = 'warehouse-layout.svg';
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
        if (typeof showToast === 'function') showToast(isDa() ? 'SVG eksporteret' : 'SVG exported', 'success');
    }

    // ─── Public API ─────────────────────────
    return {
        init: init,
        selectPaletteType: selectPaletteType,
        updateProp: updateProp,
        removeElement: removeElement,
        removeSelected: removeSelected,
        duplicateSelected: duplicateSelected,
        rotateSelected: rotateSelected,
        toggleGrid: toggleGrid,
        toggleSnap: toggleSnap,
        toggleABC: toggleABC,
        toggleMeasure: toggleMeasure,
        toggleLayer: toggleLayer,
        clearAll: clearAll,
        autoSuggest: autoSuggest,
        loadTemplate: loadTemplate,
        setDimensions: setDimensions,
        setGridSize: setGridSize,
        zoomIn: zoomIn,
        zoomOut: zoomOut,
        zoomReset: zoomReset,
        exportPNG: exportPNG,
        exportSVG: exportSVG,
        ctxCopy: ctxCopy,
        ctxPaste: ctxPaste,
        ctxCut: ctxCut,
        bringToFront: bringToFront,
        sendToBack: sendToBack,
        undo: undo,
        redo: redo,
        ELEMENT_TYPES: ELEMENT_TYPES,
    };
})();

// Auto-init on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() { WarehouseLayout.init(); }, 250);
});
