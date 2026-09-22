/* ==========================================================================
   VALNATIR · Lógica Interactiva y Micro-interacciones de Alto Calibre (Estilo WAM)
   ========================================================================== */

function bootstrapValnatir() {
  const fns = [
    initCursor, initHeaderScroll, initScrollReveal, initHeroReel,
    initLangSwitcher, initComparisonTabs, initIndustryTabs, initSwiper,
    initModal, initMobileMenu, initFrameworkTabs, initDropdowns
  ];
  fns.forEach(fn => {
    try {
      if (typeof fn === 'function') fn();
    } catch(err) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('Init error in ' + (fn.name || 'anonymous'), err);
      }
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapValnatir);
} else {
  bootstrapValnatir();
}

/* --------------------------------------------------------------------------
   1. Custom Cursor (WAM Micro-interaction)
   -------------------------------------------------------------------------- */
function initCursor() {
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');

  if (!cursor || !ring) return;

  // Touch device check
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    cursor.style.display = 'none';
    ring.style.display = 'none';
    document.body.style.cursor = 'auto';
    return;
  }

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  // Smooth lerp for ring
  function renderRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(renderRing);
  }
  requestAnimationFrame(renderRing);

  // Hover effect over interactive elements
  const interactiveSelectors = 'a, button, input, textarea, select, .btn, .h1-switcher, .solution-row, .case-slide, [data-reveal]';
  document.querySelectorAll(interactiveSelectors).forEach((el) => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
  });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    ring.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    ring.style.opacity = '1';
  });
}

/* --------------------------------------------------------------------------
   2. Header Scroll Transition (Transparent → Blurry Frosted Glass)
   -------------------------------------------------------------------------- */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* --------------------------------------------------------------------------
   3. Scroll Reveal Engine (IntersectionObserver)
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('[data-reveal]');
  if (!revealElements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.12
  });

  revealElements.forEach((el) => observer.observe(el));
}

/* --------------------------------------------------------------------------
   4. Hero Reel Ambient Engine (60 FPS Procedural Data Streams & Telemetry)
   -------------------------------------------------------------------------- */
