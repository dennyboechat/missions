"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import {
  PatientPersonalTypes,
  PatientPersonalId,
} from "../../types/PatientPersonalTypes";

export const getPatientPersonal = async ({
  patientPersonalId,
}: {
  patientPersonalId: PatientPersonalId;
}): Promise<PatientPersonalTypes | undefined> => {
  try {
    const response = await sql`
      SELECT 
        * 
      FROM
        patient_personal 
      WHERE 
        patient_personal_id = ${patientPersonalId}
    `;

    const patientPersonals: PatientPersonalTypes[] = response.rows.map((row) => ({
      patientPersonalId: row.patient_personal_id,
      projectId: row.project_id,
      patientFullName: row.patient_full_name,
      isPatientMale: row.is_patient_male,
      patientDateOfBirth: row.patient_date_of_birth,
    }));

    return patientPersonals && patientPersonals.length > 0
      ? patientPersonals[0]
      : undefined;
  } catch (error) {
    console.error(error);
  }
};
