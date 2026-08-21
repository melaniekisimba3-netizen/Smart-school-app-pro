-- ==============================================================================
-- SMARTSCHOOL RDC - INITIALISATION DE LA BASE DE DONNÉES POSTGRESQL DE PRODUCTION
-- ==============================================================================

CREATE TABLE IF NOT EXISTS schools (
    id VARCHAR(64) PRIMARY KEY,
    code_national VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    province VARCHAR(128) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    school_id VARCHAR(64) REFERENCES schools(id),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(32),
    role VARCHAR(64) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pupils (
    id VARCHAR(64) PRIMARY KEY,
    school_id VARCHAR(64) REFERENCES schools(id),
    matricule VARCHAR(64) NOT NULL,
    first_name VARCHAR(128) NOT NULL,
    last_name VARCHAR(128) NOT NULL,
    class_room VARCHAR(64) NOT NULL,
    gender VARCHAR(1) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fee_payments (
    id VARCHAR(64) PRIMARY KEY,
    school_id VARCHAR(64) REFERENCES schools(id),
    pupil_id VARCHAR(64) REFERENCES pupils(id),
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(8) DEFAULT 'USD',
    payment_method VARCHAR(32) NOT NULL,
    reference VARCHAR(128) UNIQUE NOT NULL,
    status VARCHAR(32) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_users_school ON users(school_id);
CREATE INDEX IF NOT EXISTS idx_pupils_school ON pupils(school_id);
CREATE INDEX IF NOT EXISTS idx_payments_pupil ON fee_payments(pupil_id);
