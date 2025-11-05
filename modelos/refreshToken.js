const { DataTypes } = require('sequelize');
const sequelize = require('./banco');

/**
 * Modelo para armazenar Refresh Tokens
 * Permite invalidação e rotação de tokens
 */
const RefreshToken = sequelize.define('RefreshToken', {
    idrefreshtoken: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuario_idusuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuario',
            key: 'idusuario'
        }
    },
    token: {
        type: DataTypes.STRING(500), // JWT pode ser longo
        allowNull: false,
        unique: true
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    // Para identificar dispositivo/sessão
    device_info: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    // Controle de uso
    is_revoked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    revoked_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // Para implementar token family (detectar roubo)
    replaced_by_token: {
        type: DataTypes.STRING(500),
        allowNull: true
    }
}, {
    tableName: 'refresh_token',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['token']
        },
        {
            fields: ['usuario_idusuario']
        },
        {
            fields: ['expires_at']
        }
    ]
});

// Métodos auxiliares
RefreshToken.prototype.isExpired = function() {
    return this.expires_at < new Date();
};

RefreshToken.prototype.isActive = function() {
    return !this.is_revoked && !this.isExpired();
};

module.exports = RefreshToken;