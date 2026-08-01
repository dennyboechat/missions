"use server";

// Database
import { sql } from "@vercel/postgres";

// Auth
import { assertProjectAccess } from "../auth/projectAccess";

// Types
import {
  PatientGeneral,
  UpdatePatientGeneral,
} from "../../types/PatientGeneralTypes";

export const updatePatientGeneral = async ({
  patientGeneralId,
  field,
  value,
}: UpdatePatientGeneral): Promise<PatientGeneral | undefined> => {
  try {
    await assertProjectAccess({ patientGeneralId });

    // Wrapped in a CTE so the returned appointment date can be resolved
    // against the project's timezone, matching how it is read everywhere else.
    const query = `
      WITH updated AS (
        UPDATE
          patient_general
        SET
          ${field} = $1
        WHERE
          patient_general_id = $2
        RETURNING *
      )
      SELECT
        updated.patient_general_id,
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

    const response = await sql.query(query, [validatedValue, patientGeneralId]);

    const patientGeneral: PatientGeneral[] = response.rows.map((row) => ({
      patientGeneralId: row.patient_general_id,
      patientPersonalId: row.patient_personal_id,
      appointmentNotes: row.appointment_notes,
      appointmentHasReferral: row.appointment_has_referral,
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
