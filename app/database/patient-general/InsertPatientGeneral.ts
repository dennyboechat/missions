"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { PatientGeneral } from "../../types/PatientGeneralTypes";
import { PatientPersonalId } from "../../types/PatientPersonalTypes";

// Utils
import { getCurrentDateTime } from "@/app/utils/getCurrentDateTime";

export const insertPatientGeneral = async ({
  patientPersonalId,
}: {
  patientPersonalId: PatientPersonalId;
}): Promise<PatientGeneral | undefined> => {
  try {
    const currentDate = getCurrentDateTime();

    const query = `
      INSERT INTO
        patient_general (patient_personal_id, appointment_date, appointment_notes, appointment_referral)
      VALUES 
        ($1, $2, $3, $4)
      RETURNING 
        patient_general_id, patient_personal_id, appointment_date, appointment_notes, appointment_referral
    `;

    const response = await sql.query(query, [
      patientPersonalId,
      currentDate,
      "",
      "",
    ]);

    const patientGeneral: PatientGeneral[] = response.rows.map((row) => ({
      patientGeneralId: row.patient_general_id,
      patientPersonalId: row.patient_personal_id,
      appointmentNotes: row.appointment_notes,
      appointmentReferral: row.appointment_referral,
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
