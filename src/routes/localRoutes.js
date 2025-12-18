const express = require('express');
const router = express.Router();
const localController = require('../controllers/localController');

router.get('/', localController.getAllLocais);

router.post('/', localController.createLocal);

// Listar locais por usuário
router.get('/usuario/:usuario_id', localController.getLocaisPorUsuario);

// Buscar local por id
router.get('/:id', localController.getLocalById);

// Atualizar status de validação de um local
router.patch('/:id/status', localController.atualizarStatus);

// Atualizar um local (com verificação de propriedade)
router.put('/:id', localController.atualizarLocal);

// Excluir local por id
router.delete('/:id', localController.deleteLocal);

module.exports = router;
