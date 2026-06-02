const pool = require('../config/database');

const assessmentModel = {
  async getAll() {
    const result = await pool.query(
      `SELECT as2.*, c.name as criteria_name, c.code as criteria_code,
              a.name as alternative_name, a.code as alternative_code
       FROM assessment_scores as2
       JOIN criteria c ON as2.criteria_id = c.id
       LEFT JOIN alternatives a ON as2.alternative_id = a.id
       ORDER BY c.order_index, a.code`
    );
    return result.rows;
  },

  async getByAlternative(alternativeId) {
    const result = await pool.query(
      `SELECT as2.*, c.name as criteria_name, c.code as criteria_code
       FROM assessment_scores as2
       JOIN criteria c ON as2.criteria_id = c.id
       WHERE as2.alternative_id = $1
       ORDER BY c.order_index`,
      [alternativeId]
    );
    return result.rows;
  },

  async getWithoutAlternative() {
    const result = await pool.query(
      `SELECT as2.*, c.name as criteria_name, c.code as criteria_code
       FROM assessment_scores as2
       JOIN criteria c ON as2.criteria_id = c.id
       WHERE as2.alternative_id IS NULL
       ORDER BY c.order_index`
    );
    return result.rows;
  },

  async saveBatch(scores) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const results = [];

      for (const score of scores) {
        const altId = score.alternative_id || null;
        // Use COALESCE trick for unique constraint on nullable column
        const result = await client.query(
          `INSERT INTO assessment_scores (criteria_id, alternative_id, score, notes)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (criteria_id, COALESCE(alternative_id, 0))
           DO UPDATE SET score = $3, notes = $4, updated_at = CURRENT_TIMESTAMP
           RETURNING *`,
          [score.criteria_id, altId, score.score, score.notes || null]
        );
        results.push(result.rows[0]);
      }

      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async deleteAll() {
    await pool.query('DELETE FROM assessment_scores');
    return true;
  },
};

module.exports = assessmentModel;
