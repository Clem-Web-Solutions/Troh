const { User, sequelize } = require('./models');

async function listUsers() {
    try {
        const users = await User.findAll();
        console.log('Users found:', users.map(u => ({ id: u.id, email: u.email, role: u.role, password: u.password })));
    } catch (error) {
        console.error('Error fetching users:', error);
    } finally {
        await sequelize.close();
    }
}

listUsers();
