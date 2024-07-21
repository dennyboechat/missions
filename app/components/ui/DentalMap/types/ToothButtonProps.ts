// Types
import { Tooth, ToothDetails } from "../../../DentalAppointmentToothDetails/types/DentalAppointmentToothDetailsProps";

export interface ToothButtonProps {
  id: Tooth;
  top: string;
  left: string;
  isSelected?: boolean;
  toothDetails?: ToothDetails;
  onClickTooth: (id: Tooth) => void;
}
