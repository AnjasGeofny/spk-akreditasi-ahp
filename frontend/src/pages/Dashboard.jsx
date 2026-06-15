import { useEffect, useState } from 'react';
import { dashboardApi } from '../services/api';
import Loading from '../components/ui/Loading';
import { formatPercent } from '../utils/formatters';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await dashboardApi.getSummary();
      setSummary(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  const statCards = [
    {
      title: 'Total Kriteria',
      value: summary?.total_criteria || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      gradient: 'from-indigo-500 to-indigo-700',
      shadowColor: 'shadow-indigo-500/25',
    },
    {
      title: 'Total Alternatif',
      value: summary?.total_alternatives || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      gradient: 'from-violet-500 to-violet-700',
      shadowColor: 'shadow-violet-500/25',
    },
    {
      title: 'Nilai Kesiapan',
      value: summary?.overall_readiness != null ? formatPercent(summary.overall_readiness) : '-',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      gradient: 'from-emerald-500 to-emerald-700',
      shadowColor: 'shadow-emerald-500/25',
    },
    {
      title: 'Status Konsistensi',
      value: summary?.ahp_consistency
        ? summary.ahp_consistency.is_consistent ? 'Konsisten' : 'Tidak Konsisten'
        : '-',
      subtitle: summary?.ahp_consistency ? `CR: ${summary.ahp_consistency.cr?.toFixed(4)}` : '',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: summary?.ahp_consistency?.is_consistent ? 'from-teal-500 to-teal-700' : 'from-red-500 to-red-700',
      shadowColor: summary?.ahp_consistency?.is_consistent ? 'shadow-teal-500/25' : 'shadow-red-500/25',
    },
  ];




  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-dark-400 mt-1">Ringkasan sistem pendukung keputusan akreditasi</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="glass-card p-5 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-dark-400 uppercase tracking-wider">{card.title}</p>
                <p className="text-2xl font-bold text-white mt-2">{card.value}</p>
                {card.subtitle && <p className="text-xs text-dark-400 mt-1">{card.subtitle}</p>}
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} ${card.shadowColor} shadow-lg`}>
                <span className="text-white">{card.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>



      {/* Quick Status */}
      {summary?.overall_status && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Status Kesiapan Keseluruhan</h3>
          <div className="flex items-center gap-4">
            <div className={`px-6 py-3 rounded-xl text-lg font-bold ${
              summary.overall_status === 'Sangat Siap' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              summary.overall_status === 'Siap' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
              summary.overall_status === 'Cukup Siap' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {summary.overall_status}
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatPercent(summary.overall_readiness)}</p>
              <p className="text-xs text-dark-400">Persentase Kesiapan</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
