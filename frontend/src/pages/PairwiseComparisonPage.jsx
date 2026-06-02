import { useState, useEffect } from 'react';
import { criteriaApi, pairwiseApi, ahpApi } from '../services/api';
import { useApp } from '../context/AppContext';
import { SAATY_SCALE } from '../utils/constants';
import Loading from '../components/ui/Loading';

export default function PairwiseComparisonPage() {
  const { showNotification } = useApp();
  const [criteria, setCriteria] = useState([]);
  const [matrix, setMatrix] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [ahpResult, setAhpResult] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [critRes, compRes] = await Promise.all([
        criteriaApi.getAll(),
        pairwiseApi.getAll(),
      ]);
      const crits = critRes.data;
      setCriteria(crits);
      initializeMatrix(crits, compRes.data);
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const initializeMatrix = (crits, comparisons) => {
    const n = crits.length;
    const mat = Array.from({ length: n }, () => Array(n).fill(1));

    // Fill from existing comparisons
    const idIndex = {};
    crits.forEach((c, i) => (idIndex[c.id] = i));

    comparisons.forEach((comp) => {
      const ri = idIndex[comp.criteria_row_id];
      const ci = idIndex[comp.criteria_col_id];
      if (ri !== undefined && ci !== undefined) {
        mat[ri][ci] = comp.value;
        mat[ci][ri] = parseFloat((1 / comp.value).toFixed(4));
      }
    });

    setMatrix(mat);
  };

  const handleCellChange = (row, col, value) => {
    const val = parseFloat(value);
    if (isNaN(val) || val <= 0) return;

    const newMatrix = matrix.map((r) => [...r]);
    newMatrix[row][col] = val;
    newMatrix[col][row] = parseFloat((1 / val).toFixed(4));
    setMatrix(newMatrix);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const comparisons = [];
      const n = criteria.length;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          comparisons.push({
            criteria_row_id: criteria[i].id,
            criteria_col_id: criteria[j].id,
            value: matrix[i][j],
          });
        }
      }
      await pairwiseApi.save(comparisons);
      showNotification('Matriks perbandingan berhasil disimpan');
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCalculate = async () => {
    setCalculating(true);
    try {
      // Save first
      await handleSave();
      const res = await ahpApi.calculateCriteria();
      setAhpResult(res.data);
      showNotification('Perhitungan AHP berhasil');
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setCalculating(false);
    }
  };

  if (loading) return <Loading />;

  const n = criteria.length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Perbandingan Berpasangan Kriteria</h1>
          <p className="text-dark-400 mt-1">Matriks perbandingan berpasangan antar kriteria menggunakan skala Saaty 1-9</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSave} disabled={saving} className="btn-secondary" id="save-pairwise">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button onClick={handleCalculate} disabled={calculating} className="btn-primary" id="calculate-ahp">
            {calculating ? 'Menghitung...' : 'Hitung AHP'}
          </button>
        </div>
      </div>

      {/* Saaty Scale Reference */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold text-dark-300 mb-2">Skala Saaty</h3>
        <div className="flex flex-wrap gap-2">
          {SAATY_SCALE.map((s) => (
            <span key={s.value} className="px-2 py-1 rounded-lg bg-dark-800 text-xs text-dark-300">
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Comparison Matrix */}
      {n < 2 ? (
        <div className="glass-card p-8 text-center text-dark-400">
          <p>Minimal 2 kriteria diperlukan. Silakan tambahkan kriteria terlebih dahulu.</p>
        </div>
      ) : (
        <div className="glass-card p-6 overflow-x-auto">
          <h3 className="text-lg font-semibold text-white mb-4">Matriks Perbandingan</h3>
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-sm text-dark-300 font-semibold">Kriteria</th>
                {criteria.map((c) => (
                  <th key={c.id} className="px-3 py-2 text-center text-sm text-dark-300 font-semibold min-w-[80px]">
                    {c.code}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {criteria.map((rowCrit, i) => (
                <tr key={rowCrit.id} className="border-t border-dark-700/30">
                  <td className="px-3 py-2 text-sm font-medium text-white whitespace-nowrap">
                    {rowCrit.code} - {rowCrit.name}
                  </td>
                  {criteria.map((colCrit, j) => (
                    <td key={colCrit.id} className="px-2 py-2 text-center">
                      {i === j ? (
                        <span className="text-dark-500 text-sm">1</span>
                      ) : i < j ? (
                        <select
                          value={matrix[i]?.[j] || 1}
                          onChange={(e) => handleCellChange(i, j, e.target.value)}
                          className="w-20 px-2 py-1.5 bg-dark-900 border border-dark-600 rounded-lg text-sm text-white text-center focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                        >
                          {SAATY_SCALE.map((s) => (
                            <option key={s.value} value={s.value}>{s.value}</option>
                          ))}
                          {SAATY_SCALE.filter(s => s.value > 1).map((s) => (
                            <option key={`1/${s.value}`} value={(1 / s.value).toFixed(4)}>1/{s.value}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-dark-400 text-sm">{matrix[i]?.[j]?.toFixed(4)}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* AHP Results */}
      {ahpResult && (
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Hasil Perhitungan AHP</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-3 rounded-xl bg-dark-800/50">
                <p className="text-xs text-dark-400">Lambda Max (λmax)</p>
                <p className="text-lg font-bold text-white">{ahpResult.lambda_max?.toFixed(4)}</p>
              </div>
              <div className="p-3 rounded-xl bg-dark-800/50">
                <p className="text-xs text-dark-400">Consistency Index (CI)</p>
                <p className="text-lg font-bold text-white">{ahpResult.ci?.toFixed(4)}</p>
              </div>
              <div className="p-3 rounded-xl bg-dark-800/50">
                <p className="text-xs text-dark-400">Random Index (RI)</p>
                <p className="text-lg font-bold text-white">{ahpResult.ri?.toFixed(4)}</p>
              </div>
              <div className="p-3 rounded-xl bg-dark-800/50">
                <p className="text-xs text-dark-400">Consistency Ratio (CR)</p>
                <p className={`text-lg font-bold ${ahpResult.is_consistent ? 'text-emerald-400' : 'text-red-400'}`}>
                  {ahpResult.cr?.toFixed(4)}
                </p>
              </div>
            </div>

            <div className={`p-3 rounded-xl border ${ahpResult.is_consistent ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              <p className="font-semibold">{ahpResult.is_consistent ? '✓ Konsisten (CR < 0.1)' : '✗ Tidak Konsisten (CR ≥ 0.1)'}</p>
            </div>
          </div>

          {/* Priority Vector */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Bobot Kriteria (Priority Vector)</h3>
            <div className="table-container">
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="px-5 py-3 text-left">Kriteria</th>
                    <th className="px-5 py-3 text-center">Bobot</th>
                    <th className="px-5 py-3 text-center">Persentase</th>
                  </tr>
                </thead>
                <tbody>
                  {ahpResult.criteria_names?.map((c, i) => (
                    <tr key={c.id} className="table-row">
                      <td className="px-5 py-3 text-white">{c.code} - {c.name}</td>
                      <td className="px-5 py-3 text-center text-dark-200">{ahpResult.priority_vector?.[i]?.toFixed(4)}</td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-24 h-2 bg-dark-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full" style={{ width: `${(ahpResult.priority_vector?.[i] || 0) * 100}%` }} />
                          </div>
                          <span className="text-sm text-dark-300">{((ahpResult.priority_vector?.[i] || 0) * 100).toFixed(2)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Normalized Matrix */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Matriks Ternormalisasi</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-sm text-dark-300">Kriteria</th>
                    {criteria.map((c) => (
                      <th key={c.id} className="px-3 py-2 text-center text-sm text-dark-300">{c.code}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ahpResult.normalized_matrix?.map((row, i) => (
                    <tr key={i} className="border-t border-dark-700/30">
                      <td className="px-3 py-2 text-sm text-white">{criteria[i]?.code}</td>
                      {row.map((val, j) => (
                        <td key={j} className="px-3 py-2 text-center text-sm text-dark-300">{val.toFixed(4)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
