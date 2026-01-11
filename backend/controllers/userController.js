const { User } = require('../models');

exports.getUsers = async (req, res) => {
    try {
        const { role } = req.query;
        const whereClause = role ? { role } : {};

        const users = await User.findAll({
            where: whereClause,
            attributes: { exclude: ['password'] } // Don't return passwords
        });

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};
