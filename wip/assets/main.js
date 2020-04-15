/*
 * dragonwocky.me
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
 * (https://dragonwocky.me/) under the MIT license
 */

(() => {
  const construct = () => {
    if (document.readyState !== 'complete') return false;
    document.removeEventListener('readystatechange', construct);

    document.documentElement.setAttribute(
      'data-useragent',
      navigator.userAgent
    );
    document.documentElement.setAttribute('data-platform', navigator.platform);
    document.documentElement.className +=
      !!('ontouchstart' in window) || !!('onmsgesturechange' in window)
        ? ' touch'
        : '';

    function scrollTop() {
      document.documentElement.scroll({ top: 0, behavior: 'smooth' });
      document.querySelector('main').scroll({ top: 0, behavior: 'smooth' });
    }
    document.querySelectorAll('.scrollTop').forEach((button) => {
      button.addEventListener('click', scrollTop);
      button.addEventListener('keyup', (ev) =>
        ev.key === 'Enter' ? scrollTop() : true
      );
    });
  };

  construct();
  document.addEventListener('readystatechange', construct);
})();
