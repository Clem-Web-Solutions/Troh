const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProjectSubcontractor = sequelize.define('ProjectSubcontractor', {
    id: {
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
    subcontractor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'subcontractors',
            key: 'subcontractor_id',
        },
    },
    contract_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },
    assigned_date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: 'project_subcontractors',
    timestamps: false
});

module.exports = ProjectSubcontractor;
