export interface PatientQrCodeProps {
  patientPersonalId: string;
  /** Named on the code so a scan is checked against the record on screen. */
  patientFullName?: string;
}
