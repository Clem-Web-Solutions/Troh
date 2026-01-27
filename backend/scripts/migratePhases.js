const { sequelize, Phase, Project } = require('../models');

const defaultPhases = [
  {
    category: 'Phase 1',
    name: 'Études et conception',
    description: 'Phase de conception architecturale et d\'études techniques',
    subtasks: [
      { id: 1, name: 'Esquisse', completed: false },
      { id: 2, name: 'Avant-Projet Sommaire (APS)', completed: false },
      { id: 3, name: 'Avant-Projet Définitif (APD)', completed: false },
      { id: 4, name: 'Dossier administratif (PC/DP)', completed: false }
    ]
  },
  {
    category: 'Phase 2',
    name: 'Préparation des travaux',
    description: 'Dossier de consultation et sélection des entreprises',
    subtasks: [
      { id: 1, name: 'Dossier de Consultation des Entreprises (DCE)', completed: false },
      { id: 2, name: 'Consultation et sélection entreprises', completed: false },
      { id: 3, name: 'Planning prévisionnel', completed: false }
    ]
  },
  {
    category: 'Phase 3',
    name: 'Réalisation des travaux',
    description: 'Exécution et suivi de chantier',
    subtasks: [
      { id: 1, name: 'Démarrage du chantier', completed: false },
      { id: 2, name: 'Avancement par lots (gros œuvre, second œuvre, finitions)', completed: false },
      { id: 3, name: 'Jalons clés (levage, hors d\'eau, hors d\'air)', completed: false }
    ]
  },
  {
    category: 'Phase 4',
    name: 'Livraison et réception',
    description: 'Réception des travaux et finalisation',
    subtasks: [
      { id: 1, name: 'Réception', completed: false },
      { id: 2, name: 'Levée de réserves', completed: false },
      { id: 3, name: 'Dossier des Ouvrages Exécutés (DOE)', completed: false }
    ]
  }
];

async function migrateProjectPhases() {
  try {
    console.log('🚀 Migration des phases des projets...');
    
    // Récupérer tous les projets
    const projects = await Project.findAll();
    console.log(`📊 ${projects.length} projets trouvés`);
    
    for (const project of projects) {
      console.log(`\n📁 Traitement du projet: ${project.name} (ID: ${project.id})`);
      
      // Récupérer les phases existantes du projet
      const existingPhases = await Phase.findAll({
        where: { projectId: project.id }
      });
      
      console.log(`   Phases existantes: ${existingPhases.length}`);
      
      // Si le projet n'a pas de phases ou a moins de 4 phases, on crée les phases par défaut
      if (existingPhases.length < 4) {
        console.log('   ⚠️  Phases incomplètes, création des phases par défaut...');
        
        // Supprimer les anciennes phases pour éviter les doublons
        await Phase.destroy({ where: { projectId: project.id } });
        
        // Créer les nouvelles phases avec les sous-tâches
        for (let i = 0; i < defaultPhases.length; i++) {
          const phaseData = defaultPhases[i];
          await Phase.create({
            projectId: project.id,
            category: phaseData.category,
            name: phaseData.name,
            description: phaseData.description,
            status: 'pending',
            order: i + 1,
            subtasks: phaseData.subtasks
          });
        }
        
        console.log('   ✅ Phases créées avec succès');
      } else {
        console.log('   ℹ️  Mise à jour des phases existantes avec les sous-tâches...');
        
        // Mettre à jour les phases existantes avec les sous-tâches si elles n'en ont pas
        for (const phase of existingPhases) {
          if (!phase.subtasks || phase.subtasks.length === 0) {
            // Essayer de matcher avec les phases par défaut
            const matchedDefaultPhase = defaultPhases.find(dp => 
              phase.name.toLowerCase().includes(dp.name.toLowerCase().substring(0, 10))
            );
            
            if (matchedDefaultPhase) {
              await phase.update({
                category: matchedDefaultPhase.category,
                subtasks: matchedDefaultPhase.subtasks
              });
              console.log(`   ✅ Sous-tâches ajoutées à: ${phase.name}`);
            }
          }
        }
      }
    }
    
    console.log('\n✅ Migration terminée avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  }
}

// Exécuter la migration
migrateProjectPhases()
  .then(() => {
    console.log('\n🎉 Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Échec de la migration:', error);
    process.exit(1);
  });
