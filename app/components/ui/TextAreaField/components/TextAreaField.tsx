// Components
import { Grid, Container, Text, TextArea } from "@radix-ui/themes";

// Types
import { TextAreaFieldProps } from "../types/TextAreaFieldProps";

// Styles
import styles from "../../../../styles/fields.module.css";

export const TextAreaField = ({
  label,
  placeholder,
  value,
  maxLength = 4000,
  autoFocus,
  required,
  errorMessage,
  onBlur,
}: TextAreaFieldProps) => (
  <Grid>
    <Text>{`${label}${required ? " *" : ""}`}</Text>
    <TextArea
      onBlur={onBlur}
      defaultValue={value}
      placeholder={placeholder}
      maxLength={maxLength}
      autoFocus={autoFocus}
      required={required}
    />
    <Container height="25px">
      <Text className={styles.required_field}>{errorMessage}</Text>
    </Container>
  </Grid>
);
