// Types
import { ProjectId } from "./ProjectTypes";
import { UserId } from "./UserTypes";

export type ProjectUserId = string;

export interface ProjectUser {
  projectUserId: ProjectUserId;
  projectId: ProjectId;
  userId: UserId;
  isUserActive: boolean;
  /** Everything the owner can do except delete the project. */
  isUserAdmin?: boolean;
  userName?: string;
  userEmail?: string;
  filterOrder?: number;
}

/**
 * Both flags are optional so a caller can change one without restating the
 * other -- two admins editing the same person from different screens would
 * otherwise each undo the other's change by echoing back a stale value.
 */
export interface UpdateProjectUser {
  projectUserId: ProjectUserId;
  isUserActive?: boolean;
  isUserAdmin?: boolean;
}

export interface ProjectUserFieldsTypes {
  projectId: ProjectId;
  userId?: string;
  userName: string;
  userEmail: string;
}
