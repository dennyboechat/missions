// Types
import { PatientPersonalSummary } from "../../../types/PatientPersonalSummary";

export interface PatientLabelProps {
  /** From the URL, so the code is drawn before the summary has arrived. */
  patientPersonalId: string;
  /** What the card says. Absent until the record has loaded. */
  patient?: PatientPersonalSummary;
  /** Which mission the record lives on, for a card leaving the clinic. */
  projectName?: string;
}

export interface PatientLabelDialogProps extends PatientLabelProps {
  /** What is clicked to open the card. The QR code in the sidebar. */
  children: React.ReactNode;
}
