export interface ProjectReportsAllData {
  patientFullName: string;
  patientDateOfBirth: Date;
  patientPhoneNumber: string;
  gender: "male" | "female";
  /** Calendar day in the project's timezone, as YYYY-MM-DD. */
  generalAppointmentDate: string;
  generalNotes: string;
  generalPrescribedMedications: string;
  patientHeight: number;
  patientWeight: number;
  patientTemperature: number;
  patientBloodGlucose: number;
  patientPulse: number;
  patientOxygenSaturation: number;
  patientBloodPressureDiastolic: number;
  /** Calendar day in the project's timezone, as YYYY-MM-DD. */
  dentalAppointmentDate: string;
  dentalNotes: string;
  dentalPrescribedMedications: string;
  teethNames: string;
}
