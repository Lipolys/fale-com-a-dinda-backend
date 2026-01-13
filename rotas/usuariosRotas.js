const express = require('express');
const router = express.Router();
const guardaSeguranca = require('../middleware/guardaSeguranca');
const checarPermissao = require('../middleware/checarPermissao');
const {
    cadastrar,
    login,
    refreshToken,
    logout,
    listarClientes
} = require("../controladores/usuarioControlador");

// Rotas públicas
router.post('/cadastrar', cadastrar);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

// Rotas protegidas
router.get('/clientes', guardaSeguranca, checarPermissao(['FARMACEUTICO']), listarClientes);

module.exports = router;