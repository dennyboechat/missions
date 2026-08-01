"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { PatientPersonalId } from "../../types/PatientPersonalTypes";

// Auth
import { assertProjectAccess } from "../auth/projectAccess";

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

    return 'deleted';
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
