const REVEAL_MS = 3000;
const TOTAL_ROUNDS = 5;

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

const state = {
  round: 1,
  target: null,
  guesses: [],
};

function resetState() {
  state.round = 1;
  state.target = null;
  state.guesses = [];
}

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  const startBtn = document.getElementById('start-btn');
  const screenPlay = document.getElementById('screen-play');
  const targetPanel = document.getElementById('target-panel');
  const roundCounter = document.getElementById('round-counter');
  const revealTimer = document.getElementById('reveal-timer');
  const guessSwatch = document.getElementById('guess-swatch');
  const sliderH = document.getElementById('slider-h');
  const sliderS = document.getElementById('slider-s');
  const sliderV = document.getElementById('slider-v');
  const valH = document.getElementById('val-h');
  const valS = document.getElementById('val-s');
  const valV = document.getElementById('val-v');

  function currentGuess() {
    return { h: +sliderH.value, s: +sliderS.value, v: +sliderV.value };
  }

  function updateGuessPreview() {
    const g = currentGuess();
    valH.textContent = g.h;
    valS.textContent = g.s;
    valV.textContent = g.v;
    guessSwatch.style.backgroundColor = hsvToCss(g.h, g.s, g.v);
  }

  [sliderH, sliderS, sliderV].forEach(s => s.addEventListener('input', updateGuessPreview));
  updateGuessPreview();

  const submitBtn = document.getElementById('submit-btn');
  submitBtn.addEventListener('click', () => {
    state.guesses.push({ target: state.target, guess: currentGuess() });
    if (state.round < TOTAL_ROUNDS) {
      state.round += 1;
      sliderH.value = 180; sliderS.value = 50; sliderV.value = 50;
      updateGuessPreview();
      startRound();
    } else {
      app.dataset.screen = 'summary';
      console.log('final guesses:', state.guesses);
    }
  });

  function startRound() {
    state.target = randomHSV();
    roundCounter.textContent = `Round ${state.round} / ${TOTAL_ROUNDS}`;
    targetPanel.style.backgroundColor = hsvToCss(state.target.h, state.target.s, state.target.v);
    screenPlay.dataset.phase = 'reveal';
    console.log('target HSV:', state.target);

    const endAt = Date.now() + REVEAL_MS;
    revealTimer.textContent = (REVEAL_MS / 1000).toFixed(1) + 's';
    const tick = setInterval(() => {
      const remaining = Math.max(0, endAt - Date.now());
      revealTimer.textContent = (remaining / 1000).toFixed(1) + 's';
      if (remaining <= 0) {
        clearInterval(tick);
        screenPlay.dataset.phase = 'guess';
      }
    }, 100);
  }

  startBtn.addEventListener('click', () => {
    app.dataset.screen = 'play';
    startRound();
  });
});
