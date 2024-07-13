"use client";

// Components
import { Grid, RadioGroup } from "@radix-ui/themes";
import { InputTextField } from "../../ui/InputTextField";
import { RadioField } from "../../ui/RadioField";
import { DateTime } from "../../ui/DateTime";

// Types
import { PatientPersonalFieldsProps } from "../types/PatientPersonalFieldsProps";

// Hooks
import { useState } from "react";
import { usePopupMessage } from "../../../lib/PopupMessage";

// Utils
import { isValidFullName } from "../utils/isValidFullName";
import { getFormattedDate } from "../../../utils/getFormattedDate";
import { getCurrentDate } from "../../../utils/getCurrentDate";

// Database
import { updatePatientPersonal } from "../../../database/patient-personal/UpdatePatientPersonal";

export const PatientPersonalFields = ({
  patientPersonalFields,
  setPatientPersonalFields,
  isPatientFullNameInvalid,
  isPatientGenderInvalid,
  isPatientDateOfBirthInvalid,
}: PatientPersonalFieldsProps) => {
  const [dateOfBirth, setDateOfBirth] = useState(
    getFormattedDate(patientPersonalFields.patientDateOfBirth)
  );
  const { setMessage } = usePopupMessage();
  const [isFullNameInvalid, setIsFullNameInvalid] = useState(
    isPatientFullNameInvalid
  );

  const { patientPersonalId, patientFullName, isPatientMale } =
    patientPersonalFields;

  const onFullNameChanged = async (e: React.FocusEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    const isValidName = isValidFullName({ fullName: newValue });
    setIsFullNameInvalid(!isValidName);

    if (isValidName) {
      if (patientPersonalId && patientFullName !== newValue) {
        const updatedPatientPerson = await updatePatientPersonal({
          patientPersonalId,
          field: "patient_full_name",
          value: newValue,
        });

        if (updatedPatientPerson) {
          setPatientPersonalFields(updatedPatientPerson);

          if (setMessage) {
            setMessage("Saved");
          }
        } else {
          console.error(
            `Could not update patient full name by id ${patientPersonalId}`
          );
        }
      } else {
        setPatientPersonalFields((prevFields) => {
          return {
            ...prevFields,
            patientFullName: newValue,
          };
        });
      }
    }
  };

  const genderItems = (
    <>
      <RadioGroup.Item value="male">{"Male"}</RadioGroup.Item>
      <RadioGroup.Item value="female">{"Female"}</RadioGroup.Item>
    </>
  );

  const patientGender =
    isPatientMale === undefined ? undefined : isPatientMale ? "male" : "female";

  const onGenderChange = async (value: string) => {
    const isMale = value === "male";

    if (patientPersonalId) {
      const updatedPatientPerson = await updatePatientPersonal({
        patientPersonalId,
        field: "is_patient_male",
        value: isMale,
      });

      if (updatedPatientPerson) {
        setPatientPersonalFields(updatedPatientPerson);

        if (setMessage) {
          setMessage("Saved");
        }
      } else {
        console.error(
          `Could not update patient gender by id ${patientPersonalId}`
        );
      }
    } else {
      setPatientPersonalFields((prevFields) => {
        return {
          ...prevFields,
          isPatientMale: isMale,
        };
      });
    }
  };

  const onDateOfBirthChange = async () => {
    if (patientPersonalId) {
      const updatedPatientPerson = await updatePatientPersonal({
        patientPersonalId,
        field: "patient_date_of_birth",
        value: dateOfBirth,
      });

      if (updatedPatientPerson) {
        setPatientPersonalFields(updatedPatientPerson);

        if (setMessage) {
          setMessage("Saved");
        }
      } else {
        console.error(
          `Could not update patient date of birth by id ${patientPersonalId}`
        );
      }
    } else {
      const dateValue = new Date(dateOfBirth);

      setPatientPersonalFields((prevFields) => {
        return {
          ...prevFields,
          patientDateOfBirth: dateValue,
        };
      });
    }
  };

  return (
    <Grid gap="10px" width={{ xs: "auto", sm: "500px" }}>
      <InputTextField
        label="Full name"
        value={patientFullName}
        autoFocus
        required
        onBlur={(e) => onFullNameChanged(e)}
        errorMessage={isFullNameInvalid ? "Required field" : ""}
      />
      <RadioField
        name="gender"
        label="Gender"
        items={genderItems}
        value={patientGender}
        onChange={(value) => onGenderChange(value)}
        required
        errorMessage={isPatientGenderInvalid ? "Required field" : ""}
      />
      <DateTime
        label="Date of birth"
        value={dateOfBirth}
        maxDate={getCurrentDate()}
        onChange={(value) => setDateOfBirth(value)}
        onBlur={onDateOfBirthChange}
        required
        errorMessage={isPatientDateOfBirthInvalid ? "Required field" : ""}
      />
    </Grid>
  );
};
