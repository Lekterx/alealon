const eventModel = require('../models/eventModel');

function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function list(req, res, next) {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const events = await eventModel.findAll({ limit: parseInt(limit), offset: parseInt(offset) });
    res.json(events);
  } catch (err) {
    next(err);
  }
}

async function listAll(req, res, next) {
  try {
    const { limit = 50, offset = 0, status } = req.query;
    const events = await eventModel.findAll({ limit: parseInt(limit), offset: parseInt(offset), status: status || undefined });
    res.json(events);
  } catch (err) {
    next(err);
  }
}

async function getBySlug(req, res, next) {
  try {
    const event = await eventModel.findBySlug(req.params.slug);
    if (!event) {
      return res.status(404).json({ error: 'Événement introuvable' });
    }
    res.json(event);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const event = await eventModel.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Événement introuvable' });
    }
    res.json(event);
  } catch (err) {
    next(err);
  }
}

async function search(req, res, next) {
  try {
    const { q, categories, commune_id, micro_region, date_from, date_to, free, lat, lng, radius_km, limit = 20, offset = 0 } = req.query;
    const events = await eventModel.search({
      q,
      categories: categories ? categories.split(',').map(Number) : undefined,
      commune_id: commune_id ? parseInt(commune_id) : undefined,
      micro_region,
      date_from,
      date_to,
      free: free !== undefined ? free === 'true' : undefined,
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
      radius_km: radius_km ? parseFloat(radius_km) : undefined,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    res.json(events);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const slug = slugify(req.body.title) + '-' + Date.now().toString(36);
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image_url || null;

    const event = await eventModel.create({
      ...req.body,
      slug,
      image_url: imageUrl,
      source: req.body.source || 'manual',
      status: req.body.status || 'published',
      featured: req.body.featured || false,
    });

    if (req.body.category_ids) {
      const categoryIds = Array.isArray(req.body.category_ids)
        ? req.body.category_ids.map(Number)
        : JSON.parse(req.body.category_ids).map(Number);
      await eventModel.setCategories(event.id, categoryIds);
    }

    const full = await eventModel.findById(event.id);
    res.status(201).json(full);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { category_ids, ...fields } = req.body;
    if (req.file) {
      fields.image_url = `/uploads/${req.file.filename}`;
    }

    const event = await eventModel.update(req.params.id, fields);
    if (!event) {
      return res.status(404).json({ error: 'Événement introuvable' });
    }

    if (category_ids) {
      const ids = Array.isArray(category_ids) ? category_ids.map(Number) : JSON.parse(category_ids).map(Number);
      await eventModel.setCategories(event.id, ids);
    }

    const full = await eventModel.findById(event.id);
    res.json(full);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await eventModel.remove(req.params.id);
    res.json({ message: 'Événement supprimé' });
  } catch (err) {
    next(err);
  }
}

async function stats(req, res, next) {
  try {
    const counts = await eventModel.countByStatus();
    res.json(counts);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, listAll, getBySlug, getById, search, create, update, remove, stats };
