/**
 * thedragonring.me - my personal website
 * ==================================================================
 * Copyright (c) 2018 TheDragonRing <thedragonring.bod@gmail.com>, under the MIT License
 */

window.onload = () => {
  // fade out load-message elements
  document.querySelectorAll('.loading').forEach(el => {
    el.classList.add('fadeOut');
    setTimeout(() => {
      el.style.display = 'none';
    }, 750);
  });
  // animate popping elements
  document.querySelectorAll('.pop').forEach((el, i) => {
    setTimeout(() => {
      el.style.visibility = 'visible';
      if (el.querySelectorAll('.is-shadow')) {
        el.querySelectorAll('.is-shadow').forEach(elem => {
          elem.style.display = 'none';
          setTimeout(() => {
            elem.style.display = 'block';
          }, 900);
        });
      }
      el.classList.remove('pop');
      el.classList.add('popped');
    }, (window.matchMedia('(max-width: 1023px)').matches ? i : el.dataset.popDelay || i) * 500);
  });
  // add shadow(s)
  document.querySelectorAll('.with-shadow').forEach(el => {
    const main = document.createElement('div'),
      lesser = document.createElement('div');
    main.setAttribute('class', 'is-shadow is-near is-hidden-mobile');
    lesser.setAttribute('class', 'is-shadow is-far is-hidden-mobile');
    el.prepend(main);
    el.prepend(lesser);
  });
};
