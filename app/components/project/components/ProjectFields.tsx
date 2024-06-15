"use client";

// Components
import { InputTextField } from "../../../components/ui/InputTextField";

// Types
import { ProjectFieldsProps } from "../types/ProjectFieldsProps";
import { FocusEvent } from "react";

export const ProjectFields = ({
  projectName,
  projectDescription,
  onProjectNameChange,
  onProjectDescriptionChange,
  showPlaceholders,
}: ProjectFieldsProps) => {
  return (
    <>
      <InputTextField
        label="Project name"
        placeholder={
          showPlaceholders ? "Hope Mission Africa, Med Aid Fiji" : undefined
        }
        value={projectName}
        onBlur={onProjectNameChange}
      />
      <InputTextField
        label="Project description"
        placeholder={
          showPlaceholders
            ? "Bringing better healthcare to underserved communities in Africa"
            : undefined
        }
        value={projectDescription}
        onBlur={onProjectDescriptionChange}
      />
    </>
  );
};
