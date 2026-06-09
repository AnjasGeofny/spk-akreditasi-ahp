-- ============================================
-- SPK Akreditasi AHP - Seed Matriks Perbandingan Berpasangan
-- ============================================

-- 1. Hapus nilai perbandingan lama agar bersih
DELETE FROM sub_criteria_comparisons;
DELETE FROM pairwise_comparisons;

-- 2. Seed Perbandingan Kriteria Utama (C1 - C5)
-- Nilai yang di-input adalah bagian diagonal atas. Backend akan menghitung kebalikannya (1/nilai) secara otomatis.
INSERT INTO pairwise_comparisons (criteria_row_id, criteria_col_id, value) VALUES
((SELECT id FROM criteria WHERE code = 'C1'), (SELECT id FROM criteria WHERE code = 'C2'), 0.333),
((SELECT id FROM criteria WHERE code = 'C1'), (SELECT id FROM criteria WHERE code = 'C3'), 0.143),
((SELECT id FROM criteria WHERE code = 'C1'), (SELECT id FROM criteria WHERE code = 'C4'), 0.143),
((SELECT id FROM criteria WHERE code = 'C1'), (SELECT id FROM criteria WHERE code = 'C5'), 0.125),
((SELECT id FROM criteria WHERE code = 'C2'), (SELECT id FROM criteria WHERE code = 'C3'), 0.500),
((SELECT id FROM criteria WHERE code = 'C2'), (SELECT id FROM criteria WHERE code = 'C4'), 0.500),
((SELECT id FROM criteria WHERE code = 'C2'), (SELECT id FROM criteria WHERE code = 'C5'), 0.333),
((SELECT id FROM criteria WHERE code = 'C3'), (SELECT id FROM criteria WHERE code = 'C4'), 1.000),
((SELECT id FROM criteria WHERE code = 'C3'), (SELECT id FROM criteria WHERE code = 'C5'), 1.000),
((SELECT id FROM criteria WHERE code = 'C4'), (SELECT id FROM criteria WHERE code = 'C5'), 1.000);

-- 3. Seed Perbandingan Sub-Kriteria per Kriteria

-- 🔶 Kriteria 1: Diferensiasi Misi (SC1.1 - SC1.3)
INSERT INTO sub_criteria_comparisons (criteria_id, sub_criteria_row_id, sub_criteria_col_id, value) VALUES
((SELECT id FROM criteria WHERE code = 'C1'), (SELECT id FROM sub_criteria WHERE code = 'SC1.1'), (SELECT id FROM sub_criteria WHERE code = 'SC1.2'), 2.000),
((SELECT id FROM criteria WHERE code = 'C1'), (SELECT id FROM sub_criteria WHERE code = 'SC1.1'), (SELECT id FROM sub_criteria WHERE code = 'SC1.3'), 5.000),
((SELECT id FROM criteria WHERE code = 'C1'), (SELECT id FROM sub_criteria WHERE code = 'SC1.2'), (SELECT id FROM sub_criteria WHERE code = 'SC1.3'), 3.000);

-- 🔶 Kriteria 2: Akuntabilitas (SC2.1 - SC2.4)
INSERT INTO sub_criteria_comparisons (criteria_id, sub_criteria_row_id, sub_criteria_col_id, value) VALUES
((SELECT id FROM criteria WHERE code = 'C2'), (SELECT id FROM sub_criteria WHERE code = 'SC2.1'), (SELECT id FROM sub_criteria WHERE code = 'SC2.2'), 1.000),
((SELECT id FROM criteria WHERE code = 'C2'), (SELECT id FROM sub_criteria WHERE code = 'SC2.1'), (SELECT id FROM sub_criteria WHERE code = 'SC2.3'), 1.000),
((SELECT id FROM criteria WHERE code = 'C2'), (SELECT id FROM sub_criteria WHERE code = 'SC2.1'), (SELECT id FROM sub_criteria WHERE code = 'SC2.4'), 2.000),
((SELECT id FROM criteria WHERE code = 'C2'), (SELECT id FROM sub_criteria WHERE code = 'SC2.2'), (SELECT id FROM sub_criteria WHERE code = 'SC2.3'), 1.000),
((SELECT id FROM criteria WHERE code = 'C2'), (SELECT id FROM sub_criteria WHERE code = 'SC2.2'), (SELECT id FROM sub_criteria WHERE code = 'SC2.4'), 2.000),
((SELECT id FROM criteria WHERE code = 'C2'), (SELECT id FROM sub_criteria WHERE code = 'SC2.3'), (SELECT id FROM sub_criteria WHERE code = 'SC2.4'), 1.000);

