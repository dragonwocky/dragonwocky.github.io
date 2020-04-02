/*
 * dragonwocky.me
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
 * (https://dragonwocky.me/) under the MIT license
 */

let constructed = false;
const construct = () => {
  if (document.readyState !== 'complete' || constructed) return false;
  constructed = true;

  const portfolio = document.querySelectorAll('.portfolio > section');
  VanillaTilt.init(portfolio, {
    reverse: true,
    max: 5,
    scale: 1.03,
    speed: 500,
    glare: true,
    'max-glare': 0.02
  });

  document.querySelectorAll('[data-githubV]').forEach(el => {
    fetch(
      `https://api.github.com/repos/${el.getAttribute(
        'data-githubV'
      )}/releases/latest`
    )
      .then(res => (res.ok ? res.json() : { message: 'Not Found' }))
      .then(res => {
        res = res.message !== 'Not Found' ? res.tag_name : 0;
        if (res) {
          el.querySelector('a').innerHTML = `${el
            .querySelector('a')
            .innerHTML.trim()}<span class="slide">${res}</span>`;
          [...el.nextSibling.childNodes]
            .filter(node => node instanceof HTMLElement)
            .forEach(child => child.classList.add('slide'));
        }
      })
      .catch(err => {});
  });
  document.querySelectorAll('[data-npmV]').forEach(el => {
    fetch('https://api.npms.io/v2/package/' + el.getAttribute('data-npmV'))
      .then(res => (res.ok ? res.json() : { message: 'Not Found' }))
      .then(res => {
        res =
          res.code !== 'NOT_FOUND' ? 'v' + res.collected.metadata.version : 0;
        if (res) {
          el.querySelector('a').innerHTML = `${el
            .querySelector('a')
            .innerHTML.trim()}<span class="slide">${res}</span>`;
          [...el.nextSibling.childNodes]
            .filter(node => node instanceof HTMLElement)
            .forEach(child => child.classList.add('slide'));
        }
      })
      .catch(err => {});
  });
};

construct();
document.addEventListener('readystatechange', construct);
