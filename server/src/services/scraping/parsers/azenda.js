const cheerio = require('cheerio');
const { parseFrenchDate } = require('../utils/dateParser');
const { mapCommune } = require('../utils/communeMapper');
const { mapCategories } = require('../utils/categoryMapper');
const logger = require('../../../utils/logger');

/**
 * Parser for azenda.re (WordPress + Elementor).
 * Two-step: listing page → detail pages for dates.
 * Listing has titles, categories, links but NO dates.
 */
async function parse($, source, { axios }) {
  // Step 1: Extract event URLs from listing
  const seen = new Set();
  const entries = [];

  $('.e-loop-item').each((i, el) => {
    const $el = $(el);

    const title = $el.find('.elementor-heading-title').first().text().trim();
    if (!title) return;

    // Category from button
    const categoryText = $el.find('.azenda-post-category-btn').first().text().trim();
    // Skip non-event categories (normalize apostrophes for comparison)
    const catLower = categoryText.toLowerCase().replace(/[\u2018\u2019\u2032]/g, "'");
    if (['magazine', "toute l'île", "toute l'ile"].includes(catLower)) return;

    // Link from data-ra-element-link or first <a>
    let url = null;
    const raLink = $el.find('[data-ra-element-link]').first().attr('data-ra-element-link');
    if (raLink) {
      try { url = JSON.parse(raLink).url; } catch {}
    }
    if (!url) {
      url = $el.find('a[href*="azenda.re"]').first().attr('href');
    }
    if (!url || seen.has(url)) return;
    seen.add(url);

    entries.push({ title, categoryText, url });
  });

  // Step 2: Fetch detail pages to get dates (limit concurrency)
  const events = [];
  const BATCH_SIZE = 5;

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(async (entry) => {
        try {
          const res = await axios.get(entry.url, {
            headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html' },
            timeout: 10000,
          });
          const d = cheerio.load(res.data);

          // Date: look for elements with "date" in class name
          let dateText = '';
          d('[class*="date"]').each((_, el) => {
            const text = d(el).text().trim();
            // Skip "AUJOURD'HUI" or very long texts
            if (text && text.length < 50 && !text.includes("AUJOURD'HUI") && !text.includes('aujourd')) {
              if (!dateText) dateText = text;
            }
          });

          const dateStart = parseFrenchDate(dateText);
          if (!dateStart) return null;

          // Image
          let image_url = d('meta[property="og:image"]').attr('content') || null;

          // Location: look for address/lieu elements
          let address = '';
          d('[class*="lieu"], [class*="location"], [class*="adresse"]').each((_, el) => {
            const text = d(el).text().trim();
            if (text && text.length < 200 && !address) address = text;
          });

          return {
            title: entry.title,
            date_start: dateStart,
            date_end: null,
            description: null,
            address,
            commune_id: null,
            image_url,
            external_link: entry.url,
            price: null,
            organizer: null,
            category_ids: null,
            latitude: null,
            longitude: null,
            _address: address,
            _categoryText: entry.categoryText + ' ' + entry.title,
          };
        } catch (err) {
          logger.warn(`[Azenda] Failed to fetch detail: ${entry.url} - ${err.message}`);
          return null;
        }
      })
    );

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        events.push(result.value);
      }
    }
  }

  // Resolve async mappings
  for (const event of events) {
    event.commune_id = await mapCommune(event._address);
    event.category_ids = await mapCategories(event._categoryText, source.category_mapping);
    delete event._address;
    delete event._categoryText;
  }

  return events;
}

module.exports = { parse };
