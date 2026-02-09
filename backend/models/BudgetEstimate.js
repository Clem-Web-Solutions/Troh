const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BudgetEstimate = sequelize.define('BudgetEstimate', {
    estimate_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    project_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
            model: 'projects',
            key: 'project_id',
        },
    },
    category: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    estimated_amount: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.00,
    },
    actual_amount: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.00,
    },
    last_updated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: 'budget_estimates',
    timestamps: false
});

module.exports = BudgetEstimate;
