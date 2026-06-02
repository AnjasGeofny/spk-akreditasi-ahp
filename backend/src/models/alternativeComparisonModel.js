const pool = require('../config/database');

const alternativeComparisonModel = {
  async getByCriteria(criteriaId) {
    const result = await pool.query(
      `SELECT ac.*, ar.name as row_name, ar.code as row_code, ac2.name as col_name, ac2.code as col_code
       FROM alternative_comparisons ac
       JOIN alternatives ar ON ac.alternative_row_id = ar.id
       JOIN alternatives ac2 ON ac.alternative_col_id = ac2.id
       WHERE ac.criteria_id = $1
       ORDER BY ac.alternative_row_id, ac.alternative_col_id`,
      [criteriaId]
    );
    return result.rows;
  },

  async saveBatch(criteriaId, comparisons) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Clear existing comparisons for this criteria
      await client.query('DELETE FROM alternative_comparisons WHERE criteria_id = $1', [criteriaId]);

      for (const comp of comparisons) {
        await client.query(
          `INSERT INTO alternative_comparisons (criteria_id, alternative_row_id, alternative_col_id, value)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (criteria_id, alternative_row_id, alternative_col_id)
           DO UPDATE SET value = $4, updated_at = CURRENT_TIMESTAMP`,
          [criteriaId, comp.alternative_row_id, comp.alternative_col_id, comp.value]
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

  async deleteByCriteria(criteriaId) {
    await pool.query('DELETE FROM alternative_comparisons WHERE criteria_id = $1', [criteriaId]);
    return true;
  },

  async getMatrix(criteriaId, alternativeIds) {
    const result = await pool.query(
      `SELECT alternative_row_id, alternative_col_id, value
       FROM alternative_comparisons
       WHERE criteria_id = $1 AND alternative_row_id = ANY($2) AND alternative_col_id = ANY($2)
       ORDER BY alternative_row_id, alternative_col_id`,
      [criteriaId, alternativeIds]
    );
    return result.rows;
  },

  async getAllGrouped() {
    const result = await pool.query(
      `SELECT ac.criteria_id, c.name as criteria_name, c.code as criteria_code,
              ac.alternative_row_id, ac.alternative_col_id, ac.value
       FROM alternative_comparisons ac
       JOIN criteria c ON ac.criteria_id = c.id
       ORDER BY ac.criteria_id, ac.alternative_row_id, ac.alternative_col_id`
    );
    return result.rows;
  },
};

module.exports = alternativeComparisonModel;
