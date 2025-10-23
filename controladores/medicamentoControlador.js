const { Medicamento, Farmaceutico, Usuario } = require('../modelos/associacoes');

const criar = async (req, res) => {
    const { descricao, classe } = req.body;

    // Validação de entrada
    if (!descricao || descricao.trim() === '') {
        return res.status(400).json({ erro: 'O campo descrição é obrigatório.' });
    }
    if (!classe || classe.trim() === '') {
        return res.status(400).json({ erro: 'O campo classe é obrigatório.' });
    }

    try {
        const farmaceutico = await Farmaceutico.findOne({
            where: { usuario_idusuario: req.usuario.id } // req.usuario vem do middleware guardaSeguranca
        });

        if (!farmaceutico) {
            return res.status(403).json({ erro: 'Perfil de farmacêutico não encontrado.' });
        }

        const novoMedicamento = await Medicamento.create({
            descricao,
            classe,
            farmaceutico_idfarmaceutico: farmaceutico.idfarmaceutico
        });

        res.status(201).json(novoMedicamento);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao criar medicamento.', detalhes: error.message });
    }
};

// TODOS (LOGADOS): Listar todos os medicamentos
const listar = async (req, res) => {
    try {
        const medicamentos = await Medicamento.findAll({
            include: [{
                model: Farmaceutico,
                as: 'farmaceutico',
                attributes: ['crf'], // Inclui o CRF de quem cadastrou
                include: [{
                    model: Usuario, // Inclui dados do usuário associado ao farmacêutico
                    as: 'usuario',
                    attributes: ['nome'] // Mostra o nome de quem cadastrou
                }]
            }]
        });
        res.status(200).json(medicamentos);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao listar medicamentos.', detalhes: error.message });
    }
};

// FARMACÊUTICO: Editar um medicamento existente
const editar = async (req, res) => {
    const { id } = req.params; // ID do medicamento a ser editado
    const { descricao, classe } = req.body;

    if (!descricao || descricao.trim() === '') {
        return res.status(400).json({ erro: 'O campo descrição é obrigatório.' });
    }
    if (!classe || classe.trim() === '') {
        return res.status(400).json({ erro: 'O campo classe é obrigatório.' });
    }

    try {
        const farmaceutico = await Farmaceutico.findOne({
            where: { usuario_idusuario: req.usuario.id }
        });

        if (!farmaceutico) {
            return res.status(403).json({ erro: 'Perfil de farmacêutico não encontrado.' });
        }

        const medicamento = await Medicamento.findByPk(id);

        if (!medicamento) {
            return res.status(404).json({ erro: 'Medicamento não encontrado.' });
        }

        if (medicamento.farmaceutico_idfarmaceutico !== farmaceutico.idfarmaceutico) {
            return res.status(403).json({ erro: 'Você não tem permissão para editar este medicamento.' });
        }

        medicamento.descricao = descricao;
        medicamento.classe = classe;
        await medicamento.save();

        res.status(200).json(medicamento);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao editar medicamento.', detalhes: error.message });
    }
};

// FARMACÊUTICO: Deletar um medicamento
const deletar = async (req, res) => {
    const { id } = req.params; // ID do medicamento a ser deletado

    try {
        const farmaceutico = await Farmaceutico.findOne({
            where: { usuario_idusuario: req.usuario.id }
        });

        if (!farmaceutico) {
            return res.status(403).json({ erro: 'Perfil de farmacêutico não encontrado.' });
        }

        const medicamento = await Medicamento.findByPk(id);

        if (!medicamento) {
            return res.status(404).json({ erro: 'Medicamento não encontrado.' });
        }

        if (medicamento.farmaceutico_idfarmaceutico !== farmaceutico.idfarmaceutico) {
            return res.status(403).json({ erro: 'Você não tem permissão para deletar este medicamento.' });
        }

        await medicamento.destroy();

        res.status(200).json({ mensagem: 'Medicamento deletado com sucesso.' });
    } catch (error) {
        // Tratamento de erro específico para chave estrangeira (se tentar deletar medicamento em uso)
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(409).json({ erro: 'Não é possível deletar o medicamento pois ele está associado a um ou mais clientes.' });
        }
        res.status(500).json({ erro: 'Erro ao deletar medicamento.', detalhes: error.message });
    }
};

module.exports = {
    criar,
    listar,
    editar,
    deletar
};