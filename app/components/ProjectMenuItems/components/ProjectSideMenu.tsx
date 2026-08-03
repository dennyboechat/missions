"use client";

// Components
import { MenuItem } from "react-pro-sidebar";
import Link from "next/link";
import { Icon } from "../../ui/Icon";

// Types
import { ProjectMenuItemsProps } from "../types/ProjectMenuItemsProps";

// Hooks
import { useAppUser } from "../../../lib/AppUserContext";
import { useProject } from "../../../lib/ProjectContext";
import { useMenuNavigation } from "../../../lib/useMenuNavigation";

// Users and Settings answer for who may see and change the project, so they
// need the project's own rank: its owner, or an admin the owner appointed.
// Deleting the project still asks for the owner, but that lives inside Settings
// rather than being a menu item of its own.
const ITEMS = [
  { key: "project-patients", label: "Patients", icon: "users", adminOnly: false },
  { key: "project-reports", label: "Reports", icon: "reports", adminOnly: false },
  { key: "project-users", label: "Users", icon: "user-access", adminOnly: true },
  { key: "project-audit", label: "Audit", icon: "history", adminOnly: true },
  { key: "project", label: "Settings", icon: "settings", adminOnly: true },
] as const;

export const ProjectMenuItems = ({
  projectId,
  activeMenuItem,
}: ProjectMenuItemsProps) => {
  const { appUser } = useAppUser();
  const { project } = useProject();
  const { activeItem, navigate } = useMenuNavigation(activeMenuItem);

  if (!appUser || !project) {
    return null;
  }

  // The server resolves the rank, but an owner reading a project saved before
  // viewerRole existed would otherwise lose their own menu, so the ownerId
  // comparison stays as the floor.
  const isProjectAdministrable =
    project.ownerId === appUser.userId ||
    project.viewerRole === "owner" ||
    project.viewerRole === "admin";

  return (
    <>
      {ITEMS.filter(({ adminOnly }) => !adminOnly || isProjectAdministrable).map(
        ({ key, label, icon }) => {
          const href = `/${key}/${projectId}`;

          return (
            <MenuItem
              key={key}
              icon={<Icon name={icon} />}
              component={
                // Collapsed to the icon rail the label is off screen, so the
                // title is the only thing naming the icon on hover.
                <Link
                  href={href}
                  prefetch
                  title={label}
                  onClick={navigate(href, key)}
                />
              }
              active={activeItem === key}
            >
              {label}
            </MenuItem>
          );
        }
      )}
    </>
  );
};
