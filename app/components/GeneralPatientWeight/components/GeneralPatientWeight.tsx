"use client";

// Components
import { InputTextField } from "../../ui/InputTextField";

// Types
import { FocusEvent } from "react";
import { GeneralPatientWeightProps } from "../types/GeneralPatientWeightProps";
import { PatientGeneralTypes } from "@/app/types/PatientGeneralTypes";

// Hooks
import { usePopupMessage } from "../../../lib/PopupMessage";
import { useState } from "react";

// Database
import { updatePatientGeneral } from "../../../database/patient-general/UpdatePatientGeneral";

// Utils
import { isPatientWeightValid } from "../utils/isPatientWeightValid";

export const GeneralPatientWeight = ({
  patientGeneralId,
  patientWeight,
  setPatientGeneral
}: GeneralPatientWeightProps) => {
  const { setMessage } = usePopupMessage();
  const [isWeightInvalid, setIsWeightInvalid] = useState(false);

  const handleBlur = async (e: FocusEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const value = rawValue === "" ? undefined : Number(rawValue);
    const previousQuantity = patientWeight ? Number(patientWeight) : undefined;

    if (previousQuantity === value) {
      return;
    }

    const isWeightValid = !value || isPatientWeightValid(value);
    setIsWeightInvalid(!isWeightValid);

    if (isWeightValid) {
      setPatientGeneral(
        (prevState: PatientGeneralTypes[] | undefined) =>
          prevState?.map((existingPatientGeneral) =>
            existingPatientGeneral.patientGeneralId ===
            patientGeneralId
              ? { ...existingPatientGeneral, patientHeight: value }
              : existingPatientGeneral
          )
      );

      const updatedPatientGeneral = await updatePatientGeneral({
        patientGeneralId,
        field: "patient_weight",
        value,
      });

      if (updatedPatientGeneral && setMessage) {
        setMessage("Saved");
      }
    }
  };

  return (
    <InputTextField
      label="Weight (in kg)"
      value={patientWeight}
      onBlur={handleBlur}
      type="number"
      max={180}
      min={0}
      errorMessage={isWeightInvalid ? "Invalid" : ""}
      suffix="kg"
    />
  );
};
