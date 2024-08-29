// Types
import { PatientDentistryId } from "./PatientDentistryTypes";
import { Drug, Dose, Instructions } from "./Medication";

export type PatientDentistryPrescribedMedicationId = string;

export interface DentistryPrescribedMedication {
  patientDentistryPrescribedMedicationId: PatientDentistryPrescribedMedicationId;
  patientDentistryId: PatientDentistryId;
  drug: Drug;
  dose?: Dose;
  quantity?: number;
  instructions?: Instructions;
}

export interface InsertPatientDentistryMedication {
  drug: Drug;
  dose?: Dose;
  quantity?: number;
  instructions?: Instructions;
}

export interface UpdatePatientDentistryMedication {
  patientDentistryPrescribedMedicationId: PatientDentistryPrescribedMedicationId;
  field: "drug" | "dose" | "quantity" | "instructions_usage";
  value: string | number | boolean | undefined;
}
