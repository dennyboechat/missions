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
  insertMedication,
}: DrugSelectorProps) => {
  const handleBlur = async (e: FocusEvent<HTMLInputElement>) => {
    if (drug) {
      return;
    }
    const medication = e.target.value;
    const updatedMedications = [...medications];

    if (medication) {
      await insertMedication(medication, updatedMedications);
      updatedMedications.push(getNewMedicationRecord());
    }

    setMedications(updatedMedications);
  };

  return (
    <Autocomplete
      value={drug}
      items={getMostCommonDentalDrugs()}
      onBlur={handleBlur}
      readOnly={!!drug}
    />
  );
};
