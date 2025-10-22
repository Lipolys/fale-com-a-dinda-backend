const { DataTypes } = require('sequelize');
const sequelize = require('./banco');

const Ministra = sequelize.define('Ministra', {
    idministra: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cliente_idcliente: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'cliente',
            key: 'idcliente'
        }
    },
    medicamento_idmedicamento: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'medicamento',
            key: 'idmedicamento'
        }
    },
    horario: {
        type: DataTypes.TIME, // Corresponde ao TIME do SQL
        allowNull: true
    },
    dosagem: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    frequencia: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: DataTypes.TINYINT,
        allowNull: true
    }
}, {
    tableName: 'ministra',
    timestamps: false // O DDL gerencia createdAt/updatedAt
});

module.exports = Ministra;