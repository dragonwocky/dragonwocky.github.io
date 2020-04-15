/*
 * dragonwocky.me
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
 * (https://dragonwocky.me/) under the MIT license
 */

(() => {
  const construct = () => {
    if (document.readyState !== 'complete') return false;
    document.removeEventListener('readystatechange', construct);
  };

  construct();
  document.addEventListener('readystatechange', construct);
})();
