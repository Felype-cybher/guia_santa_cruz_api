const express = require('express');
const router = express.Router();
const localController = require('../controllers/localController');

router.get('/', localController.getAllLocais);

router.post('/', localController.createLocal);

// Listar locais por usuário
router.get('/usuario/:usuario_id', localController.getLocaisPorUsuario);

// Excluir local por id
router.delete('/:id', localController.deleteLocal);

module.exports = router;