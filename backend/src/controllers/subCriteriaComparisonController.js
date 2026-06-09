const subCriteriaComparisonModel = require('../models/subCriteriaComparisonModel');
const { successResponse } = require('../utils/helpers');

const subCriteriaComparisonController = {
  async getByCriteria(req, res, next) {
    try {
      const comparisons = await subCriteriaComparisonModel.getByCriteria(req.params.criteriaId);
      successResponse(res, comparisons, 'Data perbandingan sub-kriteria berhasil dimuat');
    } catch (error) {
      next(error);
    }
  },

  async save(req, res, next) {
    try {
      const { criteriaId } = req.params;
      const { comparisons } = req.body;
      await subCriteriaComparisonModel.saveBatch(criteriaId, comparisons);
      const updated = await subCriteriaComparisonModel.getByCriteria(criteriaId);
      successResponse(res, updated, 'Perbandingan sub-kriteria berhasil disimpan');
    } catch (error) {
      next(error);
    }
  },

  async deleteByCriteria(req, res, next) {
    try {
      await subCriteriaComparisonModel.deleteByCriteria(req.params.criteriaId);
      successResponse(res, null, 'Perbandingan sub-kriteria berhasil dihapus');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = subCriteriaComparisonController;
