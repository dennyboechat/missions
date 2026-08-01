// Types
import { DoseProps } from "./DoseProps";

export interface DoseAmountProps extends DoseProps {
  /** Identifies the field so the drug field in the same row can focus it. */
  rowId: string;
}
