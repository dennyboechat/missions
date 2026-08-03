"use client";

// Components
import { Container, Grid, Button } from "@radix-ui/themes";
import { ProjectFields } from "../../components/ProjectFields";
import { ContentHeader } from "../../components/ContentHeader";

// Database
import { insertProject } from "../../database/project/InsertProject";

// Hooks
import { useAppUser } from "../../lib/AppUserContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProject } from "../../lib/ProjectContext";

// Utils
import { isValidProjectName } from "../../utils/isValidProjectName";
import { isValidTimezone } from "../../utils/isValidTimezone";
import { getUserTimezone } from "../../utils/getUserTimezone";

// Styles
import styles from "../../styles/content.module.css";

// Types
import { actionData } from "../../types/ActionResult";
import {
  ProjectLengthUnit,
  ProjectWeightUnit,
  ProjectTemperatureUnit,
  ProjectDateFormat,
  DEFAULT_PROJECT_FORMATS,
} from "../../types/ProjectTypes";

const ProjectNew = () => {
  const router = useRouter();
  const { appUser } = useAppUser();
  const { setProject } = useProject();
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectTimezone, setProjectTimezone] = useState("");
  // Defaults so the form always shows a choice; a new project has no row to
  // read them back from yet.
  const [projectLengthUnit, setProjectLengthUnit] =
    useState<ProjectLengthUnit>(DEFAULT_PROJECT_FORMATS.lengthUnit);
  const [projectWeightUnit, setProjectWeightUnit] =
    useState<ProjectWeightUnit>(DEFAULT_PROJECT_FORMATS.weightUnit);
  const [projectTemperatureUnit, setProjectTemperatureUnit] =
    useState<ProjectTemperatureUnit>(DEFAULT_PROJECT_FORMATS.temperatureUnit);
  const [projectDateFormat, setProjectDateFormat] =
    useState<ProjectDateFormat>(DEFAULT_PROJECT_FORMATS.dateFormat);
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

      const insertedProject = actionData(
        await insertProject({
          projectName: projectName,
          projectDescription: projectDescription,
          projectTimezone: projectTimezone,
          projectLengthUnit,
          projectWeightUnit,
          projectTemperatureUnit,
          projectDateFormat,
          ownerId: userId,
        }),
      );

      if (insertedProject) {
        setProject(insertedProject);
        router.push(`/project-patients/${insertedProject.projectId}`);
      } else {
        setIsCreatingProject(false);
      }
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
          projectLengthUnit={projectLengthUnit}
          projectWeightUnit={projectWeightUnit}
          projectTemperatureUnit={projectTemperatureUnit}
          projectDateFormat={projectDateFormat}
          onProjectLengthUnitChange={setProjectLengthUnit}
          onProjectWeightUnitChange={setProjectWeightUnit}
          onProjectTemperatureUnitChange={setProjectTemperatureUnit}
          onProjectDateFormatChange={setProjectDateFormat}
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
