// Types
import { ProjectName, ProjectDescription } from "../../../types/ProjectTypes";

export interface ProjectFieldsProps {
  projectName: ProjectName;
  projectDescription: ProjectDescription;
  onProjectNameChange: (event: React.FocusEvent<HTMLInputElement>) => void;
  onProjectDescriptionChange: (
    event: React.FocusEvent<HTMLInputElement>
  ) => void;
  showPlaceholders?: boolean;
  projectId?: string;
}
