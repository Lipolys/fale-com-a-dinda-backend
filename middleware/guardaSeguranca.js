// middleware/guardaSeguranca.js
const jwt = require('jsonwebtoken');

const guardaSeguranca = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ erro: 'Token não fornecido.' });
    }
    const [bearer, token] = authHeader.split(' ');

    if (!token) {
        return res.status(401).json({ erro: 'Token mal formatado.' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.usuarioId = payload.id;
        next();

    } catch (error) {
        return res.status(401).json({ erro: 'Token inválido ou expirado.' });
    }
};

module.exports = guardaSeguranca;
