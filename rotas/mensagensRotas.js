const express = require('express');
const router = express.Router();
const {listarTodas, inserir, editar, deletar} = require("../controladores/mensagensControlador");


router.get('/', listarTodas)
router.post('/', inserir)
router.put('/:id', editar)
router.delete('/:id', deletar)

module.exports = router;