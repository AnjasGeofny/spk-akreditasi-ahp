const alternativeComparisonModel = require('../models/alternativeComparisonModel');
const { successResponse } = require('../utils/helpers');

const alternativeComparisonController = {
  async getBySubCriteria(req, res, next) {
    try {
      const comparisons = await alternativeComparisonModel.getBySubCriteria(req.params.subCriteriaId);
      successResponse(res, comparisons, 'Data perbandingan alternatif berhasil dimuat');
    } catch (error) {
      next(error);
    }
  },

  async save(req, res, next) {
    try {
      const { subCriteriaId } = req.params;
      const { comparisons } = req.body;
      await alternativeComparisonModel.saveBatch(subCriteriaId, comparisons);
      const updated = await alternativeComparisonModel.getBySubCriteria(subCriteriaId);
      successResponse(res, updated, 'Perbandingan alternatif berhasil disimpan');
    } catch (error) {
      next(error);
    }
  },

  async deleteBySubCriteria(req, res, next) {
    try {
      await alternativeComparisonModel.deleteBySubCriteria(req.params.subCriteriaId);
      successResponse(res, null, 'Perbandingan alternatif berhasil dihapus');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = alternativeComparisonController;
