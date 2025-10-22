const Usuario = require ('../modelos/usuario');
const bcrypt = require("bcrypt");
const {sign} = require("jsonwebtoken");

const cadastrar = async (req, res) => {
    const novoUsuario = await Usuario.create({ email: req.body.email, senha: req.body.senha });
    //await novoUsuario.reload();
    res.status(201).json(novoUsuario);
}

const login = async (req, res) => {
    const login = req.body;
    const usuario = await Usuario.scope('comSenha').findOne({
        where: {
            email: login.email,
        }
    });
    if (!usuario) {
        res.status(401).json({erro: "Usuário não encontrado"})
    }
    if (await bcrypt.compare(login.senha, usuario.senha) === true){
        const token = sign(
            { id: usuario.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.status(200).json({token: token});
    } else {
        res.status(401).json({erro: "Usuário não encontrado"})
    }
}

module.exports = {
    cadastrar,
    login
}