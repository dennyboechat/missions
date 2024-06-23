"use client";

// Components
import { InputTextField } from "../../../components/ui/InputTextField";

// Types
import { ProjectFieldsProps } from "../types/ProjectFieldsProps";

// Database
import { updateProject } from "../../../database/project/UpdateProject";

// Utils
import { isValidProjectName } from "../../../utils/isValidProjectName";

// Hooks
import {useState} from 'react';
import { usePopupMessage } from "../../../lib/PopupMessage";

export const ProjectFields = ({
  projectName,
  projectDescription,
  onProjectNameChange,
  onProjectDescriptionChange,
  showPlaceholders,
  projectId,
  isProjectNameInvalid,
}: ProjectFieldsProps) => {
  const { setMessage } = usePopupMessage();
  const [isNameInvalid, setIsNameInvalid] = useState(isProjectNameInvalid);

  const onProjectNameChanged = async (
    e: React.FocusEvent<HTMLInputElement>
  ) => {
    if (onProjectNameChange) {
      onProjectNameChange(e);
    }

    const isValidName = isValidProjectName({ projectName: e.target.value });
    setIsNameInvalid(!isValidName);

    if (isValidName && projectId && projectName !== e.target.value) {
      await updateProject({
        projectId,
        field: "project_name",
        value: e.target.value,
      });

      if (setMessage) {
        setMessage('Saved');
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
      await updateProject({
        projectId,
        field: "project_description",
        value: e.target.value,
      });

      if (setMessage) {
        setMessage('Saved');
      }
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
        errorMessage={isNameInvalid ? 'Required field' : ''}
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
