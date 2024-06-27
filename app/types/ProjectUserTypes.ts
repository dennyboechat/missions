// Types
import { ProjectId } from "./ProjectTypes";

export interface ProjectUser {
  projectUserId: string;
  projectId: ProjectId;
  userName: string;
  userEmail: string;
  isUserActive: boolean;
}
