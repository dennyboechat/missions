"use client";

// Components
import { Box, Text } from "@radix-ui/themes";
import { MedicationTable } from "../../ui/MedicationTable";

export const DentalAppointmentMedicationPrescribed = () => (
  <Box>
    <Text>{"Prescribed medication"}</Text>
    <MedicationTable />
  </Box>
);
