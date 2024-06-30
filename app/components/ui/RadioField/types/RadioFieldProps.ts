export interface RadioFieldProps {
  name: string;
  items: React.ReactNode;
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  autoFocus?: boolean;
  required?: boolean;
  errorMessage?: string;
}
