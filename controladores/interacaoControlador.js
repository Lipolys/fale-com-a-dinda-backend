// controladores/interacaoControlador.js
const { Interacao, Farmaceutico, Medicamento, Cliente, Ministra, Usuario, sequelize } = require('../modelos/associacoes');
const { Op } = require('sequelize'); // Necessário para consultas mais complexas

// Função auxiliar para buscar o ID do farmacêutico logado
const buscarFarmaceuticoId = async (usuarioId) => {
    const farmaceutico = await Farmaceutico.findOne({ where: { usuario_idusuario: usuarioId } });
    return farmaceutico ? farmaceutico.idfarmaceutico : null;
};

// FARMACÊUTICO: Criar um novo registro de interação
const criar = async (req, res) => {
    const { idmedicamento1, idmedicamento2, descricao, gravidade, fonte } = req.body;
    const usuarioId = req.usuario.id;

    // --- Validações ---
    if (!idmedicamento1 || !idmedicamento2) {
        return res.status(400).json({ erro: 'IDs dos dois medicamentos são obrigatórios.' });
    }
    if (idmedicamento1 === idmedicamento2) {
        return res.status(400).json({ erro: 'Um medicamento não pode interagir com ele mesmo.' });
    }
    if (!descricao || descricao.trim() === '') {
        return res.status(400).json({ erro: 'O campo descrição é obrigatório.' });
    }
    if (!gravidade || !['BAIXA', 'MEDIA', 'ALTA'].includes(gravidade)) {
        return res.status(400).json({ erro: 'Gravidade inválida. Use BAIXA, MEDIA ou ALTA.' });
    }

    try {
        const farmaceuticoId = await buscarFarmaceuticoId(usuarioId);
        if (!farmaceuticoId) {
            return res.status(403).json({ erro: 'Perfil de farmacêutico não encontrado.' });
        }

        // Verifica se os medicamentos existem
        const med1 = await Medicamento.findByPk(idmedicamento1);
        const med2 = await Medicamento.findByPk(idmedicamento2);
        if (!med1 || !med2) {
            return res.status(404).json({ erro: 'Um ou ambos os medicamentos não foram encontrados.' });
        }

        // Garante a ordem para evitar duplicatas (ex: A-B e B-A)
        const medId1 = Math.min(idmedicamento1, idmedicamento2);
        const medId2 = Math.max(idmedicamento1, idmedicamento2);

        // Verifica se a interação já existe
        const existente = await Interacao.findOne({
            where: { idmedicamento1: medId1, idmedicamento2: medId2 }
        });
        if (existente) {
            return res.status(409).json({ erro: 'Esta interação já foi cadastrada.' });
        }


        const novaInteracao = await Interacao.create({
            idmedicamento1: medId1,
            idmedicamento2: medId2,
            farmaceutico_idfarmaceutico: farmaceuticoId,
            descricao,
            gravidade,
            fonte // Pode ser null
        });

        res.status(201).json(novaInteracao);
    } catch (error) {
        // Tratar erro de chave duplicada (embora já verificado acima)
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ erro: 'Esta interação já foi cadastrada.' });
        }
        res.status(500).json({ erro: 'Erro ao criar interação.', detalhes: error.message });
    }
};

// TODOS (LOGADOS): Listar todas as interações cadastradas
// (Pode ser útil para farmacêuticos consultarem ou para uma tela geral)
const listar = async (req, res) => {
    try {
        const interacoes = await Interacao.findAll({
            include: [
                {
                    model: Medicamento,
                    as: 'medicamento1', // Alias para o primeiro medicamento
                    attributes: ['descricao']
                },
                {
                    model: Medicamento,
                    as: 'medicamento2', // Alias para o segundo medicamento
                    attributes: ['descricao']
                },
                {
                    model: Farmaceutico,
                    as: 'farmaceutico',
                    attributes: [], // Não precisa do CRF aqui talvez
                    include: [{
                        model: Usuario,
                        as: 'usuario',
                        attributes: ['nome'] // Nome de quem cadastrou
                    }]
                }
            ]
        });
        res.status(200).json(interacoes);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao listar interações.', detalhes: error.message });
    }
};

