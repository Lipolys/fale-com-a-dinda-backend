const { DataTypes } = require('sequelize');
const sequelize = require('./banco');

const Farmaceutico = sequelize.define('Farmaceutico', {
    idfarmaceutico: {
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
    },
    crf: {
        type: DataTypes.STRING(45),
        allowNull: false
    }
}, {
    tableName: 'farmaceutico',
    timestamps: false // O DDL não especifica timestamps para esta tabela
});

module.exports = Farmaceutico;