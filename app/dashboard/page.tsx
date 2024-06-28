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

// Styles
import styles from "../styles/content.module.css";

// Database
import { insertUser } from "../database/user/InsertUser";

const DashboardPage = () => {
  const { user } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (user) {
        const { id: userId } = user;
        const projectsData = await getProjects({ ownerId: userId });
        setProjects(projectsData ?? []);
      }
    };

    const insertAppUser = async () => {
      if (user) {
        const { id: userId, fullName, primaryEmailAddress, createdAt } = user;
        const currentTime = new Date();
        const timeDifference =
          currentTime.getMilliseconds() - (createdAt?.getMilliseconds() ?? 0);
        const fiveMinutesInMilli = 5 * 60 * 1000;

        // The user database storing check occurs within 5 minutes after user sign up
        // It avoids the database check every time this page is loaded
        if (timeDifference < fiveMinutesInMilli) {
          try {
            await insertUser({
              userId: userId ?? "",
              userName: fullName ?? "",
              userEmail: primaryEmailAddress?.emailAddress ?? "",
            });
          } catch (error) {
            console.error("Error during sign-up process.", error);
          }
        }
      }
    };

    fetchProjects();
    insertAppUser();
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <Container className={styles.content}>
      <Grid
        columns={{ initial: "1", xs: "2", sm: "3", md: "4", lg: "5" }}
        gap="3"
      >
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
