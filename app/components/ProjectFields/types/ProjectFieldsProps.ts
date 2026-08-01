// Types
import {
  ProjectName,
  ProjectDescription,
  ProjectTimezone,
} from "../../../types/ProjectTypes";

export interface ProjectFieldsProps {
  projectName: ProjectName;
  projectDescription: ProjectDescription;
  projectTimezone: ProjectTimezone;
  onProjectNameChange: (event: React.FocusEvent<HTMLInputElement>) => void;
  onProjectDescriptionChange: (
    event: React.FocusEvent<HTMLInputElement>
  ) => void;
  onProjectTimezoneChange: (timezone: ProjectTimezone) => void;
  showPlaceholders?: boolean;
  projectId?: string;
  isProjectNameInvalid?: boolean;
  isProjectTimezoneInvalid?: boolean;
}
