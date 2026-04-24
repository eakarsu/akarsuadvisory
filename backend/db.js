const { Pool } = require('pg');

let poolConfig;
if (process.env.DATABASE_URL) {
  poolConfig = { connectionString: process.env.DATABASE_URL };
} else {
  poolConfig = {
    user: process.env.DB_USER || 'erolakarsu',
    password: process.env.DB_PASSWORD || '',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'akarsu_advisory',
  };
}

const pool = new Pool(poolConfig);
module.exports = pool;
