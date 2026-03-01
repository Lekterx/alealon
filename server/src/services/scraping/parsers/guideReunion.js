const { parseFrenchDate, parseFrenchDateRange } = require('../utils/dateParser');
const { mapCommune } = require('../utils/communeMapper');
const { mapCategories } = require('../utils/categoryMapper');

async function parse($, source) {
  const events = [];

  // Each event is a div.article with a link to /evenements/eve/
  $('div.article').each((i, el) => {
    const $el = $(el);
    const $link = $el.find('a.transition');
    if (!$link.length) return;

    const title = $el.find('[itemprop="headline"]').text().trim();
    if (!title) return;

    // Description
    const description = $el.find('[itemprop="description"] p').text().trim() || null;

    // Image
    let image_url = $el.find('.news-img-wrap img').attr('src') || null;
    if (image_url && !image_url.startsWith('http')) {
      image_url = `https://www.guide-reunion.fr${image_url}`;
    }

    // Link
    let external_link = $link.attr('href') || null;
    if (external_link && !external_link.startsWith('http')) {
      external_link = `https://www.guide-reunion.fr${external_link}`;
    }

    // Date: text inside span[title="date de l'événement"]
    const dateSpan = $el.find('span[title*="date"]').first();
    const dateText = dateSpan.text().replace(/[\n\r\t]+/g, ' ').trim();

    let dateStart = null;
    let dateEnd = null;

    if (dateText.toLowerCase().includes('du ') && dateText.toLowerCase().includes(' au ')) {
      const range = parseFrenchDateRange(dateText);
      dateStart = range.start;
      dateEnd = range.end;
    } else {
      dateStart = parseFrenchDate(dateText);
    }

    if (!dateStart) return;

    // Location: text inside span[title="Lieu de l'événement"]
    const locationSpan = $el.find('span[title*="Lieu"]');
    const address = locationSpan.text().replace(/[\n\r\t]+/g, ' ').trim() || '';

    events.push({
      title,
      date_start: dateStart,
      date_end: dateEnd,
      description,
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
      _title: title,
    });
  });

  // Resolve async mappings
  for (const event of events) {
    event.commune_id = await mapCommune(event._address);
    event.category_ids = await mapCategories(
      event._title + ' ' + (event.description || ''),
      source.category_mapping
    );
    delete event._address;
    delete event._title;
  }

  return events;
}

module.exports = { parse };
