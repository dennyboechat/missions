"use client";

// Components
import { Container, Heading, Link } from "@radix-ui/themes";
import { SideMenuLayout } from "../../components/ui/SideMenuLayout";
import { ProjectMenuItems } from "../../components/ui/ProjectMenuItems";

const ProjectPatients = ({ params }: { params: { id: string } }) => {
  const { id: projectId } = params;
  const projectMenuItems = <ProjectMenuItems projectId={projectId} activeMenuItem="project-patients" />;

  return (
    <SideMenuLayout menuItems={projectMenuItems}>
      <Container>
        <Heading>Patients</Heading>
        <Link href="/dashboard">{"< Dashboard"}</Link>
      </Container>
    </SideMenuLayout>
  );
};

export default ProjectPatients;
