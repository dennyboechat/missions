// Multivariate Dependencies
import { Dispatch, SetStateAction } from "react";

// Types
import { Tooth } from "../../../types/Tooth";
import { PatientDentistryId } from "../../../types/PatientDentistryTypes";
import { ToothDetails } from "./DentalAppointmentToothDetailsProps";
import { PatientDentistryToothId } from "@/app/types/PatientDentistryTooth";

export interface DentalAppointmentToothNotesProps {
  patientDentistryId: PatientDentistryId;
  selectedTooth: Tooth;
  patientDentistryToothId?: PatientDentistryToothId;
  notes?: string;
  setToothDetails: Dispatch<
    SetStateAction<Record<Tooth, ToothDetails> | undefined>
  >;
}
