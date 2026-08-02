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

// Users and Settings answer for who may see and change the project, so only
// its owner gets them.
const ITEMS = [
  { key: "project-patients", label: "Patients", icon: "users", ownerOnly: false },
  { key: "project-reports", label: "Reports", icon: "reports", ownerOnly: false },
  { key: "project-users", label: "Users", icon: "user-access", ownerOnly: true },
  { key: "project", label: "Settings", icon: "settings", ownerOnly: true },
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

  const isProjectEditable = project.ownerId === appUser.userId;

  return (
    <>
      {ITEMS.filter(({ ownerOnly }) => !ownerOnly || isProjectEditable).map(
        ({ key, label, icon }) => {
          const href = `/${key}/${projectId}`;

          return (
            <MenuItem
              key={key}
              icon={<Icon name={icon} />}
              component={
                <Link href={href} prefetch onClick={navigate(href, key)} />
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
