"use client";

// Components
import { Grid, RadioGroup } from "@radix-ui/themes";
import { InputTextField } from "../../ui/InputTextField";
import { RadioField } from "../../ui/RadioField";

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
  const { patientPersonalId, patientFullName, isPatientMale } =
    patientPersonalFields;

  const onFieldChanged = async (e: React.FocusEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    const isValidName = isValidFullName({ fullName: newValue });
    setIsFullNameInvalid(!isValidName);

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

  const genderItems = (
    <>
      <RadioGroup.Item value="male">{"Male"}</RadioGroup.Item>
      <RadioGroup.Item value="female">{"Female"}</RadioGroup.Item>
    </>
  );

  const patientGender = isPatientMale ? "male" : "female";

  const onPatientGenderChange = async (value: string) => {
    const updatedPatientPerson = await updatePatientPersonal({
      patientPersonalId,
      field: "is_patient_male",
      value: value === 'male',
    });

    setPatientPersonalFields(updatedPatientPerson);

    if (setMessage) {
      setMessage("Saved");
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
      <RadioField
        name="gender"
        label="Gender"
        items={genderItems}
        value={patientGender}
        onChange={(value) => onPatientGenderChange(value)}
        required
      />
    </Grid>
  );
};
