import { useState, useEffect } from 'react';
import { criteriaApi } from '../services/api';
import { useApp } from '../context/AppContext';
import Modal from '../components/ui/Modal';
import Loading from '../components/ui/Loading';

export default function CriteriaPage() {
  const { showNotification } = useApp();
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', description: '', order_index: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await criteriaApi.getAll();
      setCriteria(res.data);
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: '', code: '', description: '', order_index: criteria.length + 1 });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name, code: item.code, description: item.description || '', order_index: item.order_index });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) {
        await criteriaApi.update(editItem.id, form);
        showNotification('Kriteria berhasil diperbarui');
      } else {
        await criteriaApi.create(form);
        showNotification('Kriteria berhasil ditambahkan');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Hapus kriteria "${item.name}"?`)) return;
    try {
      await criteriaApi.delete(item.id);
      showNotification('Kriteria berhasil dihapus');
      loadData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Manajemen Kriteria</h1>
          <p className="text-dark-400 mt-1">Kelola kriteria penilaian LAM Teknik</p>
        </div>
        <button onClick={openCreate} className="btn-primary" id="add-criteria">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Kriteria
          </span>
        </button>
      </div>

      <div className="table-container">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="px-5 py-3 text-left">No</th>
              <th className="px-5 py-3 text-left">Kode</th>
              <th className="px-5 py-3 text-left">Nama Kriteria</th>
              <th className="px-5 py-3 text-left">Deskripsi</th>
              <th className="px-5 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {criteria.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-dark-400">Belum ada data kriteria</td></tr>
            ) : (
              criteria.map((item, i) => (
                <tr key={item.id} className="table-row">
                  <td className="px-5 py-3 text-dark-300">{i + 1}</td>
                  <td className="px-5 py-3">
                    <span className="px-2.5 py-1 rounded-lg bg-primary-500/10 text-primary-400 text-xs font-semibold">{item.code}</span>
                  </td>
                  <td className="px-5 py-3 text-white font-medium">{item.name}</td>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Kriteria' : 'Tambah Kriteria'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Kode</label>
            <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="input-field" placeholder="C1" required id="criteria-code" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Nama Kriteria</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Tata Pamong" required id="criteria-name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Deskripsi</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={3} placeholder="Deskripsi kriteria..." id="criteria-description" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Urutan</label>
            <input type="number" value={form.order_index} onChange={(e) => setForm({ ...form, order_index: parseInt(e.target.value) || 0 })} className="input-field" min={0} id="criteria-order" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Batal</button>
            <button type="submit" disabled={saving} className="btn-primary" id="criteria-submit">
              {saving ? 'Menyimpan...' : editItem ? 'Perbarui' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
