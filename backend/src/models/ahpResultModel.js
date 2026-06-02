const pool = require('../config/database');

const ahpResultModel = {
  async save(data) {
    const result = await pool.query(
      `INSERT INTO ahp_results (type, criteria_id, weights, lambda_max, ci, cr, is_consistent, normalized_matrix, comparison_matrix)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        data.type,
        data.criteria_id || null,
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
    const result = await pool.query('SELECT * FROM ahp_results WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async getAll() {
    const result = await pool.query(
      `SELECT ar.*, c.name as criteria_name, c.code as criteria_code
       FROM ahp_results ar
       LEFT JOIN criteria c ON ar.criteria_id = c.id
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

  async getLatestAlternativeResults() {
    const result = await pool.query(
      `SELECT DISTINCT ON (criteria_id) ar.*, c.name as criteria_name, c.code as criteria_code
       FROM ahp_results ar
       JOIN criteria c ON ar.criteria_id = c.id
       WHERE ar.type = 'alternative'
       ORDER BY criteria_id, created_at DESC`
    );
    return result.rows;
  },
};

module.exports = ahpResultModel;
