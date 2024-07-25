"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { PatientDentistryTooth } from "../../types/PatientDentistryTooth";
import { PatientDentistryId } from "../../types/PatientDentistryTypes";

export const getPatientToothMap = async ({
  patientDentistryId,
}: {
  patientDentistryId: PatientDentistryId;
}): Promise<PatientDentistryTooth[] | undefined> => {
  try {
    const response = await sql`
      SELECT 
        * 
      FROM
        patient_dentistry_tooth
      WHERE 
        patient_dentistry_id = ${patientDentistryId}
    `;

    const patientToothMap: PatientDentistryTooth[] = response.rows.map(
      (row) => ({
        patientDentistryToothId: row.patient_dentistry_tooth_id,
        patientDentistryId: row.patient_dentistry_id,
        toothName: row.tooth_name,
        toothStatus: row.tooth_status,
        toothNotes: row.tooth_notes,
      })
    );

    return patientToothMap;
  } catch (error) {
    console.error(error);
  }
};
