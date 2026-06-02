export const SAATY_SCALE = [
  { value: 1, label: '1 - Sama Penting' },
  { value: 2, label: '2 - Mendekati Sedikit Lebih Penting' },
  { value: 3, label: '3 - Sedikit Lebih Penting' },
  { value: 4, label: '4 - Mendekati Lebih Penting' },
  { value: 5, label: '5 - Lebih Penting' },
  { value: 6, label: '6 - Mendekati Sangat Penting' },
  { value: 7, label: '7 - Sangat Penting' },
  { value: 8, label: '8 - Mendekati Mutlak Lebih Penting' },
  { value: 9, label: '9 - Mutlak Lebih Penting' },
];

export const READINESS_STATUS = {
  'Sangat Siap': { color: 'emerald', bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'Siap': { color: 'blue', bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  'Cukup Siap': { color: 'amber', bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  'Belum Siap': { color: 'red', bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
};

export const CHART_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6',
];

export const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'dashboard' },
  { path: '/criteria', label: 'Kriteria', icon: 'criteria' },
  { path: '/alternatives', label: 'Alternatif', icon: 'alternatives' },
  { path: '/pairwise', label: 'Perbandingan Kriteria', icon: 'pairwise' },
  { path: '/alt-comparison', label: 'Perbandingan Alternatif', icon: 'altComparison' },
  { path: '/assessment', label: 'Penilaian', icon: 'assessment' },
  { path: '/ahp-results', label: 'Hasil AHP', icon: 'ahp' },
  { path: '/accreditation', label: 'Hasil Akreditasi', icon: 'accreditation' },
  { path: '/report', label: 'Laporan', icon: 'report' },
];
