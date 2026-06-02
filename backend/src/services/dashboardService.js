const criteriaModel = require('../models/criteriaModel');
const alternativeModel = require('../models/alternativeModel');
const ahpResultModel = require('../models/ahpResultModel');
const accreditationResultModel = require('../models/accreditationResultModel');

const dashboardService = {
  async getSummary() {
    const [criteriaCount, alternativeCount, latestAhp, latestAccreditation] = await Promise.all([
      criteriaModel.getCount(),
      alternativeModel.getCount(),
      ahpResultModel.getLatestCriteriaResult(),
      accreditationResultModel.getLatestGrouped(),
    ]);

    // Calculate overall readiness
    let overallReadiness = null;
    let overallStatus = null;
    let ranking = [];

    if (latestAccreditation.length > 0) {
      if (latestAccreditation.length === 1 && !latestAccreditation[0].alternative_id) {
        // Without alternatives mode
        overallReadiness = latestAccreditation[0].readiness_percentage;
        overallStatus = latestAccreditation[0].status;
      } else {
        // With alternatives mode
        const avgScore = latestAccreditation.reduce((sum, r) => sum + r.readiness_percentage, 0) / latestAccreditation.length;
        overallReadiness = Math.round(avgScore * 100) / 100;
        ranking = latestAccreditation.map((r, i) => ({
          rank: i + 1,
          name: r.alternative_name || `Alternatif ${r.alternative_id}`,
          score: r.readiness_percentage,
          status: r.status,
        }));
      }
    }

    return {
      total_criteria: criteriaCount,
      total_alternatives: alternativeCount,
      ahp_consistency: latestAhp ? {
        is_consistent: latestAhp.is_consistent,
        cr: latestAhp.cr,
        ci: latestAhp.ci,
      } : null,
      overall_readiness: overallReadiness,
      overall_status: overallStatus,
      ranking,
      has_ahp_result: !!latestAhp,
      has_accreditation_result: latestAccreditation.length > 0,
    };
  },
};

module.exports = dashboardService;
