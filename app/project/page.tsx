"use client";

// Components
import { Container, Grid, Heading, Link, Button } from "@radix-ui/themes";
import { ProjectFields } from "../components/projectFields";

// Database
import { insertProject } from "../database/project/InsertProject";

// Hooks
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Utils
import { isValidProject } from "../utils/isValidProject";

const ProjectNew = () => {
  const router = useRouter();
  const { user } = useUser();
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  if (!user) {
    return null;
  }

  const onCreateButtonClick = async () => {
    if (isValidProject({projectName})) {
      const insertedProject = await insertProject({
        projectName: projectName,
        projectDescription: projectDescription,
        ownerId: user.id,
      });

      router.push(`/project/${insertedProject?.projectId}`);
    }
  };

  return (
    <Container>
      <Grid gap="2">
        <Heading>New project</Heading>
        <ProjectFields
          projectName={projectName}
          projectDescription={projectDescription}
          onProjectNameChange={(e) => setProjectName(e.target.value)}
          onProjectDescriptionChange={(e) =>
            setProjectDescription(e.target.value)
          }
          showPlaceholders
        />
        <Button onClick={onCreateButtonClick}>{"Create"}</Button>
      </Grid>
      <Link href="/dashboard">{"< Dashboard"}</Link>
    </Container>
  );
};

export default ProjectNew;
