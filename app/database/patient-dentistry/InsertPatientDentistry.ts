"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { PatientDental } from "../../types/PatientDentistryTypes";
import { PatientPersonalId } from "../../types/PatientPersonalTypes";

// Utils
import { getCurrentDate } from "@/app/utils/getCurrentDate";

export const insertPatientDentistry = async ({
  patientPersonalId,
}: {
  patientPersonalId: PatientPersonalId;
}): Promise<PatientDental | undefined> => {
  try {
    const currentDate = getCurrentDate();

    const query = `
      INSERT INTO
        patient_dentistry (patient_personal_id, appointment_date, appointment_notes)
      VALUES 
        ($1, $2, $3)
      RETURNING 
        patient_dentistry_id, patient_personal_id, appointment_date, appointment_notes
    `;

    const response = await sql.query(query, [
      patientPersonalId,
      currentDate,
      "",
    ]);

    const patientDentistries: PatientDental[] = response.rows.map((row) => ({
      patientDentistryId: row.patient_dentistry_id,
      patientPersonalId: row.patient_personal_id,
      appointmentNotes: row.appointment_notes,
      appointmentDate: row.appointment_date,
    }));

    return patientDentistries && patientDentistries.length > 0
      ? patientDentistries[0]
      : undefined;
  } catch (error) {
    console.error(error);
  }
};
