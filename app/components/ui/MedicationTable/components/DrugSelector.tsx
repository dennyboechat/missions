"use client";

// Components
import { Autocomplete } from "../../Autocomplete";

// Utils
import { getMostCommonDentalDrugs } from "../../../../utils/getMostCommonDentalDrugs";
import { getNewMedicationRecord } from "../utils/getNewMedicationRecord";

// Types
import { DrugSelectorProps } from "../types/DrugSelectorProps";
import { FocusEvent } from "react";

// Database
import { insertPatientDentistryMedication } from "../../../../database/patient-dentistry-medication/InsertPatientDentistryMedication";

// Hooks
import { usePopupMessage } from "../../../../lib/PopupMessage";

export const DrugSelector = ({
  patientDentistryId,
  drug,
  medications,
  setMedications,
}: DrugSelectorProps) => {
  const { setMessage } = usePopupMessage();

  const handleBlur = async (e: FocusEvent<HTMLInputElement>) => {
    if (drug) {
      return;
    }
    const medication = e.target.value;
    const updatedMedications = [...medications];

    if (medication) {
      const insertedMedication = await insertPatientDentistryMedication({
        patientDentistryId,
        medication: {
          drug: medication,
        },
      });

      if (insertedMedication) {
        const lastIndex = updatedMedications.length - 1;
        updatedMedications[lastIndex] = {
          ...updatedMedications[lastIndex],
          drug: medication,
          medicationUid:
            insertedMedication.patientDentistryPrescribedMedicationId,
        };

        if (setMessage) {
          setMessage("Saved");
        }
      } else {
        console.error("Error to insert drug to dental prescribed medications.");
      }

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
