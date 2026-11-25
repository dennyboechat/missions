"use client";

// Multivariate Dependencies
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { useAuth } from "@clerk/nextjs";

// Cache
import { clearPatientSummaries } from "./patientSummaryRequest";

// Types
import { Project } from "../types/ProjectTypes";
import { ProjectContextType } from "./types/ProjectContextType";

// Database
import { getProject } from "../database/project/GetProject";

// Types
import { actionData } from "../types/ActionResult";

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

  /* A different account in the same tab -- signed out, or signed out and the
   * next person signed in. Clerk does this without reloading, so on a shared
   * mission laptop the previous person's project, and the patients the list
   * remembered, would otherwise carry straight over. Only a change is acted on:
   * the first answer Clerk gives is the account the page was opened with. */
  const { isLoaded, userId } = useAuth();
  const seenUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (!isLoaded) return;

    const previous = seenUserIdRef.current;
    seenUserIdRef.current = userId ?? null;

    if (previous === undefined || previous === (userId ?? null)) return;

    clearPatientSummaries();
    setProjectState(undefined);
    setProjectId(undefined);
    localStorage.removeItem(STORAGE_KEY);
  }, [isLoaded, userId]);

  useEffect(() => {
    let isCurrent = true;

    const loadProject = async () => {
      if (!projectId) {
        setProjectState(undefined);
        return;
      }

      const loadedProject = actionData(await getProject({ projectId }));

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
