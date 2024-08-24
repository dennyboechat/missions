"use client";

// Components
import { Autocomplete } from "../../Autocomplete";

// Utils
import { getMostCommonDentalDrugs } from "../../../../utils/getMostCommonDentalDrugs";
import { getNewMedicationRecord } from "../utils/getNewMedicationRecord";

// Types
import { DrugSelectorProps } from "../types/DrugSelectorProps";
import { FocusEvent } from "react";

export const DrugSelector = ({
  drug,
  medications,
  setMedications,
}: DrugSelectorProps) => {
  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    if (drug) {
      return;
    }
    const medication = e.target.value;
    const updatedMedications = [...medications];

    const lastIndex = updatedMedications.length - 1;
    updatedMedications[lastIndex] = {
      ...updatedMedications[lastIndex],
      drug: medication,
    };

    if (medication) {
      updatedMedications.push(getNewMedicationRecord());
    }

    setMedications(updatedMedications);
  };

  return (
    <Autocomplete
      items={getMostCommonDentalDrugs()}
      onBlur={handleBlur}
      readOnly={!!drug}
    />
  );
};
