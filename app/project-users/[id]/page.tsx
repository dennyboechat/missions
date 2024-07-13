"use client";

// Components
import { Container, Table, Switch } from "@radix-ui/themes";
import { SideMenuLayout } from "../../components/ui/SideMenuLayout";
import { ProjectMenuItems } from "../../components/ProjectMenuItems";
import { ContentHeader } from "../../components/ContentHeader";
import { DataTable } from "../../components/ui/DataTable";

// Styles
import styles from "../../styles/content.module.css";

// Hooks
import { useProject } from "../../lib/ProjectContext";
import { useState, useEffect } from "react";
import { usePopupMessage } from "../../lib/PopupMessage";

// Database
import { getProjectUsers } from "../../database/project-user/GetProjectUsers";
import { updateProjectUser } from "../../database/project-user/UpdateProjectUser";

// Types
import { ProjectUser } from "../../types/ProjectUserTypes";
import { ProjectUserId } from "../../types/ProjectUserTypes";

// Utils
import { getFilteredProjectUsers } from "../../utils/getFilteredProjectUsers";

const ProjectUsers = ({ params }: { params: { id: string } }) => {
  const { project } = useProject();
  const { setMessage } = usePopupMessage();
  const [projectUsers, setProjectUsers] = useState<ProjectUser[]>([]);
  const [searchText, setSearchText] = useState<string | undefined>();

  const { id: projectId } = params;
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
      await updateProjectUser({
        projectUserId,
        isUserActive: isUserActive,
      });

      if (setMessage) {
        setMessage("Saved");
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
