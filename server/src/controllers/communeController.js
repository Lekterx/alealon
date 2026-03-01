const communeModel = require('../models/communeModel');

async function list(req, res, next) {
  try {
    const { micro_region } = req.query;
    const communes = micro_region
      ? await communeModel.findByMicroRegion(micro_region)
      : await communeModel.findAll();
    res.json(communes);
  } catch (err) {
    next(err);
  }
}

module.exports = { list };
