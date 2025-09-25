// Menu open/close
    const hamburger = document.getElementById('hamburger');
    const sideMenu = document.getElementById('sideMenu');
    const menuBackdrop = document.getElementById('menuBackdrop');
    const sideClose = document.getElementById('sideClose');

    function openMenu(){
      sideMenu.classList.add('open');
      sideMenu.setAttribute('aria-hidden','false');
      document.body.style.overflow = 'hidden';
    }
    function closeMenu(){
      sideMenu.classList.remove('open');
      sideMenu.setAttribute('aria-hidden','true');
      document.body.style.overflow = '';
    }
    hamburger.addEventListener('click', openMenu);
    menuBackdrop.addEventListener('click', closeMenu);
    sideClose.addEventListener('click', closeMenu);

    // Simple carousel logic (mobile-first)
    (function(){
      const carousel = document.getElementById('carousel');
      const slides = Array.from(carousel.children);
      const prev = document.getElementById('prev');
      const next = document.getElementById('next');
      let index = 0;

      function showIndex(i){
        const width = carousel.clientWidth;
        // calculate translateX to show item at index
        let offset = 0;
        // On wide screens show 3 slides — we set slides widths accordingly; here we just compute offset by slide width
        const slide = slides[0];
        const slideW = slide.getBoundingClientRect().width + 18; // include gap
        offset = slideW * i;
        carousel.style.transform = `translateX(-${offset}px)`;
        carousel.style.transition = 'transform 450ms cubic-bezier(.2,.9,.3,1)';
      }

      prev.addEventListener('click', ()=>{
        index = Math.max(0, index - 1);
        showIndex(index);
      });
      next.addEventListener('click', ()=>{
        index = Math.min(slides.length - 1, index + 1);
        showIndex(index);
      });

      // touch swipe for mobile
      let startX = 0, currentX = 0, isDown=false;
      carousel.addEventListener('pointerdown', (e)=>{
        isDown=true; startX = e.clientX;
        carousel.style.transition = '';
      });
      window.addEventListener('pointermove', (e)=>{
        if(!isDown) return;
        currentX = e.clientX;
        const dx = startX - currentX;
        carousel.style.transform = `translateX(-${(slides[0].getBoundingClientRect().width + 18) * index + dx}px)`;
      });
      window.addEventListener('pointerup', (e)=>{
        if(!isDown) return;
        isDown=false;
        const dx = startX - e.clientX;
        if(dx > 60) index = Math.min(slides.length -1, index + 1);
        else if(dx < -60) index = Math.max(0, index - 1);
        showIndex(index);
      });

      // initial layout
      window.addEventListener('load', ()=> showIndex(0));
      window.addEventListener('resize', ()=> showIndex(index));
    })();

    // show bottom CTA when user scrolls a bit
    const bottomCta = document.getElementById('bottomCta');
    let shown = false;
    window.addEventListener('scroll', ()=>{
      if(window.scrollY > 500 && !shown){
        bottomCta.classList.remove('hidden');
        shown = true;
      } else if(window.scrollY < 200 && shown){
        bottomCta.classList.add('hidden');
        shown = false;
      }
    });

    // small accessibility: close menu with Esc
    window.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape') closeMenu();
    });