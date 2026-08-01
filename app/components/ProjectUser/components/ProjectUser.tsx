"use client";

// Components
import { Container, Button } from "@radix-ui/themes";
import { ContentHeader } from "../../ContentHeader";
import { ProjectUserFields } from "../../ProjectUserFields";
import { Space } from "../../ui/Space";

// Styles
import styles from "../../../styles/content.module.css";

// Types
import { ProjectUserFieldsTypes } from "../../../types/ProjectUserTypes";

// Hooks
import { useProject } from "../../../lib/ProjectContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSaveField } from "../../../lib/useSaveField";

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

  const onConfirmButtonClick = async () => {
    setIsCreatingUser(true);

    const { userName, userEmail } = projectUserFields;

    const isValidUserName = isValidProjectUserName({ userName });
    setIsProjectUserNameInvalid(!isValidUserName);

    const isValidUserEmail =
      userEmail?.trim().length > 0 && isValidEmail(userEmail);
    setIsProjectUserEmailInvalid(!isValidUserEmail);

    if (isValidUserName && isValidUserEmail) {
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
        const existingAppUser = actionData(
          await getAppUser({
            field: "user_email",
            value: userEmail,
          }),
        );
        newUserId = existingAppUser?.userId;
      }

      if (!newUserId) {
        console.error("Error to add project user");
        return;
      }

      const insertedProjectUser = await save(() =>
        insertProjectUser({ projectId: params.id, userId: newUserId }),
      );

      router.push(`/project-users/${params.id}`);
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
      <Space />
      <Button
        onClick={onConfirmButtonClick}
        disabled={isCreatingUser}
        variant="outline"
      >
        {"Confirm"}
      </Button>
    </Container>
  );
};
