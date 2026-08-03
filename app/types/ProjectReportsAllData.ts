export interface ProjectReportsAllData {
  /** Which appointment a row came from, so the blank half reads as expected. */
  appointmentType: "General" | "Dental";
  patientFullName: string;
  /** A plain calendar day, as YYYY-MM-DD -- never a timestamp. */
  patientDateOfBirth: string;
  patientPhoneNumber: string;
  gender: "male" | "female";
  /** Calendar day in the project's timezone, as YYYY-MM-DD. */
  generalAppointmentDate: string;
  generalNotes: string;
  generalReferral: string;
  /** "yes" or "no": a referral can be flagged with no text written yet. */
  generalHasReferral: string;
  generalPrescribedMedications: string;
  patientHeight: number;
  patientWeight: number;
  patientTemperature: number;
  patientBloodGlucose: number;
  patientPulse: number;
  patientOxygenSaturation: number;
  patientBloodPressureSystolic: number;
  patientBloodPressureDiastolic: number;
  patientVisionLeftNormalDistance: number;
  patientVisionLeftTestedDistance: number;
  patientVisionRightNormalDistance: number;
  patientVisionRightTestedDistance: number;
  /** Calendar day in the project's timezone, as YYYY-MM-DD. */
  dentalAppointmentDate: string;
  dentalNotes: string;
  dentalReferral: string;
  /** "yes" or "no": a referral can be flagged with no text written yet. */
  dentalHasReferral: string;
  dentalPrescribedMedications: string;
  /** Each tooth as "name (status) - notes", not the name alone. */
  teeth: string;
}
