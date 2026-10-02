# Shift schedule → Google Calendar

Synerion exports shifts as text like `3/31 - 13:00-21:15`. Google Sheets formulas
parse that into start/end date-times, and `src/Code.gs` (Google Apps Script)
creates a calendar event per row.

- `src/Code.gs`: the Apps Script. Safe to re-run (marks rows "Added"), skips invalid rows, isolates per-row API failures, returns counts.
- `src/parseShift.js`: the parsing rules in JavaScript (including overnight shifts) so they can be tested.
- `test/`: Node tests; `createWorkSchedule.test.js` runs `Code.gs` against fake `SpreadsheetApp` / `CalendarApp`.
- `sample/`: a synthetic export.

```bash
node --test test/*.test.js
python3 embed.py   # refresh source.js, which the web page displays
```

**Known limit:** a shift that changes after syncing isn't updated; storing event IDs would fix that.
