const { parseFrenchDate } = require('../utils/dateParser');
const { mapCommune } = require('../utils/communeMapper');
const { mapCategories } = require('../utils/categoryMapper');

async function parse($, source) {
  const events = [];

  // Azenda uses Elementor loop grid - items are in .e-loop-item or article elements
  // within .elementor-widget-loop-grid
  const selectors = [
    '.e-loop-item',
    '.elementor-widget-loop-grid article',
    '.elementor-loop-container > div',
  ];

  let $items = $();
  for (const sel of selectors) {
    $items = $(sel);
    if ($items.length > 0) break;
  }

  $items.each((i, el) => {
    const $el = $(el);

    // Title: look for heading elements
    const title = $el.find('h2, h3, .elementor-heading-title').first().text().trim();
    if (!title) return;

    // Date: .archive-date or similar date elements
    let dateText = $el.find('.archive-date .date, .archive-date').first().text().trim();
    if (!dateText) {
      // Try data attributes or other date containers
      dateText = $el.find('[class*="date"]').first().text().trim();
    }
    const dateStart = parseFrenchDate(dateText);
    if (!dateStart) return;

    // Category
    const categoryText = $el.find('.azenda-post-category-btn, [class*="category"]').first().text().trim();

    // Link
    let external_link = $el.find('a').first().attr('href') || null;
    if (external_link && !external_link.startsWith('http')) {
      external_link = `https://azenda.re${external_link}`;
    }

    // Image
    let image_url = $el.find('img').first().attr('data-src')
      || $el.find('img').first().attr('src')
      || null;
    if (image_url && !image_url.startsWith('http')) {
      image_url = `https://azenda.re${image_url}`;
    }

    // Location
    const address = $el.find('.elementor-icon-list-text, [class*="location"], [class*="lieu"]').first().text().trim() || '';

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
      _categoryText: categoryText + ' ' + title,
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
