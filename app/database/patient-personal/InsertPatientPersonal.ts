"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import {
  PatientPersonalTypes,
  NewPatientPersonal,
} from "../../types/PatientPersonalTypes";

// Utils
import { getFormattedDate } from "../../utils/getFormattedDate";

export const insertPatientPersonal = async ({
  projectId,
  patientFullName,
  isPatientMale,
  patientDateOfBirth,
}: NewPatientPersonal): Promise<PatientPersonalTypes | undefined> => {
  try {
    const parsedPatientDateOfBirth = getFormattedDate(patientDateOfBirth);

    const response = await sql`
      INSERT INTO 
        patient_personal (project_id, patient_full_name, is_patient_male, patient_date_of_birth)
      VALUES 
        (${projectId}, ${patientFullName.trim()}, ${isPatientMale}, ${parsedPatientDateOfBirth})
      RETURNING 
        patient_personal_id, project_id, patient_full_name, is_patient_male, patient_date_of_birth
    `;

    const patientPersonals: PatientPersonalTypes[] = response.rows.map(
      (row) => ({
        patientPersonalId: row.patient_personal_id,
        projectId: row.project_id,
        patientFullName: row.patient_full_name,
        isPatientMale: row.is_patient_male,
        patientDateOfBirth: row.patient_date_of_birth,
      })
    );

    return patientPersonals?.length > 0 ? patientPersonals[0] : undefined;
  } catch (error) {
    console.error(error);
  }
};
