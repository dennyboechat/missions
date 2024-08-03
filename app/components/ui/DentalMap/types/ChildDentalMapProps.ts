// Types
import { Tooth } from "../../../../types/Tooth";
import { ToothDetails } from "../../../DentalAppointmentToothDetails/types/DentalAppointmentToothDetailsProps";

export interface ChildDentalMapProps {
  selectedTooth?: Tooth;
  toothDetails?: Record<Tooth, ToothDetails>;
  onClickTooth: (toothNumber: Tooth) => void;
}
