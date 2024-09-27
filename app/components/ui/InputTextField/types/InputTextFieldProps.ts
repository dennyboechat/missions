export interface InputTextFieldProps {
  label?: string;
  placeholder?: string;
  value?: string | number;
  maxLength?: number;
  autoFocus?: boolean;
  required?: boolean;
  errorMessage?: string;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  type?: 'text' | 'number';
  max?: number;
  min?: number;
  prefix?: string;
  suffix?: string;
}
