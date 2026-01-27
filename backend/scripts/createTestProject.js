const { Project, Phase } = require('../models');

async function createTestProject() {
  try {
    console.log('🚀 Création d\'un projet de test...\n');
    
    // Créer le projet
    const project = await Project.create({
      name: 'Maison Moderne Test',
      address: '123 Rue de Test, 75001 Paris',
      status: 'Etude',
      clientId: 13, // Client existant
      progress: 0
    });
    
    console.log(`✅ Projet créé: ${project.name} (ID: ${project.id})\n`);
    
    // Récupérer les phases créées automatiquement
    const phases = await Phase.findAll({
      where: { projectId: project.id },
      order: [['order', 'ASC']]
    });
    
    console.log(`📊 Nombre de phases créées: ${phases.length}\n`);
    
    if (phases.length > 0) {
      console.log('Détails des phases:\n');
      phases.forEach((phase, index) => {
        console.log(`${index + 1}. ${phase.category} - ${phase.name}`);
        console.log(`   Description: ${phase.description || 'N/A'}`);
        console.log(`   Ordre: ${phase.order}`);
        console.log(`   Sous-tâches: ${phase.subtasks ? phase.subtasks.length : 0}`);
        if (phase.subtasks && phase.subtasks.length > 0) {
          phase.subtasks.forEach(st => {
            console.log(`      - ${st.name}`);
          });
        }
        console.log('');
      });
      console.log('✅ Les phases avec sous-tâches ont été créées automatiquement!');
    } else {
      console.log('⚠️  Aucune phase créée automatiquement');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    process.exit(0);
  }
}

createTestProject();
