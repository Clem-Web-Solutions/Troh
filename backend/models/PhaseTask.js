const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PhaseTask = sequelize.define('PhaseTask', {
    task_id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false,
    },
    phase_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
            model: 'project_phases',
            key: 'phase_id',
        },
    },
    libellé: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    statut: {
        type: DataTypes.ENUM('todo', 'in_progress', 'done'),
        defaultValue: 'todo',
    },
    approval_status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: null,
    }
}, {
    tableName: 'phase_tasks',
    timestamps: false
});

module.exports = PhaseTask;
