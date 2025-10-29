const db = require('../config/db');

exports.getAllLocais = async (req, res) => {
  console.log('Recebida requisição GET /api/locais'); // Log 1: Chegou aqui?
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
      LEFT JOIN categorias AS c ON l.categoria_id = c.id 
      WHERE l.status_validacao = 'aprovado'
    `;
    // Usei LEFT JOIN pra garantir que mesmo locais sem categoria (se acontecer) apareçam
    // Troquei categoria_id pra bater com o nome que a gente usou no banco (categorias_id)

    console.log('Executando query no banco...'); // Log 2: Vai tentar buscar?
    const result = await db.query(query);
    console.log('Query executada com sucesso. Linhas encontradas:', result.rows.length); // Log 3: Conseguiu buscar?

    res.status(200).json(result.rows); // No pg, os resultados estão em result.rows

  } catch (error) {
    // Log 4: Deu merda! Qual foi o erro?
    console.error('ERRO DETALHADO ao buscar locais:', error); 
    res.status(500).json({ message: 'Erro interno no servidor ao buscar locais.' }); // Mensagem mais específica
  }
};