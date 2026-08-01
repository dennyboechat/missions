"use client";

// Components
import { Button, Flex, Text } from "@radix-ui/themes";
import { Autocomplete } from "../../Autocomplete";

// Utils
import { getMostCommonDentalDrugs } from "../../../../utils/getMostCommonDentalDrugs";
import { getNewMedicationRecord } from "../utils/getNewMedicationRecord";
import { getDrugSuggestion } from "../../../../utils/getDrugSuggestion";
import { isSameName } from "../../../../utils/isSameName";

// Types
import { DrugSelectorProps } from "../types/DrugSelectorProps";
import { FocusEvent, useRef, useState } from "react";
import { flushSync } from "react-dom";

// Utils
import { getDoseAmountInputId } from "../utils/getDoseAmountInputId";

// Styles
import styles from "../styles/MedicationTable.module.css";

const noSuggestion = { typed: "", suggested: "" };

export const DrugSelector = ({
  rowId,
  drug,
  medications,
  setMedications,
  insertMedication,
}: DrugSelectorProps) => {
  const [suggestion, setSuggestion] = useState(noSuggestion);
  const drugs = getMostCommonDentalDrugs();
  // Confirming moves focus, which blurs the field, and the insert it is waiting
  // on has not finished setting the drug yet. Without this the row would be
  // added twice.
  const isAdding = useRef(false);

  const addMedication = async (
    drugName: string,
    { andMoveToAmount = false } = {}
  ) => {
    isAdding.current = true;
    setSuggestion(noSuggestion);

    const updatedMedications = [...medications];

    await insertMedication(drugName, updatedMedications);
    updatedMedications.push(getNewMedicationRecord());

    if (!andMoveToAmount) {
      setMedications(updatedMedications);
      isAdding.current = false;
      return;
    }

    // The drug is settled, so the caret carries on to the next field in the
    // row. The amount only stops being read-only once the row has its drug, so
    // the update has to land before focus moves.
    flushSync(() => setMedications(updatedMedications));
    document.getElementById(getDoseAmountInputId(rowId))?.focus();
    isAdding.current = false;
  };

  /**
   * Decides what a drug name typed into the row means. Shared by the two ways
   * out of the field, which differ only in whether the caret moves on.
   */
  const resolveDrug = async (
    value: string,
    { andMoveToAmount = false } = {}
  ) => {
    if (drug || isAdding.current) {
      return;
    }

    const typed = value.trim();

    if (!typed) {
      setSuggestion(noSuggestion);
      return;
    }

    // Picked from the list, or typed out exactly: store the list's spelling, so
    // one drug is never filed under two capitalisations.
    const knownDrug = drugs.find(({ name }) => isSameName(name, typed));

    if (knownDrug) {
      await addMedication(knownDrug.name, { andMoveToAmount });
      return;
    }

    const suggested = getDrugSuggestion({ drug: typed, drugs });

    // Nothing known is close enough for this to look like a slip. Missions
    // carry drugs the list does not, so the name goes in as it was typed.
    if (!suggested) {
      await addMedication(typed, { andMoveToAmount });
      return;
    }

    // The prompt has to be answered before the row is worth moving on from, so
    // the caret stays put; answering it moves on.
    setSuggestion({ typed, suggested });
  };

  // Focus merely wandering off is not a decision to move the caret anywhere.
  const handleBlur = (e: FocusEvent<HTMLInputElement>) => resolveDrug(e.target.value);

  const handleConfirm = (value: string) =>
    resolveDrug(value, { andMoveToAmount: true });

  return (
    <div>
      <Autocomplete
        value={drug}
        items={drugs}
        onBlur={handleBlur}
        onConfirm={handleConfirm}
        onSearch={() => setSuggestion(noSuggestion)}
        readOnly={!!drug}
        // While the prompt is up it sits directly under the field, where the
        // options list would be drawn over it. Typing clears the prompt, and
        // the list comes back with it.
        suppressOptions={!!suggestion.suggested}
      />
      {suggestion.suggested && (
        <div className={styles.suggestion}>
          <Text size="1">{`Did you mean ${suggestion.suggested}?`}</Text>
          <Flex gap="2" mt="1" wrap="wrap">
            <Button
              size="1"
              onClick={() =>
                addMedication(suggestion.suggested, { andMoveToAmount: true })
              }
            >
              {`Use ${suggestion.suggested}`}
            </Button>
            <Button
              size="1"
              variant="outline"
              onClick={() =>
                addMedication(suggestion.typed, { andMoveToAmount: true })
              }
            >
              {`Keep "${suggestion.typed}"`}
            </Button>
          </Flex>
        </div>
      )}
    </div>
  );
};
