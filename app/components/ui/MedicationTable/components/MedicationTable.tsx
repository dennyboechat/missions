"use client";

// Components
import { Grid, Text } from "@radix-ui/themes";
import { DrugSelector } from "./DrugSelector";
import { DoseAmountInput } from "./DoseAmountInput";
import { DoseUnitSelect } from "./DoseUnitSelect";
import { QuantityInput } from "./QuantityInput";
import { InstructionsInput } from "./InstructionsInput";
import { Actions } from "./Actions";
import { Fragment } from "react";

// Types
import { MedicationTableProps } from "../types/MedicationTableProps";

export const MedicationTable = ({
  medications,
  setMedications,
  insertMedication,
  updateMedication,
  deleteMedication,
}: MedicationTableProps) => (
  <Grid columns="28fr 9fr 9fr 9fr 40fr 5fr" gap="3">
    <Text weight="medium">{"Drug"}</Text>
    <Text weight="medium">{"Amount"}</Text>
    <Text weight="medium">{"Unit"}</Text>
    <Text weight="medium">{"Quantity"}</Text>
    <Text weight="medium">{"Instructions"}</Text>
    <Text>{""}</Text>
    {medications?.map(
      ({ rowId, medicationUid, drug, dose, quantity, instructions }) => (
        <Fragment key={rowId}>
          <DrugSelector
            rowId={rowId}
            drug={drug}
            medications={medications}
            setMedications={setMedications}
            insertMedication={insertMedication}
          />
          <DoseAmountInput
            rowId={rowId}
            drug={drug}
            dose={dose}
            medicationUid={medicationUid}
            setMedications={setMedications}
            updateMedication={updateMedication}
          />
          <DoseUnitSelect
            drug={drug}
            dose={dose}
            medicationUid={medicationUid}
            setMedications={setMedications}
            updateMedication={updateMedication}
          />
          <QuantityInput
            drug={drug}
            quantity={quantity}
            medicationUid={medicationUid}
            setMedications={setMedications}
            updateMedication={updateMedication}
          />
          <InstructionsInput
            drug={drug}
            instructions={instructions}
            medicationUid={medicationUid}
            setMedications={setMedications}
            updateMedication={updateMedication}
          />
          <Actions
            drug={drug}
            medicationUid={medicationUid}
            setMedications={setMedications}
            deleteMedication={deleteMedication}
          />
        </Fragment>
      )
    )}
  </Grid>
);
