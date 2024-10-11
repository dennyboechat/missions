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

    const query = `
      INSERT INTO 
        patient_personal (project_id, patient_full_name, is_patient_male, patient_date_of_birth)
      VALUES 
        ($1, $2, $3, $4)
      RETURNING 
        patient_personal_id, project_id, patient_full_name, is_patient_male, patient_date_of_birth
    `;

    const response = await sql.query(query, [
      projectId,
      patientFullName.trim(),
      isPatientMale,
      parsedPatientDateOfBirth,
    ]);

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
    return undefined;
  }
};
