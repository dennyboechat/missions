// Types
import {
  Medication,
  MedicationUid,
  Drug,
  Instructions,
} from "../../../../types/Medication";
import { DentistryPrescribedMedication } from "@/app/types/DentistryPrescribedMedication";
import { GeneralPrescribedMedication } from "@/app/types/GeneralPrescribedMedication";

export interface InstructionsProps {
  drug?: Drug;
  instructions?: Instructions;
  medicationUid?: MedicationUid;
  setMedications: (medications: any) => Medication[] | void;
  updateMedication: (
    medicationUid: string,
    field: "instructions_usage",
    value: string
  ) => Promise<
    DentistryPrescribedMedication | GeneralPrescribedMedication | undefined
  >;
}
