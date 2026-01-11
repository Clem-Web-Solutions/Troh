const { sequelize, User, Project, Phase, Document, Finance, Transaction, Activity } = require('../models');
const { Op } = require('sequelize');

async function clearData() {
    try {
        console.log('Starting data cleanup...');

        // 1. Identify non-admin users
        const nonAdminUsers = await User.findAll({
            where: {
                role: { [Op.ne]: 'admin' }
            }
        });

        const nonAdminUserIds = nonAdminUsers.map(u => u.id);
        console.log(`Found ${nonAdminUserIds.length} non-admin users to delete.`);

        if (nonAdminUserIds.length === 0) {
            console.log('No data to clear.');
            return;
        }

        // 2. Identify projects belonging to these users
        const projects = await Project.findAll({
            where: {
                clientId: { [Op.in]: nonAdminUserIds }
            }
        });

        const projectIds = projects.map(p => p.id);
        console.log(`Found ${projectIds.length} projects to delete.`);

        if (projectIds.length > 0) {
            // 3. Delete dependencies of these projects
            console.log('Deleting project dependencies...');

            await Activity.destroy({ where: { projectId: { [Op.in]: projectIds } } });
            console.log('- Activities deleted');

            await Transaction.destroy({ where: { projectId: { [Op.in]: projectIds } } });
            console.log('- Transactions deleted');

            await Finance.destroy({ where: { projectId: { [Op.in]: projectIds } } });
            console.log('- Finances deleted');

            await Document.destroy({ where: { projectId: { [Op.in]: projectIds } } });
            console.log('- Documents deleted');

            await Phase.destroy({ where: { projectId: { [Op.in]: projectIds } } });
            console.log('- Phases deleted');

            // 4. Delete Projects
            await Project.destroy({ where: { id: { [Op.in]: projectIds } } });
            console.log('Projects deleted.');
        }

        // 5. Delete Users
        await User.destroy({ where: { id: { [Op.in]: nonAdminUserIds } } });
        console.log('Users deleted.');

        console.log('Cleanup complete!');
    } catch (error) {
        console.error('Error clearing data:', error);
    } finally {
        await sequelize.close();
    }
}

clearData();
