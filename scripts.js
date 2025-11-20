(function () {
  const header = document.querySelector('.site-header');
  const nav = document.querySelector('.navigation');
  const toggle = document.querySelector('.menu-toggle');
  const year = document.getElementById('year');
  const animated = document.querySelectorAll('[data-animate]');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      toggle.classList.toggle('is-active', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
      document.body.classList.toggle('no-scroll', isOpen);
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.classList.remove('is-active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll');
      });
    });
  }

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    animated.forEach((section) => observer.observe(section));
  } else {
    animated.forEach((section) => section.classList.add('is-visible'));
  }

  const canvas = document.getElementById('stars');
  if (!(canvas && canvas.getContext)) {
    return;
  }

  const ctx = canvas.getContext('2d');
  const STAR_COUNT = 120;
  const stars = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createStar() {
    const speed = Math.random() * 0.3 + 0.05;
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.2 + 0.2,
      speed,
      alpha: Math.random() * 0.5 + 0.2,
      twinkleDirection: Math.random() > 0.5 ? 1 : -1,
    };
  }

  function initStars() {
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i += 1) {
      stars.push(createStar());
    }
  }

  function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(5, 4, 15, 0.95)');
    gradient.addColorStop(1, 'rgba(5, 4, 15, 0.8)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    stars.forEach((star) => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha.toFixed(2)})`;
      ctx.fill();
    });
    ctx.restore();
  }

  function updateStars() {
    stars.forEach((star) => {
      star.y += star.speed;
      star.alpha += 0.01 * star.twinkleDirection;
      if (star.alpha <= 0.2 || star.alpha >= 0.8) {
        star.twinkleDirection *= -1;
      }

      if (star.y > canvas.height) {
        star.x = Math.random() * canvas.width;
        star.y = -2;
      }
    });
  }

  function animate() {
    if (!prefersReducedMotion) {
      updateStars();
    }
    drawStars();
    requestAnimationFrame(animate);
  }

  resizeCanvas();
  initStars();
  animate();

  window.addEventListener('resize', () => {
    resizeCanvas();
    initStars();
  });

  // Throttle function for performance
  function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Smooth scroll with offset for sticky header
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#' || href === '#hero') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 100;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    });
  });

  // Active navigation state (scroll spy)
  function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navigation a[href^="#"]');
    
    let current = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.pageYOffset >= sectionTop - 150) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  // Back to top button
  const backToTopBtn = document.querySelector('.back-to-top');
  
  function toggleBackToTop() {
    if (backToTopBtn) {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add('is-visible');
      } else {
        backToTopBtn.classList.remove('is-visible');
      }
    }
  }

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  window.addEventListener('scroll', throttle(() => {
    if (!header) {
      return;
    }
    const scrolled = window.scrollY > 40;
    header.style.boxShadow = scrolled ? '0 20px 45px -35px rgba(139, 92, 246, 0.8)' : 'var(--shadow-sm)';
    header.style.borderColor = scrolled ? 'rgba(139, 92, 246, 0.35)' : 'rgba(139, 92, 246, 0.18)';
    
    // Update active nav
    updateActiveNav();
    
    // Toggle back to top button
    toggleBackToTop();
  }, 100));

  // Expandable cards functionality - all cards expand together
  const expandableCards = document.querySelectorAll('.card--expandable');
  const experienceSection = document.querySelector('#experience');
  
  if (experienceSection) {
    expandableCards.forEach((card) => {
      const toggle = card.querySelector('.card__toggle');
      const toggleText = toggle?.querySelector('.card__toggle-text');
      
      if (toggle && toggleText) {
        toggle.addEventListener('click', () => {
          // Check if any card is expanded
          const anyExpanded = Array.from(expandableCards).some(c => c.classList.contains('is-expanded'));
          const willBeExpanded = !anyExpanded;
          
          // Toggle all cards together
          expandableCards.forEach((c) => {
            if (willBeExpanded) {
              c.classList.add('is-expanded');
            } else {
              c.classList.remove('is-expanded');
            }
            
            const t = c.querySelector('.card__toggle');
            const tText = t?.querySelector('.card__toggle-text');
            if (t && tText) {
              tText.textContent = willBeExpanded ? 'Read less' : 'Read more';
              t.setAttribute('aria-expanded', willBeExpanded);
            }
          });
        });
      }
    });
  }
})();
