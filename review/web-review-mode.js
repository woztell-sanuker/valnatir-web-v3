/**
 * ==========================================================================
 * Standalone Web Review & Design/Editorial Feedback Collector
 * Version: 2.5.0 (Agnostic, Zero-Dependency, Full Visual & UI Inspector)
 * ==========================================================================
 * 
 * Permite a cualquier equipo revisar una página web visualmente:
 * - Inspección universal: Textos, bloques, imágenes, fondos, menús y navegación.
 * - HUD en tiempo real con selector CSS, dimensiones reales (px) y Aspect Ratio.
 * - Ficha técnica de diseño (fondos, bordes, radio, contenido).
 * - Selector de jerarquía DOM (Breadcrumbs) para elegir contenedor padre o hijo.
 * - Sincronización instantánea con Google Sheets vía Webhook (doPost no-cors).
 * 
 * Activación:
 * 1. Parámetro URL: ?review=true o ?mode=review
 * 2. Atajo de teclado: Alt + C (Mac: ⌥C) o Ctrl + Shift + R
 * 3. Píldora flotante inicial en pantalla
 */
(function(window, document) {
  'use strict';

  // Configuración personalizable mediante window.WEB_REVIEW_CONFIG
  const userConfig = window.WEB_REVIEW_CONFIG || {};
  const CONFIG = {
    projectName: userConfig.projectName || document.title || window.location.hostname || 'Web Project',
    webhookUrl: userConfig.webhookUrl || localStorage.getItem('review_sheets_webhook') || '',
    brandColor: userConfig.brandColor || '#5FD3B8',
    storagePrefix: userConfig.storagePrefix || 'web_review_',
    categories: userConfig.categories || [
      'Diseño / UI / Layout',
      'Navegación / UX / Menús',
      'Tono Editorial / Copywriting',
      'Claridad Comercial / C-Level',
      'Corrección Técnica / Producto',
      'Corrección Ortográfica / Tipográfica',
      'Compliance / Legal',
      'Otro'
    ]
  };

  const STORAGE_KEYS = {
    active: CONFIG.storagePrefix + 'active',
    user: CONFIG.storagePrefix + 'user_identity',
    webhook: CONFIG.storagePrefix + 'sheets_webhook',
    notes: CONFIG.storagePrefix + 'notes'
  };

  // Detección de activación
  const urlParams = new URLSearchParams(window.location.search);
  const isReviewUrl = urlParams.has('review') || urlParams.get('mode') === 'review';
  const isStoredActive = localStorage.getItem(STORAGE_KEYS.active) === 'true';

  if (urlParams.has('webhook')) {
    localStorage.setItem(STORAGE_KEYS.webhook, urlParams.get('webhook'));
    CONFIG.webhookUrl = urlParams.get('webhook');
  }

  // Atajos globales de teclado
  window.addEventListener('keydown', function(e) {
    if (e.altKey && (e.code === 'KeyC' || e.key === 'ç' || e.key === 'Ç' || e.key.toLowerCase() === 'c')) {
      e.preventDefault();
      if (!isReviewActive()) {
        activateReviewMode(true);
      } else {
        setInspectionMode(currentMode === 'publish' ? 'inspect' : 'publish');
      }
    } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'r') {
      e.preventDefault();
      toggleReviewMode();
    }
  });

  if (!isReviewUrl && !isStoredActive) {
    renderLauncherPill();
    return;
  }

  // Inicializar entorno de revisión
  activateReviewMode(false);

  let currentMode = 'publish'; // 'publish' = Navegación libre | 'inspect' = Inspección activa
  let currentHovered = null;

  function isReviewActive() {
    return document.getElementById('wr-dock') !== null;
  }

  function activateReviewMode(persist) {
    if (persist) {
      localStorage.setItem(STORAGE_KEYS.active, 'true');
    }
    injectStyles();
    createFloatingDock();
    setupInspector();
    removeLauncherPill();
  }

  function toggleReviewMode() {
    if (isReviewActive()) {
      deactivateReviewMode();
    } else {
      activateReviewMode(true);
    }
  }

  function deactivateReviewMode() {
    localStorage.removeItem(STORAGE_KEYS.active);
    const dock = document.getElementById('wr-dock');
    if (dock) dock.remove();
    const modal = document.getElementById('wr-modal-backdrop');
    if (modal) modal.remove();
    const badge = document.getElementById('wr-inspect-badge');
    if (badge) badge.remove();
    if (currentHovered) {
      currentHovered.classList.remove('wr-hover');
      currentHovered = null;
    }
    renderLauncherPill();
  }

  // Píldora discreta cuando la barra está cerrada
  function renderLauncherPill() {
    if (document.getElementById('wr-launcher-pill')) return;
    const pill = document.createElement('button');
    pill.id = 'wr-launcher-pill';
    pill.innerHTML = `💬 Modo Review <span>⌥C</span>`;
    pill.title = 'Activar Modo Review y Feedback Visual (Alt + C)';
    pill.addEventListener('click', function() {
      activateReviewMode(true);
    });
    document.body.appendChild(pill);
    injectLauncherStyles();
  }

  function removeLauncherPill() {
    const pill = document.getElementById('wr-launcher-pill');
    if (pill) pill.remove();
  }

  // Almacenamiento local
  function getStoredNotes() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.notes) || '[]');
    } catch(e) {
      return [];
    }
  }

  function saveStoredNotes(notes) {
    localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes));
    updateNotesBadge();
  }

  function getReviewerIdentity() {
    return (localStorage.getItem(STORAGE_KEYS.user) || '').trim();
  }

  function setReviewerIdentity(name) {
    if (name && name.trim()) {
      localStorage.setItem(STORAGE_KEYS.user, name.trim());
    }
  }

  function getWebhookUrl() {
    return localStorage.getItem(STORAGE_KEYS.webhook) || CONFIG.webhookUrl || '';
  }

  function setWebhookUrl(url) {
    if (url && url.trim()) {
      localStorage.setItem(STORAGE_KEYS.webhook, url.trim());
      CONFIG.webhookUrl = url.trim();
    } else {
      localStorage.removeItem(STORAGE_KEYS.webhook);
      CONFIG.webhookUrl = '';
    }
  }

  // Envío a Google Sheets
  function sendToGoogleSheets(noteData, callback) {
    const endpoint = getWebhookUrl();
    if (!endpoint) {
      console.warn('[WebReview] Webhook de Google Sheets no configurado. Nota guardada solo localmente.');
      if (callback) callback(false, 'no_webhook');
      return;
    }

    // Identidad: el servidor exige un ID token de Google válido (allowlist).
    var idToken = (window.WEB_REVIEW_AUTH && window.WEB_REVIEW_AUTH.idToken) || '';
    if (!idToken) {
      console.warn('[WebReview] Sin sesión de Google: inicia sesión para enviar la nota.');
      if (window.WEB_REVIEW_AUTH && typeof window.WEB_REVIEW_AUTH.prompt === 'function') window.WEB_REVIEW_AUTH.prompt();
      if (callback) callback(false, 'no_auth');
      return;
    }
    noteData.id_token = idToken;

    try {
      fetch(endpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData)
      }).then(function() {
        console.log('[WebReview] ✅ Feedback sincronizado con Google Sheets.');
        if (callback) callback(true);
      }).catch(function(err) {
        console.warn('[WebReview] ⚠️ Error en envío a Google Sheets:', err);
        if (callback) callback(false, err);
      });
    } catch (e) {
      console.error('[WebReview] Excepción:', e);
      if (callback) callback(false, e);
    }
  }

  // Extracción de Metadatos de Diseño y UI
  function getElementMetadata(el) {
    if (!el || !el.tagName) return null;
    const tag = el.tagName.toLowerCase();
    const rect = el.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);

    let ratioStr = '';
    if (width > 0 && height > 0) {
      const r = width / height;
      if (Math.abs(r - 16/9) < 0.08) ratioStr = '16:9';
      else if (Math.abs(r - 4/3) < 0.08) ratioStr = '4:3';
      else if (Math.abs(r - 1) < 0.05) ratioStr = '1:1';
      else if (Math.abs(r - 9/16) < 0.08) ratioStr = '9:16';
      else if (Math.abs(r - 21/9) < 0.08) ratioStr = '21:9';
      else ratioStr = `${r.toFixed(2)}:1`;
    }

    let id = el.id ? `#${el.id}` : '';
    let classList = Array.from(el.classList || [])
      .filter(c => !c.startsWith('wr-'))
      .slice(0, 3)
      .map(c => `.${c}`)
      .join('');
    let selector = `${tag}${id}${classList}`;
    if (!selector || selector === tag) {
      selector = id ? `${tag}${id}` : (classList ? `${tag}${classList}` : tag);
    }

    const isMedia = ['img', 'svg', 'picture', 'video', 'canvas', 'figure'].includes(tag);
    const isNav = !!(el.closest('nav') || el.closest('header') || tag === 'nav' || tag === 'header' || (tag === 'a' && !el.closest('main')));
    const isText = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'strong', 'em', 'li', 'td', 'th', 'label', 'blockquote'].includes(tag);
    const isSection = ['section', 'article', 'aside', 'main', 'footer'].includes(tag);

    let type = 'Bloque / Contenedor';
    if (isMedia) {
      type = 'Imagen / Gráfico';
    } else if (isNav) {
      type = 'Navegación / Menú';
    } else if (isSection) {
      type = 'Sección / Fondo';
    } else if (isText) {
      type = 'Texto / Titular';
    } else if (tag === 'button') {
      type = 'Botón / CTA';
    }

    let comp = null;
    try {
      comp = window.getComputedStyle(el);
    } catch(e) {}

    const bgImg = comp && comp.backgroundImage && comp.backgroundImage !== 'none' ? 'Con imagen/gradiente de fondo' : '';
    const bgColor = comp && comp.backgroundColor && comp.backgroundColor !== 'rgba(0, 0, 0, 0)' && comp.backgroundColor !== 'transparent' ? comp.backgroundColor : '';
    const borderRadius = comp && comp.borderRadius && comp.borderRadius !== '0px' ? comp.borderRadius : '';
    const border = comp && comp.borderWidth && comp.borderWidth !== '0px' && comp.borderStyle !== 'none' ? `${comp.borderWidth} ${comp.borderStyle} ${comp.borderColor}` : '';

    const rawText = (el.innerText || '').trim();
    let textSummary = '';
    if (isMedia) {
      if (tag === 'img') {
        const src = el.getAttribute('src') || '';
        const alt = el.getAttribute('alt') || 'sin alt';
        textSummary = `[Imagen: ${src.split('/').pop()} | Alt: "${alt}" | ${width}×${height}px]`;
      } else {
        textSummary = `[Elemento gráfico <${tag}> | ${width}×${height}px]`;
      }
    } else if (isText) {
      textSummary = rawText;
    } else {
      if (rawText.length > 0) {
        const cleanSnippet = rawText.replace(/\s+/g, ' ').substring(0, 140);
        textSummary = `[Bloque <${selector}> (${width}×${height}px)] "${cleanSnippet}${rawText.length > 140 ? '…' : ''}"`;
      } else {
        textSummary = `[Bloque/Marco <${selector}> (${width}×${height}px)]`;
      }
    }

    return {
      el,
      tag,
      id,
      classList,
      selector,
      type,
      width,
      height,
      ratioStr,
      bgImg,
      bgColor,
      borderRadius,
      border,
      rawText,
      textSummary,
      isText,
      isMedia,
      isNav,
      isSection
    };
  }

  // HUD Flotante con métricas en tiempo real
  function updateInspectHUD(el) {
    let badge = document.getElementById('wr-inspect-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'wr-inspect-badge';
      badge.innerHTML = `
        <span class="wr-hud-tag" id="wr-hud-tag"></span>
        <span class="wr-hud-type" id="wr-hud-type"></span>
        <span class="wr-hud-dim" id="wr-hud-dim"></span>
      `;
      document.body.appendChild(badge);
    }

    if (!el) {
      badge.classList.remove('wr-hud-visible');
      return;
    }

    const meta = getElementMetadata(el);
    if (!meta) {
      badge.classList.remove('wr-hud-visible');
      return;
    }

    const tagEl = document.getElementById('wr-hud-tag');
    const typeEl = document.getElementById('wr-hud-type');
    const dimEl = document.getElementById('wr-hud-dim');
    if (tagEl) tagEl.textContent = `<${meta.selector}>`;
    if (typeEl) typeEl.textContent = meta.type;
    if (dimEl) dimEl.textContent = `${meta.width}×${meta.height}px${meta.ratioStr ? ' (' + meta.ratioStr + ')' : ''}`;

    const rect = el.getBoundingClientRect();
    let top = rect.top - 36;
    let left = rect.left;
    if (top < 10) top = rect.bottom + 8;
    if (left < 10) left = 10;
    if (left + 280 > window.innerWidth) left = Math.max(10, window.innerWidth - 290);

    badge.style.top = `${Math.round(top)}px`;
    badge.style.left = `${Math.round(left)}px`;
    badge.classList.add('wr-hud-visible');
  }

  // Jerarquía DOM (Ancestros) para Breadcrumbs
  function getInspectableAncestors(el) {
    const list = [];
    let curr = el;
    while (curr && curr !== document.body && curr !== document.documentElement) {
      if (!curr.closest('#wr-dock') && !curr.closest('#wr-modal-backdrop') && curr.id !== 'wr-launcher-pill' && curr.id !== 'wr-inspect-badge') {
        const tag = (curr.tagName || '').toUpperCase();
        if (!['SCRIPT', 'STYLE', 'NOSCRIPT', 'HEAD', 'META'].includes(tag)) {
          list.unshift(curr);
        }
      }
      curr = curr.parentElement;
    }
    return list;
  }

  function getInspectableElement(el) {
    if (!el || el === document.body || el === document.documentElement) return null;
    if (el.closest('#wr-dock') || el.closest('#wr-modal-backdrop') || el.closest('#wr-launcher-pill') || el.closest('#wr-inspect-badge')) return null;
    const tag = (el.tagName || '').toUpperCase();
    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'HEAD', 'META', 'LINK', 'TEMPLATE'].includes(tag)) return null;
    if (['PATH', 'G', 'CIRCLE', 'RECT', 'POLYGON', 'POLYLINE', 'LINE', 'DEFS', 'USE'].includes(tag)) {
      const parentSvg = el.closest('svg');
      if (parentSvg) return parentSvg;
    }
    return el;
  }

  // Inyección de Estilos
  function injectLauncherStyles() {
    if (document.getElementById('wr-launcher-styles')) return;
    const st = document.createElement('style');
    st.id = 'wr-launcher-styles';
    st.textContent = `
      #wr-launcher-pill {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 99998;
        background: #0E121A;
        color: #F3F5F7;
        border: 1px solid rgba(95, 211, 184, 0.4);
        border-radius: 30px;
        padding: 8px 16px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 6px 20px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        gap: 8px;
        transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
      }
      #wr-launcher-pill:hover {
        transform: translateY(-2px);
        border-color: ${CONFIG.brandColor};
        box-shadow: 0 10px 25px rgba(0,0,0,0.6);
      }
      #wr-launcher-pill span {
        background: rgba(255,255,255,0.1);
        padding: 2px 6px;
        border-radius: 6px;
        font-size: 11px;
        color: ${CONFIG.brandColor};
      }
    `;
    document.head.appendChild(st);
  }

  function injectStyles() {
    if (document.getElementById('wr-main-styles')) return;
    const style = document.createElement('style');
    style.id = 'wr-main-styles';
    style.textContent = `
      .wr-hover {
        outline: 2px dashed ${CONFIG.brandColor} !important;
        outline-offset: 3px !important;
        cursor: crosshair !important;
        background-color: rgba(95, 211, 184, 0.12) !important;
        transition: outline 0.15s ease, background-color 0.15s ease;
      }
      .wr-noted-element {
        border-bottom: 2px solid ${CONFIG.brandColor} !important;
      }
      #wr-dock {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 99999;
        display: flex;
        align-items: center;
        gap: 10px;
        background: rgba(14, 18, 26, 0.96);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(95, 211, 184, 0.35);
        border-radius: 40px;
        padding: 8px 16px;
        box-shadow: 0 12px 36px rgba(0,0,0,0.65);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #F3F5F7;
        font-size: 13px;
        user-select: none;
      }
      .wr-status-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #64748B;
        transition: all 0.25s ease;
      }
      .wr-status-dot.active-inspect {
        background: ${CONFIG.brandColor};
        box-shadow: 0 0 10px ${CONFIG.brandColor};
        animation: wr-pulse 2s infinite;
      }
      @keyframes wr-pulse {
        0% { transform: scale(0.95); opacity: 0.8; }
        50% { transform: scale(1.15); opacity: 1; }
        100% { transform: scale(0.95); opacity: 0.8; }
      }
      .wr-mode-switch {
        display: flex;
        align-items: center;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 20px;
        padding: 2px;
        gap: 2px;
      }
      .wr-mode-tab {
        background: transparent;
        border: none;
        color: #94A3B8;
        padding: 5px 12px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.18s ease;
      }
      .wr-mode-tab.active {
        background: ${CONFIG.brandColor};
        color: #0E121A;
        box-shadow: 0 2px 8px rgba(95, 211, 184, 0.35);
      }
      #wr-badge {
        background: rgba(95, 211, 184, 0.15);
        color: ${CONFIG.brandColor};
        font-weight: 700;
        font-size: 11px;
        padding: 4px 9px;
        border-radius: 20px;
        border: 1px solid rgba(95, 211, 184, 0.3);
      }
      .wr-dock-btn {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: #F3F5F7;
        padding: 5px 10px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 500;
        transition: background 0.2s, color 0.2s;
      }
      .wr-dock-btn:hover {
        background: ${CONFIG.brandColor};
        color: #0E121A;
      }
      .wr-exit-btn {
        background: transparent;
        border: none;
        color: #8C96A5;
        font-size: 14px;
        cursor: pointer;
        padding: 4px 6px;
      }
      .wr-exit-btn:hover {
        color: #F87171;
      }

      /* HUD Flotante de Inspección */
      #wr-inspect-badge {
        position: fixed;
        z-index: 999998;
        pointer-events: none;
        background: rgba(14, 18, 26, 0.95);
        border: 1px solid rgba(95, 211, 184, 0.45);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
        border-radius: 8px;
        padding: 5px 10px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
        font-size: 11px;
        color: #F3F5F7;
        display: flex;
        align-items: center;
        gap: 8px;
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        transition: opacity 0.15s ease, transform 0.1s ease;
        opacity: 0;
        transform: translateY(4px);
      }
      #wr-inspect-badge.wr-hud-visible {
        opacity: 1;
        transform: translateY(0);
      }
      .wr-hud-tag {
        color: ${CONFIG.brandColor};
        font-weight: 700;
      }
      .wr-hud-type {
        background: rgba(255, 255, 255, 0.1);
        padding: 1px 6px;
        border-radius: 4px;
        font-size: 10px;
        color: #94A3B8;
      }
      .wr-hud-dim {
        color: #CBD5E1;
        font-size: 10px;
      }

      /* Modal de Feedback */
      #wr-modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(5, 8, 14, 0.82);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        z-index: 100000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      #wr-modal {
        background: #111620;
        border: 1px solid rgba(95, 211, 184, 0.4);
        border-radius: 18px;
        width: 100%;
        max-width: 660px;
        box-shadow: 0 30px 70px rgba(0,0,0,0.85);
        color: #F3F5F7;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        padding: 24px;
        animation: wr-slide-up 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        box-sizing: border-box;
        max-height: 90vh;
        overflow-y: auto;
      }
      @keyframes wr-slide-up {
        from { opacity: 0; transform: translateY(16px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .wr-modal-title {
        margin: 0 0 10px 0;
        font-size: 16px;
        color: ${CONFIG.brandColor};
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .wr-meta-tag {
        font-size: 11px;
        font-family: monospace;
        color: #8C96A5;
        background: rgba(255, 255, 255, 0.06);
        padding: 3px 8px;
        border-radius: 6px;
        font-weight: 500;
      }
      .wr-label {
        display: block;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #8C96A5;
        margin: 12px 0 5px;
      }

      /* Breadcrumbs de Navegación Jerárquica */
      .wr-breadcrumbs {
        display: flex;
        align-items: center;
        gap: 6px;
        margin: 6px 0 14px 0;
        padding: 6px 10px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        overflow-x: auto;
        font-size: 11px;
      }
      .wr-bread-label {
        color: #8C96A5;
        font-weight: 700;
        text-transform: uppercase;
        font-size: 10px;
        white-space: nowrap;
      }
      .wr-bread-list {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-wrap: nowrap;
      }
      .wr-bread-btn {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 4px;
        color: #94A3B8;
        padding: 2px 7px;
        font-size: 11px;
        font-family: monospace;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.15s ease;
      }
      .wr-bread-btn:hover {
        color: ${CONFIG.brandColor};
        border-color: ${CONFIG.brandColor};
        background: rgba(95, 211, 184, 0.1);
      }
      .wr-bread-btn.active {
        background: ${CONFIG.brandColor};
        color: #0E121A;
        font-weight: 700;
        border-color: ${CONFIG.brandColor};
      }
      .wr-bread-sep {
        color: rgba(255, 255, 255, 0.25);
        font-size: 11px;
      }

      /* Ficha de Metadatos UI */
      .wr-original-preview {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        padding: 10px 12px;
        font-size: 13px;
        color: #CBD5E1;
        line-height: 1.45;
        max-height: 100px;
        overflow-y: auto;
      }
      .wr-meta-card {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        padding: 10px 12px;
        font-size: 12px;
        color: #CBD5E1;
        line-height: 1.45;
      }
      .wr-meta-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 8px;
        margin-bottom: 8px;
      }
      .wr-meta-item {
        background: rgba(255, 255, 255, 0.03);
        padding: 5px 8px;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.06);
      }
      .wr-meta-item-label {
        font-size: 10px;
        color: #8C96A5;
        text-transform: uppercase;
        font-weight: 600;
      }
      .wr-meta-item-val {
        font-size: 11px;
        color: ${CONFIG.brandColor};
        font-weight: 600;
        font-family: monospace;
      }

      .wr-input, .wr-select, .wr-textarea {
        width: 100%;
        box-sizing: border-box;
        background: #171E2B;
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 8px;
        color: #F3F5F7;
        font-size: 13px;
        padding: 8px 11px;
        font-family: inherit;
      }
      .wr-input:focus, .wr-select:focus, .wr-textarea:focus {
        outline: none;
        border-color: ${CONFIG.brandColor};
        box-shadow: 0 0 0 2px rgba(95, 211, 184, 0.2);
      }
      .wr-btn-row {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
      }
      .wr-btn {
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        border: none;
        transition: opacity 0.15s ease;
      }
      .wr-btn:hover {
        opacity: 0.9;
      }
      .wr-btn-primary {
        background: ${CONFIG.brandColor};
        color: #0E121A;
      }
      .wr-btn-secondary {
        background: transparent;
        color: #8C96A5;
        border: 1px solid rgba(255,255,255,0.15);
      }
    `;
    document.head.appendChild(style);
  }

  // Barra de Navegación / Edición
  function createFloatingDock() {
    if (document.getElementById('wr-dock')) return;

    const dock = document.createElement('div');
    dock.id = 'wr-dock';
    dock.innerHTML = `
      <span style="display:flex;align-items:center;gap:6px;">
        <span class="wr-status-dot" id="wr-status-dot"></span>
        <span id="wr-status-label" style="font-size:12px;font-weight:600;">Navegando</span>
      </span>
      <div class="wr-mode-switch">
        <button class="wr-mode-tab active" id="wr-tab-publish" title="Navegar libremente por la web">🧭 Navegar</button>
        <button class="wr-mode-tab" id="wr-tab-inspect" title="Activar modo edición y diseño (Alt+C)">✍️ Comentar</button>
      </div>
      <span id="wr-badge">0 notas</span>
      <button class="wr-dock-btn" id="wr-menu-btn" title="Opciones y Exportación">⚙️</button>
      <button class="wr-exit-btn" id="wr-exit-btn" title="Cerrar barra (Modo Review sigue disponible en ⌥C)">✕</button>
    `;
    document.body.appendChild(dock);

    updateNotesBadge();

    document.getElementById('wr-tab-publish').addEventListener('click', function() { setInspectionMode('publish'); });
    document.getElementById('wr-tab-inspect').addEventListener('click', function() { setInspectionMode('inspect'); });
    document.getElementById('wr-menu-btn').addEventListener('click', openOptionsMenu);
    document.getElementById('wr-exit-btn').addEventListener('click', function() { deactivateReviewMode(); });
  }

  function setInspectionMode(mode) {
    currentMode = mode;
    const tabPub = document.getElementById('wr-tab-publish');
    const tabIns = document.getElementById('wr-tab-inspect');
    const dot = document.getElementById('wr-status-dot');
    const label = document.getElementById('wr-status-label');

    if (mode === 'inspect') {
      if (tabIns) tabIns.classList.add('active');
      if (tabPub) tabPub.classList.remove('active');
      if (dot) dot.classList.add('active-inspect');
      if (label) label.textContent = 'Modo Comentarios';
    } else {
      if (tabPub) tabPub.classList.add('active');
      if (tabIns) tabIns.classList.remove('active');
      if (dot) dot.classList.remove('active-inspect');
      if (label) label.textContent = 'Navegando';
      if (currentHovered) {
        currentHovered.classList.remove('wr-hover');
        currentHovered = null;
      }
      updateInspectHUD(null);
    }
  }

  function updateNotesBadge() {
    const notes = getStoredNotes();
    const badge = document.getElementById('wr-badge');
    if (badge) {
      badge.textContent = `${notes.length} nota${notes.length === 1 ? '' : 's'}`;
    }
  }

  // Inspector Visual Universal
  function setupInspector() {
    document.addEventListener('mouseover', function(e) {
      if (currentMode !== 'inspect') return;
      if (e.target.closest('#wr-dock') || e.target.closest('#wr-modal-backdrop') || e.target.closest('#wr-launcher-pill')) return;

      const target = getInspectableElement(e.target);
      if (target) {
        if (currentHovered && currentHovered !== target) {
          currentHovered.classList.remove('wr-hover');
        }
        currentHovered = target;
        currentHovered.classList.add('wr-hover');
        updateInspectHUD(target);
      }
    }, true);

    document.addEventListener('mouseout', function(e) {
      if (currentMode !== 'inspect') return;
      if (currentHovered && !currentHovered.contains(e.relatedTarget)) {
        currentHovered.classList.remove('wr-hover');
        currentHovered = null;
        updateInspectHUD(null);
      }
    }, true);

    document.addEventListener('click', function(e) {
      if (currentMode !== 'inspect') return;
      if (e.target.closest('#wr-dock') || e.target.closest('#wr-modal-backdrop') || e.target.closest('#wr-launcher-pill')) return;

      const target = getInspectableElement(e.target);
      if (target) {
        e.preventDefault();
        e.stopPropagation();
        updateInspectHUD(null);
        openFeedbackModal(target);
      }
    }, true);
  }

  // Modal de Captura de Feedback (Editorial + Diseño UI)
  function openFeedbackModal(el) {
    updateInspectHUD(null);
    if (currentHovered) {
      currentHovered.classList.remove('wr-hover');
      currentHovered = null;
    }

    const existingModal = document.getElementById('wr-modal-backdrop');
    if (existingModal) existingModal.remove();

    const meta = getElementMetadata(el);
    const pagePath = window.location.pathname.split('/').pop() || 'index.html';
    const sectionContainer = el.closest('section') || el.closest('header') || el.closest('footer') || el.closest('main') || el.parentElement;
    const sectionName = (sectionContainer && (sectionContainer.id || sectionContainer.className)) || (el.closest('header') ? 'Header' : (el.closest('footer') ? 'Footer' : 'General'));

    // Categoría preseleccionada inteligente
    let defaultCat = 'Tono Editorial / Copywriting';
    if (meta.isNav) {
      defaultCat = 'Navegación / UX / Menús';
    } else if (!meta.isText || meta.isMedia || meta.isSection) {
      defaultCat = 'Diseño / UI / Layout';
    }

    const ancestors = getInspectableAncestors(el);

    const backdrop = document.createElement('div');
    backdrop.id = 'wr-modal-backdrop';

    const modalTitle = (!meta.isText || meta.isMedia) ? '🎨 Sugerir Cambio de Diseño, Bloque o Navegación' : '📝 Sugerir Cambio / Nota de Feedback';
    const textLabel = meta.isText ? 'Texto Actual en la Web' : 'Elemento o Bloque Seleccionado';
    const propLabel = meta.isText ? 'Propuesta de Texto Alternativo (Opcional)' : 'Propuesta de Ajuste, Diseño o Redacción (Opcional)';
    const propPlaceholder = meta.isText 
      ? 'Si deseas proponer una redacción específica, modifícala aquí...'
      : 'Indica ajustes sugeridos (ej: Cambiar ratio a 16:9, reducir márgenes, fondo más oscuro, o nuevo texto)...';
    const commPlaceholder = meta.isText
      ? 'Explica por qué sugieres este cambio...'
      : 'Explica el motivo del cambio de diseño, navegación, proporciones o maquetación...';

    // Construcción de la ficha técnica
    let originalDisplayHtml = '';
    if (meta.isText) {
      originalDisplayHtml = `<div class="wr-original-preview">${escapeHtml(meta.rawText)}</div>`;
    } else {
      let details = [];
      if (meta.width > 0 && meta.height > 0) {
        details.push(`<div class="wr-meta-item"><div class="wr-meta-item-label">Dimensiones</div><div class="wr-meta-item-val">${meta.width} × ${meta.height} px</div></div>`);
      }
      if (meta.ratioStr) {
        details.push(`<div class="wr-meta-item"><div class="wr-meta-item-label">Aspect Ratio</div><div class="wr-meta-item-val">${meta.ratioStr}</div></div>`);
      }
      if (meta.bgImg || meta.bgColor) {
        details.push(`<div class="wr-meta-item"><div class="wr-meta-item-label">Fondo</div><div class="wr-meta-item-val">${meta.bgImg || meta.bgColor}</div></div>`);
      }
      if (meta.border || meta.borderRadius) {
        details.push(`<div class="wr-meta-item"><div class="wr-meta-item-label">Borde / Radio</div><div class="wr-meta-item-val">${meta.border || ''} ${meta.borderRadius ? '(' + meta.borderRadius + ')' : ''}</div></div>`);
      }

      originalDisplayHtml = `
        <div class="wr-meta-card">
          <div class="wr-meta-grid">
            <div class="wr-meta-item">
              <div class="wr-meta-item-label">Selector</div>
              <div class="wr-meta-item-val">&lt;${escapeHtml(meta.selector)}&gt;</div>
            </div>
            <div class="wr-meta-item">
              <div class="wr-meta-item-label">Tipo</div>
              <div class="wr-meta-item-val">${escapeHtml(meta.type)}</div>
            </div>
            ${details.join('')}
          </div>
          <div style="font-size:11px; color:#94A3B8; margin-top:6px; border-top:1px solid rgba(255,255,255,0.06); padding-top:6px;">
            <strong>Contenido:</strong> ${escapeHtml(meta.textSummary)}
          </div>
        </div>
      `;
    }

    // Breadcrumbs para alternar elemento
    const breadcrumbHtml = ancestors.length > 1 ? `
      <div class="wr-breadcrumbs">
        <span class="wr-bread-label">Jerarquía:</span>
        <div class="wr-bread-list">
          ${ancestors.map((item, idx) => {
            const isSel = item === el;
            const aMeta = getElementMetadata(item);
            const aLabel = aMeta.selector.length > 22 ? aMeta.selector.substring(0, 20) + '…' : aMeta.selector;
            return `<button type="button" class="wr-bread-btn ${isSel ? 'active' : ''}" data-bidx="${idx}" title="${aMeta.type} (${aMeta.width}×${aMeta.height}px)">${escapeHtml(aLabel)}</button>`;
          }).join('<span class="wr-bread-sep">›</span>')}
        </div>
      </div>
    ` : '';

    backdrop.innerHTML = `
      <div id="wr-modal">
        <h3 class="wr-modal-title">
          <span>${modalTitle}</span>
          <span class="wr-meta-tag">${pagePath} · &lt;${meta.tag}&gt;</span>
        </h3>

        ${breadcrumbHtml}

        <div style="display:flex; gap:12px; margin-top:4px;">
          <div style="flex:1;">
            <label class="wr-label">👤 Usuario / Revisor</label>
            <input class="wr-input" id="wr-note-user" value="${escapeHtml(getReviewerIdentity())}" placeholder="Nombre / Email" />
          </div>
          <div style="flex:1;">
            <label class="wr-label">🏷️ Categoría</label>
            <select class="wr-select" id="wr-note-cat">
              ${CONFIG.categories.map(cat => `<option value="${escapeHtml(cat)}" ${cat === defaultCat ? 'selected' : ''}>${escapeHtml(cat)}</option>`).join('')}
            </select>
          </div>
        </div>

        <label class="wr-label">${textLabel}</label>
        ${originalDisplayHtml}

        <label class="wr-label">${propLabel}</label>
        <textarea class="wr-textarea" id="wr-note-prop" rows="${meta.isText ? '3' : '2'}" placeholder="${propPlaceholder}">${meta.isText ? escapeHtml(meta.rawText) : ''}</textarea>

        <label class="wr-label">Comentario o Justificación</label>
        <textarea class="wr-textarea" id="wr-note-comment" rows="2" placeholder="${commPlaceholder}"></textarea>

        <label class="wr-label">Observaciones / Resolución (Opcional)</label>
        <input class="wr-input" id="wr-note-resol" placeholder="Detalles técnicos o notas adicionales..." />

        <div class="wr-btn-row">
          <button class="wr-btn wr-btn-secondary" id="wr-modal-cancel">Cancelar</button>
          <button class="wr-btn wr-btn-primary" id="wr-modal-save">Guardar Nota</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);

    // Eventos de Breadcrumbs
    backdrop.querySelectorAll('.wr-bread-btn').forEach(btn => {
      btn.addEventListener('click', function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        const bIdx = parseInt(btn.getAttribute('data-bidx'), 10);
        if (!isNaN(bIdx) && ancestors[bIdx] && ancestors[bIdx] !== el) {
          openFeedbackModal(ancestors[bIdx]);
        }
      });
    });

    const inputUser = document.getElementById('wr-note-user');
    const inputComment = document.getElementById('wr-note-comment');
    if (!inputUser.value) {
      inputUser.focus();
    } else {
      inputComment.focus();
    }

    document.getElementById('wr-modal-cancel').addEventListener('click', function() { backdrop.remove(); });
    backdrop.addEventListener('click', function(e) {
      if (e.target === backdrop) backdrop.remove();
    });

    document.getElementById('wr-modal-save').addEventListener('click', function() {
      const user = (inputUser.value || '').trim();
      if (!user) {
        alert('Por favor, indica tu nombre o email en el campo Usuario.');
        inputUser.focus();
        return;
      }
      setReviewerIdentity(user);

      const propText = (document.getElementById('wr-note-prop').value || '').trim();
      const comment = (document.getElementById('wr-note-comment').value || '').trim();
      const category = document.getElementById('wr-note-cat').value;
      const resol = (document.getElementById('wr-note-resol').value || '').trim();
      const textToRecord = meta.isText ? meta.rawText : meta.textSummary;

      const newNote = {
        id: 'NOTE_' + Date.now(),
        fecha: new Date().toISOString(),
        proyecto: CONFIG.projectName,
        usuario: user,
        pagina: pagePath,
        url_completa: window.location.href,
        seccion: sectionName,
        tag: meta.selector,
        texto_original: textToRecord,
        texto_propuesto: propText !== textToRecord ? propText : '',
        categoria: category,
        comentario: comment || 'Sin comentario adicional',
        situacion: 'Plan',
        resolucion: resol
      };

      const notes = getStoredNotes();
      notes.push(newNote);
      saveStoredNotes(notes);

      el.classList.add('wr-noted-element');
      backdrop.remove();

      sendToGoogleSheets(newNote, function(success) {
        if (!success && !getWebhookUrl()) {
          console.info('[WebReview] Nota guardada localmente. Configura el webhook de Google Sheets en ⚙️.');
        }
      });
    });
  }

  // Menú de Opciones y Configuración
  function openOptionsMenu() {
    const existing = document.getElementById('wr-modal-backdrop');
    if (existing) existing.remove();

    const backdrop = document.createElement('div');
    backdrop.id = 'wr-modal-backdrop';
    backdrop.innerHTML = `
      <div id="wr-modal" style="max-width:480px;">
        <h3 class="wr-modal-title">
          <span>⚙️ Configuración y Exportación</span>
        </h3>

        <label class="wr-label">Webhook de Google Sheets (Apps Script)</label>
        <input class="wr-input" id="wr-cfg-webhook" value="${escapeHtml(getWebhookUrl())}" placeholder="https://script.google.com/macros/s/.../exec" />
        <small style="display:block; color:#8C96A5; margin-top:4px; font-size:11px;">
          Pega la URL de tu Web App desplegada en Google Apps Script.
        </small>

        <label class="wr-label">Nombre del Revisor Habitual</label>
        <input class="wr-input" id="wr-cfg-user" value="${escapeHtml(getReviewerIdentity())}" placeholder="Tu Nombre / Email" />

        <label class="wr-label">Exportar Notas (${getStoredNotes().length} acumuladas)</label>
        <div style="display:flex; gap:8px; margin-top:6px;">
          <button class="wr-btn wr-btn-secondary" style="flex:1;" id="wr-export-json">💾 Descargar JSON</button>
          <button class="wr-btn wr-btn-secondary" style="flex:1;" id="wr-export-md">📋 Copiar Markdown</button>
        </div>

        <div class="wr-btn-row">
          <button class="wr-btn wr-btn-secondary" id="wr-cfg-close">Cerrar</button>
          <button class="wr-btn wr-btn-primary" id="wr-cfg-save">Guardar Cambios</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);

    document.getElementById('wr-cfg-close').addEventListener('click', function() { backdrop.remove(); });
    backdrop.addEventListener('click', function(e) {
      if (e.target === backdrop) backdrop.remove();
    });

    document.getElementById('wr-cfg-save').addEventListener('click', function() {
      const webhook = (document.getElementById('wr-cfg-webhook').value || '').trim();
      const user = (document.getElementById('wr-cfg-user').value || '').trim();
      setWebhookUrl(webhook);
      setReviewerIdentity(user);
      backdrop.remove();
      alert('Configuración guardada correctamente.');
    });

    document.getElementById('wr-export-json').addEventListener('click', exportJSON);
    document.getElementById('wr-export-md').addEventListener('click', copyMarkdown);
  }

  function exportJSON() {
    const notes = getStoredNotes();
    if (notes.length === 0) {
      alert('Aún no has registrado ninguna nota.');
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      proyecto: CONFIG.projectName,
      fecha_exportacion: new Date().toISOString(),
      total_notas: notes.length,
      notas: notes
    }, null, 2));

    const dl = document.createElement('a');
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", `review_notes_${Date.now()}.json`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
  }

  function copyMarkdown() {
    const notes = getStoredNotes();
    if (notes.length === 0) {
      alert('Aún no has registrado ninguna nota.');
      return;
    }

    let md = `# Reporte de Feedback, Diseño y Revisión Web (${CONFIG.projectName})\n\n`;
    md += `* **Fecha**: ${new Date().toLocaleString()}\n`;
    md += `* **Total de Sugerencias**: ${notes.length}\n\n`;
    md += `| Nº | Revisor | Página | Categoría | Elemento / Texto | Propuesta / Ajuste | Justificación |\n`;
    md += `|:---|:---|:---|:---|:---|:---|:---|\n`;

    notes.forEach(function(n, idx) {
      const prop = n.texto_propuesto ? `**Propuesta:** "${escapeTable(n.texto_propuesto)}"<br>` : '';
      const comm = `*Nota:* ${escapeTable(n.comentario)}`;
      md += `| ${idx+1} | ${escapeTable(n.usuario)} | \`${n.pagina}\` | ${n.categoria} | "${escapeTable(n.texto_original)}" | ${prop} | ${comm} |\n`;
    });

    navigator.clipboard.writeText(md).then(function() {
      alert('¡Reporte en Markdown copiado al portapapeles!');
    }).catch(function() {
      prompt('Copia el reporte manualmente:', md);
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function escapeTable(str) {
    if (!str) return '';
    return String(str).replace(/\|/g, "\\|").replace(/\n/g, " ");
  }

  // API pública
  window.WebReview = {
    init: activateReviewMode,
    toggle: toggleReviewMode,
    setMode: setInspectionMode,
    getNotes: getStoredNotes,
    exportJSON: exportJSON,
    copyMarkdown: copyMarkdown
  };

})(window, document);
