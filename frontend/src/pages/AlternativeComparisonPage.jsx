import { useState, useEffect } from 'react';
import { criteriaApi, subCriteriaApi, alternativesApi, altComparisonApi, ahpApi } from '../services/api';
import { useApp } from '../context/AppContext';
import { sortByCode } from '../utils/formatters';
import Loading from '../components/ui/Loading';

export default function AlternativeComparisonPage() {
  const { showNotification } = useApp();
  const [criteria, setCriteria] = useState([]);
  const [subCriteriaMap, setSubCriteriaMap] = useState({}); // { criteriaId: [subCriteria] }
  const [alternatives, setAlternatives] = useState([]);
  const [selectedCriteria, setSelectedCriteria] = useState(null);
  const [selectedSubCriteria, setSelectedSubCriteria] = useState(null);
  const [matrix, setMatrix] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [ahpResults, setAhpResults] = useState(null);

  useEffect(() => { loadInitialData(); }, []);

  const loadInitialData = async () => {
    try {
      const [critRes, altRes, allScRes] = await Promise.all([
        criteriaApi.getAll(),
        alternativesApi.getAll(),
        subCriteriaApi.getAll(),
      ]);

      const critList = critRes.data || [];
      const altList = sortByCode(altRes.data || []);
      const allSc = allScRes.data || [];

      // Group sub-criteria by criteria_id
      const scMap = {};
      critList.forEach((c) => { scMap[c.id] = []; });
      allSc.forEach((sc) => {
        if (scMap[sc.criteria_id]) scMap[sc.criteria_id].push(sc);
      });

      setCriteria(critList);
      setSubCriteriaMap(scMap);
      setAlternatives(altList);

      // Auto-select first criteria and first sub-criteria
      if (critList.length > 0) {
        const firstCrit = critList[0];
        setSelectedCriteria(firstCrit);
        const firstSubList = scMap[firstCrit.id] || [];
        if (firstSubList.length > 0) {
          const firstSc = firstSubList[0];
          setSelectedSubCriteria(firstSc);
          await loadComparisons(firstSc.id, altList);
        }
      }
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadComparisons = async (subCriteriaId, alts) => {
    const altList = alts || alternatives;
    try {
      const res = await altComparisonApi.getBySubCriteria(subCriteriaId);
      initializeMatrix(altList, res.data || []);
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

  const handleCriteriaChange = async (crit) => {
    setSelectedCriteria(crit);
    const subList = subCriteriaMap[crit.id] || [];
    if (subList.length > 0) {
      const firstSc = subList[0];
      setSelectedSubCriteria(firstSc);
      await loadComparisons(firstSc.id);
    } else {
      setSelectedSubCriteria(null);
      setMatrix([]);
    }
  };

  const handleSubCriteriaChange = async (sc) => {
    setSelectedSubCriteria(sc);
    await loadComparisons(sc.id);
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
    if (!selectedSubCriteria) return;
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
      await altComparisonApi.save(selectedSubCriteria.id, comparisons);
      showNotification(`Perbandingan untuk "${selectedSubCriteria.name}" berhasil disimpan`);
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
      showNotification('Perhitungan AHP alternatif per sub-kriteria berhasil');
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setCalculating(false);
    }
  };

  if (loading) return <Loading />;

  const n = alternatives.length;
  const currentSubList = selectedCriteria ? (subCriteriaMap[selectedCriteria.id] || []) : [];

  // Saaty scale values (upper triangle only)
  const saatyValues = [
    { label: '1', value: 1 }, { label: '2', value: 2 }, { label: '3', value: 3 },
    { label: '4', value: 4 }, { label: '5', value: 5 }, { label: '6', value: 6 },
    { label: '7', value: 7 }, { label: '8', value: 8 }, { label: '9', value: 9 },
    { label: '1/2', value: 0.5 }, { label: '1/3', value: 0.3333 }, { label: '1/4', value: 0.25 },
    { label: '1/5', value: 0.2 }, { label: '1/6', value: 0.1667 }, { label: '1/7', value: 0.1429 },
    { label: '1/8', value: 0.125 }, { label: '1/9', value: 0.1111 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Perbandingan Alternatif</h1>
          <p className="text-dark-400 mt-1">Matriks perbandingan alternatif per sub-kriteria</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSave} disabled={saving || !selectedSubCriteria} className="btn-secondary" id="save-alt-comp">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button onClick={handleCalculateAll} disabled={calculating} className="btn-primary" id="calc-alt-ahp">
            {calculating ? 'Menghitung...' : 'Hitung Semua'}
          </button>
        </div>
      </div>

      {/* Criteria Tabs */}
      <div className="glass-card p-4 space-y-3">
        <div>
          <label className="block text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">
            Pilih Kriteria
          </label>
          <div className="flex flex-wrap gap-2">
            {criteria.map((c) => (
              <button
                key={c.id}
                onClick={() => handleCriteriaChange(c)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedCriteria?.id === c.id
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'bg-dark-800 text-dark-400 border border-dark-700 hover:text-white hover:border-dark-500'
                }`}
              >
                {c.code} — {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-Criteria Tabs */}
        {currentSubList.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">
              Pilih Sub-Kriteria
            </label>
            <div className="flex flex-wrap gap-2">
              {currentSubList.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => handleSubCriteriaChange(sc)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    selectedSubCriteria?.id === sc.id
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-dark-800 text-dark-400 border border-dark-700 hover:text-white hover:border-dark-500'
                  }`}
                >
                  {sc.code} — {sc.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentSubList.length === 0 && selectedCriteria && (
          <p className="text-sm text-dark-500 italic">Tidak ada sub-kriteria untuk kriteria ini.</p>
        )}
      </div>

      {/* Matrix */}
      {n < 2 ? (
        <div className="glass-card p-8 text-center text-dark-400">
          Minimal 2 alternatif diperlukan. Tambahkan alternatif terlebih dahulu.
        </div>
      ) : !selectedSubCriteria ? (
        <div className="glass-card p-8 text-center text-dark-400">
          Pilih sub-kriteria untuk menampilkan matriks perbandingan.
        </div>
      ) : (
        <div className="glass-card p-6 overflow-x-auto">
          <h3 className="text-lg font-semibold text-white mb-1">
            Matriks Perbandingan Alternatif
          </h3>
          <p className="text-sm text-dark-400 mb-4">
            {selectedCriteria?.code} / {selectedSubCriteria?.code} — {selectedSubCriteria?.name}
          </p>
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs text-dark-300 font-semibold">Alternatif</th>
                {alternatives.map((a) => (
                  <th key={a.id} className="px-2 py-2 text-center text-xs text-dark-300 font-semibold min-w-[70px]">
                    {a.code}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alternatives.map((rowAlt, i) => (
                <tr key={rowAlt.id} className="border-t border-dark-700/30">
                  <td className="px-3 py-2 text-xs font-medium text-white whitespace-nowrap">
                    {rowAlt.code} — {rowAlt.name}
                  </td>
                  {alternatives.map((colAlt, j) => (
                    <td key={colAlt.id} className="px-1 py-1 text-center">
                      {i === j ? (
                        <span className="text-dark-500 text-sm">1</span>
                      ) : i < j ? (
                        <select
                          value={matrix[i]?.[j] || 1}
                          onChange={(e) => handleCellChange(i, j, e.target.value)}
                          className="w-16 px-1 py-1 bg-dark-900 border border-dark-600 rounded-lg text-xs text-white text-center focus:ring-2 focus:ring-primary-500/50"
                        >
                          {saatyValues.map((s) => (
                            <option key={s.label} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-dark-400 text-xs">{matrix[i]?.[j]?.toFixed(3)}</span>
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
      {ahpResults && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Hasil Perhitungan AHP Alternatif per Sub-Kriteria</h3>
          {ahpResults.map((result) => (
            <div key={result.sub_criteria_id} className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-white text-sm">
                    {result.sub_criteria_code} — {result.sub_criteria_name}
                  </h4>
                </div>
                <span className={`${result.is_consistent ? 'badge-success' : 'badge-danger'} text-xs`}>
                  CR: {result.cr?.toFixed(4)} — {result.is_consistent ? 'Konsisten' : 'Tidak Konsisten'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(result.weights || {}).map(([altId, weight]) => {
                  const alt = alternatives.find((a) => a.id === parseInt(altId));
                  return (
                    <div key={altId} className="px-3 py-1.5 rounded-lg bg-dark-800/50 text-xs">
                      <span className="text-dark-400">{alt?.code}: </span>
                      <span className="text-white font-semibold">{(weight * 100).toFixed(2)}%</span>
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
