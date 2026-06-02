const pool = require('../config/database');

const criteriaModel = {
  async getAll() {
    const result = await pool.query('SELECT * FROM criteria ORDER BY order_index ASC');
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query('SELECT * FROM criteria WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async create({ name, code, description, order_index }) {
    const result = await pool.query(
      'INSERT INTO criteria (name, code, description, order_index) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, code, description || null, order_index || 0]
    );
    return result.rows[0];
  },

  async update(id, { name, code, description, order_index }) {
    const result = await pool.query(
      `UPDATE criteria SET name = $1, code = $2, description = $3, order_index = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 RETURNING *`,
      [name, code, description || null, order_index || 0, id]
    );
    return result.rows[0] || null;
  },

  async delete(id) {
    const result = await pool.query('DELETE FROM criteria WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  },

  async getCount() {
    const result = await pool.query('SELECT COUNT(*) as count FROM criteria');
    return parseInt(result.rows[0].count, 10);
  },
};

module.exports = criteriaModel;
