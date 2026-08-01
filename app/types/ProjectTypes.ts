// Types
import { UserId } from "./UserTypes";

export type ProjectId = string;

export type ProjectName = string;

export type ProjectDescription = string;

/** IANA timezone name of the mission location, e.g. "Pacific/Fiji". */
export type ProjectTimezone = string;

export type ProjectOwnerId = UserId;

export interface Project {
  projectId: ProjectId;
  projectName: ProjectName;
  projectDescription: ProjectDescription;
  projectTimezone: ProjectTimezone;
  ownerId: ProjectOwnerId;
}

export interface NewProject {
  projectName: ProjectName;
  projectDescription?: ProjectDescription;
  projectTimezone?: ProjectTimezone;
  ownerId: ProjectOwnerId;
}

export interface UpdateProject {
  projectId: ProjectId;
  field: string;
  value: string;
}
