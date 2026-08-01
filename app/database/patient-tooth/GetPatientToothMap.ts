"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { PatientDentistryTooth } from "../../types/PatientDentistryTooth";
import { PatientDentistryId } from "../../types/PatientDentistryTypes";

// Auth
import { assertProjectAccess } from "../auth/projectAccess";

export const getPatientToothMap = async ({
  patientDentistryId,
}: {
  patientDentistryId: PatientDentistryId;
}): Promise<PatientDentistryTooth[] | undefined> => {
  try {
    await assertProjectAccess({ patientDentistryId });

    const query = `
      SELECT
        patient_dentistry_tooth_id,
        patient_dentistry_id,
        tooth_name,
        tooth_status,
        tooth_notes
      FROM
        patient_dentistry_tooth
      WHERE 
        patient_dentistry_id = $1
    `;

    const response = await sql.query(query, [patientDentistryId]);

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
    return undefined;
  }
};
