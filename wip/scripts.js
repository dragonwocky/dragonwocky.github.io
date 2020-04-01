1;
1;
1;
1;
1;
1;
1;
1;
1;
1;
1;
1;
1;
1;
1;
1;
1;
1;
1;
1;
1;

const construct = () => {
  const calc = (a, b) => {
    const per = Number((a / b).toFixed(1));
    if (!Number.isFinite(per) || isNaN(per) || per === 0) return -15;
    if (per > 0.5) return per * 15;
    return per + 0.5 * -15;
  };

  document.querySelectorAll('.portfolio section').forEach(el => {
    el.addEventListener('mousemove', ev => {
      requestAnimationFrame(() => {
        el.style.setProperty('--mouseX', calc(ev.offsetX, el.offsetWidth));
        el.style.setProperty('--mouseY', calc(ev.offsetY, el.offsetHeight));
      });
    });
  });
};

construct();
document.addEventListener('readystatechange', construct);
