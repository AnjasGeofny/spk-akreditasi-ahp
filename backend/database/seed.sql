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

-- Seed Alternatives (14 Program Studi Teknik ITK — sesuai urutan kolom AHP_FIX_KEL_4)
-- A1=Teknik Mesin, A2=Teknik Industri, A3=Rekayasa Logistik,
-- A4=Teknologi Material & Metalurgi, A5=Teknik Kimia, A6=Rekayasa Keselamatan,
-- A7=Teknik Perkapalan, A8=Teknik Kelautan, A9=Teknik Lingkungan,
-- A10=Teknik Sipil, A11=Teknik Elektro, A12=Teknik Biomedis,
-- A13=Teknologi Transportasi Laut, A14=Teknik Sistem Perkapalan

-- Reset alternatives
DELETE FROM alternatives;

INSERT INTO alternatives (name, code, description) VALUES
('Teknik Mesin',                      'A1',  'Program Studi Teknik Mesin'),
('Teknik Industri',                   'A2',  'Program Studi Teknik Industri'),
('Rekayasa Logistik',                 'A3',  'Program Studi Rekayasa Logistik'),
('Teknologi Material dan Metalurgi',  'A4',  'Program Studi Teknologi Material dan Metalurgi'),
('Teknik Kimia',                      'A5',  'Program Studi Teknik Kimia'),
('Rekayasa Keselamatan',              'A6',  'Program Studi Rekayasa Keselamatan'),
('Teknik Perkapalan',                 'A7',  'Program Studi Teknik Perkapalan'),
('Teknik Kelautan',                   'A8',  'Program Studi Teknik Kelautan'),
('Teknik Lingkungan',                 'A9',  'Program Studi Teknik Lingkungan'),
('Teknik Sipil',                      'A10', 'Program Studi Teknik Sipil'),
('Teknik Elektro',                    'A11', 'Program Studi Teknik Elektro'),
('Teknik Biomedis',                   'A12', 'Program Studi Teknik Biomedis'),
('Teknologi Transportasi Laut',       'A13', 'Program Studi Teknologi Transportasi Laut'),
('Teknik Sistem Perkapalan',          'A14', 'Program Studi Teknik Sistem Perkapalan')
ON CONFLICT (code) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description;

