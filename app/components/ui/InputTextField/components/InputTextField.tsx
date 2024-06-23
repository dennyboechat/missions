// Components
import { Grid, Container, Text, TextField } from "@radix-ui/themes";

// Types
import { InputTextFieldProps } from "../types/InputTextFieldProps";

export const InputTextField = ({
  label,
  placeholder,
  value,
  maxLength = 255,
  autoFocus,
  required,
  errorMessage,
  onBlur,
}: InputTextFieldProps) => (
  <Grid>
    <Text>{`${label}${required ? " *" : ""}`}</Text>
    <TextField.Root
      onBlur={onBlur}
      defaultValue={value}
      placeholder={placeholder}
      maxLength={maxLength}
      autoFocus={autoFocus}
      required={required}
    />
    <Container height="25px">
      <Text>{errorMessage}</Text>
    </Container>
  </Grid>
);
