-- Enable the uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS app_user (
    user_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_third_party_id VARCHAR(255),
    user_name VARCHAR(255) NOT NULL,
    -- Always stored lowercased and trimmed, so an invitation to
    -- Denny@idexx.com and a sign-in as denny@idexx.com are the same account.
    -- Uniqueness is the index below, on LOWER(user_email).
    user_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_app_user_email_normalised
      CHECK (user_email = LOWER(BTRIM(user_email)) AND user_email <> ''),
    CONSTRAINT chk_app_user_name_present CHECK (BTRIM(user_name) <> '')
);

CREATE TABLE IF NOT EXISTS project (
    project_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    project_description VARCHAR(255),
    -- IANA timezone of the mission location (e.g. 'Pacific/Fiji').
    -- Reports group appointments by the calendar day in this zone, so that a
    -- report reads the same no matter where it is opened from.
    project_timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
    -- How this mission writes down what it measures. Display only: heights are
    -- always stored in centimetres and temperatures in Celsius, so switching a
    -- unit never rewrites a patient's record. See
    -- migrations/008_project_units_and_date_format.sql.
    project_length_unit VARCHAR(2) NOT NULL DEFAULT 'cm',
    project_weight_unit VARCHAR(2) NOT NULL DEFAULT 'kg',
    project_temperature_unit VARCHAR(1) NOT NULL DEFAULT 'C',
    project_date_format VARCHAR(10) NOT NULL DEFAULT 'mm/dd/yyyy',
    owner_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_owner FOREIGN KEY(owner_id) REFERENCES app_user(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_project_length_unit CHECK (project_length_unit IN ('cm', 'in')),
    CONSTRAINT chk_project_weight_unit CHECK (project_weight_unit IN ('kg', 'lb')),
    CONSTRAINT chk_project_temperature_unit CHECK (project_temperature_unit IN ('C', 'F')),
    CONSTRAINT chk_project_date_format
      CHECK (project_date_format IN ('mm/dd/yyyy', 'dd/mm/yyyy'))
);

CREATE TABLE IF NOT EXISTS project_user (
    project_user_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL,
    user_id UUID NOT NULL,
    is_user_active BOOLEAN NOT NULL,
    -- Everything the owner can do except delete the project. Only counts while
    -- is_user_active, so deactivating someone withdraws all of their access and
    -- not merely the clinical part. See migrations/007_project_admins.sql.
    is_user_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_project FOREIGN KEY(project_id) REFERENCES project(project_id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES app_user(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS patient_personal (
    patient_personal_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL,
    patient_full_name VARCHAR(255) NOT NULL,
    is_patient_male BOOLEAN NOT NULL,
    -- A birth date has no time and no timezone; keep it a plain DATE so it
    -- cannot shift when rendered from another part of the world.
    patient_date_of_birth DATE,
    patient_phone_number VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_project FOREIGN KEY(project_id) REFERENCES project(project_id) ON DELETE CASCADE,
    CONSTRAINT chk_patient_full_name_present CHECK (BTRIM(patient_full_name) <> ''),
    -- A static floor only. "Not in the future" is enforced in the actions: a
    -- CHECK may not call CURRENT_DATE, since it has to hold for a row being
    -- read back and not only for the moment it was written.
    CONSTRAINT chk_patient_date_of_birth_plausible
      CHECK (patient_date_of_birth IS NULL OR patient_date_of_birth >= DATE '1900-01-01')
);

CREATE TABLE IF NOT EXISTS patient_dentistry (
    patient_dentistry_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_personal_id UUID NOT NULL,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    appointment_notes VARCHAR(2550),
    appointment_referral VARCHAR(2550),
    appointment_has_referral BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_patient_dentistry_id FOREIGN KEY(patient_dentistry_id) REFERENCES patient_dentistry(patient_dentistry_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS patient_general (
    patient_general_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_personal_id UUID NOT NULL,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    appointment_notes VARCHAR(2550),
    appointment_referral VARCHAR(2550),
    appointment_has_referral BOOLEAN NOT NULL DEFAULT FALSE,
    patient_height NUMERIC(5, 2),
    patient_weight NUMERIC(5, 2),
    patient_temperature NUMERIC(5, 2),
    patient_blood_glucose INTEGER,
    patient_pulse INTEGER,
    patient_oxygen_saturation INTEGER,
    patient_blood_pressure_systolic INTEGER,
    patient_blood_pressure_diastolic INTEGER,
    patient_vision_left_tested_distance INTEGER,
    patient_vision_left_normal_distance INTEGER,
    patient_vision_right_tested_distance INTEGER,
    patient_vision_right_normal_distance INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_patient_personal FOREIGN KEY(patient_personal_id) REFERENCES patient_personal(patient_personal_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS patient_general_prescribed_medication (
    patient_general_prescribed_medication_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_general_id UUID NOT NULL,
    drug_name VARCHAR(255) NOT NULL,
    dose VARCHAR(255),
    quantity INTEGER,
    instructions_usage VARCHAR(510),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_patient_general_id FOREIGN KEY(patient_general_id) REFERENCES patient_general(patient_general_id) ON DELETE CASCADE
);

-- Who is looking at what, right now, so the header can name the other people
-- in a record before two of them overwrite each other. One row per user per
-- resource, forgotten after thirty seconds of silence. See
-- migrations/006_page_presence.sql.
CREATE TABLE IF NOT EXISTS page_presence (
    user_id UUID NOT NULL,
    project_id UUID NOT NULL,
    resource_key VARCHAR(255) NOT NULL,
    resource_label VARCHAR(64) NOT NULL,
    last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, resource_key),
    CONSTRAINT fk_page_presence_user
      FOREIGN KEY(user_id) REFERENCES app_user(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_page_presence_project
      FOREIGN KEY(project_id) REFERENCES project(project_id) ON DELETE CASCADE
);

-- Clean up
-- DROP TABLE IF EXISTS page_presence,
-- patient_general_prescribed_medication,
-- patient_general,
-- patient_dentistry_prescribed_medication,
-- patient_dentistry_tooth,
-- tooth_status,
-- patient_dentistry,
-- patient_personal,
-- project_user,
-- project,
-- app_user

-- General report
-- select * from
-- (
-- select
-- 	patient_general.appointment_date,
-- 	'General'  as appointment_type,
-- 	patient_personal.patient_full_name,
-- 	patient_personal.patient_date_of_birth,
-- 	patient_personal.patient_phone_number,
-- 	CASE 
-- 		WHEN patient_personal.is_patient_male THEN 'male'
-- 		ELSE 'female'
-- 	END AS gender,
-- 	patient_general.patient_height::text as height,
-- 	patient_general.patient_weight::text as weight,
-- 	patient_general.patient_temperature::text as temperature,
-- 	patient_general.patient_pulse::text as pulse,
-- 	patient_general.patient_oxygen_saturation::text as oxygen_saturation, 
-- 	patient_general.patient_blood_glucose::text as blood_glucose,
-- 	patient_general.patient_blood_pressure_systolic::text || '/' || patient_general.patient_blood_pressure_diastolic::text AS blood_pressure,
-- 	patient_general.patient_vision_left_normal_distance::text || '/' || patient_general.patient_vision_left_tested_distance::text as vision_left,
-- 	patient_general.patient_vision_right_normal_distance::text || '/' || patient_general.patient_vision_right_tested_distance::text as vision_right,
-- 	patient_general.appointment_notes,
-- 	patient_general.appointment_referral,
-- 	'' as tooth,
-- 	STRING_AGG(patient_general_prescribed_medication.drug_name || ' ' || patient_general_prescribed_medication.dose || '. Quantity: ' || patient_general_prescribed_medication.quantity || '. Instructions: ' || patient_general_prescribed_medication.instructions_usage, '. ') AS medication
-- FROM 
--   project
-- INNER JOIN
--   patient_personal ON patient_personal.project_id = project.project_id
-- LEFT JOIN
--   patient_general ON patient_general.patient_personal_id = patient_personal.patient_personal_id
-- left join 
-- 	patient_general_prescribed_medication on patient_general_prescribed_medication.patient_general_id = patient_general.patient_general_id
-- WHERE 
--   project.project_id = '07bfb20c-ab8a-4745-aed0-9a107dc08574' AND
--   patient_general.appointment_date BETWEEN '2025-03-03' AND '2025-04-04'
--   group by
-- 	patient_general.appointment_date,
-- 	patient_personal.patient_full_name,
-- 	patient_personal.patient_date_of_birth,
-- 	patient_personal.patient_phone_number,
-- 	patient_personal.is_patient_male,
-- 	patient_general.patient_height,
-- 	patient_general.patient_weight,
-- 	patient_general.patient_temperature,
-- 	patient_general.patient_pulse,
-- 	patient_general.patient_oxygen_saturation, 
-- 	patient_general.patient_blood_glucose,
-- 	patient_general.patient_blood_pressure_systolic,
-- 	patient_general.patient_blood_pressure_diastolic,
-- 	patient_general.patient_vision_left_normal_distance,
-- 	patient_general.patient_vision_left_tested_distance,
-- 	patient_general.patient_vision_right_normal_distance,
-- 	patient_general.patient_vision_right_tested_distance,
-- 	patient_general.appointment_notes,
-- 	patient_general.appointment_referral
--   )
--   UNION all (
--   select
--     patient_dentistry.appointment_date,
-- 	'Dental' as appointment_type,
-- 	patient_personal.patient_full_name,
-- 	patient_personal.patient_date_of_birth,
-- 	patient_personal.patient_phone_number,
-- 	CASE 
-- 		WHEN patient_personal.is_patient_male THEN 'male'
-- 		ELSE 'female'
-- 	END AS gender,
-- 	'' as height,
-- 	'' as weight,
-- 	'' as temperature,
-- 	'' as pulse,
-- 	'' as oxygen_saturation, 
-- 	'' as blood_glucose,
-- 	'' as blood_pressure,
-- 	'' as vision_left,
-- 	'' as vision_right,
-- 	patient_dentistry.appointment_notes,
-- 	patient_dentistry.appointment_referral,
-- 	STRING_AGG('Tooth: ' || patient_dentistry_tooth.tooth_name || '. Status: ' || patient_dentistry_tooth.tooth_status || '. Notes: ' || patient_dentistry_tooth.tooth_notes , '. ') AS tooth,
-- 	STRING_AGG(patient_dentistry_prescribed_medication.drug_name || ' ' || patient_dentistry_prescribed_medication.dose || '. Quantity: ' || patient_dentistry_prescribed_medication.quantity || '. Instructions: ' || patient_dentistry_prescribed_medication.instructions_usage, '. ') AS medication
-- FROM 
--   project
-- INNER JOIN
--   patient_personal ON patient_personal.project_id = project.project_id
-- LEFT JOIN
--   patient_dentistry ON patient_dentistry.patient_personal_id = patient_personal.patient_personal_id
-- left join 
-- 	patient_dentistry_tooth on patient_dentistry_tooth.patient_dentistry_id = patient_dentistry.patient_dentistry_id
-- left join 
-- 	patient_dentistry_prescribed_medication on patient_dentistry_prescribed_medication.patient_dentistry_id = patient_dentistry.patient_dentistry_id
-- WHERE 
--   project.project_id = '07bfb20c-ab8a-4745-aed0-9a107dc08574' AND
--   patient_dentistry.appointment_date BETWEEN '2025-03-03' AND '2025-04-04'
-- group by
-- 	patient_dentistry.appointment_date,
-- 	patient_personal.patient_full_name,
-- 	patient_personal.patient_date_of_birth,
-- 	patient_personal.patient_phone_number,
-- 	patient_personal.is_patient_male,
-- 	patient_dentistry.appointment_notes,
-- 	patient_dentistry.appointment_referral
--   )  
-- order by appointment_date
-- Indexes (see app/database/migrations/003_indexes.sql for the rationale).
--
-- The three unique ones are also the guardrail: the actions insert with
-- ON CONFLICT instead of checking first, so two interleaved requests can no
-- longer both create the same user or the same membership. See
-- migrations/005_unique_identities.sql.
CREATE INDEX IF NOT EXISTS idx_project_owner_id ON project (owner_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_user_project_user_unique ON project_user (project_id, user_id);
CREATE INDEX IF NOT EXISTS idx_project_user_user_id ON project_user (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_app_user_third_party_id_unique ON app_user (user_third_party_id) WHERE user_third_party_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_app_user_email_unique ON app_user (LOWER(user_email));
CREATE INDEX IF NOT EXISTS idx_patient_personal_project_id ON patient_personal (project_id);
CREATE INDEX IF NOT EXISTS idx_patient_general_patient_personal_id ON patient_general (patient_personal_id);
CREATE INDEX IF NOT EXISTS idx_patient_dentistry_patient_personal_id ON patient_dentistry (patient_personal_id);
CREATE INDEX IF NOT EXISTS idx_patient_general_med_general_id ON patient_general_prescribed_medication (patient_general_id);
CREATE INDEX IF NOT EXISTS idx_patient_dentistry_med_dentistry_id ON patient_dentistry_prescribed_medication (patient_dentistry_id);
CREATE INDEX IF NOT EXISTS idx_patient_dentistry_tooth_dentistry_id ON patient_dentistry_tooth (patient_dentistry_id);
CREATE INDEX IF NOT EXISTS idx_patient_general_appointment_date ON patient_general (appointment_date);
CREATE INDEX IF NOT EXISTS idx_patient_dentistry_appointment_date ON patient_dentistry (appointment_date);
CREATE INDEX IF NOT EXISTS idx_page_presence_resource_last_seen ON page_presence (resource_key, last_seen_at);
