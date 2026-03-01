const { parseFrenchDate } = require('../utils/dateParser');
const { mapCommune } = require('../utils/communeMapper');
const { mapCategories } = require('../utils/categoryMapper');

async function parse($, source) {
  const events = [];

  // Each event: a.lien-vide containing .agenda-articles-wrapper
  $('a.lien-vide').each((i, el) => {
    const $link = $(el);
    const $wrapper = $link.find('.agenda-articles-wrapper');
    if (!$wrapper.length) return;

    // Title
    const title = $wrapper.find('.agenda-articles-titre').text().trim();
    if (!title) return;

    // Date: "Le dimanche 1er mars 2026" or "Le 14 mai 2026"
    const dateText = $wrapper.find('.agenda-articles-date').text().trim();
    // Clean up ordinal (1er -> 1)
    const cleanDate = dateText.replace(/1er/g, '1');
    const dateStart = parseFrenchDate(cleanDate);
    if (!dateStart) return;

    // Image
    let image_url = $wrapper.find('.agenda-articles-vignette img').attr('src') || null;

    // Link
    const external_link = $link.attr('href') || null;

    // Commune
    const commune = $wrapper.find('.commune div').text().trim();

    events.push({
      title,
      date_start: dateStart,
      date_end: null,
      description: null,
      address: commune,
      commune_id: null,
      image_url,
      external_link,
      price: null,
      organizer: null,
      category_ids: null,
      latitude: null,
      longitude: null,
      _commune: commune,
      _title: title,
    });
  });

  // Resolve async mappings
  for (const event of events) {
    event.commune_id = await mapCommune(event._commune);
    event.category_ids = await mapCategories(event._title, source.category_mapping);
    delete event._commune;
    delete event._title;
  }

  return events;
}

module.exports = { parse };
