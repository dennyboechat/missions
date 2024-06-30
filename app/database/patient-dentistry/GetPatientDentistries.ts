"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { PatientDentistryTypes } from "../../types/PatientDentistryTypes";

import { PatientPersonalId } from "../../types/PatientPersonalTypes";

export const getPatientDentistries = async ({
  patientPersonalId,
}: {
  patientPersonalId: PatientPersonalId;
}): Promise<PatientDentistryTypes[] | undefined> => {
  try {
    const response = await sql`
      SELECT 
        * 
      FROM
        patient_dentistry 
      WHERE 
        patient_personal_id = ${patientPersonalId}
      ORDER BY
        appointment_date DESC   
    `;

    const patientDentistries: PatientDentistryTypes[] = response.rows.map(
      (row) => ({
        patientDentistryId: row.patient_dentistry_id,
        patientPersonalId: row.patient_personal_id,
        appointmentNotes: row.appointment_notes,
        appointmentDate: row.appointment_date,
        isChildDentalMap: row.is_child_dental_map,
      })
    );

    return patientDentistries;
  } catch (error) {
    console.error(error);
  }
};
