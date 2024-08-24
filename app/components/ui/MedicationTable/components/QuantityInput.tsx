"use client";

// Components
import { TextField } from "@radix-ui/themes";

export const QuantityInput = () => (
  <TextField.Root type="number" maxLength={255} />
);
