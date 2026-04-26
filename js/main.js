/* ============================================
   HAVEN — MAIN JAVASCRIPT
   ============================================ */

'use strict';

/* ---- NAVBAR ---- */
(function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

  // Scroll shadow
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar && navbar.classList.add('scrolled');
    } else {
      navbar && navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // Hamburger toggle
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Close on link click
    mobileLinks.forEach(link => {
      link.addEventListener('click', closeMobileNav);
    });

    // Close on outside tap
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && !mobileNav.contains(e.target)) {
        closeMobileNav();
      }
    });
  }

  function closeMobileNav() {
    hamburger && hamburger.classList.remove('open');
    mobileNav && mobileNav.classList.remove('open');
    document.body.style.overflow = '';
    hamburger && hamburger.setAttribute('aria-expanded', 'false');
  }
})();

/* ---- SCROLL TO TOP ---- */
(function initScrollTop() {
  const btn = document.querySelector('.scroll-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ---- SCROLL ANIMATIONS ---- */
(function initScrollAnimations() {
  const els = document.querySelectorAll('.fade-up');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach((el, i) => {
    if (!el.dataset.delay) {
      el.dataset.delay = Math.min(i * 80, 400);
    }
    observer.observe(el);
  });
})();

/* ---- WISHLIST ---- */
(function initWishlist() {
  let wishlist = JSON.parse(localStorage.getItem('haven_wishlist') || '[]');

  function saveWishlist() {
    localStorage.setItem('haven_wishlist', JSON.stringify(wishlist));
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.card-wishlist');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();

    const id = btn.dataset.id;
    const idx = wishlist.indexOf(id);
    if (idx === -1) {
      wishlist.push(id);
      btn.classList.add('active');
      btn.innerHTML = '<i class="bi bi-heart-fill"></i>';
    } else {
      wishlist.splice(idx, 1);
      btn.classList.remove('active');
      btn.innerHTML = '<i class="bi bi-heart"></i>';
    }
    saveWishlist();
  });

  // Restore on page load
  document.querySelectorAll('.card-wishlist').forEach(btn => {
    const id = btn.dataset.id;
    if (wishlist.includes(id)) {
      btn.classList.add('active');
      btn.innerHTML = '<i class="bi bi-heart-fill"></i>';
    }
  });
})();

/* ---- COUNT UP ANIMATION (Homepage stats) ---- */
(function initCountUp() {
  const stats = document.querySelectorAll('[data-count]');
  if (!stats.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1500;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(eased * target);
        el.textContent = value.toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  stats.forEach(el => observer.observe(el));
})();

/* ---- FEATURED TABS (Homepage) ---- */
(function initFeaturedTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  if (!tabBtns.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('[data-tab-content]').forEach(panel => {
        panel.classList.toggle('hidden', panel.dataset.tabContent !== target);
      });
    });
  });
})();

/* ---- QUICK FILTER PILLS (Homepage) ---- */
(function initQuickFilters() {
  const pills = document.querySelectorAll('.search-quick-filters .tag');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.toggle('active');
    });
  });
})();

/* ============================================
   LISTINGS PAGE
   ============================================ */
