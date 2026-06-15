import { useState, useEffect } from 'react';
import { ahpApi, accreditationApi, criteriaApi, alternativesApi } from '../services/api';
import { useApp } from '../context/AppContext';
import { sortByCode } from '../utils/formatters';
import Loading from '../components/ui/Loading';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function ReportPage() {
  const { showNotification } = useApp();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [ahpResults, setAhpResults] = useState([]);
  const [accResults, setAccResults] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [alternatives, setAlternatives] = useState([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [ahpRes, accRes, critRes, altRes] = await Promise.all([
        ahpApi.getResults(),
        accreditationApi.getLatest(),
        criteriaApi.getAll(),
        alternativesApi.getAll(),
      ]);
      setAhpResults(ahpRes.data);
      setAccResults(accRes.data);
      setCriteria(critRes.data);
      setAlternatives(sortByCode(altRes.data));
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    setGenerating(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 20;

      // Title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('LAPORAN HASIL PENILAIAN', pageWidth / 2, y, { align: 'center' });
      y += 8;
      doc.setFontSize(12);
      doc.text('KESIAPAN AKREDITASI PROGRAM STUDI', pageWidth / 2, y, { align: 'center' });
      y += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Institut Teknologi Kalimantan', pageWidth / 2, y, { align: 'center' });
      y += 6;
      doc.text(`Metode: Analytic Hierarchy Process (AHP)`, pageWidth / 2, y, { align: 'center' });
      y += 6;
      doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, y, { align: 'center' });
      y += 12;

      // Line
      doc.setLineWidth(0.5);
      doc.line(14, y, pageWidth - 14, y);
      y += 10;

      // 1. Kriteria
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Daftar Kriteria', 14, y);
      y += 8;

      doc.autoTable({
        startY: y,
        head: [['No', 'Kode', 'Nama Kriteria']],
        body: criteria.map((c, i) => [i + 1, c.code, c.name]),
        theme: 'grid',
        headStyles: { fillColor: [99, 102, 241] },
        styles: { fontSize: 9 },
      });
      y = doc.lastAutoTable.finalY + 10;

      // 2. Alternatif
      if (alternatives.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('2. Daftar Alternatif (Program Studi)', 14, y);
        y += 8;

        doc.autoTable({
          startY: y,
          head: [['No', 'Kode', 'Nama Program Studi']],
          body: alternatives.map((a, i) => [i + 1, a.code, a.name]),
          theme: 'grid',
          headStyles: { fillColor: [99, 102, 241] },
          styles: { fontSize: 9 },
        });
        y = doc.lastAutoTable.finalY + 10;
      }

      // 3. AHP Results - Criteria weights
      const criteriaAhp = ahpResults.find((r) => r.type === 'criteria');
      if (criteriaAhp) {
        if (y > 240) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(`${alternatives.length > 0 ? '3' : '2'}. Bobot Kriteria AHP`, 14, y);
        y += 8;

        const weightRows = Object.entries(criteriaAhp.weights || {}).map(([id, w]) => {
          const c = criteria.find((cr) => cr.id === parseInt(id));
          return [c?.code || id, c?.name || '-', w.toFixed(4), `${(w * 100).toFixed(2)}%`];
        });

        doc.autoTable({
          startY: y,
          head: [['Kode', 'Kriteria', 'Bobot', 'Persentase']],
          body: weightRows,
          theme: 'grid',
          headStyles: { fillColor: [99, 102, 241] },
          styles: { fontSize: 9 },
        });
        y = doc.lastAutoTable.finalY + 8;

        // Consistency info
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Lambda Max: ${criteriaAhp.lambda_max?.toFixed(4)} | CI: ${criteriaAhp.ci?.toFixed(4)} | CR: ${criteriaAhp.cr?.toFixed(4)} | Status: ${criteriaAhp.is_consistent ? 'Konsisten' : 'Tidak Konsisten'}`, 14, y);
        y += 10;
      }

      // 4. Accreditation Results
      if (accResults.length > 0) {
        if (y > 220) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        const sectionNum = alternatives.length > 0 ? '4' : '3';
        doc.text(`${sectionNum}. Hasil Penilaian Kesiapan Akreditasi`, 14, y);
        y += 8;

        const hasAlt = accResults.some((r) => r.alternative_id);
        const accHead = hasAlt
          ? [['Rank', 'Program Studi', 'Nilai Akhir', 'Persentase', 'Status']]
          : [['Keterangan', 'Nilai Akhir', 'Persentase', 'Status']];
        const accBody = accResults.map((r, i) =>
          hasAlt
            ? [i + 1, r.alternative_name || '-', r.final_score?.toFixed(2), `${r.readiness_percentage?.toFixed(2)}%`, r.status]
            : ['Keseluruhan', r.final_score?.toFixed(2), `${r.readiness_percentage?.toFixed(2)}%`, r.status]
        );

        doc.autoTable({
          startY: y,
          head: accHead,
          body: accBody,
          theme: 'grid',
          headStyles: { fillColor: [99, 102, 241] },
          styles: { fontSize: 9 },
        });
        y = doc.lastAutoTable.finalY + 10;
      }

      // Status legend
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Kategori Status Kesiapan:', 14, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('85-100: Sangat Siap | 70-84: Siap | 55-69: Cukup Siap | <55: Belum Siap', 14, y);

      // Footer
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`SPK Akreditasi AHP — Institut Teknologi Kalimantan | Halaman ${i} dari ${totalPages}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      }

      doc.save('Laporan_Akreditasi_AHP.pdf');
      showNotification('Laporan PDF berhasil digenerate');
    } catch (err) {
      showNotification('Gagal generate PDF: ' + err.message, 'error');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Laporan</h1>
          <p className="text-dark-400 mt-1">Generate laporan PDF hasil penilaian</p>
        </div>
        <button onClick={generatePDF} disabled={generating} className="btn-primary" id="generate-pdf">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {generating ? 'Generating...' : 'Download PDF'}
          </span>
        </button>
      </div>

      {/* Preview */}
      <div className="glass-card p-6 space-y-6">
        <div className="text-center border-b border-dark-700 pb-6">
          <h2 className="text-xl font-bold text-white">Laporan Hasil Penilaian Kesiapan Akreditasi</h2>
          <p className="text-dark-400 mt-1">Institut Teknologi Kalimantan — Metode AHP</p>
          <p className="text-dark-500 text-sm mt-1">
            {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-dark-800/50">
            <p className="text-xs text-dark-400">Jumlah Kriteria</p>
            <p className="text-2xl font-bold text-white mt-1">{criteria.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-dark-800/50">
            <p className="text-xs text-dark-400">Jumlah Alternatif</p>
            <p className="text-2xl font-bold text-white mt-1">{alternatives.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-dark-800/50">
            <p className="text-xs text-dark-400">Hasil AHP</p>
            <p className="text-2xl font-bold text-white mt-1">{ahpResults.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-dark-800/50">
            <p className="text-xs text-dark-400">Hasil Akreditasi</p>
            <p className="text-2xl font-bold text-white mt-1">{accResults.length}</p>
          </div>
        </div>

        {/* Criteria table preview */}
        <div>
          <h3 className="text-sm font-semibold text-dark-300 mb-2">Kriteria Penilaian</h3>
          <div className="table-container">
            <table className="w-full">
              <thead><tr className="table-header"><th className="px-4 py-2 text-left">Kode</th><th className="px-4 py-2 text-left">Nama</th></tr></thead>
              <tbody>
                {criteria.map((c) => (
                  <tr key={c.id} className="table-row">
                    <td className="px-4 py-2 text-primary-400 font-medium">{c.code}</td>
                    <td className="px-4 py-2 text-white">{c.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results preview */}
        {accResults.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-dark-300 mb-2">Hasil Kesiapan</h3>
            <div className="table-container">
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="px-4 py-2 text-left">Keterangan</th>
                    <th className="px-4 py-2 text-center">Nilai</th>
                    <th className="px-4 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {accResults.map((r) => (
                    <tr key={r.id} className="table-row">
                      <td className="px-4 py-2 text-white">{r.alternative_name || 'Keseluruhan'}</td>
                      <td className="px-4 py-2 text-center text-white font-semibold">{r.readiness_percentage?.toFixed(2)}%</td>
                      <td className="px-4 py-2 text-center">
                        <span className={`badge ${r.status === 'Sangat Siap' ? 'badge-success' : r.status === 'Siap' ? 'badge-info' : r.status === 'Cukup Siap' ? 'badge-warning' : 'badge-danger'}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
