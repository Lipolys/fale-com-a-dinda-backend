const Usuario = require ('../modelos/usuario');
const sequelize = require('../modelos/banco');
const bcrypt = require("bcrypt");
const {Cliente, Farmaceutico} = require("../modelos/associacoes");
const TokenServico = require('../servicos/tokenServico');

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
            erro: 'Email e senha são obrigatórios.',
            codigo: 'CREDENCIAIS_INCOMPLETAS'
        });
    }

    try {
        console.log(`[LOGIN] Tentativa de login para: ${email}`);

        const usuario = await Usuario.scope('comSenha').findOne({
            where: { email }
        });

        // Verifica usuário e senha de forma segura
        if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
            console.warn(`[LOGIN] Credenciais inválidas para: ${email}`);
            return res.status(401).json({
                erro: 'Credenciais inválidas.',
                codigo: 'CREDENCIAIS_INVALIDAS'
            });
        }

        // Obtém informações do dispositivo do header (opcional)
        const deviceInfo = req.headers['user-agent'] || null;

        // Gera par de tokens (access + refresh)
        const tokens = await TokenServico.gerarParDeTokens(usuario, deviceInfo);

        console.log(`[LOGIN] Login bem-sucedido para: ${email} (${usuario.tipo})`);

        res.status(200).json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.expiresIn,
            usuario: {
                id: usuario.idusuario,
                nome: usuario.nome,
                email: usuario.email,
                telefone: usuario.telefone,
                tipo: usuario.tipo
            }
        });

    } catch (error) {
        console.error('[LOGIN] Erro ao fazer login:', error);
        res.status(500).json({
            erro: 'Erro ao processar login.',
            codigo: 'ERRO_PROCESSAR_LOGIN'
        });
    }
};

/**
 * Renova o access token usando um refresh token válido
 */
const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({
            erro: 'Refresh token é obrigatório.',
            codigo: 'REFRESH_TOKEN_OBRIGATORIO'
        });
    }

    try {
        console.log('[REFRESH] Tentando renovar token...');

        // Verifica se o refresh token é válido
        const resultado = await TokenServico.verificarRefreshToken(refreshToken);

        if (!resultado) {
            console.warn('[REFRESH] Refresh token inválido ou expirado');
            return res.status(401).json({
                erro: 'Refresh token inválido ou expirado.',
                codigo: 'REFRESH_TOKEN_INVALIDO'
            });
        }

        const { usuario } = resultado;
        console.log(`[REFRESH] Token válido para usuário: ${usuario.email}`);

        // Gera novo par de tokens
        const deviceInfo = req.headers['user-agent'] || null;
        const novosTokens = await TokenServico.gerarParDeTokens(usuario, deviceInfo);

        // Rotaciona o token antigo (revoga o antigo e salva o novo)
        await TokenServico.rotacionarToken(
            refreshToken,
            usuario.idusuario,
            novosTokens.refreshToken,
            deviceInfo
        );

        console.log(`[REFRESH] Tokens renovados com sucesso para usuário: ${usuario.email}`);

        res.status(200).json({
            accessToken: novosTokens.accessToken,
            refreshToken: novosTokens.refreshToken,
            expiresIn: novosTokens.expiresIn
        });

    } catch (error) {
        console.error('[REFRESH] Erro ao renovar token:', error);
        res.status(500).json({
            erro: 'Erro ao renovar token.',
            codigo: 'ERRO_RENOVAR_TOKEN'
        });
    }
};

/**
 * Logout - revoga o refresh token atual
 */
const logout = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({
            erro: 'Refresh token é obrigatório.',
            codigo: 'REFRESH_TOKEN_OBRIGATORIO'
        });
    }

    try {
        console.log('[LOGOUT] Tentando revogar token...');

        const sucesso = await TokenServico.revogarToken(refreshToken);

        if (!sucesso) {
            console.warn('[LOGOUT] Token não encontrado para revogação');
            return res.status(404).json({
                erro: 'Token não encontrado.',
                codigo: 'TOKEN_NAO_ENCONTRADO'
            });
        }

        console.log('[LOGOUT] Logout realizado com sucesso');

        res.status(200).json({
            mensagem: 'Logout realizado com sucesso.'
        });

    } catch (error) {
        console.error('[LOGOUT] Erro ao fazer logout:', error);
        res.status(500).json({
            erro: 'Erro ao processar logout.',
            codigo: 'ERRO_PROCESSAR_LOGOUT'
        });
    }
};

module.exports = {
    cadastrar,
    login,
    refreshToken,
    logout
};