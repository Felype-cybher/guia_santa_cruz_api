const db = require('../config/db');

exports.getAllLocais = async (req, res) => {
  try {
    const query = `
      SELECT 
        l.id,
        l.nome,
        l.endereco,
        l.telefone,
        l.sobre,
        l.latitude,
        l.longitude,
        c.nome AS categoria_nome
      FROM locais AS l
      JOIN categorias AS c ON l.categoria_id = c.id
      WHERE l.status_validacao = 'aprovado'
    `;

    const [locais] = await db.query(query);

    res.status(200).json(locais);

  } catch (error) {
    console.error('Erro ao buscar locais:', error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};
