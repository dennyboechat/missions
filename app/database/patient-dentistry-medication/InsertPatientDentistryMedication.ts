"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import {
  DentistryPrescribedMedication,
  InsertPatientDentistryMedication,
} from "../../types/DentistryPrescribedMedication";
import { PatientDentistryId } from "../../types/PatientDentistryTypes";

export const insertPatientDentistryMedication = async ({
  patientDentistryId,
  medication,
}: {
  patientDentistryId: PatientDentistryId;
  medication: InsertPatientDentistryMedication;
}): Promise<DentistryPrescribedMedication | undefined> => {
  try {
    const { drug, dose, quantity, instructions } = medication;

    const query = `
      INSERT INTO
        patient_dentistry_prescribed_medication (patient_dentistry_id, drug_name, dose, quantity, instructions_usage)
      VALUES 
        ($1, $2, $3, $4, $5)
      RETURNING 
        patient_dentistry_prescribed_medication_id, patient_dentistry_id, drug_name, dose, quantity, instructions_usage
    `;

    const response = await sql.query(query, [
      patientDentistryId,
      drug,
      dose,
      quantity,
      instructions,
    ]);

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

    return dentistryPrescribedMedications &&
      dentistryPrescribedMedications.length > 0
      ? dentistryPrescribedMedications[0]
      : undefined;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
