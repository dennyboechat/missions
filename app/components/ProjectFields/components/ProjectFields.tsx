"use client";

// Components
import { Grid } from "@radix-ui/themes";
import { InputTextField } from "../../ui/InputTextField";

// Types
import { ProjectFieldsProps } from "../types/ProjectFieldsProps";

// Database
import { updateProject } from "../../../database/project/UpdateProject";

// Utils
import { isValidProjectName } from "../../../utils/isValidProjectName";
import { runWithRetries } from "@/app/utils/runWithRetries";

// Hooks
import { useState } from "react";
import { usePopupMessage } from "../../../lib/PopupMessage";
import { useProject } from "../../../lib/ProjectContext";

export const ProjectFields = ({
  projectName,
  projectDescription,
  onProjectNameChange,
  onProjectDescriptionChange,
  showPlaceholders,
  projectId,
  isProjectNameInvalid,
}: ProjectFieldsProps) => {
  const { setProject } = useProject();
  const { setMessage, setMessageType } = usePopupMessage();
  const [isNameInvalid, setIsNameInvalid] = useState(isProjectNameInvalid);

  const onProjectNameChanged = async (
    e: React.FocusEvent<HTMLInputElement>
  ) => {
    if (onProjectNameChange) {
      onProjectNameChange(e);
    }
    const newValue = e.target.value;

    const isValidName = isValidProjectName({ projectName: newValue });
    setIsNameInvalid(!isValidName);

    if (isValidName && projectId && projectName !== newValue) {
      const codeToRun = async () => {
        const updatedProject = await updateProject({
          projectId,
          field: "project_name",
          value: newValue,
        });

        if (setProject) {
          setProject(updatedProject);
        }

        if (setMessage && setMessageType) {
          if (updatedProject) {
            setMessage("Saved");
            setMessageType("regular");
          } else {
            setMessage("Error to save. Please try again.");
            setMessageType("error");
          }
        }
      };

      const runSuccess = await runWithRetries(codeToRun);
      if (!runSuccess && setMessage && setMessageType) {
        setMessage("Error to save. Please try again.");
        setMessageType("error");
      }
    }
  };

  const onProjectDescriptionChanged = async (
    e: React.FocusEvent<HTMLInputElement>
  ) => {
    if (onProjectDescriptionChange) {
      onProjectDescriptionChange(e);
    }

    if (projectId && projectDescription !== e.target.value) {
      const codeToRun = async () => {
        const updatedProject = await updateProject({
          projectId,
          field: "project_description",
          value: e.target.value,
        });

        if (setMessage && setMessageType) {
          if (updatedProject) {
            setMessage("Saved");
            setMessageType("regular");
          } else {
            setMessage("Error to save. Please try again.");
            setMessageType("error");
          }
        }
      };

      const runSuccess = await runWithRetries(codeToRun);
      if (!runSuccess && setMessage && setMessageType) {
        setMessage("Error to save. Please try again.");
        setMessageType("error");
      }
    }
  };

  return (
    <Grid gap="10px" width={{ initial: "auto", sm: "500px" }}>
      <InputTextField
        label="Project name"
        placeholder={
          showPlaceholders ? "Hope Mission Africa, Med Aid Fiji" : undefined
        }
        value={projectName}
        autoFocus
        required
        onBlur={(e) => onProjectNameChanged(e)}
        errorMessage={isNameInvalid ? "Required field" : ""}
      />
      <InputTextField
        label="Project description"
        placeholder={
          showPlaceholders
            ? "Bringing better healthcare to underserved communities in Africa"
            : undefined
        }
        value={projectDescription}
        onBlur={(e) => onProjectDescriptionChanged(e)}
      />
    </Grid>
  );
};
