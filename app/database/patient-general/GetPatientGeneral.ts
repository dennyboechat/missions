"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { PatientGeneralTypes } from "../../types/PatientGeneralTypes";

import { PatientPersonalId } from "../../types/PatientPersonalTypes";

export const getPatientGeneral = async ({
  patientPersonalId,
}: {
  patientPersonalId: PatientPersonalId;
}): Promise<PatientGeneralTypes[] | undefined> => {
  try {
    const query = `
      SELECT 
        * 
      FROM
        patient_personal
      LEFT JOIN
        patient_general ON patient_general.patient_personal_id = patient_personal.patient_personal_id
      WHERE 
        patient_personal.patient_personal_id = $1
      ORDER BY
        patient_general.appointment_date DESC,
        patient_general.created_at DESC
    `;

    const response = await sql.query(query, [patientPersonalId]);

    const patientGeneral: PatientGeneralTypes[] = response.rows.map((row) => ({
      patientGeneralId: row.patient_general_id,
      patientPersonalId: row.patient_personal_id,
      appointmentNotes: row.appointment_notes,
      appointmentDate: row.appointment_date,
      projectId: row.project_id,
      patientFullName: row.patient_full_name,
      isPatientMale: row.is_patient_male,
      patientDateOfBirth: row.patient_date_of_birth,
    }));

    return patientGeneral;
  } catch (error) {
    console.error(error);
  }
};
