const pool = require('../../../config/db');

/**
 * Check if an event is a duplicate.
 * Level 1: exact title (case-insensitive) + same date
 * Level 2: Jaccard word similarity >= 85% + date within ±1 day
 */
async function isDuplicate(title, dateStart) {
  if (!title || !dateStart) return null;

  const normalizedTitle = title.trim().toLowerCase();
  const dateObj = dateStart instanceof Date ? dateStart : new Date(dateStart);

  // Level 1: exact match
  const { rows: exact } = await pool.query(
    `SELECT id, title FROM events
     WHERE LOWER(TRIM(title)) = $1
       AND date_start::date = $2::date
     LIMIT 1`,
    [normalizedTitle, dateObj.toISOString()]
  );
  if (exact.length > 0) return exact[0];

  // Level 2: fuzzy match
  const { rows: candidates } = await pool.query(
    `SELECT id, title, date_start FROM events
     WHERE date_start::date BETWEEN ($1::date - INTERVAL '1 day') AND ($1::date + INTERVAL '1 day')`,
    [dateObj.toISOString()]
  );

  for (const candidate of candidates) {
    const similarity = computeSimilarity(normalizedTitle, candidate.title.toLowerCase());
    if (similarity >= 0.85) {
      return candidate;
    }
  }

  return null;
}

/**
 * Jaccard similarity on word sets (words > 2 chars).
 */
function computeSimilarity(a, b) {
  const wordsA = new Set(a.split(/\s+/).filter(w => w.length > 2));
  const wordsB = new Set(b.split(/\s+/).filter(w => w.length > 2));
  if (wordsA.size === 0 && wordsB.size === 0) return 1;
  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersection = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) intersection++;
  }
  const union = new Set([...wordsA, ...wordsB]).size;
  return intersection / union;
}

module.exports = { isDuplicate, computeSimilarity };
