"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { Project, NewProject, ProjectOwnerId } from "../types/ProjectTypes";

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

export const insertProject = async ({
  projectName,
  projectDescription,
  ownerId,
}: NewProject) => {
  try {
    await sql`INSERT INTO project (project_name, project_description, owner_id) VALUES (${projectName}, ${projectDescription}, ${ownerId})`;
  } catch (error) {
    console.error(error);
  }
};
