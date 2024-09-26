// Types
import {
  Medication,
  MedicationUid,
  Dose,
  Drug,
} from "../../../../types/Medication";
import { DentistryPrescribedMedication } from "@/app/types/DentistryPrescribedMedication";
import { GeneralPrescribedMedication } from "@/app/types/GeneralPrescribedMedication";

export interface DoseProps {
  drug?: Drug;
  dose?: Dose;
  medicationUid?: MedicationUid;
  setMedications: (medications: any) => Medication[] | void;
  updateMedication: (
    medicationUid: string,
    field: "dose",
    value?: string
  ) => Promise<
    DentistryPrescribedMedication | GeneralPrescribedMedication | undefined
  >;
}
