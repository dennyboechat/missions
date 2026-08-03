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

// Styles
import styles from "../styles/MedicationTable.module.css";

export const MedicationTable = ({
  medications,
  setMedications,
  insertMedication,
  updateMedication,
  deleteMedication,
}: MedicationTableProps) => {
  // A saved row has an id; the trailing blank row does not. So "nothing has been
  // prescribed here" is "no row has been saved yet", not "the array is empty".
  const hasPrescribed = medications?.some(({ medicationUid }) => medicationUid);

  return (
    <div>
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
          ),
        )}
      </Grid>
      {/* Said out loud because its absence was being typed into the drug column:
      "none", "No meds" and "None" between them made ten prescriptions of a drug
      called none, which the medication report then counted. Nothing to record
      is recorded by leaving the row alone. */}
      {!hasPrescribed && (
        <Text as="p" className={styles.hint}>
          {"No medication prescribed. Leave this blank if none was given."}
        </Text>
      )}
    </div>
  );
};
