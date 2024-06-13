// Components
import { Grid, Text, TextField } from "@radix-ui/themes";

// Types
import { InputTextFieldProps } from "../types/InputTextFieldProps";

export const InputTextField = ({ label, placeholder, value }: InputTextFieldProps) => (
  <Grid>
    <Text>{label}</Text>
    <TextField.Root placeholder={placeholder}>
     {value}
    </TextField.Root>
  </Grid>
);
