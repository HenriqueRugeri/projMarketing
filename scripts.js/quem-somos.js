// Quem Somos - JavaScript específico

document.addEventListener('DOMContentLoaded', function() {
  // Animações de entrada para elementos
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observar elementos para animação
  const animateElements = document.querySelectorAll('.mvv-card, .partner-card, .case-card, .client-logo');
  animateElements.forEach(el => {
    observer.observe(el);
  });

  // Smooth scroll para links internos
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });



  // Efeito hover nos cards de cases
  const caseCards = document.querySelectorAll('.case-card');
  caseCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-3px)';
      this.style.boxShadow = '0 12px 30px rgba(107,59,216,0.12)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = '';
    });
  });

  // Contador animado para estatísticas
  const animateCounters = () => {
    const counters = document.querySelectorAll('.stat-value');
    counters.forEach(counter => {
      const target = counter.textContent;
      const numericValue = target.match(/[\d,]+/);
      
      if (numericValue) {
        const finalValue = parseInt(numericValue[0].replace(/,/g, ''));
        const prefix = target.split(numericValue[0])[0];
        const suffix = target.split(numericValue[0])[1];
        
        let current = 0;
        const increment = finalValue / 50;
        const timer = setInterval(() => {
          current += increment;
          if (current >= finalValue) {
            current = finalValue;
            clearInterval(timer);
          }
          
          const formattedValue = Math.floor(current).toLocaleString('pt-BR');
          counter.textContent = prefix + formattedValue + suffix;
        }, 30);
      }
    });
  };

  // Observar seção de cases para iniciar animação dos contadores
  const casesSection = document.querySelector('.cases-section');
  if (casesSection) {
    const casesObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          casesObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    
    casesObserver.observe(casesSection);
  }

  // Lazy loading para imagens dos clientes
  const clientImages = document.querySelectorAll('.client-logo img');
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
        
        img.onload = () => {
          img.style.opacity = '1';
        };
        
        imageObserver.unobserve(img);
      }
    });
  });

  clientImages.forEach(img => {
    imageObserver.observe(img);
  });

  // Parallax suave para seções
  let ticking = false;
  
  const updateParallax = () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.hero-about, .cta-section');
    
    parallaxElements.forEach(element => {
      const rate = scrolled * -0.5;
      element.style.transform = `translateY(${rate}px)`;
    });
    
    ticking = false;
  };

  const requestParallax = () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  };

  // Aplicar parallax apenas em telas maiores
  if (window.innerWidth > 768) {
    window.addEventListener('scroll', requestParallax);
  }

  // Remover parallax em dispositivos móveis
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
      window.removeEventListener('scroll', requestParallax);
      document.querySelectorAll('.hero-about, .cta-section').forEach(element => {
        element.style.transform = '';
      });
    } else {
      window.addEventListener('scroll', requestParallax);
    }
  });

  // Scroll to top suave
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Adicionar botão de voltar ao topo se necessário
  let scrollTopButton = document.querySelector('.scroll-top');
  if (!scrollTopButton) {
    scrollTopButton = document.createElement('button');
    scrollTopButton.className = 'scroll-top';
    scrollTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollTopButton.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 30px;
      width: 50px;
      height: 50px;
      background: var(--accent);
      color: #000;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 999;
      font-size: 18px;
    `;
    
    scrollTopButton.addEventListener('click', scrollToTop);
    document.body.appendChild(scrollTopButton);
  }

  // Mostrar/esconder botão de voltar ao topo
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      scrollTopButton.style.opacity = '1';
      scrollTopButton.style.visibility = 'visible';
    } else {
      scrollTopButton.style.opacity = '0';
      scrollTopButton.style.visibility = 'hidden';
    }
  });

  // Preloader para imagens
  const preloadImages = () => {
    const images = document.querySelectorAll('img');
    let loadedImages = 0;
    
    const imageLoaded = () => {
      loadedImages++;
      if (loadedImages === images.length) {
        document.body.classList.add('images-loaded');
      }
    };

    images.forEach(img => {
      if (img.complete) {
        imageLoaded();
      } else {
        img.addEventListener('load', imageLoaded);
        img.addEventListener('error', imageLoaded);
      }
    });
  };

  preloadImages();

  // Performance: debounce para eventos de scroll
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Aplicar debounce aos eventos de scroll se necessário
  const debouncedScroll = debounce(() => {
    // Funções de scroll otimizadas aqui
  }, 10);

  console.log('Quem Somos page loaded successfully');
});
