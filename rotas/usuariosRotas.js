const express = require('express');
const router = express.Router();
const {
    cadastrar,
    login,
    refreshToken,
    logout
} = require("../controladores/usuarioControlador");

// Rotas públicas
router.post('/cadastrar', cadastrar);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

module.exports = router;