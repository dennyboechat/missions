"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import {
  PatientDentistryTooth,
  UpdatePatientTooth,
} from "../../types/PatientDentistryTooth";

export const updatePatientTooth = async ({
  patientDentistryToothId,
  field,
  value,
}: UpdatePatientTooth): Promise<PatientDentistryTooth | undefined> => {
  try {
    const query = `
      UPDATE
        patient_dentistry_tooth
      SET
        ${field} = $1
      WHERE
        patient_dentistry_tooth_id = $2
      RETURNING 
        patient_dentistry_tooth_id, patient_dentistry_id, tooth_name, tooth_status, tooth_notes
    `;

    const validatedValue = typeof value === "string" ? value.trim() : value;

    const response = await sql.query(query, [
      validatedValue,
      patientDentistryToothId,
    ]);

    const patientDentistryTooth: PatientDentistryTooth[] = response.rows.map(
      (row) => ({
        patientDentistryToothId: row.patient_dentistry_tooth_id,
        patientDentistryId: row.patient_dentistry_id,
        toothName: row.tooth_name,
        toothStatus: row.tooth_status,
        toothNotes: row.tooth_notes,
      })
    );

    return patientDentistryTooth && patientDentistryTooth.length > 0
      ? patientDentistryTooth[0]
      : undefined;
  } catch (error) {
    console.error(error);
  }
};
