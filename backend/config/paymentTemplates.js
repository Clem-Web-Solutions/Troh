// Payment Milestones Templates
// Defines financial phases and milestones for each Entity/Project Type

const PAYMENT_TEMPLATES = {
    "RAW_DESIGN": {
        "PH-01": {
            "label": "Honoraires conception",
            "payment_type": "forfait_or_percentage",
            "milestones": [
                { "code": "RD-P1", "label": "À la commande", "percentage": 30 },
                { "code": "RD-P2", "label": "Validation APS", "percentage": 30 },
                { "code": "RD-P3", "label": "Validation APD", "percentage": 40 }
            ]
        },
        "PH-02": {
            "label": "Honoraires préparation",
            "payment_type": "percentage",
            "milestones": [
                { "code": "RD-P4", "label": "Dossier PRO/DCE", "percentage": 50 },
                { "code": "RD-P5", "label": "Dossier prêt à construire", "percentage": 50 }
            ]
        }
    },
    "MEEREO_PROJECT": {
        "PH-02": {
            "label": "Acompte préparation chantier",
            "payment_type": "percentage",
            "milestones": [
                { "code": "MP-P1", "label": "Signature marché", "percentage": 10 }
            ]
        },
        "PH-03": {
            "label": "Paiements travaux",
            "payment_type": "situations",
            "milestones": [
                { "code": "MP-P2", "label": "Situation mensuelle travaux", "percentage": 70 },
                { "code": "MP-P3", "label": "Réception provisoire", "percentage": 20 },
                { "code": "MP-P4", "label": "Levée des réserves", "percentage": 10 }
            ]
        }
    }
};

module.exports = PAYMENT_TEMPLATES;
