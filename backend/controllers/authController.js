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
        const { name, email, role, phone, address } = req.body;

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
            phone,
            address,
            mustChangePassword: true
        });

        let emailSent = false;
        try {
            await emailService.sendEmail({
                to: user.email,
                subject: 'Bienvenue sur Meereo Cockpit - Vos identifiants',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Bienvenue sur Meereo Cockpit</title>
                        <style>
                            body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; }
                            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-top: 20px; margin-bottom: 20px; }
                            .header { background-color: #1e293b; padding: 32px; text-align: center; }
                            .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
                            .content { padding: 40px 32px; color: #334155; line-height: 1.6; }
                            .greeting { font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #0f172a; }
                            .credentials-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 28px 0; }
                            .credential-row { margin-bottom: 16px; }
                            .credential-row:last-child { margin-bottom: 0; }
                            .credential-label { font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; display: block; margin-bottom: 6px; }
                            .credential-value { font-family: 'Courier New', monospace; font-size: 16px; color: #0f172a; font-weight: 600; background: #ffffff; padding: 8px 12px; border-radius: 4px; border: 1px solid #cbd5e1; display: inline-block; text-decoration: none; }
                            a.credential-value { text-decoration: none; color: #0f172a; pointer-events: none; }
                            .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 12px; text-align: center; }
                            .btn:hover { background-color: #1d4ed8; }
                            .footer { background-color: #f8fafc; padding: 24px; text-align: center; font-size: 13px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>Meereo Cockpit</h1>
                            </div>
                            <div class="content">
                                <div class="greeting">Bonjour ${user.name},</div>
                                <p style="margin-bottom: 24px;">Votre compte client a été créé avec succès. Vous pouvez désormais accéder à votre espace personnel pour suivre l'avancement de vos projets.</p>
                                
                                <div class="credentials-box">
                                    <div class="credential-row">
                                        <span class="credential-label">Email de connexion</span>
                                        <span class="credential-value">${user.email}</span>
                                    </div>
                                    <div class="credential-row">
                                        <span class="credential-label">Mot de passe provisoire</span>
                                        <span class="credential-value" style="color: #0f172a; border-color: #94a3b8;">${tempPassword}</span>
                                    </div>
                                </div>

                                <p style="font-size: 14px; color: #64748b; margin-bottom: 32px;">Note : Pour votre sécurité, nous vous invitons à modifier ce mot de passe dès votre première connexion.</p>

                                <div style="text-align: center;">
                                    <a href="https://cockpit.trohimmo.com" class="btn">Accéder à mon espace client</a>
                                </div>
                            </div>
                            <div class="footer">
                                <p>&copy; ${new Date().getFullYear()} Meereo Cockpit. Tous droits réservés.</p>
                                <p>Ceci est un email automatique, merci de ne pas y répondre directement.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
            });
            emailSent = true;
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Continue execution, do not fail
        }

        res.status(201).json({
            message: emailSent
                ? 'Utilisateur créé avec succès. Un email a été envoyé.'
                : 'Utilisateur créé avec succès, mais l\'envoi de l\'email a échoué.',
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            },
            // Return temp password ONLY if email failed (for manual communication)
            tempPassword: emailSent ? undefined : tempPassword
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la création du compte' });
    }
};

const crypto = require('crypto');
const { Op } = require('sequelize');
const emailService = require('../services/emailService');

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

exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            // Security: Don't reveal if user exists
            return res.json({ message: 'Si cet email existe, un code vous a été envoyé.' });
        }

        // Generate 6 digit OTP
        const token = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 3600000); // 1 hour

        user.resetPasswordToken = token;
        user.resetPasswordExpires = expires;
        await user.save();

        await emailService.sendEmail({
            to: user.email,
            subject: 'Troh Immo - Réinitialisation de mot de passe',
            html: `
                <h3>Réinitialisation de mot de passe</h3>
                <p>Voici votre code de vérification :</p>
                <h1 style="letter-spacing: 5px;">${token}</h1>
                <p>Ce code expire dans 1 heure.</p>
            `,
        });

        res.json({ message: 'Code envoyé.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.verifyResetCode = async (req, res) => {
    try {
        const { email, code } = req.body;
        const user = await User.findOne({
            where: {
                email,
                resetPasswordToken: code,
                resetPasswordExpires: { [Op.gt]: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Code invalide ou expiré' });
        }

        res.json({ message: 'Code valide' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        const user = await User.findOne({
            where: {
                email,
                resetPasswordToken: code,
                resetPasswordExpires: { [Op.gt]: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Code invalide ou expiré' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Le mot de passe doit faire au moins 6 caractères' });
        }

        user.password = newPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        user.mustChangePassword = false;
        await user.save();

        res.json({ message: 'Mot de passe réinitialisé avec succès' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
