"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { PatientGeneralPrescribedMedicationId } from "../../types/GeneralPrescribedMedication";

export const deletePatientGeneralMedication = async ({
  patientGeneralPrescribedMedicationId,
}: {
  patientGeneralPrescribedMedicationId: PatientGeneralPrescribedMedicationId;
}) => {
  try {
    const query = `
      DELETE FROM 
        patient_general_prescribed_medication 
      WHERE 
        patient_general_prescribed_medication_id = $1
    `;

    await sql.query(query, [patientGeneralPrescribedMedicationId]);
  } catch (error) {
    console.error(error);
  }
};
