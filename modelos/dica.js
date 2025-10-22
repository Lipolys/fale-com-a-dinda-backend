const { DataTypes } = require('sequelize');
const sequelize = require('./banco');

const Dica = sequelize.define('Dica', {
    iddica: {
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
    texto: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'dica',
    timestamps: false // O DDL gerencia createdAt/updatedAt
});

module.exports = Dica;