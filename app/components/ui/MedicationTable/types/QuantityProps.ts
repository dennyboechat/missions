// Types
import { Medication, MedicationUid, Drug } from "../../../../types/Medication";
import { DentistryPrescribedMedication } from "@/app/types/DentistryPrescribedMedication";
import { GeneralPrescribedMedication } from "@/app/types/GeneralPrescribedMedication";

export interface QuantityProps {
  drug?: Drug;
  quantity?: number;
  medicationUid?: MedicationUid;
  setMedications: (medications: any) => Medication[] | void;
  updateMedication: (
    medicationUid: string,
    field: "quantity",
    value?: number
  ) => Promise<
    DentistryPrescribedMedication | GeneralPrescribedMedication | undefined
  >;
}
