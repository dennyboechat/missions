-- Enable the uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS app_user (
    user_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_third_party_id VARCHAR(255),
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project (
    project_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    project_description VARCHAR(255),
    owner_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_owner FOREIGN KEY(owner_id) REFERENCES app_user(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_user (
    project_user_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL,
    user_id UUID NOT NULL,
    is_user_active BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_project FOREIGN KEY(project_id) REFERENCES project(project_id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES app_user(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS patient_personal (
    patient_personal_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL,
    patient_full_name VARCHAR(255) NOT NULL,
    is_patient_male BOOLEAN NOT NULL,
    patient_date_of_birth DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_project FOREIGN KEY(project_id) REFERENCES project(project_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS patient_dentistry (
    patient_dentistry_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_personal_id UUID NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_notes VARCHAR(2550),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_patient_personal FOREIGN KEY(patient_personal_id) REFERENCES patient_personal(patient_personal_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tooth_status (status VARCHAR(255) PRIMARY KEY);

INSERT INTO
    tooth_status (status)
VALUES
    ('extracted'),
    ('treated');

CREATE TABLE IF NOT EXISTS patient_dentistry_tooth (
    patient_dentistry_tooth_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_dentistry_id UUID NOT NULL,
    tooth_name VARCHAR(255) NOT NULL,
    tooth_status VARCHAR(255),
    tooth_notes VARCHAR(2550),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_patient_dentistry_id FOREIGN KEY(patient_dentistry_id) REFERENCES patient_dentistry(patient_dentistry_id) ON DELETE CASCADE,
    CONSTRAINT fk_tooth_status FOREIGN KEY(tooth_status) REFERENCES tooth_status(status) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS patient_dentistry_prescribed_medication (
    patient_dentistry_prescribed_medication_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_dentistry_id UUID NOT NULL,
    drug_name VARCHAR(255) NOT NULL,
    dose VARCHAR(255),
    quantity INTEGER,
    instructions_usage VARCHAR(510),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_patient_dentistry_id FOREIGN KEY(patient_dentistry_id) REFERENCES patient_dentistry(patient_dentistry_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS patient_general (
    patient_general_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_personal_id UUID NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_notes VARCHAR(2550),
    patient_height INTEGER,
    patient_weight INTEGER,
    patient_temperature NUMERIC(5, 2),
    patient_blood_glucose INTEGER,
    patient_pulse INTEGER,
    patient_oxygen_saturation INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_patient_personal FOREIGN KEY(patient_personal_id) REFERENCES patient_personal(patient_personal_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS patient_general_prescribed_medication (
    patient_general_prescribed_medication_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_general_id UUID NOT NULL,
    drug_name VARCHAR(255) NOT NULL,
    dose VARCHAR(255),
    quantity INTEGER,
    instructions_usage VARCHAR(510),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_patient_general_id FOREIGN KEY(patient_general_id) REFERENCES patient_general(patient_general_id) ON DELETE CASCADE
);

-- Clean up
DROP TABLE IF EXISTS 
    patient_general_prescribed_medication,
    patient_general,
    patient_dentistry_prescribed_medication,
    patient_dentistry_tooth,
    tooth_status,
    patient_dentistry,
    patient_personal,
    project_user,
    project,
    app_user
