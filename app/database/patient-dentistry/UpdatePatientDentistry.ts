"use server";

// Database
import { sql } from "@vercel/postgres";

// Auth
import { assertProjectAccess } from "../auth/projectAccess";

// Types
import {
  PatientDental,
  UpdatePatientDentistry,
} from "../../types/PatientDentistryTypes";


// `field` is interpolated into the statement, so it has to come from a fixed set.
const UPDATABLE_FIELDS = [
  "appointment_notes",
  "appointment_referral",
  "appointment_has_referral",
];

export const updatePatientDentistry = async ({
  patientDentistryId,
  field,
  value,
}: UpdatePatientDentistry): Promise<PatientDental | undefined> => {
  try {
    await assertProjectAccess({ patientDentistryId });

    if (!UPDATABLE_FIELDS.includes(field)) {
      throw new Error(`Field not updatable: ${field}`);
    }

    // Wrapped in a CTE so the returned appointment date can be resolved
    // against the project's timezone, matching how it is read everywhere else.
    const query = `
      WITH updated AS (
        UPDATE
          patient_dentistry
        SET
          ${field} = $1
        WHERE
          patient_dentistry_id = $2
        RETURNING *
      )
      SELECT
        updated.patient_dentistry_id,
        updated.patient_personal_id,
        updated.appointment_notes,
        updated.appointment_has_referral,
        updated.appointment_referral,
        TO_CHAR(
          (updated.appointment_date AT TIME ZONE project.project_timezone)::date,
          'YYYY-MM-DD'
        ) AS appointment_date
      FROM
        updated
      INNER JOIN
        patient_personal ON patient_personal.patient_personal_id = updated.patient_personal_id
      INNER JOIN
        project ON project.project_id = patient_personal.project_id
    `;

    const validatedValue = typeof value === "string" ? value.trim() : value;

    const response = await sql.query(query, [
      validatedValue,
      patientDentistryId,
    ]);

    const patientDentistries: PatientDental[] = response.rows.map((row) => ({
      patientDentistryId: row.patient_dentistry_id,
      patientPersonalId: row.patient_personal_id,
      appointmentNotes: row.appointment_notes,
      appointmentHasReferral: row.appointment_has_referral,
      appointmentReferral: row.appointment_referral,
      appointmentDate: row.appointment_date,
    }));

    return patientDentistries && patientDentistries.length > 0
      ? patientDentistries[0]
      : undefined;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
