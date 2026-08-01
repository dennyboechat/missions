"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
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

export const deletePatientGeneral = async ({
  patientGeneralId,
}: {
  patientGeneralId: PatientGeneralId;
}) => {
  try {
    await assertProjectAccess({ patientGeneralId });

    const query = `
      DELETE FROM 
        patient_general 
      WHERE 
        patient_general_id = $1`;

    await sql.query(query, [patientGeneralId]);

    return actionOk('deleted');
  } catch (error) {
    return toActionFailure(error);
  }
};
