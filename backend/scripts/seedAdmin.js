const { User } = require('../models');
const { sequelize } = require('../models');

const seedAdmin = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        const adminEmail = 'admin@meereo.com';
        const existingAdmin = await User.findOne({ where: { email: adminEmail } });

        if (existingAdmin) {
            console.log('Admin user already exists.');
            process.exit(0);
        }

        const admin = await User.create({
            name: 'Admin Principal',
            email: adminEmail,
            password: 'password123', // Will be hashed by the model hook
            role: 'admin'
        });

        console.log('Admin user created successfully:');
        console.log('Email:', admin.email);
        console.log('Password: password123');

        process.exit(0);
    } catch (error) {
        console.error('Unable to create admin user:', error);
        process.exit(1);
    }
};

seedAdmin();
