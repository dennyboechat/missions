"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import {
  PatientDentistryTooth,
  InsertPatientTooth,
} from "../../types/PatientDentistryTooth";

export const insertPatientTooth = async ({
  patientDentistryId,
  toothName,
  toothStatus,
  toothNotes,
}: InsertPatientTooth): Promise<PatientDentistryTooth | undefined> => {
  try {
    const response = await sql`
      INSERT INTO
        patient_dentistry_tooth (patient_dentistry_id, tooth_name, tooth_status, tooth_notes)
      VALUES 
        (${patientDentistryId}, ${toothName}, ${toothStatus}, ${toothNotes})
      RETURNING 
        patient_dentistry_tooth_id, patient_dentistry_id, tooth_name, tooth_status, tooth_notes
    `;

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
