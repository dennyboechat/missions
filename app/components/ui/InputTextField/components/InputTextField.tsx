"use client";

// Components
import { Grid, Container, Text, TextField } from "@radix-ui/themes";
import { Icon } from "../../Icon";

// Types
import { InputTextFieldProps } from "../types/InputTextFieldProps";

// Styles
import styles from "../../../../styles/fields.module.css";

export const InputTextField = ({
  label,
  labelIcon,
  placeholder,
  value,
  maxLength = 255,
  autoFocus,
  required,
  errorMessage,
  onBlur,
  type = "text",
  max,
  min,
  prefix,
  suffix,
  className,
}: InputTextFieldProps) => (
  <Grid>
    {label && (
      <Text className={styles.field_label}>
        {labelIcon && <Icon name={labelIcon} size={15} />}
        {`${label}${required ? " *" : ""}`}
      </Text>
    )}
    <TextField.Root
      onBlur={onBlur}
      defaultValue={value}
      placeholder={placeholder}
      maxLength={maxLength}
      autoFocus={autoFocus}
      required={required}
      type={type}
      max={max}
      min={min}
      // A measurement is read off a laptop screen in bad light, so numbers take
      // the mono face with tabular figures and a slashed zero.
      className={`${type === "number" ? styles.numeric_input : ""}${
        className ? ` ${className}` : ""
      }`}
    >
      <TextField.Slot>{prefix}</TextField.Slot>
      <TextField.Slot>{suffix}</TextField.Slot>
    </TextField.Root>
    <Container height="25px">
      <Text className={styles.required_field}>{errorMessage}</Text>
    </Container>
  </Grid>
);
