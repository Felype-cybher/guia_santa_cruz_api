require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const queryUsuarios = `
    CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

const queryLocais = `
    CREATE TABLE IF NOT EXISTS locais (
        id SERIAL PRIMARY KEY,
        usuario_id INT REFERENCES usuarios(id),
        nome VARCHAR(100) NOT NULL,
        descricao TEXT,
        categoria VARCHAR(50),
        cep VARCHAR(20),
        endereco VARCHAR(255),
        numero VARCHAR(20),
        bairro VARCHAR(100),
        cidade VARCHAR(100),
        estado VARCHAR(2),
        imagem TEXT,
        status_validacao VARCHAR(20) DEFAULT 'pendente',
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

(async () => {
    try {
        console.log("🔌 Conectando ao Neon DB...");
        const client = await pool.connect();

        console.log("🔨 Criando tabela Usuários...");
        await client.query(queryUsuarios);

        console.log("🔨 Criando tabela Locais...");
        await client.query(queryLocais);

        console.log("✅ Sucesso! Tabelas criadas.");
        client.release();
    } catch (err) {
        console.error("❌ Erro ao criar tabelas:", err);
    } finally {
        await pool.end();
    }
})();
