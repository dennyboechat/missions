// Multivariate Dependencies
import { Dispatch, SetStateAction } from "react";

// Types
import { Tooth } from "../../../types/Tooth";
import { PatientDentistryId } from "../../../types/PatientDentistryTypes";
import { ToothDetails } from "./DentalAppointmentToothDetailsProps";

export interface DentalAppointmentToothNotesProps {
  patientDentistryId: PatientDentistryId;
  selectedTooth: Tooth;
  toothDetails?: Record<Tooth, ToothDetails>;
  setToothDetails: Dispatch<
    SetStateAction<Record<Tooth, ToothDetails> | undefined>
  >;
}
