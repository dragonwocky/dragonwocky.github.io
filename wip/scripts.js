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
    max: 15,
    scale: 1.04,
    speed: 500,
    glare: true,
    'max-glare': 0.05
  });
};

construct();
document.addEventListener('readystatechange', construct);
