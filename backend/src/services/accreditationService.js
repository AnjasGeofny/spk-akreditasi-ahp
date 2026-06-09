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
    const ahpResult = await ahpResultModel.getLatestCriteriaResult();
    if (!ahpResult) {
      throw new Error('Belum ada hasil perhitungan AHP kriteria. Silakan hitung bobot kriteria terlebih dahulu.');
    }
    if (!ahpResult.is_consistent) {
      throw new Error('Hasil AHP kriteria tidak konsisten (CR ≥ 0.1). Silakan perbaiki matriks perbandingan.');
    }

    const scores = await assessmentModel.getWithoutAlternative();
    if (scores.length === 0) {
      throw new Error('Belum ada skor penilaian. Silakan input skor capaian terlebih dahulu.');
    }

    const criteriaWeights = ahpResult.weights;
    const result = ahpService.calculateFinalScore(criteriaWeights, scores);
    const status = getReadinessStatus(result.readiness_percentage);

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
   * Calculate accreditation with alternatives using full 3-level AHP:
   * Score(A) = Σ_C [ w_C × Σ_SC ( w_SC_local × w_A_SC ) ] × 100
   */
  async calculateWithAlternatives() {
    // 1. Get criteria AHP weights
    const criteriaAhpResult = await ahpResultModel.getLatestCriteriaResult();
    if (!criteriaAhpResult) {
      throw new Error('Belum ada hasil perhitungan AHP kriteria.');
    }
    if (!criteriaAhpResult.is_consistent) {
      throw new Error('Hasil AHP kriteria tidak konsisten (CR ≥ 0.1).');
    }

    // 2. Get sub-criteria AHP weights (local weights per criteria)
    const subCriteriaAhpResults = await ahpResultModel.getLatestSubCriteriaResults();
    // (soft check: warn but don't block — missing sub-criteria just contribute 0)

    // Build subCriteriaWeights: { criteriaId: { subCriteriaId: localWeight } }
    const subCriteriaWeights = {};
    for (const result of subCriteriaAhpResults) {
      const cId = result.criteria_id;
      if (!subCriteriaWeights[cId]) subCriteriaWeights[cId] = {};
      // result.weights = { subCriteriaId: localWeight }
      for (const [scId, w] of Object.entries(result.weights)) {
        subCriteriaWeights[cId][parseInt(scId)] = w;
      }
    }

    // 3. Get alternative AHP weights (per sub-criteria)
    const altAhpResults = await ahpResultModel.getLatestAlternativeResults();
    if (altAhpResults.length === 0) {
      throw new Error('Belum ada hasil perhitungan AHP alternatif per sub-kriteria. Silakan hitung perbandingan alternatif terlebih dahulu.');
    }

    const inconsistentAlt = altAhpResults.filter((r) => !r.is_consistent);
    if (inconsistentAlt.length > 0) {
      const names = inconsistentAlt.map((r) => r.sub_criteria_name || r.sub_criteria_code).join(', ');
      throw new Error(`AHP alternatif tidak konsisten untuk sub-kriteria: ${names}`);
    }

    // Build alternativeWeights: { subCriteriaId: { alternativeId: weight } }
    const alternativeWeights = {};
    for (const result of altAhpResults) {
      alternativeWeights[result.sub_criteria_id] = result.weights;
    }

    // 4. Get all alternatives
    const alternatives = await alternativeModel.getAll();
    const alternativeIds = alternatives.map((a) => a.id);

    // 5. Run the 3-level calculation
    const criteriaWeights = criteriaAhpResult.weights;
    const rawResults = ahpService.calculateAlternativeScores(
      criteriaWeights,
      subCriteriaWeights,
      alternativeWeights,
      alternativeIds
    );

    // 5b. Normalize scores to 0-100 scale.
    // In AHP, all alternative weights sum to 100 (across n_alt alternatives),
    // so equal-share baseline = 100 / n_alt. We map that baseline to 50,
    // giving scores in a meaningful 0-100 range.
    const nAlt = alternativeIds.length;
    const equalShare = 100 / nAlt; // e.g. 7.14 for 14 alternatives
    const results = rawResults.map((r) => ({
      ...r,
      raw_score: r.final_score,
      final_score: Math.min(100, Math.round((r.final_score / equalShare) * 50 * 100) / 100),
      readiness_percentage: Math.min(100, Math.round((r.readiness_percentage / equalShare) * 50 * 100) / 100),
    }));

    // 6. Clear previous results then save fresh batch
    await accreditationResultModel.deleteAll();

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
