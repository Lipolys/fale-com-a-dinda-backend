// controladores/ministraControlador.js
const { Ministra, Cliente, Medicamento, Usuario } = require('../modelos/associacoes');

// Função auxiliar para buscar o ID do cliente logado
const buscarClienteId = async (usuarioId) => {
    const cliente = await Cliente.findOne({ where: { usuario_idusuario: usuarioId } });
    return cliente ? cliente.idcliente : null;
};

// CLIENTE: Adicionar um medicamento à sua lista (criar registro em Ministra)
const criar = async (req, res) => {
    const { medicamento_idmedicamento, horario, dosagem, frequencia, status } = req.body;
    const usuarioId = req.usuario.id; // ID do usuário logado

    // Validação de entrada básica
    if (!medicamento_idmedicamento) {
        return res.status(400).json({ erro: 'O ID do medicamento é obrigatório.' });
    }

    try {
        const clienteId = await buscarClienteId(usuarioId);
        if (!clienteId) {
            return res.status(403).json({ erro: 'Perfil de cliente não encontrado.' });
        }

        // Verifica se o medicamento existe
        const medicamento = await Medicamento.findByPk(medicamento_idmedicamento);
        if (!medicamento) {
            return res.status(404).json({ erro: 'Medicamento não encontrado.' });
        }

        // Verifica se o cliente já está tomando este medicamento (evitar duplicatas)
        const existente = await Ministra.findOne({
            where: {
                cliente_idcliente: clienteId,
                medicamento_idmedicamento: medicamento_idmedicamento
            }
        });
        if (existente) {
            return res.status(409).json({ erro: 'Você já está tomando este medicamento.' });
        }


        const novoRegistro = await Ministra.create({
            cliente_idcliente: clienteId,
            medicamento_idmedicamento,
            horario, // Pode ser null se não informado
            dosagem, // Pode ser null se não informado
            frequencia, // Pode ser null se não informado
            status: status || 1 // Default para 'ativo' (ou defina sua lógica)
        });

        res.status(201).json(novoRegistro);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao adicionar medicamento.', detalhes: error.message });
    }
};

// CLIENTE: Listar todos os medicamentos que o cliente logado está tomando
const listarPorClienteLogado = async (req, res) => {
    const usuarioId = req.usuario.id;

    try {
        const clienteId = await buscarClienteId(usuarioId);
        if (!clienteId) {
            return res.status(403).json({ erro: 'Perfil de cliente não encontrado.' });
        }

        const registros = await Ministra.findAll({
            where: { cliente_idcliente: clienteId },
            include: [{
                model: Medicamento,
                as: 'medicamento', // Sequelize usará o 'as' definido na associação se houver
                attributes: ['descricao', 'classe'] // Inclui detalhes do medicamento
            }]
            // Ordenar por horário, por exemplo: order: [['horario', 'ASC']]
        });

        res.status(200).json(registros);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao listar medicamentos do cliente.', detalhes: error.message });
    }
};

// CLIENTE: Obter detalhes de UM registro específico da tabela ministra (ex: para editar)
const listarUm = async (req, res) => {
    const { id } = req.params; // ID do registro na tabela 'ministra'
    const usuarioId = req.usuario.id;

    try {
        const clienteId = await buscarClienteId(usuarioId);
        if (!clienteId) {
            return res.status(403).json({ erro: 'Perfil de cliente não encontrado.' });
        }

        const registro = await Ministra.findOne({
            where: {
                idministra: id,
                cliente_idcliente: clienteId // Garante que o cliente só veja o seu
            },
            include: [{
                model: Medicamento,
                as: 'medicamento',
                attributes: ['descricao', 'classe']
            }]
        });

        if (!registro) {
            return res.status(404).json({ erro: 'Registro de medicamento não encontrado ou não pertence a você.' });
        }

        res.status(200).json(registro);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar registro de medicamento.', detalhes: error.message });
    }
};


// CLIENTE: Editar detalhes de um medicamento que o cliente está tomando
const editar = async (req, res) => {
    const { id } = req.params; // ID do registro na tabela 'ministra'
    const { horario, dosagem, frequencia, status } = req.body;
    const usuarioId = req.usuario.id;

    // Validação mínima (pode adicionar mais conforme necessário)
    if (horario === undefined && dosagem === undefined && frequencia === undefined && status === undefined) {
        return res.status(400).json({ erro: 'Nenhum dado fornecido para atualização.' });
    }


    try {
        const clienteId = await buscarClienteId(usuarioId);
        if (!clienteId) {
            return res.status(403).json({ erro: 'Perfil de cliente não encontrado.' });
        }

        const registro = await Ministra.findOne({
            where: {
                idministra: id,
                cliente_idcliente: clienteId // Garante que o cliente só edite o seu
            }
        });

        if (!registro) {
            return res.status(404).json({ erro: 'Registro de medicamento não encontrado ou não pertence a você.' });
        }

        // Atualiza apenas os campos fornecidos
        if (horario !== undefined) registro.horario = horario;
        if (dosagem !== undefined) registro.dosagem = dosagem;
        if (frequencia !== undefined) registro.frequencia = frequencia;
        if (status !== undefined) registro.status = status;

        await registro.save();

        res.status(200).json(registro);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao editar registro de medicamento.', detalhes: error.message });
    }
};

// CLIENTE: Remover um medicamento da sua lista (deletar registro em Ministra)
const deletar = async (req, res) => {
    const { id } = req.params; // ID do registro na tabela 'ministra'
    const usuarioId = req.usuario.id;

    try {
        const clienteId = await buscarClienteId(usuarioId);
        if (!clienteId) {
            return res.status(403).json({ erro: 'Perfil de cliente não encontrado.' });
        }

        const registro = await Ministra.findOne({
            where: {
                idministra: id,
                cliente_idcliente: clienteId // Garante que o cliente só delete o seu
            }
        });

        if (!registro) {
            return res.status(404).json({ erro: 'Registro de medicamento não encontrado ou não pertence a você.' });
        }

        await registro.destroy();

        res.status(200).json({ mensagem: 'Medicamento removido da sua lista com sucesso.' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao remover medicamento.', detalhes: error.message });
    }
};

module.exports = {
    criar,
    listarPorClienteLogado,
    listarUm,
    editar,
    deletar
};