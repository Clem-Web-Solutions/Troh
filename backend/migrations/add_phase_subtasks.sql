-- Migration pour ajouter les sous-tâches aux phases (MySQL)
-- Date: 2027-01-27

-- Ajouter les nouvelles colonnes
ALTER TABLE Phases ADD COLUMN subtasks JSON;
ALTER TABLE Phases ADD COLUMN category VARCHAR(255);
ALTER TABLE Phases ADD COLUMN description TEXT;
ALTER TABLE Phases ADD COLUMN `order` INT DEFAULT 0;

-- Mettre à jour les phases existantes avec les nouvelles structures
UPDATE Phases 
SET 
    subtasks = JSON_ARRAY(),
    category = CASE 
        WHEN name LIKE '%Conception%' OR name LIKE '%Esquisse%' OR name LIKE '%APS%' OR name LIKE '%APD%' THEN 'Phase 1'
        WHEN name LIKE '%Administratif%' OR name LIKE '%DCE%' OR name LIKE '%Consultation%' THEN 'Phase 2'
        WHEN name LIKE '%Travaux%' OR name LIKE '%Chantier%' OR name LIKE '%Réalisation%' THEN 'Phase 3'
        WHEN name LIKE '%Livraison%' OR name LIKE '%Réception%' OR name LIKE '%DOE%' THEN 'Phase 4'
        ELSE NULL
    END
WHERE subtasks IS NULL;
