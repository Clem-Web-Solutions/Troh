const { Phase } = require('../models');

const projectId = 12; // ID du projet "Renovation Villa"

const defaultPhases = [
  {
    category: 'Phase 1',
    name: 'Études et conception',
    description: 'Phase de conception architecturale et d\'études techniques',
    order: 1,
    status: 'pending',
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
    order: 2,
    status: 'pending',
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
    order: 3,
    status: 'pending',
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
    order: 4,
    status: 'pending',
    subtasks: [
      { id: 1, name: 'Réception', completed: false },
      { id: 2, name: 'Levée de réserves', completed: false },
      { id: 3, name: 'Dossier des Ouvrages Exécutés (DOE)', completed: false }
    ]
  }
];

async function addPhasesToProject() {
  try {
    console.log(`🚀 Ajout des phases structurées au projet ${projectId}...\n`);
    
    // Supprimer les anciennes phases (Conception, Administratif, Travaux, Livraison)
    await Phase.destroy({ where: { projectId } });
    console.log('✅ Anciennes phases supprimées\n');
    
    // Créer les nouvelles phases avec sous-tâches
    for (const phaseData of defaultPhases) {
      const phase = await Phase.create({
        projectId,
        category: phaseData.category,
        name: phaseData.name,
        description: phaseData.description,
        status: phaseData.status,
        order: phaseData.order,
        subtasks: phaseData.subtasks
      });
      
      console.log(`✅ ${phase.category} - ${phase.name}`);
      console.log(`   ${phase.subtasks.length} sous-tâches`);
    }
    
    console.log('\n🎉 Phases structurées ajoutées avec succès!');
    console.log('\nRafraîchissez la page dans votre navigateur pour voir les changements.');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    process.exit(0);
  }
}

addPhasesToProject();
