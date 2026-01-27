const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Folder = sequelize.define('Folder', {
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
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('DOCUMENTS', 'PHOTOS'),
        defaultValue: 'DOCUMENTS',
    },
    date: {
        type: DataTypes.DATEONLY, // User asked for a date
        allowNull: true,
    }
});

module.exports = Folder;
