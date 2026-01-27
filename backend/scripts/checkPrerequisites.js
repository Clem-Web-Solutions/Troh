const { sequelize } = require('../models');

async function checkPrerequisites() {
  console.log('🔍 Vérification des prérequis pour la migration des phases\n');
  console.log('='.repeat(60));
  
  const checks = {
    database: false,
    tables: false,
    backup: false
  };
  
  try {
    // 1. Vérifier la connexion à la base de données
    console.log('\n1️⃣  Vérification de la connexion à la base de données...');
    await sequelize.authenticate();
    console.log('   ✅ Connexion réussie');
    console.log(`   📊 Dialect: ${sequelize.getDialect()}`);
    console.log(`   🏷️  Database: ${sequelize.config.database}`);
    checks.database = true;
    
    // 2. Vérifier l'existence des tables
    console.log('\n2️⃣  Vérification des tables...');
    const [tables] = await sequelize.query("SHOW TABLES");
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    const requiredTables = ['Users', 'Projects', 'Phases'];
    let allTablesExist = true;
    
    requiredTables.forEach(table => {
      if (tableNames.includes(table)) {
        console.log(`   ✅ Table "${table}" existe`);
      } else {
        console.log(`   ❌ Table "${table}" manquante`);
        allTablesExist = false;
      }
    });
    
    checks.tables = allTablesExist;
    
    // 3. Vérifier la structure actuelle de Phases
    console.log('\n3️⃣  Vérification de la structure de la table Phases...');
    const [columns] = await sequelize.query("DESCRIBE Phases");
    
    const currentColumns = columns.map(c => c.Field);
    console.log(`   Colonnes actuelles: ${currentColumns.join(', ')}`);
    
    const newColumns = ['subtasks', 'category', 'description', 'order'];
    const columnsToAdd = newColumns.filter(col => !currentColumns.includes(col));
    
    if (columnsToAdd.length > 0) {
      console.log(`   ⚠️  Colonnes à ajouter: ${columnsToAdd.join(', ')}`);
    } else {
      console.log('   ✅ Toutes les nouvelles colonnes existent déjà');
    }
    
    // 4. Compter les projets et phases existants
    console.log('\n4️⃣  Statistiques actuelles...');
    const [projectCount] = await sequelize.query("SELECT COUNT(*) as count FROM Projects");
    const [phaseCount] = await sequelize.query("SELECT COUNT(*) as count FROM Phases");
    
    console.log(`   📁 Projets: ${projectCount[0].count}`);
    console.log(`   📊 Phases: ${phaseCount[0].count}`);
    
    // 5. Recommandations de sauvegarde
    console.log('\n5️⃣  Recommandations de sauvegarde...');
    console.log('   ⚠️  IMPORTANT: Sauvegardez votre base de données avant de continuer!');
    console.log('\n   Commandes de sauvegarde MySQL:');
    console.log(`   
   # Sauvegarde complète
   mysqldump -u ${sequelize.config.username} -p ${sequelize.config.database} > backup_$(date +%Y%m%d_%H%M%S).sql
   
   # Sauvegarde de la table Phases uniquement
   mysqldump -u ${sequelize.config.username} -p ${sequelize.config.database} Phases > phases_backup_$(date +%Y%m%d_%H%M%S).sql
   `);
    
    // Résumé final
    console.log('\n' + '='.repeat(60));
    console.log('📋 RÉSUMÉ DES VÉRIFICATIONS');
    console.log('='.repeat(60));
    
    console.log(`\n✅ Connexion base de données: ${checks.database ? 'OK' : 'ÉCHEC'}`);
    console.log(`✅ Tables requises: ${checks.tables ? 'OK' : 'ÉCHEC'}`);
    console.log(`⚠️  Sauvegarde: À FAIRE MANUELLEMENT`);
    
    if (checks.database && checks.tables) {
      console.log('\n✅ Prêt pour la migration!');
      console.log('\nÉtapes suivantes:');
      console.log('1. Faites une sauvegarde de la base de données');
      console.log('2. Exécutez: mysql -u user -p database < migrations/add_phase_subtasks.sql');
      console.log('3. Exécutez: node scripts/migratePhases.js');
      console.log('4. Testez: node scripts/testPhases.js');
    } else {
      console.log('\n❌ Des problèmes ont été détectés. Résolvez-les avant de continuer.');
    }
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la vérification:', error.message);
  } finally {
    await sequelize.close();
  }
}

// Exécuter les vérifications
checkPrerequisites();
