export interface DateTimeProps {
  label?: string;
  value?: string;
  autoFocus?: boolean;
  required?: boolean;
  errorMessage?: string;
  maxDate?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
