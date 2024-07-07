"use client";

// Components
import { Container, Grid, Button } from "@radix-ui/themes";
import { ProjectFields } from "../components/ProjectFields1";
import { ContentHeader } from "../components/ContentHeader";

// Database
import { insertProject } from "../database/project/InsertProject";

// Hooks
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProject } from "../lib/ProjectContext";

// Utils
import { isValidProjectName } from "../utils/isValidProjectName";

// Styles
import styles from "../styles/content.module.css";

const ProjectNew = () => {
  const router = useRouter();
  const { user } = useUser();
  const { setProject } = useProject();
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [isProjectNameInvalid, setIsProjectNameInvalid] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  if (!user) {
    return null;
  }

  const onCreateButtonClick = async () => {
    setIsCreatingProject(true);
    const isValidProject = isValidProjectName({ projectName });
    setIsProjectNameInvalid(!isValidProject);

    if (isValidProject) {
      const insertedProject = await insertProject({
        projectName: projectName,
        projectDescription: projectDescription,
        ownerId: user.id,
      });

      setProject(insertedProject);
      router.push(`/project-patients/${insertedProject?.projectId}`);
    } else {
      setIsCreatingProject(false);
    }
  };

  return (
    <Container className={styles.content}>
      <Grid gap="2">
        <ContentHeader text="New Project" />
        <ProjectFields
          projectName={projectName}
          projectDescription={projectDescription}
          onProjectNameChange={(e) => setProjectName(e.target.value)}
          onProjectDescriptionChange={(e) =>
            setProjectDescription(e.target.value)
          }
          isProjectNameInvalid={isProjectNameInvalid}
          showPlaceholders
        />
        <Grid
          columns={{ xs: "1", sm: "2" }}
          gap="10px"
          width={{ xs: "auto", sm: "500px" }}
        >
          <Button
            onClick={onCreateButtonClick}
            disabled={isCreatingProject}
            variant="outline"
          >
            {"Create"}
          </Button>
          <Button
            variant="outline"
            color="gray"
            onClick={() => router.push("/dashboard")}
            disabled={isCreatingProject}
          >
            {"Cancel"}
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProjectNew;
