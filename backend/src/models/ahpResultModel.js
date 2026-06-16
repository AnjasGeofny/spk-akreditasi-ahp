const pool = require('../config/database');

const ahpResultModel = {
  /**
   * Save AHP result — upsert: replaces existing result for the same
   * (type, criteria_id, sub_criteria_id) combination so there are no duplicates.
   */
  async save(data) {
    const criteriaId = data.criteria_id || null;
    const subCriteriaId = data.sub_criteria_id || null;

    // Delete previous result for this exact combination
    if (subCriteriaId) {
      await pool.query(
        `DELETE FROM ahp_results WHERE type = $1 AND sub_criteria_id = $2`,
        [data.type, subCriteriaId]
      );
    } else if (criteriaId) {
      await pool.query(
        `DELETE FROM ahp_results WHERE type = $1 AND criteria_id = $2 AND sub_criteria_id IS NULL`,
        [data.type, criteriaId]
      );
    } else {
      await pool.query(
        `DELETE FROM ahp_results WHERE type = $1 AND criteria_id IS NULL AND sub_criteria_id IS NULL`,
        [data.type]
      );
    }

    const result = await pool.query(
      `INSERT INTO ahp_results (type, criteria_id, sub_criteria_id, weights, lambda_max, ci, cr, is_consistent, normalized_matrix, comparison_matrix)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        data.type,
        criteriaId,
        subCriteriaId,
        JSON.stringify(data.weights),
        data.lambda_max,
        data.ci,
        data.cr,
        data.is_consistent,
        JSON.stringify(data.normalized_matrix),
        JSON.stringify(data.comparison_matrix),
      ]
    );
    return result.rows[0];
  },

  async getLatest(type, criteriaId = null) {
    let query = 'SELECT * FROM ahp_results WHERE type = $1';
    const params = [type];

    if (criteriaId) {
      query += ' AND criteria_id = $2';
      params.push(criteriaId);
    } else if (type === 'criteria') {
      query += ' AND criteria_id IS NULL';
    }

    query += ' ORDER BY created_at DESC LIMIT 1';
    const result = await pool.query(query, params);
    return result.rows[0] || null;
  },

  async getById(id) {
    const result = await pool.query(
      `SELECT ar.*,
              c.name as criteria_name, c.code as criteria_code,
              sc.name as sub_criteria_name, sc.code as sub_criteria_code
       FROM ahp_results ar
       LEFT JOIN criteria c ON ar.criteria_id = c.id
       LEFT JOIN sub_criteria sc ON ar.sub_criteria_id = sc.id
       WHERE ar.id = $1`,
      [id]
    );
    const row = result.rows[0] || null;
    if (!row) return null;

    // Resolve weight keys (IDs) to readable names
    const weightIds = Object.keys(row.weights || {}).map(Number);
    let weightNames = {};

    if (weightIds.length > 0) {
      const placeholders = weightIds.map((_, i) => `$${i + 1}`).join(',');

      if (row.type === 'criteria') {
        const names = await pool.query(
          `SELECT id, name, code FROM criteria WHERE id IN (${placeholders}) ORDER BY order_index ASC`,
          weightIds
        );
        names.rows.forEach((r) => { weightNames[r.id] = { name: r.name, code: r.code }; });
      } else if (row.type === 'sub_criteria') {
        const names = await pool.query(
          `SELECT id, name, code FROM sub_criteria WHERE id IN (${placeholders}) ORDER BY order_index ASC, id ASC`,
          weightIds
        );
        names.rows.forEach((r) => { weightNames[r.id] = { name: r.name, code: r.code }; });
      } else if (row.type === 'alternative') {
        const names = await pool.query(
          `SELECT id, name, code FROM alternatives WHERE id IN (${placeholders}) ORDER BY CAST(SUBSTRING(code FROM 2) AS INTEGER) ASC`,
          weightIds
        );
        names.rows.forEach((r) => { weightNames[r.id] = { name: r.name, code: r.code }; });
      }
    }

    row.weight_names = weightNames;
    return row;
  },

  async getAll() {
    const result = await pool.query(
      `SELECT ar.*,
              c.name as criteria_name, c.code as criteria_code,
              sc.name as sub_criteria_name, sc.code as sub_criteria_code
       FROM ahp_results ar
       LEFT JOIN criteria c ON ar.criteria_id = c.id
       LEFT JOIN sub_criteria sc ON ar.sub_criteria_id = sc.id
       ORDER BY ar.created_at DESC`
    );
    return result.rows;
  },

  async getLatestCriteriaResult() {
    const result = await pool.query(
      `SELECT * FROM ahp_results WHERE type = 'criteria' ORDER BY created_at DESC LIMIT 1`
    );
    return result.rows[0] || null;
  },

  async getLatestSubCriteriaResults() {
    // Get latest AHP result per criteria (for sub-criteria weights)
    const result = await pool.query(
      `SELECT DISTINCT ON (criteria_id) ar.*, c.name as criteria_name, c.code as criteria_code
       FROM ahp_results ar
       JOIN criteria c ON ar.criteria_id = c.id
       WHERE ar.type = 'sub_criteria'
       ORDER BY criteria_id, created_at DESC`
    );
    return result.rows;
  },

  async getLatestAlternativeResults() {
    // Get latest AHP result per sub_criteria (for alternative weights)
    const result = await pool.query(
      `SELECT DISTINCT ON (ar.sub_criteria_id) ar.*,
              c.name as criteria_name, c.code as criteria_code,
              sc.name as sub_criteria_name, sc.code as sub_criteria_code
       FROM ahp_results ar
       JOIN sub_criteria sc ON ar.sub_criteria_id = sc.id
       JOIN criteria c ON sc.criteria_id = c.id
       WHERE ar.type = 'alternative'
       ORDER BY ar.sub_criteria_id, ar.created_at DESC`
    );
    return result.rows;
  },
};

module.exports = ahpResultModel;