(function initListingsPage() {
  if (!document.querySelector('.listings-layout')) return;

  // Mobile filter toggle
  const filterToggle = document.querySelector('.mobile-filter-toggle');
  const filterSidebar = document.querySelector('.filter-sidebar');
  const filterOverlay = document.createElement('div');
  filterOverlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:199;display:none;';
  document.body.appendChild(filterOverlay);

  const closeBtn = filterSidebar ? filterSidebar.querySelector('.filter-close-btn') : null;

  if (filterToggle && filterSidebar) {
    filterToggle.addEventListener('click', () => {
      filterSidebar.classList.add('open');
      filterOverlay.style.display = 'block';
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.style.display = 'block';
    });

    filterOverlay.addEventListener('click', closeFilters);
    if (closeBtn) closeBtn.addEventListener('click', closeFilters);
  }

  function closeFilters() {
    filterSidebar && filterSidebar.classList.remove('open');
    filterOverlay.style.display = 'none';
    document.body.style.overflow = '';
    if (closeBtn) closeBtn.style.display = 'none';
  }

  // Price range slider
  const priceSlider = document.getElementById('priceRange');
  const priceDisplay = document.getElementById('priceDisplay');

  if (priceSlider && priceDisplay) {
    priceSlider.addEventListener('input', () => {
      const val = parseInt(priceSlider.value);
      const formatted = val >= 1000000000
        ? '₦1B+'
        : val >= 1000000
        ? '₦' + (val / 1000000).toFixed(0) + 'M'
        : '₦' + val.toLocaleString();
      priceDisplay.textContent = 'Up to ' + formatted;
    });
  }

  // Size range slider
  const sizeSlider = document.getElementById('sizeRange');
  const sizeDisplay = document.getElementById('sizeDisplay');

  if (sizeSlider && sizeDisplay) {
    sizeSlider.addEventListener('input', () => {
      sizeDisplay.textContent = 'Up to ' + sizeSlider.value + ' sqm';
    });
  }

  // Bedroom / Bathroom filter pills
  document.querySelectorAll('.filter-pill-group').forEach(group => {
    group.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        group.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      });
    });
  });

  // Clear all
  const clearBtn = document.querySelector('.filter-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      document.querySelectorAll('.filter-sidebar input[type="checkbox"]').forEach(cb => cb.checked = false);
      document.querySelectorAll('.filter-sidebar input[type="radio"]').forEach(rb => rb.checked = false);
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.filter-pill[data-value="any"]').forEach(p => p.classList.add('active'));
      if (priceSlider) { priceSlider.value = priceSlider.max; priceSlider.dispatchEvent(new Event('input')); }
      if (sizeSlider) { sizeSlider.value = sizeSlider.max; sizeSlider.dispatchEvent(new Event('input')); }
      applyFilters();
    });
  }

  // Apply filters
  const applyBtn = document.querySelector('.apply-filters-btn');
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      applyFilters();
      closeFilters();
    });
  }

  function applyFilters() {
    const cards = document.querySelectorAll('.listings-grid .property-card');
    let visible = 0;

    // Get active beds filter
    const activeBed = document.querySelector('.filter-pill-group[data-filter="beds"] .filter-pill.active');
    const bedFilter = activeBed ? activeBed.dataset.value : 'any';

    // Get listing type
    const listingType = document.querySelector('.filter-sidebar input[name="listingType"]:checked');
    const typeFilter = listingType ? listingType.value : 'both';

    cards.forEach(card => {
      let show = true;

      // Bed filter
      if (bedFilter && bedFilter !== 'any') {
        const beds = parseInt(card.dataset.beds || 0);
        if (bedFilter === '5+') { if (beds < 5) show = false; }
        else if (beds !== parseInt(bedFilter)) show = false;
      }

      // Type filter
      if (typeFilter !== 'both') {
        const cardType = card.dataset.listingType;
        if (cardType && cardType !== typeFilter) show = false;
      }

      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    // Update count
    const countEl = document.querySelector('.listings-count strong');
    if (countEl) countEl.textContent = visible;

    // No results
    let noResults = document.querySelector('.no-results');
    if (visible === 0) {
      if (!noResults) {
        noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.innerHTML = '<h3>No properties found</h3><p>Try adjusting your filters to see more results.</p>';
        document.querySelector('.listings-grid').appendChild(noResults);
      }
    } else {
      if (noResults) noResults.remove();
    }
  }

  // Sort
  const sortSelect = document.querySelector('.sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      const grid = document.querySelector('.listings-grid');
      const cards = [...grid.querySelectorAll('.property-card')];
      const val = sortSelect.value;

      cards.sort((a, b) => {
        const pa = parseFloat(a.dataset.price || 0);
        const pb = parseFloat(b.dataset.price || 0);
        if (val === 'price-asc') return pa - pb;
        if (val === 'price-desc') return pb - pa;
        return 0;
      });

      cards.forEach(card => grid.appendChild(card));
    });
  }

  // View toggle
  const gridBtn = document.querySelector('.view-btn[data-view="grid"]');
  const listBtn = document.querySelector('.view-btn[data-view="list"]');
  const listingsGrid = document.querySelector('.listings-grid');

  const savedView = localStorage.getItem('haven_view') || 'grid';
  if (savedView === 'list' && listingsGrid) {
    listingsGrid.classList.add('list-view');
    listBtn && listBtn.classList.add('active');
    gridBtn && gridBtn.classList.remove('active');
  }

  if (gridBtn && listBtn && listingsGrid) {
    gridBtn.addEventListener('click', () => {
      listingsGrid.classList.remove('list-view');
      gridBtn.classList.add('active');
      listBtn.classList.remove('active');
      localStorage.setItem('haven_view', 'grid');
    });

    listBtn.addEventListener('click', () => {
      listingsGrid.classList.add('list-view');
      listBtn.classList.add('active');
      gridBtn.classList.remove('active');
      localStorage.setItem('haven_view', 'list');
    });
  }
})();

