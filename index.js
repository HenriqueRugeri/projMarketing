// Menu open/close
const hamburger = document.getElementById('hamburger');
const sideMenu = document.getElementById('sideMenu');
const menuBackdrop = document.getElementById('menuBackdrop');
const sideClose = document.getElementById('sideClose');

function openMenu(){
  if(sideMenu) {
    sideMenu.classList.add('open');
    sideMenu.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }
}

function closeMenu(){
  if(sideMenu) {
    sideMenu.classList.remove('open');
    sideMenu.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }
}

if(hamburger) hamburger.addEventListener('click', openMenu);
if(menuBackdrop) menuBackdrop.addEventListener('click', closeMenu);
if(sideClose) sideClose.addEventListener('click', closeMenu);

// Carousel functionality
const carousel = document.getElementById('carousel');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;

function updateCarousel() {
  if (carousel && slides.length > 0) {
    const slideWidth = slides[0].offsetWidth + 18; // width + gap
    carousel.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
  }
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;
  updateCarousel();
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  updateCarousel();
}

if(nextBtn) nextBtn.addEventListener('click', nextSlide);
if(prevBtn) prevBtn.addEventListener('click', prevSlide);

// Auto-advance carousel
let autoSlideInterval;

function startAutoSlide() {
  autoSlideInterval = setInterval(nextSlide, 5000); // 5 seconds
}

function stopAutoSlide() {
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval);
  }
}

// Start auto-slide on load
window.addEventListener('load', startAutoSlide);

// Pause auto-slide on hover
if (carousel) {
  carousel.addEventListener('mouseenter', stopAutoSlide);
  carousel.addEventListener('mouseleave', startAutoSlide);
}

// Bottom CTA visibility
const bottomCta = document.getElementById('bottomCta');
const hero = document.getElementById('hero');

function toggleBottomCta() {
  if (bottomCta && hero) {
    const heroRect = hero.getBoundingClientRect();
    const isHeroVisible = heroRect.bottom > 0;
    
    if (isHeroVisible) {
      bottomCta.classList.add('hidden');
    } else {
      bottomCta.classList.remove('hidden');
    }
  }
}

window.addEventListener('scroll', toggleBottomCta);
window.addEventListener('load', toggleBottomCta);

// Desktop dropdown functionality for new menu
document.addEventListener('DOMContentLoaded', function() {
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
  
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('mouseenter', () => {
      // Add hover effect for dropdown items
      const icon = toggle.querySelector('i');
      if (icon) {
        icon.style.transform = 'rotate(180deg)';
      }
    });
    
    toggle.addEventListener('mouseleave', () => {
      const icon = toggle.querySelector('i');
      if (icon) {
        icon.style.transform = 'rotate(0deg)';
      }
    });
  });
});

// small accessibility: close menu with Esc
window.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape') closeMenu();
});

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') {
        e.preventDefault();
        return;
      }
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});

// Prevent horizontal scroll on mobile
function preventHorizontalScroll() {
  const body = document.body;
  const html = document.documentElement;
  
  // Ensure no horizontal overflow
  if (body.scrollWidth > window.innerWidth) {
    body.style.overflowX = 'hidden';
    html.style.overflowX = 'hidden';
  }
}

// Responsive menu handling
function handleResponsiveMenu() {
  const menu = document.querySelector('.menu');
  const btnWhatsapp = document.querySelector('.btn-whatsapp');
  const hamburger = document.querySelector('.hamburger');
  
  if (window.innerWidth >= 768) {
    // Desktop view
    if (menu) menu.style.display = 'flex';
    if (btnWhatsapp) btnWhatsapp.style.display = 'flex';
    if (hamburger) hamburger.style.display = 'none';
    closeMenu(); // Close mobile menu if open
  } else {
    // Mobile view
    if (menu) menu.style.display = 'none';
    if (btnWhatsapp) btnWhatsapp.style.display = 'none';
    if (hamburger) hamburger.style.display = 'flex';
  }
}

window.addEventListener('load', () => {
  preventHorizontalScroll();
  handleResponsiveMenu();
  updateCarousel(); // Initialize carousel position
});

window.addEventListener('resize', () => {
  preventHorizontalScroll();
  handleResponsiveMenu();
  updateCarousel(); // Update carousel on resize
});

// Enhanced hover effects for menu items
document.addEventListener('DOMContentLoaded', function() {
  const menuLinks = document.querySelectorAll('.menu a');
  
  menuLinks.forEach(link => {
    link.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-1px)';
    });
    
    link.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
  
  // Enhanced hover effects for WhatsApp float button
  const whatsappFloat = document.querySelector('.whatsapp-float');
  
  if (whatsappFloat) {
    whatsappFloat.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.1)';
      this.style.boxShadow = '0 8px 30px rgba(37, 211, 102, 0.5)';
    });
    
    whatsappFloat.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1)';
      this.style.boxShadow = '0 4px 20px rgba(37, 211, 102, 0.3)';
    });
  }
});

