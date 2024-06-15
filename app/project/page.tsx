"use client";

// Components
import { Container, Grid, Heading, Link, Button } from "@radix-ui/themes";
import { InputTextField } from "../components/ui/InputTextField";

// Database
import { insertProject } from "../database/project";

// Hooks
import { useUser } from "@clerk/nextjs";
import { useState } from "react";

const ProjectNew = () => {
  const { user } = useUser();
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  if (!user) {
    return null;
  }

  const onCreateButtonClick = async () => {
    await insertProject({
      projectName: projectName,
      projectDescription: projectDescription,
      ownerId: user.id,
    });
  };

  return (
    <Container>
      <Grid gap="2">
        <Heading>New project</Heading>
        <InputTextField
          label="Project name"
          placeholder="Hope Mission Africa, Med Aid Fiji"
          value={projectName}
          onBlur={(e) => setProjectName(e.target.value)}
        />
        <InputTextField
          label="Project description"
          placeholder="Bringing better healthcare to underserved communities in Africa"
          value={projectDescription}
          onBlur={(e) => setProjectDescription(e.target.value)}
        />
        <Button onClick={onCreateButtonClick}>{"Create"}</Button>
      </Grid>
      <Link href="/dashboard">{"< Dashboard"}</Link>
    </Container>
  );
};

export default ProjectNew;
