"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { DentistryPrescribedMedication } from "../../types/DentistryPrescribedMedication";
import { UpdatePatientDentistryMedication } from "../../types/DentistryPrescribedMedication";

export const updatePatientDentistryMedication = async ({
  patientDentistryPrescribedMedicationId,
  field,
  value,
}: UpdatePatientDentistryMedication): Promise<
  DentistryPrescribedMedication | undefined
> => {
  try {
    const query = `
      UPDATE
        patient_dentistry_prescribed_medication 
      SET  
        ${field} = $1
      WHERE
        patient_dentistry_prescribed_medication_id = $2
      RETURNING 
        patient_dentistry_prescribed_medication_id, patient_dentistry_id, drug_name, dose, quantity, instructions_usage
    `;

    const validatedValue = typeof value === "string" ? value.trim() : value;

    const response = await sql.query(query, [
      validatedValue,
      patientDentistryPrescribedMedicationId,
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