// Animation on scroll
function animateOnScroll() {
  const elements = document.querySelectorAll('.slide, .cta, .badge');
  
  elements.forEach(element => {
    const elementTop = element.getBoundingClientRect().top;
    const elementVisible = 150;
    
    if (elementTop < window.innerHeight - elementVisible) {
      element.classList.add('animate-in');
    }
  });
}

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);

// Brands slider functionality - Mobile Optimized
document.addEventListener('DOMContentLoaded', function() {
  const brandsSlider = document.querySelector('.brands-slider');
  const brandsTrack = document.querySelector('.brands-track');
  
  if (brandsSlider && brandsTrack) {
    // Mobile-first approach - only add hover effects on non-touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (!isTouchDevice) {
      // Pause animation on hover for desktop
      brandsSlider.addEventListener('mouseenter', function() {
        brandsTrack.style.animationPlayState = 'paused';
      });
      
      brandsSlider.addEventListener('mouseleave', function() {
        brandsTrack.style.animationPlayState = 'running';
      });
      
      // Enhanced hover effects for brand items on desktop
      const brandItems = document.querySelectorAll('.brand-item');
      
      brandItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
          this.style.transform = 'translateY(-3px) scale(1.02)';
          this.style.boxShadow = '0 10px 30px rgba(163, 102, 255, 0.15)';
        });
        
        item.addEventListener('mouseleave', function() {
          this.style.transform = 'translateY(0) scale(1)';
          this.style.boxShadow = '0 0 0 rgba(163, 102, 255, 0)';
        });
      });
    }
    
    // Intersection Observer for performance - pause when not visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          brandsTrack.style.animationPlayState = 'running';
        } else {
          brandsTrack.style.animationPlayState = 'paused';
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });
    
    observer.observe(brandsSlider);
    
    // Preload brand images with lazy loading for better mobile performance
    const brandImages = document.querySelectorAll('.brand-item img');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.complete) {
            img.style.opacity = '1';
          } else {
            img.style.opacity = '0';
            img.addEventListener('load', function() {
              this.style.transition = 'opacity 0.3s ease';
              this.style.opacity = '1';
            });
          }
          imageObserver.unobserve(img);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '100px'
    });
    
    brandImages.forEach(img => {
      imageObserver.observe(img);
    });
  }
});

// Responsive adjustments for brands slider - Mobile Optimized
function adjustBrandsSlider() {
  const brandsSection = document.querySelector('.brands-section');
  const brandItems = document.querySelectorAll('.brand-item');
  
  if (brandsSection && brandItems.length > 0) {
    const viewportWidth = window.innerWidth;
    const brandsTrack = document.querySelector('.brands-track');
    
    if (brandsTrack) {
      // Adjust animation speed based on screen size for better mobile experience
      if (viewportWidth <= 360) {
        brandsTrack.style.animationDuration = '30s';
      } else if (viewportWidth <= 480) {
        brandsTrack.style.animationDuration = '35s';
      } else if (viewportWidth <= 767) {
        brandsTrack.style.animationDuration = '40s';
      } else {
        brandsTrack.style.animationDuration = '50s';
      }
      
      // Reduce motion for users who prefer it
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        brandsTrack.style.animationDuration = '120s';
      }
    }
  }
}

// Throttled resize handler for better mobile performance
let resizeTimeout;
function throttledResize() {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
  resizeTimeout = setTimeout(() => {
    adjustBrandsSlider();
  }, 100);
}

window.addEventListener('resize', throttledResize);
window.addEventListener('load', adjustBrandsSlider);

// Touch gesture support for mobile devices
document.addEventListener('DOMContentLoaded', function() {
  const brandsSlider = document.querySelector('.brands-slider');
  
  if (brandsSlider && 'ontouchstart' in window) {
    let startX = 0;
    let startTime = 0;
    
    brandsSlider.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX;
      startTime = Date.now();
    }, { passive: true });
    
    brandsSlider.addEventListener('touchend', function(e) {
      const endX = e.changedTouches[0].clientX;
      const endTime = Date.now();
      const deltaX = endX - startX;
      const deltaTime = endTime - startTime;
      
      // If it's a quick swipe, temporarily speed up the animation
      if (Math.abs(deltaX) > 50 && deltaTime < 300) {
        const brandsTrack = document.querySelector('.brands-track');
        if (brandsTrack) {
          const currentDuration = parseFloat(getComputedStyle(brandsTrack).animationDuration);
          brandsTrack.style.animationDuration = (currentDuration * 0.5) + 's';
          
          setTimeout(() => {
            adjustBrandsSlider(); // Reset to normal speed
          }, 2000);
        }
      }
    }, { passive: true });
  }
});

// Memory cleanup for better mobile performance
window.addEventListener('beforeunload', function() {
  const brandsTrack = document.querySelector('.brands-track');
  if (brandsTrack) {
    brandsTrack.style.animationPlayState = 'paused';
  }
});
