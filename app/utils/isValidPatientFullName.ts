// Types
import { PatientPersonalFullName } from "../types/PatientPersonalTypes";

export const isValidPatientFullName = ({
  patientFullName,
}: {
  patientFullName?: PatientPersonalFullName;
}) => patientFullName && patientFullName.trim() !== "";
