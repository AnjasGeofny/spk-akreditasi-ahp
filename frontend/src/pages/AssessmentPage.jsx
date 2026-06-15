import { useState, useEffect } from 'react';
import { criteriaApi, alternativesApi, assessmentApi } from '../services/api';
import { useApp } from '../context/AppContext';
import { sortByCode } from '../utils/formatters';
import Loading from '../components/ui/Loading';

export default function AssessmentPage() {
  const { showNotification } = useApp();
  const [criteria, setCriteria] = useState([]);
  const [alternatives, setAlternatives] = useState([]);
  const [scores, setScores] = useState({});
  const [mode, setMode] = useState('without'); // 'without' or 'with'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [critRes, altRes, scoreRes] = await Promise.all([
        criteriaApi.getAll(),
        alternativesApi.getAll(),
        assessmentApi.getAll(),
      ]);
      setCriteria(critRes.data);
      setAlternatives(sortByCode(altRes.data));

      // Initialize scores from existing data
      const existing = {};
      scoreRes.data.forEach((s) => {
        const key = s.alternative_id ? `${s.criteria_id}_${s.alternative_id}` : `${s.criteria_id}_null`;
        existing[key] = { score: s.score, notes: s.notes || '' };
      });
      setScores(existing);

      // Detect mode
      if (scoreRes.data.some((s) => s.alternative_id)) {
        setMode('with');
      }
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (criteriaId, altId, value) => {
    const key = altId ? `${criteriaId}_${altId}` : `${criteriaId}_null`;
    setScores((prev) => ({
      ...prev,
      [key]: { ...prev[key], score: Math.min(100, Math.max(0, parseFloat(value) || 0)) },
    }));
  };

  const handleNotesChange = (criteriaId, altId, value) => {
    const key = altId ? `${criteriaId}_${altId}` : `${criteriaId}_null`;
    setScores((prev) => ({
      ...prev,
      [key]: { ...prev[key], notes: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const scoreData = [];
      if (mode === 'without') {
        criteria.forEach((c) => {
          const key = `${c.id}_null`;
          scoreData.push({
            criteria_id: c.id,
            alternative_id: null,
            score: scores[key]?.score || 0,
            notes: scores[key]?.notes || '',
          });
        });
      } else {
        criteria.forEach((c) => {
          alternatives.forEach((a) => {
            const key = `${c.id}_${a.id}`;
            scoreData.push({
              criteria_id: c.id,
              alternative_id: a.id,
              score: scores[key]?.score || 0,
              notes: scores[key]?.notes || '',
            });
          });
        });
      }
      await assessmentApi.save(scoreData);
      showNotification('Skor penilaian berhasil disimpan');
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Penilaian Kesiapan</h1>
          <p className="text-dark-400 mt-1">Input skor capaian per kriteria (0-100)</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary" id="save-assessment">
          {saving ? 'Menyimpan...' : 'Simpan Skor'}
        </button>
      </div>

      {/* Mode Selector */}
      <div className="glass-card p-4">
        <label className="block text-sm font-medium text-dark-300 mb-2">Mode Penilaian</label>
        <div className="flex gap-3">
          <button
            onClick={() => setMode('without')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              mode === 'without'
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : 'bg-dark-800 text-dark-400 border border-dark-700 hover:text-white'
            }`}
          >
            Tanpa Alternatif
          </button>
          <button
            onClick={() => setMode('with')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              mode === 'with'
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : 'bg-dark-800 text-dark-400 border border-dark-700 hover:text-white'
            }`}
          >
            Dengan Alternatif
          </button>
        </div>
      </div>

      {/* Score Input */}
      {mode === 'without' ? (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Skor Capaian per Kriteria</h3>
          <div className="table-container">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="px-5 py-3 text-left">Kriteria</th>
                  <th className="px-5 py-3 text-center w-32">Skor (0-100)</th>
                  <th className="px-5 py-3 text-left">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {criteria.map((c) => {
                  const key = `${c.id}_null`;
                  return (
                    <tr key={c.id} className="table-row">
                      <td className="px-5 py-3 text-white font-medium">{c.code} - {c.name}</td>
                      <td className="px-5 py-3">
                        <input
                          type="number"
                          min={0} max={100} step={0.01}
                          value={scores[key]?.score || ''}
                          onChange={(e) => handleScoreChange(c.id, null, e.target.value)}
                          className="input-field text-center w-24 mx-auto"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-5 py-3">
                        <input
                          type="text"
                          value={scores[key]?.notes || ''}
                          onChange={(e) => handleNotesChange(c.id, null, e.target.value)}
                          className="input-field"
                          placeholder="Catatan..."
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Skor Capaian per Kriteria per Alternatif</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="px-5 py-3 text-left">Kriteria</th>
                  {alternatives.map((a) => (
                    <th key={a.id} className="px-3 py-3 text-center min-w-[100px]">{a.code}<br /><span className="text-xs font-normal">{a.name}</span></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {criteria.map((c) => (
                  <tr key={c.id} className="table-row">
                    <td className="px-5 py-3 text-white font-medium whitespace-nowrap">{c.code} - {c.name}</td>
                    {alternatives.map((a) => {
                      const key = `${c.id}_${a.id}`;
                      return (
                        <td key={a.id} className="px-2 py-3 text-center">
                          <input
                            type="number"
                            min={0} max={100} step={0.01}
                            value={scores[key]?.score || ''}
                            onChange={(e) => handleScoreChange(c.id, a.id, e.target.value)}
                            className="input-field text-center w-20"
                            placeholder="0"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
