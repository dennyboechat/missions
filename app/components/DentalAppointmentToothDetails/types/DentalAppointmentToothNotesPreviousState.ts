// Types
import { Tooth } from "../../../types/Tooth";
import { PatientDentistryToothId } from "@/app/types/PatientDentistryTooth";

export interface DentalAppointmentToothNotesPreviousState {
  patientDentistryToothId: PatientDentistryToothId | undefined;
  selectedTooth: Tooth | undefined;
  notes: string | undefined;
}
