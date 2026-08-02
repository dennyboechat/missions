// Types
import { IconName } from "../../Icon";

export interface InputTextFieldProps {
  label?: string;
  /** Glyph beside the label. Measurement fields carry one so a panel can be scanned without reading. */
  labelIcon?: IconName;
  placeholder?: string;
  value?: string | number;
  maxLength?: number;
  autoFocus?: boolean;
  required?: boolean;
  errorMessage?: string;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  type?: "text" | "number";
  max?: number;
  min?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}
