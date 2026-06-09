/**
 * Test accreditation calculation with alternatives
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

function getReadinessStatus(pct) {
  if (pct >= 70) return { label: 'Sangat Siap', color: 'green' };
  if (pct >= 55) return { label: 'Siap', color: 'blue' };
  if (pct >= 40) return { label: 'Cukup Siap', color: 'yellow' };
  return { label: 'Belum Siap', color: 'red' };
}

async function run() {
  const client = await pool.connect();
  try {
    // 1. Criteria weights
    const criteriaRes = await client.query(
      `SELECT weights FROM ahp_results WHERE type = 'criteria' ORDER BY created_at DESC LIMIT 1`
    );
    const criteriaWeights = criteriaRes.rows[0]?.weights;
    if (!criteriaWeights) throw new Error('No criteria AHP result found!');
    console.log('✅ Criteria weights found:', criteriaWeights);

    // 2. Sub-criteria weights (latest per criteria_id)
    const scRes = await client.query(
      `SELECT DISTINCT ON (criteria_id) criteria_id, weights
       FROM ahp_results WHERE type = 'sub_criteria'
       ORDER BY criteria_id, created_at DESC`
    );
    const subCriteriaWeights = {};
    for (const r of scRes.rows) {
      subCriteriaWeights[r.criteria_id] = r.weights;
    }
    console.log(`✅ Sub-criteria weights found for ${scRes.rows.length} criteria`);

    // 3. Alternative weights (latest per sub_criteria_id)
    const altRes = await client.query(
      `SELECT DISTINCT ON (sub_criteria_id) sub_criteria_id, criteria_id, weights
       FROM ahp_results WHERE type = 'alternative'
       ORDER BY sub_criteria_id, created_at DESC`
    );
    const alternativeWeights = {};
    for (const r of altRes.rows) {
      alternativeWeights[r.sub_criteria_id] = r.weights;
    }
    console.log(`✅ Alternative weights found for ${altRes.rows.length} sub-criteria`);

    // 4. Alternatives
    const altListRes = await client.query('SELECT id, name, code FROM alternatives ORDER BY id');
    const alternatives = altListRes.rows;
    const altIds = alternatives.map(a => a.id);
    console.log(`✅ ${alternatives.length} alternatives found`);

    // 5. Calculate scores
    const results = [];
    for (const altId of altIds) {
      let finalScore = 0;
      for (const [cIdStr, cWeight] of Object.entries(criteriaWeights)) {
        const cId = parseInt(cIdStr);
        const subWeights = subCriteriaWeights[cId] || {};
        for (const [scIdStr, scWeight] of Object.entries(subWeights)) {
          const scId = parseInt(scIdStr);
          const altW = alternativeWeights[scId]?.[altId] || 0;
          finalScore += cWeight * scWeight * altW * 100;
        }
      }
      finalScore = roundTo(finalScore, 4);
      const alt = alternatives.find(a => a.id === altId);
      results.push({ altId, name: alt?.name, code: alt?.code, finalScore });
    }

    // Normalize scores to 0-100 scale (same as accreditationService)
    const nAlt = results.length;
    const equalShare = 100 / nAlt;
    results.forEach(r => {
      r.rawScore = r.finalScore;
      r.finalScore = Math.min(100, Math.round((r.finalScore / equalShare) * 50 * 100) / 100);
    });

    // Sort descending
    results.sort((a, b) => b.finalScore - a.finalScore);

    console.log('\n📊 HASIL AKREDITASI (with alternatives) — Normalized 0-100:');
    console.log('Rank | Program Studi                    | Skor    | Status');
    console.log('-----|----------------------------------|---------|------------------');
    results.forEach((r, i) => {
      const status = getReadinessStatus(r.finalScore);
      console.log(`  ${(i + 1).toString().padStart(2)} | ${(r.name || '').padEnd(32)} | ${r.finalScore.toFixed(2).padStart(6)} | ${status.label}`);
    });

    // 6. Clear and save to DB
    await client.query('DELETE FROM accreditation_results');
    const ahpResultId = criteriaRes.rows[0]?.id;
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      const status = getReadinessStatus(r.finalScore);
      await client.query(
        `INSERT INTO accreditation_results (alternative_id, final_score, readiness_percentage, status, detail_scores, ahp_result_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [r.altId, r.finalScore, r.finalScore, status.label, JSON.stringify([]), ahpResultId]
      );
    }
    console.log(`\n✅ Saved ${results.length} accreditation results to DB`);

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
