/**
 * review-auth.js — Login con Google (GIS) para el Modo Review.
 * Obtiene un ID token de Google del revisor y lo deja en window.WEB_REVIEW_AUTH.idToken.
 * El webhook (doPost) verifica ese token (aud=Client ID, allowlist "Revisores").
 * Requiere window.WEB_REVIEW_CONFIG.clientId. Solo se carga en preproduction (dev).
 */
(function () {
  'use strict';
  window.WEB_REVIEW_AUTH = window.WEB_REVIEW_AUTH || { idToken: '' };
  var cfg = window.WEB_REVIEW_CONFIG || {};
  if (!cfg.clientId) {
    console.warn('[WebReview] Falta WEB_REVIEW_CONFIG.clientId; login de Google desactivado.');
    return;
  }

  function onCredential(resp) {
    if (resp && resp.credential) {
      window.WEB_REVIEW_AUTH.idToken = resp.credential;
      hideButton();
      try { document.dispatchEvent(new CustomEvent('webreview:signedin')); } catch (e) {}
      console.log('[WebReview] ✅ Sesión de Google iniciada.');
    }
  }

  var btnWrap = null;
  function showButton() {
    if (btnWrap || !window.google || !google.accounts) return;
    btnWrap = document.createElement('div');
    btnWrap.id = 'webreview-signin';
    btnWrap.style.cssText = 'position:fixed;left:16px;bottom:16px;z-index:2147483647;' +
      'background:#fff;padding:8px 10px;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.25);font:13px system-ui';
    var label = document.createElement('div');
    label.textContent = 'Modo Review — inicia sesión:';
    label.style.cssText = 'margin-bottom:6px;color:#333';
    var slot = document.createElement('div');
    btnWrap.appendChild(label); btnWrap.appendChild(slot);
    document.body.appendChild(btnWrap);
    try { google.accounts.id.renderButton(slot, { theme: 'outline', size: 'medium', text: 'signin_with' }); } catch (e) {}
  }
  function hideButton() { if (btnWrap && btnWrap.parentNode) { btnWrap.parentNode.removeChild(btnWrap); btnWrap = null; } }

  function init() {
    google.accounts.id.initialize({
      client_id: cfg.clientId,
      callback: onCredential,
      auto_select: false,
      use_fedcm_for_prompt: true
    });
    // API pública para que el cliente pida login cuando haga falta.
    window.WEB_REVIEW_AUTH.prompt = function () {
      try { google.accounts.id.prompt(); } catch (e) {}
      showButton();
    };
    google.accounts.id.prompt();
    showButton();
  }

  var s = document.createElement('script');
  s.src = 'https://accounts.google.com/gsi/client';
  s.async = true; s.defer = true;
  s.onload = init;
  s.onerror = function () { console.warn('[WebReview] No se pudo cargar Google Identity Services.'); };
  document.head.appendChild(s);
})();
