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
        patient_personal
      LEFT JOIN
        patient_dentistry ON patient_dentistry.patient_personal_id = patient_personal.patient_personal_id
      WHERE 
        patient_personal.patient_personal_id = ${patientPersonalId}
      ORDER BY
        patient_dentistry.appointment_date DESC   
    `;

    const patientDentistries: PatientDentistryTypes[] = response.rows.map(
      (row) => ({
        patientDentistryId: row.patient_dentistry_id,
        patientPersonalId: row.patient_personal_id,
        appointmentNotes: row.appointment_notes,
        appointmentDate: row.appointment_date,
        isChildDentalMap: row.is_child_dental_map,
        projectId: row.project_id,
        patientFullName: row.patient_full_name,
        isPatientMale: row.is_patient_male,
        patientDateOfBirth: row.patient_date_of_birth,
      })
    );

    return patientDentistries;
  } catch (error) {
    console.error(error);
  }
};
