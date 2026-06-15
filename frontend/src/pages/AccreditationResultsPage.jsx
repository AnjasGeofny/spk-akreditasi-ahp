import { useState, useEffect } from 'react';
import { accreditationApi } from '../services/api';
import { useApp } from '../context/AppContext';
import Loading from '../components/ui/Loading';
import { formatPercent, getStatusBadgeClass } from '../utils/formatters';

export default function AccreditationResultsPage() {
  const { showNotification } = useApp();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [calcError, setCalcError] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await accreditationApi.getLatest();
      setResults(res.data);
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async (mode) => {
    setCalculating(true);
    setCalcError(null);
    try {
      await accreditationApi.calculate(mode);
      showNotification('Perhitungan akreditasi berhasil');
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setCalcError(msg);
      showNotification(msg, 'error');
    } finally {
      setCalculating(false);
    }
  };

  if (loading) return <Loading />;

  const hasAlternatives = results.some((r) => r.alternative_id);



  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Hasil Akreditasi</h1>
          <p className="text-dark-400 mt-1">Nilai kesiapan dan ranking program studi</p>
        </div>
        <div className="flex gap-3">
          {/* Button tanpa alternatif disembunyikan — tidak dibutuhkan */}
          {/* <button onClick={() => handleCalculate('without_alternatives')} ... /> */}
          <button onClick={() => handleCalculate('with_alternatives')} disabled={calculating} className="btn-primary" id="calc-with-alt">
            {calculating ? (
              <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Menghitung...</span>
            ) : 'Hitung Dengan Alternatif'}
          </button>
        </div>
      </div>

      {calcError && (
        <div className="glass-card p-4 border border-red-500/30 bg-red-500/10">
          <p className="text-red-400 text-sm"><span className="font-semibold">Error: </span>{calcError}</p>
        </div>
      )}

      {results.length === 0 ? (
        <div className="glass-card p-8 text-center text-dark-400">
          Belum ada hasil. Lakukan perhitungan terlebih dahulu.
        </div>
      ) : (
        <>
          {/* Results Table */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {hasAlternatives ? 'Ranking Kesiapan Akreditasi' : 'Nilai Kesiapan Akreditasi'}
            </h3>
            <div className="table-container">
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    {hasAlternatives && <th className="px-5 py-3 text-center">Rank</th>}
                    <th className="px-5 py-3 text-left">{hasAlternatives ? 'Program Studi' : 'Keterangan'}</th>
                    <th className="px-5 py-3 text-center">Nilai Akhir</th>
                    <th className="px-5 py-3 text-center">Persentase</th>
                    <th className="px-5 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={r.id} className="table-row">
                      {hasAlternatives && (
                        <td className="px-5 py-3 text-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                            i === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-dark-700 text-dark-300'
                          }`}>
                            {i + 1}
                          </span>
                        </td>
                      )}
                      <td className="px-5 py-3 text-white font-medium">{r.alternative_name || 'Penilaian Keseluruhan'}</td>
                      <td className="px-5 py-3 text-center text-white font-semibold">{r.final_score?.toFixed(2)}</td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-20 h-2 bg-dark-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full" style={{ width: `${Math.min(r.readiness_percentage, 100)}%` }} />
                          </div>
                          <span className="text-sm text-dark-200">{formatPercent(r.readiness_percentage)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={getStatusBadgeClass(r.status)}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>



          {/* Status Legend */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-dark-300 mb-3">Kategori Status Kesiapan Akreditasi</h3>
            <div className="flex flex-wrap gap-4">
              {[
                { range: '70-100', label: 'Sangat Siap', cls: 'badge-success' },
                { range: '55-69', label: 'Siap', cls: 'badge-info' },
                { range: '40-54', label: 'Cukup Siap', cls: 'badge-warning' },
                { range: '<40', label: 'Belum Siap', cls: 'badge-danger' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className={s.cls}>{s.label}</span>
                  <span className="text-xs text-dark-400">{s.range}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-dark-500 mt-3">* Skor dinormalisasi dari bobot AHP. Rata-rata program studi ≈ 50.</p>
          </div>
        </>
      )}
    </div>
  );
}
