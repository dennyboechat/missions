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
    patient_phone_number VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_project FOREIGN KEY(project_id) REFERENCES project(project_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS patient_dentistry (
    patient_dentistry_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_personal_id UUID NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_notes VARCHAR(2550),
    appointment_referral VARCHAR(2550),
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
    appointment_referral VARCHAR(2550),
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
-- DROP TABLE IF EXISTS patient_general_prescribed_medication,
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