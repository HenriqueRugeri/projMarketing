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
});

window.addEventListener('resize', () => {
  preventHorizontalScroll();
  handleResponsiveMenu();
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
  
  // Enhanced hover effects for service cards
  const serviceCards = document.querySelectorAll('.service-card');
  
  serviceCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
});
