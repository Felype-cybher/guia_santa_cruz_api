const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');

// Rota pra criar categoria
router.post('/', categoriaController.createCategoria);
// Rota pra listar
router.get('/', categoriaController.getAllCategorias);

module.exports = router;