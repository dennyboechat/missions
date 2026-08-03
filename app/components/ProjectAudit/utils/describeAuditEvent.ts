// Types
import { AuditEventRecord } from "../../../types/AuditEventTypes";

/**
 * Column names, in the words the app uses on screen.
 *
 * A trail that says `patient_blood_pressure_systolic` is a trail written for
 * whoever wrote the schema. The reader is an admin checking what a colleague
 * recorded, and the label they know it by is the one on the field.
 */
const FIELD_LABELS: Record<string, string> = {
  appointment_notes: "Notes",
  appointment_referral: "Referral",
  appointment_has_referral: "Has referral",
  patient_height: "Height",
  patient_weight: "Weight",
  patient_temperature: "Temperature",
  patient_blood_glucose: "Blood glucose",
  patient_pulse: "Pulse",
  patient_oxygen_saturation: "Oxygen saturation",
  patient_blood_pressure_systolic: "Blood pressure (systolic)",
  patient_blood_pressure_diastolic: "Blood pressure (diastolic)",
  patient_vision_left_tested_distance: "Vision left (tested)",
  patient_vision_left_normal_distance: "Vision left (normal)",
  patient_vision_right_tested_distance: "Vision right (tested)",
  patient_vision_right_normal_distance: "Vision right (normal)",
  patient_full_name: "Name",
  patient_date_of_birth: "Date of birth",
  patient_phone_number: "Phone number",
  is_patient_male: "Sex",
  drug_name: "Drug",
  dose: "Dose",
  quantity: "Quantity",
  instructions_usage: "Instructions",
  tooth_status: "Tooth status",
  tooth_notes: "Tooth notes",
  project_name: "Name",
  project_description: "Description",
  project_timezone: "Timezone",
  project_length_unit: "Length unit",
  project_weight_unit: "Weight unit",
  project_temperature_unit: "Temperature unit",
  project_date_format: "Date format",
  is_user_active: "Active",
  is_user_admin: "Admin",
};

/**
 * What a column is called on screen, or the column name itself when it is one
 * this map has not been taught. Falling back to the raw name is deliberate: an
 * unlabelled field is still a true record of what changed, and a trail that
 * dropped the event instead would be quietly incomplete.
 */
export const getFieldLabel = (field?: string) => {
  if (!field) {
    return "";
  }

  return FIELD_LABELS[field] ?? field.replace(/_/g, " ");
};

/** An em dash, because a field that held nothing is not a field holding "empty". */
export const getValueLabel = (value?: string) => value ?? "—";

/**
 * The one-line summary of an event: who did what to what.
 *
 * Reads as a sentence rather than a row of columns, because the trail is scanned
 * for something surprising and a sentence is what the eye catches. "Ana Reis
 * changed Weight" first, the figures underneath.
 */
export const describeAuditEvent = ({
  actorName,
  action,
  entity,
  field,
}: AuditEventRecord) => {
  // An event whose author cannot be resolved is still an event. It happens when
  // an account has been deleted since -- the trail keeps the row and loses only
  // the name.
  const actor = actorName ?? "A removed user";

  if (action === "changed" && field) {
    return `${actor} changed ${getFieldLabel(field)}`;
  }

  return `${actor} ${action} a ${entity}`;
};

/**
 * The record the event was about: whose, and which part of it.
 *
 * Project-level events -- settings, people -- have no patient, and saying so
 * would be noise on a line that is already clear about what it touched.
 */
export const describeAuditSubject = ({
  entity,
  patientName,
}: AuditEventRecord) => [patientName, entity].filter(Boolean).join(" · ");
