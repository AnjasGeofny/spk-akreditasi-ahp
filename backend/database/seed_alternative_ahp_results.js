/**
 * Script to calculate and seed AHP alternative results for all 21 sub-criteria
 * Run: node backend/database/seed_alternative_ahp_results.js
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:zASHWDMpsWRhHQRBYYJaQtFapvXdVhQN@zephyr.proxy.rlwy.net:47444/railway',
  ssl: { rejectUnauthorized: false },
});

const RANDOM_INDEX = { 1: 0, 2: 0, 3: 0.58, 4: 0.9, 5: 1.12, 6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49, 11: 1.51, 12: 1.53, 13: 1.56, 14: 1.57, 15: 1.59 };

function roundTo(val, dec) {
  return Math.round(val * Math.pow(10, dec)) / Math.pow(10, dec);
}

function ahpCalculate(matrix, ids) {
  const n = ids.length;
  const colSums = Array(n).fill(0);
  for (let j = 0; j < n; j++)
    for (let i = 0; i < n; i++)
      colSums[j] += matrix[i][j];

  const norm = matrix.map(row => row.map((v, j) => colSums[j] ? v / colSums[j] : 0));
  const pv = norm.map(row => row.reduce((s, v) => s + v, 0) / n);

  const ws = Array(n).fill(0);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      ws[i] += matrix[i][j] * pv[j];

  let lambdaMax = 0;
  for (let i = 0; i < n; i++) if (pv[i]) lambdaMax += ws[i] / pv[i];
  lambdaMax /= n;

  const ci = n <= 1 ? 0 : (lambdaMax - n) / (n - 1);
  const ri = RANDOM_INDEX[n] || 0;
  const cr = ri === 0 ? 0 : ci / ri;

  const weights = {};
  ids.forEach((id, i) => { weights[id] = roundTo(pv[i], 6); });

  return { weights, lambda_max: lambdaMax, ci, cr, is_consistent: cr < 0.1, normalized_matrix: norm, comparison_matrix: matrix };
}

function buildMatrix(ids, comparisons) {
  const n = ids.length;
  const idx = {};
  ids.forEach((id, i) => idx[id] = i);
  const mat = Array.from({ length: n }, () => Array(n).fill(1));
  for (const c of comparisons) {
    const r = idx[c.alternative_row_id], cl = idx[c.alternative_col_id];
    if (r !== undefined && cl !== undefined) {
      mat[r][cl] = parseFloat(c.value);
      mat[cl][r] = roundTo(1 / parseFloat(c.value), 6);
    }
  }
  return mat;
}

async function run() {
  const client = await pool.connect();
  try {
    // Get all sub-criteria
    const scResult = await client.query(
      `SELECT sc.id as sc_id, sc.name as sc_name, sc.code as sc_code, sc.criteria_id
       FROM sub_criteria sc
       ORDER BY sc.criteria_id, sc.order_index, sc.id`
    );
    const allSubCriteria = scResult.rows;

    // Get all alternatives
    const altResult = await client.query('SELECT id FROM alternatives ORDER BY id');
    const altIds = altResult.rows.map(r => r.id);
    console.log(`Found ${allSubCriteria.length} sub-criteria, ${altIds.length} alternatives`);

    // Delete existing alternative AHP results
    await client.query(`DELETE FROM ahp_results WHERE type = 'alternative'`);
    console.log('Cleared old alternative AHP results.');

    let successCount = 0;
    let failCount = 0;

    for (const sc of allSubCriteria) {
      const compResult = await client.query(
        `SELECT alternative_row_id, alternative_col_id, value
         FROM alternative_comparisons
         WHERE sub_criteria_id = $1
         AND alternative_row_id = ANY($2) AND alternative_col_id = ANY($2)
         ORDER BY alternative_row_id, alternative_col_id`,
        [sc.sc_id, altIds]
      );
      const comparisons = compResult.rows;

      if (comparisons.length === 0) {
        console.log(`⚠️  No comparison data for ${sc.sc_code} — skip`);
        failCount++;
        continue;
      }

      const matrix = buildMatrix(altIds, comparisons);
      const result = ahpCalculate(matrix, altIds);

      await client.query(
        `INSERT INTO ahp_results (type, criteria_id, sub_criteria_id, weights, lambda_max, ci, cr, is_consistent, normalized_matrix, comparison_matrix)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        ['alternative', sc.criteria_id, sc.sc_id,
         JSON.stringify(result.weights), result.lambda_max, result.ci, result.cr, result.is_consistent,
         JSON.stringify(result.normalized_matrix), JSON.stringify(result.comparison_matrix)]
      );

      const status = result.is_consistent ? '✅' : '⚠️ INCONSISTENT';
      console.log(`${status} ${sc.sc_code} (${sc.sc_name}) — CR: ${result.cr.toFixed(4)}`);
      successCount++;
    }

    console.log(`\n✅ Done: ${successCount} saved, ${failCount} skipped`);
  } catch (err) {
    console.error('Error:', err.message);
    console.error(err.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
