const mysql = require('mysql2/promise');

let pool;

function getPool() {
  if (!pool) {
    const missing = ['DB_HOST', 'DB_USER', 'DB_NAME'].filter(name => !process.env[name]);
    if (missing.length) {
      const error = new Error(`Configuração ausente: ${missing.join(', ')}`);
      error.code = 'CONFIGURATION_ERROR';
      throw error;
    }
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      ssl: process.env.DB_SSL === 'false' ? undefined : { rejectUnauthorized: false }
    });
  }
  return pool;
}

module.exports = { getPool };
