document.addEventListener('DOMContentLoaded', () => {
  const burger = document.querySelector('.burger');
  const nav = document.getElementById('nav');

  const closeMenu = () => {
    burger.classList.remove('is-active');
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  };

  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.classList.toggle('is-active', open);
    burger.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  const lang = document.querySelector('.lang');
  const langBtn = lang.querySelector('.lang__btn');
  const langCurrent = lang.querySelector('.lang__current');

  langBtn.addEventListener('click', e => {
    e.stopPropagation();
    const open = lang.classList.toggle('is-open');
    langBtn.setAttribute('aria-expanded', String(open));
  });
  lang.querySelectorAll('[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => {
      langCurrent.textContent = btn.dataset.lang;
      lang.classList.remove('is-open');
    });
  });
  document.addEventListener('click', e => {
    if (!lang.contains(e.target)) lang.classList.remove('is-open');
    if (!nav.contains(e.target) && !burger.contains(e.target)) closeMenu();
  });

  const heroSlides = document.querySelectorAll('.hero__slide');
  let heroIndex = 0;
  let heroTimer;

  const showHero = i => {
    heroSlides[heroIndex].classList.remove('is-active');
    heroIndex = (i + heroSlides.length) % heroSlides.length;
    heroSlides[heroIndex].classList.add('is-active');
  };
  const startHero = () => {
    clearInterval(heroTimer);
    heroTimer = setInterval(() => showHero(heroIndex + 1), 6000);
  };
  document.querySelectorAll('[data-hero]').forEach(btn => {
    btn.addEventListener('click', () => {
      showHero(heroIndex + (btn.dataset.hero === 'next' ? 1 : -1));
      startHero();
    });
  });
  startHero();

  document.querySelectorAll('[data-carousel]').forEach(initCarousel);

  function initCarousel(root) {
    const track = root.querySelector('.carousel__track');

    let items = [...track.children];
    while (items.length < 8) {
      items.forEach(el => {
        const clone = el.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      });
      items = [...track.children];
    }

    const n = items.length;
    let active = 0;
    const prevOffsets = new Array(n).fill(0);

    const render = (instant = false) => {
      const styles = getComputedStyle(root);
      const w = items[0].offsetWidth;
      const gap = parseFloat(styles.getPropertyValue('--gap')) || 0;
      const half = Math.floor(n / 2);

      items.forEach((el, i) => {
        let d = (i - active + n) % n;
        if (d > half) d -= n;

        el.classList.toggle('no-anim', instant || Math.abs(d - prevOffsets[i]) > 1);
        prevOffsets[i] = d;

        el.style.transform = `translateX(calc(-50% + ${d * (w + gap)}px))`;
        el.classList.toggle('is-active', d === 0);
        el.classList.toggle('is-right', d > 0);
        el.classList.toggle('is-hidden', Math.abs(d) > 3);
      });
    };

    const go = step => {
      active = (active + step + n) % n;
      render();
    };

    root.querySelector('.carousel__prev').addEventListener('click', () => go(-1));
    root.querySelector('.carousel__next').addEventListener('click', () => go(1));

    items.forEach((el, i) => el.addEventListener('click', () => {
      if (i !== active) { active = i; render(); }
    }));

    let startX = null;
    root.addEventListener('pointerdown', e => { startX = e.clientX; });
    root.addEventListener('pointerup', e => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      startX = null;
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => render(true), 100);
    });
    render(true);
  }

  const partnersTrack = document.querySelector('.partners__track');
  if (partnersTrack) {
    [...partnersTrack.children].forEach(el => {
      const clone = el.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      partnersTrack.appendChild(clone);
    });
  }

  const faqItems = document.querySelectorAll('.faq__item');
  faqItems.forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) faqItems.forEach(other => { if (other !== item) other.open = false; });
    });
  });

  const phone = document.querySelector('input[name="phone"]');
  phone.addEventListener('input', () => {
    let digits = phone.value.replace(/\D/g, '');
    if (digits.startsWith('8')) digits = '7' + digits.slice(1);
    if (!digits.startsWith('7')) digits = '7' + digits;
    digits = digits.slice(0, 11);

    const p = digits.slice(1);
    let out = '+7';
    if (p.length) out += ' (' + p.slice(0, 3);
    if (p.length >= 3) out += ')';
    if (p.length > 3) out += ' ' + p.slice(3, 6);
    if (p.length > 6) out += ' ' + p.slice(6, 8);
    if (p.length > 8) out += ' ' + p.slice(8, 10);
    phone.value = out;
  });

  const form = document.getElementById('signupForm');
  const status = form.querySelector('.form__status');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.elements.name;
    const agree = form.elements.agree;

    const nameOk = name.value.trim().length >= 2;
    const phoneOk = phone.value.replace(/\D/g, '').length === 11;
    const agreeOk = agree.checked;

    name.closest('.field').classList.toggle('is-error', !nameOk);
    phone.closest('.field').classList.toggle('is-error', !phoneOk);
    agree.closest('.check').classList.toggle('is-error', !agreeOk);

    status.className = 'form__status';
    if (!nameOk || !phoneOk || !agreeOk) {
      status.textContent = 'Пожалуйста, заполните все обязательные поля и примите соглашение.';
      status.classList.add('is-error');
      return;
    }

    status.textContent = 'Спасибо! Мы свяжемся с вами в ближайшее время.';
    status.classList.add('is-success');
    form.reset();
    agree.checked = true;
  });
});
