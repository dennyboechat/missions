"use client";

// Components
import { Container, Table, Switch, Button } from "@radix-ui/themes";
import { ContentHeader } from "../../../components/ContentHeader";
import { DataTable } from "../../../components/ui/DataTable";
import { Icon } from "../../../components/ui/Icon";

// Styles
import styles from "../../../styles/content.module.css";

// Hooks
import { useProject } from "../../../lib/ProjectContext";
import { useMemo, useState, useEffect, use } from "react";
import { useSaveField } from "../../../lib/useSaveField";
import { useRouter } from "next/navigation";

// Database
import { getProjectUsers } from "../../../database/project-user/GetProjectUsers";
import { updateProjectUser } from "../../../database/project-user/UpdateProjectUser";

// Types
import { ProjectUser } from "../../../types/ProjectUserTypes";
import { ProjectUserId } from "../../../types/ProjectUserTypes";

// Utils
import { getFilteredProjectUsers } from "../../../utils/getFilteredProjectUsers";

// Types
import { actionData } from "../../../types/ActionResult";

const ProjectUsers = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: projectId } = use(params);
  const router = useRouter();
  const { project } = useProject();
  const { save } = useSaveField();
  const [projectUsers, setProjectUsers] = useState<ProjectUser[]>([]);
  const [searchText, setSearchText] = useState<string | undefined>();
  // See the patient list: the project resolves after the route, so an
  // unanswered fetch must not read as an empty project.
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      if (project) {
        const projectUsersData = actionData(
          await getProjectUsers({
            projectId: project.projectId,
          }),
        );
        setProjectUsers(projectUsersData ?? []);
        setIsLoadingUsers(false);
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
      await save(() =>
        updateProjectUser({ projectUserId, isUserActive: isUserActive }),
      );
    }
  };

  const tableHeader = (
    <Table.Row>
      <Table.ColumnHeaderCell>{"Name"}</Table.ColumnHeaderCell>
      <Table.ColumnHeaderCell>{"Email"}</Table.ColumnHeaderCell>
      <Table.ColumnHeaderCell>{"Active"}</Table.ColumnHeaderCell>
    </Table.Row>
  );

  const filteredProjectUsers = useMemo(
    () => getFilteredProjectUsers({ projectUsers, filterText: searchText }),
    [projectUsers, searchText],
  );

  return (
    <Container className={styles.content}>
      <ContentHeader
        text="Users"
        subText="All users who have access to this project."
        actions={
          <Button
            onClick={() => {
              router.push(`/project-user/${projectId}`);
            }}
          >
            <Icon name="plus" size={17} />
            {"Add user"}
          </Button>
        }
      />
      <DataTable
        tableHeader={tableHeader}
        onSearchTextChange={(text) => setSearchText(text)}
        isSearchAutoFocus
        searchPlaceholder="Search by name or email..."
        records={filteredProjectUsers}
        isLoading={isLoadingUsers}
        noun="user"
        emptyTitle="No users match that search"
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
          ),
        )}
      </DataTable>
    </Container>
  );
};

export default ProjectUsers;
