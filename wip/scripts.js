/*
 * dragonwocky.me
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
 * (https://dragonwocky.me/) under the MIT license
 */

class HashRouter {
  constructor(options) {
    if (typeof options !== 'object') options = {};

    if (HashRouter.prototype.INITIATED)
      throw Error('hashrouter: only 1 instance per page allowed!');
    HashRouter.prototype.INITIATED = true;

    this.ID;

    this._nav = [...document.querySelectorAll('nav a[href^="#"]')];
    this._pages = this._nav
      .map(entry => {
        const ID = entry.getAttribute('href');
        console.log(ID);
        entry.onclick = async ev => {
          ev.preventDefault();
          this.set(ID);
        };
        return document.getElementById(ID.slice(1));
      })
      .filter(x => x);
    this._default = `#${this._pages[0].id}`;
    window.onhashchange = this.watchHash.bind(this);

    this.set();
    return this;
  }

  set(ID) {
    this.highlightLink(ID);
    this.setHash(ID);
    this.showPage(ID);
  }
  parseID(ID) {
    if (!ID || typeof ID !== 'string') ID = location.hash || this._default;
    if (!ID.startsWith('#')) ID = `#${ID}`;
    if (!this._nav.find(el => el.getAttribute('href') === ID))
      ID = this._default;
    return ID;
  }

  highlightLink(ID) {
    this.ID = this.parseID(ID);
    this._nav.forEach(el =>
      el.getAttribute('href') === this.ID
        ? el.classList.add('active')
        : el.classList.remove('active')
    );
    return true;
  }
  showPage(ID) {
    this.ID = this.parseID(ID);
    console.log(this._pages);
    this._pages.forEach(el =>
      `#${el.id}` === this.ID
        ? el.classList.add('visible')
        : el.classList.remove('visible')
    );
    return true;
  }

  watchHash(ev) {
    ev.preventDefault();
    if (ev.newURL !== ev.oldURL) this.set();
  }
  setHash(ID) {
    this.ID = this.parseID(ID);
    ID = this.ID === this._default ? '#' : this.ID;
    if (history.replaceState) {
      history.replaceState(null, null, ID);
    } else location.replace(ID);
    return true;
  }
}

let constructed = false;
const construct = async () => {
  if (document.readyState !== 'complete' || constructed) return false;
  constructed = true;

  new HashRouter();

  VanillaTilt.init(document.querySelectorAll('#portfolio > section'), {
    reverse: true,
    max: 5,
    scale: 1.03,
    speed: 500,
    glare: true,
    'max-glare': 0.02
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
  document.querySelectorAll('.backToTop').forEach(button =>
    button.addEventListener('click', ev => {
      document.documentElement.scroll({ top: 0, behavior: 'smooth' });
      document.querySelector('main').scroll({ top: 0, behavior: 'smooth' });
    })
  );

  document.querySelectorAll('[data-githubV]').forEach(el => {
    fetch(
      `https://api.github.com/repos/${el.getAttribute(
        'data-githubV'
      )}/releases/latest`
    )
      .then(res => (res.ok ? res.json() : { message: 'Not Found' }))
      .then(res => {
        res = res.message !== 'Not Found' ? res.tag_name : 0;
        if (!res) throw Error;
        localStorage[
          'githubV@portfolio/' + el.getAttribute('data-githubV')
        ] = res;
        badge(el, res);
      });
  });
  document.querySelectorAll('[data-npmV]').forEach(el => {
    fetch('https://api.npms.io/v2/package/' + el.getAttribute('data-npmV'))
      .then(res => (res.ok ? res.json() : { message: 'Not Found' }))
      .then(res => {
        res = res.code !== 'NOT_FOUND' ? res.collected.metadata.version : 0;
        if (!res) throw Error;
        localStorage['npmV@portfolio/' + el.getAttribute('data-npmV')] = res;
        badge(el, 'v' + res);
      });
  });
};

construct();
document.addEventListener('readystatechange', construct);
