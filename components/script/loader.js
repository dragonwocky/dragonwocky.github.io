// import processClasses, { configure, exportCSS } from './runcss.js';
import 'https://js.stripe.com/v3/';

// const copyToClipboard = (str) => {
//   const el = document.createElement('textarea');
//   el.value = str;
//   el.setAttribute('readonly', '');
//   el.style.position = 'absolute';
//   el.style.left = '-9999px';
//   document.body.appendChild(el);
//   el.select();
//   document.execCommand('copy');
//   document.body.removeChild(el);
// };

// configure({
//   colors: {
//     'red-ribbon': {
//       default: '#F31145',
//       50: '#FEF3F6',
//       100: '#FEE7EC',
//       200: '#FCC4D1',
//       300: '#FAA0B5',
//       400: '#F7587D',
//       500: '#F31145',
//       600: '#DB0F3E',
//       700: '#920A29',
//       800: '#6D081F',
//       900: '#490515',
//     },
//     'dark': {
//       default: '#a0aec0',
//       50: '#ffffff',
//       100: '#f6f7f9',
//       200: '#e0e5eb',
//       300: '#cbd2dc',
//       400: '#b6c0ce',
//       500: '#a0aeC0',
//       600: '#647a96',
//       700: '#3b4859',
//       800: '#12161c',
//       900: '#000000',
//     },
//     'light': {
//       default: '#a0aec0',
//       50: '#000000',
//       100: '#14191f',
//       200: '#333e4d',
//       300: '#51637b',
//       400: '#7287a2',
//       500: '#a0aec0',
//       600: '#b5c0ce',
//       700: '#cbd2dc',
//       800: '#e0e5eb',
//       900: '#f6f7f9',
//     },
//   },
// });
function loadTheme(mode = '') {
  if (!['dark', 'light'].includes(mode)) mode === 'dark';
  mode = '-' + mode;
  for (const $elem of document.querySelectorAll('[class]')) {
    const prevTheme = [...$elem.classList].filter((cls) =>
      cls.includes(mode === '-light' ? '-dark' : '-light')
    );
    if (prevTheme.length) {
      const newTheme = prevTheme.map((cls) =>
        cls.replace(mode === '-light' ? /-dark/g : /-light/g, mode)
      );
      $elem.classList.remove(...prevTheme);
      $elem.classList.add(...newTheme);
    }
    // processClasses([...$elem.classList].join(' '));
  }
  localStorage.theme = mode.slice(1);
}
loadTheme(localStorage.theme);
document.querySelector('#toggleTheme').addEventListener('change', (ev) => {
  loadTheme(ev.target.checked ? 'light' : 'dark');
  // copyToClipboard(exportCSS());
});
document.querySelector('#toggleTheme').checked = localStorage.theme === 'light';
console.log('%chello 👋', 'font-size: 1.5rem; font-weight: bold;');
// document.body.removeAttribute('data-loading');

// datetime

document.querySelectorAll('[data-datetime]').forEach(($elem) => {
  const datetime = new Date($elem.innerText);
  function add0(num) {
    return num < 10 ? '0' : '';
  }
  $elem.innerText = `${
    ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'][datetime.getDay()]
  }, ${add0(datetime.getDate())}${datetime.getDate()} ${
    [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sept',
      'Oct',
      'Nov',
      'Dec',
    ][datetime.getMonth()]
  } ${datetime.getFullYear()} ${add0(datetime.getHours() % 12)}${
    datetime.getHours() % 12
  }:${add0(datetime.getMinutes())}${datetime.getMinutes()} ${
    datetime.getHours() > 12 ? 'PM' : 'AM'
  }`;
});

// tilt

