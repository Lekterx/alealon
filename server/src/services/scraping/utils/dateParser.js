const FRENCH_MONTHS = {
  'janvier': 0, 'jan': 0, 'janv': 0,
  'février': 1, 'fév': 1, 'fevrier': 1, 'fev': 1,
  'mars': 2, 'mar': 2,
  'avril': 3, 'avr': 3,
  'mai': 4,
  'juin': 5,
  'juillet': 6, 'juil': 6,
  'août': 7, 'aout': 7,
  'septembre': 8, 'sept': 8, 'sep': 8,
  'octobre': 9, 'oct': 9,
  'novembre': 10, 'nov': 10,
  'décembre': 11, 'dec': 11, 'decembre': 11,
};

// Use noon UTC to avoid timezone day-shift issues
function makeDate(year, month, day) {
  return new Date(Date.UTC(year, month, day, 12, 0, 0));
}

/**
 * Parse a French date string into a Date object.
 * Handles: "15 mars", "15 mars 2025", "Le 15 mars", "Sam. 15 mars", "15/03/2025", "24/04"
 */
function parseFrenchDate(text) {
  if (!text) return null;
  const clean = text.toLowerCase().trim()
    .replace(/^(le|du|sam\.|dim\.|lun\.|mar\.|mer\.|jeu\.|ven\.|samedi|dimanche|lundi|mardi|mercredi|jeudi|vendredi)\s*/i, '');

  // Try DD/MM/YYYY
  const slashMatch = clean.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashMatch) {
    return makeDate(parseInt(slashMatch[3]), parseInt(slashMatch[2]) - 1, parseInt(slashMatch[1]));
  }

  // Try DD/MM (without year — assume current or next year)
  const shortSlashMatch = clean.match(/(\d{1,2})\/(\d{1,2})(?!\d)/);
  if (shortSlashMatch) {
    const day = parseInt(shortSlashMatch[1]);
    const month = parseInt(shortSlashMatch[2]) - 1;
    const now = new Date();
    let year = now.getFullYear();
    const candidate = makeDate(year, month, day);
    if (candidate < new Date(now.getTime() - 7 * 24 * 3600 * 1000)) {
      year++;
    }
    return makeDate(year, month, day);
  }

  // Try "DD monthName YYYY?" pattern
  const frenchMatch = clean.match(/(\d{1,2})\s+([a-zéûôè]+)\.?\s*(\d{4})?/);
  if (frenchMatch) {
    const day = parseInt(frenchMatch[1]);
    const monthStr = frenchMatch[2].replace('.', '');
    const month = FRENCH_MONTHS[monthStr];
    if (month === undefined) return null;

    let year = frenchMatch[3] ? parseInt(frenchMatch[3]) : null;
    if (!year) {
      const now = new Date();
      year = now.getFullYear();
      const candidate = makeDate(year, month, day);
      if (candidate < new Date(now.getTime() - 7 * 24 * 3600 * 1000)) {
        year++;
      }
    }

    return makeDate(year, month, day);
  }

  return null;
}

/**
 * Parse a date range like "Du 15 au 17 mars 2025".
 * Returns { start: Date|null, end: Date|null }
 */
function parseFrenchDateRange(text) {
  if (!text) return { start: null, end: null };
  const clean = text.toLowerCase().trim();

  // "Du X au Y month year"
  const rangeMatch = clean.match(/du\s+(\d{1,2})\s+au\s+(\d{1,2})\s+([a-zéûôè]+)\.?\s*(\d{4})?/);
  if (rangeMatch) {
    const dayStart = parseInt(rangeMatch[1]);
    const dayEnd = parseInt(rangeMatch[2]);
    const monthStr = rangeMatch[3].replace('.', '');
    const month = FRENCH_MONTHS[monthStr];
    if (month === undefined) return { start: null, end: null };
    const year = rangeMatch[4] ? parseInt(rangeMatch[4]) : new Date().getFullYear();
    return {
      start: makeDate(year, month, dayStart),
      end: makeDate(year, month, dayEnd),
    };
  }

  // "Du X month au Y month year"
  const crossMonthMatch = clean.match(/du\s+(\d{1,2})\s+([a-zéûôè]+)\.?\s+au\s+(\d{1,2})\s+([a-zéûôè]+)\.?\s*(\d{4})?/);
  if (crossMonthMatch) {
    const year = crossMonthMatch[5] ? parseInt(crossMonthMatch[5]) : new Date().getFullYear();
    const monthStart = FRENCH_MONTHS[crossMonthMatch[2].replace('.', '')];
    const monthEnd = FRENCH_MONTHS[crossMonthMatch[4].replace('.', '')];
    if (monthStart === undefined || monthEnd === undefined) return { start: null, end: null };
    return {
      start: makeDate(year, monthStart, parseInt(crossMonthMatch[1])),
      end: makeDate(year, monthEnd, parseInt(crossMonthMatch[3])),
    };
  }

  // Fallback: single date
  const single = parseFrenchDate(text);
  return { start: single, end: null };
}

module.exports = { parseFrenchDate, parseFrenchDateRange, FRENCH_MONTHS };
