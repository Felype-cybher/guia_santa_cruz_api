// fix-db.js
// Script para alterar a coluna 'image' da tabela 'locais' para o tipo TEXT

const db = require('./src/config/db');

async function main() {
  console.log('Corrigindo banco...');
  try {
    const sql = "ALTER TABLE locais ADD COLUMN IF NOT EXISTS image TEXT;";
    await db.query(sql);
    console.log('Sucesso!');
    process.exit(0);
  } catch (err) {
    console.error('Erro:', err.message || err);
    process.exit(1);
  }
}

main();
