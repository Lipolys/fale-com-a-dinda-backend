const express = require('express');
const router = express.Router();
const faqControlador = require('../controladores/faqControlador');
const guarda = require('../middleware/guardaSeguranca');
const checarPermissao = require('../middleware/checarPermissao');

router.post('/', guarda, checarPermissao(['FARMACEUTICO']), faqControlador.criar);
router.get('/', guarda, faqControlador.listar);
router.put('/:id', guarda, checarPermissao(['FARMACEUTICO']), faqControlador.editar);
router.delete('/:id', guarda, checarPermissao(['FARMACEUTICO']), faqControlador.deletar);


module.exports = router;