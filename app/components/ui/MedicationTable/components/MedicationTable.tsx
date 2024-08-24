"use client";

// Components
import { Grid, Text } from "@radix-ui/themes";
import { DrugSelector } from "./DrugSelector";
import { DoseInput } from "./DoseInput";
import { QuantityInput } from "./QuantityInput";
import { InstructionsInput } from "./InstructionsInput";
import { Actions } from "./Actions";
import { Fragment } from "react";

// Types
import { Medication } from "../../../../types/Medication";

// Utils
import { getNewMedicationRecord } from "../utils/getNewMedicationRecord";

// Hooks
import { useState } from "react";

export const MedicationTable = () => {
  const [medications, setMedications] = useState<Medication[]>([
    getNewMedicationRecord(),
  ]);

  return (
    <Grid columns="30fr 10fr 10fr 45fr 5fr" gap="3">
      <Text weight="medium">{"Drug"}</Text>
      <Text weight="medium">{"Dose"}</Text>
      <Text weight="medium">{"Quantity"}</Text>
      <Text weight="medium">{"Instructions"}</Text>
      <Text>{""}</Text>
      {medications.map(({ uid, drug }) => (
        <Fragment key={uid}>
          <DrugSelector
            drug={drug}
            medications={medications}
            setMedications={setMedications}
          />
          <DoseInput />
          <QuantityInput />
          <InstructionsInput />
          <Actions
            medicationUid={uid}
            drug={drug}
            setMedications={setMedications}
          />
        </Fragment>
      ))}
    </Grid>
  );
};
