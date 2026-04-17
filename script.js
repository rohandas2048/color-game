document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  const startBtn = document.getElementById('start-btn');

  function goTo(screen) {
    app.dataset.screen = screen;
  }

  startBtn.addEventListener('click', () => goTo('play'));
});
