const express = require('express');
const router = express.Router();
const medicamentoControlador = require('../controladores/medicamentoControlador');
const guarda = require('../middleware/guardaSeguranca');
const checarPermissao = require('../middleware/checarPermissao');

router.post('/', guarda, checarPermissao(['FARMACEUTICO']), medicamentoControlador.criar);
router.get('/', guarda, medicamentoControlador.listar);
router.put('/:id', guarda, checarPermissao(['FARMACEUTICO']), medicamentoControlador.editar);
router.delete('/:id', guarda, checarPermissao(['FARMACEUTICO']), medicamentoControlador.deletar);


module.exports = router;