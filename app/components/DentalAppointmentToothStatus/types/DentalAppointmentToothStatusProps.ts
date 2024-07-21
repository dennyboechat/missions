// // Multivariate Dependencies
import { Dispatch, SetStateAction } from "react";

// Types
import {
  Tooth,
  ToothDetails,
} from "../../DentalAppointmentToothDetails/types/DentalAppointmentToothDetailsProps";

export enum DentalAppointmentToothStatusEnum {
  EXTRACTED = "extracted",
  TREATED = "treated",
}

export interface DentalAppointmentToothStatusProps {
  selectedTooth: Tooth;
  toothDetails?: Record<Tooth, ToothDetails>;
  setToothDetails: Dispatch<SetStateAction<Record<Tooth, ToothDetails> | undefined>>
}
