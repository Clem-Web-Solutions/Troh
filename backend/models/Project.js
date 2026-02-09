const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define('Project', {
    project_id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false,
    },
    // Keep 'id' for compatibility if needed, or mapped? 
    // Sequelize uses the PK field name. We'll use project_id.

    // Existing fields mapped to new requirements
    client_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
    entité: {
        type: DataTypes.ENUM('RAW_DESIGN', 'MEEREO_PROJECT'),
        allowNull: false,
    },
    project_type_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    statut_global: {
        type: DataTypes.ENUM('Etude', 'Chantier', 'Livré', 'Suspendu', 'Annulé'),
        defaultValue: 'Etude',
    },
    date_creation: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    chef_projet: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    linked_project_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    // Keeping some existing fields if they don't conflict, to allow easier migration?
    // name/address are useful.
    name: {
        type: DataTypes.STRING,
        allowNull: true, // Made nullable just in case
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    tableName: 'projects',
    timestamps: false // We use date_creation
});

module.exports = Project;
