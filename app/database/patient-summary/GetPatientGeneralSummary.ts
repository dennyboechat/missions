"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { PatientPersonalId } from "../../types/PatientPersonalTypes";
import { PatientGeneralSummary } from "../../types/PatientGeneralSummary";

export const getPatientGeneralSummary = async ({
  patientPersonalId,
}: {
  patientPersonalId: PatientPersonalId;
}): Promise<PatientGeneralSummary[] | undefined> => {
  try {
    const query = `
      SELECT 
        patient_general.patient_general_id,
        appointment_date,
        patient_general_prescribed_medication_id,
        drug_name,
        dose,
        quantity,
        instructions_usage
      FROM
        patient_general
      LEFT JOIN 
        patient_general_prescribed_medication ON patient_general_prescribed_medication.patient_general_id = patient_general.patient_general_id
      WHERE 
        patient_general.patient_personal_id = $1
      ORDER BY
        appointment_date DESC,
        drug_name
    `;

    const response = await sql.query(query, [patientPersonalId]);

    const patientGeneralSummary: PatientGeneralSummary[] = response.rows.map(
      (row) => ({
        patientGeneralId: row.patient_general_id,
        appointmentDate: row.appointment_date,
        patientGeneralPrescribedMedicationId:
          row.patient_general_prescribed_medication_id,
        drug: row.drug_name,
        dose: row.dose,
        quantity: row.quantity,
        instructions: row.instructions_usage,
      })
    );

    return patientGeneralSummary;
  } catch (error) {
    console.error(error);
  }
};