-- 🔶 Kriteria 3: Relevansi Pendidikan (SC3.1 - SC3.5)
INSERT INTO sub_criteria_comparisons (criteria_id, sub_criteria_row_id, sub_criteria_col_id, value) VALUES
((SELECT id FROM criteria WHERE code = 'C3'), (SELECT id FROM sub_criteria WHERE code = 'SC3.1'), (SELECT id FROM sub_criteria WHERE code = 'SC3.2'), 2.000),
((SELECT id FROM criteria WHERE code = 'C3'), (SELECT id FROM sub_criteria WHERE code = 'SC3.1'), (SELECT id FROM sub_criteria WHERE code = 'SC3.3'), 3.000),
((SELECT id FROM criteria WHERE code = 'C3'), (SELECT id FROM sub_criteria WHERE code = 'SC3.1'), (SELECT id FROM sub_criteria WHERE code = 'SC3.4'), 3.000),
((SELECT id FROM criteria WHERE code = 'C3'), (SELECT id FROM sub_criteria WHERE code = 'SC3.1'), (SELECT id FROM sub_criteria WHERE code = 'SC3.5'), 3.000),
((SELECT id FROM criteria WHERE code = 'C3'), (SELECT id FROM sub_criteria WHERE code = 'SC3.2'), (SELECT id FROM sub_criteria WHERE code = 'SC3.3'), 2.000),
((SELECT id FROM criteria WHERE code = 'C3'), (SELECT id FROM sub_criteria WHERE code = 'SC3.2'), (SELECT id FROM sub_criteria WHERE code = 'SC3.4'), 2.000),
((SELECT id FROM criteria WHERE code = 'C3'), (SELECT id FROM sub_criteria WHERE code = 'SC3.2'), (SELECT id FROM sub_criteria WHERE code = 'SC3.5'), 3.000),
((SELECT id FROM criteria WHERE code = 'C3'), (SELECT id FROM sub_criteria WHERE code = 'SC3.3'), (SELECT id FROM sub_criteria WHERE code = 'SC3.4'), 1.000),
((SELECT id FROM criteria WHERE code = 'C3'), (SELECT id FROM sub_criteria WHERE code = 'SC3.3'), (SELECT id FROM sub_criteria WHERE code = 'SC3.5'), 2.000),
((SELECT id FROM criteria WHERE code = 'C3'), (SELECT id FROM sub_criteria WHERE code = 'SC3.4'), (SELECT id FROM sub_criteria WHERE code = 'SC3.5'), 2.000);

-- 🔶 Kriteria 4: Sumber Daya Manusia (SC4.1 - SC4.4)
INSERT INTO sub_criteria_comparisons (criteria_id, sub_criteria_row_id, sub_criteria_col_id, value) VALUES
((SELECT id FROM criteria WHERE code = 'C4'), (SELECT id FROM sub_criteria WHERE code = 'SC4.1'), (SELECT id FROM sub_criteria WHERE code = 'SC4.2'), 2.000),
((SELECT id FROM criteria WHERE code = 'C4'), (SELECT id FROM sub_criteria WHERE code = 'SC4.1'), (SELECT id FROM sub_criteria WHERE code = 'SC4.3'), 4.000),
((SELECT id FROM criteria WHERE code = 'C4'), (SELECT id FROM sub_criteria WHERE code = 'SC4.1'), (SELECT id FROM sub_criteria WHERE code = 'SC4.4'), 9.000),
((SELECT id FROM criteria WHERE code = 'C4'), (SELECT id FROM sub_criteria WHERE code = 'SC4.2'), (SELECT id FROM sub_criteria WHERE code = 'SC4.3'), 2.000),
((SELECT id FROM criteria WHERE code = 'C4'), (SELECT id FROM sub_criteria WHERE code = 'SC4.2'), (SELECT id FROM sub_criteria WHERE code = 'SC4.4'), 8.000),
((SELECT id FROM criteria WHERE code = 'C4'), (SELECT id FROM sub_criteria WHERE code = 'SC4.3'), (SELECT id FROM sub_criteria WHERE code = 'SC4.4'), 7.000);

-- 🔶 Kriteria 5: Mahasiswa & Luaran (SC5.1 - SC5.5)
INSERT INTO sub_criteria_comparisons (criteria_id, sub_criteria_row_id, sub_criteria_col_id, value) VALUES
((SELECT id FROM criteria WHERE code = 'C5'), (SELECT id FROM sub_criteria WHERE code = 'SC5.1'), (SELECT id FROM sub_criteria WHERE code = 'SC5.2'), 2.000),
((SELECT id FROM criteria WHERE code = 'C5'), (SELECT id FROM sub_criteria WHERE code = 'SC5.1'), (SELECT id FROM sub_criteria WHERE code = 'SC5.3'), 2.000),
((SELECT id FROM criteria WHERE code = 'C5'), (SELECT id FROM sub_criteria WHERE code = 'SC5.1'), (SELECT id FROM sub_criteria WHERE code = 'SC5.4'), 2.000),
((SELECT id FROM criteria WHERE code = 'C5'), (SELECT id FROM sub_criteria WHERE code = 'SC5.1'), (SELECT id FROM sub_criteria WHERE code = 'SC5.5'), 2.000),
((SELECT id FROM criteria WHERE code = 'C5'), (SELECT id FROM sub_criteria WHERE code = 'SC5.2'), (SELECT id FROM sub_criteria WHERE code = 'SC5.3'), 2.000),
((SELECT id FROM criteria WHERE code = 'C5'), (SELECT id FROM sub_criteria WHERE code = 'SC5.2'), (SELECT id FROM sub_criteria WHERE code = 'SC5.4'), 2.000),
((SELECT id FROM criteria WHERE code = 'C5'), (SELECT id FROM sub_criteria WHERE code = 'SC5.2'), (SELECT id FROM sub_criteria WHERE code = 'SC5.5'), 2.000),
((SELECT id FROM criteria WHERE code = 'C5'), (SELECT id FROM sub_criteria WHERE code = 'SC5.3'), (SELECT id FROM sub_criteria WHERE code = 'SC5.4'), 1.000),
((SELECT id FROM criteria WHERE code = 'C5'), (SELECT id FROM sub_criteria WHERE code = 'SC5.3'), (SELECT id FROM sub_criteria WHERE code = 'SC5.5'), 1.000),
((SELECT id FROM criteria WHERE code = 'C5'), (SELECT id FROM sub_criteria WHERE code = 'SC5.4'), (SELECT id FROM sub_criteria WHERE code = 'SC5.5'), 1.000);
