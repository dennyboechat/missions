"use client";

// Components
import { DentalAppointmentToothDetails } from "../../DentalAppointmentToothDetails";
import { DentalMap } from "../../ui/DentalMap";
import { Grid } from "@radix-ui/themes";

// Hooks
import { useState } from "react";

// Types
import {
  Tooth,
  ToothDetails,
} from "../../DentalAppointmentToothDetails/types/DentalAppointmentToothDetailsProps";

export const DentalAppointmentMap = () => {
  const [selectedTooth, setSelectedTooth] = useState<Tooth>();
  const [toothDetails, setToothDetails] = useState<Record<Tooth, ToothDetails>>();

  return (
    <Grid columns="2" gap="5">
      <DentalMap
        onClickTooth={(toothNumber) => setSelectedTooth(toothNumber)}
        selectedTooth={selectedTooth}
        toothDetails={toothDetails}
      />
      {selectedTooth && (
        <DentalAppointmentToothDetails
          selectedTooth={selectedTooth}
          toothDetails={toothDetails}
          setToothDetails={setToothDetails}
        />
      )}
    </Grid>
  );
};
