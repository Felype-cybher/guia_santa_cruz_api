require('dotenv').config();
const { Pool } = require('pg');

// Cria a conexão (Pool) usando a URL do Neon
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Necessário para conectar no Neon/Render
    }
});

// Exporta um facilitador para rodar as queries
module.exports = {
    query: (text, params) => pool.query(text, params),
};
