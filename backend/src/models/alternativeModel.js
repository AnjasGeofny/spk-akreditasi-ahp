const pool = require('../config/database');

const alternativeModel = {
  async getAll() {
    const result = await pool.query('SELECT * FROM alternatives ORDER BY code ASC');
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query('SELECT * FROM alternatives WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async create({ name, code, description }) {
    const result = await pool.query(
      'INSERT INTO alternatives (name, code, description) VALUES ($1, $2, $3) RETURNING *',
      [name, code, description || null]
    );
    return result.rows[0];
  },

  async update(id, { name, code, description }) {
    const result = await pool.query(
      `UPDATE alternatives SET name = $1, code = $2, description = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING *`,
      [name, code, description || null, id]
    );
    return result.rows[0] || null;
  },

  async delete(id) {
    const result = await pool.query('DELETE FROM alternatives WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  },

  async getCount() {
    const result = await pool.query('SELECT COUNT(*) as count FROM alternatives');
    return parseInt(result.rows[0].count, 10);
  },
};

module.exports = alternativeModel;
