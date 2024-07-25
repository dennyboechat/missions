// // Multivariate Dependencies
import { Dispatch, SetStateAction } from "react";

// Types
import { Tooth } from "../../../types/Tooth";
import { ToothDetails } from "../../DentalAppointmentToothDetails/types/DentalAppointmentToothDetailsProps";
import { PatientDentistryId } from "../../../types/PatientDentistryTypes";

export interface DentalAppointmentToothStatusProps {
  patientDentistryId: PatientDentistryId;
  selectedTooth: Tooth;
  toothDetails?: Record<Tooth, ToothDetails>;
  setToothDetails: Dispatch<
    SetStateAction<Record<Tooth, ToothDetails> | undefined>
  >;
}
