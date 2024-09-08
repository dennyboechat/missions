// Types
import { PatientDentistryId } from "./PatientDentistryTypes";
import { Tooth } from "./Tooth";
import { ToothStatus } from "./ToothStatus";

export interface PatientDentalSummary {
  patientDentistryId: PatientDentistryId;
  appointmentDate: Date;
  toothName: Tooth;
  toothStatus: ToothStatus;
}
