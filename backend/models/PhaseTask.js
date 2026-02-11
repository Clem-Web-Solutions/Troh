const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PhaseTask = sequelize.define('PhaseTask', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    phaseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Phases',
            key: 'id',
        },
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('todo', 'in_progress', 'done'),
        defaultValue: 'todo',
    },
    approval_status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: null,
    }
}, {
    tableName: 'PhaseTasks',
    timestamps: true
});

module.exports = PhaseTask;
