const pool = require('../config/database');

const pairwiseModel = {
  async getAll() {
    const result = await pool.query(
      `SELECT pc.*, cr.name as row_name, cr.code as row_code, cc.name as col_name, cc.code as col_code
       FROM pairwise_comparisons pc
       JOIN criteria cr ON pc.criteria_row_id = cr.id
       JOIN criteria cc ON pc.criteria_col_id = cc.id
       ORDER BY pc.criteria_row_id, pc.criteria_col_id`
    );
    return result.rows;
  },

  async saveBatch(comparisons) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Clear existing comparisons
      await client.query('DELETE FROM pairwise_comparisons');

      for (const comp of comparisons) {
        await client.query(
          `INSERT INTO pairwise_comparisons (criteria_row_id, criteria_col_id, value)
           VALUES ($1, $2, $3)
           ON CONFLICT (criteria_row_id, criteria_col_id)
           DO UPDATE SET value = $3, updated_at = CURRENT_TIMESTAMP`,
          [comp.criteria_row_id, comp.criteria_col_id, comp.value]
        );
      }
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async deleteAll() {
    await pool.query('DELETE FROM pairwise_comparisons');
    return true;
  },

  async getMatrix(criteriaIds) {
    const result = await pool.query(
      `SELECT criteria_row_id, criteria_col_id, value
       FROM pairwise_comparisons
       WHERE criteria_row_id = ANY($1) AND criteria_col_id = ANY($1)
       ORDER BY criteria_row_id, criteria_col_id`,
      [criteriaIds]
    );
    return result.rows;
  },
};

module.exports = pairwiseModel;
