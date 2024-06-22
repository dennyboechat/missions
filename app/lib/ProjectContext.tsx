"use client";

// Multivariate Dependencies
import { createContext, useContext, useState, useMemo } from "react";

// Types
import type { Project } from "../types/ProjectTypes";
import type { ProjectContextType } from "./types/ProjectProviderProps";

// Hooks
import { useEffect } from "react";

const ProjectContext = createContext<ProjectContextType>({
  project: undefined,
  setProject: () => {},
});

export const ProjectProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [project, setProjectState] = useState<Project | undefined>();

  useEffect(() => {
    const storedProject = localStorage.getItem("project");
    if (storedProject) {
      setProjectState(JSON.parse(storedProject));
    }
  }, []);

  const setProject = (newProject: Project) => {
    setProjectState(newProject);
    localStorage.setItem(
      "project",
      newProject ? JSON.stringify(newProject) : ""
    );
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
    throw new Error("You need to wrap ProjectStateProvider.");
  }
  return context;
};
