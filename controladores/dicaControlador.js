
const { Dica, Farmaceutico, Usuario} = require('../modelos/associacoes');

const criar = async (req, res) => {
    const { texto } = req.body;

    // Validação de entrada
    if (!texto || texto.trim() === '') {
        return res.status(400).json({ erro: 'O campo texto é obrigatório.' });
    }

    try {
        const farmaceutico = await Farmaceutico.findOne({
            where: { usuario_idusuario: req.usuario.id }
        });

        if (!farmaceutico) {
            return res.status(403).json({ erro: 'Perfil de farmacêutico não encontrado.' });
        }

        const novaDica = await Dica.create({
            texto,
            farmaceutico_idfarmaceutico: farmaceutico.idfarmaceutico
        });

        res.status(201).json(novaDica);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao criar dica.', detalhes: error.message });
    }
};

const listar = async (req, res) => {
    try {
        const dicas = await Dica.findAll({
            include: [{
                model: Farmaceutico,
                as: 'farmaceutico',
                attributes: ['crf'], // Só inclua o CRF
                include: [{
                    model: Usuario, // Inclui o modelo Usuario associado ao Farmaceutico
                    as: 'usuario',
                    attributes: ['nome'] // Para mostrar o nome do autor da dica
                }]
            }]
        });
        res.status(200).json(dicas);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao listar dicas.', detalhes: error.message });
    }
};

const editar = async (req, res) => {
    const { id } = req.params;
    const { texto } = req.body;

    // Validação de entrada
    if (!texto || texto.trim() === '') {
        return res.status(400).json({ erro: 'O campo texto é obrigatório.' });
    }

    try {
        const farmaceutico = await Farmaceutico.findOne({
            where: { usuario_idusuario: req.usuario.id }
        });

        if (!farmaceutico) {
            return res.status(403).json({ erro: 'Perfil de farmacêutico não encontrado.' });
        }

        const dica = await Dica.findByPk(id);

        if (!dica) {
            return res.status(404).json({ erro: 'Dica não encontrada.' });
        }

        // Verificar se a dica pertence ao farmacêutico autenticado
        if (dica.farmaceutico_idfarmaceutico !== farmaceutico.idfarmaceutico) {
            return res.status(403).json({ erro: 'Você não tem permissão para editar esta dica.' });
        }

        dica.texto = texto;
        await dica.save();

        res.status(200).json(dica);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao editar dica.', detalhes: error.message });
    }
};

const deletar = async (req, res) => {
    const { id } = req.params;

    try {
        const farmaceutico = await Farmaceutico.findOne({
            where: { usuario_idusuario: req.usuario.id }
        });

        if (!farmaceutico) {
            return res.status(403).json({ erro: 'Perfil de farmacêutico não encontrado.' });
        }

        const dica = await Dica.findByPk(id);

        if (!dica) {
            return res.status(404).json({ erro: 'Dica não encontrada.' });
        }

        // Verificar se a dica pertence ao farmacêutico autenticado
        if (dica.farmaceutico_idfarmaceutico !== farmaceutico.idfarmaceutico) {
            return res.status(403).json({ erro: 'Você não tem permissão para deletar esta dica.' });
        }

        await dica.destroy();

        res.status(200).json({ mensagem: 'Dica deletada com sucesso.' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao deletar dica.', detalhes: error.message });
    }
};

module.exports = {
    criar,
    listar,
    editar,
    deletar
};