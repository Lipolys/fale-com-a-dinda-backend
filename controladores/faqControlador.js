const { Faq, Farmaceutico, Usuario} = require('../modelos/associacoes');

const criar = async (req, res) => {
    const { pergunta, resposta } = req.body;

    // Validação de entrada
    if (!pergunta || pergunta.trim() === '') {
        return res.status(400).json({ erro: 'O campo pergunta é obrigatório.' });
    }
    
    if (!resposta || resposta.trim() === '') {
        return res.status(400).json({ erro: 'O campo resposta é obrigatório.' });
    }

    try {
        const farmaceutico = await Farmaceutico.findOne({
            where: { usuario_idusuario: req.usuario.id }
        });

        if (!farmaceutico) {
            return res.status(403).json({ erro: 'Perfil de farmacêutico não encontrado.' });
        }

        const novaFaq = await Faq.create({
            pergunta,
            resposta,
            farmaceutico_idfarmaceutico: farmaceutico.idfarmaceutico
        });

        res.status(201).json(novaFaq);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao criar FAQ.', detalhes: error.message });
    }
};

const listar = async (req, res) => {
    try {
        const faqs = await Faq.findAll({
            include: [{
                model: Farmaceutico,
                as: 'farmaceutico',
                attributes: ['crf'],
                include: [{
                    model: Usuario,
                    as: 'usuario',
                    attributes: ['nome']
                }]
            }]
        });
        res.status(200).json(faqs);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao listar FAQs.', detalhes: error.message });
    }
};

const editar = async (req, res) => {
    const { id } = req.params;
    const { pergunta, resposta } = req.body;

    // Validação de entrada
    if (!pergunta || pergunta.trim() === '') {
        return res.status(400).json({ erro: 'O campo pergunta é obrigatório.' });
    }
    
    if (!resposta || resposta.trim() === '') {
        return res.status(400).json({ erro: 'O campo resposta é obrigatório.' });
    }

    try {
        const farmaceutico = await Farmaceutico.findOne({
            where: { usuario_idusuario: req.usuario.id }
        });

        if (!farmaceutico) {
            return res.status(403).json({ erro: 'Perfil de farmacêutico não encontrado.' });
        }

        const faq = await Faq.findByPk(id);

        if (!faq) {
            return res.status(404).json({ erro: 'FAQ não encontrada.' });
        }

        faq.pergunta = pergunta;
        faq.resposta = resposta;
        await faq.save();

        res.status(200).json(faq);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao editar FAQ.', detalhes: error.message });
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

        const faq = await Faq.findByPk(id);

        if (!faq) {
            return res.status(404).json({ erro: 'FAQ não encontrada.' });
        }

        await faq.destroy();

        res.status(200).json({ mensagem: 'FAQ deletada com sucesso.' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao deletar FAQ.', detalhes: error.message });
    }
};

module.exports = {
    criar,
    listar,
    editar,
    deletar
};