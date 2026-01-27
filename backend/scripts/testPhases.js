const { sequelize, Project, Phase } = require('../models');

async function testPhaseCreation() {
  try {
    console.log('🧪 Test de la création des phases structurées\n');
    
    // Tester la connexion
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie\n');
    
    // Récupérer un projet de test
    const testProject = await Project.findOne();
    
    if (!testProject) {
      console.log('⚠️  Aucun projet trouvé. Créez un projet pour tester.');
      return;
    }
    
    console.log(`📁 Projet de test: ${testProject.name} (ID: ${testProject.id})\n`);
    
    // Récupérer les phases du projet
    const phases = await Phase.findAll({
      where: { projectId: testProject.id },
      order: [['order', 'ASC']]
    });
    
    console.log(`📊 Nombre de phases: ${phases.length}\n`);
    
    if (phases.length === 0) {
      console.log('⚠️  Aucune phase trouvée pour ce projet.');
      return;
    }
    
    // Afficher les détails de chaque phase
    phases.forEach((phase, index) => {
      console.log(`\n${index + 1}. ${phase.category} - ${phase.name}`);
      console.log(`   Description: ${phase.description || 'N/A'}`);
      console.log(`   Statut: ${phase.status}`);
      console.log(`   Ordre: ${phase.order}`);
      
      if (phase.subtasks && Array.isArray(phase.subtasks)) {
        console.log(`   Sous-tâches (${phase.subtasks.length}):`);
        phase.subtasks.forEach(subtask => {
          const status = subtask.completed ? '✓' : '○';
          console.log(`      ${status} ${subtask.name}`);
        });
      } else {
        console.log('   ⚠️  Aucune sous-tâche définie');
      }
    });
    
    // Calculer les statistiques globales
    console.log('\n' + '='.repeat(60));
    console.log('📈 STATISTIQUES');
    console.log('='.repeat(60));
    
    const totalSubtasks = phases.reduce((sum, phase) => {
      return sum + (phase.subtasks ? phase.subtasks.length : 0);
    }, 0);
    
    const completedSubtasks = phases.reduce((sum, phase) => {
      if (!phase.subtasks) return sum;
      return sum + phase.subtasks.filter(st => st.completed).length;
    }, 0);
    
    const completedPhases = phases.filter(p => p.status === 'completed').length;
    const activePhases = phases.filter(p => p.status === 'active').length;
    const pendingPhases = phases.filter(p => p.status === 'pending').length;
    
    console.log(`Phases totales: ${phases.length}`);
    console.log(`  - Complétées: ${completedPhases}`);
    console.log(`  - En cours: ${activePhases}`);
    console.log(`  - En attente: ${pendingPhases}`);
    console.log(`\nSous-tâches totales: ${totalSubtasks}`);
    console.log(`  - Complétées: ${completedSubtasks}`);
    console.log(`  - Restantes: ${totalSubtasks - completedSubtasks}`);
    
    if (totalSubtasks > 0) {
      const progress = Math.round((completedSubtasks / totalSubtasks) * 100);
      console.log(`\n📊 Progression globale: ${progress}%`);
      console.log('█'.repeat(Math.floor(progress / 2)) + '░'.repeat(50 - Math.floor(progress / 2)));
    }
    
    console.log('\n✅ Test terminé avec succès!\n');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await sequelize.close();
  }
}

// Exécuter le test
testPhaseCreation();
