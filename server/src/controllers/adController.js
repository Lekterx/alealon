const adModel = require('../models/adModel');

// Campaigns
async function listCampaigns(req, res, next) {
  try {
    const { status } = req.query;
    const campaigns = await adModel.findAllCampaigns({ status });
    res.json(campaigns);
  } catch (err) { next(err); }
}

async function getCampaign(req, res, next) {
  try {
    const campaign = await adModel.findCampaignById(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campagne introuvable' });
    res.json(campaign);
  } catch (err) { next(err); }
}

async function createCampaign(req, res, next) {
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image_url;
    const campaign = await adModel.createCampaign({ ...req.body, image_url: imageUrl });
    res.status(201).json(campaign);
  } catch (err) { next(err); }
}

async function updateCampaign(req, res, next) {
  try {
    if (req.file) req.body.image_url = `/uploads/${req.file.filename}`;
    const campaign = await adModel.updateCampaign(req.params.id, req.body);
    if (!campaign) return res.status(404).json({ error: 'Campagne introuvable' });
    res.json(campaign);
  } catch (err) { next(err); }
}

// Public: get banner for placement
async function getBanner(req, res, next) {
  try {
    const { placement } = req.params;
    const campaign = await adModel.selectBannerForPlacement(placement);
    if (!campaign) return res.json(null);
    await adModel.recordImpression(campaign.id, placement);
    res.json({ id: campaign.id, image_url: campaign.image_url, destination_url: campaign.destination_url, advertiser: campaign.advertiser });
  } catch (err) { next(err); }
}

async function trackClick(req, res, next) {
  try {
    const { id } = req.params;
    const { placement } = req.body;
    await adModel.recordClick(parseInt(id), placement);
    res.json({ ok: true });
  } catch (err) { next(err); }
}

async function campaignStats(req, res, next) {
  try {
    const stats = await adModel.getStats(req.params.id);
    res.json(stats);
  } catch (err) { next(err); }
}

// Boosts
async function listBoosts(req, res, next) {
  try {
    const boosts = await adModel.findAllBoosts({ status: req.query.status });
    res.json(boosts);
  } catch (err) { next(err); }
}

async function createBoost(req, res, next) {
  try {
    const boost = await adModel.createBoost(req.body);
    res.status(201).json(boost);
  } catch (err) { next(err); }
}

async function updateBoost(req, res, next) {
  try {
    const boost = await adModel.updateBoost(req.params.id, req.body);
    if (!boost) return res.status(404).json({ error: 'Boost introuvable' });
    res.json(boost);
  } catch (err) { next(err); }
}

module.exports = { listCampaigns, getCampaign, createCampaign, updateCampaign, getBanner, trackClick, campaignStats, listBoosts, createBoost, updateBoost };
