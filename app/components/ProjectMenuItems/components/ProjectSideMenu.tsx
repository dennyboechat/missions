"use client";

// Components
import { MenuItem } from "react-pro-sidebar";
import Link from "next/link";
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
  faChartPie,
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
  const projectReportsIcon = <FontAwesomeIcon icon={faChartPie} />;

  return (
    <>
      <MenuItem
        icon={projectPatientsIcon}
        component={<Link href={`/project-patients/${projectId}`} />}
        active={activeMenuItem === "project-patients"}
      >
        {"Patients"}
      </MenuItem>
      <MenuItem
        icon={projectReportsIcon}
        component={<Link href={`/project-reports/${projectId}`} />}
        active={activeMenuItem === "project-reports"}
      >
        {"Reports"}
      </MenuItem>
      {isProjectEditable && (
        <MenuItem
          icon={projectUsersIcon}
          component={<Link href={`/project-users/${projectId}`} />}
          active={activeMenuItem === "project-users"}
        >
          {"Users"}
        </MenuItem>
      )}
      {isProjectEditable && (
        <MenuItem
          icon={projectIcon}
          component={<Link href={`/project/${projectId}`} />}
          active={activeMenuItem === "project"}
        >
          {"Settings"}
        </MenuItem>
      )}
    </>
  );
};
