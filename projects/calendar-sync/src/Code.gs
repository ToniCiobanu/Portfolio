/**
 * Google Apps Script bound to the schedule spreadsheet.
 *
 * Sheet layout (row 1 is a header):
 *   A: shift start (Date)   B: shift end (Date)   C: status ("Added" once synced)
 *
 * Columns A and B are filled by the parsing formulas (see parseShift.js).
 * Run createWorkSchedule() from the Apps Script editor or a time-driven trigger.
 */
const EVENT_TITLE = 'Work';
const REMINDER_MINUTES = 60;
const STATUS_COL = 3;

function createWorkSchedule() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const values = sheet.getDataRange().getValues();
  const calendar = CalendarApp.getDefaultCalendar();
  const summary = { added: 0, skipped: 0, failed: 0 };

  for (let i = 1; i < values.length; i++) {
    const [start, end, status] = values[i];

    // Already synced on a previous run: running the script twice must not
    // create duplicate events.
    if (status === 'Added') { summary.skipped++; continue; }

    // Formula errors and blank rows come through as strings or empty cells.
    if (!(start instanceof Date) || !(end instanceof Date) || end <= start) {
      summary.skipped++;
      continue;
    }

    try {
      const event = calendar.createEvent(EVENT_TITLE, start, end);
      event.addPopupReminder(REMINDER_MINUTES);
      sheet.getRange(i + 1, STATUS_COL).setValue('Added');
      summary.added++;
    } catch (e) {
      Logger.log(`Row ${i + 1}: failed to create event: ${e}`);
      summary.failed++;
    }
  }

  Logger.log(`Added ${summary.added}, skipped ${summary.skipped}, failed ${summary.failed}`);
  return summary;
}

if (typeof module !== 'undefined') module.exports = { createWorkSchedule };
