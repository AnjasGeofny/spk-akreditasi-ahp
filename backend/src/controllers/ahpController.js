const ahpService = require('../services/ahpService');
const ahpResultModel = require('../models/ahpResultModel');
const criteriaModel = require('../models/criteriaModel');
const subCriteriaModel = require('../models/subCriteriaModel');
const alternativeModel = require('../models/alternativeModel');
const pairwiseModel = require('../models/pairwiseModel');
const subCriteriaComparisonModel = require('../models/subCriteriaComparisonModel');
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
   * Calculate sub-criteria weights for one criteria using AHP
   */
  async calculateSubCriteria(req, res, next) {
    try {
      const criteria = await criteriaModel.getById(req.params.criteriaId);
      if (!criteria) {
        return res.status(404).json({
          success: false,
          message: 'Kriteria tidak ditemukan',
        });
      }

      const subCriteria = await subCriteriaModel.getAll(criteria.id);
      if (subCriteria.length < 2) {
        return res.status(400).json({
          success: false,
          message: `Minimal 2 sub-kriteria diperlukan untuk kriteria "${criteria.name}"`,
        });
      }

      const subCriteriaIds = subCriteria.map((s) => s.id);
      const comparisons = await subCriteriaComparisonModel.getMatrix(criteria.id, subCriteriaIds);

      if (comparisons.length === 0) {
        return res.status(400).json({
          success: false,
          message: `Belum ada data perbandingan sub-kriteria untuk kriteria "${criteria.name}"`,
        });
      }

      const mappedComparisons = comparisons.map((c) => ({
        row_id: c.sub_criteria_row_id,
        col_id: c.sub_criteria_col_id,
        value: c.value,
      }));

      const result = ahpService.calculate(mappedComparisons, subCriteriaIds);

      const weightsWithNames = {};
      subCriteria.forEach((s) => {
        weightsWithNames[s.id] = {
          name: s.name,
          code: s.code,
          weight: result.weights[s.id],
        };
      });

      const saved = await ahpResultModel.save({
        type: 'sub_criteria',
        criteria_id: criteria.id,
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
        criteria_id: criteria.id,
        criteria_name: criteria.name,
        criteria_code: criteria.code,
        ...result,
        weights_detail: weightsWithNames,
        sub_criteria_names: subCriteria.map((s) => ({ id: s.id, name: s.name, code: s.code })),
      }, 'Perhitungan AHP sub-kriteria berhasil');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Calculate alternative weights for each sub-criteria
   */
  async calculateAlternatives(req, res, next) {
    try {
      const allSubCriteria = await subCriteriaModel.getAll();
      const alternatives = await alternativeModel.getAll();

      if (alternatives.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Minimal 2 alternatif diperlukan',
        });
      }

      if (allSubCriteria.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Belum ada sub-kriteria. Tambahkan sub-kriteria terlebih dahulu.',
        });
      }

      const alternativeIds = alternatives.map((a) => a.id);
      const results = [];

      for (const sc of allSubCriteria) {
        const comparisons = await alternativeComparisonModel.getMatrix(sc.id, alternativeIds);

        if (comparisons.length === 0) {
          return res.status(400).json({
            success: false,
            message: `Belum ada data perbandingan alternatif untuk sub-kriteria "${sc.name}"`,
          });
        }

        const mappedComparisons = comparisons.map((c) => ({
          row_id: c.alternative_row_id,
          col_id: c.alternative_col_id,
          value: c.value,
        }));

        const result = ahpService.calculate(mappedComparisons, alternativeIds);

        // Save to database with sub_criteria_id
        const saved = await ahpResultModel.save({
          type: 'alternative',
          criteria_id: sc.criteria_id,
          sub_criteria_id: sc.id,
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
          criteria_id: sc.criteria_id,
          sub_criteria_id: sc.id,
          sub_criteria_name: sc.name,
          sub_criteria_code: sc.code,
          ...result,
        });
      }

      successResponse(res, results, 'Perhitungan AHP alternatif per sub-kriteria berhasil');
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

  /**
   * Get readiness status for accreditation calculation
   */
  async getReadiness(req, res, next) {
    try {
      const criteria = await criteriaModel.getAll();
      const allSubCriteria = await subCriteriaModel.getAll();

      // 1. Check criteria AHP
      const criteriaResult = await ahpResultModel.getLatestCriteriaResult();
      const criteriaReady = criteriaResult && criteriaResult.is_consistent;

      // 2. Check sub-criteria AHP per criteria
      const subCriteriaResults = await ahpResultModel.getLatestSubCriteriaResults();
      const scResultMap = {};
      subCriteriaResults.forEach((r) => { scResultMap[r.criteria_id] = r; });

      const subCriteriaStatus = criteria.map((c) => {
        const result = scResultMap[c.id];
        return {
          criteria_id: c.id,
          criteria_code: c.code,
          criteria_name: c.name,
          ready: result ? result.is_consistent : false,
          cr: result?.cr || null,
          is_consistent: result?.is_consistent || false,
          calculated: !!result,
        };
      });
      const allSubCriteriaReady = subCriteriaStatus.every((s) => s.ready);

      // 3. Check alternative AHP per sub-criteria
      const altResults = await ahpResultModel.getLatestAlternativeResults();
      const altResultMap = {};
      altResults.forEach((r) => { altResultMap[r.sub_criteria_id] = r; });

      const alternativeStatus = allSubCriteria.map((sc) => {
        const result = altResultMap[sc.id];
        return {
          sub_criteria_id: sc.id,
          sub_criteria_code: sc.code,
          sub_criteria_name: sc.name,
          criteria_code: sc.criteria_code,
          ready: result ? result.is_consistent : false,
          cr: result?.cr || null,
          is_consistent: result?.is_consistent || false,
          calculated: !!result,
        };
      });
      const allAlternativesReady = alternativeStatus.every((s) => s.ready);

      const allReady = criteriaReady && allSubCriteriaReady && allAlternativesReady;

      successResponse(res, {
        all_ready: allReady,
        criteria: {
          ready: criteriaReady,
          calculated: !!criteriaResult,
          is_consistent: criteriaResult?.is_consistent || false,
          cr: criteriaResult?.cr || null,
        },
        sub_criteria: {
          all_ready: allSubCriteriaReady,
          details: subCriteriaStatus,
        },
        alternatives: {
          all_ready: allAlternativesReady,
          total: allSubCriteria.length,
          completed: alternativeStatus.filter((s) => s.ready).length,
          details: alternativeStatus,
        },
      }, 'Status kesiapan berhasil dimuat');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = ahpController;
