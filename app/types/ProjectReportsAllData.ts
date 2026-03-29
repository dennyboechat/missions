export interface ProjectReportsAllData {
  patientFullName: string;
  patientDateOfBirth: Date;
  patientPhoneNumber: string;
  gender: "male" | "female";
  generalAppointmentDate: Date;
  generalNotes: string;
  generalPrescribedMedications: string;
  patientHeight: number;
  patientWeight: number;
  patientTemperature: number;
  patientBloodGlucose: number;
  patientPulse: number;
  patientOxygenSaturation: number;
  patientBloodPressureDiastolic: number;
  dentalAppointmentDate: Date;
  dentalNotes: string;
  dentalPrescribedMedications: string;
  teethNames: string;
}
