"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { PatientGeneralPrescribedMedicationId } from "../../types/GeneralPrescribedMedication";

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

export const deletePatientGeneralMedication = async ({
  patientGeneralPrescribedMedicationId,
}: {
  patientGeneralPrescribedMedicationId: PatientGeneralPrescribedMedicationId;
}) => {
  try {
    const projectId = await assertProjectAccess({ patientGeneralPrescribedMedicationId });

    const query = `
      DELETE FROM 
        patient_general_prescribed_medication 
      WHERE 
        patient_general_prescribed_medication_id = $1
      RETURNING
        patient_general_id, drug_name
    `;

    const response = await sql.query(query, [patientGeneralPrescribedMedicationId]);
    const [deleted] = response.rows;

    // Nothing removed means nothing happened, so there is nothing to record
    // -- and the caller hears that the record was already gone.
    if (!deleted) {
      return actionFailed("not_found");
    }

    await recordAuditEvent({
      projectId,
      action: "deleted",
      patientGeneralId: deleted.patient_general_id,
      entity: "general prescription",
      entityId: patientGeneralPrescribedMedicationId,
      // Which drug it was, since the prescription itself no longer exists.
      valueBefore: deleted.drug_name,
    });

    return actionOk("deleted");
  } catch (error) {
    return toActionFailure(error);
  }
};
