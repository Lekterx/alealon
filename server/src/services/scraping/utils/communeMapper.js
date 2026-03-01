const pool = require('../../../config/db');

let communeCache = null;

async function loadCommunes() {
  if (communeCache) return communeCache;
  const { rows } = await pool.query('SELECT id, name, slug, postal_code FROM communes ORDER BY name');
  communeCache = rows;
  return communeCache;
}

/**
 * Map a scraped address/location string to a commune_id.
 * 1. Postal code match (97XXX)
 * 2. Commune name substring match (longest first)
 * 3. Slug match
 */
async function mapCommune(addressText) {
  if (!addressText) return null;
  const communes = await loadCommunes();
  const normalized = addressText.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // 1. Postal code
  const postalMatch = addressText.match(/97\d{3}/);
  if (postalMatch) {
    const commune = communes.find(c => c.postal_code === postalMatch[0]);
    if (commune) return commune.id;
  }

  // 2. Name match (longest first to avoid "Saint-" false positives)
  const sorted = [...communes].sort((a, b) => b.name.length - a.name.length);
  for (const commune of sorted) {
    const communeNorm = commune.name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (normalized.includes(communeNorm)) {
      return commune.id;
    }
  }

  // 3. Slug fallback
  for (const commune of sorted) {
    if (normalized.includes(commune.slug)) {
      return commune.id;
    }
  }

  return null;
}

function resetCache() { communeCache = null; }

module.exports = { mapCommune, resetCache };
