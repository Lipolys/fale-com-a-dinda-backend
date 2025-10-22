const { DataTypes } = require('sequelize');
const sequelize = require('./banco');

const Cliente = sequelize.define('Cliente', {
    idcliente: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuario_idusuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuario', // Nome da tabela de referência
            key: 'idusuario'
        }
    }
}, {
    tableName: 'cliente',
    timestamps: false // O DDL não especifica timestamps para esta tabela
});

module.exports = Cliente;