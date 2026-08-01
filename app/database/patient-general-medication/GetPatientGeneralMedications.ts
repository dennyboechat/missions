"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { GeneralPrescribedMedication } from "../../types/GeneralPrescribedMedication";
import { PatientGeneralId } from "../../types/PatientGeneralTypes";

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

export const getPatientGeneralMedications = async ({
  patientGeneralId,
}: {
  patientGeneralId: PatientGeneralId;
}): Promise<ActionResult<GeneralPrescribedMedication[]>> => {
  try {
    await assertProjectAccess({ patientGeneralId });

    const query = `
      SELECT
        patient_general_prescribed_medication_id,
        patient_general_id,
        drug_name,
        dose,
        quantity,
        instructions_usage
      FROM
        patient_general_prescribed_medication
      WHERE 
        patient_general_id = $1
    `;

    const response = await sql.query(query, [patientGeneralId]);

    const generalPrescribedMedications: GeneralPrescribedMedication[] =
      response.rows.map((row) => ({
        patientGeneralPrescribedMedicationId:
          row.patient_general_prescribed_medication_id,
        patientGeneralId: row.patient_general_id,
        drug: row.drug_name,
        dose: row.dose,
        quantity: row.quantity,
        instructions: row.instructions_usage,
      }));

    return actionOk(generalPrescribedMedications);
  } catch (error) {
    return toActionFailure(error);
  }
};
