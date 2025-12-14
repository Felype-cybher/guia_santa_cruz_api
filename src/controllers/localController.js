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
        l.foto,
        c.nome AS categoria_nome
      FROM locais AS l
      LEFT JOIN categorias AS c ON l.categoria_id = c.id
      WHERE l.status_validacao = 'aprovado'
    `;
    // Adicionei l.foto no SELECT acima pra imagem aparecer quando buscarem os locais

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
  // Cuidado ao logar req.body se a foto for muito grande, pode sujar o terminal.
  // console.log("Corpo da requisição:", req.body);

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
      categorias_id,
      foto // <--- AGORA PEGAMOS A FOTO AQUI (Base64)
    } = req.body;

    if (!nome || !latitude || !longitude || !usuario_id || !categorias_id) {
      console.log("Erro: Campos obrigatórios faltando.");
      return res.status(400).json({
        message: 'Erro: nome, latitude, longitude, usuario_id e categorias_id são obrigatórios.'
      });
    }

    const status = status_validacao || 'pendente';

    // Query atualizada para incluir a coluna 'foto'
    const query = `
      INSERT INTO locais (
        nome, endereco, telefone, sobre, latitude, longitude, status_validacao, usuario_id, categoria_id, foto
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      nome,
      endereco,
      telefone,
      sobre,
      latitude,
      longitude,
      status,
      usuario_id,
      categorias_id,
      foto // <--- Passando o Base64 gigante para o banco
    ];

    console.log("Executando INSERT no banco...");
    const result = await db.query(query, values);
    console.log("Local criado com sucesso:", result.rows[0].id); // Log só o ID pra não poluir

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('ERRO DETALHADO ao criar local:', error);

    if (error.code === '23503') {
      return res.status(404).json({ message: 'Erro: usuario_id ou categorias_id não encontrado.' });
    }

    res.status(500).json({ message: 'Erro interno no servidor ao criar local.' });
  }
};
