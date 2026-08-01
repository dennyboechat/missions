export interface ProjectReportsAppointmentTypes {
  /** Calendar day in the project's timezone, as YYYY-MM-DD. */
  appointmentDate: string;
  quantity: number;
  appointmentType: "general" | "dental";
}
