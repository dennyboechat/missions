"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { PatientGeneralTypes } from "../../types/PatientGeneralTypes";

import { PatientPersonalId } from "../../types/PatientPersonalTypes";

// Auth
import { assertProjectAccess } from "../auth/projectAccess";

export const getPatientGeneral = async ({
  patientPersonalId,
}: {
  patientPersonalId: PatientPersonalId;
}): Promise<PatientGeneralTypes[] | undefined> => {
  try {
    await assertProjectAccess({ patientPersonalId });

    const query = `
      SELECT
        *,
        TO_CHAR(patient_personal.patient_date_of_birth, 'YYYY-MM-DD') AS patient_date_of_birth_text,
        TO_CHAR(
          (patient_general.appointment_date AT TIME ZONE project.project_timezone)::date,
          'YYYY-MM-DD'
        ) AS appointment_date_text
      FROM
        patient_personal
      INNER JOIN
        project ON project.project_id = patient_personal.project_id
      LEFT JOIN
        patient_general ON patient_general.patient_personal_id = patient_personal.patient_personal_id
      WHERE
        patient_personal.patient_personal_id = $1
      ORDER BY
        patient_general.appointment_date DESC,
        patient_general.created_at DESC
    `;

    const response = await sql.query(query, [patientPersonalId]);

    const patientGeneral: PatientGeneralTypes[] = response.rows.map((row) => ({
      patientGeneralId: row.patient_general_id,
      patientPersonalId: row.patient_personal_id,
      appointmentNotes: row.appointment_notes,
      appointmentDate: row.appointment_date_text,
      projectId: row.project_id,
      patientFullName: row.patient_full_name,
      isPatientMale: row.is_patient_male,
      patientDateOfBirth: row.patient_date_of_birth_text,
      patientHeight: row.patient_height,
      patientWeight: row.patient_weight,
      patientTemperature: row.patient_temperature,
      patientBloodGlucose: row.patient_blood_glucose,
      patientPulse: row.patient_pulse,
      patientOxygenSaturation: row.patient_oxygen_saturation,
      patientBloodPressureSystolic: row.patient_blood_pressure_systolic,
      patientBloodPressureDiastolic: row.patient_blood_pressure_diastolic,
      patientVisionLeftTestedDistance: row.patient_vision_left_tested_distance,
      patientVisionLeftNormalDistance: row.patient_vision_left_normal_distance,
      patientVisionRightTestedDistance: row.patient_vision_right_tested_distance,
      patientVisionRightNormalDistance: row.patient_vision_right_normal_distance,
      appointmentHasReferral: row.appointment_has_referral,
      appointmentReferral: row.appointment_referral,
    }));

    return patientGeneral;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
