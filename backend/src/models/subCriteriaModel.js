const pool = require('../config/database');

const subCriteriaModel = {
  async getAll(criteriaId = null) {
    const params = [];
    let where = '';

    if (criteriaId) {
      params.push(criteriaId);
      where = 'WHERE sc.criteria_id = $1';
    }

    const result = await pool.query(
      `SELECT sc.*, c.name as criteria_name, c.code as criteria_code
       FROM sub_criteria sc
       JOIN criteria c ON sc.criteria_id = c.id
       ${where}
       ORDER BY c.order_index ASC, sc.order_index ASC, sc.id ASC`,
      params
    );
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query(
      `SELECT sc.*, c.name as criteria_name, c.code as criteria_code
       FROM sub_criteria sc
       JOIN criteria c ON sc.criteria_id = c.id
       WHERE sc.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async create({ criteria_id, name, code, description, order_index }) {
    const result = await pool.query(
      `INSERT INTO sub_criteria (criteria_id, name, code, description, order_index)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [criteria_id, name, code, description || null, order_index || 0]
    );
    return result.rows[0];
  },

  async update(id, { criteria_id, name, code, description, order_index }) {
    const result = await pool.query(
      `UPDATE sub_criteria
       SET criteria_id = $1, name = $2, code = $3, description = $4, order_index = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 RETURNING *`,
      [criteria_id, name, code, description || null, order_index || 0, id]
    );
    return result.rows[0] || null;
  },

  async delete(id) {
    const result = await pool.query('DELETE FROM sub_criteria WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  },
};

module.exports = subCriteriaModel;
