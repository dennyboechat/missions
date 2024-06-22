"use client";

// Components
import { Card, Text, Link } from "@radix-ui/themes";
import { PlusIcon } from "@radix-ui/react-icons";

// Styles
import styles from "../styles/ProjectCardButton.module.css";

// Types
import { ProjectCardButtonProps } from "../types/ProjectCardButtonProps";

// Hooks
import { useProject } from "../../../../lib/ProjectContext";

export const ProjectCardButton = ({
  isAddNew,
  project,
}: ProjectCardButtonProps) => {
  const { setProject } = useProject();

  return (
    <Card asChild size="3" variant="surface">
      {isAddNew ? (
        <Link href="/project" className={styles.new_card}>
          <PlusIcon color="black" height="50" width="50" />
          <Text as="p" size="3">
            New project
          </Text>
        </Link>
      ) : (
        <Link
          href={`/project-patients/${project?.projectId}`}
          onClick={() => setProject(project)}
        >
          {project?.projectName}
          <Text as="p" size="1">
            {project?.projectDescription}
          </Text>
        </Link>
      )}
    </Card>
  );
};
