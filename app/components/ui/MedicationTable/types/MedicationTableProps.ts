// Types
import { Medication } from "../../../../types/Medication";
import { DentistryPrescribedMedication } from "@/app/types/DentistryPrescribedMedication";
import { Dispatch, SetStateAction } from "react";
import { GeneralPrescribedMedication } from "@/app/types/GeneralPrescribedMedication";

export interface MedicationTableProps {
  medications?: Medication[];
  setMedications: Dispatch<SetStateAction<Medication[]>>;
  insertMedication: (
    drug: string,
    updateMedication: Medication[]
  ) => Promise<void>;
  updateMedication: (
    medicationUid: string,
    field: "drug" | "dose" | "quantity" | "instructions_usage",
    value?: string | number
  ) => Promise<
    DentistryPrescribedMedication | GeneralPrescribedMedication | undefined
  >;
  deleteMedication: (medicationUid: string) => void;
}
