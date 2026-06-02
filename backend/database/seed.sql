-- ============================================
-- SPK Akreditasi AHP - Seed Data
-- ============================================

-- Seed Criteria (7 Kriteria LAM Teknik Baru)
DELETE FROM criteria WHERE code NOT IN ('C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7');

INSERT INTO criteria (name, code, description, order_index) VALUES
('Diferensiasi Misi', 'C1', 'Kriteria diferensiasi misi program studi', 1),
('Akuntabilitas', 'C2', 'Kriteria akuntabilitas program studi', 2),
('Relevansi Pendidikan, Penelitian & PkM', 'C3', 'Kriteria relevansi tridharma perguruan tinggi', 3),
('Sumber Daya Manusia', 'C4', 'Kriteria dosen, tenaga kependidikan dan pendukung akademik', 4),
('Sarana, Prasarana & K3L', 'C5', 'Kriteria sarana, prasarana dan keselamatan, kesehatan, kerja & lingkungan', 5),
('Mahasiswa & Luaran', 'C6', 'Kriteria mahasiswa dan luaran tridharma', 6),
('Sistem Penjaminan Mutu', 'C7', 'Kriteria sistem penjaminan mutu internal dan eksternal', 7)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index;

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
