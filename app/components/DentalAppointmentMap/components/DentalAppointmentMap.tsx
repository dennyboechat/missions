"use client";

// Components
import { DentalAppointmentToothDetails } from "../../DentalAppointmentToothDetails";
import { DentalMap } from "../../ui/DentalMap";
import { Grid } from "@radix-ui/themes";

// Hooks
import { useState } from "react";

export const DentalAppointmentMap = () => {
  const [selectedTooth, setSelectedTooth] = useState<string>();

  return (
    <Grid columns="2" gap="5">
      <DentalMap
        onClickTooth={(toothNumber) => setSelectedTooth(toothNumber)}
        selectedTooth={selectedTooth}
      />
      {selectedTooth && (
        <DentalAppointmentToothDetails selectedTooth={selectedTooth} />
      )}
    </Grid>
  );
};
