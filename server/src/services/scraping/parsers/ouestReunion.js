const { parseFrenchDate } = require('../utils/dateParser');
const { mapCommune } = require('../utils/communeMapper');
const { mapCategories } = require('../utils/categoryMapper');

async function parse($, source) {
  const events = [];

  // Each event is in .col-agenda > a.lien-vide > .agenda-wrapper
  $('.col-agenda').each((i, el) => {
    const $el = $(el);
    const $link = $el.find('a.lien-vide');
    if (!$link.length) return;

    // Title
    const title = $el.find('.agenda-contenu h2').text().trim();
    if (!title) return;

    // Date: p.date contains "Le DD/MM/YYYY" or "Du DD/MM/YYYY au DD/MM/YYYY"
    const dateText = $el.find('.agenda-contenu .date').text().trim();
    let dateStart = null;
    let dateEnd = null;

    const rangeMatch = dateText.match(/Du\s+(\d{2}\/\d{2}\/\d{4})\s+au\s+(\d{2}\/\d{2}\/\d{4})/i);
    if (rangeMatch) {
      dateStart = parseDDMMYYYY(rangeMatch[1]);
      dateEnd = parseDDMMYYYY(rangeMatch[2]);
    } else {
      const singleMatch = dateText.match(/Le\s+(\d{2}\/\d{2}\/\d{4})/i);
      if (singleMatch) {
        dateStart = parseDDMMYYYY(singleMatch[1]);
      }
    }

    if (!dateStart) return;

    // Image
    let image_url = $el.find('.agenda-vignette img').attr('src') || null;
    if (image_url && !image_url.startsWith('http')) {
      image_url = `https://www.ouest-lareunion.com${image_url}`;
    }

    // Link
    let external_link = $link.attr('href') || null;
    if (external_link && !external_link.startsWith('http')) {
      external_link = `https://www.ouest-lareunion.com${external_link}`;
    }

    // City: <strong> inside .agenda-contenu
    const city = $el.find('.agenda-contenu strong').text().trim();

    // Category text (text between <br> and <strong>)
    const contenuHtml = $el.find('.agenda-contenu').html() || '';
    const catMatch = contenuHtml.match(/<br>\s*(.*?)\s*<br>/);
    const categoryText = catMatch ? catMatch[1].replace(/<[^>]+>/g, '').trim() : '';

    events.push({
      title,
      date_start: dateStart,
      date_end: dateEnd,
      description: null,
      address: city,
      commune_id: null,
      image_url,
      external_link,
      price: null,
      organizer: null,
      category_ids: null,
      latitude: null,
      longitude: null,
      _city: city,
      _categoryText: categoryText + ' ' + title,
    });
  });

  // Resolve async mappings
  for (const event of events) {
    event.commune_id = await mapCommune(event._city);
    event.category_ids = await mapCategories(event._categoryText, source.category_mapping);
    delete event._city;
    delete event._categoryText;
  }

  return events;
}

function parseDDMMYYYY(str) {
  const [d, m, y] = str.split('/').map(Number);
  return new Date(y, m - 1, d);
}

module.exports = { parse };
