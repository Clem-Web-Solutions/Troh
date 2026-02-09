-- ULTIME SCHEMA UPDATE
-- Based on user's simplified prompt

-- 1. Create TASKS table (if not exists or replacing JSON)
-- Using 'tasks' as requested.
CREATE TABLE IF NOT EXISTS tasks (
    task_id SERIAL PRIMARY KEY,
    phase_id VARCHAR(50), 
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'todo',
    payment_milestone_id VARCHAR(50), 
    validated_by VARCHAR(50),
    validation_date TIMESTAMP,
    project_id INT 
);

-- 2. Projects Update
-- ALTER TABLE projects ADD COLUMN IF NOT EXISTS budget DECIMAL(12, 2);
-- ALTER TABLE projects ADD COLUMN IF NOT EXISTS start_date DATE;
-- ALTER TABLE projects ADD COLUMN IF NOT EXISTS end_date DATE;

-- 3. New Tables
CREATE TABLE IF NOT EXISTS amendments (
    amendment_id SERIAL PRIMARY KEY,
    project_id VARCHAR(50), 
    title VARCHAR(255) NOT NULL,
    description TEXT,
    amount_added DECIMAL(12, 2),
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT NOW(),
    validated_by VARCHAR(50),
    validation_date TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reserves (
    reserve_id SERIAL PRIMARY KEY,
    project_id VARCHAR(50),
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
    document_id SERIAL PRIMARY KEY,
    project_id VARCHAR(50),
    task_id INT REFERENCES tasks(task_id),
    name VARCHAR(255) NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW()
);
