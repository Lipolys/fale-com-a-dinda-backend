const express = require('express');
const router = express.Router();
const guarda = require('../middleware/guardaSeguranca')
const {listarTodas, inserir, editar, deletar} = require("../controladores/mensagensControlador");

router.use(guarda);

router.get('/', listarTodas)
router.post('/', inserir)
router.put('/:id', editar)
router.delete('/:id', deletar)


module.exports = router;