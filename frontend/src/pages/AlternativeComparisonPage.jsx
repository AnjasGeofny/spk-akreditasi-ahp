import { useState, useEffect } from 'react';
import { criteriaApi, alternativesApi, altComparisonApi, ahpApi } from '../services/api';
import { useApp } from '../context/AppContext';
import { SAATY_SCALE } from '../utils/constants';
import Loading from '../components/ui/Loading';

export default function AlternativeComparisonPage() {
  const { showNotification } = useApp();
  const [criteria, setCriteria] = useState([]);
  const [alternatives, setAlternatives] = useState([]);
  const [selectedCriteria, setSelectedCriteria] = useState(null);
  const [matrix, setMatrix] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [ahpResults, setAhpResults] = useState(null);

  useEffect(() => { loadInitialData(); }, []);

  const loadInitialData = async () => {
    try {
      const [critRes, altRes] = await Promise.all([criteriaApi.getAll(), alternativesApi.getAll()]);
      setCriteria(critRes.data);
      setAlternatives(altRes.data);
      if (critRes.data.length > 0) {
        setSelectedCriteria(critRes.data[0]);
        await loadComparisons(critRes.data[0].id, altRes.data);
      }
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadComparisons = async (criteriaId, alts) => {
    const altList = alts || alternatives;
    try {
      const res = await altComparisonApi.getByCriteria(criteriaId);
      initializeMatrix(altList, res.data);
    } catch {
      initializeMatrix(altList, []);
    }
  };

  const initializeMatrix = (alts, comparisons) => {
    const n = alts.length;
    const mat = Array.from({ length: n }, () => Array(n).fill(1));
    const idIndex = {};
    alts.forEach((a, i) => (idIndex[a.id] = i));

    comparisons.forEach((comp) => {
      const ri = idIndex[comp.alternative_row_id];
      const ci = idIndex[comp.alternative_col_id];
      if (ri !== undefined && ci !== undefined) {
        mat[ri][ci] = comp.value;
        mat[ci][ri] = parseFloat((1 / comp.value).toFixed(4));
      }
    });
    setMatrix(mat);
  };

  const handleCriteriaChange = async (criteriaId) => {
    const crit = criteria.find((c) => c.id === parseInt(criteriaId));
    setSelectedCriteria(crit);
    await loadComparisons(crit.id);
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
    if (!selectedCriteria) return;
    setSaving(true);
    try {
      const comparisons = [];
      const n = alternatives.length;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          comparisons.push({
            alternative_row_id: alternatives[i].id,
            alternative_col_id: alternatives[j].id,
            value: matrix[i][j],
          });
        }
      }
      await altComparisonApi.save(selectedCriteria.id, comparisons);
      showNotification(`Perbandingan untuk "${selectedCriteria.name}" berhasil disimpan`);
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCalculateAll = async () => {
    setCalculating(true);
    try {
      const res = await ahpApi.calculateAlternatives();
      setAhpResults(res.data);
      showNotification('Perhitungan AHP alternatif berhasil');
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setCalculating(false);
    }
  };

  if (loading) return <Loading />;

  const n = alternatives.length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Perbandingan Alternatif</h1>
          <p className="text-dark-400 mt-1">Matriks perbandingan alternatif per kriteria</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSave} disabled={saving} className="btn-secondary" id="save-alt-comp">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button onClick={handleCalculateAll} disabled={calculating} className="btn-primary" id="calc-alt-ahp">
            {calculating ? 'Menghitung...' : 'Hitung Semua'}
          </button>
        </div>
      </div>

      {/* Criteria Selector */}
      <div className="glass-card p-4">
        <label className="block text-sm font-medium text-dark-300 mb-2">Pilih Kriteria</label>
        <div className="flex flex-wrap gap-2">
          {criteria.map((c) => (
            <button
              key={c.id}
              onClick={() => handleCriteriaChange(c.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedCriteria?.id === c.id
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'bg-dark-800 text-dark-400 border border-dark-700 hover:text-white hover:border-dark-500'
              }`}
            >
              {c.code} - {c.name}
            </button>
          ))}
        </div>
      </div>

      {n < 2 ? (
        <div className="glass-card p-8 text-center text-dark-400">
          Minimal 2 alternatif diperlukan. Tambahkan alternatif terlebih dahulu.
        </div>
      ) : (
        <div className="glass-card p-6 overflow-x-auto">
          <h3 className="text-lg font-semibold text-white mb-4">
            Matriks Perbandingan — {selectedCriteria?.name}
          </h3>
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-sm text-dark-300 font-semibold">Alternatif</th>
                {alternatives.map((a) => (
                  <th key={a.id} className="px-3 py-2 text-center text-sm text-dark-300 font-semibold min-w-[80px]">{a.code}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alternatives.map((rowAlt, i) => (
                <tr key={rowAlt.id} className="border-t border-dark-700/30">
                  <td className="px-3 py-2 text-sm font-medium text-white whitespace-nowrap">{rowAlt.code} - {rowAlt.name}</td>
                  {alternatives.map((colAlt, j) => (
                    <td key={colAlt.id} className="px-2 py-2 text-center">
                      {i === j ? (
                        <span className="text-dark-500 text-sm">1</span>
                      ) : i < j ? (
                        <select
                          value={matrix[i]?.[j] || 1}
                          onChange={(e) => handleCellChange(i, j, e.target.value)}
                          className="w-20 px-2 py-1.5 bg-dark-900 border border-dark-600 rounded-lg text-sm text-white text-center focus:ring-2 focus:ring-primary-500/50"
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

      {/* Results */}
      {ahpResults && (
        <div className="space-y-4">
          {ahpResults.map((result) => (
            <div key={result.criteria_id} className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-white">{result.criteria_code} - {result.criteria_name}</h4>
                <span className={`${result.is_consistent ? 'badge-success' : 'badge-danger'}`}>
                  CR: {result.cr?.toFixed(4)} — {result.is_consistent ? 'Konsisten' : 'Tidak Konsisten'}
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {Object.entries(result.weights || {}).map(([altId, weight]) => {
                  const alt = alternatives.find((a) => a.id === parseInt(altId));
                  return (
                    <div key={altId} className="px-3 py-2 rounded-xl bg-dark-800/50 text-sm">
                      <span className="text-dark-400">{alt?.code}: </span>
                      <span className="text-white font-semibold">{weight?.toFixed(4)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
