"use client";

// Components
import { Container, Link, Button } from "@radix-ui/themes";
import { ProjectFields } from "../../components/projectFields";

// Types
import {
  Project,
  ProjectName,
  ProjectDescription,
} from "../../types/ProjectTypes";

// Database
import { getProject } from "../../database/project/GetProject";
import { deleteProject } from "../../database/project/DeleteProject";

// Hooks
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const ProjectId = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const [projectName, setProjectName] = useState<ProjectName>("");
  const [projectDescription, setProjectDescription] =
    useState<ProjectDescription>("");

  const { id: projectId } = params;

  useEffect(() => {
    const fetchProjects = async () => {
      if (projectId) {
        const projectData = await getProject({ projectId: projectId });
        setProjectName(projectData?.projectName ?? "");
        setProjectDescription(projectData?.projectDescription ?? "");
      }
    };

    fetchProjects();
  }, [projectId]);

  const onDeleteProject = async () => {
    await deleteProject({ projectId: projectId });

    router.push("/dashboard");
  };

  return (
    <Container>
      <ProjectFields
        projectName={projectName}
        projectDescription={projectDescription}
        onProjectNameChange={(e) => setProjectName(e.target.value)}
        onProjectDescriptionChange={(e) =>
          setProjectDescription(e.target.value)
        }
        projectId={projectId}
      />
      <Button onClick={onDeleteProject}>Delete Project</Button>
      <Link href="/dashboard">{"< Dashboard"}</Link>
    </Container>
  );
};

export default ProjectId;
