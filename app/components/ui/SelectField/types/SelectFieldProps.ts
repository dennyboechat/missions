export interface SelectFieldItem {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  items: SelectFieldItem[];
  label?: string;
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  errorMessage?: string;
}
