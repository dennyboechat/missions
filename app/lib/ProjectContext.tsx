"use client";

// Multivariate Dependencies
import { createContext, useContext, useState } from "react";

// Types
import { Project } from "../types/ProjectTypes";
import { ProjectContextType } from "./types/ProjectContextType";

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
    setProjectState(storedProject ? JSON.parse(storedProject) : undefined);
  }, []);

  const setProject = (newProject: Project | undefined) => {
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
    throw new Error("You need to wrap ProjectProvider.");
  }
  return context;
};
