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

export const deletePatientDentistry = async ({
  patientDentistryId,
}: {
  patientDentistryId: PatientDentistryId;
}) => {
  try {
    await assertProjectAccess({ patientDentistryId });

    const query = `
      DELETE FROM 
        patient_dentistry 
      WHERE 
        patient_dentistry_id = $1`;

    await sql.query(query, [patientDentistryId]);

    return actionOk('deleted');
  } catch (error) {
    return toActionFailure(error);
  }
};
