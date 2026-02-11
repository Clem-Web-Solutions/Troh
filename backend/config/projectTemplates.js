// Project Templates Configuration
// Defines Phases and Tasks for each Project Type

const PROJECT_TEMPLATES = {
    // 1. MISSION COMPLÈTE (Neuf / Réhabilitation) -> RAW DESIGN
    'ARCHI_MISSION_COMPLETE': {
        entité: 'RAW_DESIGN',
        phases: [
            {
                name: "1. Phase Conception (Études & Design)",
                tasks: [
                    "1.1. Réunion de lancement",
                    "1.2. Relevé de l’existant (si rénovation)",
                    "1.3. Esquisse (ESQ)",
                    "1.4. Avant-Projet Sommaire (APS)",
                    "1.5. Avant-Projet Définitif (APD)",
                    "1.6. Dossier de Permis de Construire (PC)",
                    "1.7. Étude de faisabilité technique",
                    "1.8. Validation finale par le client",
                    "1.9. Dossier de consultation des entreprises (DCE)",
                    "1.10. Sélection des entreprises"
                ]
            },
            {
                name: "2. Phase Préparation (Pré-chantier)",
                tasks: [
                    "2.1. Obtention des autorisations",
                    "2.2. Finalisation du DCE",
                    "2.3. Consultation des entreprises",
                    "2.4. Signature des marchés",
                    "2.5. Préparation du chantier",
                    "2.6. Réunion de démarrage chantier",
                    "2.7. Vérification des assurances"
                ]
            },
            {
                name: "3. Phase Exécution (Chantier)",
                tasks: [
                    "3.1. Installation de chantier",
                    "3.2. Terrassement & Fondations",
                    "3.3. Gros œuvre",
                    "3.4. Second œuvre",
                    "3.5. Finitions",
                    "3.6. Contrôles intermédiaires",
                    "3.7. Essais & Mise en service",
                    "3.8. Réception des travaux",
                    "3.9. Levée des réserves",
                    "3.10. Remise des clés"
                ]
            },
            {
                name: "4. Phase Clôture (Post-chantier)",
                tasks: [
                    "4.1. Dossier des Ouvrages Exécutés (DOE)",
                    "4.2. Garanties & Assurances",
                    "4.3. Bilan financier",
                    "4.4. Retour d’expérience (REX)",
                    "4.5. Archivage"
                ]
            }
        ]
    },

    // 2. CONCEPTION SEULE -> RAW DESIGN
    'ARCHI_CONCEPTION': {
        entité: 'RAW_DESIGN',
        phases: [
            {
                name: "1. Phase Conception (Études & Design)",
                tasks: [
                    "1.1. Réunion de lancement",
                    "1.2. Relevé de l’existant",
                    "1.3. Esquisse (ESQ)",
                    "1.4. Avant-Projet Sommaire (APS)",
                    "1.5. Avant-Projet Définitif (APD)",
                    "1.6. Remise du dossier de conception au client"
                ]
            }
        ]
    },

    // 3. CONSTRUCTION CLÉ EN MAIN -> MEEREO PROJECT
    'CONSTRUCTION_CLE_EN_MAIN': {
        entité: 'MEEREO_PROJECT',
        phases: [
            {
                name: "1. Phase Préparation",
                tasks: [
                    "1.1. Signature des marchés",
                    "1.2. Préparation du chantier",
                    "1.3. Réunion de démarrage",
                    "1.4. Vérification des assurances"
                ]
            },
            {
                name: "2. Phase Exécution (Gros Œuvre + Second Œuvre + Finitions)",
                tasks: [
                    "2.1. Installation de chantier",
                    "2.2. Terrassement & Fondations",
                    "2.3. Gros œuvre",
                    "2.4. Intégration des lots (Second œuvre)",
                    "2.5. Finitions",
                    "2.6. Essais & Mise en service",
                    "2.7. Réception des travaux",
                    "2.8. Levée des réserves",
                    "2.9. Remise des clés"
                ]
            },
            {
                name: "3. Phase Clôture",
                tasks: [
                    "3.1. DOE",
                    "3.2. Garanties",
                    "3.3. Bilan financier"
                ]
            }
        ]
    },

    // Default fallback
    'DEFAULT': {
        entité: 'RAW_DESIGN',
        phases: [
            {
                name: "Phase 1: Initialisation",
                tasks: ["Tâche 1: Lancement"]
            }
        ]
    }
};

module.exports = PROJECT_TEMPLATES;
