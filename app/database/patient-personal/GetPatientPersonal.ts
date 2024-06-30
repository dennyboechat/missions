"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import {
  PatientPersonal,
  PatientPersonalId,
} from "../../types/PatientPersonalTypes";

export const getPatientPersonal = async ({
  patientPersonalId,
}: {
  patientPersonalId: PatientPersonalId;
}): Promise<PatientPersonal | undefined> => {
  try {
    const response = await sql`
      SELECT 
        * 
      FROM
        patient_personal 
      WHERE 
        patient_personal_id = ${patientPersonalId}
    `;

    const patientPersonals: PatientPersonal[] = response.rows.map((row) => ({
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
