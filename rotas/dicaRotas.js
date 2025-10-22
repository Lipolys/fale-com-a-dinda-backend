const express = require('express');
const router = express.Router();
const dicaControlador = require('../controladores/dicaControlador');
const guarda = require('../middleware/guardaSeguranca');
const checarPermissao = require('../middleware/checarPermissao');

router.post('/', guarda, checarPermissao(['FARMACEUTICO']), dicaControlador.criar);
router.get('/', guarda, dicaControlador.listar);
router.put('/:id', guarda, checarPermissao(['FARMACEUTICO']), dicaControlador.editar);
router.delete('/:id', guarda, checarPermissao(['FARMACEUTICO']), dicaControlador.deletar);


module.exports = router;