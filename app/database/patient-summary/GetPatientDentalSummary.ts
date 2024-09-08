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
        tooth_status,
        patient_dentistry_prescribed_medication_id,
        drug_name,
        dose,
        quantity,
        instructions_usage
      FROM
        patient_dentistry
      LEFT JOIN 
        patient_dentistry_tooth ON patient_dentistry_tooth.patient_dentistry_id = patient_dentistry.patient_dentistry_id
      LEFT JOIN 
        patient_dentistry_prescribed_medication ON patient_dentistry_prescribed_medication.patient_dentistry_id = patient_dentistry.patient_dentistry_id
      WHERE 
        patient_dentistry.patient_personal_id = $1
      ORDER BY
        appointment_date DESC,
        tooth_name,
        drug_name
    `;

    const response = await sql.query(query, [patientPersonalId]);

    const patientDentalSummary: PatientDentalSummary[] = response.rows.map(
      (row) => ({
        patientDentistryId: row.patient_dentistry_id,
        appointmentDate: row.appointment_date,
        toothName: row.tooth_name,
        toothStatus: row.tooth_status,
        patientDentistryPrescribedMedicationId:
          row.patient_dentistry_prescribed_medication_id,
        drug: row.drug_name,
        dose: row.dose,
        quantity: row.quantity,
        instructions: row.instructions_usage,
      })
    );

    return patientDentalSummary;
  } catch (error) {
    console.error(error);
  }
};
