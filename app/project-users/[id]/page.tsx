"use client";

// Components
import { Container, Heading, Link } from "@radix-ui/themes";
import { SideMenuLayout } from "../../components/ui/SideMenuLayout";
import { ProjectMenuItems } from "../../components/ui/ProjectMenuItems";

const ProjectUsers = ({ params }: { params: { id: string } }) => {
  const { id: projectId } = params;
  const projectMenuItems = <ProjectMenuItems projectId={projectId} activeMenuItem="project-users" />;

  return (
    <SideMenuLayout menuItems={projectMenuItems}>
      <Container>
        <Heading>Users</Heading>
        <Link href="/dashboard">{"< Dashboard"}</Link>
      </Container>
    </SideMenuLayout>
  );
};

export default ProjectUsers;