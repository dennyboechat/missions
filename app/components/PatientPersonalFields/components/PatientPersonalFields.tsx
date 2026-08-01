"use client";

// Multivariate Dependencies
import { useState, FocusEvent } from "react";

// Components
import { Grid, RadioGroup } from "@radix-ui/themes";
import { InputTextField } from "../../ui/InputTextField";
import { RadioField } from "../../ui/RadioField";
import { DateTime } from "../../ui/DateTime";
import { WarningContainer } from "../../ui/WarningContainer";

// Types
import { PatientPersonalFieldsProps } from "../types/PatientPersonalFieldsProps";

// Hooks
import { useSaveField } from "../../../lib/useSaveField";
import { useDuplicatePatientWarning } from "../../../lib/useDuplicatePatientWarning";

// Utils
import { isValidFullName } from "../utils/isValidFullName";
import { getCurrentDateTime } from "../../../utils/getCurrentDateTime";
import { isValidDate } from "../../../utils/isValidDate";

// Database
import { updatePatientPersonal } from "../../../database/patient-personal/UpdatePatientPersonal";


export const PatientPersonalFields = ({
  patientPersonalFields,
  setPatientPersonalFields,
  isPatientFullNameInvalid,
  isPatientGenderInvalid,
  isPatientDateOfBirthInvalid,
}: PatientPersonalFieldsProps) => {
  // Already YYYY-MM-DD, which is exactly what <input type="date"> expects.
  const [dateOfBirth, setDateOfBirth] = useState(
    patientPersonalFields.patientDateOfBirth ?? ""
  );
  const { save } = useSaveField();
  const [isFullNameInvalid, setIsFullNameInvalid] = useState(
    isPatientFullNameInvalid
  );

  const {
    patientPersonalId,
    projectId,
    patientFullName,
    isPatientMale,
    patientPhoneNumber,
  } = patientPersonalFields;

  // Renaming an existing patient onto a name the project already holds saves
  // straight away, like every other field here, so the warning reports what
  // just happened rather than gating it. The new patient form runs its own
  // check before creating, and shows this one itself.
  const { duplicateWarning } = useDuplicatePatientWarning({
    projectId,
    patientFullName: patientPersonalId ? patientFullName : undefined,
    excludePatientPersonalId: patientPersonalId,
  });

  const onFullNameChanged = async (e: FocusEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    const isValidName = isValidFullName({ fullName: newValue });
    setIsFullNameInvalid(!isValidName);

    if (isValidName) {
      if (patientPersonalId && patientFullName !== newValue) {
        const updatedPatientPerson = await save(
          () => updatePatientPersonal({ patientPersonalId, field: "patient_full_name", value: newValue, })
        );

        if (updatedPatientPerson) {
            setPatientPersonalFields(updatedPatientPerson);
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
      const updatedPatientPerson = await save(
        () => updatePatientPersonal({ patientPersonalId, field: "is_patient_male", value: isMale, })
      );

      if (updatedPatientPerson) {
          setPatientPersonalFields(updatedPatientPerson);
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
    const isValidDateOfBirth = isValidDate(dateOfBirth);

    if (!isValidDateOfBirth) {
      return;
    }

    if (patientPersonalId) {
      const updatedPatientPerson = await save(
        () => updatePatientPersonal({ patientPersonalId, field: "patient_date_of_birth", value: dateOfBirth, })
      );

      if (updatedPatientPerson) {
          setPatientPersonalFields(updatedPatientPerson);
      }
    } else {
      setPatientPersonalFields((prevFields) => {
        return {
          ...prevFields,
          patientDateOfBirth: dateOfBirth,
        };
      });
    }
  };

  const onPhoneNumberChanged = async (e: FocusEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (patientPersonalId && patientPhoneNumber !== newValue) {
      const updatedPatientPerson = await save(
        () => updatePatientPersonal({ patientPersonalId, field: "patient_phone_number", value: newValue, }),
        { failureMessages: { error: "Error to save phone number. Please try again." } }
      );

      if (updatedPatientPerson) {
          setPatientPersonalFields(updatedPatientPerson);
      }
    } else {
      setPatientPersonalFields((prevFields) => {
        return {
          ...prevFields,
          patientPhoneNumber: newValue,
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
      {duplicateWarning && <WarningContainer message={duplicateWarning} />}
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
        maxDate={getCurrentDateTime()}
        onChange={(value) => setDateOfBirth(value)}
        onBlur={onDateOfBirthChange}
        required
        errorMessage={isPatientDateOfBirthInvalid ? "Required field" : ""}
      />
      <InputTextField
        label="Phone number"
        value={patientPhoneNumber}
        onBlur={onPhoneNumberChanged}
      />
    </Grid>
  );
};
