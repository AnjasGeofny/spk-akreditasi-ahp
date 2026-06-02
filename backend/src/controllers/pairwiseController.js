const pairwiseModel = require('../models/pairwiseModel');
const { successResponse } = require('../utils/helpers');

const pairwiseController = {
  async getAll(req, res, next) {
    try {
      const comparisons = await pairwiseModel.getAll();
      successResponse(res, comparisons, 'Data perbandingan berpasangan berhasil dimuat');
    } catch (error) {
      next(error);
    }
  },

  async save(req, res, next) {
    try {
      const { comparisons } = req.body;
      await pairwiseModel.saveBatch(comparisons);
      const updated = await pairwiseModel.getAll();
      successResponse(res, updated, 'Perbandingan berpasangan berhasil disimpan');
    } catch (error) {
      next(error);
    }
  },

  async deleteAll(req, res, next) {
    try {
      await pairwiseModel.deleteAll();
      successResponse(res, null, 'Semua perbandingan berpasangan berhasil dihapus');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = pairwiseController;
