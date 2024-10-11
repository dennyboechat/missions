"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { PatientDentistryId } from "../../types/PatientDentistryTypes";

export const deletePatientDentistry = async ({
  patientDentistryId,
}: {
  patientDentistryId: PatientDentistryId;
}) => {
  try {
    const query = `
      DELETE FROM 
        patient_dentistry 
      WHERE 
        patient_dentistry_id = $1`;

    await sql.query(query, [patientDentistryId]);

    return 'deleted';
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
