"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { PatientGeneralPrescribedMedicationId } from "../../types/GeneralPrescribedMedication";

// Auth
import { assertProjectAccess } from "../auth/projectAccess";

export const deletePatientGeneralMedication = async ({
  patientGeneralPrescribedMedicationId,
}: {
  patientGeneralPrescribedMedicationId: PatientGeneralPrescribedMedicationId;
}) => {
  try {
    await assertProjectAccess({ patientGeneralPrescribedMedicationId });

    const query = `
      DELETE FROM 
        patient_general_prescribed_medication 
      WHERE 
        patient_general_prescribed_medication_id = $1
    `;

    await sql.query(query, [patientGeneralPrescribedMedicationId]);

    return 'deleted';
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
