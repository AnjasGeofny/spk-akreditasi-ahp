import { useState, useEffect } from 'react';
import { accreditationApi, ahpApi } from '../services/api';
import { useApp } from '../context/AppContext';
import Loading from '../components/ui/Loading';
import { formatPercent, getStatusBadgeClass } from '../utils/formatters';

export default function AccreditationResultsPage() {
  const { showNotification } = useApp();
  const [results, setResults] = useState([]);
  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [calcError, setCalcError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [accRes, readyRes] = await Promise.all([
        accreditationApi.getLatest(),
        ahpApi.getReadiness(),
      ]);
      setResults(accRes.data);
      setReadiness(readyRes.data);
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

  // Icons
  const CheckIcon = () => (
    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
  const CrossIcon = () => (
    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
  const PendingIcon = () => (
    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const getStepIcon = (ready, calculated) => {
    if (ready) return <CheckIcon />;
    if (calculated) return <CrossIcon />;
    return <PendingIcon />;
  };

  const getStepLabel = (ready, calculated) => {
    if (ready) return 'Siap';
    if (calculated) return 'Tidak Konsisten';
    return 'Belum Dihitung';
  };

  const getStepClass = (ready, calculated) => {
    if (ready) return 'border-emerald-500/30 bg-emerald-500/5';
    if (calculated) return 'border-red-500/30 bg-red-500/5';
    return 'border-amber-500/30 bg-amber-500/5';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Hasil Akreditasi</h1>
          <p className="text-dark-400 mt-1">Nilai kesiapan dan ranking program studi</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => handleCalculate('with_alternatives')} disabled={calculating} className="btn-primary" id="calc-with-alt">
            {calculating ? (
              <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Menghitung...</span>
            ) : 'Hitung Dengan Alternatif'}
          </button>
        </div>
      </div>

      {/* Readiness Indicator */}
      {readiness && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Indikator Kesiapan Data</h3>
            {readiness.all_ready ? (
              <span className="badge-success text-xs">✓ Semua Siap</span>
            ) : (
              <span className="badge-warning text-xs">Belum Lengkap</span>
            )}
          </div>

          {/* 3 Main Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Step 1: Criteria */}
            <div className={`p-4 rounded-xl border ${getStepClass(readiness.criteria.ready, readiness.criteria.calculated)}`}>
              <div className="flex items-center gap-3">
                {getStepIcon(readiness.criteria.ready, readiness.criteria.calculated)}
                <div>
                  <p className="text-sm font-semibold text-white">Bobot Kriteria</p>
                  <p className="text-xs text-dark-400 mt-0.5">
                    {readiness.criteria.ready
                      ? `CR: ${readiness.criteria.cr?.toFixed(4)}`
                      : getStepLabel(readiness.criteria.ready, readiness.criteria.calculated)}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2: Sub-Criteria */}
            <div className={`p-4 rounded-xl border ${getStepClass(readiness.sub_criteria.all_ready, readiness.sub_criteria.details.some(s => s.calculated))}`}>
              <div className="flex items-center gap-3">
                {getStepIcon(readiness.sub_criteria.all_ready, readiness.sub_criteria.details.some(s => s.calculated))}
                <div>
                  <p className="text-sm font-semibold text-white">Bobot Sub-Kriteria</p>
                  <p className="text-xs text-dark-400 mt-0.5">
                    {readiness.sub_criteria.details.filter(s => s.ready).length}/{readiness.sub_criteria.details.length} kriteria siap
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3: Alternatives */}
            <div className={`p-4 rounded-xl border ${getStepClass(readiness.alternatives.all_ready, readiness.alternatives.completed > 0)}`}>
              <div className="flex items-center gap-3">
                {getStepIcon(readiness.alternatives.all_ready, readiness.alternatives.completed > 0)}
                <div>
                  <p className="text-sm font-semibold text-white">Bobot Alternatif</p>
                  <p className="text-xs text-dark-400 mt-0.5">
                    {readiness.alternatives.completed}/{readiness.alternatives.total} sub-kriteria siap
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Toggle Detail */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"
          >
            <svg className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {showDetails ? 'Sembunyikan detail' : 'Lihat detail per kriteria'}
          </button>

          {/* Detail Breakdown */}
          {showDetails && (
            <div className="mt-4 space-y-3">
              {/* Sub-Criteria Detail */}
              <div>
                <p className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">Detail Bobot Sub-Kriteria</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {readiness.sub_criteria.details.map((s) => (
                    <div key={s.criteria_id} className="flex items-center gap-2 p-2 rounded-lg bg-dark-800/50">
                      {s.ready ? <CheckIcon /> : s.calculated ? <CrossIcon /> : <PendingIcon />}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white font-medium truncate">{s.criteria_code} — {s.criteria_name}</p>
                        <p className="text-[10px] text-dark-400">
                          {s.ready ? `CR: ${s.cr?.toFixed(4)}` : getStepLabel(s.ready, s.calculated)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alternative Detail */}
              <div>
                <p className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">Detail Bobot Alternatif per Sub-Kriteria</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {readiness.alternatives.details.map((a) => (
                    <div key={a.sub_criteria_id} className="flex items-center gap-2 p-2 rounded-lg bg-dark-800/50">
                      {a.ready ? <CheckIcon /> : a.calculated ? <CrossIcon /> : <PendingIcon />}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white font-medium truncate">{a.sub_criteria_code} — {a.sub_criteria_name}</p>
                        <p className="text-[10px] text-dark-400">
                          {a.ready ? `CR: ${a.cr?.toFixed(4)}` : getStepLabel(a.ready, a.calculated)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
              Ranking Akreditasi Program Studi
            </h3>
            <div className="table-container">
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="px-4 py-3 text-center">Ranking</th>
                    <th className="px-4 py-3 text-left">Program Studi</th>
                    <th className="px-4 py-3 text-center">Skor Akhir</th>
                    <th className="px-4 py-3 text-center">Persentase</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => {
                    const maxScore = results.length > 0 ? results[0].final_score : 1;
                    const barWidth = maxScore > 0 ? (r.final_score / maxScore) * 100 : 0;
                    return (
                      <tr key={r.id} className="table-row">
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                            i === 0 ? 'bg-amber-500/20 text-amber-400' :
                            i === 1 ? 'bg-slate-300/20 text-slate-300' :
                            i === 2 ? 'bg-orange-500/20 text-orange-400' :
                            'bg-dark-700 text-dark-300'
                          }`}>
                            {i + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white font-medium">{r.alternative_name || 'Penilaian Keseluruhan'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-white font-mono font-semibold text-sm">{r.final_score?.toFixed(4)}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center gap-2 justify-center">
                            <div className="w-16 h-2 bg-dark-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                                style={{ width: `${Math.min(r.readiness_percentage, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-dark-200 font-mono">{formatPercent(r.readiness_percentage)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={getStatusBadgeClass(r.status)}>{r.status}</span>
                        </td>
                      </tr>
                    );
                  })}
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
