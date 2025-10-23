const express = require('express');
const router = express.Router();
const ministraControlador = require('../controladores/ministraControlador');
const guarda = require('../middleware/guardaSeguranca');
const checarPermissao = require('../middleware/checarPermissao');

router.post('/', guarda, checarPermissao(['CLIENTE']), ministraControlador.criar);
router.get('/', guarda, checarPermissao(['CLIENTE']), ministraControlador.listarPorClienteLogado);
router.get('/:id', guarda, checarPermissao(['CLIENTE']), ministraControlador.listarUm);
router.put('/:id', guarda, checarPermissao(['CLIENTE']), ministraControlador.editar);
router.delete('/:id', guarda, checarPermissao(['CLIENTE']), ministraControlador.deletar);

module.exports = router;