-- Meereo Cockpit - Full Database Schema

-- ==========================================
-- 1. TABLES EXISTANTES (Mises à jour incluses)
-- ==========================================

-- Table: project_types
CREATE TABLE IF NOT EXISTS project_types (
    project_type_id VARCHAR(50) PRIMARY KEY,
    entité ENUM('RAW_DESIGN', 'MEEREO_PROJECT') NOT NULL,
    type_projet VARCHAR(100) NOT NULL,
    sous_type VARCHAR(100),
    etape_1_conception BOOLEAN DEFAULT FALSE,
    etape_2_preparation BOOLEAN DEFAULT FALSE,
    etape_3_execution BOOLEAN DEFAULT FALSE,
    description TEXT
);

-- Table: projects
CREATE TABLE IF NOT EXISTS projects (
    project_id VARCHAR(50) PRIMARY KEY, -- Ex: RD-2026-CL012
    client_id INT NOT NULL, -- Référence vers Users (table externe supposée existante ou à adapter)
    entité ENUM('RAW_DESIGN', 'MEEREO_PROJECT') NOT NULL,
    project_type_id VARCHAR(50),
    statut_global ENUM('Etude', 'Chantier', 'Livré', 'Suspendu', 'Annulé') DEFAULT 'Etude',
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    chef_projet VARCHAR(100),
    linked_project_id VARCHAR(50), -- [NEW] Lien entre RAW et MEEREO
    FOREIGN KEY (project_type_id) REFERENCES project_types(project_type_id)
);

-- Table: project_phases
CREATE TABLE IF NOT EXISTS project_phases (
    phase_id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    etape VARCHAR(100) NOT NULL,
    statut ENUM('pending', 'active', 'completed', 'blocked') DEFAULT 'pending',
    date_debut DATE,
    date_fin DATE,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
);

-- Table: phase_tasks
CREATE TABLE IF NOT EXISTS phase_tasks (
    task_id VARCHAR(50) PRIMARY KEY, -- Ex: T-01
    phase_id VARCHAR(50) NOT NULL,
    libellé VARCHAR(255) NOT NULL,
    statut ENUM('todo', 'in_progress', 'done') DEFAULT 'todo',
    approval_status ENUM('pending', 'approved', 'rejected') DEFAULT NULL, -- [NEW] Validation des étapes
    FOREIGN KEY (phase_id) REFERENCES project_phases(phase_id) ON DELETE CASCADE
);

-- Table: payment_milestones
CREATE TABLE IF NOT EXISTS payment_milestones (
    milestone_id VARCHAR(50) PRIMARY KEY, -- Ex: RD-P1
    project_id VARCHAR(50) NOT NULL,
    phase_id VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL,
    label VARCHAR(255) NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    status ENUM('pending', 'invoiced', 'paid') DEFAULT 'pending',
    due_date DATE,
    condition_rule VARCHAR(255), -- Ex: "All reserves resolved"
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (phase_id) REFERENCES project_phases(phase_id) ON DELETE CASCADE
);


-- ==========================================
-- 2. NOUVELLES TABLES
-- ==========================================

-- Table: amendments (Avenants)
CREATE TABLE IF NOT EXISTS amendments (
    amendment_id VARCHAR(50) PRIMARY KEY, -- Ex: AM-RD-2026-CL012-001
    project_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    amount_added DECIMAL(12,2) DEFAULT 0.00, -- Montant ajouté
    amount_removed DECIMAL(12,2) DEFAULT 0.00, -- Montant déduit
    status ENUM('draft', 'approved', 'rejected', 'completed') DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
);

-- Table: subcontractors (Sous-traitants)
CREATE TABLE IF NOT EXISTS subcontractors (
    subcontractor_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(100), -- Ex: Electricien, Plombier
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    siret VARCHAR(50)
);

-- Table: project_subcontractors (Lien Projet <-> Sous-traitant)
CREATE TABLE IF NOT EXISTS project_subcontractors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    subcontractor_id INT NOT NULL,
    contract_amount DECIMAL(12,2),
    assigned_date DATE DEFAULT (CURRENT_DATE),
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (subcontractor_id) REFERENCES subcontractors(subcontractor_id) ON DELETE CASCADE
);

-- Table: reserves (Réserves à la réception)
CREATE TABLE IF NOT EXISTS reserves (
    reserve_id VARCHAR(50) PRIMARY KEY, -- Ex: RES-001
    project_id VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    severity ENUM('minor', 'major', 'blocking') DEFAULT 'minor',
    status ENUM('open', 'resolved') DEFAULT 'open',
    reported_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_date DATETIME,
    photo_url VARCHAR(255),
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
);

-- Table: documents (Gestion des fichiers)
CREATE TABLE IF NOT EXISTS documents (
    document_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50), -- Ex: pdf, dwg
    category ENUM('Plan', 'Facture', 'Contrat', 'Autre') DEFAULT 'Autre',
    url VARCHAR(255) NOT NULL,
    version INT DEFAULT 1,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    uploaded_by INT, -- ID User
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
);

-- Table: time_entries (Suivi du temps)
CREATE TABLE IF NOT EXISTS time_entries (
    entry_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    hours DECIMAL(5,2) NOT NULL,
    description TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
);

-- Table: budget_estimates (Budget vs Réel)
CREATE TABLE IF NOT EXISTS budget_estimates (
    estimate_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL, -- Ex: Gros Oeuvre
    estimated_amount DECIMAL(12,2) DEFAULT 0.00,
    actual_amount DECIMAL(12,2) DEFAULT 0.00,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
);

-- Table: notifications (Alertes)
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    project_id VARCHAR(50),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    type ENUM('payment', 'approval', 'deadline', 'info') DEFAULT 'info',
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE SET NULL
);

-- ==========================================
-- 3. EXEMPLES DE DONNÉES (TEST)
-- ==========================================

-- Insertion Types de projet
INSERT INTO project_types (project_type_id, entité, type_projet, description) VALUES
('ARCHI-STD', 'RAW_DESIGN', 'Conception Standard', 'Mission complète d\'architecture'),
('CONSTRUCT-RENO', 'MEEREO_PROJECT', 'Rénovation', 'Travaux de rénovation');

-- Insertion Projet
INSERT INTO projects (project_id, client_id, entité, project_type_id, statut_global, chef_projet) VALUES
('RD-2026-CL012', 1, 'RAW_DESIGN', 'ARCHI-STD', 'Etude', 'Jean Architecte');

-- Insertion Phase
INSERT INTO project_phases (phase_id, project_id, etape, statut) VALUES
('PH-01', 'RD-2026-CL012', 'Conception', 'active');

-- Insertion Tâche
INSERT INTO phase_tasks (task_id, phase_id, libellé, statut, approval_status) VALUES
('T-01', 'PH-01', 'Validation APS', 'todo', 'pending');

-- Insertion Avenant
INSERT INTO amendments (amendment_id, project_id, title, description, amount_added, status) VALUES
('AM-RD-2026-CL012-001', 'RD-2026-CL012', 'Ajout Prises Salon', 'Ajout de 3 prises supplémentaires', 450.00, 'draft');

-- Insertion Document
INSERT INTO documents (project_id, name, type, category, url, version) VALUES
('RD-2026-CL012', 'Plan_RDC_V1.dwg', 'dwg', 'Plan', '/uploads/RD-2026-CL012/Plan_RDC_V1.dwg', 1);
