// Types
import { UserId } from "./UserTypes";

export type ProjectId = string;

export type ProjectName = string;

export type ProjectDescription = string;

export type ProjectOwnerId = UserId;

export interface NewProject {
  projectName: ProjectName;
  projectDescription?: ProjectDescription;
  ownerId: ProjectOwnerId;
}

export interface Project extends NewProject {
  projectId: ProjectId;
}
