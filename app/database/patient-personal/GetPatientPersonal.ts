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
    const query = `
      SELECT 
        * 
      FROM
        patient_personal 
      WHERE 
        patient_personal_id = $1
    `;

    const response = await sql.query(query, [patientPersonalId]);

    const patientPersonals: PatientPersonalTypes[] = response.rows.map(
      (row) => ({
        patientPersonalId: row.patient_personal_id,
        projectId: row.project_id,
        patientFullName: row.patient_full_name,
        isPatientMale: row.is_patient_male,
        patientDateOfBirth: row.patient_date_of_birth,
        patientPhoneNumber: row.patient_phone_number,
      })
    );

    return patientPersonals && patientPersonals.length > 0
      ? patientPersonals[0]
      : undefined;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
