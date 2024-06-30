// Components
import { Grid, Container, Text, TextField } from "@radix-ui/themes";

// Types
import { DateTimeProps } from "../types/DateTimeProps";

// Styles
import styles from "../../../../styles/fields.module.css";

export const DateTime = ({
  label,
  value,
  autoFocus,
  required,
  errorMessage,
  maxDate,
  onChange,
}: DateTimeProps) => (
  <Grid>
    <Text>{`${label}${required ? " *" : ""}`}</Text>
    <input
      type="date"
      value={value}
      autoFocus={autoFocus}
      required={required}
      onChange={onChange}
      max={maxDate}
    />
    <Container height="25px">
      <Text className={styles.required_field}>{errorMessage}</Text>
    </Container>
  </Grid>
);
