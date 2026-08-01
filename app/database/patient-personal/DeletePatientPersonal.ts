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

export const deletePatientPersonal = async ({
  patientPersonalId,
}: {
  patientPersonalId: PatientPersonalId;
}) => {
  try {
    await assertProjectAccess({ patientPersonalId });

    const query = `
      DELETE FROM 
        patient_personal 
      WHERE 
        patient_personal_id = $1`;

    await sql.query(query, [patientPersonalId]);

    return actionOk('deleted');
  } catch (error) {
    return toActionFailure(error);
  }
};
