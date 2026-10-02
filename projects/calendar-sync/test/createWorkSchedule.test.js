// Runs Code.gs against fake SpreadsheetApp / CalendarApp objects so the sync
// logic can be tested without a Google account.
const test = require('node:test');
const assert = require('node:assert/strict');

function fakeEnvironment(rows, { failOnRow } = {}) {
  const written = {};
  const created = [];
  global.Logger = { log: () => {} };
  global.SpreadsheetApp = {
    getActiveSpreadsheet: () => ({
      getActiveSheet: () => ({
        getDataRange: () => ({ getValues: () => rows }),
        getRange: (r, c) => ({ setValue: (v) => { written[`${r},${c}`] = v; } }),
      }),
    }),
  };
  global.CalendarApp = {
    getDefaultCalendar: () => ({
      createEvent: (title, start, end) => {
        if (failOnRow !== undefined && start === rows[failOnRow][0]) throw new Error('API error');
        created.push({ title, start, end });
        return { addPopupReminder: () => {} };
      },
    }),
  };
  delete require.cache[require.resolve('../src/Code.gs')];
  require.extensions['.gs'] = require.extensions['.js'];
  const { createWorkSchedule } = require('../src/Code.gs');
  return { run: createWorkSchedule, written, created };
}

const d = (h) => new Date(2025, 2, 31, h);
const header = ['Start', 'End', 'Status'];

test('creates one event per valid row and marks it Added', () => {
  const env = fakeEnvironment([header, [d(9), d(17), ''], [d(13), d(21), '']]);
  assert.deepEqual(env.run(), { added: 2, skipped: 0, failed: 0 });
  assert.equal(env.created.length, 2);
  assert.deepEqual(env.written, { '2,3': 'Added', '3,3': 'Added' });
});

test('re-running does not duplicate rows already marked Added', () => {
  const env = fakeEnvironment([header, [d(9), d(17), 'Added'], [d(13), d(21), '']]);
  assert.deepEqual(env.run(), { added: 1, skipped: 1, failed: 0 });
});

test('skips blanks, formula errors and end-before-start rows', () => {
  const env = fakeEnvironment([header, ['', '', ''], ['#VALUE!', d(17), ''], [d(17), d(9), '']]);
  assert.deepEqual(env.run(), { added: 0, skipped: 3, failed: 0 });
  assert.equal(env.created.length, 0);
});

test('one API failure does not stop the rest, and that row stays unmarked', () => {
  const env = fakeEnvironment([header, [d(9), d(17), ''], [d(13), d(21), '']], { failOnRow: 1 });
  assert.deepEqual(env.run(), { added: 1, skipped: 0, failed: 1 });
  assert.equal(env.written['2,3'], undefined);
  assert.equal(env.written['3,3'], 'Added');
});
