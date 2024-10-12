// Types
import { ProjectReportsAppointmentTypes } from "../../../types/ProjectReportsAppointmentTypes";

export interface ProjectReportsAppointmentsProps {
  appointments: ProjectReportsAppointmentTypes[] | undefined;
  isLoadingReport?: boolean;
}
