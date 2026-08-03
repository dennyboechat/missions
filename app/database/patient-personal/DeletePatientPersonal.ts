"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { PatientPersonalId } from "../../types/PatientPersonalTypes";

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

export const deletePatientPersonal = async ({
  patientPersonalId,
}: {
  patientPersonalId: PatientPersonalId;
}) => {
  try {
    const projectId = await assertProjectAccess({ patientPersonalId });

    const query = `
      DELETE FROM 
        patient_personal 
      WHERE 
        patient_personal_id = $1
      RETURNING
        patient_personal_id, patient_full_name`;

    const response = await sql.query(query, [patientPersonalId]);
    const [deleted] = response.rows;

    // Nothing removed means nothing happened, so there is nothing to record
    // -- and the caller hears that the record was already gone.
    if (!deleted) {
      return actionFailed("not_found");
    }

    await recordAuditEvent({
      projectId,
      action: "deleted",
      entity: "patient",
      entityId: patientPersonalId,
      patientPersonalId: deleted.patient_personal_id,
      // The row is gone, so the name has to travel with the event.
      patientName: deleted.patient_full_name,
    });

    return actionOk("deleted");
  } catch (error) {
    return toActionFailure(error);
  }
};
