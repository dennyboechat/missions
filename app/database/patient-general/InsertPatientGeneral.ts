"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { PatientGeneral } from "../../types/PatientGeneralTypes";
import { PatientPersonalId } from "../../types/PatientPersonalTypes";

// Utils
import { getCurrentDate } from "@/app/utils/getCurrentDate";

export const insertPatientGeneral = async ({
  patientPersonalId,
}: {
  patientPersonalId: PatientPersonalId;
}): Promise<PatientGeneral | undefined> => {
  try {
    const currentDate = getCurrentDate();

    const query = `
      INSERT INTO
        patient_general (patient_personal_id, appointment_date, appointment_notes)
      VALUES 
        ($1, $2, $3)
      RETURNING 
        patient_general_id, patient_personal_id, appointment_date, appointment_notes
    `;

    const response = await sql.query(query, [
      patientPersonalId,
      currentDate,
      "",
    ]);

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
  }
};