/* ============================================
   PROPERTY DETAIL PAGE
   ============================================ */
(function initPropertyPage() {
  if (!document.querySelector('.property-tabs')) return;

  // Tabs
  const tabBtns = document.querySelectorAll('.property-tab-btn');
  const tabPanels = document.querySelectorAll('.property-tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById('tab-' + target);
      if (panel) panel.classList.add('active');
    });
  });

  // Gallery thumbnails
  const thumbs = document.querySelectorAll('.gallery-thumb');
  const mainImg = document.querySelector('.gallery-main img');

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      if (mainImg) {
        mainImg.src = thumb.querySelector('img').src;
        mainImg.alt = thumb.querySelector('img').alt;
      }
    });
  });
})();

/* ---- LIGHTBOX ---- */
(function initLightbox() {
  const overlay = document.querySelector('.lightbox-overlay');
  if (!overlay) return;

  const lightboxImg = overlay.querySelector('.lightbox-img-wrap img');
  const closeBtn = overlay.querySelector('.lightbox-close');
  const prevBtn = overlay.querySelector('.lightbox-prev');
  const nextBtn = overlay.querySelector('.lightbox-next');
  const counter = overlay.querySelector('.lightbox-counter');

  const galleryImages = [...document.querySelectorAll('.gallery-thumb img, .gallery-main img')];
  // Deduplicate
  const seen = new Set();
  const images = [];
  document.querySelectorAll('.gallery-thumb').forEach(t => {
    const src = t.querySelector('img').getAttribute('src');
    if (!seen.has(src)) { seen.add(src); images.push({ src, alt: t.querySelector('img').alt || '' }); }
  });

  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    showImage(currentIndex);
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function showImage(index) {
    if (!images.length) return;
    currentIndex = (index + images.length) % images.length;
    lightboxImg.src = images[currentIndex].src;
    lightboxImg.alt = images[currentIndex].alt;
    if (counter) counter.textContent = (currentIndex + 1) + ' / ' + images.length;
  }

  // Trigger buttons
  document.querySelectorAll('.gallery-view-all, .open-lightbox').forEach(btn => {
    btn.addEventListener('click', () => openLightbox(0));
  });

  document.querySelectorAll('.gallery-thumb').forEach((thumb, i) => {
    thumb.addEventListener('click', () => openLightbox(i));
  });

  closeBtn && closeBtn.addEventListener('click', closeLightbox);
  prevBtn && prevBtn.addEventListener('click', () => showImage(currentIndex - 1));
  nextBtn && nextBtn.addEventListener('click', () => showImage(currentIndex + 1));

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
    if (e.key === 'Escape') closeLightbox();
  });

  // Touch/swipe
  let touchStartX = 0;
  overlay.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  overlay.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) showImage(currentIndex + 1);
      else showImage(currentIndex - 1);
    }
  }, { passive: true });
})();

/* ---- AGENTS PAGE FILTERS ---- */
(function initAgentsFilter() {
  const filterBtns = document.querySelectorAll('.agents-filter-bar .tag');
  const agentCards = document.querySelectorAll('.agent-card-full');
  const searchInput = document.querySelector('.agents-search input');

  if (!filterBtns.length && !searchInput) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active', 'tag-dark'));
      btn.classList.add('active', 'tag-dark');
      const filter = btn.dataset.filter || 'all';
      filterAgents(filter, searchInput ? searchInput.value : '');
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const activeFilter = document.querySelector('.agents-filter-bar .tag.active');
      const filter = activeFilter ? (activeFilter.dataset.filter || 'all') : 'all';
      filterAgents(filter, searchInput.value);
    });
  }

  function filterAgents(filter, search) {
    agentCards.forEach(card => {
      const name = (card.dataset.name || '').toLowerCase();
      const loc = (card.dataset.location || '').toLowerCase();
      const spec = (card.dataset.specialty || '').toLowerCase();
      const searchLower = search.toLowerCase();

      const matchesFilter = filter === 'all'
        || loc.includes(filter.toLowerCase())
        || spec.includes(filter.toLowerCase());

      const matchesSearch = !searchLower
        || name.includes(searchLower)
        || loc.includes(searchLower)
        || spec.includes(searchLower);

      card.style.display = (matchesFilter && matchesSearch) ? '' : 'none';
    });
  }
})();

