// Types
import { ProjectId } from "./ProjectTypes";
import { UserId } from "./UserTypes";

export type ProjectUserId = string;

export interface ProjectUser {
  projectUserId: ProjectUserId;
  projectId: ProjectId;
  userId: UserId;
  isUserActive: boolean;
  userName?: string;
  userEmail?: string;
  filterOrder?: number;
}

export interface UpdateProjectUser {
  projectUserId: ProjectUserId;
  isUserActive: boolean;
}

export interface ProjectUserFieldsTypes {
  projectId: ProjectId;
  userId?: string;
  userName: string;
  userEmail: string;
}
