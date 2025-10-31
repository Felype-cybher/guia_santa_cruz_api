const db = require('../config/db');


exports.getAllLocais = async (req, res) => {
  console.log('Recebida requisição GET /api/locais');
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
    
    console.log('Executando query no banco...');
    const result = await db.query(query);
    console.log('Query executada com sucesso. Linhas encontradas:', result.rows.length);

    res.status(200).json(result.rows);

  } catch (error) {
    console.error('ERRO DETALHADO ao buscar locais:', error); 
    res.status(500).json({ message: 'Erro interno no servidor ao buscar locais.' });
  }
};

exports.createLocal = async (req, res) => {
  console.log("Recebida requisição POST /api/locais");
  console.log("Corpo da requisição:", req.body);

  try {
    const { 
      nome, 
      endereco, 
      telefone, 
      sobre, 
      latitude, 
      longitude, 
      status_validacao, 
      usuario_id, 
      categorias_id 
    } = req.body;

    if (!nome || !latitude || !longitude || !usuario_id || !categorias_id) {
      console.log("Erro: Campos obrigatórios faltando.");
      return res.status(400).json({ 
        message: 'Erro: nome, latitude, longitude, usuario_id e categorias_id são obrigatórios.' 
      });
    }

    // Define o status padrão se não for enviado (embora a gente vá mandar 'aprovado')
    const status = status_validacao || 'pendente';

    const query = `
      INSERT INTO locais (
        nome, endereco, telefone, sobre, latitude, longitude, status_validacao, usuario_id, categoria_id
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    // ATENÇÃO: Confere no teu banco se a coluna é "categoria_id" ou "categorias_id"
    // No teu SQL do DBeaver tava "categorias_id [FK de categorias(id)]"
    // Mas no teu getAllLocais tava "c.categoria_id = c.id"
    // E no meu INSERT eu botei "categoria_id". 
    // Vamo usar "categoria_id" (o $9) por enquanto. Se der pau, a gente troca.

    const values = [
      nome, 
      endereco, 
      telefone, 
      sobre, 
      latitude, 
      longitude, 
      status, // usa a variável 'status'
      usuario_id, 
      categorias_id // <--- Mudei aqui
    ];

    console.log("Executando INSERT no banco...");
    const result = await db.query(query, values);
    console.log("Local criado com sucesso:", result.rows[0]);

    // Retorna o local que acabou de ser criado
    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('ERRO DETALHADO ao criar local:', error);

    // Erro de FK (tipo, categorias_id não existe)
    if (error.code === '23503') {
      return res.status(404).json({ message: 'Erro: usuario_id ou categorias_id não encontrado.' });
    }
    
    res.status(500).json({ message: 'Erro interno no servidor ao criar local.' });
  }
};