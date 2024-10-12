// Types
import { ProjectReportsMedicationTypes } from "../../../types/ProjectReportsMedicationTypes";

export interface ProjectReportsMedicationProps {
  medications: ProjectReportsMedicationTypes[] | undefined;
  isLoadingReport?: boolean;
}
