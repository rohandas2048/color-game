const REVEAL_MS = 3000;
const TOTAL_ROUNDS = 5;
const COLORBLIND_MODE = false;

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function randomHSV() {
  if (COLORBLIND_MODE) {
    return {
      h: pick([0, 180]),
      s: pick([0, 100]),
      v: pick([0, 100]),
    };
  }
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

function scoreGuess(target, guess) {
  const dhRaw = Math.abs(target.h - guess.h);
  const dh = Math.min(dhRaw, 360 - dhRaw) / 180;
  const ds = Math.abs(target.s - guess.s) / 100;
  const dv = Math.abs(target.v - guess.v) / 100;
  const score = Math.round(100 * (1 - (dh + ds + dv) / 3));
  return Math.max(0, score);
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

  if (COLORBLIND_MODE) {
    sliderH.min = 0; sliderH.max = 180; sliderH.step = 180; sliderH.value = 0;
    sliderS.min = 0; sliderS.max = 100; sliderS.step = 100; sliderS.value = 0;
    sliderV.min = 0; sliderV.max = 100; sliderV.step = 100; sliderV.value = 100;
  }

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
      if (COLORBLIND_MODE) { sliderH.value = 0; sliderS.value = 0; sliderV.value = 100; }
      else { sliderH.value = 180; sliderS.value = 50; sliderV.value = 50; }
      updateGuessPreview();
      startRound();
    } else {
      renderSummary();
      app.dataset.screen = 'summary';
    }
  });

  const summaryRows = document.getElementById('summary-rows');
  const totalScoreEl = document.getElementById('total-score');
  const playAgainBtn = document.getElementById('play-again-btn');

  function renderSummary() {
    summaryRows.innerHTML = '';
    let total = 0;
    state.guesses.forEach((entry, i) => {
      const s = scoreGuess(entry.target, entry.guess);
      total += s;
      const row = document.createElement('div');
      row.className = 'summary-row';
      row.innerHTML = `
        <div class="round-label">${i + 1}</div>
        <div class="swatch" style="background:${hsvToCss(entry.target.h, entry.target.s, entry.target.v)}" title="target"></div>
        <div class="swatch" style="background:${hsvToCss(entry.guess.h, entry.guess.s, entry.guess.v)}" title="guess"></div>
        <div class="score">${s}</div>
      `;
      summaryRows.appendChild(row);
    });
    totalScoreEl.textContent = `Total: ${total} / ${TOTAL_ROUNDS * 100}`;
  }

  const helpBtn = document.getElementById('help-btn');
  const helpModal = document.getElementById('help-modal');
  const helpClose = document.getElementById('help-close');
  const helpBackdrop = helpModal.querySelector('.modal-backdrop');

  function openHelp() { helpModal.hidden = false; }
  function closeHelp() { helpModal.hidden = true; }

  helpBtn.addEventListener('click', openHelp);
  helpClose.addEventListener('click', closeHelp);
  helpBackdrop.addEventListener('click', closeHelp);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !helpModal.hidden) { closeHelp(); return; }
    const screen = app.dataset.screen;
    if (e.code === 'Space' && screen === 'start') {
      e.preventDefault();
      startBtn.click();
    } else if (e.code === 'Enter' && screen === 'play' && screenPlay.dataset.phase === 'guess') {
      e.preventDefault();
      submitBtn.click();
    }
  });

  playAgainBtn.addEventListener('click', () => {
    resetState();
    if (COLORBLIND_MODE) { sliderH.value = 0; sliderS.value = 0; sliderV.value = 100; }
    else { sliderH.value = 180; sliderS.value = 50; sliderV.value = 50; }
    updateGuessPreview();
    app.dataset.screen = 'start';
  });

  function setSlidersDisabled(disabled) {
    [sliderH, sliderS, sliderV].forEach(s => { s.disabled = disabled; });
  }

  function startRound() {
    state.target = randomHSV();
    roundCounter.textContent = `Round ${state.round} / ${TOTAL_ROUNDS}`;
    targetPanel.style.backgroundColor = hsvToCss(state.target.h, state.target.s, state.target.v);
    screenPlay.dataset.phase = 'reveal';
    setSlidersDisabled(true);
    console.log('target HSV:', state.target);

    const endAt = Date.now() + REVEAL_MS;
    revealTimer.textContent = (REVEAL_MS / 1000).toFixed(1) + 's';
    const tick = setInterval(() => {
      const remaining = Math.max(0, endAt - Date.now());
      revealTimer.textContent = (remaining / 1000).toFixed(1) + 's';
      if (remaining <= 0) {
        clearInterval(tick);
        screenPlay.dataset.phase = 'guess';
        setSlidersDisabled(false);
      }
    }, 100);
  }

  startBtn.addEventListener('click', () => {
    app.dataset.screen = 'play';
    startRound();
  });
});
