export interface TextAreaFieldProps {
    label?: string;
    placeholder?: string;
    value?: string;
    maxLength?: number;
    autoFocus?: boolean;
    required?: boolean;
    errorMessage?: string;
    onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  }
  