const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        database: process.env.DB_NAME || 'spk_akreditasi',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
      }
);

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err.message);
  process.exit(-1);
});

module.exports = pool;
