/* ==========================================================================
   VALNATIR · Lógica Interactiva y Micro-interacciones de Alto Calibre (Estilo WAM)
   ========================================================================== */

function bootstrapValnatir() {
  const fns = [
    initCursor, initHeaderScroll, initScrollReveal, initHeroReel,
    initLangSwitcher, initComparisonTabs, initIndustryTabs, initSwiper,
    initModal, initMobileMenu, initFrameworkTabs, initDropdowns,
    initReviewMode
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

function handleFormSubmit(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('submit-btn');
  if (!submitBtn) return;

  const isSpanish = window.location.pathname.includes('/es/') || window.location.pathname.endsWith('/es');
  submitBtn.innerText = isSpanish ? 'Procesando solicitud...' : 'Processing request...';
  submitBtn.disabled = true;

  setTimeout(() => {
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
  }, 800);
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



/* ==========================================================================
   13. Modo Review y Generador de Patchnotes (Client-Side, Non-Destructive)
   ========================================================================== */
function initReviewMode() {
  const urlParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash || '';
  const isReviewUrl = (urlParams.has('mode') && urlParams.get('mode') === 'review') ||
                      urlParams.has('review') ||
                      urlParams.has('feedback') ||
                      hash.includes('review');

  let isStoredActive = false;
  try {
    isStoredActive = localStorage.getItem('valnatir_review_active') === 'true';
  } catch(e) {}

  let isReviewActive = false;

  
  // Sincronización con Google Sheets (VALNATIR Web Review - 10 Columnas)
  const DEFAULT_SHEETS_WEBHOOK = 'https://script.google.com/macros/s/AKfycbyfPTJ6LfG4sb6dEYT2yZ6MAUBc2fpt82q59BglAELJjUkUt4LYK0kVOCdPbMlyhpTG9w/exec';

  function getSheetsWebhookUrl() {
    return localStorage.getItem('valnatir_sheets_webhook') || DEFAULT_SHEETS_WEBHOOK;
  }

  function setSheetsWebhookUrl(url) {
    if (url) {
      localStorage.setItem('valnatir_sheets_webhook', url.trim());
    } else {
      localStorage.removeItem('valnatir_sheets_webhook');
    }
  }

  function sendToGoogleSheets(note) {
    const webhookUrl = getSheetsWebhookUrl();
    if (!webhookUrl) return;

    try {
      fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note)
      }).then(() => {
        console.log('✅ Nota enviada a Google Sheets');
      }).catch(err => {
        console.warn('Error al enviar a Google Sheets:', err);
      });
    } catch(e) {
      console.warn('Excepción al conectar con Google Sheets:', e);
    }
  }

  function getNotes() {
    try {
      return JSON.parse(localStorage.getItem('valnatir_patchnotes') || '[]');
    } catch(e) {
      return [];
    }
  }

  function saveNotes(notes) {
    try {
      localStorage.setItem('valnatir_patchnotes', JSON.stringify(notes));
    } catch(e) {}
    updateBadge();
  }

  // Identidad del revisor (Grupo de Control)
  const DEFAULT_REVIEWER = 'Jose / jose.perez@almawolf.com';
  function getReviewerName() {
    return localStorage.getItem('valnatir_reviewer_name') || DEFAULT_REVIEWER;
  }
  function setReviewerName(name) {
    if (name && name.trim()) {
      localStorage.setItem('valnatir_reviewer_name', name.trim());
      updateReviewerDisplay();
    }
  }

  // Estado del Inspector: 'publish' (Navegación normal) | 'inspect' (Modo Comentarios)
  let currentReviewMode = 'publish';

  function injectReviewStyles() {
    if (document.getElementById('valnatir-review-styles')) return;
    const style = document.createElement('style');
    style.id = 'valnatir-review-styles';
    style.textContent = `
      .valnatir-review-hover {
        outline: 2px dashed #5FD3B8 !important;
        outline-offset: 3px !important;
        cursor: crosshair !important;
        background-color: rgba(95, 211, 184, 0.10) !important;
        transition: outline 0.15s ease, background-color 0.15s ease;
      }
      .valnatir-has-note {
        border-bottom: 2px solid #5FD3B8 !important;
        background-color: rgba(95, 211, 184, 0.05) !important;
      }
      #valnatir-pill {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 999999;
        background: rgba(14, 18, 26, 0.94);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        color: #5FD3B8;
        border: 1px solid rgba(95, 211, 184, 0.45);
        border-radius: 30px;
        padding: 9px 18px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        display: none;
        align-items: center;
        gap: 8px;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.7);
        transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
      }
      #valnatir-pill:hover {
        transform: translateY(-2px);
        background: rgba(20, 26, 38, 0.98);
        border-color: #5FD3B8;
        color: #FFFFFF;
      }
      .v-pill-key {
        font-size: 10px;
        font-family: monospace;
        background: rgba(255, 255, 255, 0.12);
        padding: 2px 6px;
        border-radius: 6px;
        color: #94A3B8;
      }
      #valnatir-hud-toast {
        position: fixed;
        top: 32px;
        left: 50%;
        transform: translateX(-50%) translateY(-20px);
        background: rgba(14, 18, 26, 0.96);
        color: #5FD3B8;
        border: 1px solid rgba(95, 211, 184, 0.5);
        padding: 10px 22px;
        border-radius: 30px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 13px;
        font-weight: 600;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8);
        z-index: 1000000;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }
      #valnatir-hud-toast.valnatir-toast-show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
      #valnatir-dock {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 999999;
        display: flex;
        align-items: center;
        gap: 10px;
        background: rgba(14, 18, 26, 0.96);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border: 1px solid rgba(95, 211, 184, 0.45);
        border-radius: 40px;
        padding: 8px 16px;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.75);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #F3F5F7;
        font-size: 13px;
        animation: v-dock-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes v-dock-in {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .v-dock-status {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 12px;
      }
      .v-status-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #64748B;
        transition: all 0.25s ease;
      }
      .v-status-dot.active-inspect {
        background: #5FD3B8;
        box-shadow: 0 0 10px #5FD3B8;
        animation: v-pulse 2s infinite;
      }
      @keyframes v-pulse {
        0% { transform: scale(0.95); opacity: 0.8; }
        50% { transform: scale(1.15); opacity: 1; }
        100% { transform: scale(0.95); opacity: 0.8; }
      }
      .v-mode-switch {
        display: flex;
        align-items: center;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 20px;
        padding: 2px;
        gap: 2px;
      }
      .v-mode-tab {
        background: transparent;
        border: none;
        color: #94A3B8;
        padding: 5px 11px;
        border-radius: 16px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.18s ease;
      }
      .v-mode-tab.active {
        background: #5FD3B8;
        color: #0E121A;
        box-shadow: 0 2px 8px rgba(95, 211, 184, 0.35);
      }
      .v-reviewer-btn {
        background: rgba(95, 211, 184, 0.12) !important;
        color: #5FD3B8 !important;
        border-color: rgba(95, 211, 184, 0.3) !important;
        font-size: 11px !important;
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .v-reviewer-btn:hover {
        background: rgba(95, 211, 184, 0.25) !important;
        color: #ffffff !important;
      }
      #valnatir-dock-badge {
        background: rgba(95, 211, 184, 0.15);
        color: #5FD3B8;
        font-weight: 700;
        font-size: 11px;
        padding: 3px 9px;
        border-radius: 20px;
        border: 1px solid rgba(95, 211, 184, 0.3);
      }
      .v-dock-btn {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.14);
        color: #F3F5F7;
        padding: 5px 11px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 600;
        transition: all 0.2s ease;
      }
      .v-dock-btn:hover {
        background: #5FD3B8;
        color: #0E121A;
        border-color: #5FD3B8;
      }
      .v-dock-exit {
        background: transparent;
        border: none;
        color: #8C96A5;
        font-size: 14px;
        cursor: pointer;
        padding: 4px 6px;
        transition: color 0.15s;
      }
      .v-dock-exit:hover {
        color: #F87171;
      }
      /* Modal de Feedback */
      #valnatir-modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(5, 8, 14, 0.80);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        z-index: 1000000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      #valnatir-modal {
        background: #111620;
        border: 1px solid rgba(95, 211, 184, 0.4);
        border-radius: 18px;
        width: 100%;
        max-width: 620px;
        box-shadow: 0 30px 70px rgba(0, 0, 0, 0.85);
        color: #F3F5F7;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        padding: 24px;
        box-sizing: border-box;
        animation: v-slide-up 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes v-slide-up {
        from { opacity: 0; transform: translateY(16px); }
        to { opacity: 1; transform: translateY(0); }
      }
      #valnatir-modal h3 {
        margin: 0 0 12px 0;
        font-size: 17px;
        color: #5FD3B8;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .v-meta-tag {
        font-size: 11px;
        font-family: monospace;
        color: #8C96A5;
        background: rgba(255, 255, 255, 0.06);
        padding: 3px 8px;
        border-radius: 6px;
        font-weight: 500;
      }
      .v-label {
        display: block;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #8C96A5;
        margin: 12px 0 5px;
      }
      .v-original-text {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        padding: 9px 12px;
        font-size: 13px;
        color: #CBD5E1;
        line-height: 1.45;
        max-height: 80px;
        overflow-y: auto;
      }
      .v-input, .v-select {
        width: 100%;
        box-sizing: border-box;
        background: #171E2B;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 8px;
        color: #F3F5F7;
        font-size: 13px;
        padding: 8px 11px;
        font-family: inherit;
      }
      .v-input:focus, .v-select:focus {
        outline: none;
        border-color: #5FD3B8;
        box-shadow: 0 0 0 2px rgba(95, 211, 184, 0.2);
      }
      .v-btn-row {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
      }
      .v-btn {
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        border: none;
        transition: all 0.18s;
      }
      .v-btn-primary {
        background: #5FD3B8;
        color: #0E121A;
      }
      .v-btn-primary:hover {
        background: #4ec2a7;
      }
      .v-btn-secondary {
        background: transparent;
        color: #8C96A5;
        border: 1px solid rgba(255, 255, 255, 0.15);
      }
      .v-btn-secondary:hover {
        color: #F3F5F7;
        border-color: rgba(255, 255, 255, 0.3);
      }
    `;
    document.head.appendChild(style);
  }

  function createReviewDock() {
    if (document.getElementById('valnatir-dock')) return;

    const dock = document.createElement('div');
    dock.id = 'valnatir-dock';
    dock.innerHTML = `
      <div class="v-dock-status">
        <span class="v-status-dot" id="v-status-dot"></span>
        <span id="v-status-label">Navegando</span>
      </div>
      <div class="v-mode-switch">
        <button class="v-mode-tab active" id="v-tab-publish" title="Navegar libremente por la web">🧭 Navegar</button>
        <button class="v-mode-tab" id="v-tab-inspect" title="Activar modo comentarios / edición (Alt+C)">✍️ Comentar</button>
      </div>
      <button class="v-dock-btn v-reviewer-btn" id="v-btn-reviewer" title="Revisor actual del Grupo de Control (clic para cambiar)">👤 <span id="v-reviewer-display">${escapeHtml(getReviewerShort())}</span></button>
      <span id="valnatir-dock-badge">0 notas</span>
      <button class="v-dock-btn" id="v-btn-sheets" title="Vincular con Google Sheets">📊 Sheets</button>
      <button class="v-dock-btn" id="v-btn-export">Descargar JSON</button>
      <button class="v-dock-btn" id="v-btn-copy">Copiar Markdown</button>
      <button class="v-dock-exit" id="v-btn-exit" title="Salir de Modo Review">✕</button>
    `;
    document.body.appendChild(dock);

    updateBadge();

    // Eventos de cambio de modo Navegar vs Comentar
    document.getElementById('v-tab-publish').addEventListener('click', () => setMode('publish'));
    document.getElementById('v-tab-inspect').addEventListener('click', () => setMode('inspect'));

    // Cambiar revisor
    document.getElementById('v-btn-reviewer').addEventListener('click', () => {
      const current = getReviewerName();
      const entered = prompt('Introduce tu Nombre / Email para el Grupo de Control de Feedback:', current);
      if (entered !== null && entered.trim()) {
        setReviewerName(entered);
      }
    });

    document.getElementById('v-btn-sheets').addEventListener('click', () => {
      const current = getSheetsWebhookUrl();
      const entered = prompt('Introduce la URL del Webhook de Google Apps Script para sincronizar con Google Sheets:\n(Ejemplo: https://script.google.com/macros/s/.../exec)', current);
      if (entered !== null) {
        setSheetsWebhookUrl(entered);
        alert(entered ? '✅ Webhook de Google Sheets configurado. Las nuevas notas se enviarán automáticamente a la hoja.' : 'ℹ️ Sincronización con Google Sheets desactivada.');
      }
    });

    document.getElementById('v-btn-export').addEventListener('click', exportJSON);
    document.getElementById('v-btn-copy').addEventListener('click', copyMarkdown);
    document.getElementById('v-btn-exit').addEventListener('click', () => activateReview(false));
  }

  function showToast(msg) {
    try {
      let toast = document.getElementById('valnatir-hud-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'valnatir-hud-toast';
        document.body.appendChild(toast);
      }
      toast.textContent = msg;
      toast.classList.add('valnatir-toast-show');
      if (toast._timer && typeof clearTimeout === 'function') {
        clearTimeout(toast._timer);
      }
      if (typeof setTimeout === 'function') {
        toast._timer = setTimeout(() => {
          toast.classList.remove('valnatir-toast-show');
        }, 2200);
      }
    } catch(e) {}
  }

  function createReviewPill() {
    if (document.getElementById('valnatir-pill')) return;
    const pill = document.createElement('button');
    pill.id = 'valnatir-pill';
    pill.innerHTML = `<span>💬 Modo Review</span><span class="v-pill-key">⌥C</span>`;
    pill.title = 'Activar Modo Review y Feedback (Opción + C en Mac / Alt + C en Windows)';
    pill.addEventListener('click', () => {
      activateReview(true);
    });
    document.body.appendChild(pill);
  }

  function activateReview(active) {
    isReviewActive = !!active;
    const dock = document.getElementById('valnatir-dock');
    const pill = document.getElementById('valnatir-pill');
    if (isReviewActive) {
      try { localStorage.setItem('valnatir_review_active', 'true'); } catch(e) {}
      if (dock) dock.style.display = 'flex';
      if (pill) pill.style.display = 'none';
      setMode('inspect');
    } else {
      try { localStorage.removeItem('valnatir_review_active'); } catch(e) {}
      if (dock) dock.style.display = 'none';
      if (pill) pill.style.display = 'flex';
      setMode('publish', true);
      showToast('ℹ️ Modo Review Cerrado');
    }
  }

  function setMode(mode, silent) {
    currentReviewMode = mode;
    const tabPub = document.getElementById('v-tab-publish');
    const tabIns = document.getElementById('v-tab-inspect');
    const dot = document.getElementById('v-status-dot');
    const label = document.getElementById('v-status-label');

    if (mode === 'inspect') {
      if (tabIns) tabIns.classList.add('active');
      if (tabPub) tabPub.classList.remove('active');
      if (dot) dot.classList.add('active-inspect');
      if (label) label.textContent = 'Modo Comentarios';
      if (!silent) showToast('✍️ Modo Comentarios ACTIVO: Haz clic en cualquier texto');
    } else {
      if (tabPub) tabPub.classList.add('active');
      if (tabIns) tabIns.classList.remove('active');
      if (dot) dot.classList.remove('active-inspect');
      if (label) label.textContent = 'Navegando';
      if (currentHovered) {
        currentHovered.classList.remove('valnatir-review-hover');
        currentHovered = null;
      }
      if (!silent) showToast('🧭 Modo Navegación ACTIVO: Navega normalmente');
    }
  }

  function isOptionC(e) {
    if (!e.altKey) return false;
    return e.code === 'KeyC' || e.key === 'c' || e.key === 'C' || e.key === 'ç' || e.key === 'Ç' || e.key === '©' || e.keyCode === 67;
  }

  window.addEventListener('keydown', (e) => {
    if (isOptionC(e)) {
      e.preventDefault();
      e.stopPropagation();
      if (!isReviewActive) {
        activateReview(true);
      } else {
        setMode(currentReviewMode === 'publish' ? 'inspect' : 'publish');
      }
    }
  }, true);

  function getReviewerShort() {
    const full = getReviewerName();
    const parts = full.split(/[\/@]/);
    return parts[0].trim();
  }

  function updateReviewerDisplay() {
    const disp = document.getElementById('v-reviewer-display');
    if (disp) {
      disp.textContent = getReviewerShort();
    }
  }

  function updateBadge() {
    const notes = getNotes();
    const badge = document.getElementById('valnatir-dock-badge');
    if (badge) {
      badge.textContent = `${notes.length} nota${notes.length === 1 ? '' : 's'}`;
    }
  }

  let currentHovered = null;

  function setupInspector() {
    document.addEventListener('mouseover', (e) => {
      if (currentReviewMode !== 'inspect') return;
      if (e.target.closest('#valnatir-dock') || e.target.closest('#valnatir-modal-backdrop')) return;

      const target = getInspectableElement(e.target);
      if (target) {
        if (currentHovered && currentHovered !== target) {
          currentHovered.classList.remove('valnatir-review-hover');
        }
        currentHovered = target;
        currentHovered.classList.add('valnatir-review-hover');
      }
    }, true);

    document.addEventListener('mouseout', (e) => {
      if (currentReviewMode !== 'inspect') return;
      if (currentHovered && !currentHovered.contains(e.relatedTarget)) {
        currentHovered.classList.remove('valnatir-review-hover');
        currentHovered = null;
      }
    }, true);

    document.addEventListener('click', (e) => {
      // Si estamos en modo navegación normal ('publish'), no interferimos: los enlaces y botones navegan limpiamente
      if (currentReviewMode !== 'inspect') return;
      if (e.target.closest('#valnatir-dock') || e.target.closest('#valnatir-modal-backdrop')) return;

      const target = getInspectableElement(e.target);
      if (target) {
        e.preventDefault();
        e.stopPropagation();
        openModal(target);
      }
    }, true);
  }

  function getInspectableElement(el) {
    if (!el || el === document.body || el === document.documentElement) return null;
    const inspectableTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'A', 'LI', 'STRONG', 'EM', 'BUTTON', 'TH', 'TD'];
    if (inspectableTags.includes(el.tagName)) {
      const text = el.innerText ? el.innerText.trim() : '';
      if (text.length > 1 && text.length < 1500) return el;
    }
    return el.parentElement ? getInspectableElement(el.parentElement) : null;
  }

  function openModal(el) {
    const existing = document.getElementById('valnatir-modal-backdrop');
    if (existing) existing.remove();

    const textOriginal = (el.innerText || '').trim();
    const tagName = el.tagName.toLowerCase();
    const pathParts = window.location.pathname.split('/');
    const pageName = pathParts[pathParts.length - 1] || 'index.html';
    const parentContext = el.closest('[data-dropdown]') ? `Dropdown: ${el.closest('[data-dropdown]').getAttribute('data-dropdown')}` : (el.closest('header') ? 'Header' : 'Contenido');

    const backdrop = document.createElement('div');
    backdrop.id = 'valnatir-modal-backdrop';
    backdrop.innerHTML = `
      <div id="valnatir-modal">
        <h3>
          <span>📝 Sugerir Cambio / Nota de Feedback</span>
          <span class="v-meta-tag">${pageName} · &lt;${tagName}&gt;</span>
        </h3>
        
        <div style="display:flex; gap:12px; margin-top:4px;">
          <div style="flex:1;">
            <span class="v-label">👤 Revisor / Usuario (Grupo de Control)</span>
            <input class="v-input" id="v-input-user" value="${escapeHtml(getReviewerName())}" placeholder="Nombre / Email" />
          </div>
          <div style="width:140px;">
            <span class="v-label">Situación</span>
            <select class="v-select" id="v-input-status">
              <option value="Plan" selected>Plan</option>
              <option value="Wip">Wip</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        <span class="v-label">Texto Actual en la Web</span>
        <div class="v-original-text">${escapeHtml(textOriginal)}</div>

        <span class="v-label">Tu Propuesta de Texto (Opcional)</span>
        <textarea class="v-input" id="v-input-prop" rows="3" placeholder="Si tienes una redacción alternativa, escríbela aquí...">${escapeHtml(textOriginal)}</textarea>

        <span class="v-label">Categoría del Feedback</span>
        <select class="v-select" id="v-input-cat">
          <option value="Tono Editorial / Copywriting">Tono Editorial / Copywriting</option>
          <option value="Compliance / Legal">Compliance / Legal / Precisión Normativa</option>
          <option value="Claridad Comercial / C-Level">Claridad Comercial / C-Level</option>
          <option value="Diseño / UI / Layout">Diseño / UI / Layout</option>
          <option value="Otro">Otro / Sugerencia General</option>
        </select>

        <span class="v-label">Comentario o Justificación</span>
        <textarea class="v-input" id="v-input-comm" rows="2" placeholder="Explica brevemente por qué sugieres este cambio..."></textarea>

        <span class="v-label">Resolución / Observaciones (Opcional)</span>
        <input class="v-input" id="v-input-resol" placeholder="Notas de resolución u observaciones..." />

        <div class="v-btn-row">
          <button class="v-btn v-btn-secondary" id="v-cancel-modal">Cancelar</button>
          <button class="v-btn v-btn-primary" id="v-save-modal">Guardar Nota</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);

    document.getElementById('v-cancel-modal').addEventListener('click', () => backdrop.remove());
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) backdrop.remove();
    });

    document.getElementById('v-save-modal').addEventListener('click', () => {
      const reviewer = document.getElementById('v-input-user').value.trim() || getReviewerName();
      setReviewerName(reviewer);

      const status = document.getElementById('v-input-status').value || 'Plan';
      const resol = document.getElementById('v-input-resol').value.trim();
      const propText = document.getElementById('v-input-prop').value.trim();
      const cat = document.getElementById('v-input-cat').value;
      const comm = document.getElementById('v-input-comm').value.trim();

      const newNote = {
        id: 'NOTE_' + Date.now(),
        fecha: new Date().toISOString(),
        usuario: reviewer,
        pagina: pageName,
        contexto: parentContext,
        tag: tagName,
        texto_original: textOriginal,
        texto_propuesto: propText !== textOriginal ? propText : '',
        categoria: cat,
        comentario: comm || 'Sin comentario adicional',
        situacion: status,
        resolucion: resol
      };

      const notes = getNotes();
      notes.push(newNote);
      saveNotes(notes);

      el.classList.add('valnatir-has-note');
      backdrop.remove();

      // Enviar a Google Sheets si hay webhook configurado
      sendToGoogleSheets(newNote);

      alert(`✅ Nota guardada con éxito (${notes.length} acumuladas).`);
    });
  }



  function exportJSON() {
    const notes = getNotes();
    if (notes.length === 0) {
      alert('Aún no has registrado ninguna nota. Haz clic sobre cualquier texto para sugerir cambios.');
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      proyecto: "VALNATIR / MCCP Web - Patchnotes",
      version_base: "v3",
      revisor_predeterminado: getReviewerName(),
      fecha_exportacion: new Date().toISOString(),
      total_notas: notes.length,
      notas: notes
    }, null, 2));

    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `valnatir_patchnotes_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function copyMarkdown() {
    const notes = getNotes();
    if (notes.length === 0) {
      alert('Aún no has registrado ninguna nota.');
      return;
    }
    let md = `# Patchnotes y Feedback Editorial · VALNATIR\n\n`;
    md += `* **Fecha**: ${new Date().toLocaleString()}\n`;
    md += `* **Revisor Predeterminado**: ${getReviewerName()}\n`;
    md += `* **Total Notas**: ${notes.length}\n\n`;
    md += `| Nº | Revisor | Situación | Página | Contexto | Categoría | Texto Original | Propuesta / Comentario | Observaciones |\n`;
    md += `|:---|:---|:---|:---|:---|:---|:---|:---|:---|\n`;
    notes.forEach((n, idx) => {
      const user = n.usuario || DEFAULT_REVIEWER;
      const sit = n.situacion || 'Plan';
      const prop = n.texto_propuesto ? `**Prop:** "${n.texto_propuesto}"<br>` : '';
      const comm = `*Nota:* ${n.comentario}`;
      const obs = n.resolucion || '-';
      md += `| ${idx+1} | ${user.replace(/\|/g, '\\|')} | **${sit}** | \`${n.pagina}\` | ${n.contexto} | ${n.categoria} | "${n.texto_original.replace(/\|/g, '\\|')}" | ${(prop + comm).replace(/\|/g, '\\|')} | ${obs.replace(/\|/g, '\\|')} |\n`;
    });

    navigator.clipboard.writeText(md).then(() => {
      alert('📋 ¡Resumen en Markdown copiado al portapapeles!');
    }).catch(() => {
      prompt('Copia el resumen manualmente:', md);
    });
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // Arranque del sistema de Review y Feedback
  injectReviewStyles();
  createReviewPill();
  createReviewDock();
  setupInspector();

  if (isReviewUrl || isStoredActive) {
    activateReview(true);
  } else {
    activateReview(false);
  }
}
