const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection pool using the DATABASE_URL env variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
