// Types
import { Responsive } from "@radix-ui/themes/props";

export interface TextAreaFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  maxLength?: number;
  autoFocus?: boolean;
  required?: boolean;
  errorMessage?: string;
  size?: Responsive<"3" | "1" | "2">;
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
}
