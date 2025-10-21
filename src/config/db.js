// src/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL não foi definida no seu arquivo .env ou nas variáveis de ambiente.');
}

const pool = new Pool({
  connectionString: connectionString,
  // Linha adicionada para compatibilidade com o Render
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};