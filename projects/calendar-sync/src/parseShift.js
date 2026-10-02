/**
 * Parses one Synerion schedule cell, e.g. "3/31 - 13:00-21:15", into start and
 * end Date objects. This is the same logic as the Google Sheets formulas:
 *
 *   Start: =C2+TIMEVALUE(LEFT(D2, FIND("-", D2) - 1))
 *   End:   =C2+TIMEVALUE(MID(D2, FIND("-", D2) + 1, LEN(D2)))
 *          + IF(TIMEVALUE(MID(D2, FIND("-", D2) + 1, LEN(D2)))
 *               <= TIMEVALUE(LEFT(D2, FIND("-", D2) - 1)), 1, 0)
 *
 * The "+ IF(...)" on the end time handles shifts that cross midnight
 * (e.g. 22:00-06:00): without it the end lands before the start.
 *
 * Returns null for anything that isn't a shift (days off, blank cells, typos)
 * instead of throwing, so one bad cell can't stop the whole month's import.
 */
const SHIFT_PATTERN = /^\s*(\d{1,2})\/(\d{1,2})\s*-\s*(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})\s*$/;

function parseShift(cell, year) {
  const m = SHIFT_PATTERN.exec(String(cell));
  if (!m) return null;
  const [month, day, startH, startM, endH, endM] = m.slice(1).map(Number);

  if (month < 1 || month > 12 || startH > 23 || endH > 23 || startM > 59 || endM > 59) return null;
  const start = new Date(year, month - 1, day, startH, startM);
  // new Date() silently rolls 2/31 over to 3/3; reject instead.
  if (start.getMonth() !== month - 1 || start.getDate() !== day) return null;

  const end = new Date(year, month - 1, day, endH, endM);
  if (end <= start) end.setDate(end.getDate() + 1); // overnight shift
  return { start, end };
}

if (typeof module !== 'undefined') module.exports = { parseShift };
