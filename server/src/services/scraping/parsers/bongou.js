const { parseFrenchDate } = require('../utils/dateParser');
const { mapCommune } = require('../utils/communeMapper');
const { mapCategories } = require('../utils/categoryMapper');

const MONTH_ABBR = {
  'JAN': 'janvier', 'FÉV': 'février', 'FEV': 'février', 'MAR': 'mars',
  'AVR': 'avril', 'MAI': 'mai', 'JUN': 'juin', 'JUI': 'juillet',
  'JUIL': 'juillet', 'AOÛ': 'août', 'AOU': 'août', 'SEP': 'septembre',
  'OCT': 'octobre', 'NOV': 'novembre', 'DÉC': 'décembre', 'DEC': 'décembre',
};

async function parse($, source) {
  const events = [];

  $('article.eventlist-event').each((i, el) => {
    const $el = $(el);

    const title = $el.find('.eventlist-title-link').text().trim();
    if (!title) return;

    // Date: month abbreviation (e.g. "JAN") + day (e.g. "15")
    const monthAbbr = $el.find('.eventlist-datetag-startdate--month').text().trim().toUpperCase();
    const day = $el.find('.eventlist-datetag-startdate--day').text().trim();
    const monthFull = MONTH_ABBR[monthAbbr] || monthAbbr.toLowerCase();
    const dateStart = parseFrenchDate(`${day} ${monthFull}`);
    if (!dateStart) return;

    // Address
    const addressEl = $el.find('.eventlist-meta-address');
    // Remove the map link text
    const addressClone = addressEl.clone();
    addressClone.find('.eventlist-meta-address-maplink').remove();
    const address = addressClone.text().trim();

    // Category
    const categoryText = $el.find('.eventlist-cats').text().trim();

    // Link
    const link = $el.find('.eventlist-title-link').attr('href');
    const external_link = link
      ? (link.startsWith('http') ? link : `https://bongou.re${link}`)
      : null;

    // Image
    let image_url = $el.find('.eventlist-thumbnail').attr('data-src')
      || $el.find('.eventlist-thumbnail').attr('src')
      || null;
    if (image_url && !image_url.startsWith('http')) {
      image_url = `https://bongou.re${image_url}`;
    }

    events.push({
      title,
      date_start: dateStart,
      date_end: null,
      description: null,
      address,
      commune_id: null, // resolved below
      image_url,
      external_link,
      price: null,
      organizer: null,
      category_ids: null, // resolved below
      latitude: null,
      longitude: null,
      _categoryText: categoryText,
      _address: address,
    });
  });

  // Resolve async mappings
  for (const event of events) {
    event.commune_id = await mapCommune(event._address);
    event.category_ids = await mapCategories(
      event._categoryText + ' ' + event.title,
      source.category_mapping
    );
    delete event._categoryText;
    delete event._address;
  }

  return events;
}

module.exports = { parse };
