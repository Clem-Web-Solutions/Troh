const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'projects',
            key: 'id',
        },
    },
    type: {
        type: DataTypes.ENUM('Payment', 'Invoice'),
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Completed', 'Cancelled'),
        defaultValue: 'Pending',
    },
    date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
    },
    dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    milestoneId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'payment_milestones',
            key: 'id' // Assuming auto-increment ID is safest for FK, though milestone_id string exists. Let's check PaymentMilestone model.
            // PaymentMilestone has 'id' (INT PK) and 'milestone_id' (STRING unique).
            // Using INT id is better for FKs usually.
        }
    }
});

module.exports = Transaction;
