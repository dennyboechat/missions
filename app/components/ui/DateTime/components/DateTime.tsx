// Components
import { Grid, Container, Text, TextField } from "@radix-ui/themes";

// Types
import { DateTimeProps } from "../types/DateTimeProps";

// Styles
import styles from "../../../../styles/fields.module.css";
import dateTimeStyles from "../styles/DateTime.module.css";

export const DateTime = ({
  label,
  value,
  autoFocus,
  required,
  errorMessage,
  maxDate,
  onChange,
  onBlur,
}: DateTimeProps) => (
  <Grid>
    <Text>{`${label}${required ? " *" : ""}`}</Text>
    <input
      type="date"
      value={value}
      autoFocus={autoFocus}
      required={required}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      max={maxDate}
      className={dateTimeStyles.input_date}
    />
    <Container height="25px">
      <Text className={styles.required_field}>{errorMessage}</Text>
    </Container>
  </Grid>
);
