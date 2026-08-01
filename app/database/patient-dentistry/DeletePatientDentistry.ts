"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { PatientDentistryId } from "../../types/PatientDentistryTypes";

// Auth
import { assertProjectAccess } from "../auth/projectAccess";

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

    return 'deleted';
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
