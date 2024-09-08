"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { PatientPersonalId } from "../../types/PatientPersonalTypes";
import { PatientDentalSummary } from "../../types/PatientDentalSummary";

export const getPatientDentalSummary = async ({
  patientPersonalId,
}: {
  patientPersonalId: PatientPersonalId;
}): Promise<PatientDentalSummary[] | undefined> => {
  try {
    const query = `
      SELECT 
        patient_dentistry.patient_dentistry_id,
        appointment_date,
        tooth_name,
        tooth_status
      FROM
        patient_dentistry
      LEFT JOIN patient_dentistry_tooth ON patient_dentistry_tooth.patient_dentistry_id = patient_dentistry.patient_dentistry_id
      WHERE 
        patient_dentistry.patient_personal_id = $1
      ORDER BY
        appointment_date
    `;

    const response = await sql.query(query, [patientPersonalId]);

    const patientDentalSummary: PatientDentalSummary[] = response.rows.map(
      (row) => ({
        patientDentistryId: row.patient_dentistry_id,
        appointmentDate: row.appointment_date,
        toothName: row.tooth_name,
        toothStatus: row.tooth_status,
      })
    );

    return patientDentalSummary;
  } catch (error) {
    console.error(error);
  }
};
