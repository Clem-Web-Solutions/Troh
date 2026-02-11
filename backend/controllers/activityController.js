const { Activity, sequelize } = require('../models');
const { Sequelize, Op } = require('sequelize');

// Helper to log activity (interally used)
exports.logActivity = async (type, description, projectId, userId) => {
    try {
        await Activity.create({
            type,
            description,
            projectId,
            userId
        });
    } catch (err) {
        console.error('Failed to log activity:', err);
    }
};

// Get recent activities for notifications
exports.getRecentActivities = async (req, res) => {
    try {
        if (!req.user) {
            console.error('ActivityController: req.user is undefined!');
            return res.status(500).json({ message: 'Internal Auth Error' });
        }
        const { role, id } = req.user;
        let whereClause = {};

        if (role === 'client') {
            // Find projects for this client
            const { Project } = require('../models');
            const projects = await Project.findAll({ where: { clientId: id }, attributes: ['id'] });
            const projectIds = projects.map(p => p.id);

            whereClause = { projectId: { [Op.in]: projectIds } };
        }
        // If admin, show all (or could filter if needed)

        const activities = await Activity.findAll({
            where: whereClause,
            limit: 10,
            order: [['createdAt', 'DESC']],
            include: ['project', 'user']
        });
        res.json(activities);
    } catch (error) {
        console.error('Error fetching activities:', error); // Added logging
        res.status(500).json({ message: 'Error fetching activities', error: error.message });
    }
};

// Get stats for chart (e.g., activities count per day for last 7 days)
exports.getActivityStats = async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const stats = await Activity.findAll({
            attributes: [
                [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
                [Sequelize.fn('COUNT', 'id'), 'count']
            ],
            where: {
                createdAt: {
                    [Op.gte]: sevenDaysAgo
                }
            },
            group: [Sequelize.fn('DATE', Sequelize.col('createdAt'))],
            order: [[Sequelize.fn('DATE', Sequelize.col('createdAt')), 'ASC']]
        });

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
};
