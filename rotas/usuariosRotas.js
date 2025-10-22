const express = require('express');
const router = express.Router();
const {cadastrar, login} = require("../controladores/usuariosControlador");

router.post('/cadastrar', cadastrar)
router.post('/login', login)

module.exports = router;