/* ---- FORM VALIDATION ---- */
(function initForms() {
  document.querySelectorAll('form[data-validate]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      // Clear previous errors
      form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

      // Check required fields
      form.querySelectorAll('[required]').forEach(field => {
        if (!field.value.trim()) {
          field.classList.add('error');
          valid = false;
        }
      });

      // Email validation
      const emailFields = form.querySelectorAll('input[type="email"]');
      emailFields.forEach(field => {
        if (field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
          field.classList.add('error');
          valid = false;
        }
      });

      if (!valid) return;

      // Success
      const successMsg = form.nextElementSibling;
      if (successMsg && successMsg.classList.contains('form-success')) {
        form.style.display = 'none';
        successMsg.style.display = 'block';
      } else {
        form.innerHTML = `
          <div class="form-success" style="text-align:center;padding:32px 0;">
            <i class="bi bi-check-circle" style="font-size:2rem;color:#16A34A;display:block;margin-bottom:12px;"></i>
            <h3 style="font-family:'DM Serif Display',serif;margin-bottom:8px;">Message Sent!</h3>
            <p style="font-family:'DM Sans',sans-serif;font-weight:300;color:#6B6B6B;">Thank you! We'll be in touch within 24 hours.</p>
          </div>`;
      }
    });

    // Clear error on input
    form.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('input', () => field.classList.remove('error'));
    });
  });
})();

/* ---- SEARCH FORM (Homepage + Listings hero) ---- */
(function initSearchForm() {
  const searchForms = document.querySelectorAll('.search-bar');
  searchForms.forEach(form => {
    const btn = form.querySelector('.search-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const location = form.querySelector('input[name="location"]');
      const params = new URLSearchParams();
      if (location && location.value) params.set('location', location.value);
      window.location.href = 'listings.html' + (params.toString() ? '?' + params : '');
    });
  });

  // Split hero search button
  const heroSearch = document.querySelector('.split-hero-search');
  if (heroSearch) {
    const btn = heroSearch.querySelector('.search-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        const loc = heroSearch.querySelector('input[name="location"]');
        const params = new URLSearchParams();
        if (loc && loc.value) params.set('location', loc.value);
        window.location.href = 'listings.html' + (params.toString() ? '?' + params : '');
      });
    }
  }
})();

/* ---- HORIZONTAL SCROLL ARROWS ---- */
(function initScrollArrows() {
  document.querySelectorAll('.scroll-arrow').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const container = document.getElementById(targetId);
      if (!container) return;
      const dir = btn.classList.contains('scroll-arrow--prev') ? -1 : 1;
      const cardWidth = container.querySelector('.property-card, .agent-card');
      const scrollAmount = cardWidth ? cardWidth.offsetWidth + 24 : 324;
      container.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
    });
  });
})();

/* ---- TESTIMONIAL CAROUSEL ---- */
(function initTestimonialCarousel() {
  const track = document.querySelector('.carousel-track');
  if (!track) return;

  const slides = Array.from(track.querySelectorAll('.carousel-slide'));
  const dots = Array.from(document.querySelectorAll('.carousel-dot'));
  if (!slides.length) return;

  let current = 0;
  let timer = null;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current] && dots[current].classList.remove('active');
    dots[current] && dots[current].setAttribute('aria-selected', 'false');
    current = ((index % slides.length) + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current] && dots[current].classList.add('active');
    dots[current] && dots[current].setAttribute('aria-selected', 'true');
  }

  function startAuto() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 5000);
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(parseInt(dot.dataset.index, 10));
      startAuto();
    });
  });

  startAuto();
})();
