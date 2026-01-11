-- 1. Création de la Base de Données
CREATE DATABASE IF NOT EXISTS troh_immo_db;
USE troh_immo_db;

-- 2. Création des Tables (Si vous ne voulez pas utiliser la synchro automatique Sequelize)

-- Table Users
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'client', 'worker') DEFAULT 'client',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table Projects
CREATE TABLE IF NOT EXISTS Projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    status ENUM('Etude', 'Chantier', 'Livré', 'Suspendu') DEFAULT 'Etude',
    progress INT DEFAULT 0,
    clientId INT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (clientId) REFERENCES Users(id) ON DELETE CASCADE
);

-- Table Phases
CREATE TABLE IF NOT EXISTS Phases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    projectId INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    status ENUM('pending', 'active', 'completed') DEFAULT 'pending',
    startDate DATE,
    endDate DATE,
    comments TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES Projects(id) ON DELETE CASCADE
);

-- Table Documents
CREATE TABLE IF NOT EXISTS Documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    projectId INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    category ENUM('Plans', 'Administratif', 'Financier', 'Technique', 'Autre') DEFAULT 'Autre',
    url VARCHAR(255) NOT NULL,
    uploadDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES Projects(id) ON DELETE CASCADE
);

-- Table Finances
CREATE TABLE IF NOT EXISTS Finances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    projectId INT NOT NULL,
    totalAmount DECIMAL(10, 2) DEFAULT 0.00,
    paidAmount DECIMAL(10, 2) DEFAULT 0.00,
    nextPaymentDue DATE,
    transactions JSON,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES Projects(id) ON DELETE CASCADE
);
