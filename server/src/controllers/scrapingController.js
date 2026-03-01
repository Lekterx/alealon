const scrapingModel = require('../models/scrapingModel');
const { runScraper } = require('../services/scraping/scraperRunner');
const logger = require('../utils/logger');

async function listSources(req, res, next) {
  try {
    const sources = await scrapingModel.findAllSources();
    res.json(sources);
  } catch (err) { next(err); }
}

async function getSource(req, res, next) {
  try {
    const source = await scrapingModel.findSourceById(req.params.id);
    if (!source) return res.status(404).json({ error: 'Source introuvable' });
    res.json(source);
  } catch (err) { next(err); }
}

async function createSource(req, res, next) {
  try {
    const source = await scrapingModel.createSource(req.body);
    res.status(201).json(source);
  } catch (err) { next(err); }
}

async function updateSource(req, res, next) {
  try {
    const source = await scrapingModel.updateSource(req.params.id, req.body);
    if (!source) return res.status(404).json({ error: 'Source introuvable' });
    res.json(source);
  } catch (err) { next(err); }
}

async function deleteSource(req, res, next) {
  try {
    await scrapingModel.deleteSource(req.params.id);
    res.json({ message: 'Source supprimée' });
  } catch (err) { next(err); }
}

async function listLogs(req, res, next) {
  try {
    const logs = await scrapingModel.findLogs({ source_id: req.query.source_id ? parseInt(req.query.source_id) : undefined });
    res.json(logs);
  } catch (err) { next(err); }
}

async function runSource(req, res, next) {
  try {
    const sourceId = parseInt(req.params.id);
    const log = await runScraper(sourceId);
    res.json(log);
  } catch (err) {
    next(err);
  }
}

module.exports = { listSources, getSource, createSource, updateSource, deleteSource, listLogs, runSource };
