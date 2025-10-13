const Mensagem = require('../modelos/mensagem');

const listarTodas = async (req, res) => {
    const mensagens = await Mensagem.findAll();
    res.json(mensagens);
}

const inserir = async (req, res) => {
    const novaMensagem = await Mensagem.create({ texto: req.body.texto });
    res.status(201).json(novaMensagem);
}

const editar = async (req, res) => {
    const id = req.params.id;
    const novoTexto = req.body.texto;
    const mensagem = await Mensagem.findByPk(id);

    if (!mensagem) {
        return res.status(404).json({erro: 'Mensagem não encontrada'});
    }

    mensagem.texto = novoTexto;
    await mensagem.save();
    res.status(200).json({mensagem});
}

const deletar = async (req, res) => {
    const id = req.params.id;
    const mensagem = await Mensagem.findByPk(id);

    if (!mensagem) {
        return res.status(404).json({ erro: 'Mensagem não encontrada.' });
    }

    await mensagem.destroy();
    res.status(204).send();
}

module.exports = {
    listarTodas,
    inserir,
    editar,
    deletar
}