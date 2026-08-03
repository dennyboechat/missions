"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { GeneralPrescribedMedication } from "../../types/GeneralPrescribedMedication";
import { UpdatePatientGeneralMedication } from "../../types/GeneralPrescribedMedication";

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

export const updatePatientGeneralMedication = async ({
  patientGeneralPrescribedMedicationId,
  field,
  value,
}: UpdatePatientGeneralMedication): Promise<ActionResult<GeneralPrescribedMedication>> => {
  try {
    const projectId = await assertProjectAccess({ patientGeneralPrescribedMedicationId });

    if (!UPDATABLE_FIELDS.includes(field)) {
      throw new Error(`Field not updatable: ${field}`);
    }

    const query = `
      WITH previous AS (
        SELECT
          ${field} AS value_before
        FROM
          patient_general_prescribed_medication
        WHERE
          patient_general_prescribed_medication_id = $2
      )
      UPDATE
        patient_general_prescribed_medication 
      SET  
        ${field} = $1
      WHERE
        patient_general_prescribed_medication_id = $2
      RETURNING
        patient_general_prescribed_medication_id, patient_general_id, drug_name, dose, quantity, instructions_usage,
        (SELECT value_before FROM previous)::text AS value_before,
        (SELECT patient_general.patient_personal_id FROM patient_general WHERE patient_general.patient_general_id = patient_general_prescribed_medication.patient_general_id) AS patient_personal_id
    `;

    const validatedValue = typeof value === "string" ? value.trim() : value;

    const response = await sql.query(query, [
      validatedValue,
      patientGeneralPrescribedMedicationId,
    ]);

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

    if (generalPrescribedMedications.length === 0) {
      return actionFailed("not_found");
    }

    await recordAuditEvent({
      projectId,
      action: "changed",
      entity: "general prescription",
      entityId: patientGeneralPrescribedMedicationId,
      patientPersonalId: response.rows[0].patient_personal_id,
      field,
      valueBefore: response.rows[0].value_before,
      valueAfter: validatedValue,
    });

    return actionOk(generalPrescribedMedications[0]);
  } catch (error) {
    return toActionFailure(error);
  }
};
