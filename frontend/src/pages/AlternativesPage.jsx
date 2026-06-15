import { useState, useEffect } from 'react';
import { alternativesApi } from '../services/api';
import { sortByCode } from '../utils/formatters';
import { useApp } from '../context/AppContext';
import Modal from '../components/ui/Modal';
import Loading from '../components/ui/Loading';

export default function AlternativesPage() {
  const { showNotification } = useApp();
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await alternativesApi.getAll();
      setAlternatives(sortByCode(res.data));
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: '', code: '', description: '' });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name, code: item.code, description: item.description || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) {
        await alternativesApi.update(editItem.id, form);
        showNotification('Alternatif berhasil diperbarui');
      } else {
        await alternativesApi.create(form);
        showNotification('Alternatif berhasil ditambahkan');
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
    if (!confirm(`Hapus alternatif "${item.name}"?`)) return;
    try {
      await alternativesApi.delete(item.id);
      showNotification('Alternatif berhasil dihapus');
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
          <h1 className="text-2xl font-bold text-white">Manajemen Alternatif</h1>
          <p className="text-dark-400 mt-1">Kelola alternatif program studi</p>
        </div>
        <button onClick={openCreate} className="btn-primary" id="add-alternative">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Alternatif
          </span>
        </button>
      </div>

      <div className="table-container">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="px-5 py-3 text-left">No</th>
              <th className="px-5 py-3 text-left">Kode</th>
              <th className="px-5 py-3 text-left">Nama Program Studi</th>
              <th className="px-5 py-3 text-left">Deskripsi</th>
              <th className="px-5 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {alternatives.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-dark-400">Belum ada data alternatif</td></tr>
            ) : (
              alternatives.map((item, i) => (
                <tr key={item.id} className="table-row">
                  <td className="px-5 py-3 text-dark-300">{i + 1}</td>
                  <td className="px-5 py-3">
                    <span className="px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-400 text-xs font-semibold">{item.code}</span>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Alternatif' : 'Tambah Alternatif'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Kode</label>
            <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="input-field" placeholder="A1" required id="alt-code" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Nama Program Studi</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Teknik Informatika" required id="alt-name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Deskripsi</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={3} placeholder="Deskripsi program studi..." id="alt-description" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Batal</button>
            <button type="submit" disabled={saving} className="btn-primary" id="alt-submit">
              {saving ? 'Menyimpan...' : editItem ? 'Perbarui' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
