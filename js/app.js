import { GAMES } from './games/index.js';
import { DATA_AS_OF } from './data.js';
import { h, getHighscore } from './utils.js';

const app = document.getElementById('app');
let cleanup = null;

function renderHome() {
  app.replaceChildren(
    h('section', { class: 'hero fade-in' },
      h('h1', {}, 'Lights out – ', h('span', { class: 'accent' }, 'and away we go!')),
      h('p', { class: 'muted' }, 'Teste dein Formel-1-Wissen in fünf Spielen. Rekorde werden auf diesem Gerät gespeichert.'),
    ),
    h('div', { class: 'game-grid' },
      GAMES.map((g) => h('a', { class: 'game-card', href: `#/${g.id}` },
        h('span', { class: 'game-icon' }, g.icon),
        h('h2', {}, g.title),
        h('p', {}, g.tagline),
        h('span', { class: 'best' }, `Rekord: ${getHighscore(g.id)}`),
      )),
    ),
    h('p', { class: 'muted small center' }, `Statistiken: Stand ${DATA_AS_OF}, ohne Gewähr.`),
  );
}

function renderGame(game) {
  const root = h('div', { class: 'game-root' });
  app.replaceChildren(
    h('div', { class: 'game-header' },
      h('a', { href: '#/', class: 'back' }, '← Alle Spiele'),
      h('h1', {}, `${game.icon} ${game.title}`),
    ),
    root,
  );
  cleanup = game.start(root, { exit: () => { location.hash = '#/'; } }) || null;
}

function route() {
  if (cleanup) cleanup();
  cleanup = null;
  const id = location.hash.replace(/^#\/?/, '');
  const game = GAMES.find((g) => g.id === id);
  window.scrollTo(0, 0);
  if (game) renderGame(game);
  else renderHome();
}

window.addEventListener('hashchange', route);
route();
