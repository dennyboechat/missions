"use client";

// Components
import { Container } from "@radix-ui/themes";
import { SideMenuLayout } from "../../components/ui/SideMenuLayout";
import { ProjectMenuItems } from "../../components/ui/ProjectMenuItems";
import { ContentHeader } from "../../components/ui/ContentHeader";

// Styles
import styles from "../../styles/content.module.css";

// Hooks
import { useProject } from "../../lib/ProjectContext";

const ProjectPatients = ({ params }: { params: { id: string } }) => {
  const { project } = useProject();
  const { id: projectId } = params;
  const projectMenuItems = (
    <ProjectMenuItems projectId={projectId} activeMenuItem="project-patients" />
  );

  return (
    <SideMenuLayout
      menuItems={projectMenuItems}
      header={project?.projectName ?? ""}
    >
      <Container className={styles.content}>
        <ContentHeader text="Patients" />
      </Container>
    </SideMenuLayout>
  );
};

export default ProjectPatients;
