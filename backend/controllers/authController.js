const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: 'Identifiants invalides' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Identifiants invalides' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                mustChangePassword: user.mustChangePassword,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.register = async (req, res) => {
    try {
        const { name, email, role } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        // Generate temporary password
        const tempPassword = Math.random().toString(36).slice(-8);

        const user = await User.create({
            name,
            email,
            password: tempPassword,
            role,
            mustChangePassword: true
        });

        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                tempPassword // Return raw temp password for display
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la création du compte' });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { userId, newPassword } = req.body;

        // Simple validation
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Le mot de passe doit faire au moins 6 caractères' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Update password (hook handles hashing) and reset flag
        user.password = newPassword;
        user.mustChangePassword = false;
        await user.save();

        res.json({ message: 'Mot de passe mis à jour avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors du changement de mot de passe' });
    }
};
