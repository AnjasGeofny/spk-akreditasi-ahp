-- ============================================
-- SPK Akreditasi AHP - Seed Kriteria & Sub-Kriteria Baru
-- ============================================

-- 1. Insert atau Update Kriteria Utama (C1 - C5)
INSERT INTO criteria (name, code, description, order_index) VALUES
('Diferensiasi Misi', 'C1', 'Kriteria diferensiasi misi program studi', 1),
('Akuntabilitas', 'C2', 'Kriteria akuntabilitas program studi', 2),
('Relevansi Pendidikan', 'C3', 'Kriteria relevansi pendidikan program studi', 3),
('Sumber Daya Manusia', 'C4', 'Kriteria dosen, tenaga kependidikan dan pendukung akademik', 4),
('Mahasiswa & Luaran', 'C5', 'Kriteria mahasiswa dan luaran tridharma', 5)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index;

-- Hapus kriteria lama lain (seperti C6 atau C7 dari data bawaan awal) jika ada
DELETE FROM criteria WHERE code NOT IN ('C1', 'C2', 'C3', 'C4', 'C5');

-- 2. Insert atau Update Sub-Kriteria (SC1.1 - SC5.5)
INSERT INTO sub_criteria (criteria_id, code, name, description, order_index) VALUES
-- Kriteria 1 (C1)
((SELECT id FROM criteria WHERE code = 'C1'), 'SC1.1', 'Kekhasan VMTS', 'Kekhasan VMTS', 1),
((SELECT id FROM criteria WHERE code = 'C1'), 'SC1.2', 'Mekanisme Penyusunan VMTS', 'Mekanisme Penyusunan VMTS', 2),
((SELECT id FROM criteria WHERE code = 'C1'), 'SC1.3', 'Tingkat Pemahaman & Pencapaian VMTS', 'Tingkat Pemahaman & Pencapaian VMTS', 3),

-- Kriteria 2 (C2)
((SELECT id FROM criteria WHERE code = 'C2'), 'SC2.1', 'Sistem Tata Pamong', 'Sistem Tata Pamong', 1),
((SELECT id FROM criteria WHERE code = 'C2'), 'SC2.2', 'Kerjasama', 'Kerjasama', 2),
((SELECT id FROM criteria WHERE code = 'C2'), 'SC2.3', 'Biaya', 'Biaya', 3),
((SELECT id FROM criteria WHERE code = 'C2'), 'SC2.4', 'Pelaksanaan Kerjasama', 'Pelaksanaan Kerjasama', 4),

-- Kriteria 3 (C3)
((SELECT id FROM criteria WHERE code = 'C3'), 'SC3.1', 'Integrasi Penelitian & PkM dalam Pembelajaran', 'Integrasi Penelitian & PkM dalam Pembelajaran', 1),
((SELECT id FROM criteria WHERE code = 'C3'), 'SC3.2', 'Suasana Akademik', 'Suasana Akademik', 2),
((SELECT id FROM criteria WHERE code = 'C3'), 'SC3.3', 'Penelitian', 'Penelitian', 3),
((SELECT id FROM criteria WHERE code = 'C3'), 'SC3.4', 'Rencana Proses Pembelajaran (RPS)', 'Rencana Proses Pembelajaran (RPS)', 4),
((SELECT id FROM criteria WHERE code = 'C3'), 'SC3.5', 'Profil Lulusan', 'Profil Lulusan', 5),

-- Kriteria 4 (C4)
((SELECT id FROM criteria WHERE code = 'C4'), 'SC4.1', 'Kinerja DTPS', 'Kinerja DTPS', 1),
((SELECT id FROM criteria WHERE code = 'C4'), 'SC4.2', 'Profil Dosen', 'Profil Dosen', 2),
((SELECT id FROM criteria WHERE code = 'C4'), 'SC4.3', 'Tenaga Kependidikan', 'Tenaga Kependidikan', 3),
((SELECT id FROM criteria WHERE code = 'C4'), 'SC4.4', 'Beban Kerja DTPS', 'Beban Kerja DTPS', 4),

-- Kriteria 5 (C5)
((SELECT id FROM criteria WHERE code = 'C5'), 'SC5.1', 'Prestasi Akademik & Non-Akademik Mahasiswa', 'Prestasi Akademik & Non-Akademik Mahasiswa', 1),
((SELECT id FROM criteria WHERE code = 'C5'), 'SC5.2', 'Tracer Study', 'Tracer Study', 2),
((SELECT id FROM criteria WHERE code = 'C5'), 'SC5.3', 'Waktu Tunggu', 'Waktu Tunggu', 3),
((SELECT id FROM criteria WHERE code = 'C5'), 'SC5.4', 'Kesesuaian Bidang Kerja', 'Kesesuaian Bidang Kerja', 4),
((SELECT id FROM criteria WHERE code = 'C5'), 'SC5.5', 'Tingkat dan Ukuran Tempat Kerja Lulusan', 'Tingkat dan Ukuran Tempat Kerja Lulusan', 5)
ON CONFLICT (criteria_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index;
