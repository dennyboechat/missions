// Types
import { PatientGeneralId } from "./PatientGeneralTypes";
import { Drug, Dose, Instructions } from "./Medication";

export type PatientGeneralPrescribedMedicationId = string;

export interface GeneralPrescribedMedication {
  patientGeneralPrescribedMedicationId: PatientGeneralPrescribedMedicationId;
  patientGeneralId: PatientGeneralId;
  drug: Drug;
  dose?: Dose;
  quantity?: number;
  instructions?: Instructions;
}

export interface InsertPatientGeneralMedication {
  drug: Drug;
  dose?: Dose;
  quantity?: number;
  instructions?: Instructions;
}

export interface UpdatePatientGeneralMedication {
  patientGeneralPrescribedMedicationId: PatientGeneralPrescribedMedicationId;
  field: "drug" | "dose" | "quantity" | "instructions_usage";
  value: string | number | boolean | undefined;
}
