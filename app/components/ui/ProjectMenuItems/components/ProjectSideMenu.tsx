"use client";

// Components
import { MenuItem } from "react-pro-sidebar";
import { PersonIcon, GearIcon, AccessibilityIcon } from "@radix-ui/react-icons";

// Types
import { ProjectMenuItemsProps } from "../types/ProjectMenuItemsProps";

// Hooks
import { useUser } from "@clerk/nextjs";
import { useProject } from "../../../../lib/ProjectContext";

export const ProjectMenuItems = ({
  projectId,
  activeMenuItem,
}: ProjectMenuItemsProps) => {
  const { user } = useUser();
  const { project } = useProject();

  const isProjectEditable = project && project.ownerId === user?.id;
  const projectPatientsIcon = <AccessibilityIcon />;
  const projectUsersIcon = <PersonIcon />;
  const projectIcon = <GearIcon />;

  return (
    <>
      <MenuItem
        icon={projectPatientsIcon}
        href={`/project-patients/${projectId}`}
        active={activeMenuItem === "project-patients"}
      >
        Patients
      </MenuItem>
      <MenuItem
        icon={projectUsersIcon}
        href={`/project-users/${projectId}`}
        active={activeMenuItem === "project-users"}
      >
        Users
      </MenuItem>
      {isProjectEditable && (
        <MenuItem
          icon={projectIcon}
          href={`/project/${projectId}`}
          active={activeMenuItem === "project"}
        >
          Project
        </MenuItem>
      )}
    </>
  );
};
