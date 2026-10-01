import { CHAMPIONS } from '../data.js';
import { h, sample, shuffle, saveHighscore } from '../utils.js';
import { resultScreen, progress } from '../ui.js';

const ROUNDS = 10;
const ERA = 15;

// Drei falsche Antworten, bevorzugt Weltmeister aus derselben Ära.
export function options(champion) {
  const others = (filter) => [...new Set(CHAMPIONS.filter(filter).map((c) => c.name))]
    .filter((n) => n !== champion.name);
  let pool = others((c) => Math.abs(c.year - champion.year) <= ERA);
  if (pool.length < 3) pool = others(() => true);
  return shuffle([champion.name, ...sample(pool, 3)]);
}

export default {
  id: 'champion-quiz',
  title: 'Weltmeister-Quiz',
  icon: '👑',
  tagline: 'Ein Jahr, vier Fahrer: Wer wurde Weltmeister? Von Farina 1950 bis Verstappen 2024.',

  start(root, { exit }) {
    function play() {
      const rounds = sample(CHAMPIONS, ROUNDS);
      let round = 0;
      let score = 0;

      function render() {
        const champ = rounds[round];
        const buttons = options(champ).map((name) => h('button', {
          class: 'btn option',
          onClick: () => answer(name),
        }, name));
        const info = h('div', {});

        function answer(name) {
          const correct = name === champ.name;
          if (correct) score++;
          buttons.forEach((b) => {
            b.disabled = true;
            if (b.textContent === champ.name) b.classList.add('correct');
            else if (b.textContent === name) b.classList.add('wrong');
          });
          info.replaceChildren(h('div', { class: 'fade-in center' },
            h('p', { class: `feedback ${correct ? 'ok' : 'bad'}` }, correct ? 'Richtig! 👑' : 'Leider falsch.'),
            h('p', { class: 'muted' }, `${champ.year}: ${champ.name} (${champ.team})`),
            h('button', { class: 'btn primary wide', onClick: next }, round + 1 < ROUNDS ? 'Nächste Saison →' : 'Auswertung'),
          ));
        }

        root.replaceChildren(h('section', { class: 'quiz fade-in' },
          progress(round + 1, ROUNDS),
          h('div', { class: 'card center' },
            h('small', { class: 'eyebrow' }, 'Wer wurde Weltmeister?'),
            h('div', { class: 'year-display' }, champ.year),
          ),
          h('div', { class: 'options' }, buttons),
          info,
        ));
      }

      function next() {
        round++;
        if (round < ROUNDS) return render();
        const record = saveHighscore('champion-quiz', score);
        root.replaceChildren(resultScreen({
          title: score === ROUNDS ? 'Perfekt – du bist der GOAT!' : 'Quiz beendet',
          score, max: ROUNDS, record,
          onRestart: play,
          onMenu: exit,
        }));
      }

      render();
    }

    play();
  },
};
