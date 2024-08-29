"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { PatientDentistryPrescribedMedicationId } from "../../types/DentistryPrescribedMedication";

export const deletePatientDentistryMedication = async ({
  patientDentistryPrescribedMedicationId,
}: {
  patientDentistryPrescribedMedicationId: PatientDentistryPrescribedMedicationId;
}) => {
  try {
    const query = `
      DELETE FROM 
        patient_dentistry_prescribed_medication 
      WHERE 
        patient_dentistry_prescribed_medication_id = $1
    `;

    await sql.query(query, [patientDentistryPrescribedMedicationId]);
  } catch (error) {
    console.error(error);
  }
};
