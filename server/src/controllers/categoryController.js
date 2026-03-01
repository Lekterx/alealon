const categoryModel = require('../models/categoryModel');

async function list(req, res, next) {
  try {
    const categories = await categoryModel.findAll();
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const category = await categoryModel.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Catégorie introuvable' });
    }
    res.json(category);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const category = await categoryModel.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const category = await categoryModel.update(req.params.id, req.body);
    if (!category) {
      return res.status(404).json({ error: 'Catégorie introuvable' });
    }
    res.json(category);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await categoryModel.remove(req.params.id);
    res.json({ message: 'Catégorie désactivée' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove };
