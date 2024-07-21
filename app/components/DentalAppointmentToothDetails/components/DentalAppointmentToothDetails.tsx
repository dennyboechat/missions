"use client";

// Components
import { Box, Text } from "@radix-ui/themes";
import { TextAreaField } from "../../ui/TextAreaField";
import { Space } from "../../ui/Space";
import { DentalAppointmentToothStatus } from "../../DentalAppointmentToothStatus";

// Types
import {
  DentalAppointmentToothDetailsProps,
  Tooth,
  ToothDetails,
} from "../types/DentalAppointmentToothDetailsProps";

export const DentalAppointmentToothDetails = ({
  selectedTooth,
  toothDetails,
  setToothDetails,
}: DentalAppointmentToothDetailsProps) => (
  <Box>
    <Text color="blue">{`Tooth ${selectedTooth}`}</Text>
    <Space />
    <Text>{"Tooth status"}</Text>
    <DentalAppointmentToothStatus
      selectedTooth={selectedTooth}
      toothDetails={toothDetails}
      setToothDetails={setToothDetails}
    />
    <Space />
    <TextAreaField
      label="Tooth notes"
      value={toothDetails?.[selectedTooth]?.toothNotes ?? ""}
      onChange={(e) => {
        setToothDetails((prevToothDetails: any) => ({
          ...prevToothDetails,
          [selectedTooth]: {
            ...prevToothDetails?.[selectedTooth],
            toothNotes: e.target.value,
          },
        }));
      }}
      size="1"
    />
  </Box>
);
