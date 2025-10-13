const { DataTypes } = require('sequelize');
const sequelize = require('../banco');
const bcrypt = require('bcrypt');

const salt = Number(process.env.SALT);

const Usuario = sequelize.define('Usuario', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    senha: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    defaultScope: {
        attributes: { exclude: ['senha'] }
    },
    scopes: {
        comSenha: {
            attributes: { include: ['senha'] }
        }
    },
    hooks: {
        async beforeCreate(attributes, options) {
            attributes.senha = await bcrypt.hash(attributes.senha, salt);
        }
    }
});

module.exports = Usuario;