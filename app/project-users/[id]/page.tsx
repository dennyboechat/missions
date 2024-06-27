"use client";

// Components
import { Container, Table, Link } from "@radix-ui/themes";
import { SideMenuLayout } from "../../components/ui/SideMenuLayout";
import { ProjectMenuItems } from "../../components/ui/ProjectMenuItems";
import { ContentHeader } from "../../components/ui/ContentHeader";

// Styles
import styles from "../../styles/content.module.css";

// Hooks
import { useProject } from "../../lib/ProjectContext";
import { useState, useEffect } from "react";

// Database
import { getProjectUsers } from "../../database/project-user/GetProjectUsers";

// Types
import { ProjectUser } from "../../types/ProjectUserTypes";

const ProjectUsers = ({ params }: { params: { id: string } }) => {
  const { project } = useProject();
  const [projectUsers, setProjectUsers] = useState<ProjectUser[]>([]);

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

  return (
    <SideMenuLayout
      menuItems={projectMenuItems}
      header={project?.projectName ?? ""}
    >
      <Container className={styles.content}>
        <ContentHeader text="Users" />
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Active</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {projectUsers.map(
              ({ projectUserId, userName, userEmail, isUserActive }) => (
                <Table.Row key={projectUserId}>
                  <Table.RowHeaderCell>{userName}</Table.RowHeaderCell>
                  <Table.Cell>{userEmail}</Table.Cell>
                  <Table.Cell>
                    {isUserActive ? "Active" : "Inactive"}
                  </Table.Cell>
                </Table.Row>
              )
            )}
          </Table.Body>
        </Table.Root>
        <Link href="/dashboard">{"< Dashboard"}</Link>
      </Container>
    </SideMenuLayout>
  );
};

export default ProjectUsers;
