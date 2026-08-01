"use client";

// Multivariate Dependencies
import { createContext, useContext, useState, useEffect } from "react";

// Types
import { Project } from "../types/ProjectTypes";
import { ProjectContextType } from "./types/ProjectContextType";

// Database
import { getProject } from "../database/project/GetProject";

const STORAGE_KEY = "projectId";

const ProjectContext = createContext<ProjectContextType>({
  project: undefined,
  setProject: () => {},
});

export const ProjectProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Only the id is persisted. Storing the whole project meant every schema
  // change left stale objects in browsers -- adding project_timezone produced
  // cached projects with no such field, which is why the reports had to read
  // the zone from the row instead of from here.
  const [projectId, setProjectId] = useState<string | undefined>();
  const [project, setProjectState] = useState<Project | undefined>();

  useEffect(() => {
    setProjectId(localStorage.getItem(STORAGE_KEY) ?? undefined);
    // Drop the previous full-object cache left in existing browsers.
    localStorage.removeItem("project");
  }, []);

  useEffect(() => {
    let isCurrent = true;

    const loadProject = async () => {
      if (!projectId) {
        setProjectState(undefined);
        return;
      }

      const loadedProject = await getProject({ projectId });

      // A late response for a project the user has since navigated away from
      // must not overwrite the current one.
      if (isCurrent) {
        setProjectState(loadedProject);
      }
    };

    loadProject();

    return () => {
      isCurrent = false;
    };
  }, [projectId]);

  const setProject = (newProject: Project | undefined) => {
    // Render the known project immediately; the fetch above reconciles it.
    setProjectState(newProject);
    setProjectId(newProject?.projectId);

    if (newProject?.projectId) {
      localStorage.setItem(STORAGE_KEY, newProject.projectId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <ProjectContext.Provider value={{ project, setProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("You need to wrap ProjectProvider.");
  }
  return context;
};
