"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { PatientDentistryPrescribedMedicationId } from "../../types/DentistryPrescribedMedication";

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

export const deletePatientDentistryMedication = async ({
  patientDentistryPrescribedMedicationId,
}: {
  patientDentistryPrescribedMedicationId: PatientDentistryPrescribedMedicationId;
}) => {
  try {
    const projectId = await assertProjectAccess({ patientDentistryPrescribedMedicationId });

    const query = `
      DELETE FROM 
        patient_dentistry_prescribed_medication 
      WHERE 
        patient_dentistry_prescribed_medication_id = $1
      RETURNING
        patient_dentistry_id, drug_name
    `;

    const response = await sql.query(query, [patientDentistryPrescribedMedicationId]);
    const [deleted] = response.rows;

    // Nothing removed means nothing happened, so there is nothing to record
    // -- and the caller hears that the record was already gone.
    if (!deleted) {
      return actionFailed("not_found");
    }

    await recordAuditEvent({
      projectId,
      action: "deleted",
      patientDentistryId: deleted.patient_dentistry_id,
      entity: "dental prescription",
      entityId: patientDentistryPrescribedMedicationId,
      // Which drug it was, since the prescription itself no longer exists.
      valueBefore: deleted.drug_name,
    });

    return actionOk("deleted");
  } catch (error) {
    return toActionFailure(error);
  }
};
