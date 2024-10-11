"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { GeneralPrescribedMedication } from "../../types/GeneralPrescribedMedication";
import { PatientGeneralId } from "../../types/PatientGeneralTypes";

export const getPatientGeneralMedications = async ({
  patientGeneralId,
}: {
  patientGeneralId: PatientGeneralId;
}): Promise<GeneralPrescribedMedication[] | undefined> => {
  try {
    const query = `
      SELECT 
        * 
      FROM
        patient_general_prescribed_medication
      WHERE 
        patient_general_id = $1
    `;

    const response = await sql.query(query, [patientGeneralId]);

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

    return generalPrescribedMedications;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
