const pool = require('../config/db');

async function findAll({ limit = 20, offset = 0, status = 'published' } = {}) {
  const { rows } = await pool.query(
    `SELECT e.*,
       json_agg(json_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'color', c.color, 'icon', c.icon)) AS categories,
       co.name AS commune_name, co.micro_region
     FROM events e
     LEFT JOIN event_categories ec ON e.id = ec.event_id
     LEFT JOIN categories c ON ec.category_id = c.id
     LEFT JOIN communes co ON e.commune_id = co.id
     WHERE e.status = $1 AND e.date_start >= NOW() - INTERVAL '1 day'
     GROUP BY e.id, co.name, co.micro_region
     ORDER BY e.featured DESC, e.date_start ASC
     LIMIT $2 OFFSET $3`,
    [status, limit, offset]
  );
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT e.*,
       json_agg(json_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'color', c.color, 'icon', c.icon)) AS categories,
       co.name AS commune_name, co.micro_region
     FROM events e
     LEFT JOIN event_categories ec ON e.id = ec.event_id
     LEFT JOIN categories c ON ec.category_id = c.id
     LEFT JOIN communes co ON e.commune_id = co.id
     WHERE e.id = $1
     GROUP BY e.id, co.name, co.micro_region`,
    [id]
  );
  return rows[0] || null;
}

async function findBySlug(slug) {
  const { rows } = await pool.query(
    `SELECT e.*,
       json_agg(json_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'color', c.color, 'icon', c.icon)) AS categories,
       co.name AS commune_name, co.micro_region
     FROM events e
     LEFT JOIN event_categories ec ON e.id = ec.event_id
     LEFT JOIN categories c ON ec.category_id = c.id
     LEFT JOIN communes co ON e.commune_id = co.id
     WHERE e.slug = $1
     GROUP BY e.id, co.name, co.micro_region`,
    [slug]
  );
  return rows[0] || null;
}

async function search({ q, categories, commune_id, micro_region, date_from, date_to, free, lat, lng, radius_km, limit = 20, offset = 0 }) {
  const conditions = ["e.status = 'published'", "e.date_start >= NOW() - INTERVAL '1 day'"];
  const params = [];
  let idx = 1;

  if (q) {
    conditions.push(`(e.title ILIKE $${idx} OR e.description ILIKE $${idx})`);
    params.push(`%${q}%`);
    idx++;
  }

  if (categories && categories.length > 0) {
    conditions.push(`ec.category_id = ANY($${idx}::int[])`);
    params.push(categories);
    idx++;
  }

  if (commune_id) {
    conditions.push(`e.commune_id = $${idx}`);
    params.push(commune_id);
    idx++;
  }

  if (micro_region) {
    conditions.push(`co.micro_region = $${idx}`);
    params.push(micro_region);
    idx++;
  }

  if (date_from) {
    conditions.push(`e.date_start >= $${idx}`);
    params.push(date_from);
    idx++;
  }

  if (date_to) {
    conditions.push(`e.date_start <= $${idx}`);
    params.push(date_to);
    idx++;
  }

  if (free !== undefined) {
    if (free) {
      conditions.push(`(e.price IS NULL OR e.price ILIKE '%gratuit%')`);
    } else {
      conditions.push(`e.price IS NOT NULL AND e.price NOT ILIKE '%gratuit%'`);
    }
  }

  let distanceSelect = '';
  let distanceOrder = '';
  if (lat && lng && radius_km) {
    distanceSelect = `, (6371 * acos(cos(radians($${idx})) * cos(radians(e.latitude)) * cos(radians(e.longitude) - radians($${idx + 1})) + sin(radians($${idx})) * sin(radians(e.latitude)))) AS distance`;
    conditions.push(`(6371 * acos(cos(radians($${idx})) * cos(radians(e.latitude)) * cos(radians(e.longitude) - radians($${idx + 1})) + sin(radians($${idx})) * sin(radians(e.latitude)))) <= $${idx + 2}`);
    params.push(lat, lng, radius_km);
    distanceOrder = ', distance ASC';
    idx += 3;
  }

  params.push(limit, offset);

  const query = `
    SELECT e.*,
      json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'color', c.color, 'icon', c.icon)) AS categories,
      co.name AS commune_name, co.micro_region
      ${distanceSelect}
    FROM events e
    LEFT JOIN event_categories ec ON e.id = ec.event_id
    LEFT JOIN categories c ON ec.category_id = c.id
    LEFT JOIN communes co ON e.commune_id = co.id
    WHERE ${conditions.join(' AND ')}
    GROUP BY e.id, co.name, co.micro_region
    ORDER BY e.featured DESC${distanceOrder}, e.date_start ASC
    LIMIT $${idx} OFFSET $${idx + 1}
  `;

  const { rows } = await pool.query(query, params);
  return rows;
}

async function create({ title, slug, description, date_start, date_end, recurrence, address, commune_id, latitude, longitude, image_url, external_link, price, organizer, contact_email, contact_phone, source, status, featured }) {
  const { rows } = await pool.query(
    `INSERT INTO events (title, slug, description, date_start, date_end, recurrence, address, commune_id, latitude, longitude, image_url, external_link, price, organizer, contact_email, contact_phone, source, status, featured)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) RETURNING *`,
    [title, slug, description, date_start, date_end, recurrence, address, commune_id, latitude, longitude, image_url, external_link, price, organizer, contact_email, contact_phone, source, status, featured]
  );
  return rows[0];
}

async function update(id, fields) {
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');

  const { rows } = await pool.query(
    `UPDATE events SET ${sets}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  return rows[0] || null;
}

async function setCategories(eventId, categoryIds) {
  await pool.query('DELETE FROM event_categories WHERE event_id = $1', [eventId]);
  if (categoryIds && categoryIds.length > 0) {
    const values = categoryIds.map((cId, i) => `($1, $${i + 2})`).join(', ');
    await pool.query(`INSERT INTO event_categories (event_id, category_id) VALUES ${values}`, [eventId, ...categoryIds]);
  }
}

async function remove(id) {
  await pool.query('DELETE FROM events WHERE id = $1', [id]);
}

async function countByStatus() {
  const { rows } = await pool.query(
    `SELECT status, COUNT(*)::int AS count FROM events GROUP BY status`
  );
  return rows;
}

module.exports = { findAll, findById, findBySlug, search, create, update, setCategories, remove, countByStatus };
