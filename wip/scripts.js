/*
 * dragonwocky.me
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
 * (https://dragonwocky.me/) under the MIT license
 */

let constructed = false;
const construct = async () => {
  if (document.readyState !== 'complete' || constructed) return false;
  constructed = true;

  VanillaTilt.init(document.querySelectorAll('.portfolio > section'), {
    reverse: true,
    max: 5,
    scale: 1.03,
    speed: 500,
    glare: true,
    'max-glare': 0.02
  });

  CSS.registerProperty({
    name: '--badge',
    syntax: '<color>',
    inherits: true,
    initialValue: '#020202'
  });
  CSS.registerProperty({
    name: '--card',
    syntax: '<color>',
    inherits: true,
    initialValue: '#bd0000'
  });

  function badge(el, content) {
    if (!el || !content) return;
    el.querySelector('a').innerHTML = `${el
      .querySelector('a')
      .innerHTML.trim()}<span class="slide">${content}</span>`;
    let next = el;
    while (next.nextSibling && next.nextSibling.offsetTop === el.offsetTop) {
      next = next.nextSibling;
      [...next.childNodes]
        .filter(node => node instanceof HTMLElement)
        .forEach(child => child.classList.add('slide'));
    }
  }

  document.querySelectorAll('[data-githubV]').forEach(el => {
    fetch(
      `https://api.github.com/repos/${el.getAttribute(
        'data-githubV'
      )}/releases/latest`
    )
      .then(res => (res.ok ? res.json() : { message: 'Not Found' }))
      .then(res => {
        console.log(res);
        res = res.message !== 'Not Found' ? res.tag_name : 0;
        if (!res) throw Error;
        localStorage[
          'githubV@portfolio/' + el.getAttribute('data-githubV')
        ] = res;
        badge(el, res);
      })
      .catch(err =>
        badge(
          el,
          localStorage['githubV@portfolio/' + el.getAttribute('data-githubV')]
        )
      );
  });
  document.querySelectorAll('[data-npmV]').forEach(el => {
    fetch('https://api.npms.io/v2/package/' + el.getAttribute('data-npmV'))
      .then(res => (res.ok ? res.json() : { message: 'Not Found' }))
      .then(res => {
        res = res.code !== 'NOT_FOUND' ? res.collected.metadata.version : 0;
        if (!res) throw Error;
        localStorage['npmV@portfolio/' + el.getAttribute('data-npmV')] = res;
        badge(el, 'v' + res);
      })
      .catch(err =>
        badge(
          el,
          localStorage['npmV@portfolio/' + el.getAttribute('data-npmV')]
        )
      );
  });
};

construct();
document.addEventListener('readystatechange', construct);
