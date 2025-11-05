const jwt = require('jsonwebtoken');
const RefreshToken = require('../modelos/refreshToken');
const Usuario = require('../modelos/usuario');

/**
 * Serviço para gerenciamento de tokens JWT e Refresh Tokens
 */
class TokenServico {

    /**
     * Gera um access token (JWT de curta duração)
     * @param {Object} payload - Dados do usuário para incluir no token
     * @returns {string} Access token
     */
    static gerarAccessToken(payload) {
        return jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m' }
        );
    }

    /**
     * Gera um refresh token (JWT de longa duração)
     * @param {Object} payload - Dados do usuário para incluir no token
     * @returns {string} Refresh token
     */
    static gerarRefreshToken(payload) {
        return jwt.sign(
            payload,
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d' }
        );
    }

    /**
     * Calcula a data de expiração do refresh token
     * @returns {Date} Data de expiração
     */
    static calcularDataExpiracao() {
        const expiracao = process.env.JWT_REFRESH_EXPIRATION || '7d';
        const duracao = this.converterDuracaoParaMs(expiracao);
        return new Date(Date.now() + duracao);
    }

    /**
     * Converte string de duração (ex: '7d', '24h') para milissegundos
     * @param {string} duracao - String de duração
     * @returns {number} Duração em milissegundos
     */
    static converterDuracaoParaMs(duracao) {
        const unidade = duracao.slice(-1);
        const valor = parseInt(duracao.slice(0, -1));

        const conversoes = {
            's': 1000,
            'm': 60 * 1000,
            'h': 60 * 60 * 1000,
            'd': 24 * 60 * 60 * 1000
        };

        return valor * (conversoes[unidade] || conversoes['d']);
    }

    /**
     * Salva o refresh token no banco de dados
     * @param {number} usuarioId - ID do usuário
     * @param {string} token - Refresh token gerado
     * @param {string} deviceInfo - Informações do dispositivo (opcional)
     * @returns {Promise<RefreshToken>} Refresh token salvo
     */
    static async salvarRefreshToken(usuarioId, token, deviceInfo = null) {
        try {
            const expiresAt = this.calcularDataExpiracao();

            const refreshToken = await RefreshToken.create({
                usuario_idusuario: usuarioId,
                token: token,
                expires_at: expiresAt,
                device_info: deviceInfo,
                created_at: new Date()
            });

            return refreshToken;
        } catch (error) {
            console.error('Erro ao salvar refresh token:', error);
            throw new Error('Erro ao salvar refresh token no banco de dados');
        }
    }

    /**
     * Verifica se um refresh token é válido
     * @param {string} token - Refresh token a verificar
     * @returns {Promise<Object|null>} Dados do token se válido, null caso contrário
     */
    static async verificarRefreshToken(token) {
        try {
            // Verifica a assinatura e expiração do JWT
            const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

            // Busca o token no banco de dados
            const refreshToken = await RefreshToken.findOne({
                where: { token },
                include: [{
                    model: Usuario,
                    as: 'usuario',
                    attributes: ['idusuario', 'nome', 'email', 'tipo']
                }]
            });

            // Verifica se o token existe e está ativo
            if (!refreshToken || !refreshToken.isActive()) {
                return null;
            }

            return {
                decoded,
                refreshToken,
                usuario: refreshToken.usuario
            };
        } catch (error) {
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return null;
            }
            throw error;
        }
    }

    /**
     * Revoga um refresh token específico
     * @param {string} token - Token a revogar
     * @returns {Promise<boolean>} True se revogado com sucesso
     */
    static async revogarToken(token) {
        try {
            const refreshToken = await RefreshToken.findOne({
                where: { token }
            });

            if (!refreshToken) {
                return false;
            }

            refreshToken.is_revoked = true;
            refreshToken.revoked_at = new Date();
            await refreshToken.save();

            return true;
        } catch (error) {
            console.error('Erro ao revogar token:', error);
            throw error;
        }
    }

    /**
     * Revoga todos os tokens de um usuário (útil para logout em todos os dispositivos)
     * @param {number} usuarioId - ID do usuário
     * @returns {Promise<number>} Quantidade de tokens revogados
     */
    static async revogarTodosTokensDoUsuario(usuarioId) {
        try {
            const [quantidadeAtualizada] = await RefreshToken.update(
                {
                    is_revoked: true,
                    revoked_at: new Date()
                },
                {
                    where: {
                        usuario_idusuario: usuarioId,
                        is_revoked: false
                    }
                }
            );

            return quantidadeAtualizada;
        } catch (error) {
            console.error('Erro ao revogar tokens do usuário:', error);
            throw error;
        }
    }

    /**
     * Rotaciona um refresh token (cria novo e revoga o antigo)
     * @param {string} tokenAntigo - Token antigo a ser rotacionado
     * @param {string} novoToken - Novo token gerado
     * @returns {Promise<boolean>} True se rotacionado com sucesso
     */
    static async rotacionarToken(tokenAntigo, novoToken) {
        try {
            const refreshToken = await RefreshToken.findOne({
                where: { token: tokenAntigo }
            });

            if (!refreshToken) {
                return false;
            }

            // Marca o token antigo como substituído
            refreshToken.is_revoked = true;
            refreshToken.revoked_at = new Date();
            refreshToken.replaced_by_token = novoToken;
            await refreshToken.save();

            return true;
        } catch (error) {
            console.error('Erro ao rotacionar token:', error);
            throw error;
        }
    }

    /**
     * Remove tokens expirados do banco de dados
     * @returns {Promise<number>} Quantidade de tokens removidos
     */
    static async limparTokensExpirados() {
        try {
            const quantidadeRemovida = await RefreshToken.destroy({
                where: {
                    expires_at: {
                        [require('sequelize').Op.lt]: new Date()
                    }
                }
            });

            return quantidadeRemovida;
        } catch (error) {
            console.error('Erro ao limpar tokens expirados:', error);
            throw error;
        }
    }

    /**
     * Busca todos os tokens ativos de um usuário
     * @param {number} usuarioId - ID do usuário
     * @returns {Promise<Array>} Lista de tokens ativos
     */
    static async buscarTokensAtivosDoUsuario(usuarioId) {
        try {
            const tokens = await RefreshToken.findAll({
                where: {
                    usuario_idusuario: usuarioId,
                    is_revoked: false
                },
                attributes: ['idrefreshtoken', 'device_info', 'created_at', 'expires_at'],
                order: [['created_at', 'DESC']]
            });

            return tokens;
        } catch (error) {
            console.error('Erro ao buscar tokens ativos:', error);
            throw error;
        }
    }

    /**
     * Gera par de tokens (access + refresh) para um usuário
     * @param {Object} usuario - Objeto do usuário
     * @param {string} deviceInfo - Informações do dispositivo (opcional)
     * @returns {Promise<Object>} Par de tokens
     */
    static async gerarParDeTokens(usuario, deviceInfo = null) {
        const payload = {
            id: usuario.idusuario,
            tipo: usuario.tipo,
            email: usuario.email
        };

        const accessToken = this.gerarAccessToken(payload);
        const refreshToken = this.gerarRefreshToken(payload);

        // Salva o refresh token no banco
        await this.salvarRefreshToken(usuario.idusuario, refreshToken, deviceInfo);

        return {
            accessToken,
            refreshToken,
            expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m'
        };
    }
}

module.exports = TokenServico;

