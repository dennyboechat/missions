"use client";

// Components
import { Container, Grid } from "@radix-ui/themes";
import { ProjectCardButton } from "../components/ui/ProjectCardButton";

// Database
import { getProjects } from "../database/project/GetProjects";

// Types
import { Project } from "../types/ProjectTypes";

// Hooks
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

const DashboardPage = () => {
  const { user } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (user) {
        const projectsData = await getProjects({ ownerId: user.id });
        setProjects(projectsData ?? []);
      }
    };

    fetchProjects();
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <Container>
      <Grid columns={{ xs: "1", sm: "3", md: "4", lg: "5" }} gap="3">
        <ProjectCardButton isAddNew />
        {projects &&
          projects.map((project) => {
            return (
              <ProjectCardButton key={project.projectId} project={project} />
            );
          })}
      </Grid>
    </Container>
  );
};

export default DashboardPage;
