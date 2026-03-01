const pool = require('../../../config/db');

let categoryCache = null;

async function loadCategories() {
  if (categoryCache) return categoryCache;
  const { rows } = await pool.query('SELECT id, name, slug FROM categories WHERE active = true');
  categoryCache = rows;
  return categoryCache;
}

const KEYWORD_MAP = {
  'sport': 'sport',
  'course': 'sport',
  'marathon': 'sport',
  'trail': 'sport',
  'foot': 'sport',
  'basket': 'sport',
  'surf': 'sport',
  'rugby': 'sport',
  'famille': 'famille',
  'enfant': 'famille',
  'cinéma': 'cinema',
  'ciné': 'cinema',
  'film': 'cinema',
  'foire': 'foires-salons',
  'salon': 'foires-salons',
  'marché': 'marches',
  'marche forain': 'marches',
  'exposition': 'expositions',
  'expo': 'expositions',
  'théâtre': 'theatre-humour',
  'theatre': 'theatre-humour',
  'humour': 'theatre-humour',
  'spectacle': 'theatre-humour',
  'one man': 'theatre-humour',
  'concert': 'musique-concerts',
  'musique': 'musique-concerts',
  'dj': 'musique-concerts',
  'live': 'musique-concerts',
  'maloya': 'musique-concerts',
  'séga': 'musique-concerts',
  'festival': 'festivals',
  'brocante': 'brocantes',
  'vide-grenier': 'brocantes',
  'vide grenier': 'brocantes',
  'fête': 'fetes-traditions',
  'fete': 'fetes-traditions',
  'tradition': 'fetes-traditions',
  'gastronomie': 'gastronomie',
  'culinaire': 'gastronomie',
  'dégustation': 'gastronomie',
  'food': 'gastronomie',
  'randonnée': 'nature-rando',
  'rando': 'nature-rando',
  'nature': 'nature-rando',
  'conférence': 'conferences-ateliers',
  'conference': 'conferences-ateliers',
  'atelier': 'conferences-ateliers',
  'solidaire': 'solidaire',
  'caritatif': 'solidaire',
  'associatif': 'solidaire',
  'danse': 'danse',
  'bal': 'danse',
};

/**
 * Map scraped category/title text to category IDs.
 * 1. Source-specific explicit mapping (from category_mapping JSONB)
 * 2. Keyword heuristic matching
 */
async function mapCategories(text, sourceCategoryMapping) {
  if (!text) return [];
  const categories = await loadCategories();
  const normalized = text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // 1. Source-specific mapping
  if (sourceCategoryMapping && typeof sourceCategoryMapping === 'object') {
    for (const [sourceLabel, categoryIds] of Object.entries(sourceCategoryMapping)) {
      const labelNorm = sourceLabel.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (normalized.includes(labelNorm)) {
        return Array.isArray(categoryIds) ? categoryIds : [categoryIds];
      }
    }
  }

  // 2. Keyword heuristic
  const matchedSlugs = new Set();
  for (const [keyword, slug] of Object.entries(KEYWORD_MAP)) {
    const keywordNorm = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (normalized.includes(keywordNorm)) {
      matchedSlugs.add(slug);
    }
  }

  const ids = [];
  for (const slug of matchedSlugs) {
    const cat = categories.find(c => c.slug === slug);
    if (cat) ids.push(cat.id);
  }

  return ids;
}

function resetCache() { categoryCache = null; }

module.exports = { mapCategories, resetCache, KEYWORD_MAP };
