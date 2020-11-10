/*
 * notion-renderer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
 * (https://dragonwocky.me/) under the MIT license
 */

function notion() {
  if (document.readyState !== 'complete') return false;
  document.removeEventListener('readystatechange', notion);

  fetch('https://dragonwocky.me/assets/timezones.json')
    .then((res) => res.json())
    .then((data) => {
      const timezone =
        data[
          new Date()
            .toLocaleTimeString('en-AU', { timeZoneName: 'long' })
            .replace(/^[\d:]*\s*(am|pm)\s*/gi, '')
        ];
      document.querySelectorAll('.notion-datetime').forEach((time) => {
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

  document
    .querySelectorAll('.notion-block .notion-equation')
    .forEach((elem) => {
      katex.render(elem.innerHTML, elem, {
        throwOnError: false,
        displayMode: true,
      });
    });
}
notion();
document.addEventListener('readystatechange', notion);
