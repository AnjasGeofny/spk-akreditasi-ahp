import { useState, useEffect } from 'react';
import { accreditationApi } from '../services/api';
import { useApp } from '../context/AppContext';
import Loading from '../components/ui/Loading';
import { formatPercent, getStatusBadgeClass } from '../utils/formatters';
import { CHART_COLORS } from '../utils/constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Cell } from 'recharts';

export default function AccreditationResultsPage() {
  const { showNotification } = useApp();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

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
    try {
      await accreditationApi.calculate(mode);
      showNotification('Perhitungan akreditasi berhasil');
      loadData();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setCalculating(false);
    }
  };

  if (loading) return <Loading />;

  const hasAlternatives = results.some((r) => r.alternative_id);

  const chartData = results.map((r, i) => ({
    name: r.alternative_name || 'Keseluruhan',
    score: r.readiness_percentage,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Hasil Akreditasi</h1>
          <p className="text-dark-400 mt-1">Nilai kesiapan dan ranking program studi</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => handleCalculate('without_alternatives')} disabled={calculating} className="btn-secondary" id="calc-without-alt">
            {calculating ? 'Menghitung...' : 'Hitung Tanpa Alternatif'}
          </button>
          <button onClick={() => handleCalculate('with_alternatives')} disabled={calculating} className="btn-primary" id="calc-with-alt">
            {calculating ? 'Menghitung...' : 'Hitung Dengan Alternatif'}
          </button>
        </div>
      </div>

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

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Grafik Batang</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }} formatter={(v) => [`${v.toFixed(2)}%`, 'Skor']} />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Grafik Radar</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={chartData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <PolarRadiusAxis tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[0, 100]} />
                  <Radar name="Skor Kesiapan" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                  <Legend />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Legend */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-dark-300 mb-3">Kategori Status Kesiapan</h3>
            <div className="flex flex-wrap gap-4">
              {[
                { range: '85-100', label: 'Sangat Siap', cls: 'badge-success' },
                { range: '70-84', label: 'Siap', cls: 'badge-info' },
                { range: '55-69', label: 'Cukup Siap', cls: 'badge-warning' },
                { range: '<55', label: 'Belum Siap', cls: 'badge-danger' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className={s.cls}>{s.label}</span>
                  <span className="text-xs text-dark-400">{s.range}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
