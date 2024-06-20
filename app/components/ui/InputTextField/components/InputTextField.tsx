// Components
import { Grid, Text, TextField } from "@radix-ui/themes";

// Types
import { InputTextFieldProps } from "../types/InputTextFieldProps";

export const InputTextField = ({
  label,
  placeholder,
  value,
  maxLength = 255,
  autoFocus,
  required,
  onBlur,
}: InputTextFieldProps) => (
  <Grid>
    <Text>{`${label}${required ? ' *' : ''}`}</Text>
    <TextField.Root
      onBlur={onBlur}
      defaultValue={value}
      placeholder={placeholder}
      maxLength={maxLength} 
      autoFocus={autoFocus}
      required={required}
    />
  </Grid>
);
