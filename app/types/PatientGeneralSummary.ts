// Types
import { PatientGeneralId } from "./PatientGeneralTypes";
import { Drug, Dose, Instructions } from "./Medication";
import { PatientGeneralPrescribedMedicationId } from "./GeneralPrescribedMedication";

export interface PatientGeneralSummary {
  patientGeneralId: PatientGeneralId;
  appointmentDate: Date;
  patientGeneralPrescribedMedicationId: PatientGeneralPrescribedMedicationId;
  drug: Drug;
  dose: Dose;
  quantity: number;
  instructions: Instructions;
}
