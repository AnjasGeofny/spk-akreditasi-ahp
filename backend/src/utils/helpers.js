/**
 * Format success response
 */
const successResponse = (res, data, message = 'Berhasil', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Format error response
 */
const errorResponse = (res, message = 'Terjadi kesalahan', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

/**
 * Create a not found error
 */
const notFoundError = (entity = 'Data') => {
  const err = new Error(`${entity} tidak ditemukan`);
  err.type = 'not_found';
  return err;
};

/**
 * Round number to specified decimal places
 */
const roundTo = (num, decimals = 4) => {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

module.exports = {
  successResponse,
  errorResponse,
  notFoundError,
  roundTo,
};
