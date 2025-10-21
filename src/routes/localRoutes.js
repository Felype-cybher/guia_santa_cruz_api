const express = require('express');
const router = express.Router();
const localController = require('../controllers/localController');

router.get('/', localController.getAllLocais);

module.exports = router;