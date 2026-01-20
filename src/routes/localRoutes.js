const express = require('express');
const router = express.Router();
// Importa o Controller (que tem as funções lógicas)
const localController = require('../controllers/localController');
// Importa o Middleware (que acabamos de criar)
const authMiddleware = require('../middleware/authMiddleware');

// --- Rotas Públicas (Qualquer um vê) ---
router.get('/', localController.getAllLocais);
router.get('/:id', localController.getLocalById);

// --- Rotas Protegidas (Só logado mexe) ---
// Importante: '/meus/locais' vem antes de '/:id' para não dar conflito
router.get('/meus/locais', authMiddleware, localController.getLocaisPorUsuario);

router.post('/', authMiddleware, localController.criarLocal);      // Criar
router.put('/:id', authMiddleware, localController.atualizarLocal); // Editar
router.delete('/:id', authMiddleware, localController.deletarLocal); // Deletar

module.exports = router;
