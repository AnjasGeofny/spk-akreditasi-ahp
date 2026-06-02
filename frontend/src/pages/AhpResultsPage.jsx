import { useState, useEffect } from 'react';
import { ahpApi } from '../services/api';
import Loading from '../components/ui/Loading';

export default function AhpResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await ahpApi.getResults();
      setResults(res.data);
      if (res.data.length > 0) setSelected(res.data[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const viewDetail = async (result) => {
    try {
      const res = await ahpApi.getResultById(result.id);
      setSelected(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Hasil Perhitungan AHP</h1>
        <p className="text-dark-400 mt-1">Detail tahapan perhitungan Analytic Hierarchy Process</p>
      </div>

      {results.length === 0 ? (
        <div className="glass-card p-8 text-center text-dark-400">
          Belum ada hasil perhitungan AHP. Lakukan perhitungan terlebih dahulu.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Results List */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider px-1">Riwayat Perhitungan</h3>
            {results.map((r) => (
              <button
                key={r.id}
                onClick={() => viewDetail(r)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                  selected?.id === r.id
                    ? 'bg-primary-500/10 border border-primary-500/30'
                    : 'glass-card-hover'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white capitalize">{r.type === 'criteria' ? 'Kriteria' : `Alternatif — ${r.criteria_name || ''}`}</span>
                  <span className={`${r.is_consistent ? 'badge-success' : 'badge-danger'}`}>
                    {r.is_consistent ? 'OK' : '!'}
                  </span>
                </div>
                <p className="text-xs text-dark-400 mt-1">CR: {r.cr?.toFixed(4)} | {new Date(r.created_at).toLocaleString('id-ID')}</p>
              </button>
            ))}
          </div>

          {/* Detail View */}
          <div className="lg:col-span-2 space-y-4">
            {selected && (
              <>
                {/* Summary */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Detail — {selected.type === 'criteria' ? 'Bobot Kriteria' : `Bobot Alternatif (${selected.criteria_name || ''})`}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-dark-800/50">
                      <p className="text-xs text-dark-400">Lambda Max</p>
                      <p className="text-lg font-bold text-white">{selected.lambda_max?.toFixed(4)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-dark-800/50">
                      <p className="text-xs text-dark-400">CI</p>
                      <p className="text-lg font-bold text-white">{selected.ci?.toFixed(4)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-dark-800/50">
                      <p className="text-xs text-dark-400">CR</p>
                      <p className={`text-lg font-bold ${selected.is_consistent ? 'text-emerald-400' : 'text-red-400'}`}>{selected.cr?.toFixed(4)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-dark-800/50">
                      <p className="text-xs text-dark-400">Status</p>
                      <p className={`text-lg font-bold ${selected.is_consistent ? 'text-emerald-400' : 'text-red-400'}`}>{selected.is_consistent ? 'Konsisten' : 'Tidak'}</p>
                    </div>
                  </div>
                </div>

                {/* Weights */}
                <div className="glass-card p-6">
                  <h3 className="text-sm font-semibold text-dark-300 mb-3">Bobot (Priority Vector)</h3>
                  <div className="space-y-2">
                    {Object.entries(selected.weights || {}).map(([id, weight]) => (
                      <div key={id} className="flex items-center gap-3">
                        <span className="text-sm text-dark-400 w-16">ID {id}</span>
                        <div className="flex-1 h-3 bg-dark-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                            style={{ width: `${(weight || 0) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-white w-20 text-right">{(weight * 100).toFixed(2)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comparison Matrix */}
                {selected.comparison_matrix && (
                  <div className="glass-card p-6">
                    <h3 className="text-sm font-semibold text-dark-300 mb-3">Matriks Perbandingan</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <tbody>
                          {selected.comparison_matrix.map((row, i) => (
                            <tr key={i} className="border-t border-dark-700/30">
                              {row.map((val, j) => (
                                <td key={j} className={`px-3 py-2 text-center text-sm ${i === j ? 'text-dark-500' : 'text-dark-300'}`}>
                                  {val.toFixed(4)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Normalized Matrix */}
                {selected.normalized_matrix && (
                  <div className="glass-card p-6">
                    <h3 className="text-sm font-semibold text-dark-300 mb-3">Matriks Ternormalisasi</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <tbody>
                          {selected.normalized_matrix.map((row, i) => (
                            <tr key={i} className="border-t border-dark-700/30">
                              {row.map((val, j) => (
                                <td key={j} className="px-3 py-2 text-center text-sm text-dark-300">{val.toFixed(4)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
