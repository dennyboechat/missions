"use client";

// Components
import {
  Container,
  Grid,
  Button,
  Box,
  Text,
  Popover,
  Heading,
} from "@radix-ui/themes";
import { ProjectFields } from "../../../components/ProjectFields";
import { PopupConfirmation } from "../../../components/ui/PopupConfirmation";
import { ContentHeader } from "../../../components/ContentHeader";

// Types
import {
  ProjectName,
  ProjectDescription,
  ProjectTimezone,
  ProjectRole,
  ProjectLengthUnit,
  ProjectWeightUnit,
  ProjectTemperatureUnit,
  ProjectDateFormat,
  DEFAULT_PROJECT_FORMATS,
} from "../../../types/ProjectTypes";

// Database
import { getProject } from "../../../database/project/GetProject";
import { deleteProject } from "../../../database/project/DeleteProject";

// Hooks
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useProject } from "../../../lib/ProjectContext";

// Styles
import styles from "../../../styles/content.module.css";

// Types
import { actionData } from "../../../types/ActionResult";

const ProjectId = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: projectId } = use(params);
  const router = useRouter();
  const { project } = useProject();
  const [projectName, setProjectName] = useState<ProjectName>("");
  const [projectDescription, setProjectDescription] =
    useState<ProjectDescription>("");
  const [projectTimezone, setProjectTimezone] = useState<ProjectTimezone>("");
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  // Read from the project this route names, not from the selected one in
  // context, so the answer belongs to the project being edited.
  const [viewerRole, setViewerRole] = useState<ProjectRole | undefined>();
  const [projectLengthUnit, setProjectLengthUnit] =
    useState<ProjectLengthUnit>(DEFAULT_PROJECT_FORMATS.lengthUnit);
  const [projectWeightUnit, setProjectWeightUnit] =
    useState<ProjectWeightUnit>(DEFAULT_PROJECT_FORMATS.weightUnit);
  const [projectTemperatureUnit, setProjectTemperatureUnit] =
    useState<ProjectTemperatureUnit>(DEFAULT_PROJECT_FORMATS.temperatureUnit);
  const [projectDateFormat, setProjectDateFormat] =
    useState<ProjectDateFormat>(DEFAULT_PROJECT_FORMATS.dateFormat);

  useEffect(() => {
    const fetchProject = async () => {
      if (projectId) {
        const projectData = actionData(await getProject({ projectId }));
        setProjectName(projectData?.projectName ?? "");
        setProjectDescription(projectData?.projectDescription ?? "");
        setProjectTimezone(projectData?.projectTimezone ?? "UTC");
        setViewerRole(projectData?.viewerRole);
        setProjectLengthUnit(
          projectData?.projectLengthUnit ?? DEFAULT_PROJECT_FORMATS.lengthUnit,
        );
        setProjectWeightUnit(
          projectData?.projectWeightUnit ?? DEFAULT_PROJECT_FORMATS.weightUnit,
        );
        setProjectTemperatureUnit(
          projectData?.projectTemperatureUnit ??
            DEFAULT_PROJECT_FORMATS.temperatureUnit,
        );
        setProjectDateFormat(
          projectData?.projectDateFormat ?? DEFAULT_PROJECT_FORMATS.dateFormat,
        );
      }
    };

    fetchProject();
  }, [projectId]);

  const onDeleteProject = async () => {
    setIsDeletingProject(true);
    actionData(await deleteProject({ projectId }));
    router.push("/dashboard");
  };

  const deleteProjectPopupConfirmation = (
    <Box>
      <Text weight="bold">{"Confirm the project deletion?"}</Text>
      <Text as="p">
        {
          "This action cannot be undone and all data, including from patients, will be deleted."
        }
      </Text>
      <Grid columns="2" gapX="10px">
        <Button
          color="red"
          onClick={onDeleteProject}
          disabled={isDeletingProject}
          variant="outline"
        >
          {"Confirm"}
        </Button>
        <Popover.Close>
          <Button variant="outline" color="gray" disabled={isDeletingProject}>
            {"Cancel"}
          </Button>
        </Popover.Close>
      </Grid>
    </Box>
  );

  return (
    <Container className={styles.content}>
      <ContentHeader text="Project" />
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
        projectId={projectId}
      />
      {/* Admins run everything else on this page, but not this. Deletion takes
          every patient in the project with it, so it stays with the one person
          who answers for the project. The action refuses them regardless -- this
          is only so they are not shown a button that cannot work. */}
      {viewerRole === "owner" ? (
        <Grid
          gridRow="1fr 1fr auto"
          gapY="10px"
          className={styles.delete_section}
        >
          <Heading size="4">{"Delete Project"}</Heading>
          <Text as="p">
            {
              "The project will be permanently deleted, including its data like patients. This action is irreversible and can not be undone."
            }
          </Text>
          <Grid width={{ initial: "auto", sm: "150px" }}>
            <PopupConfirmation content={deleteProjectPopupConfirmation}>
              <Button color="red" variant="outline">
                {"Delete project"}
              </Button>
            </PopupConfirmation>
          </Grid>
        </Grid>
      ) : null}
    </Container>
  );
};

export default ProjectId;
