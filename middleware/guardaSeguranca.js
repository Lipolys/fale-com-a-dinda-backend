const jwt = require('jsonwebtoken');

/**
 * Middleware para autenticação via JWT (Access Token)
 * Verifica se o token JWT no header Authorization é válido
 */
const guardaSeguranca = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            erro: 'Token não fornecido.',
            codigo: 'TOKEN_NAO_FORNECIDO'
        });
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
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

        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                erro: 'Token expirado. Use o refresh token para obter um novo.',
                codigo: 'TOKEN_EXPIRADO'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                erro: 'Token inválido.',
                codigo: 'TOKEN_INVALIDO'
            });
        }

        return res.status(401).json({
            erro: 'Erro ao validar token.',
            codigo: 'ERRO_VALIDACAO_TOKEN'
        });
    }
};

module.exports = guardaSeguranca;