function initHeroReel() {
  const canvas = document.getElementById('hero-reel-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let isVisible = true;
  let animFrameId = null;

  function resize() {
    if (!canvas.parentElement) return;
    width = canvas.width = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  // Pause when offscreen for battery/GPU efficiency
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
      if (isVisible && !animFrameId) {
        animFrameId = requestAnimationFrame(animate);
      }
    }, { threshold: 0.05 });
    observer.observe(canvas);
  }

  // Check prefers-reduced-motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Stream packets
  const packetCount = Math.min(Math.floor(width / 24), 50);
  const packets = [];
  for (let i = 0; i < packetCount; i++) {
    packets.push({
      x: Math.random() * width,
      y: Math.random() * height,
      speedX: (Math.random() - 0.2) * 1.6 + 0.6,
      speedY: (Math.random() - 0.5) * 0.6,
      length: Math.random() * 35 + 15,
      radius: Math.random() * 1.8 + 0.8,
      alpha: Math.random() * 0.6 + 0.2,
      color: Math.random() > 0.5 ? '#5FD3B8' : (Math.random() > 0.5 ? '#A855F7' : '#237078')
    });
  }

  // Interception nodes
  const nodes = [
    { x: 0.18, y: 0.32, label: 'WhatsApp Core' },
    { x: 0.5, y: 0.5, label: 'Flight Control Active' },
    { x: 0.82, y: 0.38, label: 'Enterprise LLM' },
    { x: 0.5, y: 0.78, label: 'ENS Cryptographic Vault' }
  ];

  let radarAngle = 0;

  function animate(timestamp) {
    if (!isVisible) {
      animFrameId = null;
      return;
    }

    ctx.clearRect(0, 0, width, height);

    // 1. Dual Chromatic Brand Gradient (Soft seamless fade)
    const grad = ctx.createRadialGradient(width * 0.45, height * 0.42, 20, width * 0.5, height * 0.45, width * 0.85);
    grad.addColorStop(0, 'rgba(24, 83, 89, 0.22)');
    grad.addColorStop(0.5, 'rgba(75, 20, 95, 0.14)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 2. Cryptographic Grid Lines
    ctx.strokeStyle = 'rgba(95, 211, 184, 0.035)';
    ctx.lineWidth = 1;
    const gridSize = 48;
    ctx.beginPath();
    for (let x = 0; x < width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // 3. Radar Sweeps
    if (!prefersReduced) {
      radarAngle += 0.012;
    }
    const cx = width * 0.5;
    const cy = height * 0.48;
    const maxRadius = Math.min(width, height) * 0.45;

    ctx.strokeStyle = 'rgba(95, 211, 184, 0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, maxRadius * 0.35, 0, Math.PI * 2);
    ctx.arc(cx, cy, maxRadius * 0.7, 0, Math.PI * 2);
    ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
    ctx.stroke();

    if (!prefersReduced) {
      const sweepGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, maxRadius);
      sweepGrad.addColorStop(0, 'rgba(95, 211, 184, 0.12)');
      sweepGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sweepGrad;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxRadius, radarAngle, radarAngle + 0.35);
      ctx.closePath();
      ctx.fill();
    }

    // 4. Data Packets in Flight
    packets.forEach((p) => {
      if (!prefersReduced) {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x > width + 40) p.x = -40;
        if (p.y > height + 20) p.y = -20;
        if (p.y < -20) p.y = height + 20;
      }

      // Beam trail
      const beam = ctx.createLinearGradient(p.x - p.length, p.y, p.x, p.y);
      beam.addColorStop(0, 'transparent');
      beam.addColorStop(1, p.color);

      ctx.strokeStyle = beam;
      ctx.lineWidth = p.radius;
      ctx.beginPath();
      ctx.moveTo(p.x - p.length, p.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();

      // Glowing head
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 0.75, 0, Math.PI * 2);
      ctx.fill();
    });

    // 5. Interception Nodes & Links
    nodes.forEach((n, idx) => {
      const nx = n.x * width;
      const ny = n.y * height;

      if (idx !== 1) {
        const centerNodeX = nodes[1].x * width;
        const centerNodeY = nodes[1].y * height;
        ctx.strokeStyle = 'rgba(95, 211, 184, 0.14)';
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.lineTo(centerNodeX, centerNodeY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      const pulse = (Math.sin(timestamp * 0.003 + idx) + 1) * 6 + 4;
      ctx.strokeStyle = idx === 1 ? 'rgba(95, 211, 184, 0.55)' : 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(nx, ny, pulse, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = idx === 1 ? '#5FD3B8' : '#38BDF8';
      ctx.beginPath();
      ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

    animFrameId = requestAnimationFrame(animate);
  }

  animFrameId = requestAnimationFrame(animate);
}

/* --------------------------------------------------------------------------
   5. Language Switcher (EN default · ES localized with path handling)
   -------------------------------------------------------------------------- */
function initLangSwitcher() {
  const switchers = document.querySelectorAll('.lang-switcher');
  if (!switchers.length) return;

  const currentPath = window.location.pathname;
  const isSpanish = currentPath.includes('/es/') || currentPath.endsWith('/es');

  switchers.forEach((sw) => {
    const enBtn = sw.querySelector('[data-lang="en"]');
    const esBtn = sw.querySelector('[data-lang="es"]');

    if (isSpanish) {
      if (esBtn) esBtn.classList.add('active');
      if (enBtn) enBtn.classList.remove('active');
    } else {
      if (enBtn) enBtn.classList.add('active');
      if (esBtn) esBtn.classList.remove('active');
    }

    if (enBtn) {
      enBtn.addEventListener('click', (e) => {
        localStorage.setItem('valnatir_lang', 'en');
        if (!isSpanish) {
          e.preventDefault();
          return;
        }
        e.preventDefault();
        let target = enBtn.getAttribute('href');
        if (currentPath.includes('/es/')) {
          target = currentPath.replace('/es/', '/');
        } else if (currentPath.endsWith('/es')) {
          target = currentPath.replace(/\/es$/, '/');
        }
        window.location.href = target || '../index.html';
      });
    }

    if (esBtn) {
      esBtn.addEventListener('click', (e) => {
        localStorage.setItem('valnatir_lang', 'es');
        if (isSpanish) {
          e.preventDefault();
          return;
        }
        e.preventDefault();
        let target = esBtn.getAttribute('href');
        const lastSlash = currentPath.lastIndexOf('/');
        const basePath = currentPath.substring(0, lastSlash + 1);
        const filename = currentPath.substring(lastSlash + 1) || 'index.html';
        if (filename.endsWith('.html')) {
          target = basePath + 'es/' + filename;
        } else {
          target = basePath + 'es/';
        }
        window.location.href = target || 'es/index.html';
      });
    }
  });
}

/* --------------------------------------------------------------------------
   6. Comparativa Interactiva (Control de Vuelo vs. Caja Negra)
   -------------------------------------------------------------------------- */
function toggleComparison(type) {
  const tabValnatir = document.getElementById('tab-valnatir');
  const tabLegacy = document.getElementById('tab-legacy');
  const panelValnatir = document.getElementById('panel-valnatir');
  const panelLegacy = document.getElementById('panel-legacy');

  if (!tabValnatir || !tabLegacy || !panelValnatir || !panelLegacy) return;

  if (type === 'valnatir') {
    tabValnatir.classList.add('active');
    tabLegacy.classList.remove('active');
    panelValnatir.classList.add('active');
    panelLegacy.classList.remove('active');
  } else {
    tabLegacy.classList.add('active');
    tabValnatir.classList.remove('active');
    panelLegacy.classList.add('active');
    panelValnatir.classList.remove('active');
  }
}
window.toggleComparison = toggleComparison;

function initComparisonTabs() {
  window.toggleComparison = toggleComparison;
}

/* --------------------------------------------------------------------------
   7. Selector de Industrias (Enterprise, Govtech, Defensa)
   -------------------------------------------------------------------------- */
function switchIndustry(sector) {
  const buttons = document.querySelectorAll('.ind-btn');
  const panels = document.querySelectorAll('.industry-panel');

  buttons.forEach(btn => btn.classList.remove('active'));
  panels.forEach(panel => panel.classList.remove('active'));

  const activeBtn = document.getElementById(`btn-ind-${sector}`);
  const activePanel = document.getElementById(`panel-ind-${sector}`);

  if (activeBtn) activeBtn.classList.add('active');
  if (activePanel) activePanel.classList.add('active');
}
window.switchIndustry = switchIndustry;

function initIndustryTabs() {
  window.switchIndustry = switchIndustry;
}

/* --------------------------------------------------------------------------
   8. Swiper de Casos de Uso
   -------------------------------------------------------------------------- */
function initSwiper() {
  const track = document.getElementById('swiper-track');
  const prevBtn = document.getElementById('swiper-prev');
  const nextBtn = document.getElementById('swiper-next');
  const dotsContainer = document.getElementById('swiper-dots');

  if (!track) return;

  const slides = track.querySelectorAll('.case-slide');
  if (!slides.length) return;

  let currentIndex = 0;
  const totalSlides = slides.length;

  function getVisibleCount() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 1.2;
    return 2;
  }

  function getMaxIndex() {
    const visible = getVisibleCount();
    return Math.max(0, Math.ceil(totalSlides - visible));
  }

  // Create dots
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    const maxIdx = getMaxIndex();
    for (let i = 0; i <= maxIdx; i++) {
      const dot = document.createElement('div');
      dot.className = `swiper-dot ${i === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll('.swiper-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });
  }

  function goToSlide(index) {
    const maxIdx = getMaxIndex();
    currentIndex = Math.max(0, Math.min(index, maxIdx));
    const slideWidth = slides[0].offsetWidth + 24; // width + gap
    track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    updateDots();
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToSlide(currentIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goToSlide(currentIndex + 1);
    });
  }

  window.addEventListener('resize', () => {
    goToSlide(currentIndex);
  });
}

/* --------------------------------------------------------------------------
   9. Modal «Desbloquear un Flujo»
   -------------------------------------------------------------------------- */
function initModal() {
  const modal = document.getElementById('cta-modal');
  const closeBtn = document.getElementById('modal-close');
  const openButtons = [
    document.getElementById('open-cta-modal'),
    document.getElementById('hero-primary-cta'),
    document.getElementById('footer-cta-btn'),
    document.getElementById('cta-bottom-btn')
  ];

  window.closeModal = function() {
    if (!modal) return;
    modal.classList.remove('active', 'open');
    modal.setAttribute('aria-hidden', 'true');
  };

  window.openModal = function(presetName) {
    if (!modal) return;
    modal.classList.add('active', 'open');
    modal.setAttribute('aria-hidden', 'false');

    const sectorSelect = document.getElementById('form-sector');
    if (sectorSelect && presetName) {
      const lower = presetName.toLowerCase();
      if (lower.includes('starter') && sectorSelect.querySelector('option[value="starter"]')) {
        sectorSelect.value = 'starter';
      } else if (lower.includes('enterprise') && sectorSelect.querySelector('option[value="enterprise"]')) {
        sectorSelect.value = 'enterprise';
      } else if ((lower.includes('mission') || lower.includes('misión') || lower.includes('critica')) && sectorSelect.querySelector('option[value="mision-critica"]')) {
        sectorSelect.value = 'mision-critica';
      }
    }

    const caseInput = document.getElementById('form-case');
    if (caseInput && presetName && !caseInput.value) {
      const isSpanish = window.location.pathname.includes('/es/') || window.location.pathname.endsWith('/es');
      caseInput.placeholder = isSpanish ? `Interés en: ${presetName}. Describe tu operativa...` : `Interest in: ${presetName}. Describe your workflow...`;
    }
  };

  openButtons.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.openModal();
      });
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      window.closeModal();
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      window.closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && (modal.classList.contains('active') || modal.classList.contains('open'))) {
      window.closeModal();
    }
  });
}

// Envío de leads al webhook inyectado por CI (Apps Script "VALNATIR Leads").
// Sin webhook configurado NO se simula el éxito: se avisa en consola y el
// formulario muestra el correo de contacto.
function sendLead(payload, onDone) {
  const endpoint = window.VALNATIR_LEADS_WEBHOOK || '';
  if (!endpoint) {
    console.warn('[Leads] VALNATIR_LEADS_WEBHOOK no configurado; el formulario no se ha enviado.');
    if (onDone) onDone(false);
    return;
  }
  payload.hp = document.getElementById('lead-hp')?.value || '';
  payload.elapsed_ms = Math.round(performance.now());
  fetch(endpoint, { method: 'POST', body: JSON.stringify(payload), mode: 'no-cors' })
    .then(() => { if (onDone) onDone(true); })
    .catch((err) => { console.warn('[Leads] Error de envío:', err); if (onDone) onDone(false); });
}
window.sendLead = sendLead;

function handleFormSubmit(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('submit-btn');
  if (!submitBtn) return;

  const isSpanish = window.location.pathname.includes('/es/') || window.location.pathname.endsWith('/es');

  // RGPD: Validación obligatoria de la casilla de consentimiento
  const consentBox = document.getElementById('form-consent');
  if (consentBox && !consentBox.checked) {
    alert(isSpanish ? 'Debe aceptar la Política de Privacidad para continuar.' : 'You must accept the Privacy Policy to proceed.');
    consentBox.focus();
    return;
  }

  submitBtn.innerText = isSpanish ? 'Procesando solicitud...' : 'Processing request...';
  submitBtn.disabled = true;

  // Trazabilidad y demostrabilidad del consentimiento (RGPD Art. 7.1)
  const payload = {
    form: 'pilot',
    name: document.getElementById('form-name')?.value || '',
    email: document.getElementById('form-email')?.value || '',
    company: document.getElementById('form-company')?.value || '',
    sector: document.getElementById('form-sector')?.value || '',
    case: document.getElementById('form-case')?.value || '',
    consent: consentBox ? consentBox.checked : true,
    consent_timestamp: new Date().toISOString(),
    consent_text_version: '2026-09-18-v1',
    consent_text: isSpanish 
      ? 'He leído y acepto la Política de Privacidad y consiento el tratamiento de mis datos para atender mi solicitud.'
      : 'I have read and accept the Privacy Policy and consent to the processing of my data to handle my request.',
    page_url: window.location.href,
    lang: isSpanish ? 'es' : 'en'
  };

  const showSuccessModal = () => {
    const modalBox = document.querySelector('.modal-box, .modal-window');
    if (modalBox) {
      modalBox.innerHTML = `
        <div style="text-align: center; padding: 24px 0;">
          <div style="font-size: 3rem; margin-bottom: 16px; color: var(--accent);">✓</div>
          <h3 style="font-size: 1.8rem; margin-bottom: 12px; color: var(--text);">
            ${isSpanish ? 'Solicitud de Piloto Recibida' : 'Pilot Sandbox Request Received'}
          </h3>
          <p style="color: var(--text-muted); font-size: 1rem; line-height: 1.6; margin-bottom: 24px;">
            ${isSpanish 
              ? 'Un arquitecto de soluciones de VALNATIR contactará contigo en menos de 24 horas laborables para coordinar el despliegue del sandbox en 48 horas.'
              : 'A VALNATIR solutions architect will reach out within 24 business hours to coordinate your 48-hour pilot sandbox deployment.'}
          </p>
          <button class="btn btn-primary" onclick="window.closeModal()">
            ${isSpanish ? 'Cerrar ventana' : 'Close window'}
          </button>
        </div>
      `;
    }
  };

  const showFailureNotice = () => {
    submitBtn.disabled = false;
    submitBtn.innerText = isSpanish ? 'Solicitar Sandbox Piloto' : 'Request Pilot Sandbox';
    alert(isSpanish
      ? 'No hemos podido registrar tu solicitud. Escríbenos a info@valnatir.com y te atenderemos.'
      : 'We could not register your request. Please email info@valnatir.com and we will get back to you.');
  };

  sendLead(payload, (ok) => (ok ? showSuccessModal() : showFailureNotice()));
}
window.handleFormSubmit = handleFormSubmit;

/* --------------------------------------------------------------------------
   10. Menú Móvil
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const toggle = document.getElementById('mobile-toggle');
  const nav = document.getElementById('main-nav');

  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const willOpen = !nav.classList.contains('open');
    nav.classList.toggle('open');
    toggle.classList.toggle('active');
    if (!willOpen) {
      nav.querySelectorAll('.nav-item-dropdown').forEach(d => {
        d.classList.remove('is-open');
        const toggleBtn = d.querySelector('.dropdown-toggle');
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
      });
    }
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      nav.classList.remove('open');
      toggle.classList.remove('active');
      nav.querySelectorAll('.nav-item-dropdown').forEach(d => {
        d.classList.remove('is-open');
        const toggleBtn = d.querySelector('.dropdown-toggle');
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
      });

      const href = link.getAttribute('href');
      if (!href) return;

      const currentPath = window.location.pathname.split('/').pop() || 'index.html';
      const isCurrentPage = href === currentPath || href === `./${currentPath}` || (currentPath === 'index.html' && (href === './' || href === 'index.html'));

      if (isCurrentPage) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Global smooth scroll for in-page anchors
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#' || targetId === '#top') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      try {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      } catch (err) {
        // Fallback for non-standard selector
      }
    });
  });
}

/* --------------------------------------------------------------------------
   11. Multi-Framework Interactive Compliance Switcher
   -------------------------------------------------------------------------- */
function initFrameworkTabs() {
  const tabs = document.querySelectorAll('.f-tab');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const framework = tab.dataset.framework;
      if (!framework) return;

      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      document.querySelectorAll('.framework-panel').forEach(panel => {
        panel.classList.remove('active');
      });
      const targetPanel = document.getElementById(`fpanel-${framework}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   12. Dropdown Component (Variante 2B - V4)
   -------------------------------------------------------------------------- */
function initDropdowns() {
  document.querySelectorAll('.dropdown-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const parent = btn.closest('.nav-item-dropdown');
      if (!parent) return;
      const isOpen = parent.classList.contains('is-open');
      
      document.querySelectorAll('.nav-item-dropdown').forEach(d => {
        if (d !== parent) {
          d.classList.remove('is-open');
          const toggle = d.querySelector('.dropdown-toggle');
          if (toggle) toggle.setAttribute('aria-expanded', 'false');
        }
      });

      if (isOpen) {
        parent.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        parent.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item-dropdown')) {
      document.querySelectorAll('.nav-item-dropdown').forEach(d => {
        d.classList.remove('is-open');
        const toggle = d.querySelector('.dropdown-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.nav-item-dropdown').forEach(d => {
        d.classList.remove('is-open');
        const toggle = d.querySelector('.dropdown-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      });
    }
  });
}

