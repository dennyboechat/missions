// Components
import { MenuItem } from "react-pro-sidebar";

// Types
import { ProjectMenuItemsProps } from "../types/ProjectMenuItemsProps";

// Hooks
import { useUser } from "@clerk/nextjs";

export const ProjectMenuItems = ({
  projectId,
  activeMenuItem,
}: ProjectMenuItemsProps) => {
  const { user } = useUser();

  return (
    <>
      <MenuItem
        href={`/project-patients/${projectId}`}
        active={activeMenuItem === "project-patients"}
      >
        Patients
      </MenuItem>
      <MenuItem
        href={`/project-users/${projectId}`}
        active={activeMenuItem === "project-users"}
      >
        Users
      </MenuItem>
      <MenuItem
        href={`/project/${projectId}`}
        active={activeMenuItem === "project"}
      >
        Project
      </MenuItem>
    </>
  );
};
