"use client";

// Components
import { Container, Heading, Link } from "@radix-ui/themes";
import { SideMenuLayout } from "../../components/ui/SideMenuLayout";
import { ProjectMenuItems } from "../../components/ui/ProjectMenuItems";
import { ProjectHeader } from "../../components/ui/ProjectHeader";

// Styles
import styles from "../../styles/content.module.css";

const ProjectUsers = ({ params }: { params: { id: string } }) => {
  const { id: projectId } = params;
  const projectMenuItems = (
    <ProjectMenuItems projectId={projectId} activeMenuItem="project-users" />
  );
  const projectHeader = <ProjectHeader />;

  return (
    <SideMenuLayout menuItems={projectMenuItems} header={projectHeader}>
      <Container className={styles.content}>
        <Heading>Users</Heading>
        <Link href="/dashboard">{"< Dashboard"}</Link>
      </Container>
    </SideMenuLayout>
  );
};

export default ProjectUsers;
