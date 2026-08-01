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
import { useDuplicateUserWarnings } from "../../../lib/useDuplicateUserWarnings";

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

  // Warns as soon as a field is filled in, rather than making the user reach
  // the Confirm button to find out the name is taken or the email is somebody
  // else's account.
  const { duplicateWarnings, hasCheckedCurrentValues, checkForDuplicates } =
    useDuplicateUserWarnings({
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
      // could answer. Adding the wrong person without the warning ever
      // appearing is the case this guards against; once a warning is on screen
      // the user has seen it and this click goes through.
      if (!hasCheckedCurrentValues && (await checkForDuplicates())) {
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
      {duplicateWarnings.map((duplicateWarning) => (
        <div key={duplicateWarning}>
          <Space />
          <WarningContainer message={duplicateWarning} />
        </div>
      ))}
      <Space />
      <Button
        onClick={onConfirmButtonClick}
        disabled={isCreatingUser}
        variant="outline"
      >
        {duplicateWarnings.length > 0 ? "Confirm anyway" : "Confirm"}
      </Button>
    </Container>
  );
};
