"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
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

export const deletePatientDentistry = async ({
  patientDentistryId,
}: {
  patientDentistryId: PatientDentistryId;
}) => {
  try {
    const projectId = await assertProjectAccess({ patientDentistryId });

    const query = `
      DELETE FROM 
        patient_dentistry 
      WHERE 
        patient_dentistry_id = $1
      RETURNING
        patient_personal_id`;

    const response = await sql.query(query, [patientDentistryId]);
    const [deleted] = response.rows;

    // Nothing removed means nothing happened, so there is nothing to record
    // -- and the caller hears that the record was already gone.
    if (!deleted) {
      return actionFailed("not_found");
    }

    await recordAuditEvent({
      projectId,
      action: "deleted",
      entity: "dental appointment",
      entityId: patientDentistryId,
      patientPersonalId: deleted.patient_personal_id,
    });

    return actionOk("deleted");
  } catch (error) {
    return toActionFailure(error);
  }
};
