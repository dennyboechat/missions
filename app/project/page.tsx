"use client";

// Components
import { Container, Grid, Button } from "@radix-ui/themes";
import { ProjectFields } from "../components/ProjectFields";
import { ContentHeader } from "../components/ContentHeader";

// Database
import { insertProject } from "../database/project/InsertProject";

// Hooks
import { useAppUser } from "../lib/AppUserContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProject } from "../lib/ProjectContext";

// Utils
import { isValidProjectName } from "../utils/isValidProjectName";
import { isValidTimezone } from "../utils/isValidTimezone";
import { getUserTimezone } from "../utils/getUserTimezone";

// Styles
import styles from "../styles/content.module.css";

const ProjectNew = () => {
  const router = useRouter();
  const { appUser } = useAppUser();
  const { setProject } = useProject();
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectTimezone, setProjectTimezone] = useState("");
  const [isProjectNameInvalid, setIsProjectNameInvalid] = useState(false);
  const [isProjectTimezoneInvalid, setIsProjectTimezoneInvalid] =
    useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  // Prefilled after mount only: on the server getUserTimezone() is always UTC,
  // which would not match the browser value and break hydration.
  useEffect(() => {
    setProjectTimezone(getUserTimezone());
  }, []);

  if (!appUser) {
    return null;
  }

  const onCreateButtonClick = async () => {
    setIsCreatingProject(true);
    const isValidProject = isValidProjectName({ projectName });
    setIsProjectNameInvalid(!isValidProject);

    // Without this the project would be created with the 'UTC' fallback, which
    // silently mis-buckets every report it ever produces.
    const isValidProjectTimezone = isValidTimezone({
      timezone: projectTimezone,
    });
    setIsProjectTimezoneInvalid(!isValidProjectTimezone);

    if (isValidProject && isValidProjectTimezone) {
      const { userId } = appUser;

      const insertedProject = await insertProject({
        projectName: projectName,
        projectDescription: projectDescription,
        projectTimezone: projectTimezone,
        ownerId: userId,
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
        <ContentHeader text="New project" />
        <ProjectFields
          projectName={projectName}
          projectDescription={projectDescription}
          projectTimezone={projectTimezone}
          onProjectNameChange={(e) => setProjectName(e.target.value)}
          onProjectDescriptionChange={(e) =>
            setProjectDescription(e.target.value)
          }
          onProjectTimezoneChange={setProjectTimezone}
          isProjectNameInvalid={isProjectNameInvalid}
          isProjectTimezoneInvalid={isProjectTimezoneInvalid}
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
