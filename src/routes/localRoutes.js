const express = require('express');
const router = express.Router();
const localController = require('../controllers/localController');

router.get('/', localController.getAllLocais);

router.post('/', localController.createLocal);


module.exports = router;