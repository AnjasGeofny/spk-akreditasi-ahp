/**
 * Centralized error handling middleware
 */
const errorHandler = (err, req, res, _next) => {
  console.error('Error:', err.message);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Validation errors
  if (err.type === 'validation') {
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal',
      errors: err.errors || [err.message],
    });
  }

  // Not found
  if (err.type === 'not_found') {
    return res.status(404).json({
      success: false,
      message: err.message || 'Data tidak ditemukan',
    });
  }

  // Duplicate entry
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'Data sudah ada (duplikat)',
    });
  }

  // Foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Referensi data tidak valid',
    });
  }

  // Default server error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server',
  });
};

module.exports = errorHandler;
