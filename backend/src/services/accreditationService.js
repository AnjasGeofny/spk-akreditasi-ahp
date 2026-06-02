const { getReadinessStatus } = require('../utils/constants');
const ahpService = require('./ahpService');
const ahpResultModel = require('../models/ahpResultModel');
const assessmentModel = require('../models/assessmentModel');
const accreditationResultModel = require('../models/accreditationResultModel');
const criteriaModel = require('../models/criteriaModel');
const alternativeModel = require('../models/alternativeModel');

const accreditationService = {
  /**
   * Calculate accreditation without alternatives
   */
  async calculateWithoutAlternatives() {
    // Get latest criteria AHP result
    const ahpResult = await ahpResultModel.getLatestCriteriaResult();
    if (!ahpResult) {
      throw new Error('Belum ada hasil perhitungan AHP kriteria. Silakan hitung bobot kriteria terlebih dahulu.');
    }
    if (!ahpResult.is_consistent) {
      throw new Error('Hasil AHP kriteria tidak konsisten (CR ≥ 0.1). Silakan perbaiki matriks perbandingan.');
    }

    // Get assessment scores (without alternative)
    const scores = await assessmentModel.getWithoutAlternative();
    if (scores.length === 0) {
      throw new Error('Belum ada skor penilaian. Silakan input skor capaian terlebih dahulu.');
    }

    const criteriaWeights = ahpResult.weights;
    const result = ahpService.calculateFinalScore(criteriaWeights, scores);
    const status = getReadinessStatus(result.readiness_percentage);

    // Save result
    const saved = await accreditationResultModel.save({
      alternative_id: null,
      final_score: result.final_score,
      readiness_percentage: result.readiness_percentage,
      status: status.label,
      detail_scores: result.details,
      ahp_result_id: ahpResult.id,
    });

    return {
      ...saved,
      status_info: status,
      details: result.details,
    };
  },

  /**
   * Calculate accreditation with alternatives
   */
  async calculateWithAlternatives() {
    // Get latest criteria AHP result
    const criteriaAhpResult = await ahpResultModel.getLatestCriteriaResult();
    if (!criteriaAhpResult) {
      throw new Error('Belum ada hasil perhitungan AHP kriteria.');
    }
    if (!criteriaAhpResult.is_consistent) {
      throw new Error('Hasil AHP kriteria tidak konsisten (CR ≥ 0.1).');
    }

    // Get latest alternative AHP results
    const altAhpResults = await ahpResultModel.getLatestAlternativeResults();
    if (altAhpResults.length === 0) {
      throw new Error('Belum ada hasil perhitungan AHP alternatif.');
    }

    // Check consistency of all alternative results
    const inconsistent = altAhpResults.filter((r) => !r.is_consistent);
    if (inconsistent.length > 0) {
      const names = inconsistent.map((r) => r.criteria_name).join(', ');
      throw new Error(`AHP alternatif tidak konsisten untuk kriteria: ${names}`);
    }

    const criteriaWeights = criteriaAhpResult.weights;
    const alternativeWeights = {};
    for (const result of altAhpResults) {
      alternativeWeights[result.criteria_id] = result.weights;
    }

    const alternatives = await alternativeModel.getAll();
    const alternativeIds = alternatives.map((a) => a.id);

    const results = ahpService.calculateAlternativeScores(
      criteriaWeights,
      alternativeWeights,
      alternativeIds
    );

    // Save results
    const savedResults = [];
    for (const result of results) {
      const status = getReadinessStatus(result.readiness_percentage);
      const saved = await accreditationResultModel.save({
        alternative_id: result.alternative_id,
        final_score: result.final_score,
        readiness_percentage: result.readiness_percentage,
        status: status.label,
        detail_scores: result.details,
        ahp_result_id: criteriaAhpResult.id,
      });
      savedResults.push({
        ...saved,
        rank: result.rank,
        status_info: status,
        alternative_name: alternatives.find((a) => a.id === result.alternative_id)?.name,
      });
    }

    return savedResults;
  },
};

module.exports = accreditationService;
