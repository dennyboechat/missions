"use client";

// Components
import { Container, Grid, Skeleton } from "@radix-ui/themes";
import { ProjectCardButton } from "../components/ProjectCardButton";

// Database
import { getProjects } from "../database/project/GetProjects";

// Types
import { Project } from "../types/ProjectTypes";
import { AppUser } from "../types/AppUser";

// Hooks
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

// Styles
import styles from "../styles/content.module.css";

// Database
import { insertAppUserWithThirdPartyId } from "../database/app-user/InsertAppUserWithThirdPartyId";
import { updateAppUser } from "../database/app-user/UpdateAppUser";
import { getAppUser } from "../database/app-user/GetAppUser";

const DashboardPage = () => {
  const { user } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  useEffect(() => {
    const fetchProjects = async (loggedUser?: AppUser) => {
      if (!loggedUser && user) {
        loggedUser = await getAppUser({
          field: "user_third_party_id",
          value: user.id,
        });
      }

      if (loggedUser) {
        const projectsData = await getProjects({ userId: loggedUser.userId });
        setProjects(projectsData ?? []);
      }
    };

    const insertUser = async () => {
      setIsLoadingProjects(true);
      let loggedUser;

      if (user) {
        const {
          id: userThirdPartyId,
          fullName,
          primaryEmailAddress,
          createdAt,
        } = user;
        const currentTime = new Date();
        const emailAddress = primaryEmailAddress?.emailAddress ?? "";
        const timeDifference =
          currentTime.getMilliseconds() -
          new Date(createdAt ?? 0).getMilliseconds();
        const fiveMinutesInMilli = 5 * 60 * 1000;

        if (timeDifference < fiveMinutesInMilli) {
          try {
            const addedUser = await insertAppUserWithThirdPartyId({
              userThirdPartyId,
              userName: fullName ?? "",
              userEmail: emailAddress,
            });

            loggedUser = addedUser;

            if (!addedUser) {
              const changedUser = await updateAppUser({
                userEmail: emailAddress,
                field: "user_third_party_id",
                value: userThirdPartyId,
              });

              loggedUser = changedUser;
            }
          } catch (error) {
            console.error("Error during sign-up process.", error);
          }
        }
      }

      await fetchProjects(loggedUser);

      setIsLoadingProjects(false);
    };

    insertUser();
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
        {isLoadingProjects && <ProjectCardButton isLoading />}
        {projects?.map((project) => {
          return (
            <ProjectCardButton key={project.projectId} project={project} />
          );
        })}
      </Grid>
    </Container>
  );
};

export default DashboardPage;
