"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { DentistryPrescribedMedication } from "../../types/DentistryPrescribedMedication";
import { PatientDentistryId } from "../../types/PatientDentistryTypes";

export const getPatientDentistryMedications = async ({
  patientDentistryId,
}: {
  patientDentistryId: PatientDentistryId;
}): Promise<DentistryPrescribedMedication[] | undefined> => {
  try {
    const response = await sql`
      SELECT 
        * 
      FROM
        patient_dentistry_prescribed_medication
      WHERE 
        patient_dentistry_id = ${patientDentistryId}
    `;

    const dentistryPrescribedMedications: DentistryPrescribedMedication[] =
      response.rows.map((row) => ({
        patientDentistryPrescribedMedicationId:
          row.patient_dentistry_prescribed_medication_id,
        patientDentistryId: row.patient_dentistry_id,
        drug: row.drug_name,
        dose: row.dose,
        quantity: row.quantity,
        instructions: row.instructions_usage,
      }));

    return dentistryPrescribedMedications;
  } catch (error) {
    console.error(error);
  }
};
