/**
 * Skala Saaty (1-9)
 */
const SAATY_SCALE = {
  1: 'Sama Penting',
  2: 'Mendekati Sedikit Lebih Penting',
  3: 'Sedikit Lebih Penting',
  4: 'Mendekati Lebih Penting',
  5: 'Lebih Penting',
  6: 'Mendekati Sangat Penting',
  7: 'Sangat Penting',
  8: 'Mendekati Mutlak Lebih Penting',
  9: 'Mutlak Lebih Penting',
};

/**
 * Random Index (RI) values for consistency ratio calculation
 * Source: Saaty, T. L. (1980)
 */
const RANDOM_INDEX = {
  1: 0,
  2: 0,
  3: 0.58,
  4: 0.9,
  5: 1.12,
  6: 1.24,
  7: 1.32,
  8: 1.41,
  9: 1.45,
  10: 1.49,
  11: 1.51,
  12: 1.48,
  13: 1.56,
  14: 1.57,
  15: 1.59,
};

/**
 * Consistency threshold
 */
const CR_THRESHOLD = 0.1;

/**
 * Readiness status categories
 */
const READINESS_STATUS = [
  { min: 85, max: 100, label: 'Sangat Siap', color: '#10b981' },
  { min: 70, max: 84.99, label: 'Siap', color: '#3b82f6' },
  { min: 55, max: 69.99, label: 'Cukup Siap', color: '#f59e0b' },
  { min: 0, max: 54.99, label: 'Belum Siap', color: '#ef4444' },
];

/**
 * Get readiness status from score
 */
const getReadinessStatus = (score) => {
  for (const status of READINESS_STATUS) {
    if (score >= status.min && score <= status.max) {
      return status;
    }
  }
  return READINESS_STATUS[READINESS_STATUS.length - 1];
};

module.exports = {
  SAATY_SCALE,
  RANDOM_INDEX,
  CR_THRESHOLD,
  READINESS_STATUS,
  getReadinessStatus,
};
