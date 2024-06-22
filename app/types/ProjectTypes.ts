// Types
import { UserId } from "./UserTypes";

export type ProjectId = string;

export type ProjectName = string;

export type ProjectDescription = string;

export type ProjectOwnerId = UserId;

export interface Project {
  projectId: ProjectId;
  projectName: ProjectName;
  projectDescription: ProjectDescription;
  ownerId: ProjectOwnerId;
}

export interface NewProject {
  projectName: ProjectName;
  projectDescription?: ProjectDescription;
  ownerId: ProjectOwnerId;
}

export interface UpdateProject {
  projectId: ProjectId;
  field: string;
  value: string;
}
