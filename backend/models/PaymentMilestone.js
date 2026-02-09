const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PaymentMilestone = sequelize.define('PaymentMilestone', {
    milestone_id: {
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
    phase_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
            model: 'project_phases',
            key: 'phase_id',
        },
    },
    code: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    label: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'invoiced', 'paid'),
        defaultValue: 'pending',
    },
    due_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    condition_rule: {
        type: DataTypes.STRING(255),
        allowNull: true,
    }
}, {
    tableName: 'payment_milestones',
    timestamps: false
});

module.exports = PaymentMilestone;
