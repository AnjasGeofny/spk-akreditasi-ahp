/**
 * Script to calculate and seed AHP sub-criteria results for C2, C3, C4, C5
 * Run: node backend/database/seed_subcriteria_ahp_results.js
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:zASHWDMpsWRhHQRBYYJaQtFapvXdVhQN@zephyr.proxy.rlwy.net:47444/railway',
  ssl: { rejectUnauthorized: false },
});

const RANDOM_INDEX = { 1: 0, 2: 0, 3: 0.58, 4: 0.9, 5: 1.12, 6: 1.24, 7: 1.32 };

function roundTo(val, dec) {
  return Math.round(val * Math.pow(10, dec)) / Math.pow(10, dec);
}

function ahpCalculate(matrix, ids) {
  const n = ids.length;

  // Column sums
  const colSums = Array(n).fill(0);
  for (let j = 0; j < n; j++)
    for (let i = 0; i < n; i++)
      colSums[j] += matrix[i][j];

  // Normalize
  const norm = matrix.map((row, i) => row.map((v, j) => v / colSums[j]));

  // Priority vector (row averages)
  const pv = norm.map(row => row.reduce((s, v) => s + v, 0) / n);

  // Weighted sum
  const ws = Array(n).fill(0);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      ws[i] += matrix[i][j] * pv[j];

  // Lambda max
  let lambdaMax = 0;
  for (let i = 0; i < n; i++) lambdaMax += ws[i] / pv[i];
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
    const r = idx[c.row], cl = idx[c.col];
    if (r !== undefined && cl !== undefined) {
      mat[r][cl] = c.value;
      mat[cl][r] = roundTo(1 / c.value, 6);
    }
  }
  return mat;
}

async function run() {
  const client = await pool.connect();
  try {
    // C2: ids [4,5,6,7], upper-triangle pairs from DB
    const c2_ids = [4, 5, 6, 7];
    const c2_comps = [
      { row: 4, col: 5, value: 1 },
      { row: 4, col: 6, value: 1 },
      { row: 4, col: 7, value: 2 },
      { row: 5, col: 6, value: 1 },
      { row: 5, col: 7, value: 2 },
      { row: 6, col: 7, value: 1 },
    ];
    const c2_mat = buildMatrix(c2_ids, c2_comps);
    const c2_res = ahpCalculate(c2_mat, c2_ids);
    console.log('C2 weights:', c2_res.weights, 'CR:', c2_res.cr, 'consistent:', c2_res.is_consistent);

    await client.query(
      `INSERT INTO ahp_results (type, criteria_id, sub_criteria_id, weights, lambda_max, ci, cr, is_consistent, normalized_matrix, comparison_matrix)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      ['sub_criteria', 2, null, JSON.stringify(c2_res.weights), c2_res.lambda_max, c2_res.ci, c2_res.cr, c2_res.is_consistent,
       JSON.stringify(c2_res.normalized_matrix), JSON.stringify(c2_res.comparison_matrix)]
    );
    console.log('C2 AHP result saved.');

    // C3: ids [8,9,10,11,12], upper-triangle pairs from DB
    const c3_ids = [8, 9, 10, 11, 12];
    const c3_comps = [
      { row: 8, col: 9,  value: 2 },
      { row: 8, col: 10, value: 3 },
      { row: 8, col: 11, value: 3 },
      { row: 8, col: 12, value: 3 },
      { row: 9, col: 10, value: 2 },
      { row: 9, col: 11, value: 2 },
      { row: 9, col: 12, value: 3 },
      { row: 10, col: 11, value: 1 },
      { row: 10, col: 12, value: 2 },
      { row: 11, col: 12, value: 2 },
    ];
    const c3_mat = buildMatrix(c3_ids, c3_comps);
    const c3_res = ahpCalculate(c3_mat, c3_ids);
    console.log('C3 weights:', c3_res.weights, 'CR:', c3_res.cr, 'consistent:', c3_res.is_consistent);

    await client.query(
      `INSERT INTO ahp_results (type, criteria_id, sub_criteria_id, weights, lambda_max, ci, cr, is_consistent, normalized_matrix, comparison_matrix)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      ['sub_criteria', 3, null, JSON.stringify(c3_res.weights), c3_res.lambda_max, c3_res.ci, c3_res.cr, c3_res.is_consistent,
       JSON.stringify(c3_res.normalized_matrix), JSON.stringify(c3_res.comparison_matrix)]
    );
    console.log('C3 AHP result saved.');

    // C4: ids [13,14,15,16], upper-triangle pairs from DB
    const c4_ids = [13, 14, 15, 16];
    const c4_comps = [
      { row: 13, col: 14, value: 2 },
      { row: 13, col: 15, value: 4 },
      { row: 13, col: 16, value: 9 },
      { row: 14, col: 15, value: 2 },
      { row: 14, col: 16, value: 8 },
      { row: 15, col: 16, value: 7 },
    ];
    const c4_mat = buildMatrix(c4_ids, c4_comps);
    const c4_res = ahpCalculate(c4_mat, c4_ids);
    console.log('C4 weights:', c4_res.weights, 'CR:', c4_res.cr, 'consistent:', c4_res.is_consistent);

    await client.query(
      `INSERT INTO ahp_results (type, criteria_id, sub_criteria_id, weights, lambda_max, ci, cr, is_consistent, normalized_matrix, comparison_matrix)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      ['sub_criteria', 4, null, JSON.stringify(c4_res.weights), c4_res.lambda_max, c4_res.ci, c4_res.cr, c4_res.is_consistent,
       JSON.stringify(c4_res.normalized_matrix), JSON.stringify(c4_res.comparison_matrix)]
    );
    console.log('C4 AHP result saved.');

    // C5: ids [17,18,19,20,21], upper-triangle pairs from DB
    const c5_ids = [17, 18, 19, 20, 21];
    const c5_comps = [
      { row: 17, col: 18, value: 2 },
      { row: 17, col: 19, value: 2 },
      { row: 17, col: 20, value: 2 },
      { row: 17, col: 21, value: 2 },
      { row: 18, col: 19, value: 2 },
      { row: 18, col: 20, value: 2 },
      { row: 18, col: 21, value: 2 },
      { row: 19, col: 20, value: 1 },
      { row: 19, col: 21, value: 1 },
      { row: 20, col: 21, value: 1 },
    ];
    const c5_mat = buildMatrix(c5_ids, c5_comps);
    const c5_res = ahpCalculate(c5_mat, c5_ids);
    console.log('C5 weights:', c5_res.weights, 'CR:', c5_res.cr, 'consistent:', c5_res.is_consistent);

    await client.query(
      `INSERT INTO ahp_results (type, criteria_id, sub_criteria_id, weights, lambda_max, ci, cr, is_consistent, normalized_matrix, comparison_matrix)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      ['sub_criteria', 5, null, JSON.stringify(c5_res.weights), c5_res.lambda_max, c5_res.ci, c5_res.cr, c5_res.is_consistent,
       JSON.stringify(c5_res.normalized_matrix), JSON.stringify(c5_res.comparison_matrix)]
    );
    console.log('C5 AHP result saved.');

    console.log('\n✅ All sub-criteria AHP results seeded successfully!');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
