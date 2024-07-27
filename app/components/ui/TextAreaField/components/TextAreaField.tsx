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
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      autoFocus={autoFocus}
      required={required}
      className={textAreaStyles.text_area}
    />
    <Container height="25px">
      <Text className={styles.required_field}>{errorMessage}</Text>
    </Container>
  </Grid>
);
