import { h } from './utils.js';

export function resultScreen({ title, score, max, record, lines = [], extra, onRestart, onMenu }) {
  return h('section', { class: 'result fade-in' },
    h('div', { class: 'checkered' }),
    h('h2', {}, title),
    score != null && h('div', { class: 'result-score' },
      h('span', { class: 'big' }, score),
      max != null && h('span', { class: 'of' }, ` / ${max}`),
    ),
    record && h('p', { class: 'badge record' }, '🏆 Neuer Rekord!'),
    ...lines.map((l) => h('p', { class: 'muted' }, l)),
    extra,
    h('div', { class: 'actions' },
      h('button', { class: 'btn primary', onClick: onRestart }, 'Nochmal spielen'),
      h('button', { class: 'btn', onClick: onMenu }, 'Alle Spiele'),
    ),
  );
}

export function modePicker({ heading, modes, onPick }) {
  return h('section', { class: 'mode-picker fade-in' },
    h('h2', {}, heading),
    h('div', { class: 'mode-grid' },
      modes.map((m) => h('button', { class: 'mode-card', onClick: () => onPick(m) },
        h('span', { class: 'mode-icon' }, m.icon),
        h('strong', {}, m.label),
        m.desc && h('small', {}, m.desc),
      )),
    ),
  );
}

export function progress(current, total) {
  return h('div', { class: 'progress', role: 'progressbar', 'aria-valuenow': current, 'aria-valuemax': total },
    h('div', { class: 'progress-bar', style: `width:${(current / total) * 100}%` }),
    h('span', {}, `Runde ${current} / ${total}`),
  );
}
