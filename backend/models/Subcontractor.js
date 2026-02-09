const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subcontractor = sequelize.define('Subcontractor', {
    subcontractor_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    specialty: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    contact_email: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    contact_phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    siret: {
        type: DataTypes.STRING(50),
        allowNull: true,
    }
}, {
    tableName: 'subcontractors',
    timestamps: false
});

module.exports = Subcontractor;
