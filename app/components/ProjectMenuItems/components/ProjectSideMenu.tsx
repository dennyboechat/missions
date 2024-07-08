"use client";

// Components
import { MenuItem } from "react-pro-sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Types
import { ProjectMenuItemsProps } from "../types/ProjectMenuItemsProps";

// Hooks
import { useUser } from "@clerk/nextjs";
import { useProject } from "../../../lib/ProjectContext";

// Icons
import {
  faUserGroup,
  faUserLock,
  faGear,
} from "@fortawesome/free-solid-svg-icons";

export const ProjectMenuItems = ({
  projectId,
  activeMenuItem,
}: ProjectMenuItemsProps) => {
  const { user } = useUser();
  const { project } = useProject();

  const isProjectEditable = project && project.ownerId === user?.id;
  const projectPatientsIcon = <FontAwesomeIcon icon={faUserGroup} />;
  const projectUsersIcon = <FontAwesomeIcon icon={faUserLock} />;
  const projectIcon = <FontAwesomeIcon icon={faGear} />;

  return (
    <>
      <MenuItem
        icon={projectPatientsIcon}
        href={`/project-patients/${projectId}`}
        active={activeMenuItem === "project-patients"}
      >
        {"Patients"}
      </MenuItem>
      {isProjectEditable && (
        <MenuItem
          icon={projectUsersIcon}
          href={`/project-users/${projectId}`}
          active={activeMenuItem === "project-users"}
        >
          {"Users"}
        </MenuItem>
      )}
      {isProjectEditable && (
        <MenuItem
          icon={projectIcon}
          href={`/project/${projectId}`}
          active={activeMenuItem === "project"}
        >
          {"Settings"}
        </MenuItem>
      )}
    </>
  );
};
