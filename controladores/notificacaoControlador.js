const { Notificacao, Farmaceutico, Cliente, Usuario } = require('../modelos/associacoes');

// Enviar notificação (Farmacêutico para Clientes)
const enviarNotificacao = async (req, res) => {
    const { titulo, mensagem, clienteIds } = req.body;

    // Validação básica
    if (!titulo || !mensagem) {
        return res.status(400).json({ erro: 'Título e mensagem são obrigatórios.' });
    }
    if (!clienteIds || !Array.isArray(clienteIds) || clienteIds.length === 0) {
        return res.status(400).json({ erro: 'Lista de clientes (clienteIds) é obrigatória e deve ser um array.' });
    }

    try {
        // Verificar se é farmacêutico
        const farmaceutico = await Farmaceutico.findOne({
            where: { usuario_idusuario: req.usuario.id }
        });

        if (!farmaceutico) {
            return res.status(403).json({ erro: 'Apenas farmacêuticos podem enviar notificações.' });
        }

        // Criar notificações em lote (ou loop para garantir validação individual se necessário)
        // Usar Promise.all para criar em paralelo pode ser mais eficiente
        const notificacoesPromessas = clienteIds.map(async (clienteId) => {
            // Verifica existência do cliente (opcional, mas bom para integridade)
            const cliente = await Cliente.findByPk(clienteId);
            if (!cliente) return null; // Ignora IDs inválidos

            return Notificacao.create({
                farmaceutico_idfarmaceutico: farmaceutico.idfarmaceutico,
                cliente_idcliente: clienteId,
                titulo,
                mensagem
            });
        });

        const resultados = await Promise.all(notificacoesPromessas);
        const enviadas = resultados.filter(n => n !== null);

        res.status(201).json({
            mensagem: `Notificação enviada para ${enviadas.length} clientes.`,
            sucesso: true
        });

    } catch (error) {
        console.error("Erro ao enviar notificação:", error);
        res.status(500).json({ erro: 'Erro ao processar envio de notificações.', detalhes: error.message });
    }
};

// Listar notificações (Cliente)
const listarNotificacoesCliente = async (req, res) => {
    try {
        const cliente = await Cliente.findOne({
            where: { usuario_idusuario: req.usuario.id }
        });

        if (!cliente) {
            return res.status(403).json({ erro: 'Perfil de cliente não encontrado.' });
        }

        const notificacoes = await Notificacao.findAll({
            where: { cliente_idcliente: cliente.idcliente },
            order: [['data_envio', 'DESC']],
            include: [{
                model: Farmaceutico,
                as: 'farmaceutico',
                include: [{
                    model: Usuario,
                    as: 'usuario',
                    attributes: ['nome'] // Nome do farmacêutico que enviou
                }]
            }]
        });

        res.status(200).json(notificacoes);

    } catch (error) {
        console.error("Erro ao listar notificações:", error);
        res.status(500).json({ erro: 'Erro ao buscar notificações.', detalhes: error.message });
    }
};

// Marcar como lida (Cliente)
const marcarComoLida = async (req, res) => {
    const { id } = req.params;

    try {
        const cliente = await Cliente.findOne({
            where: { usuario_idusuario: req.usuario.id }
        });

        if (!cliente) {
            return res.status(403).json({ erro: 'Perfil de cliente não encontrado.' });
        }

        const notificacao = await Notificacao.findByPk(id);

        if (!notificacao) {
            return res.status(404).json({ erro: 'Notificação não encontrada.' });
        }

        // Verifica se a notificação pertence ao cliente
        if (notificacao.cliente_idcliente !== cliente.idcliente) {
            return res.status(403).json({ erro: 'Esta notificação não pertence a você.' });
        }

        notificacao.lida = true;
        await notificacao.save();

        res.status(200).json({ mensagem: 'Notificação marcada como lida.', notificacao });

    } catch (error) {
        console.error("Erro ao marcar notificação como lida:", error);
        res.status(500).json({ erro: 'Erro ao atualizar notificação.', detalhes: error.message });
    }
};

module.exports = {
    enviarNotificacao,
    listarNotificacoesCliente,
    marcarComoLida
};
