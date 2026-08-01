"use client";

// Components
import { Select } from "@radix-ui/themes";

// Types
import { DoseProps } from "../types/DoseProps";
import { Medication } from "../../../../types/Medication";

// Hooks
import { useSaveField } from "../../../../lib/useSaveField";

// Utils
import { parseDose } from "../../../../utils/parseDose";
import { formatDose } from "../../../../utils/formatDose";
import { getDoseUnits } from "../../../../utils/getDoseUnits";

// A select cannot hold an empty value, and "no unit" has to stay reachable for
// the doses that genuinely have none.
const noUnit = "none";

/**
 * The unit half of the dose. Picking from a fixed list is what stops the same
 * strength being recorded as "500", "500mg" and "500 mg".
 */
export const DoseUnitSelect = ({
  drug,
  dose,
  medicationUid,
  setMedications,
  updateMedication,
}: DoseProps) => {
  const { save } = useSaveField();
  const { amount, unit } = parseDose(dose);

  // A number with no unit is the ambiguity this column exists to remove, so the
  // field asks to be filled in rather than quietly settling on a default. Free
  // text such as "as needed" is left alone: it has no unit to give.
  const isUnitMissing = !unit && /^[0-9]/.test(amount);

  const onValueChange = async (selectedUnit: string) => {
    if (!drug || !medicationUid) {
      return;
    }

    const value = formatDose({
      amount,
      unit: selectedUnit === noUnit ? "" : selectedUnit,
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
    <Select.Root
      value={unit || noUnit}
      disabled={!drug}
      onValueChange={onValueChange}
    >
      <Select.Trigger
        color={isUnitMissing ? "red" : undefined}
        title={isUnitMissing ? "Pick the unit for this dose" : undefined}
        placeholder="Unit"
      />
      <Select.Content>
        <Select.Item value={noUnit}>{"--"}</Select.Item>
        {getDoseUnits().map((doseUnit) => (
          <Select.Item key={doseUnit} value={doseUnit}>
            {doseUnit}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
};
