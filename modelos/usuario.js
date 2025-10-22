const { DataTypes } = require('sequelize');
const sequelize = require('./banco');
const bcrypt = require('bcrypt');

const salt = Number(process.env.SALT);

const Usuario = sequelize.define('Usuario', {
    idusuario: { // <--- Importante
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: DataTypes.STRING(45),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    },
    senha: {
        type: DataTypes.STRING(60), // O DDL especifica 60, o que é bom para bcrypt
        allowNull: false,
    },
    telefone: {
        type: DataTypes.STRING(45),
        allowNull: false
    },
    nascimento: {
        type: DataTypes.DATEONLY, // Use DATEONLY para 'DATE' do SQL
        allowNull: false
    },
    tipo: {
        type: DataTypes.ENUM('CLIENTE', 'FARMACEUTICO'),
        allowNull: false
    }
}, {
    tableName: 'usuario',
    timestamps: false,
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