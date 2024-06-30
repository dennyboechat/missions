"use client";

// Components
import { Grid } from "@radix-ui/themes";
import { InputTextField } from "../../../components/ui/InputTextField";

// Types
import { PatientPersonalFieldsProps } from "../types/PatientPersonalFieldsProps";

// Hooks
import { useState } from "react";
import { usePopupMessage } from "../../../lib/PopupMessage";

// Utils
import { isValidFullName } from "../utils/isValidFullName";

// Database
import { updatePatientPersonal } from "../../../database/patient-personal/UpdatePatientPersonal";

export const PatientPersonalFields = ({
  patientPersonalFields,
  setPatientPersonalFields,
}: PatientPersonalFieldsProps) => {
  const { setMessage } = usePopupMessage();
  const [isFullNameInvalid, setIsFullNameInvalid] = useState(false);
  const { patientPersonalId, patientFullName } = patientPersonalFields;

  const onFieldChanged = async (e: React.FocusEvent<HTMLInputElement>) => {
    const isValidName = isValidFullName({ fullName: e.target.value });
    setIsFullNameInvalid(!isValidName);
    
    const newValue = e.target.value;

    if (isValidName && patientFullName !== newValue) {
      const updatedPatientPerson = await updatePatientPersonal({
        patientPersonalId,
        field: "patient_full_name",
        value: newValue,
      });

      setPatientPersonalFields(updatedPatientPerson);

      if (setMessage) {
        setMessage("Saved");
      }
    }
  };

  return (
    <Grid gap="10px" width={{ xs: "auto", sm: "500px" }}>
      <InputTextField
        label="Full name"
        value={patientFullName}
        autoFocus
        required
        onBlur={(e) => onFieldChanged(e)}
        errorMessage={isFullNameInvalid ? "Required field" : ""}
      />
    </Grid>
  );
};
