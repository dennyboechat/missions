"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import {
  Project,
  NewProject,
  ProjectId,
  ProjectOwnerId,
} from "../types/ProjectTypes";

export const getProjects = async ({
  ownerId,
}: {
  ownerId: ProjectOwnerId;
}): Promise<Project[] | undefined> => {
  try {
    const response =
      await sql`SELECT * FROM project WHERE owner_id = ${ownerId}`;

    const projects: Project[] = response.rows.map((row) => ({
      projectId: row.project_id,
      projectName: row.project_name,
      projectDescription: row.project_description,
      ownerId: row.owner_id,
    }));

    return projects;
  } catch (error) {
    console.error(error);
  }
};

export const getProject = async ({
  projectId,
}: {
  projectId: ProjectId;
}): Promise<Project | undefined> => {
  try {
    const response = await sql`
        SELECT 
          * 
        FROM 
          project 
        WHERE 
          project_id = ${projectId}`;

    const projects: Project[] = response.rows.map((row) => ({
      projectId: row.project_id,
      projectName: row.project_name,
      projectDescription: row.project_description,
      ownerId: row.owner_id,
    }));

    return projects && projects.length > 0 ? projects[0] : undefined;
  } catch (error) {
    console.error(error);
  }
};

export const insertProject = async ({
  projectName,
  projectDescription,
  ownerId,
}: NewProject): Promise<Project | undefined> => {
  try {
    const response = await sql`
    INSERT INTO 
      project (project_name, project_description, owner_id) 
    VALUES 
      (${projectName}, ${projectDescription}, ${ownerId})
    RETURNING 
      project_id, project_name, project_description, owner_id`;

    const projects: Project[] = response.rows.map((row) => ({
      projectId: row.project_id,
      projectName: row.project_name,
      projectDescription: row.project_description,
      ownerId: row.owner_id,
    }));

    return projects && projects.length > 0 ? projects[0] : undefined;
  } catch (error) {
    console.error(error);
  }
};
