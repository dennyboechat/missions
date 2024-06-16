"use client";

// Components
import { Container, Link } from "@radix-ui/themes";
import { ProjectFields } from "../../components/project";

// Types
import {
  Project,
  ProjectName,
  ProjectDescription,
} from "../../types/ProjectTypes";

// Database
import { getProject } from "../../database/project/GetProject";

// Hooks
import { useState, useEffect } from "react";

const ProjectId = ({ params }: { params: { id: string } }) => {
  const [projectName, setProjectName] = useState<ProjectName>("");
  const [projectDescription, setProjectDescription] =
    useState<ProjectDescription>("");

  const { id } = params;

  useEffect(() => {
    const fetchProjects = async () => {
      if (id) {
        const projectData = await getProject({ projectId: id });
        setProjectName(projectData?.projectName ?? "");
        setProjectDescription(projectData?.projectDescription ?? "");
      }
    };

    fetchProjects();
  }, [id]);

  return (
    <Container>
      <ProjectFields
        projectName={projectName}
        projectDescription={projectDescription}
        onProjectNameChange={(e) => setProjectName(e.target.value)}
        onProjectDescriptionChange={(e) =>
          setProjectDescription(e.target.value)
        }
      />
      <Link href="/dashboard">{"< Dashboard"}</Link>
    </Container>
  );
};

export default ProjectId;
