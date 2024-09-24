"use client";

// Components
import { Container, Button } from "@radix-ui/themes";
import { SideMenuLayout } from "../../ui/SideMenuLayout";
import { ProjectMenuItems } from "../../ProjectMenuItems";
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
import { usePopupMessage } from "../../../lib/PopupMessage";

// Database
import { insertAppUser } from "../../../database/app-user/InsertAppUser";
import { getAppUser } from "../../../database/app-user/GetAppUser";
import { insertProjectUser } from "../../../database/project-user/InsertProjectUser";

// Utils
import { isValidEmail } from "../../../utils/isValidEmail";
import { isValidProjectUserName } from "../utils/isValidProjectUserName";

export const ProjectUser = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { project } = useProject();
  const { setMessage } = usePopupMessage();
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

  const { id: projectId } = params;

  const projectMenuItems = (
    <ProjectMenuItems projectId={projectId} activeMenuItem="project-users" />
  );

  const onConfirmButtonClick = async () => {
    setIsCreatingUser(true);

    const { userName, userEmail } = projectUserFields;

    const isValidUserName = isValidProjectUserName({ userName });
    setIsProjectUserNameInvalid(!isValidUserName);

    const isValidUserEmail = userEmail?.trim().length > 0 && isValidEmail(userEmail);
    setIsProjectUserEmailInvalid(!isValidUserEmail);

    if (isValidUserName && isValidUserEmail) {
      const newUser = await insertAppUser({
        userName,
        userEmail,
      });

      let newUserId;
      if (newUser) {
        newUserId = newUser.userId;
      } else {
        const existingAppUser = await getAppUser({
          field: "user_email",
          value: userEmail,
        });
        newUserId = existingAppUser?.userId;
      }

      if (!newUserId) {
        console.error("Error to add project user");
        return;
      }

      await insertProjectUser({ projectId, userId: newUserId });

      if (setMessage) {
        setMessage("Saved");
      }

      router.push(`/project-users/${projectId}`);
    } else {
      setIsCreatingUser(false);
    }
  };

  return (
    <SideMenuLayout
      menuItems={projectMenuItems}
      header={project?.projectName ?? ""}
    >
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
    </SideMenuLayout>
  );
};
