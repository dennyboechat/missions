// Types
import { Responsive } from "@radix-ui/themes/props";

export interface TextAreaFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
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