function createElement(html) {
  const $template = document.createElement('template');
  $template.innerHTML = html.trim();
  return $template.content.firstElementChild;
}
function elementOffset($elem, dir, offset = 0) {
  if (!$elem) return offset;
  return elementOffset(
    $elem.offsetParent,
    dir,
    ($elem[`offset${dir[0].toUpperCase() + dir.slice(1).toLowerCase()}`] || 0) +
      offset
  );
}
const scale = 1.01,
  tiltMultiplier = 0.008,
  returnDuration = 300,
  mouseGlow = {
    enabled: true,
    width: 256,
    height: 256,
  };
document.querySelectorAll('[data-tilt-container]').forEach(($container) => {
  const cards = [...$container.querySelectorAll('[data-tilt-card]')].map(
    ($card) => {
      if (!mouseGlow.enabled) return [$card, null];
      const $glow = createElement('<span data-tilt-glow></span>');
      $glow.style.position = 'absolute';
      $glow.style.height = `${mouseGlow.height}px`;
      $glow.style.borderRadius = '100%';
      $glow.style.filter = 'blur(5rem)';
      $glow.style.opacity = 0.1;
      $glow.style.backgroundColor = 'white';
      $card.appendChild($glow);
      $card.style.overflow = 'hidden';
      return [$card, $glow];
    }
  );
  $container.parentElement.addEventListener('mousemove', (ev) => {
    $container.style.transitionDuration = '';
    const { width, height } = $container.getBoundingClientRect(),
      rotateX =
        (width / 2 - (ev.clientY - elementOffset($container, 'top'))) *
        tiltMultiplier,
      rotateY =
        (height / 2 - (ev.clientX - elementOffset($container, 'left'))) *
        -tiltMultiplier,
      transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
    cards.forEach(([$card, $glow]) => {
      $card.style.transform = transform;
      if ($glow) {
        $glow.style.width = `${mouseGlow.width}px`;
        $glow.style.top = `${
          ev.clientY - elementOffset($card, 'top') - mouseGlow.height / 2
        }px`;
        $glow.style.left = `${
          ev.clientX - elementOffset($card, 'left') - mouseGlow.width / 2
        }px`;
      }
    });
  });
  $container.parentElement.addEventListener('mouseleave', (ev) => {
    cards.forEach(([$card, $glow]) => {
      if ($glow) $glow.style.width = 0;
      $card.style.transitionDuration = `${returnDuration}ms`;
      $card.style.transform = '';
      setTimeout(() => {
        $card.style.transitionDuration = '';
      }, returnDuration);
    });
  });
});

// scrollup

const $scrollup = document.querySelector('#scrollup');
document.querySelector('#scrollup').addEventListener('click', (ev) => {
  [window, document.querySelector('main')].forEach(($scroller) =>
    $scroller.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    })
  );
});
function showScrollup() {
  $scrollup.classList.remove('duration-50');
  $scrollup.classList.add('duration-250');
  $scrollup.classList.remove('opacity-0');
  $scrollup.classList.add('opacity-100');
}
function hideScrollup() {
  $scrollup.classList.remove('duration-250');
  $scrollup.classList.add('duration-50');
  $scrollup.classList.remove('opacity-100');
  $scrollup.classList.add('opacity-0');
}
hideScrollup();
window.addEventListener('scroll', (event) => {
  if (
    document.documentElement.scrollTop &&
    window.innerHeight + document.documentElement.scrollTop * 1.25 >
      document.querySelector('aside').clientHeight
  ) {
    showScrollup();
  } else hideScrollup();
});
document.querySelector('main').addEventListener('scroll', (ev) => {
  if (ev.target.scrollTop > ev.target.clientHeight / 4) {
    showScrollup();
  } else hideScrollup();
});

// stripe

