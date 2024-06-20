// Types
import { ProjectName } from "../types/ProjectTypes";

export const isValidProject = ({ projectName }: { projectName: ProjectName }) =>
  projectName && projectName.trim() != "";
