// Types
import { Responsive } from "@radix-ui/themes/props";

export interface TextAreaFieldProps {
  label?: string;
  placeholder?: string;
  /**
   * Null is accepted because it is what a nullable column holds before anyone
   * has typed in it; the field renders it as empty. Undefined means the caller
   * is not controlling the field and is leaving it to defaultValue.
   */
  value?: string | null;
  defaultValue?: string;
  maxLength?: number;
  autoFocus?: boolean;
  required?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  size?: Responsive<"3" | "1" | "2">;
  onChange?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
}
