"use client";

// Components
import { Box, Text } from "@radix-ui/themes";
import { TextAreaField } from "../../ui/TextAreaField";
import { Space } from "../../ui/Space";
import { DentalAppointmentToothStatus } from "../../DentalAppointmentToothStatus";

// Types
import { DentalAppointmentToothDetailsProps } from "../types/DentalAppointmentToothDetailsProps";

export const DentalAppointmentToothDetails = ({
  selectedTooth,
}: DentalAppointmentToothDetailsProps) => (
  <Box>
    <Text color="blue">{`Tooth ${selectedTooth}`}</Text>
    <Space />
    <DentalAppointmentToothStatus />
    <Space />
    <TextAreaField label="Tooth notes" value={""} size="1" />
  </Box>
);
