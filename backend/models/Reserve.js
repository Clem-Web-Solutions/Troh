const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reserve = sequelize.define('Reserve', {
    reserve_id: {
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
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    severity: {
        type: DataTypes.ENUM('minor', 'major', 'blocking'),
        defaultValue: 'minor',
    },
    status: {
        type: DataTypes.ENUM('open', 'resolved'),
        defaultValue: 'open',
    },
    reported_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    resolved_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    photo_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
    }
}, {
    tableName: 'reserves',
    timestamps: false
});

module.exports = Reserve;
