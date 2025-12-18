const db = require('../config/db');

exports.getAllLocais = async (req, res) => {
  console.log('Recebida requisição GET /api/locais');
  try {
    const { status } = req.query;
    
    // Determinar o filtro de status baseado no query parameter
    let whereClause = "WHERE l.status_validacao = 'aprovado'"; // Padrão: apenas aprovados
    
    if (status) {
      const statusLower = String(status).toLowerCase().trim();
      
      if (statusLower === 'todos') {
        // Sem filtro de status - retorna todos
        whereClause = '';
        console.log('Filtro: Todos os locais (sem filtro de status)');
      } else if (statusLower === 'pendente') {
        whereClause = "WHERE l.status_validacao = 'pendente'";
        console.log('Filtro: Apenas locais pendentes');
      } else if (statusLower === 'aprovado') {
        whereClause = "WHERE l.status_validacao = 'aprovado'";
        console.log('Filtro: Apenas locais aprovados');
      } else if (statusLower === 'rejeitado') {
        whereClause = "WHERE l.status_validacao = 'rejeitado'";
        console.log('Filtro: Apenas locais rejeitados');
      } else {
        // Status inválido - retorna erro
        return res.status(400).json({ 
          message: `Status inválido. Valores permitidos: aprovado, pendente, rejeitado, todos` 
        });
      }
    } else {
      console.log('Filtro: Padrão (apenas aprovados)');
    }

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
        l.status_validacao,
        c.nome AS categoria_nome
      FROM locais AS l
      LEFT JOIN categorias AS c ON l.categoria_id = c.id
      ${whereClause}
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

    // IMPORTANTE: Força o status para 'pendente' - usuários não podem se auto-aprovar
    const status = 'pendente';
    console.log("Status forçado para 'pendente' - novo local aguardando aprovação do admin");

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

// Lista locais por usuário (retorna colunas essenciais)
exports.getLocaisPorUsuario = async (req, res) => {
  try {
    const { usuario_id } = req.params;

    if (!usuario_id) {
      return res.status(400).json({ message: 'Parametro usuario_id é obrigatório.' });
    }

    const query = `
      SELECT id, nome, endereco, status_validacao, foto
      FROM locais
      WHERE usuario_id = $1
      ORDER BY id DESC
    `;

    const { rows } = await db.query(query, [usuario_id]);

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao listar locais do usuário:', error);
    return res.status(500).json({ message: 'Erro interno no servidor ao listar locais do usuário.' });
  }
};

// Busca um local pelo id
exports.getLocalById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Parametro id é obrigatório.' });
    }

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
        l.status_validacao,
        c.nome AS categoria_nome
      FROM locais AS l
      LEFT JOIN categorias AS c ON l.categoria_id = c.id
      WHERE l.id = $1
    `;

    const { rows } = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Local não encontrado.' });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar local por id:', error);
    return res.status(500).json({ message: 'Erro interno no servidor ao buscar local.' });
  }
};

// Atualiza o status de validação de um local
exports.atualizarStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Parametro id é obrigatório.' });
    }

    if (!status) {
      return res.status(400).json({ message: 'Campo status é obrigatório no body.' });
    }

    // Validar se o status é um valor permitido
    const statusValidos = ['aprovado', 'pendente', 'rejeitado'];
    if (!statusValidos.includes(String(status).toLowerCase())) {
      return res.status(400).json({ 
        message: `Status inválido. Valores permitidos: ${statusValidos.join(', ')}` 
      });
    }

    const query = `
      UPDATE locais 
      SET status_validacao = $1 
      WHERE id = $2 
      RETURNING id, nome, status_validacao
    `;

    const { rowCount, rows } = await db.query(query, [String(status).toLowerCase(), id]);

    if (rowCount === 0) {
      return res.status(404).json({ message: 'Local não encontrado.' });
    }

    console.log(`Status do local ${id} atualizado para: ${status}`);
    return res.status(200).json({ 
      message: 'Status atualizado com sucesso.',
      local: rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar status do local:', error);
    return res.status(500).json({ message: 'Erro interno no servidor ao atualizar status.' });
  }
};

// Exclui um local pelo id
exports.deleteLocal = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Parametro id é obrigatório.' });
    }

    const query = 'DELETE FROM locais WHERE id = $1 RETURNING id';
    const { rowCount, rows } = await db.query(query, [id]);

    if (rowCount === 0) {
      return res.status(404).json({ message: 'Local não encontrado.' });
    }

    return res.status(200).json({ message: `Local ${rows[0].id} excluído com sucesso.` });
  } catch (error) {
    console.error('Erro ao excluir local:', error);
    return res.status(500).json({ message: 'Erro interno no servidor ao excluir local.' });
  }
};
