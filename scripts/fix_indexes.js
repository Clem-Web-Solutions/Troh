const { Sequelize } = require('sequelize');
const config = require('../backend/config/database'); // Adjust path as needed

// Verify path to database config or reconstruct it
require('dotenv').config({ path: '../backend/.env' });

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: console.log
    }
);

async function fixIndexes() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        const [results] = await sequelize.query("SHOW INDEX FROM Projects");
        console.log('Current Indexes:', results);

        // Identify duplicate indexes on project_id
        // Valid indexes usually have specific names. Sequelize auto-generated duplicate indexes often look like project_id, project_id_2, etc.

        const indexesDropped = [];
        for (const index of results) {
            // Keep PRIMARY
            if (index.Key_name === 'PRIMARY') continue;

            // Keep Foreign Keys if identifiable (usually involve client_id, etc.) - though in MySQL 'SHOW INDEX' Key_name is the index name.
            // If we have 64 keys, most are junk.
            // Let's drop everything related to 'project_id' that isn't the main unique one, or just drop ALL non-primary/non-FK and let Sequelize recreate what it needs safely (if we turn off alter temporarily or careful).

            // Better strategy: Drop all indexes on 'project_id' column specifically.
            if (index.Column_name === 'project_id') {
                console.log(`Found index ${index.Key_name} on project_id`);
                // We will drop it.
                try {
                    await sequelize.query(`DROP INDEX \`${index.Key_name}\` ON Projects`);
                    console.log(`Dropped index ${index.Key_name}`);
                    indexesDropped.push(index.Key_name);
                } catch (e) {
                    console.error(`Failed to drop ${index.Key_name}:`, e.message);
                }
            }
        }

        if (indexesDropped.length === 0) {
            console.log("No indexes found on project_id to drop (or they are multi-column?).");
        }

        console.log('Done.');
        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixIndexes();
