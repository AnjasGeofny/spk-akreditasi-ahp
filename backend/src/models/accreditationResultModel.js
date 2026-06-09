const pool = require('../config/database');

const accreditationResultModel = {
  async save(data) {
    const result = await pool.query(
      `INSERT INTO accreditation_results (alternative_id, final_score, readiness_percentage, status, detail_scores, ahp_result_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        data.alternative_id || null,
        data.final_score,
        data.readiness_percentage,
        data.status,
        JSON.stringify(data.detail_scores),
        data.ahp_result_id || null,
      ]
    );
    return result.rows[0];
  },

  async getLatest() {
    const result = await pool.query(
      `SELECT ar.*, a.name as alternative_name, a.code as alternative_code
       FROM accreditation_results ar
       LEFT JOIN alternatives a ON ar.alternative_id = a.id
       ORDER BY ar.created_at DESC`
    );
    return result.rows;
  },

  async getLatestGrouped() {
    // Get the latest batch (by created_at) — use a 10-second window to catch
    // all rows inserted in the same batch (they may differ by a few ms)
    const latestTime = await pool.query(
      'SELECT created_at FROM accreditation_results ORDER BY created_at DESC LIMIT 1'
    );
    if (latestTime.rows.length === 0) return [];

    const result = await pool.query(
      `SELECT ar.*, a.name as alternative_name, a.code as alternative_code
       FROM accreditation_results ar
       LEFT JOIN alternatives a ON ar.alternative_id = a.id
       WHERE ar.created_at >= ($1::timestamptz - INTERVAL '10 seconds')
       ORDER BY ar.final_score DESC`,
      [latestTime.rows[0].created_at]
    );
    return result.rows;
  },

  async getAll() {
    const result = await pool.query(
      `SELECT ar.*, a.name as alternative_name, a.code as alternative_code
       FROM accreditation_results ar
       LEFT JOIN alternatives a ON ar.alternative_id = a.id
       ORDER BY ar.created_at DESC, ar.final_score DESC`
    );
    return result.rows;
  },

  async deleteAll() {
    await pool.query('DELETE FROM accreditation_results');
    return true;
  },
};

module.exports = accreditationResultModel;
