const { validationResult, body, param } = require('express-validator');

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error('Validasi gagal');
    err.type = 'validation';
    err.errors = errors.array().map((e) => e.msg);
    return next(err);
  }
  next();
};

/**
 * Validation rules for criteria
 */
const criteriaRules = [
  body('name').trim().notEmpty().withMessage('Nama kriteria wajib diisi'),
  body('code').trim().notEmpty().withMessage('Kode kriteria wajib diisi'),
  body('description').optional().trim(),
  body('order_index').optional().isInt({ min: 0 }).withMessage('Order index harus bilangan bulat positif'),
];

/**
 * Validation rules for sub criteria
 */
const subCriteriaRules = [
  body('criteria_id').isInt({ min: 1 }).withMessage('ID kriteria tidak valid'),
  body('name').trim().notEmpty().withMessage('Nama sub-kriteria wajib diisi'),
  body('code').trim().notEmpty().withMessage('Kode sub-kriteria wajib diisi'),
  body('description').optional().trim(),
  body('order_index').optional().isInt({ min: 0 }).withMessage('Order index harus bilangan bulat positif'),
];

/**
 * Validation rules for alternatives
 */
const alternativeRules = [
  body('name').trim().notEmpty().withMessage('Nama alternatif wajib diisi'),
  body('code').trim().notEmpty().withMessage('Kode alternatif wajib diisi'),
  body('description').optional().trim(),
];

/**
 * Validation rules for pairwise comparisons
 */
const pairwiseRules = [
  body('comparisons').isArray({ min: 1 }).withMessage('Data perbandingan wajib diisi'),
  body('comparisons.*.criteria_row_id').isInt({ min: 1 }).withMessage('ID kriteria baris tidak valid'),
  body('comparisons.*.criteria_col_id').isInt({ min: 1 }).withMessage('ID kriteria kolom tidak valid'),
  body('comparisons.*.value').isFloat({ min: 0.111, max: 9 }).withMessage('Nilai perbandingan harus antara 1/9 sampai 9'),
];

/**
 * Validation rules for alternative comparisons
 */
const alternativeComparisonRules = [
  param('criteriaId').isInt({ min: 1 }).withMessage('ID kriteria tidak valid'),
  body('comparisons').isArray({ min: 1 }).withMessage('Data perbandingan wajib diisi'),
  body('comparisons.*.alternative_row_id').isInt({ min: 1 }).withMessage('ID alternatif baris tidak valid'),
  body('comparisons.*.alternative_col_id').isInt({ min: 1 }).withMessage('ID alternatif kolom tidak valid'),
  body('comparisons.*.value').isFloat({ min: 0.111, max: 9 }).withMessage('Nilai perbandingan harus antara 1/9 sampai 9'),
];

/**
 * Validation rules for sub criteria comparisons
 */
const subCriteriaComparisonRules = [
  param('criteriaId').isInt({ min: 1 }).withMessage('ID kriteria tidak valid'),
  body('comparisons').isArray({ min: 1 }).withMessage('Data perbandingan wajib diisi'),
  body('comparisons.*.sub_criteria_row_id').isInt({ min: 1 }).withMessage('ID sub-kriteria baris tidak valid'),
  body('comparisons.*.sub_criteria_col_id').isInt({ min: 1 }).withMessage('ID sub-kriteria kolom tidak valid'),
  body('comparisons.*.value').isFloat({ min: 0.111, max: 9 }).withMessage('Nilai perbandingan harus antara 1/9 sampai 9'),
];

/**
 * Validation rules for assessment scores
 */
const assessmentRules = [
  body('scores').isArray({ min: 1 }).withMessage('Data skor wajib diisi'),
  body('scores.*.criteria_id').isInt({ min: 1 }).withMessage('ID kriteria tidak valid'),
  body('scores.*.score').isFloat({ min: 0, max: 100 }).withMessage('Skor harus antara 0 dan 100'),
];

/**
 * ID parameter validation
 */
const idParamRule = [
  param('id').isInt({ min: 1 }).withMessage('ID tidak valid'),
];

module.exports = {
  validate,
  criteriaRules,
  subCriteriaRules,
  alternativeRules,
  pairwiseRules,
  alternativeComparisonRules,
  subCriteriaComparisonRules,
  assessmentRules,
  idParamRule,
};
