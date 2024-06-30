// Types
import { ProjectId } from "../../../types/ProjectTypes";

export interface ProjectMenuItemsProps {
  projectId: ProjectId;
  activeMenuItem: 'project-patients' | 'project' | 'project-users';
}
