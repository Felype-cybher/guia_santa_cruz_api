const db = require('../config/db');

exports.createCategoria = async (req, res) => {
  const { nome } = req.body;
  if (!nome) {
    return res.status(400).json({ message: 'Nome da categoria é obrigatório' });
  }
  try {
    const result = await db.query('INSERT INTO categorias (nome) VALUES ($1) RETURNING *', [nome]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({ message: 'Erro interno no servidor' });
  }
};

exports.getAllCategorias = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM categorias');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({ message: 'Erro interno no servidor' });
  }
};