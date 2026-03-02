const { mapCommune } = require('../utils/communeMapper');
const { mapCategories } = require('../utils/categoryMapper');

/**
 * Parser for monticket.re — ticketing platform.
 * Structure: .card-event with time[datetime], .card-title, .card-text (location).
 * Category inferred from URL path (/spectacle/, /musique/, etc.)
 */
async function parse($, source) {
  const events = [];

  $('.card-event').each((i, el) => {
    const $el = $(el);

    const title = $el.find('.card-title').first().text().trim();
    if (!title) return;

    // Date from <time datetime="2026-05-02TH:00">
    const timeEl = $el.find('time[datetime]').first();
    const datetime = timeEl.attr('datetime') || '';
    let dateStart = null;

    if (datetime) {
      // Fix malformed datetime like "2026-05-02TH:00" → "2026-05-02"
      const isoDate = datetime.replace(/T.*$/, '');
      const parsed = new Date(isoDate + 'T12:00:00Z');
      if (!isNaN(parsed.getTime())) {
        dateStart = parsed;
      }
    }

    if (!dateStart) return;

    // Link
    const external_link = $el.find('a[href]').first().attr('href') || null;

    // Image
    const image_url = $el.find('img').first().attr('src') || null;

    // Location from .card-text
    const address = $el.find('.card-text').first().text().trim();

    // Category from URL path (e.g. /spectacle/detail/..., /musique/detail/...)
    let categoryHint = '';
    if (external_link) {
      const pathMatch = external_link.match(/monticket\.re\/([^/]+)\//);
      if (pathMatch) categoryHint = pathMatch[1];
    }

    events.push({
      title,
      date_start: dateStart,
      date_end: null,
      description: null,
      address,
      commune_id: null,
      image_url,
      external_link,
      price: null,
      organizer: null,
      category_ids: null,
      latitude: null,
      longitude: null,
      _address: address,
      _categoryText: categoryHint + ' ' + title,
    });
  });

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
