"use client";

// Components
import { Grid, Container, Text, TextField } from "@radix-ui/themes";
import { Icon } from "../../Icon";

// Types
import { InputTextFieldProps } from "../types/InputTextFieldProps";

// Hooks
import { useEffect, useRef } from "react";

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
}: InputTextFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const lastValueRef = useRef(value);

  // The field is uncontrolled -- it saves on blur rather than holding every
  // keystroke in React state. The cost is that defaultValue is read once, at
  // mount, so a value changed by someone else arrives in the props and never
  // reaches the screen. Writing it to the DOM is what keeps the field honest
  // now that pages refresh themselves, without giving up the uncontrolled
  // behaviour.
  //
  // Never while the field has focus: someone is entering a measurement, and
  // having the number swapped under the cursor is worse than seeing it a moment
  // late. Their blur saves what they typed.
  useEffect(() => {
    const input = inputRef.current;

    if (!input || value === lastValueRef.current) {
      return;
    }

    lastValueRef.current = value;

    if (document.activeElement === input) {
      return;
    }

    input.value = value === undefined || value === null ? "" : String(value);
  }, [value]);

  return (
    <Grid>
      {label && (
        <Text className={styles.field_label}>
          {labelIcon && <Icon name={labelIcon} size={15} />}
          {`${label}${required ? " *" : ""}`}
        </Text>
      )}
      <TextField.Root
        ref={inputRef}
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
};
