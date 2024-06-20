"use client";

// Components
import { InputTextField } from "../../../components/ui/InputTextField";

// Types
import { ProjectFieldsProps } from "../types/ProjectFieldsProps";

// Database
import { updateProject } from "../../../database/project/UpdateProject";

export const ProjectFields = ({
  projectName,
  projectDescription,
  onProjectNameChange,
  onProjectDescriptionChange,
  showPlaceholders,
  projectId,
}: ProjectFieldsProps) => {
  const onProjectNameChanged = async (
    e: React.FocusEvent<HTMLInputElement>
  ) => {
    onProjectNameChange(e);

    if (projectId && projectName !== e.target.value) {
      await updateProject({
        projectId,
        field: "project_name",
        value: e.target.value,
      });
    }
  };

  const onProjectDescriptionChanged = async (
    e: React.FocusEvent<HTMLInputElement>
  ) => {
    onProjectDescriptionChange(e);

    if (projectId && projectDescription !== e.target.value) {
      await updateProject({
        projectId,
        field: "project_description",
        value: e.target.value,
      });
    }
  };

  return (
    <>
      <InputTextField
        label="Project name"
        placeholder={
          showPlaceholders ? "Hope Mission Africa, Med Aid Fiji" : undefined
        }
        value={projectName}
        autoFocus
        required
        onBlur={(e) => onProjectNameChanged(e)}
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
    </>
  );
};
