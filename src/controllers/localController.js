const db = require('../config/db'); // Ou onde estiver sua conexão

// Listar todos os locais (Público)
exports.getAllLocais = async (req, res) => {
    try {
        // Pega apenas aprovados por padrão
        const query = `
            SELECT id, nome, descricao, categoria, endereco, cidade, estado, imagem, status_validacao
            FROM locais
            WHERE status_validacao = 'aprovado'
        `;

        // Se usar mysql era db.query, se for pg (postgres) é assim:
        const { rows } = await db.query(query);

        res.json(rows);
    } catch (error) {
        console.error("ERRO DETALHADO ao buscar locais:", error);
        res.status(500).json({ error: "Erro ao buscar locais." });
    }
};

// Listar locais do usuário logado (Admin/User)
exports.getLocaisPorUsuario = async (req, res) => {
    const usuario_id = req.user.id; // Vem do token JWT

    try {
        // CORREÇÃO: Trocamos 'foto' por 'imagem'
        const query = `
            SELECT id, nome, categoria, status_validacao, imagem
            FROM locais
            WHERE usuario_id = $1
        `;

        const { rows } = await db.query(query, [usuario_id]);
        res.json(rows);
    } catch (error) {
        console.error("Erro ao listar locais do usuário:", error);
        res.status(500).json({ error: "Erro interno." });
    }
};

// Detalhes de um local específico
exports.getLocalById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = "SELECT * FROM locais WHERE id = $1";
        const { rows } = await db.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Local não encontrado" });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error("Erro ao buscar local:", error);
        res.status(500).json({ error: "Erro interno" });
    }
};

// Criar novo local
exports.criarLocal = async (req, res) => {
    const { nome, descricao, categoria, cep, endereco, numero, bairro, cidade, estado, imagem } = req.body;
    const usuario_id = req.user.id; // Pega do token

    try {
        const query = `
            INSERT INTO locais (usuario_id, nome, descricao, categoria, cep, endereco, numero, bairro, cidade, estado, imagem)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING id
        `;

        const values = [usuario_id, nome, descricao, categoria, cep, endereco, numero, bairro, cidade, estado, imagem];
        const { rows } = await db.query(query, values);

        res.status(201).json({ message: "Local criado com sucesso!", id: rows[0].id });
    } catch (error) {
        console.error("Erro ao criar local:", error);
        res.status(500).json({ error: "Erro ao criar local." });
    }
};

// Atualizar Local (O que estávamos fazendo antes)
exports.atualizarLocal = async (req, res) => {
    const { id } = req.params;
    const { nome, cep, endereco, numero, bairro, cidade, estado, descricao, categoria, imagem } = req.body;
    const usuario_id = req.user.id; // Segurança: só o dono edita

    try {
        const query = `
            UPDATE locais
            SET nome = $1, cep = $2, endereco = $3, numero = $4, bairro = $5, cidade = $6, estado = $7, descricao = $8, categoria = $9, imagem = $10, status_validacao = 'pendente'
            WHERE id = $11 AND usuario_id = $12
            RETURNING id
        `;

        const values = [nome, cep, endereco, numero, bairro, cidade, estado, descricao, categoria, imagem, id, usuario_id];
        const { rowCount } = await db.query(query, values);

        if (rowCount === 0) {
            return res.status(403).json({ message: "Não permitido ou local não encontrado." });
        }

        res.json({ message: "Local atualizado e enviado para aprovação!" });
    } catch (error) {
        console.error("Erro ao atualizar:", error);
        res.status(500).json({ message: "Erro interno." });
    }
};

// Deletar um local
exports.deletarLocal = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `DELETE FROM locais WHERE id = $1`;
        await db.query(query, [id]);
        return res.status(200).json({ message: 'Deletado' });
    } catch (error) {
        console.error('Erro ao deletar local:', error);
        return res.status(500).json({ error: 'Erro interno' });
    }
};
