const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Phase = sequelize.define('Phase', {
    phase_id: {
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
    etape: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    statut: {
        type: DataTypes.ENUM('pending', 'active', 'completed', 'blocked'),
        defaultValue: 'pending',
    },
    date_debut: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    date_fin: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    // Compat fields
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
}, {
    tableName: 'project_phases',
    timestamps: false
});

module.exports = Phase;
