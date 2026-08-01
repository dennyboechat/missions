"use client";

// Components
import { Grid, Container, Text, TextArea } from "@radix-ui/themes";

// Types
import { TextAreaFieldProps } from "../types/TextAreaFieldProps";

// Styles
import styles from "../../../../styles/fields.module.css";
import textAreaStyles from "../styles/TextAreaField.module.css";

export const TextAreaField = ({
  label,
  placeholder,
  defaultValue,
  value,
  maxLength = 2550,
  autoFocus,
  required,
  errorMessage,
  disabled,
  size = "3",
  onChange,
  onBlur,
}: TextAreaFieldProps) => (
  <Grid>
    <Text>{`${label}${required ? " *" : ""}`}</Text>
    <TextArea
      size={size}
      resize="vertical"
      onBlur={onBlur}
      // Null would hand React a controlled field with no value and get the
      // field swapped to uncontrolled mid-edit, losing what was typed. Undefined
      // is left alone: that is the caller saying to use defaultValue instead.
      value={value === null ? "" : value}
      defaultValue={defaultValue}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      autoFocus={autoFocus}
      required={required}
      className={textAreaStyles.text_area}
      disabled={disabled}
    />
    <Container height="25px">
      <Text className={styles.required_field}>{errorMessage}</Text>
    </Container>
  </Grid>
);
