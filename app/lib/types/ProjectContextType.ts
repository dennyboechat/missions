// Types
import { Project } from "../../types/ProjectTypes";

export interface ProjectContextType {
  project?: Project;
  setProject: (newProject?: Project) => void;
}
