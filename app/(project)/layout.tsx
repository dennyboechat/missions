"use client";

// Multivariate Dependencies
import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Components
import { SideMenuLayout } from "../components/ui/SideMenuLayout";
import { ProjectMenuItems } from "../components/ProjectMenuItems";

// Database
import { getProject } from "../database/project/GetProject";

// Hooks
import { useProject } from "../lib/ProjectContext";

// Types
import { ProjectMenuItemsProps } from "../components/ProjectMenuItems/types/ProjectMenuItemsProps";
import { actionData } from "../types/ActionResult";

type ActiveMenuItem = ProjectMenuItemsProps["activeMenuItem"];

// The add-patient and add-user forms belong under the section they return to.
const MENU_ITEM_BY_SEGMENT: Record<string, ActiveMenuItem> = {
  "project-patients": "project-patients",
  "project-patient": "project-patients",
  "project-reports": "project-reports",
  "project-users": "project-users",
  "project-audit": "project-audit",
  "project-user": "project-users",
  project: "project",
};

/**
 * The chrome for every project page: sidebar, project name and section menu.
 *
 * Kept in a layout so moving between sections swaps only the content. Each
 * page used to render its own copy, which meant React rebuilt the menu on
 * every click. The route group leaves the URLs untouched.
 */
export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [, segment, projectId] = pathname.split("/");
  const { project, setProject } = useProject();

  // Keep the cached project in step with the URL. The menu decides whether to
  // show the owner-only sections from it, so a stale one would answer for the
  // wrong project.
  useEffect(() => {
    let isCurrent = true;

    const syncProject = async () => {
      // Re-fetch a project that arrived without a rank as well as one for the
      // wrong id. The dashboard fills this context, so a project cached by an
      // older build would otherwise keep an admin out of Users and Settings for
      // the whole session with no way to recover but clearing storage.
      const isCurrentProject =
        project?.projectId === projectId && project?.viewerRole !== undefined;

      if (!projectId || isCurrentProject) return;

      const loaded = actionData(await getProject({ projectId }));

      if (isCurrent && loaded) {
        setProject(loaded);
      }
    };

    syncProject();

    return () => {
      isCurrent = false;
    };
  }, [projectId, project?.projectId, project?.viewerRole, setProject]);

  // "/project" with no id is the new-project form, which has no project yet.
  if (!projectId) {
    return <>{children}</>;
  }

  return (
    <SideMenuLayout
      menuItems={
        <ProjectMenuItems
          projectId={projectId}
          activeMenuItem={MENU_ITEM_BY_SEGMENT[segment]}
        />
      }
      footer={project?.projectName ?? ""}
    >
      {children}
    </SideMenuLayout>
  );
}
