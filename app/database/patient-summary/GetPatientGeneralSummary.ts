"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { PatientPersonalId } from "../../types/PatientPersonalTypes";
import { PatientGeneralSummary } from "../../types/PatientGeneralSummary";

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

export const getPatientGeneralSummary = async ({
  patientPersonalId,
}: {
  patientPersonalId: PatientPersonalId;
}): Promise<ActionResult<PatientGeneralSummary[]>> => {
  try {
    await assertProjectAccess({ patientPersonalId });

    const query = `
      SELECT 
        patient_general.patient_general_id,
        TO_CHAR(
          (patient_general.appointment_date AT TIME ZONE project.project_timezone)::date,
          'YYYY-MM-DD'
        ) AS appointment_date,
        patient_height,
        patient_weight,
        patient_temperature,
        patient_blood_glucose,
        patient_pulse,
        patient_oxygen_saturation,
        patient_blood_pressure_systolic,
        patient_blood_pressure_diastolic,
        patient_vision_left_tested_distance,
        patient_vision_left_normal_distance,
        patient_vision_right_tested_distance,
        patient_vision_right_normal_distance,
        appointment_has_referral,
        appointment_referral,
        patient_general_prescribed_medication_id,
        drug_name,
        dose,
        quantity,
        instructions_usage
      FROM
        patient_general
      INNER JOIN
        patient_personal ON patient_personal.patient_personal_id = patient_general.patient_personal_id
      INNER JOIN
        project ON project.project_id = patient_personal.project_id
      LEFT JOIN
        patient_general_prescribed_medication ON patient_general_prescribed_medication.patient_general_id = patient_general.patient_general_id
      WHERE
        patient_general.patient_personal_id = $1
      ORDER BY
        patient_general.appointment_date DESC,
        drug_name
    `;

    const response = await sql.query(query, [patientPersonalId]);

    const patientGeneralSummary: PatientGeneralSummary[] = response.rows.map(
      (row) => ({
        patientGeneralId: row.patient_general_id,
        appointmentDate: row.appointment_date,
        patientHeight: row.patient_height,
        patientWeight: row.patient_weight,
        patientTemperature: row.patient_temperature,
        patientBloodGlucose: row.patient_blood_glucose,
        patientPulse: row.patient_pulse,
        patientOxygenSaturation: row.patient_oxygen_saturation,
        patientBloodPressureSystolic: row.patient_blood_pressure_systolic,
        patientBloodPressureDiastolic: row.patient_blood_pressure_diastolic,
        patientVisionLeftTestedDistance:
          row.patient_vision_left_tested_distance,
        patientVisionLeftNormalDistance:
          row.patient_vision_left_normal_distance,
        patientVisionRightTestedDistance:
          row.patient_vision_right_tested_distance,
        patientVisionRightNormalDistance:
          row.patient_vision_right_normal_distance,
        appointmentHasReferral: row.appointment_has_referral,
        appointmentReferral: row.appointment_referral ?? "",
        patientGeneralPrescribedMedicationId:
          row.patient_general_prescribed_medication_id,
        drug: row.drug_name,
        dose: row.dose,
        quantity: row.quantity,
        instructions: row.instructions_usage,
      })
    );

    return actionOk(patientGeneralSummary);
  } catch (error) {
    return toActionFailure(error);
  }
};
