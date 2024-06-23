// Types
import { ProjectName } from "../types/ProjectTypes";

export const isValidProjectName = ({ projectName }: { projectName: ProjectName }) =>
  projectName && projectName.trim() !== "";
