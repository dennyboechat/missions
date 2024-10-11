"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { PatientPersonalId } from "../../types/PatientPersonalTypes";

export const deletePatientPersonal = async ({
  patientPersonalId,
}: {
  patientPersonalId: PatientPersonalId;
}) => {
  try {
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