function createAlert(title, message, icon) {
  const $alertTemplate = document.querySelector('[data-alert-template]');
  if (!$alertTemplate) return;
  const $alert = $alertTemplate.cloneNode(true);
  $alert.removeAttribute('data-alert-template');
  $alert.setAttribute('data-alert', '');
  $alert.classList.remove('hidden');
  $alert
    .querySelector('[data-alert-dismiss]')
    .addEventListener('click', (ev) => {
      const fadeDuration = getComputedStyle($alert).getPropertyValue(
        'transition-duration'
      );
      $alert.style.opacity = 0;
      setTimeout(
        () => $alert.remove(),
        fadeDuration.endsWith('s')
          ? parseFloat(fadeDuration) * 1000
          : parseFloat(fadeDuration)
      );
    });

  $alert.querySelector('[data-alert-title]').innerHTML = title;
  $alert.querySelector('[data-alert-message]').innerHTML = message;
  $alert.querySelector('[data-alert-icon]').innerHTML = icon;

  document.querySelector('[data-alert-container]').appendChild($alert);
  setTimeout(() => {
    $alert.style.opacity = 1;
  }, 1);
  return $alert;
}

const stripe = Stripe(
  'pk_live_51HjMX9EmZ8V4VWEQwiRf4BIW8I6PeCDUObomhBlVVyGftYrZOCmKdsufLOJJ0KeCFnfApFJeyMFFv6J67gbfHnzE00KOXF0kZS'
);
document
  .querySelectorAll('button[data-stripe][data-checkout-mode][data-price-id]')
  .forEach(($button) => {
    $button.addEventListener('click', (ev) => {
      stripe
        .redirectToCheckout({
          mode: ev.target.dataset.checkoutMode,
          submitType: 'donate',
          lineItems: [{ price: ev.target.dataset.priceId, quantity: 1 }],
          successUrl: `${location.origin}?donation=success&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${location.origin}?donation=cancelled&session_id={CHECKOUT_SESSION_ID}`,
        })
        .then((result) => {
          if (result.error)
            createAlert(
              'error...',
              result.error.message.toLowerCase(),
              `<svg class="w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                ></path>
              </svg>`
            );
        });
    });
  });
const search = new URLSearchParams(window.location.search),
  donation = {
    action: search.get('donation'),
    session: search.get('session_id'),
  };
if (donation.action === 'success' && donation.session)
  createAlert(
    'thanks!',
    'your support will help me continue to build open source projects free for people to use.',
    `<svg class="w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g id="16 / heart">
        <path id="icon" fill-rule="evenodd" clip-rule="evenodd" d="M16.7825 1.50002C15.2066 1.5 14.1705 1.68235 12.9856 2.23471C12.6358 2.39778 12.3026 2.58745 11.9873 2.8033C11.688 2.602 11.3723 2.42329 11.0416 2.2675C9.8353 1.69927 8.74792 1.5 7.22727 1.5C3.05775 1.5 0 4.82041 0 9.11988C0 12.3419 1.85481 15.4023 5.26762 18.3256C7.03508 19.8395 9.28645 21.3342 10.9096 22.1348L12 22.6725L13.0904 22.1348C14.7135 21.3342 16.9649 19.8395 18.7324 18.3256C22.1452 15.4023 24 12.3419 24 9.11988C24 4.8632 20.9159 1.51632 16.7825 1.50002ZM21 9.11988C21 11.3158 19.5918 13.6393 16.7808 16.0472C15.2884 17.3254 13.3831 18.6063 12 19.3243C10.6169 18.6063 8.71156 17.3254 7.21925 16.0472C4.40823 13.6393 3 11.3158 3 9.11988C3 6.42458 4.77233 4.5 7.22727 4.5C8.33737 4.5 8.99812 4.62109 9.76319 4.98148C10.2048 5.18951 10.5924 5.46223 10.9269 5.80209L12.005 6.89747L13.0739 5.79295C13.4158 5.43952 13.8082 5.16122 14.2532 4.95378C14.9936 4.6086 15.6106 4.5 16.7765 4.50001C19.1975 4.50957 21 6.46561 21 9.11988Z" fill="currentColor"/>
      </g>
    </svg>`
  );
if (donation.action && donation.session) {
  console.info(
    `<stripe donation> action: ${donation.action}, session_id: ${donation.session}`
  );
  window.history.replaceState(null, document.title, './');
}
