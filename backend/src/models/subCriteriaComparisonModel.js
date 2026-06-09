const pool = require('../config/database');

const subCriteriaComparisonModel = {
  async getByCriteria(criteriaId) {
    const result = await pool.query(
      `SELECT scc.*, sr.name as row_name, sr.code as row_code, sc.name as col_name, sc.code as col_code
       FROM sub_criteria_comparisons scc
       JOIN sub_criteria sr ON scc.sub_criteria_row_id = sr.id
       JOIN sub_criteria sc ON scc.sub_criteria_col_id = sc.id
       WHERE scc.criteria_id = $1
       ORDER BY scc.sub_criteria_row_id, scc.sub_criteria_col_id`,
      [criteriaId]
    );
    return result.rows;
  },

  async saveBatch(criteriaId, comparisons) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM sub_criteria_comparisons WHERE criteria_id = $1', [criteriaId]);

      for (const comp of comparisons) {
        await client.query(
          `INSERT INTO sub_criteria_comparisons (criteria_id, sub_criteria_row_id, sub_criteria_col_id, value)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (criteria_id, sub_criteria_row_id, sub_criteria_col_id)
           DO UPDATE SET value = $4, updated_at = CURRENT_TIMESTAMP`,
          [criteriaId, comp.sub_criteria_row_id, comp.sub_criteria_col_id, comp.value]
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
    await pool.query('DELETE FROM sub_criteria_comparisons WHERE criteria_id = $1', [criteriaId]);
    return true;
  },

  async getMatrix(criteriaId, subCriteriaIds) {
    const result = await pool.query(
      `SELECT sub_criteria_row_id, sub_criteria_col_id, value
       FROM sub_criteria_comparisons
       WHERE criteria_id = $1
         AND sub_criteria_row_id = ANY($2)
         AND sub_criteria_col_id = ANY($2)
       ORDER BY sub_criteria_row_id, sub_criteria_col_id`,
      [criteriaId, subCriteriaIds]
    );
    return result.rows;
  },
};

module.exports = subCriteriaComparisonModel;
