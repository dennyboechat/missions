// Types
import { PatientDentistryId } from "./PatientDentistryTypes";
import { Tooth } from "./Tooth";
import { ToothStatus } from "./ToothStatus";

export type PatientDentistryToothId = string;

export interface PatientDentistryTooth {
  patientDentistryToothId: PatientDentistryToothId;
  patientDentistryId: PatientDentistryId;
  toothName: Tooth;
  toothStatus: ToothStatus;
  toothNotes: string;
}

export interface InsertPatientTooth {
  patientDentistryId: PatientDentistryId;
  toothName: Tooth;
  toothStatus?: ToothStatus;
  toothNotes?: string;
}

export interface UpdatePatientTooth {
  patientDentistryToothId?: PatientDentistryToothId;
  field: string;
  value: string | boolean | undefined;
}
