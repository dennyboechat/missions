"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import {
  PatientPersonalTypes,
  UpdatePatientPersonal,
} from "../../types/PatientPersonalTypes";

export const updatePatientPersonal = async ({
  patientPersonalId,
  field,
  value,
}: UpdatePatientPersonal): Promise<PatientPersonalTypes | undefined> => {
  try {
    const query = `
      UPDATE 
        patient_personal 
      SET 
        ${field} = $1
      WHERE 
        patient_personal_id = $2
      RETURNING 
        patient_personal_id, project_id, patient_full_name, is_patient_male, patient_date_of_birth, patient_phone_number
    `;

    const validatedValue = typeof value === "string" ? value.trim() : value;
    const response = await sql.query(query, [
      validatedValue,
      patientPersonalId,
    ]);

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

    return patientPersonals?.length > 0 ? patientPersonals[0] : undefined;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
