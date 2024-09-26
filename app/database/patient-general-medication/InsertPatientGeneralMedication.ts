"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import {
  GeneralPrescribedMedication,
  InsertPatientGeneralMedication,
} from "../../types/GeneralPrescribedMedication";
import { PatientGeneralId } from "../../types/PatientGeneralTypes";

export const insertPatientGeneralMedication = async ({
  patientGeneralId,
  medication,
}: {
  patientGeneralId: PatientGeneralId;
  medication: InsertPatientGeneralMedication;
}): Promise<GeneralPrescribedMedication | undefined> => {
  try {
    const { drug, dose, quantity, instructions } = medication;

    const query = `
      INSERT INTO
        patient_general_prescribed_medication (patient_general_id, drug_name, dose, quantity, instructions_usage)
      VALUES 
        ($1, $2, $3, $4, $5)
      RETURNING 
        patient_general_prescribed_medication_id, patient_general_id, drug_name, dose, quantity, instructions_usage
    `;

    const response = await sql.query(query, [
      patientGeneralId,
      drug,
      dose,
      quantity,
      instructions,
    ]);

    const generalPrescribedMedications: GeneralPrescribedMedication[] =
      response.rows.map((row) => ({
        patientGeneralPrescribedMedicationId:
          row.patient_general_prescribed_medication_id,
        patientGeneralId: row.patient_general_id,
        drug: row.drug_name,
        dose: row.dose,
        quantity: row.quantity,
        instructions: row.instructions_usage,
      }));

    return generalPrescribedMedications &&
      generalPrescribedMedications.length > 0
      ? generalPrescribedMedications[0]
      : undefined;
  } catch (error) {
    console.error(error);
  }
};
