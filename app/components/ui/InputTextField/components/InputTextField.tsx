// Components
import { Grid, Text, TextField } from "@radix-ui/themes";

// Types
import { InputTextFieldProps } from "../types/InputTextFieldProps";

export const InputTextField = ({
  label,
  placeholder,
  value,
  onBlur,
}: InputTextFieldProps) => (
  <Grid>
    <Text>{label}</Text>
    <TextField.Root
      onBlur={onBlur}
      defaultValue={value}
      placeholder={placeholder}
    />
  </Grid>
);
