const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
    notification_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
    project_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
        references: {
            model: 'projects',
            key: 'project_id',
        },
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    type: {
        type: DataTypes.ENUM('payment', 'approval', 'deadline', 'info'),
        defaultValue: 'info',
    }
}, {
    tableName: 'notifications',
    timestamps: false
});

module.exports = Notification;
