"use client";

// Multivariate Dependencies
import { useState, FocusEvent } from "react";

// Components
import { Grid, RadioGroup } from "@radix-ui/themes";
import { InputTextField } from "../../ui/InputTextField";
import { RadioField } from "../../ui/RadioField";
import { DateTime } from "../../ui/DateTime";

// Types
import { PatientPersonalFieldsProps } from "../types/PatientPersonalFieldsProps";

// Hooks
import { usePopupMessage } from "../../../lib/PopupMessage";

// Utils
import { isValidFullName } from "../utils/isValidFullName";
import { getCurrentDateTime } from "../../../utils/getCurrentDateTime";
import { isValidDate } from "../../../utils/isValidDate";
import { runWithRetries } from "@/app/utils/runWithRetries";

// Database
import { updatePatientPersonal } from "../../../database/patient-personal/UpdatePatientPersonal";
import { getYearFormattedDate } from "@/app/utils/getYearFormattedDate";

export const PatientPersonalFields = ({
  patientPersonalFields,
  setPatientPersonalFields,
  isPatientFullNameInvalid,
  isPatientGenderInvalid,
  isPatientDateOfBirthInvalid,
}: PatientPersonalFieldsProps) => {
  const [dateOfBirth, setDateOfBirth] = useState(
    getYearFormattedDate(patientPersonalFields.patientDateOfBirth)
  );
  const { setMessage, setMessageType } = usePopupMessage();
  const [isFullNameInvalid, setIsFullNameInvalid] = useState(
    isPatientFullNameInvalid
  );

  const {
    patientPersonalId,
    patientFullName,
    isPatientMale,
    patientPhoneNumber,
  } = patientPersonalFields;

  const onFullNameChanged = async (e: FocusEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    const isValidName = isValidFullName({ fullName: newValue });
    setIsFullNameInvalid(!isValidName);

    if (isValidName) {
      if (patientPersonalId && patientFullName !== newValue) {
        const codeToRun = async () => {
          const updatedPatientPerson = await updatePatientPersonal({
            patientPersonalId,
            field: "patient_full_name",
            value: newValue,
          });

          if (updatedPatientPerson) {
            setPatientPersonalFields(updatedPatientPerson);

            if (setMessage && setMessageType) {
              setMessage("Saved");
              setMessageType("regular");
            }
          } else {
            if (setMessage && setMessageType) {
              setMessage("Error to save. Please try again.");
              setMessageType("error");
            }

            console.error(
              `Could not update patient full name by id ${patientPersonalId}`
            );
          }
        };

        const runSuccess = await runWithRetries(codeToRun);
        if (!runSuccess && setMessage && setMessageType) {
          setMessage("Error to save. Please try again.");
          setMessageType("error");
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
      const codeToRun = async () => {
        const updatedPatientPerson = await updatePatientPersonal({
          patientPersonalId,
          field: "is_patient_male",
          value: isMale,
        });

        if (updatedPatientPerson) {
          setPatientPersonalFields(updatedPatientPerson);

          if (setMessage && setMessageType) {
            setMessage("Saved");
            setMessageType("regular");
          }
        } else {
          if (setMessage && setMessageType) {
            setMessage("Error to save. Please try again.");
            setMessageType("error");
          }

          console.error(
            `Could not update patient gender by id ${patientPersonalId}`
          );
        }
      };

      const runSuccess = await runWithRetries(codeToRun);
      if (!runSuccess && setMessage && setMessageType) {
        setMessage("Error to save. Please try again.");
        setMessageType("error");
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
      const codeToRun = async () => {
        const updatedPatientPerson = await updatePatientPersonal({
          patientPersonalId,
          field: "patient_date_of_birth",
          value: dateOfBirth,
        });

        if (updatedPatientPerson) {
          setPatientPersonalFields(updatedPatientPerson);

          if (setMessage && setMessageType) {
            setMessage("Saved");
            setMessageType("regular");
          }
        } else {
          if (setMessage && setMessageType) {
            setMessage("Error to save. Please try again.");
            setMessageType("error");
          }

          console.error(
            `Could not update patient date of birth by id ${patientPersonalId}`
          );
        }
      };

      const runSuccess = await runWithRetries(codeToRun);
      if (!runSuccess && setMessage && setMessageType) {
        setMessage("Error to save. Please try again.");
        setMessageType("error");
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

  const onPhoneNumberChanged = async (e: FocusEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (patientPersonalId && patientPhoneNumber !== newValue) {
      const codeToRun = async () => {
        const updatedPatientPerson = await updatePatientPersonal({
          patientPersonalId,
          field: "patient_phone_number",
          value: newValue,
        });

        if (updatedPatientPerson) {
          setPatientPersonalFields(updatedPatientPerson);

          if (setMessage && setMessageType) {
            setMessage("Saved");
            setMessageType("regular");
          }
        } else {
          if (setMessage && setMessageType) {
            setMessage("Error to save phone number. Please try again.");
            setMessageType("error");
          }

          console.error(
            `Could not update patient phone number by id ${patientPersonalId}`
          );
        }
      };

      const runSuccess = await runWithRetries(codeToRun);
      if (!runSuccess && setMessage && setMessageType) {
        setMessage("Error to save phone number. Please try again.");
        setMessageType("error");
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
