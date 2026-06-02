const accreditationService = require('../services/accreditationService');
const accreditationResultModel = require('../models/accreditationResultModel');
const { successResponse } = require('../utils/helpers');

const accreditationController = {
  async calculate(req, res, next) {
    try {
      const { mode } = req.body; // 'without_alternatives' or 'with_alternatives'

      let results;
      if (mode === 'with_alternatives') {
        results = await accreditationService.calculateWithAlternatives();
      } else {
        results = await accreditationService.calculateWithoutAlternatives();
      }

      successResponse(res, results, 'Perhitungan akreditasi berhasil');
    } catch (error) {
      next(error);
    }
  },

  async getResults(req, res, next) {
    try {
      const results = await accreditationResultModel.getAll();
      successResponse(res, results, 'Data hasil akreditasi berhasil dimuat');
    } catch (error) {
      next(error);
    }
  },

  async getLatest(req, res, next) {
    try {
      const results = await accreditationResultModel.getLatestGrouped();
      successResponse(res, results, 'Data hasil akreditasi terbaru berhasil dimuat');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = accreditationController;
