const { mapCommune } = require('../utils/communeMapper');
const { mapCategories } = require('../utils/categoryMapper');

/**
 * Parser for bongou.re (Squarespace site).
 * The /agenda page no longer exists — events are JS-rendered.
 * We try the Squarespace JSON API; if no items, return empty.
 */
async function parse($, source, { axios }) {
  const events = [];

  // Squarespace JSON API — try /sorties?format=json or /?format=json
  const baseUrl = source.url.replace(/\/$/, '');
  const jsonUrls = [
    `${baseUrl}?format=json`,
    'https://bongou.re/?format=json',
  ];

  let items = [];
  for (const url of jsonUrls) {
    try {
      const res = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
        timeout: 10000,
      });
      if (res.data?.items?.length > 0) {
        items = res.data.items;
        break;
      }
      if (res.data?.upcoming?.length > 0) {
        items = res.data.upcoming;
        break;
      }
    } catch {
      // Try next URL
    }
  }

  if (items.length === 0) return events;

  for (const item of items) {
    const title = item.title?.trim();
    if (!title) continue;

    // Squarespace stores dates as epoch milliseconds
    const startDate = item.startDate || item.publishOn;
    if (!startDate) continue;
    const dateStart = new Date(startDate);
    if (isNaN(dateStart.getTime())) continue;

    const dateEnd = item.endDate ? new Date(item.endDate) : null;

    const external_link = item.fullUrl
      ? (item.fullUrl.startsWith('http') ? item.fullUrl : `https://bongou.re${item.fullUrl}`)
      : null;

    const image_url = item.assetUrl || item.socialImageUrl || null;

    const address = item.location?.addressLine1 || item.location?.addressTitle || '';

    events.push({
      title,
      date_start: dateStart,
      date_end: dateEnd && !isNaN(dateEnd.getTime()) ? dateEnd : null,
      description: item.excerpt || null,
      address,
      commune_id: null,
      image_url,
      external_link,
      price: null,
      organizer: null,
      category_ids: null,
      latitude: item.location?.mapLat || null,
      longitude: item.location?.mapLng || null,
      _address: address,
      _categoryText: (item.categories || []).join(' ') + ' ' + title,
    });
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
