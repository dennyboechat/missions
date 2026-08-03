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
import { useAppUser } from "../../../lib/AppUserContext";
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

// Said in two places -- on the disabled switch, and if the server is the one
// that refuses. The duplicate app_user rows this codebase already carries mean
// the client cannot always recognise the caller's own row, so the second path
// is reachable and has to explain itself just as well.
const SELF_EDIT_REFUSAL =
  "You cannot change your own access. Ask the project owner or another admin.";

const ProjectUsers = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: projectId } = use(params);
  const router = useRouter();
  const { project } = useProject();
  const { appUser } = useAppUser();
  const { save } = useSaveField();
  const [projectUsers, setProjectUsers] = useState<ProjectUser[]>([]);
  const [searchText, setSearchText] = useState<string | undefined>();
  // See the patient list: the project resolves after the route, so an
  // unanswered fetch must not read as an empty project.
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  // Bumped to re-read the list when a change was refused, so the switches go
  // back to showing what is actually stored rather than what was attempted.
  const [revision, setRevision] = useState(0);

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
  }, [project, revision]);

  // One handler for both switches: the action takes whichever flag it is given
  // and leaves the other alone, so a stale value from this page cannot ride
  // along and undo another admin's change.
  const onProjectUserChange = async (
    projectUserId: ProjectUserId,
    change: { isUserActive?: boolean; isUserAdmin?: boolean },
  ) => {
    if (!project) {
      return;
    }

    // Move the switch now rather than after the round trip, so the row reads
    // as it will be. Both switches are controlled, which is what lets the Admin
    // one grey itself out the moment someone is deactivated.
    setProjectUsers((users) =>
      users.map((user) =>
        user.projectUserId === projectUserId ? { ...user, ...change } : user,
      ),
    );

    const updated = await save(
      () => updateProjectUser({ projectUserId, ...change }),
      {
        failureMessages: {
          // The only way this action refuses as "invalid" is a self-edit, and
          // the generic wording would not say why the switch sprang back.
          invalid: SELF_EDIT_REFUSAL,
        },
      },
    );

    // Re-read on refusal rather than reverting from a captured copy: the server
    // is the authority, and another admin may have changed the same row while
    // this one was in flight.
    if (!updated) {
      setRevision((value) => value + 1);
    }
  };

  const tableHeader = (
    <Table.Row>
      <Table.ColumnHeaderCell>{"Name"}</Table.ColumnHeaderCell>
      <Table.ColumnHeaderCell>{"Email"}</Table.ColumnHeaderCell>
      <Table.ColumnHeaderCell>{"Active"}</Table.ColumnHeaderCell>
      <Table.ColumnHeaderCell>{"Admin"}</Table.ColumnHeaderCell>
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
        subText="All users who have access to this project. An admin can do everything the owner can except delete the project."
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
          ({ projectUserId, userId, userName, userEmail, isUserActive, isUserAdmin }) => {
            // Nobody switches off the access they are using. The action refuses
            // it too; this is so the reason is legible instead of arriving as a
            // failed save.
            const isSelf = userId === appUser?.userId;
            const selfTitle = isSelf ? SELF_EDIT_REFUSAL : undefined;

            return (
              <Table.Row key={projectUserId}>
                <Table.RowHeaderCell>{userName}</Table.RowHeaderCell>
                <Table.Cell>{userEmail}</Table.Cell>
                <Table.Cell>
                  <Switch
                    checked={isUserActive}
                    disabled={isSelf}
                    title={selfTitle}
                    onCheckedChange={(checked) =>
                      onProjectUserChange(projectUserId, {
                        isUserActive: checked,
                      })
                    }
                  />
                </Table.Cell>
                <Table.Cell>
                  <Switch
                    // Shows the rank the row actually carries, even when it is
                    // dormant: an inactive user has no access at all, and
                    // reactivating them restores whatever this says.
                    checked={isUserAdmin ?? false}
                    disabled={isSelf || !isUserActive}
                    title={
                      selfTitle ??
                      (!isUserActive
                        ? "Inactive users have no access. Reactivate to restore admin."
                        : undefined)
                    }
                    onCheckedChange={(checked) =>
                      onProjectUserChange(projectUserId, {
                        isUserAdmin: checked,
                      })
                    }
                  />
                </Table.Cell>
              </Table.Row>
            );
          },
        )}
      </DataTable>
    </Container>
  );
};

export default ProjectUsers;
