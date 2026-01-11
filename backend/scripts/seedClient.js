const { User, Project, Phase } = require('../models');
const { sequelize } = require('../models');

const seedClient = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        const clientEmail = 'client@example.com';
        const existingClient = await User.findOne({ where: { email: clientEmail } });

        if (existingClient) {
            console.log('Client exists, cleaning up...');
            await existingClient.destroy(); // This should cascade if configured, or we might leave orphans if not.
            // Safe to try manual cleanup of projects if needed, but assuming destroy works for now.
        }

        // Create User
        const client = await User.create({
            name: 'Client Test',
            email: clientEmail,
            password: 'password123',
            role: 'client'
        });

        console.log('Client user created successfully:');
        console.log('Email:', client.email);

        // Create a Mock Project for this client
        const project = await Project.create({
            name: 'Ma Maison de Rêve',
            address: '123 Rue de la Paix',
            clientId: client.id,
            status: 'Chantier',
            progress: 0
        });

        console.log('Project created for client:', project.name);

        // Create Phases
        const phases = [
            { name: 'Signature du devis', status: 'Pending', order: 0, startDate: new Date(), description: 'Validation finale du devis et des plans.' },
            { name: 'Commande des matériaux', status: 'Pending', order: 1, startDate: new Date(), description: 'Commande des fournitures chez les fournisseurs.' },
            { name: 'Début du chantier', status: 'Pending', order: 2, startDate: new Date(), description: 'Démarrage des travaux de gros oeuvre.' }
        ];

        for (const p of phases) {
            await Phase.create({ ...p, projectId: project.id });
        }
        console.log('Default phases created.');

        process.exit(0);
    } catch (error) {
        console.error('Unable to create client user:', error);
        process.exit(1);
    }
};

seedClient();
