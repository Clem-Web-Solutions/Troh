const sequelize = require('../config/database');

async function fixIndexes() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Connected.');

        const [results] = await sequelize.query('SHOW INDEX FROM Users');

        // Filter for indexes on 'email' that are not PRIMARY
        const emailIndexes = results.filter(idx => idx.Column_name === 'email' && idx.Key_name !== 'PRIMARY');

        console.log(`Found ${emailIndexes.length} indexes on 'email'.`);

        // We want to keep one unique index. 
        // Usually the one named 'email' or 'users_email_unique' or similar. 
        // If we have many 'email', 'email_2', 'email_3'... we drop them.

        // Let's just drop ALL of them and let Sequelize create ONE cleanly next time 
        // OR keep the first one. 
        // Safer to drop duplicate ones.

        // Group by Key_name to count logical indexes (an index might have multiple rows if composite, but email is likely single col)
        const indexNames = [...new Set(emailIndexes.map(i => i.Key_name))];
        console.log('Index names found:', indexNames);

        if (indexNames.length <= 1) {
            console.log('Not enough indexes to be a problem, or just one. Exiting.');
            process.exit(0);
        }

        // Keep the one that looks most "standard" if possible, or just the first one.
        // Or drop ALL and let sync recreate the correct one.
        // Dropping all except the first one.
        const toDrop = indexNames.slice(1);

        for (const indexName of toDrop) {
            console.log(`Dropping index: ${indexName}`);
            await sequelize.query(`DROP INDEX \`${indexName}\` ON Users`);
        }

        console.log('Cleanup complete.');
        process.exit(0);

    } catch (error) {
        console.error('Error fixing indexes:', error);
        process.exit(1);
    }
}

fixIndexes();
