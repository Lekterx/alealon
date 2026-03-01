const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../../utils/logger');
const scrapingModel = require('../../models/scrapingModel');
const eventModel = require('../../models/eventModel');
const { getParser } = require('./parsers');
const { isDuplicate } = require('./utils/deduplicator');
const { makeSlug } = require('./utils/slugify');

async function runScraper(sourceId) {
  const source = await scrapingModel.findSourceById(sourceId);
  if (!source) throw new Error(`Source ${sourceId} introuvable`);
  if (!source.active) throw new Error(`Source ${sourceId} inactive`);

  const startedAt = new Date();
  const stats = { events_found: 0, events_created: 0, events_duplicated: 0, errors: [] };

  try {
    // 1. Fetch HTML
    const response = await axios.get(source.url, {
      headers: {
        'User-Agent': 'AleAlon-Bot/1.0 (+https://alealon.levyjulien.com)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'fr-FR,fr;q=0.9',
      },
      timeout: 15000,
    });

    // 2. Parse with cheerio
    const $ = cheerio.load(response.data);

    // 3. Get source-specific parser
    const parser = getParser(source);
    if (!parser) throw new Error(`Aucun parser pour la source: ${source.name}`);

    // 4. Extract raw events
    const rawEvents = await parser.parse($, source);
    stats.events_found = rawEvents.length;
    logger.info(`[Scraper] ${source.name}: ${rawEvents.length} événements trouvés`);

    // 5. Process each event
    for (const raw of rawEvents) {
      try {
        if (!raw.title || !raw.date_start) {
          stats.errors.push(`Event sans titre ou date: ${raw.title || '(sans titre)'}`);
          continue;
        }

        // Check duplicate
        const duplicate = await isDuplicate(raw.title, raw.date_start);
        if (duplicate) {
          stats.events_duplicated++;
          continue;
        }

        // Generate slug
        const slug = makeSlug(raw.title);

        // Insert event
        const event = await eventModel.create({
          title: raw.title,
          slug,
          description: raw.description || `Événement depuis ${source.name}`,
          date_start: raw.date_start,
          date_end: raw.date_end || null,
          recurrence: 'unique',
          address: raw.address || '',
          commune_id: raw.commune_id || null,
          latitude: raw.latitude || null,
          longitude: raw.longitude || null,
          image_url: raw.image_url || null,
          external_link: raw.external_link || source.url,
          price: raw.price || null,
          organizer: raw.organizer || source.name,
          contact_email: null,
          contact_phone: null,
          source: `scraper:${source.id}`,
          status: 'published',
          featured: false,
        });

        // Set categories
        if (raw.category_ids && raw.category_ids.length > 0) {
          await eventModel.setCategories(event.id, raw.category_ids);
        }

        stats.events_created++;
      } catch (eventErr) {
        const errMsg = `"${raw.title}": ${eventErr.message}`;
        stats.errors.push(errMsg);
        logger.warn(`[Scraper] ${source.name} - ${errMsg}`);
      }
    }

    // 6. Log result
    const log = await scrapingModel.createLog({
      source_id: source.id,
      status: stats.errors.length > 0 ? 'partial' : 'success',
      events_found: stats.events_found,
      events_created: stats.events_created,
      events_duplicated: stats.events_duplicated,
      errors: stats.errors.length > 0 ? stats.errors.join('\n') : null,
      started_at: startedAt,
      finished_at: new Date(),
    });

    // 7. Update last_run_at
    await scrapingModel.updateSource(source.id, { last_run_at: new Date() });

    logger.info(`[Scraper] ${source.name} terminé: ${stats.events_created} créés, ${stats.events_duplicated} doublons`);
    return log;

  } catch (fatalErr) {
    const log = await scrapingModel.createLog({
      source_id: source.id,
      status: 'error',
      events_found: stats.events_found,
      events_created: stats.events_created,
      events_duplicated: stats.events_duplicated,
      errors: fatalErr.message,
      started_at: startedAt,
      finished_at: new Date(),
    });
    logger.error(`[Scraper] ${source.name} FATAL: ${fatalErr.message}`);
    return log;
  }
}

module.exports = { runScraper };
