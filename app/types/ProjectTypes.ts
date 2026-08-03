// Types
import { UserId } from "./UserTypes";

export type ProjectId = string;

export type ProjectName = string;

export type ProjectDescription = string;

/** IANA timezone name of the mission location, e.g. "Pacific/Fiji". */
export type ProjectTimezone = string;

/**
 * How a project writes down what it measures.
 *
 * Display only. Heights are stored in centimetres and temperatures in Celsius
 * whatever these say, so switching one never rewrites a patient's record and
 * BMI, the validation bounds and the CSV export all keep a single basis. The
 * conversions live in app/utils/projectFormats.ts.
 */
export type ProjectLengthUnit = "cm" | "in";

export type ProjectWeightUnit = "kg" | "lb";

export type ProjectTemperatureUnit = "C" | "F";

/** The order a date is written in, not the day it is. */
export type ProjectDateFormat = "mm/dd/yyyy" | "dd/mm/yyyy";

export const PROJECT_LENGTH_UNITS: ProjectLengthUnit[] = ["cm", "in"];
export const PROJECT_WEIGHT_UNITS: ProjectWeightUnit[] = ["kg", "lb"];
export const PROJECT_TEMPERATURE_UNITS: ProjectTemperatureUnit[] = ["C", "F"];
export const PROJECT_DATE_FORMATS: ProjectDateFormat[] = [
  "mm/dd/yyyy",
  "dd/mm/yyyy",
];

/** What a project falls back to before its own settings have been read. */
export const DEFAULT_PROJECT_FORMATS = {
  lengthUnit: "cm",
  weightUnit: "kg",
  temperatureUnit: "C",
  dateFormat: "mm/dd/yyyy",
} as const satisfies {
  lengthUnit: ProjectLengthUnit;
  weightUnit: ProjectWeightUnit;
  temperatureUnit: ProjectTemperatureUnit;
  dateFormat: ProjectDateFormat;
};

export type ProjectOwnerId = UserId;

/**
 * What someone is to a project. Ranked: an owner satisfies `admin`, and both
 * satisfy `member`. Lives here rather than beside the authorisation helper so
 * that client components can read a role without importing a server module.
 *
 * See app/database/auth/projectAccess.ts, which is what enforces it.
 */
export type ProjectRole = "member" | "admin" | "owner";

export interface Project {
  projectId: ProjectId;
  projectName: ProjectName;
  projectDescription: ProjectDescription;
  projectTimezone: ProjectTimezone;
  projectLengthUnit: ProjectLengthUnit;
  projectWeightUnit: ProjectWeightUnit;
  projectTemperatureUnit: ProjectTemperatureUnit;
  projectDateFormat: ProjectDateFormat;
  ownerId: ProjectOwnerId;
  /**
   * The signed-in caller's own standing in this project, as resolved by the
   * server. Optional because not every path that builds a Project asks.
   *
   * For showing and hiding only. The server re-checks every action, so a
   * tampered value buys nothing.
   */
  viewerRole?: ProjectRole;
}

export interface NewProject {
  projectName: ProjectName;
  projectDescription?: ProjectDescription;
  projectTimezone?: ProjectTimezone;
  projectLengthUnit?: ProjectLengthUnit;
  projectWeightUnit?: ProjectWeightUnit;
  projectTemperatureUnit?: ProjectTemperatureUnit;
  projectDateFormat?: ProjectDateFormat;
  ownerId: ProjectOwnerId;
}

export interface UpdateProject {
  projectId: ProjectId;
  field: string;
  value: string;
}
