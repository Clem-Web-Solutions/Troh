const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Phase = sequelize.define('Phase', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'projects',
            key: 'id',
        },
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'active', 'completed'),
        defaultValue: 'pending',
    },
    category: {
        type: DataTypes.STRING, // 'DESIGN' or 'CONSTRUCTION'
        defaultValue: 'DESIGN'
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    comments: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'Phases',
    timestamps: true
});

module.exports = Phase;
