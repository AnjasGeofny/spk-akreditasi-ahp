const { RANDOM_INDEX, CR_THRESHOLD } = require('../utils/constants');
const { roundTo } = require('../utils/helpers');

/**
 * AHP Service - Complete Analytic Hierarchy Process implementation
 */
const ahpService = {
  /**
   * Build comparison matrix from flat array of comparisons
   * @param {Array} comparisons - [{row_id, col_id, value}, ...]
   * @param {Array} ids - ordered array of IDs
   * @returns {number[][]} n×n matrix
   */
  buildComparisonMatrix(comparisons, ids) {
    const n = ids.length;
    const matrix = Array.from({ length: n }, () => Array(n).fill(1));
    const idIndex = {};
    ids.forEach((id, i) => (idIndex[id] = i));

    for (const comp of comparisons) {
      const rowIdx = idIndex[comp.row_id !== undefined ? comp.row_id : comp.criteria_row_id || comp.alternative_row_id];
      const colIdx = idIndex[comp.col_id !== undefined ? comp.col_id : comp.criteria_col_id || comp.alternative_col_id];

      if (rowIdx !== undefined && colIdx !== undefined) {
        matrix[rowIdx][colIdx] = comp.value;
        matrix[colIdx][rowIdx] = roundTo(1 / comp.value, 6);
      }
    }

    return matrix;
  },

  /**
   * Calculate column sums
   * @param {number[][]} matrix
   * @returns {number[]}
   */
  getColumnSums(matrix) {
    const n = matrix.length;
    const sums = Array(n).fill(0);
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        sums[j] += matrix[i][j];
      }
    }
    return sums.map((s) => roundTo(s, 6));
  },

  /**
   * Normalize matrix (divide each element by its column sum)
   * @param {number[][]} matrix
   * @returns {number[][]}
   */
  normalizeMatrix(matrix) {
    const n = matrix.length;
    const colSums = this.getColumnSums(matrix);
    const normalized = Array.from({ length: n }, () => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        normalized[i][j] = colSums[j] !== 0 ? roundTo(matrix[i][j] / colSums[j], 6) : 0;
      }
    }

    return normalized;
  },

  /**
   * Calculate Priority Vector (row averages of normalized matrix)
   * @param {number[][]} normalizedMatrix
   * @returns {number[]}
   */
  calculatePriorityVector(normalizedMatrix) {
    const n = normalizedMatrix.length;
    const priorities = [];

    for (let i = 0; i < n; i++) {
      const rowSum = normalizedMatrix[i].reduce((sum, val) => sum + val, 0);
      priorities.push(roundTo(rowSum / n, 6));
    }

    return priorities;
  },

  /**
   * Calculate Weighted Sum Vector
   * @param {number[][]} matrix - original comparison matrix
   * @param {number[]} priorities - priority vector
   * @returns {number[]}
   */
  calculateWeightedSum(matrix, priorities) {
    const n = matrix.length;
    const weightedSum = Array(n).fill(0);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        weightedSum[i] += matrix[i][j] * priorities[j];
      }
      weightedSum[i] = roundTo(weightedSum[i], 6);
    }

    return weightedSum;
  },

  /**
   * Calculate Lambda Max (maximum eigenvalue)
   * @param {number[][]} matrix - original comparison matrix
   * @param {number[]} priorities - priority vector
   * @returns {number}
   */
  calculateLambdaMax(matrix, priorities) {
    const weightedSum = this.calculateWeightedSum(matrix, priorities);
    const n = priorities.length;
    let lambdaMax = 0;

    for (let i = 0; i < n; i++) {
      if (priorities[i] !== 0) {
        lambdaMax += weightedSum[i] / priorities[i];
      }
    }

    return roundTo(lambdaMax / n, 6);
  },

  /**
   * Calculate Consistency Index
   * CI = (λmax - n) / (n - 1)
   * @param {number} lambdaMax
   * @param {number} n - matrix size
   * @returns {number}
   */
  calculateCI(lambdaMax, n) {
    if (n <= 1) return 0;
    return roundTo((lambdaMax - n) / (n - 1), 6);
  },

  /**
   * Calculate Consistency Ratio
   * CR = CI / RI
   * @param {number} ci - consistency index
   * @param {number} n - matrix size
   * @returns {number}
   */
  calculateCR(ci, n) {
    const ri = RANDOM_INDEX[n] || 0;
    if (ri === 0) return 0;
    return roundTo(ci / ri, 6);
  },

  /**
   * Check if comparison is consistent
   * @param {number} cr - consistency ratio
   * @returns {boolean}
   */
  isConsistent(cr) {
    return cr < CR_THRESHOLD;
  },

  /**
   * Full AHP calculation pipeline
   * @param {Array} comparisons - flat comparison data
   * @param {Array} ids - ordered IDs
   * @returns {Object} complete AHP result
   */
  calculate(comparisons, ids) {
    const n = ids.length;

    // Step 1: Build comparison matrix
    const comparisonMatrix = this.buildComparisonMatrix(comparisons, ids);

    // Step 2: Calculate column sums
    const columnSums = this.getColumnSums(comparisonMatrix);

    // Step 3: Normalize matrix
    const normalizedMatrix = this.normalizeMatrix(comparisonMatrix);

    // Step 4: Calculate priority vector (weights)
    const priorityVector = this.calculatePriorityVector(normalizedMatrix);

    // Step 5: Calculate weighted sum
    const weightedSum = this.calculateWeightedSum(comparisonMatrix, priorityVector);

    // Step 6: Calculate lambda max
    const lambdaMax = this.calculateLambdaMax(comparisonMatrix, priorityVector);

    // Step 7: Calculate CI
    const ci = this.calculateCI(lambdaMax, n);

    // Step 8: Calculate CR
    const cr = this.calculateCR(ci, n);

    // Step 9: Check consistency
    const consistent = this.isConsistent(cr);

    // Build weights object {id: weight}
    const weights = {};
    ids.forEach((id, i) => {
      weights[id] = priorityVector[i];
    });

    return {
      comparison_matrix: comparisonMatrix,
      column_sums: columnSums,
      normalized_matrix: normalizedMatrix,
      priority_vector: priorityVector,
      weighted_sum: weightedSum,
      weights,
      lambda_max: lambdaMax,
      ci,
      cr,
      ri: RANDOM_INDEX[n] || 0,
      is_consistent: consistent,
      n,
    };
  },

  /**
   * Calculate final scores for accreditation (without alternatives)
   * @param {Object} criteriaWeights - {criteriaId: weight}
   * @param {Array} scores - [{criteria_id, score}]
   * @returns {Object}
   */
  calculateFinalScore(criteriaWeights, scores) {
    let finalScore = 0;
    const details = [];

    for (const scoreItem of scores) {
      const weight = criteriaWeights[scoreItem.criteria_id] || 0;
      const weightedScore = roundTo(weight * scoreItem.score, 4);
      finalScore += weightedScore;

      details.push({
        criteria_id: scoreItem.criteria_id,
        weight: roundTo(weight, 4),
        score: scoreItem.score,
        weighted_score: weightedScore,
      });
    }

    return {
      final_score: roundTo(finalScore, 4),
      readiness_percentage: roundTo(finalScore, 2),
      details,
    };
  },

  /**
   * Calculate final scores for alternatives using full 3-level AHP hierarchy
   * Score(A) = Σ_C [ w_C × Σ_SC ( w_SC_local × w_A_SC ) ] × 100
   *
   * @param {Object} criteriaWeights      - { criteriaId: weight }
   * @param {Object} subCriteriaWeights   - { criteriaId: { subCriteriaId: localWeight } }
   * @param {Object} alternativeWeights   - { subCriteriaId: { alternativeId: weight } }
   * @param {Array}  alternativeIds
   * @returns {Array} ranked results
   */
  calculateAlternativeScores(criteriaWeights, subCriteriaWeights, alternativeWeights, alternativeIds) {
    const results = [];

    for (const altId of alternativeIds) {
      let finalScore = 0;
      const details = [];

      for (const [criteriaIdStr, criteriaWeight] of Object.entries(criteriaWeights)) {
        const criteriaId = parseInt(criteriaIdStr);
        const subWeights = subCriteriaWeights[criteriaId] || {};
        let criteriaContribution = 0;

        for (const [scIdStr, scLocalWeight] of Object.entries(subWeights)) {
          const scId = parseInt(scIdStr);
          const altWeight = alternativeWeights[scId]?.[altId] || 0;
          const contribution = roundTo(criteriaWeight * scLocalWeight * altWeight, 6);
          criteriaContribution += contribution;

          details.push({
            criteria_id: criteriaId,
            sub_criteria_id: scId,
            criteria_weight: roundTo(criteriaWeight, 4),
            sub_criteria_local_weight: roundTo(scLocalWeight, 4),
            alternative_weight: roundTo(altWeight, 4),
            contribution: roundTo(contribution, 4),
          });
        }

        finalScore += criteriaContribution;
      }

      results.push({
        alternative_id: altId,
        final_score: roundTo(finalScore, 4),
        readiness_percentage: roundTo(finalScore, 2),
        details,
      });
    }

    // Sort by final score descending
    results.sort((a, b) => b.final_score - a.final_score);

    // Add ranking
    results.forEach((r, i) => {
      r.rank = i + 1;
    });

    return results;
  },
};

module.exports = ahpService;
