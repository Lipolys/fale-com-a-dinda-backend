const express = require('express');
const router = express.Router();
const notificacaoControlador = require('../controladores/notificacaoControlador');
const autenticacao = require('../middleware/guardaSeguranca'); // Middleware de autenticação corrigido

// Router prefix: /notificacoes (definido no servidor.js)

// Rota para Farmacêutico enviar notificação (requer autenticação)
router.post('/enviar', autenticacao, notificacaoControlador.enviarNotificacao);

// Rota para Cliente ver suas notificações (requer autenticação)
router.get('/', autenticacao, notificacaoControlador.listarNotificacoesCliente);

// Rota para marcar notificação como lida (requer autenticação)
router.put('/:id/ler', autenticacao, notificacaoControlador.marcarComoLida);

module.exports = router;
