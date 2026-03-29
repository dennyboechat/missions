"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { ProjectId } from "../../types/ProjectTypes";
import { ProjectReportsAllData } from "@/app/types/ProjectReportsAllData";

export const getProjectReportsAllData = async ({
  projectId,
  startDate,
  endDate,
}: {
  projectId: ProjectId;
  startDate?: string;
  endDate?: string;
}): Promise<ProjectReportsAllData[] | undefined> => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  try {
    const query = `
WITH general_meds AS (
  SELECT
    patient_general_id,
    STRING_AGG(drug_name || ' ' || dose || ' - ' || quantity, ', ') AS prescribed_medications
  FROM patient_general_prescribed_medication
  GROUP BY patient_general_id
),
dental_meds AS (
  SELECT
    patient_dentistry_id,
    STRING_AGG(drug_name || ' ' || dose || ' - ' || quantity, ', ') AS prescribed_medications
  FROM patient_dentistry_prescribed_medication
  GROUP BY patient_dentistry_id
),
dental_teeth AS (
  SELECT
    patient_dentistry_id,
    STRING_AGG(tooth_name, ', ') AS teeth_names
  FROM patient_dentistry_tooth
  GROUP BY patient_dentistry_id
)
SELECT
  patient_personal.patient_full_name,
  patient_personal.patient_date_of_birth,
  patient_personal.patient_phone_number,
  CASE 
    WHEN patient_personal.is_patient_male THEN 'male'
    ELSE 'female'
  END AS gender,
  patient_general.appointment_date AS general_appointment_date,
  patient_general.appointment_notes AS general_notes,
  general_meds.prescribed_medications AS general_prescribed_medications,
  patient_general.patient_height AS patient_height,
  patient_general.patient_weight AS patient_weight,
  patient_general.patient_temperature AS patient_temperature,
  patient_general.patient_blood_glucose AS patient_blood_glucose,
  patient_general.patient_pulse AS patient_pulse,
  patient_general.patient_oxygen_saturation AS patient_oxygen_saturation,
  patient_general.patient_blood_pressure_diastolic AS patient_blood_pressure_diastolic,
  NULL AS dental_appointment_date,
  NULL AS dental_notes,
  NULL AS dental_prescribed_medications,
  NULL AS teeth_names
FROM
  project
INNER JOIN
  patient_personal ON patient_personal.project_id = project.project_id
INNER JOIN
  patient_general ON patient_general.patient_personal_id = patient_personal.patient_personal_id
LEFT JOIN
  general_meds ON general_meds.patient_general_id = patient_general.patient_general_id
WHERE
  project.project_id = $1
  AND (patient_general.appointment_date AT TIME ZONE $4)::date BETWEEN $2::date AND $3::date
UNION ALL
SELECT
  patient_personal.patient_full_name,
  patient_personal.patient_date_of_birth,
  patient_personal.patient_phone_number,
  CASE 
    WHEN patient_personal.is_patient_male THEN 'male'
    ELSE 'female'
  END AS gender,
  NULL AS general_appointment_date,
  NULL AS general_notes,
  NULL AS general_prescribed_medications,
  NULL AS patient_height,
  NULL AS patient_weight,
  NULL AS patient_temperature,
  NULL AS patient_blood_glucose,
  NULL AS patient_pulse,
  NULL AS patient_oxygen_saturation,
  NULL AS patient_blood_pressure_diastolic,
  patient_dentistry.appointment_date AS dental_appointment_date,
  patient_dentistry.appointment_notes AS dental_notes,
  dental_meds.prescribed_medications AS dental_prescribed_medications,
  dental_teeth.teeth_names
FROM
  project
INNER JOIN
  patient_personal ON patient_personal.project_id = project.project_id
INNER JOIN
  patient_dentistry ON patient_dentistry.patient_personal_id = patient_personal.patient_personal_id
LEFT JOIN
  dental_meds ON dental_meds.patient_dentistry_id = patient_dentistry.patient_dentistry_id
LEFT JOIN
  dental_teeth ON dental_teeth.patient_dentistry_id = patient_dentistry.patient_dentistry_id
WHERE
  project.project_id = $1
  AND (patient_dentistry.appointment_date AT TIME ZONE $4)::date BETWEEN $2::date AND $3::date
ORDER BY
  patient_full_name
    `;

    const response = await sql.query(query, [projectId, startDate, endDate, timeZone]);

    const allData: ProjectReportsAllData[] = response.rows.map(
      (row) => ({
        patientFullName: row.patient_full_name,
        patientDateOfBirth: row.patient_date_of_birth,
        patientPhoneNumber: row.patient_phone_number,
        gender: row.gender,
        generalAppointmentDate: row.general_appointment_date,
        generalNotes: row.general_notes,
        generalPrescribedMedications: row.general_prescribed_medications,
        patientHeight: row.patient_height,
        patientWeight: row.patient_weight,
        patientTemperature: row.patient_temperature,
        patientBloodGlucose: row.patient_blood_glucose,
        patientPulse: row.patient_pulse,
        patientOxygenSaturation: row.patient_oxygen_saturation,
        patientBloodPressureDiastolic: row.patient_blood_pressure_diastolic,
        dentalAppointmentDate: row.dental_appointment_date,
        dentalNotes: row.dental_notes,
        dentalPrescribedMedications: row.dental_prescribed_medications,
        teethNames: row.teeth_names,
      })
    );

    return allData;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
