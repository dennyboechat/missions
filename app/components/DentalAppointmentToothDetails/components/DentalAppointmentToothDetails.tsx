"use client";

// Components
import { Box, Text } from "@radix-ui/themes";
import { Space } from "../../ui/Space";
import { DentalAppointmentToothStatus } from "../../DentalAppointmentToothStatus";
import { DentalAppointmentToothNotes } from "./DentalAppointmentToothNotes";

// Types
import { DentalAppointmentToothDetailsProps } from "../types/DentalAppointmentToothDetailsProps";

export const DentalAppointmentToothDetails = ({
  patientDentistryId,
  selectedTooth,
  toothDetails,
  setToothDetails,
}: DentalAppointmentToothDetailsProps) => (
  <Box>
    <Text weight='bold'>{`Tooth ${selectedTooth}`}</Text>
    <Space />
    <DentalAppointmentToothStatus
      patientDentistryId={patientDentistryId}
      selectedTooth={selectedTooth}
      toothDetails={toothDetails}
      setToothDetails={setToothDetails}
    />
    <Space />
    <DentalAppointmentToothNotes
      patientDentistryId={patientDentistryId}
      selectedTooth={selectedTooth}
      patientDentistryToothId={
        toothDetails?.[selectedTooth]?.patientDentistryToothId
      }
      notes={toothDetails?.[selectedTooth]?.toothNotes}
      setToothDetails={setToothDetails}
    />
  </Box>
);
