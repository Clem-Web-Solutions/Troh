const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Amendment = sequelize.define('Amendment', {
    amendment_id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false,
    },
    project_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
            model: 'projects',
            key: 'project_id',
        },
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    amount_added: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.00,
    },
    amount_removed: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.00,
    },
    status: {
        type: DataTypes.ENUM('draft', 'approved', 'rejected', 'completed'),
        defaultValue: 'draft',
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    approved_at: {
        type: DataTypes.DATE,
        allowNull: true,
    }
}, {
    tableName: 'amendments',
    timestamps: false
});

module.exports = Amendment;
