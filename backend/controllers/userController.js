const { User } = require('../models');

exports.getUsers = async (req, res) => {
    try {
        const { role } = req.user;
        // Only admin can list all users? Or project manager can list clients?
        // Defaulting to simple check for now based on existing code logic or lack thereof
        // But let's assume if query param role is present, we filter by it.

        const filterRole = req.query.role;
        const whereClause = filterRole ? { role: filterRole } : {};

        const users = await User.findAll({
            where: whereClause,
            attributes: { exclude: ['password'] } // Don't return passwords
        });

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Security: only admin can delete
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Accès refusé' });
        }

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

        await user.destroy();
        res.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
};
