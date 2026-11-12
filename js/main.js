/* ============================================================
   Luxury Houseboat – Main JavaScript
   Vanilla JS · ES6+ · No dependencies
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------
     1. PRELOADER
     ---------------------------------------------------------- */
  const preloader = document.getElementById('preloader');
  if (preloader) {
    // Keep the handoff quick so the page becomes usable almost immediately.
    setTimeout(() => {
      preloader.style.transition = 'opacity 0.35s ease';
      preloader.style.opacity = '0';
      // Remove from DOM once the transition ends
      preloader.addEventListener('transitionend', () => preloader.remove(), { once: true });
    }, 700);
  }

  /* ----------------------------------------------------------
     1b. HERO VIDEO PERFORMANCE
     ---------------------------------------------------------- */
  const heroVideo = document.querySelector('.hero-video');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const smallScreen = window.matchMedia('(max-width: 700px)').matches;
  if (heroVideo && (reducedMotion || smallScreen)) {
    heroVideo.pause();
    heroVideo.removeAttribute('autoplay');
    heroVideo.preload = 'none';
  }

  /* ----------------------------------------------------------
     1c. PUBLIC RATE SYNC (rooms.html)
     ---------------------------------------------------------- */
  const savedRates = (() => {
    try { return JSON.parse(localStorage.getItem('np_rates') || 'null'); } catch { return null; }
  })();
  const rateCards = document.querySelectorAll('.rate-card');
  if (savedRates && Array.isArray(savedRates) && rateCards.length) {
    const rateOrder = ['EP', 'CP', 'MAPI', 'API'];
    rateCards.forEach((card, index) => {
      const rate = savedRates.find(item => item.code === rateOrder[index]);
      if (!rate) return;
      const price = card.querySelector('.rate-price');
      const supplements = card.querySelectorAll('.rate-meta dd');
      if (price) price.innerHTML = `₹${Number(rate.price || 0).toLocaleString('en-IN')}<small>/night</small>`;
      if (supplements[0]) supplements[0].textContent = `₹${Number(rate.eb || 0).toLocaleString('en-IN')}`;
      if (supplements[1]) supplements[1].textContent = rate.cnb;
    });
  }

  /* ----------------------------------------------------------
     2. NAVBAR SCROLL EFFECT
     ---------------------------------------------------------- */
  const navbar = document.querySelector('.navbar');
  const SCROLL_THRESHOLD = 80;

  const handleNavbarScroll = () => {
    if (!navbar) return;
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  // Run once on load in case page is already scrolled
  handleNavbarScroll();
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });

  /* ----------------------------------------------------------
     3. MOBILE MENU TOGGLE
     ---------------------------------------------------------- */
  const hamburger = document.getElementById('hamburger');
  const mobileOverlay = document.getElementById('mobileOverlay');

  const toggleMobileMenu = () => {
    if (!hamburger || !mobileOverlay) return;
    hamburger.classList.toggle('active');
    mobileOverlay.classList.toggle('active');
    document.body.style.overflow =
      mobileOverlay.classList.contains('active') ? 'hidden' : '';
  };

  const closeMobileMenu = () => {
    if (!hamburger || !mobileOverlay) return;
    hamburger.classList.remove('active');
    mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (hamburger) hamburger.addEventListener('click', toggleMobileMenu);

  // Close when a mobile‑nav link is clicked
  if (mobileOverlay) {
    mobileOverlay.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  /* ----------------------------------------------------------
     4. SCROLL REVEAL ANIMATIONS (IntersectionObserver)
     ---------------------------------------------------------- */
  const revealSelectors = '.reveal-up, .reveal-left, .reveal-right, .fade-up';

  const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // The animation stylesheet uses `.active` as its visible state.
          // Keep `revealed` as a semantic marker for any existing CSS/hooks.
          entry.target.classList.add('active', 'revealed');
          revealObserver.unobserve(entry.target); // animate only once
        }
      });
    },
    { rootMargin: '0px 0px -8%', threshold: 0.08 }
  ) : null;

  document.querySelectorAll(revealSelectors).forEach(el => {
    if (revealObserver) {
      revealObserver.observe(el);
    } else {
      el.classList.add('active', 'revealed');
    }
  });

  /* ----------------------------------------------------------
     5. TESTIMONIALS SLIDER
     ---------------------------------------------------------- */
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  const dots = document.querySelectorAll('.dot');
  let currentTestimonial = 0;
  let testimonialTimer = null;

  const showTestimonial = (index) => {
    if (!testimonialCards.length) return;
    // Wrap index
    currentTestimonial = (index + testimonialCards.length) % testimonialCards.length;

    testimonialCards.forEach((card, i) => {
      card.classList.toggle('active', i === currentTestimonial);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentTestimonial);
    });
  };

  const startTestimonialAutoplay = () => {
    if (!testimonialCards.length) return;
    testimonialTimer = setInterval(() => {
      showTestimonial(currentTestimonial + 1);
    }, 5000);
  };

  if (testimonialCards.length) {
    showTestimonial(0);
    if (!reducedMotion) startTestimonialAutoplay();

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        clearInterval(testimonialTimer);
        showTestimonial(i);
        if (!reducedMotion) startTestimonialAutoplay();
      });
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearInterval(testimonialTimer);
      } else if (!reducedMotion) {
        clearInterval(testimonialTimer);
        startTestimonialAutoplay();
      }
    });
  }

  /* ----------------------------------------------------------
     6. SMOOTH SCROLL (anchor links)
     ---------------------------------------------------------- */
  document.querySelectorAll('a[href*="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');

      // Skip if it's just "#" or links to another page
      if (href === '#' || (href.includes('/') && !href.startsWith('#'))) return;

      const targetId = href.startsWith('#') ? href : href.substring(href.indexOf('#'));
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const navbarHeight = navbar ? navbar.offsetHeight : 0;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;

      window.scrollTo({ top: targetPosition, behavior: 'smooth' });

      // Close mobile menu if open
      closeMobileMenu();
    });
  });

  /* ----------------------------------------------------------
     7. GALLERY LIGHTBOX (gallery.html)
     ---------------------------------------------------------- */
  const galleryImages = document.querySelectorAll('.gallery-item img, .gallery-tile img, .mosaic-item img, .intro-img-main img, .intro-img-secondary img');

  if (galleryImages.length) {
    // Build lightbox DOM dynamically
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox-overlay';
    lightbox.innerHTML = `
      <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
      <button class="lightbox-prev" aria-label="Previous image">&#10094;</button>
      <img class="lightbox-img" src="" alt="Gallery preview" />
      <button class="lightbox-next" aria-label="Next image">&#10095;</button>
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('.lightbox-img');
    const btnClose = lightbox.querySelector('.lightbox-close');
    const btnPrev = lightbox.querySelector('.lightbox-prev');
    const btnNext = lightbox.querySelector('.lightbox-next');

    let lightboxIndex = 0;

    const openLightbox = (index) => {
      lightboxIndex = index;
      lightboxImg.src = galleryImages[lightboxIndex].src;
      lightboxImg.alt = galleryImages[lightboxIndex].alt || 'Gallery image';
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    };

    const navigateLightbox = (direction) => {
      lightboxIndex = (lightboxIndex + direction + galleryImages.length) % galleryImages.length;
      lightboxImg.src = galleryImages[lightboxIndex].src;
      lightboxImg.alt = galleryImages[lightboxIndex].alt || 'Gallery image';
    };

    // Open on gallery image click
    galleryImages.forEach((img, i) => {
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => openLightbox(i));
    });

    // Close handlers
    btnClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // Navigation
    btnPrev.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(-1); });
    btnNext.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(1); });

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    });
  }

  /* ----------------------------------------------------------
     8. GALLERY FILTER (gallery.html)
     ---------------------------------------------------------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (filterBtns.length && galleryItems.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        // Update active button
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Filter gallery items
        galleryItems.forEach(item => {
          const category = item.dataset.category;
          if (filter === 'all' || category === filter) {
            item.style.opacity = '0';
            item.style.display = '';
            // Trigger reflow then fade in
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
              });
            });
          } else {
            item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8)';
            // Hide after transition
            setTimeout(() => {
              item.style.display = 'none';
            }, 400);
          }
        });
      });
    });
  }

  /* ----------------------------------------------------------
     9. CONTACT FORM VALIDATION (contact.html)
     ---------------------------------------------------------- */
  const bookingForm = document.querySelector('.booking-form');

  if (bookingForm) {
    /**
     * Show an error message below a field.
     * @param {HTMLElement} field
     * @param {string} message
     */
    const showError = (field, message) => {
      clearError(field);
      const errorEl = document.createElement('span');
      errorEl.className = 'field-error';
      errorEl.textContent = message;
      errorEl.style.cssText = 'color:#e74c3c;font-size:0.85rem;display:block;margin-top:4px;';
      field.style.borderColor = '#e74c3c';
      field.parentNode.appendChild(errorEl);
    };

    const clearError = (field) => {
      const existing = field.parentNode.querySelector('.field-error');
      if (existing) existing.remove();
      field.style.borderColor = '';
    };

    const clearAllErrors = () => {
      bookingForm.querySelectorAll('.field-error').forEach(e => e.remove());
      bookingForm.querySelectorAll('input, textarea, select').forEach(f => (f.style.borderColor = ''));
    };

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidPhone = (phone) => phone.replace(/\D/g, '').length >= 10;
    const checkinField = bookingForm.querySelector('[name="checkin"]');
    const checkoutField = bookingForm.querySelector('[name="checkout"]');
    const today = new Date().toISOString().split('T')[0];
    if (checkinField && checkoutField) {
      checkinField.min = today;
      checkoutField.min = today;
      checkinField.addEventListener('change', () => {
        checkoutField.min = checkinField.value || today;
      });
    }

    // Add the meal-plan selector and preselect a plan when a rate card links here.
    let planField = bookingForm.querySelector('[name="plan"]');
    if (!planField) {
      const planGroup = document.createElement('div');
      planGroup.className = 'form-group form-group-full';
      planGroup.innerHTML = '<label for="booking-plan">Meal plan</label><select id="booking-plan" name="plan"><option value="EP">EP — European Plan</option><option value="CP">CP — Continental Plan</option><option value="MAPI">MAPI — Modified American Plan</option><option value="API">API — American Plan</option></select>';
      const messageGroup = bookingForm.querySelector('[name="message"]')?.closest('.form-group');
      const formGrid = bookingForm.querySelector('.form-grid');
      if (formGrid) formGrid.insertBefore(planGroup, messageGroup || null);
      planField = planGroup.querySelector('[name="plan"]');
    }
    const requestedPlan = new URLSearchParams(window.location.search).get('plan');
    if (planField && requestedPlan && [...planField.options].some(option => option.value === requestedPlan)) {
      planField.value = requestedPlan;
    }

    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearAllErrors();

      let isValid = true;

      // Name
      const name = bookingForm.querySelector('[name="name"]');
      if (name && !name.value.trim()) {
        showError(name, 'Please enter your name.');
        isValid = false;
      }

      // Email
      const email = bookingForm.querySelector('[name="email"]');
      if (email) {
        if (!email.value.trim()) {
          showError(email, 'Please enter your email address.');
          isValid = false;
        } else if (!isValidEmail(email.value.trim())) {
          showError(email, 'Please enter a valid email address.');
          isValid = false;
        }
      }

      // Phone
      const phone = bookingForm.querySelector('[name="phone"]');
      if (phone) {
        if (!phone.value.trim()) {
          showError(phone, 'Please enter your phone number.');
          isValid = false;
        } else if (!isValidPhone(phone.value.trim())) {
          showError(phone, 'Phone number must have at least 10 digits.');
          isValid = false;
        }
      }

      // Dates
      const checkin = bookingForm.querySelector('[name="checkin"]');
      const checkout = bookingForm.querySelector('[name="checkout"]');
      if (checkin && !checkin.value) {
        showError(checkin, 'Please select a check-in date.');
        isValid = false;
      }
      if (checkout && !checkout.value) {
        showError(checkout, 'Please select a check-out date.');
        isValid = false;
      }
      if (checkin && checkout && checkin.value && checkout.value) {
        if (new Date(checkout.value) <= new Date(checkin.value)) {
          showError(checkout, 'Check-out date must be after check-in date.');
          isValid = false;
        }
      }

      // If valid → redirect to WhatsApp
      if (isValid) {
        const guests = bookingForm.querySelector('[name="guests"]');
        const room = bookingForm.querySelector('[name="room"]');
        const plan = bookingForm.querySelector('[name="plan"]');
        const message = bookingForm.querySelector('[name="message"]');

        let text = `Hello! I'd like to book a stay at your houseboat.\n\n`;
        text += `Name: ${name ? name.value.trim() : ''}\n`;
        text += `Email: ${email ? email.value.trim() : ''}\n`;
        text += `Phone: ${phone ? phone.value.trim() : ''}\n`;
        text += `Check-in: ${checkin ? checkin.value : ''}\n`;
        text += `Check-out: ${checkout ? checkout.value : ''}\n`;
        if (guests && guests.value) text += `Guests: ${guests.value}\n`;
        if (plan && plan.value) text += `Meal plan: ${plan.value}\n`;
        if (room && room.value) text += `Preferred room: ${room.value}\n`;
        if (message && message.value.trim()) text += `Message: ${message.value.trim()}\n`;

        const whatsappURL = `https://wa.me/919682654524?text=${encodeURIComponent(text)}`;
        window.open(whatsappURL, '_blank');
      }
    });
  }

  /* ----------------------------------------------------------
     10. HERO PARALLAX EFFECT (desktop only)
     ---------------------------------------------------------- */
  const heroSection = document.querySelector('.hero');
  const heroMedia = heroSection
    ? heroSection.querySelector('video, img, .hero-media')
    : null;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (heroMedia && !isTouchDevice) {
    window.addEventListener(
      'scroll',
      () => {
        const scrolled = window.scrollY;
        heroMedia.style.transform = `translateY(${scrolled * 0.35}px)`;
      },
      { passive: true }
    );
  }

  /* ----------------------------------------------------------
     11. NAVBAR ACTIVE LINK
     ---------------------------------------------------------- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.navbar a, .nav-links a, #mobileOverlay a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkPage = href.split('/').pop().split('#')[0] || 'index.html';

    if (linkPage === currentPage) {
      link.classList.add('active');
    }
  });

  /* ----------------------------------------------------------
     12. IMAGE LAZY LOADING ENHANCEMENT
     ---------------------------------------------------------- */
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');

  if (lazyImages.length) {
    const lazyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            // Apply a fade‑in once the image finishes loading
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.6s ease';

            const revealImage = () => {
              img.style.opacity = '1';
              lazyObserver.unobserve(img);
            };

            if (img.complete) {
              revealImage();
            } else {
              img.addEventListener('load', revealImage, { once: true });
              img.addEventListener('error', revealImage, { once: true });
            }
          }
        });
      },
      { rootMargin: '50px' }
    );

    lazyImages.forEach(img => lazyObserver.observe(img));
  }

  /* ----------------------------------------------------------
     13. PAGE HEADER PARALLAX (inner pages)
     ---------------------------------------------------------- */
  const pageHeader = document.querySelector('.page-header');

  if (pageHeader) {
    window.addEventListener(
      'scroll',
      () => {
        const scrolled = window.scrollY;
        pageHeader.style.backgroundPositionY = `${scrolled * 0.4}px`;
      },
      { passive: true }
    );
  }
});
