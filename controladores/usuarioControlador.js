const Usuario = require ('../modelos/usuario');
const sequelize = require('../modelos/banco');
const bcrypt = require("bcrypt");
const {sign} = require("jsonwebtoken");
const {Cliente, Farmaceutico} = require("../modelos/associacoes");

const cadastrar = async (req, res) => {
    const { nome, email, senha, telefone, nascimento, tipo, crf } = req.body;
    
    // Validação de campos obrigatórios
    if (!nome || !email || !senha || !telefone || !nascimento || !tipo) {
        return res.status(400).json({ 
            erro: 'Todos os campos são obrigatórios.' 
        });
    }

    // Validação do tipo de usuário
    if (!['CLIENTE', 'FARMACEUTICO'].includes(tipo)) {
        return res.status(400).json({ 
            erro: 'Tipo de usuário inválido.' 
        });
    }

    // Validação específica para farmacêutico
    if (tipo === 'FARMACEUTICO' && !crf) {
        return res.status(400).json({ 
            erro: 'CRF é obrigatório para farmacêuticos.' 
        });
    }

    const t = await sequelize.transaction();

    try {
        // Verifica se o email já existe
        const usuarioExistente = await Usuario.findOne({ 
            where: { email } 
        });
        
        if (usuarioExistente) {
            return res.status(409).json({ 
                erro: 'Email já cadastrado.' 
            });
        }

        const novoUsuario = await Usuario.create({
            nome, 
            email, 
            senha, 
            telefone, 
            nascimento, 
            tipo
        }, { transaction: t });

        // Cria o registro específico baseado no tipo
        if (tipo === 'CLIENTE') {
            await Cliente.create({
                usuario_idusuario: novoUsuario.idusuario
            }, { transaction: t });
        } else if (tipo === 'FARMACEUTICO') {
            await Farmaceutico.create({
                usuario_idusuario: novoUsuario.idusuario,
                crf: crf
            }, { transaction: t });
        }

        await t.commit();
        
        // Retorna o usuário sem a senha
        const usuarioResposta = novoUsuario.toJSON();
        delete usuarioResposta.senha;
        
        res.status(201).json({ 
            mensagem: 'Usuário cadastrado com sucesso.', 
            usuario: usuarioResposta 
        });

    } catch (error) {
        await t.rollback();
        console.error('Erro ao cadastrar usuário:', error);
        
        // Tratamento de erros específicos do Sequelize
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ 
                erro: 'Dados inválidos.', 
                detalhes: error.errors.map(e => e.message) 
            });
        }
        
        res.status(500).json({ 
            erro: 'Erro ao cadastrar usuário.' 
        });
    }
};

const login = async (req, res) => {
    const { email, senha } = req.body;
    
    // Validação de entrada
    if (!email || !senha) {
        return res.status(400).json({ 
            erro: 'Email e senha são obrigatórios.' 
        });
    }

    try {
        const usuario = await Usuario.scope('comSenha').findOne({
            where: { email }
        });

        // Verifica usuário e senha de forma segura
        if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
            return res.status(401).json({ 
                erro: 'Credenciais inválidas.' 
            });
        }

        // Gera o token JWT
        const token = sign(
            { 
                id: usuario.idusuario, 
                tipo: usuario.tipo,
                email: usuario.email 
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ 
            token,
            usuario: {
                id: usuario.idusuario,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo
            }
        });

    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ 
            erro: 'Erro ao processar login.' 
        });
    }
};

module.exports = {
    cadastrar,
    login
};