// Types
import { PatientDentistryId } from "./PatientDentistryTypes";
import { Tooth } from "./Tooth";
import { ToothStatus } from "./ToothStatus";
import { Drug, Dose, Instructions } from "./Medication";
import { PatientDentistryPrescribedMedicationId } from "./DentistryPrescribedMedication";

export interface PatientDentalSummary {
  patientDentistryId: PatientDentistryId;
  appointmentDate: Date;
  toothName: Tooth;
  toothStatus: ToothStatus;
  patientDentistryPrescribedMedicationId: PatientDentistryPrescribedMedicationId;
  drug: Drug;
  dose: Dose;
  quantity: number;
  instructions: Instructions;
}
