import { DRIVERS, CIRCUITS, TEAMS, country } from '../data.js';
import { h, sample, sampleDistinct, rankingScore, formatNumber, saveHighscore } from '../utils.js';
import { resultScreen, modePicker } from '../ui.js';

const SIZE = 5;

const driverItem = (d) => ({ name: d.name, sub: `${country(d.nat).flag} ${d.teams.slice(-1)[0]}`, data: d });
const circuitItem = (c) => ({ name: c.name, sub: `${country(c.nat).flag} ${country(c.nat).name}`, data: c });
const teamItem = (t) => ({ name: t.name, sub: `${country(t.nat).flag} ${country(t.nat).name}`, data: t });

const LEGENDS = DRIVERS.filter((d) => d.titles >= 2 || d.wins >= 20);

const CATEGORIES = [
  { id: 'wins', icon: '🏁', label: 'Fahrer nach Siegen', desc: 'Platz 1 = meiste GP-Siege',
    items: DRIVERS.map(driverItem), value: (i) => i.data.wins, format: (v) => `${v} Siege` },
  { id: 'poles', icon: '⏱️', label: 'Fahrer nach Poles', desc: 'Platz 1 = meiste Pole-Positions',
    items: DRIVERS.map(driverItem), value: (i) => i.data.poles, format: (v) => `${v} Poles` },
  { id: 'podiums', icon: '🍾', label: 'Fahrer nach Podien', desc: 'Platz 1 = meiste Podestplätze',
    items: DRIVERS.map(driverItem), value: (i) => i.data.podiums, format: (v) => `${v} Podien` },
  { id: 'debut', icon: '📅', label: 'Fahrer nach Debüt', desc: 'Platz 1 = frühestes Debüt',
    items: DRIVERS.map(driverItem), value: (i) => i.data.debut, format: (v) => `Debüt ${v}`, ascending: true },
  { id: 'length', icon: '📏', label: 'Strecken nach Länge', desc: 'Platz 1 = längste Strecke',
    items: CIRCUITS.map(circuitItem), value: (i) => i.data.length, format: (v) => `${formatNumber(v, 3)} km` },
  { id: 'teams', icon: '🏆', label: 'Teams nach Titeln', desc: 'Platz 1 = meiste Konstrukteurstitel',
    items: TEAMS.map(teamItem), value: (i) => i.data.titles, format: (v) => `${v} Titel` },
  { id: 'goat', icon: '🐐', label: 'Die Besten aller Zeiten', desc: 'Dein persönliches Ranking',
    items: LEGENDS.map(driverItem) },
  { id: 'fav-circuits', icon: '❤️', label: 'Lieblingsstrecken', desc: 'Dein persönliches Ranking',
    items: CIRCUITS.map(circuitItem) },
];

export default {
  id: 'blind-ranking',
  title: 'Blind Ranking',
  icon: '🙈',
  tagline: 'Fünf Einträge, einer nach dem anderen. Platziere jeden sofort – ohne zu wissen, was noch kommt.',

  start(root, { exit }) {
    const pick = () => root.replaceChildren(modePicker({
      heading: 'Wähle eine Kategorie',
      modes: CATEGORIES,
      onPick: play,
    }));

    function play(cat) {
      const items = cat.value ? sampleDistinct(cat.items, SIZE, cat.value) : sample(cat.items, SIZE);
      const slots = Array(SIZE).fill(null);
      let index = 0;

      function render() {
        if (index === SIZE) return finish();
        const current = items[index];
        root.replaceChildren(h('section', { class: 'blind fade-in' },
          h('p', { class: 'eyebrow' }, `${cat.icon} ${cat.label} · ${cat.desc}`),
          h('div', { class: 'card reveal' },
            h('small', { class: 'muted' }, `Eintrag ${index + 1} von ${SIZE}`),
            h('h2', {}, current.name),
            h('p', { class: 'muted' }, current.sub),
          ),
          h('ol', { class: 'slots' },
            slots.map((slot, i) => h('li', {},
              h('button', {
                class: `slot ${slot ? 'filled' : ''}`,
                disabled: !!slot,
                onClick: () => { slots[i] = current; index++; render(); },
              },
              h('span', { class: 'slot-num' }, i + 1),
              h('span', {}, slot ? slot.name : 'Hier platzieren'),
              ),
            )),
          ),
        ));
      }

      function finish() {
        if (!cat.value) return finishSubjective();
        const sign = cat.ascending ? 1 : -1;
        const correct = [...items].sort((a, b) => sign * (cat.value(a) - cat.value(b)));
        const { points, exact, max } = rankingScore(slots, correct);
        const record = saveHighscore('blind-ranking', points);

        const table = h('div', { class: 'compare' },
          h('div', {},
            h('h3', {}, 'Dein Ranking'),
            h('ol', { class: 'list' }, slots.map((s, i) => h('li', { class: correct[i] === s ? 'ok' : 'off' },
              h('span', {}, s.name), h('small', {}, cat.format(cat.value(s)))))),
          ),
          h('div', {},
            h('h3', {}, 'Richtig wäre'),
            h('ol', { class: 'list' }, correct.map((s) => h('li', {},
              h('span', {}, s.name), h('small', {}, cat.format(cat.value(s)))))),
          ),
        );

        root.replaceChildren(resultScreen({
          title: exact === SIZE ? 'Perfektes Ranking!' : 'Ranking ausgewertet',
          score: points, max, record,
          lines: [`${exact} von ${SIZE} genau auf der richtigen Position.`],
          extra: table,
          onRestart: () => play(cat),
          onMenu: exit,
        }));
      }

      function finishSubjective() {
        const text = `Mein F1 Blind Ranking – ${cat.label}:\n` + slots.map((s, i) => `${i + 1}. ${s.name}`).join('\n');
        const copyBtn = h('button', { class: 'btn ghost', onClick: async () => {
          try {
            await navigator.clipboard.writeText(text);
            copyBtn.textContent = 'Kopiert ✓';
          } catch {
            copyBtn.textContent = 'Kopieren nicht möglich';
          }
        } }, '📋 Ranking kopieren');

        root.replaceChildren(resultScreen({
          title: 'Dein Ranking steht!',
          extra: h('div', {},
            h('ol', { class: 'list podium-list' }, slots.map((s) => h('li', {}, h('span', {}, s.name), h('small', {}, s.sub)))),
            copyBtn,
          ),
          onRestart: () => play(cat),
          onMenu: exit,
        }));
      }

      render();
    }

    pick();
  },
};
