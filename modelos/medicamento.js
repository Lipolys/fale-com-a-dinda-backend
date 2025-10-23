const { DataTypes } = require('sequelize');
const sequelize = require('./banco');

const Medicamento = sequelize.define('Medicamento', {
    idmedicamento: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    farmaceutico_idfarmaceutico: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'farmaceutico',
            key: 'idfarmaceutico'
        }
    },
    nome: {
        type: DataTypes.STRING(45),
        allowNull: false
    },
    descricao: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    classe: {
        type: DataTypes.STRING(45),
        allowNull: false
    }
}, {
    tableName: 'medicamento',
    timestamps: false // O DDL gerencia createdAt/updatedAt
});

module.exports = Medicamento;