"use client";

// Components
import { TextField } from "@radix-ui/themes";

// Types
import { DoseAmountProps } from "../types/DoseAmountProps";
import { Medication } from "../../../../types/Medication";
import { FocusEvent } from "react";

// Hooks
import { useSaveField } from "../../../../lib/useSaveField";

// Utils
import { parseDose } from "../../../../utils/parseDose";
import { formatDose } from "../../../../utils/formatDose";
import { getDoseAmountInputId } from "../utils/getDoseAmountInputId";

/**
 * The amount half of the dose.
 *
 * A unit typed in here rather than picked -- the "500mg" habit -- is split off
 * and moved to the unit column, so what reaches the database is canonical
 * either way and the field redraws showing just the number.
 */
export const DoseAmountInput = ({
  rowId,
  drug,
  dose,
  medicationUid,
  setMedications,
  updateMedication,
}: DoseAmountProps) => {
  const { save } = useSaveField();
  const { amount, unit } = parseDose(dose);

  const handleBlur = async (e: FocusEvent<HTMLInputElement>) => {
    if (!drug || !medicationUid) {
      return;
    }

    const typed = parseDose(e.target.value);
    const value = formatDose({
      amount: typed.amount,
      unit: typed.unit || unit,
    });

    if (dose === value) {
      return;
    }

    setMedications((prevMedications: Medication[]) =>
      prevMedications.map((medication) =>
        medication.medicationUid === medicationUid
          ? { ...medication, dose: value }
          : medication
      )
    );

    await save(() => updateMedication(medicationUid, "dose", value));
  };

  return (
    <TextField.Root
      // Remounts when the stored amount changes, so a "500mg" that was split
      // into its two halves shows as "500" instead of what was typed.
      key={amount}
      id={getDoseAmountInputId(rowId)}
      defaultValue={amount}
      inputMode="decimal"
      maxLength={255}
      placeholder="500"
      onBlur={handleBlur}
      readOnly={!drug}
    />
  );
};
