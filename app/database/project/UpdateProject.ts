"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import {
  Project,
  UpdateProject,
  PROJECT_LENGTH_UNITS,
  PROJECT_WEIGHT_UNITS,
  PROJECT_TEMPERATURE_UNITS,
  PROJECT_DATE_FORMATS,
} from "../../types/ProjectTypes";

// Utils
import { isValidTimezone } from "../../utils/isValidTimezone";

// Auth
import { assertProjectAccess } from "../auth/projectAccess";

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

// `field` is interpolated into the statement, so it has to come from a fixed set.
const UPDATABLE_FIELDS = [
  "project_name",
  "project_description",
  "project_timezone",
  "project_length_unit",
  "project_weight_unit",
  "project_temperature_unit",
  "project_date_format",
];

/**
 * The columns whose value is also a fixed set, and what may go in them.
 *
 * The database has CHECK constraints for these, but reaching them means the
 * caller gets a constraint violation reported as a generic error. Refusing here
 * says which field and keeps a typo out of a column every screen formats from.
 */
const ALLOWED_VALUES: Record<string, readonly string[]> = {
  project_length_unit: PROJECT_LENGTH_UNITS,
  project_weight_unit: PROJECT_WEIGHT_UNITS,
  project_temperature_unit: PROJECT_TEMPERATURE_UNITS,
  project_date_format: PROJECT_DATE_FORMATS,
};

export const updateProject = async ({
  projectId,
  field,
  value,
}: UpdateProject): Promise<ActionResult<Project>> => {
  try {
    await assertProjectAccess({ projectId }, { requires: "admin" });

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

    const allowed = ALLOWED_VALUES[field];

    if (allowed && !allowed.includes(validatedValue)) {
      throw new Error(`Invalid ${field}: ${validatedValue}`);
    }

    const query = `
      WITH previous AS (
        SELECT
          ${field} AS value_before
        FROM
          project
        WHERE
          project_id = $2
      )
      UPDATE
        project
      SET
        ${field} = $1
      WHERE
        project_id = $2
      RETURNING
        project_id, project_name, project_description, project_timezone,
        project_length_unit, project_weight_unit, project_temperature_unit,
        project_date_format,
        owner_id,
        (SELECT value_before FROM previous)::text AS value_before
    `;

    const response = await sql.query(query, [validatedValue, projectId]);

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

    // A project-level event: no patient, so the trail files it under the
    // project itself rather than under somebody’s record.
    await recordAuditEvent({
      projectId,
      action: "changed",
      entity: "project",
      entityId: projectId,
      field,
      valueBefore: response.rows[0].value_before,
      valueAfter: validatedValue,
    });

    return actionOk(projects[0]);
  } catch (error) {
    return toActionFailure(error);
  }
};
