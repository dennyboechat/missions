"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import {
  NewProject,
  Project,
  ProjectLengthUnit,
  ProjectWeightUnit,
  ProjectTemperatureUnit,
  ProjectDateFormat,
  PROJECT_LENGTH_UNITS,
  PROJECT_WEIGHT_UNITS,
  PROJECT_TEMPERATURE_UNITS,
  PROJECT_DATE_FORMATS,
  DEFAULT_PROJECT_FORMATS,
} from "../../types/ProjectTypes";

// Utils
import { isValidTimezone } from "../../utils/isValidTimezone";

// Auth
import { getAuthenticatedUserId } from "../auth/projectAccess";

// Types
import {
  ActionResult,
  actionOk,
  actionFailed,
} from "../../types/ActionResult";

// Auth
import { toActionFailure } from "../auth/toActionFailure";

// Audit
import { recordAuditEvent } from "../audit/recordAuditEvent";

export const insertProject = async ({
  projectName,
  projectDescription,
  projectTimezone,
  projectLengthUnit,
  projectWeightUnit,
  projectTemperatureUnit,
  projectDateFormat,
}: NewProject): Promise<ActionResult<Project>> => {
  try {
    // The owner is taken from the session, never from the request: a caller
    // could otherwise create a project owned by somebody else.
    const ownerId = await getAuthenticatedUserId();

    const query = `
      INSERT INTO
        project (
          project_name, project_description, project_timezone,
          project_length_unit, project_weight_unit, project_temperature_unit,
        project_date_format,
          owner_id
        )
      VALUES
        ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        project_id, project_name, project_description, project_timezone,
        project_length_unit, project_weight_unit, project_temperature_unit,
        project_date_format,
        owner_id
    `;

    // Anything the client did not send, or sent wrong, falls back to the
    // shipped default rather than reaching the CHECK constraints as an error:
    // a project is worth creating even if its units arrive malformed, and they
    // are editable in Settings afterwards.
    const response = await sql.query(query, [
      projectName.trim(),
      projectDescription?.trim(),
      isValidTimezone({ timezone: projectTimezone }) ? projectTimezone : "UTC",
      PROJECT_LENGTH_UNITS.includes(projectLengthUnit as ProjectLengthUnit)
        ? projectLengthUnit
        : DEFAULT_PROJECT_FORMATS.lengthUnit,
      PROJECT_WEIGHT_UNITS.includes(projectWeightUnit as ProjectWeightUnit)
        ? projectWeightUnit
        : DEFAULT_PROJECT_FORMATS.weightUnit,
      PROJECT_TEMPERATURE_UNITS.includes(
        projectTemperatureUnit as ProjectTemperatureUnit
      )
        ? projectTemperatureUnit
        : DEFAULT_PROJECT_FORMATS.temperatureUnit,
      PROJECT_DATE_FORMATS.includes(projectDateFormat as ProjectDateFormat)
        ? projectDateFormat
        : DEFAULT_PROJECT_FORMATS.dateFormat,
      ownerId,
    ]);

    const projects: Project[] = response.rows.map((row) => ({
      projectId: row.project_id,
      projectName: row.project_name,
      projectDescription: row.project_description,
      projectTimezone: row.project_timezone,
      projectLengthUnit: row.project_length_unit,
      projectWeightUnit: row.project_weight_unit,
      projectTemperatureUnit: row.project_temperature_unit,
      projectDateFormat: row.project_date_format,
      ownerId: row.owner_id,
    }));

    if (projects.length === 0) {
      return actionFailed("not_found");
    }

    await recordAuditEvent({
      projectId: projects[0].projectId,
      action: "added",
      entity: "project",
      entityId: projects[0].projectId,
      valueAfter: projects[0].projectName,
    });

    return actionOk(projects[0]);
  } catch (error) {
    return toActionFailure(error);
  }
};
