import { useEffect, useMemo, useState } from 'react';
import { criteriaApi, subCriteriaApi, subCriteriaComparisonApi, ahpApi } from '../services/api';
import { useApp } from '../context/AppContext';
import { SAATY_SCALE } from '../utils/constants';
import Modal from '../components/ui/Modal';
import Loading from '../components/ui/Loading';

export default function SubCriteriaPage() {
  const { showNotification } = useApp();
  const [criteria, setCriteria] = useState([]);
  const [selectedCriteriaId, setSelectedCriteriaId] = useState('');
  const [subCriteria, setSubCriteria] = useState([]);
  const [matrix, setMatrix] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [ahpResult, setAhpResult] = useState(null);
  const [form, setForm] = useState({ criteria_id: '', name: '', code: '', description: '', order_index: 0 });

  const selectedCriteria = useMemo(
    () => criteria.find((item) => item.id === parseInt(selectedCriteriaId)),
    [criteria, selectedCriteriaId]
  );

  useEffect(() => { loadCriteria(); }, []);

  useEffect(() => {
    if (selectedCriteriaId) {
      loadSubCriteria(selectedCriteriaId);
    }
  }, [selectedCriteriaId]);

  const loadCriteria = async () => {
    try {
      const res = await criteriaApi.getAll();
      setCriteria(res.data);
      if (res.data.length > 0) {
        setSelectedCriteriaId(String(res.data[0].id));
      }
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadSubCriteria = async (criteriaId) => {
    setLoading(true);
    try {
      const [subRes, compRes] = await Promise.all([
        subCriteriaApi.getAll(criteriaId),
        subCriteriaComparisonApi.getByCriteria(criteriaId),
      ]);
      setSubCriteria(subRes.data);
      initializeMatrix(subRes.data, compRes.data);
      setAhpResult(null);
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const initializeMatrix = (items, comparisons) => {
    const n = items.length;
    const mat = Array.from({ length: n }, () => Array(n).fill(1));
    const idIndex = {};
    items.forEach((item, index) => (idIndex[item.id] = index));

    comparisons.forEach((comp) => {
      const rowIndex = idIndex[comp.sub_criteria_row_id];
      const colIndex = idIndex[comp.sub_criteria_col_id];
      if (rowIndex !== undefined && colIndex !== undefined) {
        mat[rowIndex][colIndex] = comp.value;
        mat[colIndex][rowIndex] = parseFloat((1 / comp.value).toFixed(4));
      }
    });

    setMatrix(mat);
  };

  const openCreate = () => {
    setEditItem(null);
    setForm({
      criteria_id: parseInt(selectedCriteriaId),
      name: '',
      code: '',
      description: '',
      order_index: subCriteria.length + 1,
    });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      criteria_id: item.criteria_id,
      name: item.name,
      code: item.code,
      description: item.description || '',
      order_index: item.order_index || 0,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editItem) {
        await subCriteriaApi.update(editItem.id, form);
        showNotification('Sub-kriteria berhasil diperbarui');
      } else {
        await subCriteriaApi.create(form);
        showNotification('Sub-kriteria berhasil ditambahkan');
      }
      setModalOpen(false);
      setSelectedCriteriaId(String(form.criteria_id));
      loadSubCriteria(form.criteria_id);
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Hapus sub-kriteria "${item.name}"?`)) return;
    try {
      await subCriteriaApi.delete(item.id);
      showNotification('Sub-kriteria berhasil dihapus');
      loadSubCriteria(selectedCriteriaId);
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleCellChange = (row, col, value) => {
    const val = parseFloat(value);
    if (isNaN(val) || val <= 0) return;

    const nextMatrix = matrix.map((item) => [...item]);
    nextMatrix[row][col] = val;
    nextMatrix[col][row] = parseFloat((1 / val).toFixed(4));
    setMatrix(nextMatrix);
  };

  const handleSaveMatrix = async () => {
    setSaving(true);
    try {
      const comparisons = [];
      for (let i = 0; i < subCriteria.length; i++) {
        for (let j = 0; j < subCriteria.length; j++) {
          comparisons.push({
            sub_criteria_row_id: subCriteria[i].id,
            sub_criteria_col_id: subCriteria[j].id,
            value: matrix[i][j],
          });
        }
      }
      await subCriteriaComparisonApi.save(selectedCriteriaId, comparisons);
      showNotification('Matriks sub-kriteria berhasil disimpan');
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleCalculate = async () => {
    setCalculating(true);
    try {
      await handleSaveMatrix();
      const res = await ahpApi.calculateSubCriteria(selectedCriteriaId);
      setAhpResult(res.data);
      showNotification('Perhitungan AHP sub-kriteria berhasil');
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setCalculating(false);
    }
  };

  if (loading && criteria.length === 0) return <Loading />;

  const n = subCriteria.length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Manajemen Sub-Kriteria</h1>
          <p className="text-dark-400 mt-1">Kelola sub-kriteria per kriteria dan hitung bobot AHP-nya</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={selectedCriteriaId}
            onChange={(e) => setSelectedCriteriaId(e.target.value)}
            className="input-field min-w-[260px]"
          >
            {criteria.map((item) => (
              <option key={item.id} value={item.id}>{item.code} - {item.name}</option>
            ))}
          </select>
          <button onClick={openCreate} disabled={!selectedCriteriaId} className="btn-primary" id="add-sub-criteria">
            Tambah Sub-Kriteria
          </button>
        </div>
      </div>

      {criteria.length === 0 ? (
        <div className="glass-card p-8 text-center text-dark-400">
          <p>Belum ada kriteria. Tambahkan kriteria terlebih dahulu.</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="px-5 py-3 text-left">No</th>
                  <th className="px-5 py-3 text-left">Kode</th>
                  <th className="px-5 py-3 text-left">Nama Sub-Kriteria</th>
                  <th className="px-5 py-3 text-left">Kriteria Induk</th>
                  <th className="px-5 py-3 text-left">Deskripsi</th>
                  <th className="px-5 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {subCriteria.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-dark-400">Belum ada data sub-kriteria</td></tr>
                ) : (
                  subCriteria.map((item, index) => (
                    <tr key={item.id} className="table-row">
                      <td className="px-5 py-3 text-dark-300">{index + 1}</td>
                      <td className="px-5 py-3">
                        <span className="px-2.5 py-1 rounded-lg bg-primary-500/10 text-primary-400 text-xs font-semibold">{item.code}</span>
                      </td>
                      <td className="px-5 py-3 text-white font-medium">{item.name}</td>
                      <td className="px-5 py-3 text-dark-300 text-sm">{item.criteria_code} - {item.criteria_name}</td>
                      <td className="px-5 py-3 text-dark-400 text-sm max-w-xs truncate">{item.description || '-'}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-primary-400 transition-colors" title="Edit">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => handleDelete(item)} className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-red-400 transition-colors" title="Hapus">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-dark-300 mb-2">Skala Saaty</h3>
            <div className="flex flex-wrap gap-2">
              {SAATY_SCALE.map((scale) => (
                <span key={scale.value} className="px-2 py-1 rounded-lg bg-dark-800 text-xs text-dark-300">
                  {scale.label}
                </span>
              ))}
            </div>
          </div>

          {n < 2 ? (
            <div className="glass-card p-8 text-center text-dark-400">
              <p>Minimal 2 sub-kriteria diperlukan untuk perhitungan AHP.</p>
            </div>
          ) : (
            <div className="glass-card p-6 overflow-x-auto">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Matriks Perbandingan Sub-Kriteria</h3>
                  <p className="text-sm text-dark-400">{selectedCriteria?.code} - {selectedCriteria?.name}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleSaveMatrix} disabled={saving} className="btn-secondary" id="save-subcriteria-comparison">
                    {saving ? 'Menyimpan...' : 'Simpan Matriks'}
                  </button>
                  <button onClick={handleCalculate} disabled={calculating} className="btn-primary" id="calculate-subcriteria-ahp">
                    {calculating ? 'Menghitung...' : 'Hitung AHP'}
                  </button>
                </div>
              </div>
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-sm text-dark-300 font-semibold">Sub-Kriteria</th>
                    {subCriteria.map((item) => (
                      <th key={item.id} className="px-3 py-2 text-center text-sm text-dark-300 font-semibold min-w-[80px]">
                        {item.code}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subCriteria.map((rowItem, i) => (
                    <tr key={rowItem.id} className="border-t border-dark-700/30">
                      <td className="px-3 py-2 text-sm font-medium text-white whitespace-nowrap">
                        {rowItem.code} - {rowItem.name}
                      </td>
                      {subCriteria.map((colItem, j) => {
                        const allOptions = [
                          ...SAATY_SCALE.map((s) => ({ label: String(s.value), numVal: s.value })),
                          ...SAATY_SCALE.filter((s) => s.value > 1).map((s) => ({
                            label: `1/${s.value}`,
                            numVal: 1 / s.value,
                          })),
                        ];

                        const currentVal = matrix[i]?.[j] ?? 1;
                        const closestOpt = allOptions.reduce((best, opt) =>
                          Math.abs(opt.numVal - currentVal) < Math.abs(best.numVal - currentVal) ? opt : best
                        );

                        return (
                          <td key={colItem.id} className="px-2 py-2 text-center">
                            {i === j ? (
                              <span className="text-dark-500 text-sm">1</span>
                            ) : i < j ? (
                              <select
                                value={closestOpt.label}
                                onChange={(e) => {
                                  const selected = allOptions.find((o) => o.label === e.target.value);
                                  if (selected) handleCellChange(i, j, selected.numVal);
                                }}
                                className="w-20 px-2 py-1.5 bg-dark-900 border border-dark-600 rounded-lg text-sm text-white text-center focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                              >
                                {allOptions.map((opt) => (
                                  <option key={opt.label} value={opt.label}>{opt.label}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-dark-400 text-sm">{matrix[i]?.[j]?.toFixed(4)}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {ahpResult && (
            <div className="space-y-4">
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Hasil Perhitungan AHP Sub-Kriteria</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-dark-800/50">
                    <p className="text-xs text-dark-400">Lambda Max</p>
                    <p className="text-lg font-bold text-white">{ahpResult.lambda_max?.toFixed(4)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-dark-800/50">
                    <p className="text-xs text-dark-400">CI</p>
                    <p className="text-lg font-bold text-white">{ahpResult.ci?.toFixed(4)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-dark-800/50">
                    <p className="text-xs text-dark-400">RI</p>
                    <p className="text-lg font-bold text-white">{ahpResult.ri?.toFixed(4)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-dark-800/50">
                    <p className="text-xs text-dark-400">CR</p>
                    <p className={`text-lg font-bold ${ahpResult.is_consistent ? 'text-emerald-400' : 'text-red-400'}`}>
                      {ahpResult.cr?.toFixed(4)}
                    </p>
                  </div>
                </div>
                <div className={`p-3 rounded-xl border ${ahpResult.is_consistent ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                  <p className="font-semibold">{ahpResult.is_consistent ? 'Konsisten (CR < 0.1)' : 'Tidak Konsisten (CR >= 0.1)'}</p>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Bobot Sub-Kriteria</h3>
                <div className="table-container">
                  <table className="w-full">
                    <thead>
                      <tr className="table-header">
                        <th className="px-5 py-3 text-left">Sub-Kriteria</th>
                        <th className="px-5 py-3 text-center">Bobot</th>
                        <th className="px-5 py-3 text-center">Persentase</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ahpResult.sub_criteria_names?.map((item, index) => (
                        <tr key={item.id} className="table-row">
                          <td className="px-5 py-3 text-white">{item.code} - {item.name}</td>
                          <td className="px-5 py-3 text-center text-dark-200">{ahpResult.priority_vector?.[index]?.toFixed(4)}</td>
                          <td className="px-5 py-3 text-center">
                            <div className="flex items-center gap-2 justify-center">
                              <div className="w-24 h-2 bg-dark-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full" style={{ width: `${(ahpResult.priority_vector?.[index] || 0) * 100}%` }} />
                              </div>
                              <span className="text-sm text-dark-300">{((ahpResult.priority_vector?.[index] || 0) * 100).toFixed(2)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Sub-Kriteria' : 'Tambah Sub-Kriteria'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Kriteria Induk</label>
            <select value={form.criteria_id} onChange={(e) => setForm({ ...form, criteria_id: parseInt(e.target.value) })} className="input-field" required>
              {criteria.map((item) => (
                <option key={item.id} value={item.id}>{item.code} - {item.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Kode</label>
            <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="input-field" placeholder="SC1" required id="subcriteria-code" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Nama Sub-Kriteria</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Contoh: Visi dan Misi" required id="subcriteria-name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Deskripsi</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={3} placeholder="Deskripsi sub-kriteria..." id="subcriteria-description" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Urutan</label>
            <input type="number" value={form.order_index} onChange={(e) => setForm({ ...form, order_index: parseInt(e.target.value) || 0 })} className="input-field" min={0} id="subcriteria-order" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Batal</button>
            <button type="submit" disabled={saving} className="btn-primary" id="subcriteria-submit">
              {saving ? 'Menyimpan...' : editItem ? 'Perbarui' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
