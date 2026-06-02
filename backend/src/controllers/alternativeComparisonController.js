const alternativeComparisonModel = require('../models/alternativeComparisonModel');
const { successResponse } = require('../utils/helpers');

const alternativeComparisonController = {
  async getByCriteria(req, res, next) {
    try {
      const comparisons = await alternativeComparisonModel.getByCriteria(req.params.criteriaId);
      successResponse(res, comparisons, 'Data perbandingan alternatif berhasil dimuat');
    } catch (error) {
      next(error);
    }
  },

  async save(req, res, next) {
    try {
      const { criteriaId } = req.params;
      const { comparisons } = req.body;
      await alternativeComparisonModel.saveBatch(criteriaId, comparisons);
      const updated = await alternativeComparisonModel.getByCriteria(criteriaId);
      successResponse(res, updated, 'Perbandingan alternatif berhasil disimpan');
    } catch (error) {
      next(error);
    }
  },

  async deleteByCriteria(req, res, next) {
    try {
      await alternativeComparisonModel.deleteByCriteria(req.params.criteriaId);
      successResponse(res, null, 'Perbandingan alternatif berhasil dihapus');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = alternativeComparisonController;
