"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import {
  PatientDental,
  UpdatePatientDentistry,
} from "../../types/PatientDentistryTypes";
import { DatabaseRetries } from "../../types/DatabaseRetries";

export const updatePatientDentistry = async ({
  patientDentistryId,
  field,
  value,
}: UpdatePatientDentistry): Promise<PatientDental | undefined> => {
  let attempt = 0;

  while (attempt < DatabaseRetries) {
    try {
      const query = `
      UPDATE 
        patient_dentistry
       SET
        ${field} = $1
      WHERE
        patient_dentistry_id = $2
      RETURNING
        patient_dentistry_id, patient_personal_id, appointment_date, appointment_notes
    `;

      const validatedValue = typeof value === "string" ? value.trim() : value;

      const response = await sql.query(query, [
        validatedValue,
        patientDentistryId,
      ]);

      if (!response) {
        console.error('**************** ');
      } else {
        console.error('---------------- ');
      }

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
      attempt++;
      console.error(`Attempt ${attempt} failed:`, error);

      if (attempt >= DatabaseRetries) {
        console.error("Max retries reached.");
        return undefined;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
};
