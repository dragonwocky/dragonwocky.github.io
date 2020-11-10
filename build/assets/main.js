/*
 * dragonwocky.me
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
 * (https://dragonwocky.me/) under the MIT license
 */

function main() {
  if (document.readyState !== 'complete') return false;
  document.removeEventListener('readystatechange', main);

  document.documentElement.setAttribute('data-useragent', navigator.userAgent);
  document.documentElement.setAttribute('data-platform', navigator.platform);
  document.documentElement.className +=
    !!('ontouchstart' in window) || !!('onmsgesturechange' in window)
      ? ' touch'
      : '';

  function scrollTop() {
    document.documentElement.scroll({ top: 0, behavior: 'smooth' });
    document.querySelector('main').scroll({ top: 0, behavior: 'smooth' });
  }
  document.querySelectorAll('.scroll-top').forEach((button) => {
    button.addEventListener('click', scrollTop);
    button.addEventListener('keyup', (ev) =>
      ev.key === 'Enter' ? scrollTop() : true
    );
  });

  fetch('/assets/timezones.json')
    .then((res) => res.json())
    .then((data) => {
      const timezone =
        data[
          new Date()
            .toLocaleTimeString('en-AU', { timeZoneName: 'long' })
            .replace(/^[\d:]*\s*(am|pm)\s*/gi, '')
        ];
      document.querySelectorAll('.utc-timestamp').forEach((time) => {
        let format = {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
        };
        if (time.innerHTML.length > 16)
          format = {
            ...format,
            hour: '2-digit',
            minute: '2-digit',
          };
        time.innerHTML =
          new Intl.DateTimeFormat('en', format)
            .formatToParts(new Date(time.innerHTML))
            .map(({ type, value }) => value)
            .reduce((string, part) =>
              part === ', ' && string.includes(',')
                ? string + ' '
                : string + part
            ) +
          ' ' +
          timezone;
      });
    })
    .catch((err) => console.error(err));
}
main();
document.addEventListener('readystatechange', main);
