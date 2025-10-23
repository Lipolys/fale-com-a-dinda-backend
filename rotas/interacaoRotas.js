const express = require('express');
const router = express.Router();
const interacaoControlador = require('../controladores/interacaoControlador');
const guarda = require('../middleware/guardaSeguranca');
const checarPermissao = require('../middleware/checarPermissao');

router.post('/', guarda, checarPermissao(['FARMACEUTICO']), interacaoControlador.criar);
router.get('/', guarda, interacaoControlador.listar);
router.get('/verificar', guarda, checarPermissao(['CLIENTE']), interacaoControlador.verificarInteracoesCliente)
router.put('/:medId1/:medId2', guarda, checarPermissao(['FARMACEUTICO']), interacaoControlador.editar);
router.delete('/:medId1/:medId2', guarda, checarPermissao(['FARMACEUTICO']), interacaoControlador.deletar);


module.exports = router;