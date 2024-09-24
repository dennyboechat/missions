"use client";

// Components
import { MenuItem } from "react-pro-sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Types
import { ProjectMenuItemsProps } from "../types/ProjectMenuItemsProps";

// Hooks
import { useAppUser } from "../../../lib/AppUserContext";
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
  const { appUser } = useAppUser();
  const { project } = useProject();

  if (!appUser || !project) {
    return null;
  }

  const { userId } = appUser;
  const isProjectEditable = project.ownerId === userId;
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
