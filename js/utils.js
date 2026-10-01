export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sample(arr, n) {
  return shuffle(arr).slice(0, n);
}

// Wie sample(), aber jeder Wert kommt höchstens einmal vor – so ist die Reihenfolge eindeutig.
export function sampleDistinct(arr, n, valueOf) {
  const seen = new Set();
  const out = [];
  for (const item of shuffle(arr)) {
    const v = valueOf(item);
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(item);
    if (out.length === n) break;
  }
  return out;
}

export function normalize(str) {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Volle Punkte bei exakt richtigem Jahr, danach 10 Punkte Abzug pro Jahr Abweichung.
export function timeMachinePoints(guess, actual) {
  const diff = Math.abs(guess - actual);
  if (diff === 0) return 100;
  return Math.max(0, 90 - diff * 10);
}

// Pro Eintrag (n-1) Punkte minus Abstand zur richtigen Position.
export function rankingScore(userOrder, correctOrder) {
  const n = correctOrder.length;
  let points = 0;
  let exact = 0;
  userOrder.forEach((item, i) => {
    const dist = Math.abs(correctOrder.indexOf(item) - i);
    if (dist === 0) exact++;
    points += n - 1 - dist;
  });
  return { points, exact, max: n * (n - 1) };
}

// Ein Name passt, wenn er dem vollen Namen entspricht oder dem eindeutigen Nachnamen.
export function matchesName(input, target, allNames) {
  const guess = normalize(input);
  if (!guess) return false;
  if (guess === normalize(target)) return true;
  const last = (name) => normalize(name).split(' ').slice(1).join(' ');
  if (guess !== last(target)) return false;
  return allNames.filter((n) => last(n) === guess).length === 1;
}

export function h(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (key.startsWith('on')) node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === 'class') node.className = value;
    else if (key === 'style') node.style.cssText = value;
    else node.setAttribute(key, value === true ? '' : value);
  }
  for (const child of children.flat()) {
    if (child == null || child === false) continue;
    node.append(child instanceof Node ? child : String(child));
  }
  return node;
}

const PREFIX = 'f1-fan-arena:';

export const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      // Speicher nicht verfügbar (z. B. privater Modus) – Highscores sind dann nur temporär.
    }
  },
};

export function getHighscore(key) {
  return storage.get(`best:${key}`, 0);
}

// Gibt true zurück, wenn ein neuer Rekord aufgestellt wurde.
export function saveHighscore(key, score) {
  if (score <= getHighscore(key)) return false;
  storage.set(`best:${key}`, score);
  return true;
}

export function formatNumber(value, digits = 0) {
  return value.toLocaleString('de-DE', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
