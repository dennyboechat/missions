"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import {
  DentistryPrescribedMedication,
  InsertPatientDentistryMedication,
} from "../../types/DentistryPrescribedMedication";
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

// Audit
import { recordAuditEvent } from "../audit/recordAuditEvent";

export const insertPatientDentistryMedication = async ({
  patientDentistryId,
  medication,
}: {
  patientDentistryId: PatientDentistryId;
  medication: InsertPatientDentistryMedication;
}): Promise<ActionResult<DentistryPrescribedMedication>> => {
  try {
    const projectId = await assertProjectAccess({ patientDentistryId });

    const { drug, dose, quantity, instructions } = medication;

    // Trimmed here as well as in the field. The medication report groups by the
    // stored name, so a stray trailing space makes "Ibuprofen " its own row
    // beside "Ibuprofen" -- which is how 9 of 71 ibuprofen prescriptions ended
    // up reported separately. This is a server action, so the field's own trim
    // is not the last word on what arrives.
    const trim = (value?: string) => value?.trim() || undefined;

    const query = `
      INSERT INTO
        patient_dentistry_prescribed_medication (patient_dentistry_id, drug_name, dose, quantity, instructions_usage)
      VALUES 
        ($1, $2, $3, $4, $5)
      RETURNING 
        patient_dentistry_prescribed_medication_id, patient_dentistry_id, drug_name, dose, quantity, instructions_usage
    `;

    const response = await sql.query(query, [
      patientDentistryId,
      trim(drug),
      trim(dose),
      quantity,
      trim(instructions),
    ]);

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

    if (dentistryPrescribedMedications.length === 0) {
      return actionFailed("not_found");
    }

    await recordAuditEvent({
      projectId,
      action: "added",
      patientDentistryId,
      entity: "dental prescription",
      entityId: dentistryPrescribedMedications[0].patientDentistryPrescribedMedicationId,
      valueAfter: dentistryPrescribedMedications[0].drug,
    });

    return actionOk(dentistryPrescribedMedications[0]);
  } catch (error) {
    return toActionFailure(error);
  }
};
