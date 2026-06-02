-- ============================================
-- SPK Akreditasi AHP - Seed Data
-- ============================================

-- Seed Criteria (8 Kriteria LAM Teknik)
INSERT INTO criteria (name, code, description, order_index) VALUES
('Tata Pamong', 'C1', 'Tata pamong, tata kelola, dan kerjasama program studi', 1),
('Mahasiswa', 'C2', 'Profil mahasiswa, rekrutmen, seleksi, dan layanan kemahasiswaan', 2),
('Sumber Daya Manusia', 'C3', 'Profil dosen dan tenaga kependidikan', 3),
('Keuangan dan Sarana Prasarana', 'C4', 'Keuangan, sarana, dan prasarana program studi', 4),
('Pendidikan', 'C5', 'Kurikulum, pembelajaran, dan suasana akademik', 5),
('Penelitian', 'C6', 'Penelitian dosen dan mahasiswa', 6),
('Pengabdian kepada Masyarakat', 'C7', 'Pengabdian kepada masyarakat oleh dosen dan mahasiswa', 7),
('Luaran dan Capaian', 'C8', 'Luaran dan capaian tridharma perguruan tinggi', 8)
ON CONFLICT (code) DO NOTHING;

-- Seed Alternatives (Program Studi Teknik ITK)
INSERT INTO alternatives (name, code, description) VALUES
('Teknik Mesin', 'A1', 'Program Studi Teknik Mesin'),
('Teknik Industri', 'A2', 'Program Studi Teknik Industri'),
('Rekayasa Logistik', 'A3', 'Program Studi Rekayasa Logistik'),
('Teknologi Material dan Metalurgi', 'A4', 'Program Studi Teknologi Material dan Metalurgi'),
('Teknik Kimia', 'A5', 'Program Studi Teknik Kimia'),
('Rekayasa Keselamatan', 'A6', 'Program Studi Rekayasa Keselamatan'),
('Teknik Perkapalan', 'A7', 'Program Studi Teknik Perkapalan'),
('Teknik Kelautan', 'A8', 'Program Studi Teknik Kelautan'),
('Teknik Lingkungan', 'A9', 'Program Studi Teknik Lingkungan'),
('Teknik Sipil', 'A10', 'Program Studi Teknik Sipil'),
('Teknik Biomedis', 'A11', 'Program Studi Teknik Biomedis'),
('Teknologi Transportasi Laut', 'A12', 'Program Studi Teknologi Transportasi Laut'),
('Teknik Sistem Perkapalan', 'A13', 'Program Studi Teknik Sistem Perkapalan')
ON CONFLICT (code) DO NOTHING;
