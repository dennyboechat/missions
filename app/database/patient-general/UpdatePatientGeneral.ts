"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import {
  PatientGeneral,
  UpdatePatientGeneral,
} from "../../types/PatientGeneralTypes";

export const updatePatientGeneral = async ({
  patientGeneralId,
  field,
  value,
}: UpdatePatientGeneral): Promise<PatientGeneral | undefined> => {
  try {
    const query = `
      UPDATE 
        patient_general
       SET
        ${field} = $1
      WHERE
        patient_general_id = $2
      RETURNING
        patient_general_id, patient_personal_id, appointment_date, appointment_notes
    `;

    const validatedValue = typeof value === "string" ? value.trim() : value;

    const response = await sql.query(query, [validatedValue, patientGeneralId]);

    const patientGeneral: PatientGeneral[] = response.rows.map((row) => ({
      patientGeneralId: row.patient_general_id,
      patientPersonalId: row.patient_personal_id,
      appointmentNotes: row.appointment_notes,
      appointmentDate: row.appointment_date,
    }));

    return patientGeneral && patientGeneral.length > 0
      ? patientGeneral[0]
      : undefined;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
