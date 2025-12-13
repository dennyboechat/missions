export interface DateTimeProps {
  label?: string;
  value?: string;
  autoFocus?: boolean;
  required?: boolean;
  errorMessage?: string;
  maxDate?: Date;
  onChange: (value: string) => void;
  onBlur?: () => void;
}
