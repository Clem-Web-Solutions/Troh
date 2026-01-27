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
            model: 'Projects',
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
        type: DataTypes.STRING,
        allowNull: false,
    },
    category: {
        type: DataTypes.ENUM('Plans', 'Administratif', 'Financier', 'Technique', 'Photos', 'PV', 'Autre'),
        defaultValue: 'Autre',
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    uploadDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

module.exports = Document;
