const { DataTypes } = require('sequelize');
const sequelize = require('./banco');

const Interacao = sequelize.define('Interacao', {
    idmedicamento1: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Chave primária composta
        references: {
            model: 'medicamento',
            key: 'idmedicamento'
        }
    },
    idmedicamento2: {
        type: DataTypes.INTEGER,
        primaryKey: true, // Chave primária composta
        references: {
            model: 'medicamento',
            key: 'idmedicamento'
        }
    },
    farmaceutico_idfarmaceutico: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'farmaceutico',
            key: 'idfarmaceutico'
        }
    },
    descricao: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    gravidade: {
        type: DataTypes.ENUM('BAIXA', 'MEDIA', 'ALTA'),
        allowNull: false
    },
    fonte: {
        type: DataTypes.STRING(45),
        allowNull: true
    }
}, {
    tableName: 'interacao',
    timestamps: false // O DDL gerencia createdAt/updatedAt
});

module.exports = Interacao;