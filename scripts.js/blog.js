const hamburger = document.getElementById('hamburger');
const sideMenu = document.getElementById('sideMenu');
const menuBackdrop = document.getElementById('menuBackdrop');
const sideClose = document.getElementById('sideClose');

//  FUNCIONALIDADES DO MENU LATERAL

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

// Eventos para abrir/fechar
if(hamburger) hamburger.addEventListener('click', openMenu);
if(menuBackdrop) menuBackdrop.addEventListener('click', closeMenu);
if(sideClose) sideClose.addEventListener('click', closeMenu);
window.addEventListener('keydown', (e) => {F
  if(e.key === 'Escape') closeMenu();
});


// CONTROLE DE VISIBILIDADE

function handleResponsiveMenu() {
  const desktopMenu = document.querySelector('.menu');
  const btnWhatsapp = document.querySelector('.btn-whatsapp');
  const hamburgerBtn = document.querySelector('.hamburger'); 
  if (window.innerWidth >= 768) {
    // VERSÃO DESKTOP
    if (desktopMenu) desktopMenu.style.display = 'flex';
    if (btnWhatsapp) btnWhatsapp.style.display = 'flex';
    if (hamburgerBtn) hamburgerBtn.style.display = 'none'; // Esconde o hambúrguer no PC
    closeMenu(); 
  } else {
    // VERSÃO MOBILE
    if (desktopMenu) desktopMenu.style.display = 'none'; // Esconde o menu horizontal
    if (btnWhatsapp) btnWhatsapp.style.display = 'none';
    if (hamburgerBtn) hamburgerBtn.style.display = 'flex'; // Mostra o hambúrguer no Celular
  }
}

// Executa ao carregar a página
window.addEventListener('load', handleResponsiveMenu);
window.addEventListener('resize', handleResponsiveMenu);