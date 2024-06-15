export interface InputTextFieldProps {
    label?: string;
    placeholder?: string;
    value?: string;
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  }
  