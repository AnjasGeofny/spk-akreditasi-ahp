const dashboardService = require('../services/dashboardService');
const { successResponse } = require('../utils/helpers');

const dashboardController = {
  async getSummary(req, res, next) {
    try {
      const summary = await dashboardService.getSummary();
      successResponse(res, summary, 'Data dashboard berhasil dimuat');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = dashboardController;
