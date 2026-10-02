const test = require('node:test');
const assert = require('node:assert/strict');
const { parseShift } = require('../src/parseShift.js');

const at = (y, mo, d, h, mi) => new Date(y, mo - 1, d, h, mi).getTime();

test('parses a normal day shift', () => {
  const s = parseShift('3/31 - 13:00-21:15', 2025);
  assert.equal(s.start.getTime(), at(2025, 3, 31, 13, 0));
  assert.equal(s.end.getTime(), at(2025, 3, 31, 21, 15));
});

test('overnight shift ends the next day', () => {
  const s = parseShift('3/31 - 22:00-06:00', 2025);
  assert.equal(s.end.getTime(), at(2025, 4, 1, 6, 0));
});

test('overnight shift on Dec 31 rolls into the next year', () => {
  const s = parseShift('12/31 - 23:00-07:00', 2025);
  assert.equal(s.end.getTime(), at(2026, 1, 1, 7, 0));
});

test('tolerates extra whitespace and single-digit hours', () => {
  const s = parseShift('  4/2-9:00 - 17:30 ', 2025);
  assert.equal(s.start.getTime(), at(2025, 4, 2, 9, 0));
});

test('days off, blanks and garbage return null instead of throwing', () => {
  for (const cell of ['3/29 - OFF', '', null, undefined, 'vacation', '3/31 - 25:00-26:00']) {
    assert.equal(parseShift(cell, 2025), null, String(cell));
  }
});

test('impossible dates are rejected rather than rolled over', () => {
  assert.equal(parseShift('2/30 - 09:00-17:00', 2025), null);
  assert.equal(parseShift('13/1 - 09:00-17:00', 2025), null);
});
