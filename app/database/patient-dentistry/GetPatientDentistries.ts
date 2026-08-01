"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { PatientDentistryTypes } from "../../types/PatientDentistryTypes";

import { PatientPersonalId } from "../../types/PatientPersonalTypes";

// Auth
import { assertProjectAccess } from "../auth/projectAccess";

export const getPatientDentistries = async ({
  patientPersonalId,
}: {
  patientPersonalId: PatientPersonalId;
}): Promise<PatientDentistryTypes[] | undefined> => {
  try {
    await assertProjectAccess({ patientPersonalId });

    const query = `
      SELECT
        patient_personal.patient_personal_id,
        patient_personal.project_id,
        patient_personal.patient_full_name,
        patient_personal.is_patient_male,
        TO_CHAR(patient_personal.patient_date_of_birth, 'YYYY-MM-DD') AS patient_date_of_birth,
        patient_dentistry.patient_dentistry_id,
        patient_dentistry.appointment_notes,
        patient_dentistry.appointment_has_referral,
        patient_dentistry.appointment_referral,
        TO_CHAR(
          (patient_dentistry.appointment_date AT TIME ZONE project.project_timezone)::date,
          'YYYY-MM-DD'
        ) AS appointment_date
      FROM
        patient_personal
      INNER JOIN
        project ON project.project_id = patient_personal.project_id
      LEFT JOIN
        patient_dentistry ON patient_dentistry.patient_personal_id = patient_personal.patient_personal_id
      WHERE
        patient_personal.patient_personal_id = $1
      ORDER BY
        patient_dentistry.appointment_date DESC,
        patient_dentistry.created_at DESC
    `;

    const response = await sql.query(query, [patientPersonalId]);

    const patientDentistries: PatientDentistryTypes[] = response.rows.map(
      (row) => ({
        patientDentistryId: row.patient_dentistry_id,
        patientPersonalId: row.patient_personal_id,
        appointmentNotes: row.appointment_notes,
        appointmentHasReferral: row.appointment_has_referral,
        appointmentReferral: row.appointment_referral,
        appointmentDate: row.appointment_date,
        projectId: row.project_id,
        patientFullName: row.patient_full_name,
        isPatientMale: row.is_patient_male,
        patientDateOfBirth: row.patient_date_of_birth,
      })
    );

    return patientDentistries;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
