"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { ProjectId } from "../../types/ProjectTypes";
import { ProjectReportsAllData } from "@/app/types/ProjectReportsAllData";

// Auth
import { assertProjectAccess } from "../auth/projectAccess";

// Types
import {
  ActionResult,
  actionOk,
  actionFailed,
} from "../../types/ActionResult";

// Auth
import { toActionFailure } from "../auth/toActionFailure";

export const getProjectReportsAllData = async ({
  projectId,
  startDate,
  endDate,
}: {
  projectId: ProjectId;
  startDate?: string;
  endDate?: string;
}): Promise<ActionResult<ProjectReportsAllData[]>> => {
  try {
    await assertProjectAccess({ projectId });

    // Appointment dates are emitted as YYYY-MM-DD in the project's timezone so
    // the exported CSV matches the on-screen report exactly.
    //
    // Every optional part of a medication or a tooth is appended through
    // COALESCE(' x ' || col, ''). Concatenating a NULL in Postgres yields NULL,
    // and STRING_AGG then drops that element -- so a drug recorded without a
    // dose or a quantity used to disappear from the export altogether.
    //
    // The child rows are aggregated in correlated subqueries rather than in
    // CTEs: a CTE grouping the whole medication table had to aggregate every
    // project's rows before anything was filtered, while these use the
    // per-parent indexes and only touch the appointments that matched.
    const query = `
SELECT * FROM (
  SELECT
    'General' AS appointment_type,
    patient_personal.patient_full_name,
    TO_CHAR(patient_personal.patient_date_of_birth, 'YYYY-MM-DD') AS patient_date_of_birth,
    patient_personal.patient_phone_number,
    CASE
      WHEN patient_personal.is_patient_male THEN 'male'
      ELSE 'female'
    END AS gender,
    TO_CHAR(
      (patient_general.appointment_date AT TIME ZONE project.project_timezone)::date,
      'YYYY-MM-DD'
    ) AS general_appointment_date,
    patient_general.appointment_notes AS general_notes,
    patient_general.appointment_referral AS general_referral,
    CASE
      WHEN patient_general.appointment_has_referral THEN 'yes'
      ELSE 'no'
    END AS general_has_referral,
    (
      SELECT STRING_AGG(
        med.drug_name
          || COALESCE(' ' || med.dose, '')
          || COALESCE(' - ' || med.quantity, '')
          || COALESCE(' (' || med.instructions_usage || ')', ''),
        '; ' ORDER BY med.created_at
      )
      FROM patient_general_prescribed_medication med
      WHERE med.patient_general_id = patient_general.patient_general_id
    ) AS general_prescribed_medications,
    patient_general.patient_height,
    patient_general.patient_weight,
    patient_general.patient_temperature,
    patient_general.patient_blood_glucose,
    patient_general.patient_pulse,
    patient_general.patient_oxygen_saturation,
    patient_general.patient_blood_pressure_systolic,
    patient_general.patient_blood_pressure_diastolic,
    patient_general.patient_vision_left_normal_distance,
    patient_general.patient_vision_left_tested_distance,
    patient_general.patient_vision_right_normal_distance,
    patient_general.patient_vision_right_tested_distance,
    NULL::text AS dental_appointment_date,
    NULL::text AS dental_notes,
    NULL::text AS dental_referral,
    NULL::text AS dental_has_referral,
    NULL::text AS dental_prescribed_medications,
    NULL::text AS teeth
  FROM
    project
  INNER JOIN
    patient_personal ON patient_personal.project_id = project.project_id
  INNER JOIN
    patient_general ON patient_general.patient_personal_id = patient_personal.patient_personal_id
  WHERE
    project.project_id = $1
    AND (patient_general.appointment_date AT TIME ZONE project.project_timezone)::date BETWEEN $2::date AND $3::date
  UNION ALL
  SELECT
    'Dental' AS appointment_type,
    patient_personal.patient_full_name,
    TO_CHAR(patient_personal.patient_date_of_birth, 'YYYY-MM-DD') AS patient_date_of_birth,
    patient_personal.patient_phone_number,
    CASE
      WHEN patient_personal.is_patient_male THEN 'male'
      ELSE 'female'
    END AS gender,
    NULL::text AS general_appointment_date,
    NULL::text AS general_notes,
    NULL::text AS general_referral,
    NULL::text AS general_has_referral,
    NULL::text AS general_prescribed_medications,
    NULL::numeric AS patient_height,
    NULL::numeric AS patient_weight,
    NULL::numeric AS patient_temperature,
    NULL::integer AS patient_blood_glucose,
    NULL::integer AS patient_pulse,
    NULL::integer AS patient_oxygen_saturation,
    NULL::integer AS patient_blood_pressure_systolic,
    NULL::integer AS patient_blood_pressure_diastolic,
    NULL::integer AS patient_vision_left_normal_distance,
    NULL::integer AS patient_vision_left_tested_distance,
    NULL::integer AS patient_vision_right_normal_distance,
    NULL::integer AS patient_vision_right_tested_distance,
    TO_CHAR(
      (patient_dentistry.appointment_date AT TIME ZONE project.project_timezone)::date,
      'YYYY-MM-DD'
    ) AS dental_appointment_date,
    patient_dentistry.appointment_notes AS dental_notes,
    patient_dentistry.appointment_referral AS dental_referral,
    CASE
      WHEN patient_dentistry.appointment_has_referral THEN 'yes'
      ELSE 'no'
    END AS dental_has_referral,
    (
      SELECT STRING_AGG(
        med.drug_name
          || COALESCE(' ' || med.dose, '')
          || COALESCE(' - ' || med.quantity, '')
          || COALESCE(' (' || med.instructions_usage || ')', ''),
        '; ' ORDER BY med.created_at
      )
      FROM patient_dentistry_prescribed_medication med
      WHERE med.patient_dentistry_id = patient_dentistry.patient_dentistry_id
    ) AS dental_prescribed_medications,
    (
      SELECT STRING_AGG(
        tooth.tooth_name
          || COALESCE(' (' || tooth.tooth_status || ')', '')
          || COALESCE(' - ' || tooth.tooth_notes, ''),
        '; ' ORDER BY tooth.created_at
      )
      FROM patient_dentistry_tooth tooth
      WHERE tooth.patient_dentistry_id = patient_dentistry.patient_dentistry_id
    ) AS teeth
  FROM
    project
  INNER JOIN
    patient_personal ON patient_personal.project_id = project.project_id
  INNER JOIN
    patient_dentistry ON patient_dentistry.patient_personal_id = patient_personal.patient_personal_id
  WHERE
    project.project_id = $1
    AND (patient_dentistry.appointment_date AT TIME ZONE project.project_timezone)::date BETWEEN $2::date AND $3::date
) AS report
ORDER BY
  patient_full_name,
  COALESCE(general_appointment_date, dental_appointment_date),
  appointment_type
    `;

    const response = await sql.query(query, [projectId, startDate, endDate]);

    const allData: ProjectReportsAllData[] = response.rows.map((row) => ({
      appointmentType: row.appointment_type,
      patientFullName: row.patient_full_name,
      patientDateOfBirth: row.patient_date_of_birth,
      patientPhoneNumber: row.patient_phone_number,
      gender: row.gender,
      generalAppointmentDate: row.general_appointment_date,
      generalNotes: row.general_notes,
      generalReferral: row.general_referral,
      generalHasReferral: row.general_has_referral,
      generalPrescribedMedications: row.general_prescribed_medications,
      patientHeight: row.patient_height,
      patientWeight: row.patient_weight,
      patientTemperature: row.patient_temperature,
      patientBloodGlucose: row.patient_blood_glucose,
      patientPulse: row.patient_pulse,
      patientOxygenSaturation: row.patient_oxygen_saturation,
      patientBloodPressureSystolic: row.patient_blood_pressure_systolic,
      patientBloodPressureDiastolic: row.patient_blood_pressure_diastolic,
      patientVisionLeftNormalDistance: row.patient_vision_left_normal_distance,
      patientVisionLeftTestedDistance: row.patient_vision_left_tested_distance,
      patientVisionRightNormalDistance:
        row.patient_vision_right_normal_distance,
      patientVisionRightTestedDistance:
        row.patient_vision_right_tested_distance,
      dentalAppointmentDate: row.dental_appointment_date,
      dentalNotes: row.dental_notes,
      dentalReferral: row.dental_referral,
      dentalHasReferral: row.dental_has_referral,
      dentalPrescribedMedications: row.dental_prescribed_medications,
      teeth: row.teeth,
    }));

    return actionOk(allData);
  } catch (error) {
    return toActionFailure(error);
  }
};
