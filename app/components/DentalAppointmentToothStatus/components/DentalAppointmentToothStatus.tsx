"use client";

// Components
import { Grid, Button } from "@radix-ui/themes";

// Types
import {
  DentalAppointmentToothStatusProps,
  DentalAppointmentToothStatusEnum,
} from "../types/DentalAppointmentToothStatusProps";

export const DentalAppointmentToothStatus = ({
  selectedTooth,
  toothDetails,
  setToothDetails,
}: DentalAppointmentToothStatusProps) => {
  const onSelectStatus = (status: DentalAppointmentToothStatusEnum) => {
    setToothDetails((prevToothDetails: any) => ({
      ...prevToothDetails,
      [selectedTooth]: {
        ...prevToothDetails?.[selectedTooth],
        toothStatus:
          toothDetails?.[selectedTooth]?.toothStatus === status
            ? undefined
            : status,
      },
    }));
  };

  return (
    <Grid columns="2" gap="10px">
      <Button
        color="bronze"
        variant={
          toothDetails?.[selectedTooth]?.toothStatus ===
          DentalAppointmentToothStatusEnum.EXTRACTED
            ? "solid"
            : "outline"
        }
        onClick={() =>
          onSelectStatus(DentalAppointmentToothStatusEnum.EXTRACTED)
        }
      >
        {"Extracted"}
      </Button>
      <Button
        color="green"
        variant={
          toothDetails?.[selectedTooth]?.toothStatus ===
          DentalAppointmentToothStatusEnum.TREATED
            ? "solid"
            : "outline"
        }
        onClick={() => onSelectStatus(DentalAppointmentToothStatusEnum.TREATED)}
      >
        {"Treated"}
      </Button>
    </Grid>
  );
};
