"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { PatientPersonalId } from "../../types/PatientPersonalTypes";
import { PatientPersonalSummary } from "../../types/PatientPersonalSummary";

export const getPatientSummary = async ({
  patientPersonalId,
}: {
  patientPersonalId: PatientPersonalId;
}): Promise<PatientPersonalSummary | undefined> => {
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

    const patientPersonalSummary: PatientPersonalSummary[] = response.rows.map(
      (row) => ({
        patientPersonalId: row.patient_personal_id,
        projectId: row.project_id,
        patientFullName: row.patient_full_name,
        isPatientMale: row.is_patient_male,
        patientDateOfBirth: row.patient_date_of_birth,
        patientPhoneNumber: row.patient_phone_number,
      })
    );

    return patientPersonalSummary && patientPersonalSummary.length > 0
      ? patientPersonalSummary[0]
      : undefined;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
