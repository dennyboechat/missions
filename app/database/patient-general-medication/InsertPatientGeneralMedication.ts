"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import {
  GeneralPrescribedMedication,
  InsertPatientGeneralMedication,
} from "../../types/GeneralPrescribedMedication";
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

// Audit
import { recordAuditEvent } from "../audit/recordAuditEvent";

export const insertPatientGeneralMedication = async ({
  patientGeneralId,
  medication,
}: {
  patientGeneralId: PatientGeneralId;
  medication: InsertPatientGeneralMedication;
}): Promise<ActionResult<GeneralPrescribedMedication>> => {
  try {
    const projectId = await assertProjectAccess({ patientGeneralId });

    const { drug, dose, quantity, instructions } = medication;

    // Trimmed here as well as in the field. The medication report groups by the
    // stored name, so a stray trailing space makes "Ibuprofen " its own row
    // beside "Ibuprofen" -- which is how 9 of 71 ibuprofen prescriptions ended
    // up reported separately. This is a server action, so the field's own trim
    // is not the last word on what arrives.
    const trim = (value?: string) => value?.trim() || undefined;

    const query = `
      INSERT INTO
        patient_general_prescribed_medication (patient_general_id, drug_name, dose, quantity, instructions_usage)
      VALUES 
        ($1, $2, $3, $4, $5)
      RETURNING 
        patient_general_prescribed_medication_id, patient_general_id, drug_name, dose, quantity, instructions_usage
    `;

    const response = await sql.query(query, [
      patientGeneralId,
      trim(drug),
      trim(dose),
      quantity,
      trim(instructions),
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
      action: "added",
      patientGeneralId,
      entity: "general prescription",
      entityId: generalPrescribedMedications[0].patientGeneralPrescribedMedicationId,
      // The drug is what makes the line readable: "added a prescription" alone
      // says nothing a reader can check.
      valueAfter: generalPrescribedMedications[0].drug,
    });

    return actionOk(generalPrescribedMedications[0]);
  } catch (error) {
    return toActionFailure(error);
  }
};
