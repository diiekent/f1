import { DRIVERS, country } from '../data.js';
import { h, sample, matchesName, saveHighscore } from '../utils.js';
import { resultScreen, progress } from '../ui.js';

const ROUNDS = 5;
const NAMES = DRIVERS.map((d) => d.name);

export function clues(d) {
  const c = country(d.nat);
  return [
    `Mein Debüt in der Formel 1 gab ich ${d.debut}.`,
    `Meine Nationalität: ${c.flag} ${c.name}.`,
    `Ich habe ${d.poles} Pole-Positions und ${d.podiums} Podestplätze.`,
    `Ich habe ${d.wins} Grand Prix gewonnen und ${d.titles === 0 ? 'keinen WM-Titel' : `${d.titles} WM-Titel`}.`,
    `Meine Teams: ${d.teams.join(', ')}.`,
  ];
}

export default {
  id: 'who-am-i',
  title: 'Wer bin ich?',
  icon: '🕵️',
  tagline: 'Errate den Fahrer anhand von Hinweisen. Je weniger Hinweise du brauchst, desto mehr Punkte.',

  start(root, { exit }) {
    function play() {
      const drivers = sample(DRIVERS, ROUNDS);
      let round = 0;
      let total = 0;
      const log = [];

      function render() {
        const d = drivers[round];
        const hints = clues(d);
        let shown = 1;

        const list = h('ol', { class: 'clues' });
        const feedback = h('p', { class: 'feedback' });
        const input = h('input', {
          type: 'text', list: 'driver-names', placeholder: 'Fahrername eingeben …', autocomplete: 'off', class: 'text-input',
        });
        const form = h('form', { class: 'guess-form', onSubmit: (e) => { e.preventDefault(); guess(); } },
          input,
          h('button', { class: 'btn primary', type: 'submit' }, 'Raten'),
          h('button', { class: 'btn ghost', type: 'button', onClick: () => wrong('Hinweis aufgedeckt.') }, 'Nächster Hinweis'),
        );
        const area = h('div', {}, form, feedback);

        const showClues = () => list.replaceChildren(...hints.slice(0, shown).map((t, i) =>
          h('li', { class: i === shown - 1 ? 'fade-in' : '' }, t)));

        function guess() {
          if (!input.value.trim()) return;
          if (matchesName(input.value, d.name, NAMES)) return done(true);
          wrong(`„${input.value}“ ist falsch.`);
        }

        function wrong(msg) {
          input.value = '';
          if (shown === hints.length) return done(false);
          shown++;
          showClues();
          feedback.className = 'feedback bad';
          feedback.textContent = `${msg} Noch ${hints.length - shown + 1} Versuch(e) für Punkte.`;
          input.focus();
        }

        function done(solved) {
          const pts = solved ? hints.length - shown + 1 : 0;
          total += pts;
          log.push({ d, pts });
          shown = hints.length;
          showClues();
          area.replaceChildren(h('div', { class: 'fade-in center' },
            h('p', { class: `feedback ${solved ? 'ok' : 'bad'}` }, solved ? `Richtig: ${d.name}! +${pts} Punkte` : `Gesucht war: ${d.name}`),
            h('button', { class: 'btn primary wide', onClick: next }, round + 1 < ROUNDS ? 'Nächster Fahrer →' : 'Auswertung'),
          ));
        }

        showClues();
        root.replaceChildren(h('section', { class: 'who fade-in' },
          progress(round + 1, ROUNDS),
          h('div', { class: 'card' }, h('small', { class: 'eyebrow' }, 'Wer bin ich?'), list),
          area,
          h('datalist', { id: 'driver-names' }, [...NAMES].sort().map((n) => h('option', { value: n }))),
          h('p', { class: 'muted small center' }, `Punkte bisher: ${total}`),
        ));
        input.focus();
      }

      function next() {
        round++;
        if (round < ROUNDS) return render();
        const max = ROUNDS * 5;
        const record = saveHighscore('who-am-i', total);
        root.replaceChildren(resultScreen({
          title: 'Detektivarbeit erledigt',
          score: total, max, record,
          extra: h('ol', { class: 'list' }, log.map(({ d, pts }) => h('li', {}, h('span', {}, d.name), h('small', {}, `+${pts}`)))),
          onRestart: play,
          onMenu: exit,
        }));
      }

      render();
    }

    play();
  },
};
