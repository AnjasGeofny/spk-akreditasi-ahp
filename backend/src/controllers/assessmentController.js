const assessmentModel = require('../models/assessmentModel');
const { successResponse } = require('../utils/helpers');

const assessmentController = {
  async getAll(req, res, next) {
    try {
      const scores = await assessmentModel.getAll();
      successResponse(res, scores, 'Data skor penilaian berhasil dimuat');
    } catch (error) {
      next(error);
    }
  },

  async save(req, res, next) {
    try {
      const { scores } = req.body;
      const results = await assessmentModel.saveBatch(scores);
      successResponse(res, results, 'Skor penilaian berhasil disimpan');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = assessmentController;
