const { DataTypes } = require('sequelize');
const sequelize = require('./banco');

const Faq = sequelize.define('Faq', {
    idfaq: {
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
    pergunta: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    resposta: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'faq',
    timestamps: false // O DDL gerencia createdAt/updatedAt
});

module.exports = Faq;