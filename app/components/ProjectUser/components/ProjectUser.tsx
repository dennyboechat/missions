"use client";

// Components
import { Container, Button } from "@radix-ui/themes";
import { ContentHeader } from "../../ContentHeader";
import { ProjectUserFields } from "../../ProjectUserFields";
import { Space } from "../../ui/Space";
import { WarningContainer } from "../../ui/WarningContainer";

// Styles
import styles from "../../../styles/content.module.css";

// Types
import { ProjectUserFieldsTypes } from "../../../types/ProjectUserTypes";

// Hooks
import { useProject } from "../../../lib/ProjectContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSaveField } from "../../../lib/useSaveField";
import { usePopupMessage } from "../../../lib/PopupMessage";
import { useNewProjectUserChecks } from "../../../lib/useNewProjectUserChecks";

// Database
import { insertAppUser } from "../../../database/app-user/InsertAppUser";
import { getAppUser } from "../../../database/app-user/GetAppUser";
import { insertProjectUser } from "../../../database/project-user/InsertProjectUser";

// Utils
import { isValidEmail } from "../../../utils/isValidEmail";
import { isValidProjectUserName } from "../utils/isValidProjectUserName";

// Types
import { actionData } from "../../../types/ActionResult";

export const ProjectUser = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { project } = useProject();
  const { save } = useSaveField();
  const { setMessage, setMessageType } = usePopupMessage();
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const [isProjectUserNameInvalid, setIsProjectUserNameInvalid] =
    useState(false);
  const [isProjectUserEmailInvalid, setIsProjectUserEmailInvalid] =
    useState(false);
  const [projectUserFields, setProjectUserFields] =
    useState<ProjectUserFieldsTypes>({
      projectId: params.id,
      userName: "",
      userEmail: "",
    });

  // Speaks up as soon as a field is filled in, rather than making the user reach
  // the Confirm button to find out the name is taken or the person is already
  // here.
  const {
    duplicateWarnings,
    existingUserError,
    hasCheckedCurrentValues,
    runChecks,
  } = useNewProjectUserChecks({
    projectId: params.id,
    userName: projectUserFields.userName,
    userEmail: projectUserFields.userEmail,
  });

  const reportError = (message: string) => {
    if (setMessage && setMessageType) {
      setMessage(message);
      setMessageType("error");
    }
  };

  const onConfirmButtonClick = async () => {
    setIsCreatingUser(true);

    const { userName, userEmail } = projectUserFields;

    const isValidUserName = isValidProjectUserName({ userName });
    setIsProjectUserNameInvalid(!isValidUserName);

    const isValidUserEmail =
      userEmail?.trim().length > 0 && isValidEmail(userEmail);
    setIsProjectUserEmailInvalid(!isValidUserEmail);

    if (isValidUserName && isValidUserEmail) {
      // The form may have been filled in and confirmed faster than the lookups
      // could answer, which is the one way an add can get past a check that had
      // something to say. Only the error stops the click: a warning stops it once
      // -- long enough to be read -- and the button that comes back says
      // "Confirm anyway".
      if (!hasCheckedCurrentValues) {
        const { blocked, hasWarning } = await runChecks();

        if (blocked || hasWarning) {
          setIsCreatingUser(false);
          return;
        }
      }

      // Already answered, and the answer was that this person is here. The button
      // is disabled in that state, so this is the race where the lookup landed
      // between the render and the click.
      if (existingUserError) {
        setIsCreatingUser(false);
        return;
      }

      const newUser = actionData(
        await insertAppUser({
          userName,
          userEmail,
        }),
      );

      let newUserId;
      if (newUser) {
        newUserId = newUser.userId;
      } else {
        // Nothing was inserted, which normally means the address is already
        // registered -- the account the email warning above describes.
        const existingAppUser = actionData(
          await getAppUser({
            field: "user_email",
            value: userEmail,
          }),
        );
        newUserId = existingAppUser?.userId;
      }

      // No row and no existing account is a real failure. It used to return
      // here without clearing the flag, which left Confirm disabled for good
      // and gave the user nothing to read.
      if (!newUserId) {
        reportError("Error to add the user. Please try again.");
        setIsCreatingUser(false);
        return;
      }

      const insertedProjectUser = await save(
        () => insertProjectUser({ projectId: params.id, userId: newUserId }),
        {
          failureMessages: {
            invalid: "This user is already on this project.",
            error: "Error to add the user. Please try again.",
          },
        },
      );

      // Only leave the form once the user is actually on the project. This
      // used to navigate away regardless, so a failed add looked identical to
      // one that worked.
      if (insertedProjectUser) {
        router.push(`/project-users/${params.id}`);
      } else {
        setIsCreatingUser(false);
      }
    } else {
      setIsCreatingUser(false);
    }
  };

  return (
    <Container className={styles.content}>
      <ContentHeader text="New user" />
      <ProjectUserFields
        projectUserFields={projectUserFields}
        setProjectUserlFields={setProjectUserFields}
        isProjectUserNameInvalid={isProjectUserNameInvalid}
        isProjectUserEmailInvalid={isProjectUserEmailInvalid}
      />
      {existingUserError && (
        <div>
          <Space />
          <WarningContainer message={existingUserError} tone="error" />
        </div>
      )}
      {duplicateWarnings.map((duplicateWarning) => (
        <div key={duplicateWarning}>
          <Space />
          <WarningContainer message={duplicateWarning} />
        </div>
      ))}
      <Space />
      <Button
        onClick={onConfirmButtonClick}
        // Nothing to confirm while the error is up: the project already holds
        // this account, and the only way forward is a different address.
        disabled={isCreatingUser || existingUserError !== ""}
        variant="outline"
      >
        {duplicateWarnings.length > 0 ? "Confirm anyway" : "Confirm"}
      </Button>
    </Container>
  );
};
