"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { DentistryPrescribedMedication } from "../../types/DentistryPrescribedMedication";
import { PatientDentistryId } from "../../types/PatientDentistryTypes";

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

export const getPatientDentistryMedications = async ({
  patientDentistryId,
}: {
  patientDentistryId: PatientDentistryId;
}): Promise<ActionResult<DentistryPrescribedMedication[]>> => {
  try {
    await assertProjectAccess({ patientDentistryId });

    const query = `
      SELECT
        patient_dentistry_prescribed_medication_id,
        patient_dentistry_id,
        drug_name,
        dose,
        quantity,
        instructions_usage
      FROM
        patient_dentistry_prescribed_medication
      WHERE 
        patient_dentistry_id = $1
    `;

    const response = await sql.query(query, [patientDentistryId]);

    const dentistryPrescribedMedications: DentistryPrescribedMedication[] =
      response.rows.map((row) => ({
        patientDentistryPrescribedMedicationId:
          row.patient_dentistry_prescribed_medication_id,
        patientDentistryId: row.patient_dentistry_id,
        drug: row.drug_name,
        dose: row.dose,
        quantity: row.quantity,
        instructions: row.instructions_usage,
      }));

    return actionOk(dentistryPrescribedMedications);
  } catch (error) {
    return toActionFailure(error);
  }
};
