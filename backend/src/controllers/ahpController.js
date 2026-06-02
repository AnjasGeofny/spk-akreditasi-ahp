const ahpService = require('../services/ahpService');
const ahpResultModel = require('../models/ahpResultModel');
const criteriaModel = require('../models/criteriaModel');
const alternativeModel = require('../models/alternativeModel');
const pairwiseModel = require('../models/pairwiseModel');
const alternativeComparisonModel = require('../models/alternativeComparisonModel');
const { successResponse } = require('../utils/helpers');

const ahpController = {
  /**
   * Calculate criteria weights using AHP
   */
  async calculateCriteria(req, res, next) {
    try {
      const criteria = await criteriaModel.getAll();
      if (criteria.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Minimal 2 kriteria diperlukan untuk perhitungan AHP',
        });
      }

      const criteriaIds = criteria.map((c) => c.id);
      const comparisons = await pairwiseModel.getMatrix(criteriaIds);

      if (comparisons.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Belum ada data perbandingan berpasangan kriteria',
        });
      }

      // Map comparisons to expected format
      const mappedComparisons = comparisons.map((c) => ({
        row_id: c.criteria_row_id,
        col_id: c.criteria_col_id,
        value: c.value,
      }));

      const result = ahpService.calculate(mappedComparisons, criteriaIds);

      // Map weights with criteria names
      const weightsWithNames = {};
      criteria.forEach((c) => {
        weightsWithNames[c.id] = {
          name: c.name,
          code: c.code,
          weight: result.weights[c.id],
        };
      });

      // Save to database
      const saved = await ahpResultModel.save({
        type: 'criteria',
        criteria_id: null,
        weights: result.weights,
        lambda_max: result.lambda_max,
        ci: result.ci,
        cr: result.cr,
        is_consistent: result.is_consistent,
        normalized_matrix: result.normalized_matrix,
        comparison_matrix: result.comparison_matrix,
      });

      successResponse(res, {
        id: saved.id,
        ...result,
        weights_detail: weightsWithNames,
        criteria_names: criteria.map((c) => ({ id: c.id, name: c.name, code: c.code })),
      }, 'Perhitungan AHP kriteria berhasil');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Calculate alternative weights for each criteria
   */
  async calculateAlternatives(req, res, next) {
    try {
      const criteria = await criteriaModel.getAll();
      const alternatives = await alternativeModel.getAll();

      if (alternatives.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Minimal 2 alternatif diperlukan',
        });
      }

      const alternativeIds = alternatives.map((a) => a.id);
      const results = [];

      for (const criterion of criteria) {
        const comparisons = await alternativeComparisonModel.getMatrix(criterion.id, alternativeIds);

        if (comparisons.length === 0) {
          return res.status(400).json({
            success: false,
            message: `Belum ada data perbandingan alternatif untuk kriteria "${criterion.name}"`,
          });
        }

        const mappedComparisons = comparisons.map((c) => ({
          row_id: c.alternative_row_id,
          col_id: c.alternative_col_id,
          value: c.value,
        }));

        const result = ahpService.calculate(mappedComparisons, alternativeIds);

        // Save to database
        const saved = await ahpResultModel.save({
          type: 'alternative',
          criteria_id: criterion.id,
          weights: result.weights,
          lambda_max: result.lambda_max,
          ci: result.ci,
          cr: result.cr,
          is_consistent: result.is_consistent,
          normalized_matrix: result.normalized_matrix,
          comparison_matrix: result.comparison_matrix,
        });

        results.push({
          id: saved.id,
          criteria_id: criterion.id,
          criteria_name: criterion.name,
          criteria_code: criterion.code,
          ...result,
        });
      }

      successResponse(res, results, 'Perhitungan AHP alternatif berhasil');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all AHP results
   */
  async getResults(req, res, next) {
    try {
      const results = await ahpResultModel.getAll();
      successResponse(res, results, 'Data hasil AHP berhasil dimuat');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get specific AHP result by ID
   */
  async getResultById(req, res, next) {
    try {
      const result = await ahpResultModel.getById(req.params.id);
      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Hasil AHP tidak ditemukan',
        });
      }
      successResponse(res, result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = ahpController;
