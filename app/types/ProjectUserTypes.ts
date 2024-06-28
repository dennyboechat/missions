// Types
import { ProjectId } from "./ProjectTypes";
import { UserId } from "./UserTypes";

export type ProjectUserId = string;

export interface ProjectUser {
  projectUserId: ProjectUserId;
  projectId: ProjectId;
  userId: UserId;
  userName: string;
  userEmail: string;
  isUserActive: boolean;
}

export interface UpdateProjectUser {
  projectUserId: ProjectUserId;
  isUserActive: boolean;
}
