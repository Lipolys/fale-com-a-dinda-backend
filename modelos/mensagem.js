const {DataTypes} = require('sequelize');
const sequelize = require('../banco')

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

module.exports = Mensagem;