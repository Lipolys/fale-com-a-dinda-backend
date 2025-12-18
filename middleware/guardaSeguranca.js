const jwt = require('jsonwebtoken');

/**
 * Middleware para autenticação via JWT (Access Token)
 * Verifica se o token JWT no header Authorization é válido
 */
const guardaSeguranca = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        console.warn(`[AUTH] Token não fornecido - ${req.method} ${req.url}`);
        return res.status(401).json({
            erro: 'Token não fornecido.',
            codigo: 'TOKEN_NAO_FORNECIDO'
        });
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
        console.warn(`[AUTH] Token mal formatado - ${req.method} ${req.url}`);
        return res.status(401).json({
            erro: 'Token mal formatado. Use: Bearer <token>',
            codigo: 'TOKEN_MAL_FORMATADO'
        });
    }

    try {
        // Verifica e decodifica o token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Adiciona os dados do usuário no objeto req
        req.usuario = {
            id: decoded.id,
            tipo: decoded.tipo,
            email: decoded.email
        };

        // Log de sucesso (opcional, comentar em produção se gerar muito log)
        // console.log(`[AUTH] Usuário autenticado: ${decoded.email} (${decoded.tipo})`);

        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.warn(`[AUTH] Token expirado - ${req.method} ${req.url}`, {
                expiredAt: error.expiredAt
            });
            return res.status(401).json({
                erro: 'Token expirado. Use o refresh token para obter um novo.',
                codigo: 'TOKEN_EXPIRADO',
                expiredAt: error.expiredAt
            });
        }

        if (error.name === 'JsonWebTokenError') {
            console.warn(`[AUTH] Token inválido - ${req.method} ${req.url}`, {
                message: error.message
            });
            return res.status(401).json({
                erro: 'Token inválido.',
                codigo: 'TOKEN_INVALIDO'
            });
        }

        console.error(`[AUTH] Erro ao validar token - ${req.method} ${req.url}`, error);
        return res.status(401).json({
            erro: 'Erro ao validar token.',
            codigo: 'ERRO_VALIDACAO_TOKEN'
        });
    }
};

module.exports = guardaSeguranca;