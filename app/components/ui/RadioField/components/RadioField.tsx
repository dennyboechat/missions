"use client";

// Components
import { Grid, Container, Text, RadioGroup } from "@radix-ui/themes";

// Types
import { RadioFieldProps } from "../types/RadioFieldProps";

// Styles
import styles from "../../../../styles/fields.module.css";

export const RadioField = ({
  name,
  label,
  value,
  items,
  onChange,
  autoFocus,
  required,
  errorMessage,
}: RadioFieldProps) => (
  <Grid>
    <Text>{`${label}${required ? " *" : ""}`}</Text>
    <RadioGroup.Root
      defaultValue={value}
      name={name}
      autoFocus={autoFocus}
      onValueChange={onChange}
    >
      {items}
    </RadioGroup.Root>
    <Container height="25px">
      <Text className={styles.required_field}>{errorMessage}</Text>
    </Container>
  </Grid>
);
