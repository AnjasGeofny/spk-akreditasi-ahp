-- ============================================
-- SPK Akreditasi AHP - Seed 14 Alternatif
-- ============================================

-- Insert/update 14 program studi (alternatif)
-- Urutan matriks: A1..A14 sesuai kolom pada matriks perbandingan alternatif
INSERT INTO alternatives (name, code, description) VALUES
('Teknik Mesin',                    'A1',  'Program Studi Teknik Mesin'),
('Teknik Industri',                 'A2',  'Program Studi Teknik Industri'),
('Rekayasa Logistik',               'A3',  'Program Studi Rekayasa Logistik'),
('Teknologi Material dan Metalurgi','A4',  'Program Studi Teknologi Material dan Metalurgi'),
('Teknik Kimia',                    'A5',  'Program Studi Teknik Kimia'),
('Rekayasa Keselamatan',            'A6',  'Program Studi Rekayasa Keselamatan'),
('Teknik Perkapalan',               'A7',  'Program Studi Teknik Perkapalan'),
('Teknik Kelautan',                 'A8',  'Program Studi Teknik Kelautan'),
('Teknik Lingkungan',               'A9',  'Program Studi Teknik Lingkungan'),
('Teknik Sipil',                    'A10', 'Program Studi Teknik Sipil'),
('Teknik Elektro',                  'A11', 'Program Studi Teknik Elektro'),
('Teknik Biomedis',                 'A12', 'Program Studi Teknik Biomedis'),
('Teknologi Transportasi Laut',     'A13', 'Program Studi Teknologi Transportasi Laut'),
('Teknik Sistem Perkapalan',        'A14', 'Program Studi Teknik Sistem Perkapalan')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
