"use client";

// Components
import { Grid, Button } from "@radix-ui/themes";

// Types
import {
  DentalAppointmentToothStatusProps,
  DentalAppointmentToothStatusEnum,
} from "../types/DentalAppointmentToothStatusProps";

export const DentalAppointmentToothStatus = ({
  toothStatus,
}: DentalAppointmentToothStatusProps) => (
  <Grid columns="2" gap="10px">
    <Button color="bronze" variant="outline">
      {"Extracted"}
    </Button>
    <Button color="green" variant="outline">
      {"Treated"}
    </Button>
  </Grid>
);
