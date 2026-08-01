"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { Project, UpdateProject } from "../../types/ProjectTypes";

// Utils
import { isValidTimezone } from "../../utils/isValidTimezone";

// Auth
import { assertProjectAccess } from "../auth/projectAccess";

// `field` is interpolated into the statement, so it has to come from a fixed set.
const UPDATABLE_FIELDS = [
  "project_name",
  "project_description",
  "project_timezone",
];

export const updateProject = async ({
  projectId,
  field,
  value,
}: UpdateProject): Promise<Project | undefined> => {
  try {
    await assertProjectAccess({ projectId }, { ownerOnly: true });

    if (!UPDATABLE_FIELDS.includes(field)) {
      throw new Error(`Field not updatable: ${field}`);
    }

    const validatedValue = typeof value === "string" ? value.trim() : value;

    // An unknown zone here would make every report query fail at AT TIME ZONE.
    if (
      field === "project_timezone" &&
      !isValidTimezone({ timezone: validatedValue })
    ) {
      throw new Error(`Invalid timezone: ${validatedValue}`);
    }

    const query = `
      UPDATE
        project
      SET
        ${field} = $1
      WHERE
        project_id = $2
      RETURNING
        project_id, project_name, project_description, project_timezone, owner_id
    `;

    const response = await sql.query(query, [validatedValue, projectId]);

    const projects: Project[] = response.rows.map((row) => ({
      projectId: row.project_id,
      projectName: row.project_name,
      projectDescription: row.project_description,
      projectTimezone: row.project_timezone,
      ownerId: row.owner_id,
    }));

    return projects?.length > 0 ? projects[0] : undefined;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
