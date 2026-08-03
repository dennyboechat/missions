"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { DentistryPrescribedMedication } from "../../types/DentistryPrescribedMedication";
import { UpdatePatientDentistryMedication } from "../../types/DentistryPrescribedMedication";

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


// `field` is interpolated into the statement, so it has to come from a fixed set.
const UPDATABLE_FIELDS = [
  "drug_name",
  "dose",
  "quantity",
  "instructions_usage",
];

export const updatePatientDentistryMedication = async ({
  patientDentistryPrescribedMedicationId,
  field,
  value,
}: UpdatePatientDentistryMedication): Promise<ActionResult<DentistryPrescribedMedication>> => {
  try {
    const projectId = await assertProjectAccess({ patientDentistryPrescribedMedicationId });

    if (!UPDATABLE_FIELDS.includes(field)) {
      throw new Error(`Field not updatable: ${field}`);
    }

    const query = `
      WITH previous AS (
        SELECT
          ${field} AS value_before
        FROM
          patient_dentistry_prescribed_medication
        WHERE
          patient_dentistry_prescribed_medication_id = $2
      )
      UPDATE
        patient_dentistry_prescribed_medication 
      SET  
        ${field} = $1
      WHERE
        patient_dentistry_prescribed_medication_id = $2
      RETURNING
        patient_dentistry_prescribed_medication_id, patient_dentistry_id, drug_name, dose, quantity, instructions_usage,
        (SELECT value_before FROM previous)::text AS value_before,
        (SELECT patient_dentistry.patient_personal_id FROM patient_dentistry WHERE patient_dentistry.patient_dentistry_id = patient_dentistry_prescribed_medication.patient_dentistry_id) AS patient_personal_id
    `;

    const validatedValue = typeof value === "string" ? value.trim() : value;

    const response = await sql.query(query, [
      validatedValue,
      patientDentistryPrescribedMedicationId,
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
      action: "changed",
      entity: "dental prescription",
      entityId: patientDentistryPrescribedMedicationId,
      patientPersonalId: response.rows[0].patient_personal_id,
      field,
      valueBefore: response.rows[0].value_before,
      valueAfter: validatedValue,
    });

    return actionOk(dentistryPrescribedMedications[0]);
  } catch (error) {
    return toActionFailure(error);
  }
};
