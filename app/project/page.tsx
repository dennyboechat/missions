"use client";

// Components
import { Container, Grid, Heading, Link, Button } from "@radix-ui/themes";
import { ProjectFields } from "../components/projectFields";
import { ContentHeader } from "../components/ui/ContentHeader";

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

  if (!user) {
    return null;
  }

  const onCreateButtonClick = async () => {
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
        <Grid columns="2">
          <Button onClick={onCreateButtonClick}>{"Create"}</Button>
          <Button
            variant="soft"
            color="gray"
            onClick={() => router.push("/dashboard")}
          >
            Cancel
          </Button>
        </Grid>
      </Grid>
      <Link href="/dashboard">{"< Dashboard"}</Link>
    </Container>
  );
};

export default ProjectNew;
