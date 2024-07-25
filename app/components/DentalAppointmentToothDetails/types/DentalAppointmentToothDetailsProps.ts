// Multivariate Dependencies
import { Dispatch, SetStateAction } from "react";

// Types
import { Tooth } from "../../../types/Tooth";
import { ToothStatus } from "../../../types/ToothStatus";
import { PatientDentistryId } from "../../../types/PatientDentistryTypes";
import { PatientDentistryToothId } from "@/app/types/PatientDentistryTooth";

export interface DentalAppointmentToothDetailsProps {
  patientDentistryId: PatientDentistryId;
  selectedTooth: Tooth;
  toothDetails?: Record<Tooth, ToothDetails>;
  setToothDetails: Dispatch<
    SetStateAction<Record<Tooth, ToothDetails> | undefined>
  >;
}

export interface ToothDetails {
  toothStatus?: ToothStatus;
  toothNotes?: string;
  patientDentistryToothId?: PatientDentistryToothId;
}
