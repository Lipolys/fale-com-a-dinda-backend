// middleware/checarPermissao.js

/**
 * Cria um middleware que verifica se o tipo do usuário logado
 * está incluído na lista de tiposPermitidos.
 * * @param {Array<string>} tiposPermitidos - Ex: ['FARMACEUTICO'] ou ['CLIENTE']
 */
const checarPermissao = (tiposPermitidos) => {

    return (req, res, next) => {
        // Pega o tipo do usuário que o 'guardaSeguranca' anexou
        const tipoUsuario = req.usuario.tipo;

        if (!tipoUsuario || !tiposPermitidos.includes(tipoUsuario)) {
            return res.status(403).json({
                erro: 'Acesso negado. Você não tem permissão para este recurso.'
            });
        }

        // Se o tipo está na lista, pode prosseguir
        next();
    };
};

module.exports = checarPermissao;