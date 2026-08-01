"use client";

// Components
import { Grid, Container, Text, Select } from "@radix-ui/themes";

// Types
import { SelectFieldProps } from "../types/SelectFieldProps";

// Styles
import styles from "../../../../styles/fields.module.css";

export const SelectField = ({
  items,
  label,
  value,
  placeholder,
  onChange,
  required,
  disabled,
  errorMessage,
}: SelectFieldProps) => (
  <Grid>
    {label && <Text>{`${label}${required ? " *" : ""}`}</Text>}
    <Select.Root
      // Radix treats "" as no selection, so an unset field shows the
      // placeholder instead of silently displaying the first item.
      value={value || undefined}
      onValueChange={onChange}
      disabled={disabled}
    >
      <Select.Trigger placeholder={placeholder} />
      <Select.Content position="popper">
        {items.map(({ value: itemValue, label: itemLabel }) => (
          <Select.Item key={itemValue} value={itemValue}>
            {itemLabel}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
    {/* minHeight, not height: the slot still reserves a line to avoid layout
        shift, but a message that wraps grows instead of overflowing onto
        whatever follows the field. */}
    <Container minHeight="25px">
      <Text size="1" className={styles.required_field}>
        {errorMessage}
      </Text>
    </Container>
  </Grid>
);
