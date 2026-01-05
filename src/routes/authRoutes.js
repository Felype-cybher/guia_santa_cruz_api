const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota de Cadastro
// O controller exporta "registrar", então aqui usamos .registrar
router.post('/register', authController.registrar);

// Rota de Login
// O controller exporta "login", então aqui usamos .login
router.post('/login', authController.login);

module.exports = router;
