import test from 'node:test';
import assert from 'node:assert/strict';
import { DRIVERS, CHAMPIONS, CIRCUITS, EVENTS, TEAMS, country } from '../js/data.js';
import { timeMachinePoints, rankingScore, matchesName, sampleDistinct, normalize } from '../js/utils.js';
import { options } from '../js/games/championQuiz.js';

test('Weltmeisterliste ist lückenlos von 1950 bis 2024', () => {
  CHAMPIONS.forEach((c, i) => assert.equal(c.year, 1950 + i));
  assert.equal(CHAMPIONS.at(-1).year, 2024);
});

test('WM-Titel der Fahrer passen zur Weltmeisterliste', () => {
  for (const d of DRIVERS) {
    const count = CHAMPIONS.filter((c) => c.name === d.name).length;
    assert.equal(d.titles, count, d.name);
  }
});

test('Fahrerdaten sind plausibel', () => {
  const names = new Set();
  for (const d of DRIVERS) {
    assert.ok(!names.has(d.name), `doppelt: ${d.name}`);
    names.add(d.name);
    assert.ok(country(d.nat), d.name);
    assert.ok(d.wins <= d.podiums, d.name);
    assert.ok(d.debut >= 1950 && d.debut <= 2024, d.name);
    assert.ok(d.teams.length > 0, d.name);
  }
  for (const c of [...CIRCUITS, ...TEAMS]) assert.ok(country(c.nat), c.name);
});

test('Ereignisse liegen im Spielzeitraum', () => {
  for (const e of EVENTS) assert.ok(e.year >= 1950 && e.year <= 2024, e.title);
});

test('Konstrukteurstitel ergeben die Anzahl der Saisons seit 1958', () => {
  const total = TEAMS.reduce((s, t) => s + t.titles, 0);
  assert.equal(total, 2024 - 1958 + 1);
});

test('Time-Machine-Punkte', () => {
  assert.equal(timeMachinePoints(1988, 1988), 100);
  assert.equal(timeMachinePoints(1987, 1988), 80);
  assert.equal(timeMachinePoints(1990, 1985), 40);
  assert.equal(timeMachinePoints(1950, 2024), 0);
});

test('Ranking-Punkte', () => {
  const order = ['a', 'b', 'c', 'd', 'e'];
  assert.deepEqual(rankingScore(order, order), { points: 20, exact: 5, max: 20 });
  assert.deepEqual(rankingScore([...order].reverse(), order), { points: 8, exact: 1, max: 20 });
});

test('Namenserkennung', () => {
  const all = DRIVERS.map((d) => d.name);
  assert.ok(matchesName('kimi raikkonen', 'Kimi Räikkönen', all));
  assert.ok(matchesName('Räikkönen', 'Kimi Räikkönen', all));
  assert.ok(matchesName('perez', 'Sergio Pérez', all));
  assert.ok(!matchesName('Schumacher', 'Michael Schumacher', all), 'Nachname nicht eindeutig');
  assert.ok(matchesName('Michael Schumacher', 'Michael Schumacher', all));
  assert.ok(!matchesName('', 'Lewis Hamilton', all));
  assert.equal(normalize('  Juan  Pablo Montoya '), 'juan pablo montoya');
});

test('sampleDistinct liefert eindeutige Werte', () => {
  for (let i = 0; i < 50; i++) {
    const picked = sampleDistinct(TEAMS, 5, (t) => t.titles);
    assert.equal(new Set(picked.map((t) => t.titles)).size, 5);
  }
});

test('Weltmeister-Quiz: vier verschiedene Antworten inkl. der richtigen', () => {
  for (const c of CHAMPIONS) {
    const opts = options(c);
    assert.equal(opts.length, 4);
    assert.equal(new Set(opts).size, 4);
    assert.ok(opts.includes(c.name));
  }
});
