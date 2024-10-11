"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { PatientGeneralId } from "../../types/PatientGeneralTypes";

export const deletePatientGeneral = async ({
  patientGeneralId,
}: {
  patientGeneralId: PatientGeneralId;
}) => {
  try {
    const query = `
      DELETE FROM 
        patient_general 
      WHERE 
        patient_general_id = $1`;

    await sql.query(query, [patientGeneralId]);

    return 'deleted';
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
