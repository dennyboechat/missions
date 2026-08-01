"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { PatientGeneralPrescribedMedicationId } from "../../types/GeneralPrescribedMedication";

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

    return actionOk('deleted');
  } catch (error) {
    return toActionFailure(error);
  }
};
