"use client";

// Components
import {
  Container,
  Grid,
  Link,
  Button,
  Box,
  Text,
  Popover,
} from "@radix-ui/themes";
import { ProjectFields } from "../../components/projectFields";
import { SideMenuLayout } from "../../components/ui/SideMenuLayout";
import { ProjectMenuItems } from "../../components/ui/ProjectMenuItems";
import { ProjectHeader } from "../../components/ui/ProjectHeader";
import { PopupConfirmation } from "../../components/ui/PopupConfirmation";

// Types
import { ProjectName, ProjectDescription } from "../../types/ProjectTypes";

// Database
import { getProject } from "../../database/project/GetProject";
import { deleteProject } from "../../database/project/DeleteProject";

// Hooks
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Styles
import styles from "../../styles/content.module.css";

const ProjectId = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const [projectName, setProjectName] = useState<ProjectName>("");
  const [projectDescription, setProjectDescription] =
    useState<ProjectDescription>("");

  const { id: projectId } = params;
  const projectMenuItems = (
    <ProjectMenuItems projectId={projectId} activeMenuItem="project" />
  );

  useEffect(() => {
    const fetchProjects = async () => {
      if (projectId) {
        const projectData = await getProject({ projectId: projectId });
        setProjectName(projectData?.projectName ?? "");
        setProjectDescription(projectData?.projectDescription ?? "");
      }
    };

    fetchProjects();
  }, [projectId]);

  const onDeleteProject = async () => {
    await deleteProject({ projectId: projectId });

    router.push("/dashboard");
  };

  const projectHeader = <ProjectHeader />;

  const deleteProjectPopupConfirmation = (
    <Box>
      <Text>{"Confirm the project deletion?"}</Text>
      <Text as="p">
        {
          "This action cannot be undone and all data, including from patients, will be deleted."
        }
      </Text>
      <Grid columns="2">
        <Button onClick={onDeleteProject}>{"Confirm"}</Button>
        <Popover.Close>
          <Button variant="soft" color="gray">
            Cancel
          </Button>
        </Popover.Close>
      </Grid>
    </Box>
  );

  return (
    <SideMenuLayout menuItems={projectMenuItems} header={projectHeader}>
      <Container className={styles.content}>
        <ProjectFields
          projectName={projectName}
          projectDescription={projectDescription}
          onProjectNameChange={(e) => setProjectName(e.target.value)}
          onProjectDescriptionChange={(e) =>
            setProjectDescription(e.target.value)
          }
          projectId={projectId}
        />
        <PopupConfirmation content={deleteProjectPopupConfirmation}>
          <Button>Delete Project</Button>
        </PopupConfirmation>
        <Link href="/dashboard">{"< Dashboard"}</Link>
      </Container>
    </SideMenuLayout>
  );
};

export default ProjectId;
