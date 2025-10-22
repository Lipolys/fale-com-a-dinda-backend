const {DataTypes} = require('sequelize');
const sequelize = require('../banco')
const Usuario = require('./usuario');

const Mensagem = sequelize.define('Mensagem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    texto: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "O campo 'texto' não pode ser vazio"
            }
        }
    }
})

Mensagem.belongsTo(Usuario);

module.exports = Mensagem;