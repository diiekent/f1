import { EVENTS } from '../data.js';
import { h, sample, timeMachinePoints, saveHighscore } from '../utils.js';
import { resultScreen, progress } from '../ui.js';

const ROUNDS = 8;
const MIN_YEAR = 1950;
const MAX_YEAR = 2024;

export default {
  id: 'time-machine',
  title: 'Time Machine',
  icon: '⏳',
  tagline: 'Ein legendärer F1-Moment – in welchem Jahr war das? Je näher, desto mehr Punkte.',

  start(root, { exit }) {
    function play() {
      const events = sample(EVENTS, ROUNDS);
      let round = 0;
      let total = 0;
      const log = [];

      function render() {
        const ev = events[round];
        let year = 1987;

        const yearLabel = h('div', { class: 'year-display' }, year);
        const slider = h('input', {
          type: 'range', min: MIN_YEAR, max: MAX_YEAR, value: year, class: 'year-slider', 'aria-label': 'Jahr',
          onInput: (e) => setYear(Number(e.target.value)),
        });
        const setYear = (y) => {
          year = Math.min(MAX_YEAR, Math.max(MIN_YEAR, y));
          slider.value = year;
          yearLabel.textContent = year;
        };
        const step = (d) => h('button', { class: 'btn small', onClick: () => setYear(year + d) }, d > 0 ? `+${d}` : `${d}`);

        const controls = h('div', { class: 'tm-controls' },
          yearLabel,
          slider,
          h('div', { class: 'tm-steps' }, step(-10), step(-1), step(1), step(10)),
          h('button', { class: 'btn primary wide', onClick: () => lockIn() }, '🔒 Jahr einloggen'),
        );

        function lockIn() {
          const pts = timeMachinePoints(year, ev.year);
          total += pts;
          log.push({ ev, guess: year, pts });
          const diff = Math.abs(year - ev.year);
          controls.replaceChildren(
            h('div', { class: 'tm-reveal fade-in' },
              h('div', { class: 'year-display actual' }, ev.year),
              h('p', { class: `feedback ${diff === 0 ? 'ok' : diff <= 3 ? 'near' : 'bad'}` },
                diff === 0 ? 'Volltreffer! 🎯' : `Dein Tipp: ${year} – ${diff} Jahr${diff === 1 ? '' : 'e'} daneben`),
              h('p', { class: 'points' }, `+${pts} Punkte`),
              h('p', { class: 'muted' }, ev.fact),
              h('button', { class: 'btn primary wide', onClick: next }, round + 1 < ROUNDS ? 'Nächster Moment →' : 'Auswertung'),
            ),
          );
        }

        root.replaceChildren(h('section', { class: 'tm fade-in' },
          progress(round + 1, ROUNDS),
          h('div', { class: 'card event-card' },
            h('small', { class: 'eyebrow' }, 'Wann war das?'),
            h('h2', {}, ev.title),
          ),
          controls,
          h('p', { class: 'muted small center' }, `Punkte bisher: ${total}`),
        ));
      }

      function next() {
        round++;
        if (round < ROUNDS) return render();
        const max = ROUNDS * 100;
        const record = saveHighscore('time-machine', total);
        root.replaceChildren(resultScreen({
          title: total >= max * 0.7 ? 'Zeitreise-Profi!' : 'Zeitreise beendet',
          score: total, max, record,
          extra: h('ol', { class: 'list' }, log.map(({ ev, guess, pts }) => h('li', {},
            h('span', {}, `${ev.year} · ${ev.title}`),
            h('small', {}, `Tipp ${guess} · +${pts}`),
          ))),
          onRestart: play,
          onMenu: exit,
        }));
      }

      render();
    }

    play();
  },
};
