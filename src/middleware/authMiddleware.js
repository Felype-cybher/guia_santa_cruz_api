const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // Pega o token do cabeçalho (Header: Authorization)
        const token = req.header('Authorization').replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: "Acesso negado. Token não fornecido." });
        }

        // Verifica se o token é válido usando a senha secreta
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Salva os dados do usuário na requisição para usar depois
        req.user = decoded;

        next(); // Pode passar!
    } catch (error) {
        res.status(401).json({ message: "Token inválido ou expirado." });
    }
};
