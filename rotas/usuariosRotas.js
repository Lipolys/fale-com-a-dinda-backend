const express = require('express');
const router = express.Router();
const {registrar, login} = require("../controladores/usuariosControlador");

router.post('/', registrar)
router.post('/', login)

module.exports = router;