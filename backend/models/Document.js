const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Document = sequelize.define('Document', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Projects', // Matches Folder.js
            key: 'id',
        },
    },
    folderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Folders',
            key: 'id',
        },
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    category: {
        type: DataTypes.ENUM('Plan', 'Facture', 'Contrat', 'Autre'),
        defaultValue: 'Autre',
    },
    url: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    version: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    uploaded_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    uploaded_by: {
        type: DataTypes.INTEGER, // User ID reference
        allowNull: true,
    }
}, {
    tableName: 'documents',
    timestamps: false
});

module.exports = Document;
