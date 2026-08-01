"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { PatientPersonalId } from "../../types/PatientPersonalTypes";
import { PatientDentalSummary } from "../../types/PatientDentalSummary";

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

export const getPatientDentalSummary = async ({
  patientPersonalId,
}: {
  patientPersonalId: PatientPersonalId;
}): Promise<ActionResult<PatientDentalSummary[]>> => {
  try {
    await assertProjectAccess({ patientPersonalId });

    const query = `
      SELECT 
        patient_dentistry.patient_dentistry_id,
        TO_CHAR(
          (patient_dentistry.appointment_date AT TIME ZONE project.project_timezone)::date,
          'YYYY-MM-DD'
        ) AS appointment_date,
        appointment_has_referral,
        appointment_referral,
        tooth_name,
        tooth_status,
        patient_dentistry_prescribed_medication_id,
        drug_name,
        dose,
        quantity,
        instructions_usage
      FROM
        patient_dentistry
      INNER JOIN
        patient_personal ON patient_personal.patient_personal_id = patient_dentistry.patient_personal_id
      INNER JOIN
        project ON project.project_id = patient_personal.project_id
      LEFT JOIN
        patient_dentistry_tooth ON patient_dentistry_tooth.patient_dentistry_id = patient_dentistry.patient_dentistry_id
      LEFT JOIN
        patient_dentistry_prescribed_medication ON patient_dentistry_prescribed_medication.patient_dentistry_id = patient_dentistry.patient_dentistry_id
      WHERE
        patient_dentistry.patient_personal_id = $1
      ORDER BY
        patient_dentistry.appointment_date DESC,
        tooth_name,
        drug_name
    `;

    const response = await sql.query(query, [patientPersonalId]);

    const patientDentalSummary: PatientDentalSummary[] = response.rows.map(
      (row) => ({
        patientDentistryId: row.patient_dentistry_id,
        appointmentDate: row.appointment_date,
        appointmentHasReferral: row.appointment_has_referral,
        appointmentReferral: row.appointment_referral,
        toothName: row.tooth_name,
        toothStatus: row.tooth_status,
        patientDentistryPrescribedMedicationId:
          row.patient_dentistry_prescribed_medication_id,
        drug: row.drug_name,
        dose: row.dose,
        quantity: row.quantity,
        instructions: row.instructions_usage,
      })
    );

    return actionOk(patientDentalSummary);
  } catch (error) {
    return toActionFailure(error);
  }
};
