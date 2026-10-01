import { DRIVERS, CIRCUITS, country } from '../data.js';
import { h, shuffle, formatNumber, saveHighscore, getHighscore } from '../utils.js';
import { resultScreen, modePicker } from '../ui.js';

const driverItems = DRIVERS.map((d) => ({ name: d.name, sub: `${country(d.nat).flag} ${country(d.nat).name}`, data: d }));

const MODES = [
  { id: 'wins', icon: '🏁', label: 'GP-Siege', items: driverItems, value: (i) => i.data.wins, unit: 'Siege' },
  { id: 'poles', icon: '⏱️', label: 'Pole-Positions', items: driverItems, value: (i) => i.data.poles, unit: 'Poles' },
  { id: 'podiums', icon: '🍾', label: 'Podestplätze', items: driverItems, value: (i) => i.data.podiums, unit: 'Podien' },
  { id: 'circuits', icon: '📏', label: 'Streckenlänge',
    items: CIRCUITS.map((c) => ({ name: c.name, sub: `${country(c.nat).flag} ${country(c.nat).name}`, data: c })),
    value: (i) => i.data.length, unit: 'km', digits: 3 },
];

export default {
  id: 'higher-lower',
  title: 'Higher or Lower',
  icon: '↕️',
  tagline: 'Hat der nächste Fahrer mehr oder weniger Siege, Poles, Podien? Wie lang hält deine Serie?',

  start(root, { exit }) {
    let onKey = null;

    const pick = () => root.replaceChildren(modePicker({
      heading: 'Was wird verglichen?',
      modes: MODES.map((m) => ({ ...m, desc: `Rekord: ${getHighscore(`higher-lower:${m.id}`)}` })),
      onPick: play,
    }));

    function play(mode) {
      let deck = shuffle(mode.items);
      const draw = (exclude) => {
        if (deck.length === 0) deck = shuffle(mode.items.filter((i) => i !== exclude));
        return deck.pop();
      };
      let current = draw();
      let next = draw(current);
      let streak = 0;
      let locked = false;

      const fmt = (item) => `${formatNumber(mode.value(item), mode.digits ?? 0)} ${mode.unit}`;

      function card(item, revealed, extraClass = '') {
        return h('div', { class: `card hl-card ${extraClass}` },
          h('h2', {}, item.name),
          h('p', { class: 'muted' }, item.sub),
          h('div', { class: 'hl-value' }, revealed ? fmt(item) : '?'),
        );
      }

      function render() {
        locked = false;
        root.replaceChildren(h('section', { class: 'hl fade-in' },
          h('div', { class: 'hud' },
            h('span', {}, `${mode.icon} ${mode.label}`),
            h('span', { class: 'streak' }, `🔥 Serie: ${streak}`),
          ),
          h('div', { class: 'hl-grid' },
            card(current, true),
            h('div', { class: 'vs' }, 'VS'),
            h('div', { class: 'hl-next' },
              card(next, false, 'pending'),
              h('div', { class: 'hl-buttons' },
                h('button', { class: 'btn primary', onClick: () => guess('higher') }, '▲ Mehr'),
                h('button', { class: 'btn', onClick: () => guess('lower') }, '▼ Weniger'),
              ),
            ),
          ),
          h('p', { class: 'muted small center' }, 'Tipp: Pfeiltasten ↑ / ↓. Gleichstand zählt als richtig.'),
        ));
      }

      function guess(dir) {
        if (locked) return;
        locked = true;
        const a = mode.value(current);
        const b = mode.value(next);
        const correct = a === b || (dir === 'higher' ? b > a : b < a);
        const nextCard = root.querySelector('.hl-next .card');
        nextCard.replaceWith(card(next, true, correct ? 'correct' : 'wrong'));
        root.querySelector('.hl-buttons').replaceChildren(
          h('p', { class: `feedback ${correct ? 'ok' : 'bad'}` }, correct ? 'Richtig! ✅' : 'Falsch! ❌'),
        );
        setTimeout(() => {
          if (!correct) return gameOver();
          streak++;
          current = next;
          next = draw(current);
          render();
        }, 1100);
      }

      function gameOver() {
        const record = saveHighscore(`higher-lower:${mode.id}`, streak);
        saveHighscore('higher-lower', streak);
        root.replaceChildren(resultScreen({
          title: 'Game Over',
          score: streak,
          record,
          lines: [`${next.name}: ${fmt(next)} vs. ${current.name}: ${fmt(current)}`],
          onRestart: () => play(mode),
          onMenu: exit,
        }));
      }

      if (onKey) document.removeEventListener('keydown', onKey);
      onKey = (e) => {
        if (!root.querySelector('.hl-buttons button')) return;
        if (e.key === 'ArrowUp') guess('higher');
        if (e.key === 'ArrowDown') guess('lower');
      };
      document.addEventListener('keydown', onKey);
      render();
    }

    pick();
    return () => onKey && document.removeEventListener('keydown', onKey);
  },
};