// FARMACÊUTICO: Editar uma interação (só pode editar descrição, gravidade, fonte)
const editar = async (req, res) => {
    // Chave primária composta: precisamos dos dois IDs
    const { medId1, medId2 } = req.params;
    const { descricao, gravidade, fonte } = req.body;
    const usuarioId = req.usuario.id;

    // --- Validações ---
    if (!medId1 || !medId2) {
        return res.status(400).json({ erro: 'IDs dos medicamentos são obrigatórios.' });
    }

    if (!descricao || descricao.trim() === '') {
        return res.status(400).json({ erro: 'O campo descrição é obrigatório.' });
    }
    if (!gravidade || !['BAIXA', 'MEDIA', 'ALTA'].includes(gravidade)) {
        return res.status(400).json({ erro: 'Gravidade inválida. Use BAIXA, MEDIA ou ALTA.' });
    }

    try {
        const farmaceuticoId = await buscarFarmaceuticoId(usuarioId);
        if (!farmaceuticoId) {
            return res.status(403).json({ erro: 'Perfil de farmacêutico não encontrado.' });
        }

        // Converte para número e valida
        const med1 = parseInt(medId1);
        const med2 = parseInt(medId2);

        if (isNaN(med1) || isNaN(med2)) {
            return res.status(400).json({ erro: 'IDs dos medicamentos devem ser números válidos.' });
        }

        // Garante a ordem correta dos IDs
        const id1 = Math.min(med1, med2);
        const id2 = Math.max(med1, med2);

        const interacao = await Interacao.findOne({
            where: { idmedicamento1: id1, idmedicamento2: id2 }
        });

        if (!interacao) {
            return res.status(404).json({ erro: 'Interação não encontrada.' });
        }

        // Opcional: Verificar se o farmacêutico logado é o mesmo que criou
        if (interacao.farmaceutico_idfarmaceutico !== farmaceuticoId) {
            return res.status(403).json({ erro: 'Você não tem permissão para editar esta interação.' });
        }

        interacao.descricao = descricao;
        interacao.gravidade = gravidade;
        interacao.fonte = fonte; // Pode ser null
        await interacao.save();

        res.status(200).json(interacao);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao editar interação.', detalhes: error.message });
    }
};

// FARMACÊUTICO: Deletar uma interação
const deletar = async (req, res) => {
    const { medId1, medId2 } = req.params;
    const usuarioId = req.usuario.id;

    // --- Validações ---
    if (!medId1 || !medId2) {
        return res.status(400).json({ erro: 'IDs dos medicamentos são obrigatórios.' });
    }

    try {
        const farmaceuticoId = await buscarFarmaceuticoId(usuarioId);
        if (!farmaceuticoId) {
            return res.status(403).json({ erro: 'Perfil de farmacêutico não encontrado.' });
        }

        // Converte para número e valida
        const med1 = parseInt(medId1);
        const med2 = parseInt(medId2);

        if (isNaN(med1) || isNaN(med2)) {
            return res.status(400).json({ erro: 'IDs dos medicamentos devem ser números válidos.' });
        }

        // Garante a ordem correta dos IDs
        const id1 = Math.min(med1, med2);
        const id2 = Math.max(med1, med2);

        const interacao = await Interacao.findOne({
            where: { idmedicamento1: id1, idmedicamento2: id2 }
        });

        if (!interacao) {
            return res.status(404).json({ erro: 'Interação não encontrada.' });
        }

        // Opcional: Verificar se o farmacêutico logado é o mesmo que criou
        if (interacao.farmaceutico_idfarmaceutico !== farmaceuticoId) {
            return res.status(403).json({ erro: 'Você não tem permissão para deletar esta interação.' });
        }

        await interacao.destroy();

        res.status(200).json({ mensagem: 'Interação deletada com sucesso.' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao deletar interação.', detalhes: error.message });
    }
};


// CLIENTE: Verificar interações entre os medicamentos que o cliente está tomando
const verificarInteracoesCliente = async (req, res) => {
    const usuarioId = req.usuario.id;

    try {
        // 1. Encontrar o ID do cliente
        const cliente = await Cliente.findOne({ where: { usuario_idusuario: usuarioId } });
        if (!cliente) {
            // Se não for cliente, não há o que verificar (ou pode retornar erro 403)
            return res.status(200).json([]);
        }
        const clienteId = cliente.idcliente;

        // 2. Buscar todos os IDs de medicamentos que o cliente está tomando (tabela Ministra)
        const registrosMinistra = await Ministra.findAll({
            where: { cliente_idcliente: clienteId },
            attributes: ['medicamento_idmedicamento'] // Só precisamos dos IDs
        });

        // Extrai apenas os IDs para uma lista
        const idsMedicamentosCliente = registrosMinistra.map(reg => reg.medicamento_idmedicamento);

        // Se o cliente não toma medicamentos ou toma apenas 1, não há interações
        if (idsMedicamentosCliente.length < 2) {
            return res.status(200).json([]);
        }

        // 3. Buscar na tabela Interacao por pares onde AMBOS os IDs estão na lista do cliente
        const interacoesEncontradas = await Interacao.findAll({
            where: {
                idmedicamento1: { [Op.in]: idsMedicamentosCliente },
                idmedicamento2: { [Op.in]: idsMedicamentosCliente }
            },
            include: [ // Incluir nomes dos medicamentos para clareza
                { model: Medicamento, as: 'medicamento1', attributes: ['descricao'] },
                { model: Medicamento, as: 'medicamento2', attributes: ['descricao'] }
            ]
        });

        res.status(200).json(interacoesEncontradas);

    } catch (error) {
        res.status(500).json({ erro: 'Erro ao verificar interações.', detalhes: error.message });
    }
};


module.exports = {
    criar,
    listar,
    editar,
    deletar,
    verificarInteracoesCliente // A função "diferencial"
};