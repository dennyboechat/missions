"use client";

// Components
import { Container, Table, Switch, Button } from "@radix-ui/themes";
import { SideMenuLayout } from "../../components/ui/SideMenuLayout";
import { ProjectMenuItems } from "../../components/ProjectMenuItems";
import { ContentHeader } from "../../components/ContentHeader";
import { DataTable } from "../../components/ui/DataTable";

// Styles
import styles from "../../styles/content.module.css";

// Hooks
import { useProject } from "../../lib/ProjectContext";
import { useState, useEffect, use } from "react";
import { usePopupMessage } from "../../lib/PopupMessage";
import { useRouter } from "next/navigation";

// Database
import { getProjectUsers } from "../../database/project-user/GetProjectUsers";
import { updateProjectUser } from "../../database/project-user/UpdateProjectUser";

// Types
import { ProjectUser } from "../../types/ProjectUserTypes";
import { ProjectUserId } from "../../types/ProjectUserTypes";

// Utils
import { getFilteredProjectUsers } from "../../utils/getFilteredProjectUsers";
import { runWithRetries } from "@/app/utils/runWithRetries";

const ProjectUsers = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: projectId } = use(params);
  const router = useRouter();
  const { project } = useProject();
  const { setMessage, setMessageType } = usePopupMessage();
  const [projectUsers, setProjectUsers] = useState<ProjectUser[]>([]);
  const [searchText, setSearchText] = useState<string | undefined>();
  const projectMenuItems = (
    <ProjectMenuItems projectId={projectId} activeMenuItem="project-users" />
  );

  useEffect(() => {
    const fetchProjects = async () => {
      if (project) {
        const projectUsersData = await getProjectUsers({
          projectId: project.projectId,
        });
        setProjectUsers(projectUsersData ?? []);
      }
    };

    fetchProjects();
  }, [project]);

  const onActiveUserSwitchClick = async ({
    projectUserId,
    isUserActive,
  }: {
    projectUserId: ProjectUserId;
    isUserActive: boolean;
  }) => {
    if (project) {
      const codeToRun = async () => {
        const updatedProjectUser = await updateProjectUser({
          projectUserId,
          isUserActive: isUserActive,
        });

        if (setMessage && setMessageType) {
          if (updatedProjectUser) {
            setMessage("Saved");
            setMessageType("regular");
          } else {
            setMessage("Error to save. Please try again.");
            setMessageType("error");
          }
        }
      };

      const runSuccess = await runWithRetries(codeToRun);
      if (!runSuccess && setMessage && setMessageType) {
        setMessage("Error to save. Please try again.");
        setMessageType("error");
      }
    }
  };

  const tableHeader = (
    <Table.Row>
      <Table.ColumnHeaderCell>{"Name"}</Table.ColumnHeaderCell>
      <Table.ColumnHeaderCell>{"Email"}</Table.ColumnHeaderCell>
      <Table.ColumnHeaderCell>{"Active"}</Table.ColumnHeaderCell>
    </Table.Row>
  );

  const filteredProjectUsers = getFilteredProjectUsers({
    projectUsers,
    filterText: searchText,
  });

  return (
    <SideMenuLayout
      menuItems={projectMenuItems}
      header={project?.projectName ?? ""}
    >
      <Container className={styles.content}>
        <ContentHeader
          text="Users"
          subText="All users who have access to this project."
        />
        <Button
          onClick={() => {
            router.push(`/project-user/${projectId}`);
          }}
        >
          {"Add user"}
        </Button>
        <DataTable
          tableHeader={tableHeader}
          onSearchTextChange={(text) => setSearchText(text)}
          isSearchAutoFocus
          records={filteredProjectUsers}
        >
          {filteredProjectUsers.map(
            ({ projectUserId, userName, userEmail, isUserActive }) => (
              <Table.Row key={projectUserId}>
                <Table.RowHeaderCell>{userName}</Table.RowHeaderCell>
                <Table.Cell>{userEmail}</Table.Cell>
                <Table.Cell>
                  <Switch
                    defaultChecked={isUserActive}
                    onCheckedChange={(checked) =>
                      onActiveUserSwitchClick({
                        projectUserId,
                        isUserActive: checked,
                      })
                    }
                  />
                </Table.Cell>
              </Table.Row>
            )
          )}
        </DataTable>
      </Container>
    </SideMenuLayout>
  );
};

export default ProjectUsers;
