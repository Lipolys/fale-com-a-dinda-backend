const Sequelize = require('sequelize');
const banco = require('./banco');

const Notificacao = banco.define('notificacao', {
    idnotificacao: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    farmaceutico_idfarmaceutico: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    cliente_idcliente: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    titulo: {
        type: Sequelize.STRING(100),
        allowNull: false
    },
    mensagem: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    lida: {
        type: Sequelize.BOOLEAN, // Sequelize maps TINYINT(1) to BOOLEAN often, but let's stick to standard types.
        allowNull: false,
        defaultValue: false
    },
    data_envio: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    }
}, {
    tableName: 'notificacao',
    timestamps: true // createdAt and updatedAt are in the DDL
});

module.exports = Notificacao;
