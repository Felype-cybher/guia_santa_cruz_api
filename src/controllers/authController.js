const db = require('../config/db');
const bcrypt = require('bcryptjs'); // ou 'bcrypt', dependendo do que vc instalou
const jwt = require('jsonwebtoken');

// Registrar Usuário
exports.registrar = async (req, res) => {
    const { nome, email, password } = req.body;

    try {
        // 1. Verifica se usuário já existe
        const userCheck = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: "Email já cadastrado." });
        }

        // 2. Criptografa a senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Insere no Banco (Sintaxe POSTGRESQL)
        const query = `
            INSERT INTO usuarios (nome, email, senha)
            VALUES ($1, $2, $3)
            RETURNING id
        `;

        const { rows } = await db.query(query, [nome, email, hashedPassword]);

        res.status(201).json({ message: "Usuário criado com sucesso!", userId: rows[0].id });

    } catch (error) {
        console.error("Erro no registro:", error);
        res.status(500).json({ message: "Erro interno no servidor." });
    }
};

// Login
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Busca usuário pelo email
        const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(400).json({ message: "Email ou senha inválidos." });
        }

        const user = result.rows[0];

        // 2. Compara a senha enviada com a senha do banco
        const isMatch = await bcrypt.compare(password, user.senha);

        if (!isMatch) {
            return res.status(400).json({ message: "Email ou senha inválidos." });
        }

        // 3. Gera o Token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ message: "Erro interno no servidor." });
    }
};
