"use client";

// Multivariate Dependencies
import { useState, FocusEvent, useEffect } from "react";

// Components
import { Grid } from "@radix-ui/themes";
import { InputTextField } from "../../ui/InputTextField";

// Types
import { ProjectUserFieldsProps } from "../types/ProjectUserFieldsProps";

// Utils
import { isValidEmail } from "../../../utils/isValidEmail";
import { isValidProjectUserName } from "../../ProjectUser/utils/isValidProjectUserName";

export const ProjectUserFields = ({
  projectUserFields,
  setProjectUserlFields,
  isProjectUserNameInvalid,
  isProjectUserEmailInvalid,
}: ProjectUserFieldsProps) => {
  const [isUserNameInvalid, setIsUserNameInvalid] = useState(
    isProjectUserNameInvalid
  );
  const [isUserEmailInvalid, setIsUserEmailInvalid] = useState(
    isProjectUserEmailInvalid
  );
  const { userName, userEmail } = projectUserFields;

  useEffect(() => {
    setIsUserNameInvalid(isProjectUserNameInvalid);
  }, [isProjectUserNameInvalid]);

  useEffect(() => {
    setIsUserEmailInvalid(isProjectUserEmailInvalid);
  }, [isProjectUserEmailInvalid]);

  const onUserNameChanged = async (e: FocusEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    const isValidUserName = isValidProjectUserName({ userName: newValue });
    setIsUserNameInvalid(!isValidUserName);

    setProjectUserlFields((prevFields) => {
      return {
        ...prevFields,
        userName: newValue,
      };
    });
  };

  const onUserEmailChanged = async (e: FocusEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    const isValidUserEmail =
      newValue.trim().length > 0 && isValidEmail(newValue);
    setIsUserEmailInvalid(!isValidUserEmail);

    setProjectUserlFields((prevFields) => {
      return {
        ...prevFields,
        userEmail: newValue,
      };
    });
  };

  return (
    <Grid gap="10px" width={{ xs: "auto", sm: "500px" }}>
      <InputTextField
        label="User name"
        value={userName}
        autoFocus
        required
        onBlur={(e) => onUserNameChanged(e)}
        errorMessage={isUserNameInvalid ? "Required field" : ""}
      />
      <InputTextField
        label="Email"
        value={userEmail}
        required
        onBlur={(e) => onUserEmailChanged(e)}
        errorMessage={isUserEmailInvalid ? "Required field" : ""}
      />
    </Grid>
  );
};
