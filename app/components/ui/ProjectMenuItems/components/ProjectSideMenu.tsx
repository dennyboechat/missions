"use client";

// Components
import { MenuItem } from "react-pro-sidebar";

// Types
import { ProjectMenuItemsProps } from "../types/ProjectMenuItemsProps";

// Hooks
import { useUser } from "@clerk/nextjs";
import { useProject } from "../../../../lib/ProjectContext";
import { useState, useEffect } from "react";

export const ProjectMenuItems = ({
  projectId,
  activeMenuItem,
}: ProjectMenuItemsProps) => {
  const { user } = useUser();
  const { project } = useProject();

  const isProjectEditable = project && project.ownerId === user?.id;

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
      {isProjectEditable && (
        <MenuItem
          href={`/project/${projectId}`}
          active={activeMenuItem === "project"}
        >
          Project
        </MenuItem>
      )}
    </>
  );
};
