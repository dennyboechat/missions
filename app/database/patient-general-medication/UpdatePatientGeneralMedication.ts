"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { GeneralPrescribedMedication } from "../../types/GeneralPrescribedMedication";
import { UpdatePatientGeneralMedication } from "../../types/GeneralPrescribedMedication";

export const updatePatientGeneralMedication = async ({
  patientGeneralPrescribedMedicationId,
  field,
  value,
}: UpdatePatientGeneralMedication): Promise<
  GeneralPrescribedMedication | undefined
> => {
  try {
    const query = `
      UPDATE
        patient_general_prescribed_medication 
      SET  
        ${field} = $1
      WHERE
        patient_general_prescribed_medication_id = $2
      RETURNING 
        patient_general_prescribed_medication_id, patient_general_id, drug_name, dose, quantity, instructions_usage
    `;

    const validatedValue = typeof value === "string" ? value.trim() : value;

    const response = await sql.query(query, [
      validatedValue,
      patientGeneralPrescribedMedicationId,
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
