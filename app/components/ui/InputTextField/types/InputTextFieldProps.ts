export interface InputTextFieldProps {
    label?: string;
    placeholder?: string;
    value?: string;
    maxLength?: number;
    autoFocus?: boolean;
    required?: boolean;
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  }
  