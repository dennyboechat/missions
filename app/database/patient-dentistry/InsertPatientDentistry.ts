"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { PatientDental } from "../../types/PatientDentistryTypes";
import { PatientPersonalId } from "../../types/PatientPersonalTypes";

// Utils
import { getCurrentDateTime } from "@/app/utils/getCurrentDateTime";

// Auth
import { assertProjectAccess } from "../auth/projectAccess";

// Types
import {
  ActionResult,
  actionOk,
  actionFailed,
} from "../../types/ActionResult";

// Auth
import { toActionFailure } from "../auth/toActionFailure";

export const insertPatientDentistry = async ({
  patientPersonalId,
}: {
  patientPersonalId: PatientPersonalId;
}): Promise<ActionResult<PatientDental>> => {
  try {
    await assertProjectAccess({ patientPersonalId });

    const currentDate = getCurrentDateTime();

    // Wrapped in a CTE so the returned appointment date can be resolved
    // against the project's timezone, matching how it is read everywhere else.
    const query = `
      WITH inserted AS (
        INSERT INTO
          patient_dentistry (patient_personal_id, appointment_date, appointment_notes, appointment_referral)
        VALUES
          ($1, $2, $3, $4)
        RETURNING *
      )
      SELECT
        inserted.patient_dentistry_id,
        inserted.patient_personal_id,
        inserted.appointment_notes,
        inserted.appointment_has_referral,
        inserted.appointment_referral,
        TO_CHAR(
          (inserted.appointment_date AT TIME ZONE project.project_timezone)::date,
          'YYYY-MM-DD'
        ) AS appointment_date
      FROM
        inserted
      INNER JOIN
        patient_personal ON patient_personal.patient_personal_id = inserted.patient_personal_id
      INNER JOIN
        project ON project.project_id = patient_personal.project_id
    `;

    const response = await sql.query(query, [
      patientPersonalId,
      currentDate,
      "",
      "",
    ]);

    const patientDentistries: PatientDental[] = response.rows.map((row) => ({
      patientDentistryId: row.patient_dentistry_id,
      patientPersonalId: row.patient_personal_id,
      appointmentNotes: row.appointment_notes ?? "",
      appointmentHasReferral: row.appointment_has_referral,
      appointmentReferral: row.appointment_referral ?? "",
      appointmentDate: row.appointment_date,
    }));

    return patientDentistries.length > 0
      ? actionOk(patientDentistries[0])
      : actionFailed("not_found");
  } catch (error) {
    return toActionFailure(error);
  }
};
