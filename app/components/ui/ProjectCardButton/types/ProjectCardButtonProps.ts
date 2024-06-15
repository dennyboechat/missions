// Types
import {
  ProjectId,
  ProjectName,
  ProjectDescription,
} from "../../../../types/ProjectTypes";

export interface ProjectCardButtonProps {
  isAddNew?: boolean;
  projectId?: ProjectId;
  projectName?: ProjectName;
  projectDescription?: ProjectDescription;
}
