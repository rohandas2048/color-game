function randomHSV() {
  return {
    h: Math.floor(Math.random() * 360),
    s: Math.floor(Math.random() * 101),
    v: Math.floor(Math.random() * 101),
  };
}

function hsvToRgb(h, s, v) {
  const sn = s / 100;
  const vn = v / 100;
  const c = vn * sn;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r1 = 0, g1 = 0, b1 = 0;
  if (hp < 1)      [r1, g1, b1] = [c, x, 0];
  else if (hp < 2) [r1, g1, b1] = [x, c, 0];
  else if (hp < 3) [r1, g1, b1] = [0, c, x];
  else if (hp < 4) [r1, g1, b1] = [0, x, c];
  else if (hp < 5) [r1, g1, b1] = [x, 0, c];
  else             [r1, g1, b1] = [c, 0, x];
  const m = vn - c;
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

function hsvToCss(h, s, v) {
  const { r, g, b } = hsvToRgb(h, s, v);
  return `rgb(${r}, ${g}, ${b})`;
}

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  const startBtn = document.getElementById('start-btn');

  function goTo(screen) {
    app.dataset.screen = screen;
    if (screen === 'play') {
      const target = randomHSV();
      document.body.style.backgroundColor = hsvToCss(target.h, target.s, target.v);
      console.log('target HSV:', target);
    } else {
      document.body.style.backgroundColor = '';
    }
  }

  startBtn.addEventListener('click', () => goTo('play'));
});
