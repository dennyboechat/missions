"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { PatientDentistryPrescribedMedicationId } from "../../types/DentistryPrescribedMedication";

// Auth
import { assertProjectAccess } from "../auth/projectAccess";

// Types
import {
  ActionResult,
  actionOk,
  actionFailed,
} from "../../types/ActionResult";

// Auth
import { toActionFailure } from "../auth/toActionFailure";

export const deletePatientDentistryMedication = async ({
  patientDentistryPrescribedMedicationId,
}: {
  patientDentistryPrescribedMedicationId: PatientDentistryPrescribedMedicationId;
}) => {
  try {
    await assertProjectAccess({ patientDentistryPrescribedMedicationId });

    const query = `
      DELETE FROM 
        patient_dentistry_prescribed_medication 
      WHERE 
        patient_dentistry_prescribed_medication_id = $1
    `;

    await sql.query(query, [patientDentistryPrescribedMedicationId]);

    return actionOk('deleted');
  } catch (error) {
    return toActionFailure(error);
  }
};
