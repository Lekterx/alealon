const pool = require('../config/db');

async function findAllCampaigns({ status, limit = 50, offset = 0 } = {}) {
  let query = 'SELECT * FROM ad_campaigns';
  const params = [];
  if (status) {
    query += ' WHERE status = $1';
    params.push(status);
  }
  query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
  params.push(limit, offset);
  const { rows } = await pool.query(query, params);
  return rows;
}

async function findCampaignById(id) {
  const { rows } = await pool.query('SELECT * FROM ad_campaigns WHERE id = $1', [id]);
  return rows[0] || null;
}

async function createCampaign(data) {
  const { rows } = await pool.query(
    `INSERT INTO ad_campaigns (name, advertiser, image_url, destination_url, date_start, date_end, placements, impressions_bought, priority, target_communes, target_categories, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [data.name, data.advertiser, data.image_url, data.destination_url, data.date_start, data.date_end, data.placements, data.impressions_bought, data.priority, data.target_communes, data.target_categories, data.status || 'draft']
  );
  return rows[0];
}

async function updateCampaign(id, fields) {
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
  const { rows } = await pool.query(
    `UPDATE ad_campaigns SET ${sets}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  return rows[0] || null;
}

async function selectBannerForPlacement(placement) {
  const { rows } = await pool.query(
    `SELECT * FROM ad_campaigns
     WHERE status = 'active' AND $1 = ANY(placements)
       AND date_start <= NOW() AND date_end >= NOW()
       AND (impressions_bought IS NULL OR impressions_bought > (SELECT COUNT(*) FROM ad_impressions WHERE campaign_id = ad_campaigns.id))
     ORDER BY priority DESC, RANDOM()
     LIMIT 1`,
    [placement]
  );
  return rows[0] || null;
}

async function recordImpression(campaignId, placement) {
  await pool.query(
    'INSERT INTO ad_impressions (campaign_id, placement) VALUES ($1, $2)',
    [campaignId, placement]
  );
}

async function recordClick(campaignId, placement) {
  await pool.query(
    'INSERT INTO ad_clicks (campaign_id, placement) VALUES ($1, $2)',
    [campaignId, placement]
  );
}

async function getStats(campaignId) {
  const { rows } = await pool.query(
    `SELECT
       (SELECT COUNT(*)::int FROM ad_impressions WHERE campaign_id = $1) AS impressions,
       (SELECT COUNT(*)::int FROM ad_clicks WHERE campaign_id = $1) AS clicks`,
    [campaignId]
  );
  return rows[0];
}

// Event boosts
async function findAllBoosts({ status } = {}) {
  let query = `SELECT eb.*, e.title AS event_title FROM event_boosts eb LEFT JOIN events e ON eb.event_id = e.id`;
  const params = [];
  if (status) {
    query += ' WHERE eb.status = $1';
    params.push(status);
  }
  query += ' ORDER BY eb.created_at DESC';
  const { rows } = await pool.query(query, params);
  return rows;
}

async function createBoost(data) {
  const { rows } = await pool.query(
    `INSERT INTO event_boosts (event_id, boost_type, date_start, date_end, amount, status)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [data.event_id, data.boost_type, data.date_start, data.date_end, data.amount, data.status || 'pending']
  );
  return rows[0];
}

async function updateBoost(id, fields) {
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
  const { rows } = await pool.query(
    `UPDATE event_boosts SET ${sets} WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  return rows[0] || null;
}

module.exports = { findAllCampaigns, findCampaignById, createCampaign, updateCampaign, selectBannerForPlacement, recordImpression, recordClick, getStats, findAllBoosts, createBoost, updateBoost };
