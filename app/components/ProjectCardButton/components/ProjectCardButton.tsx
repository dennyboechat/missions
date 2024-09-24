"use client";

// Components
import { Grid, Card, Text, Link, Skeleton } from "@radix-ui/themes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Styles
import styles from "../styles/ProjectCardButton.module.css";

// Types
import { ProjectCardButtonProps } from "../types/ProjectCardButtonProps";

// Hooks
import { useProject } from "../../../lib/ProjectContext";

// Icons
import { faPlus } from "@fortawesome/free-solid-svg-icons";

export const ProjectCardButton = ({
  isLoading,
  isAddNew,
  project,
}: ProjectCardButtonProps) => {
  const { setProject } = useProject();

  let cardContent;
  if (isLoading) {
    cardContent = <Skeleton />;
  } else if (isAddNew) {
    cardContent = (
      <Link href="/project">
        <Grid height="100%">
          <FontAwesomeIcon
            icon={faPlus}
            className={styles.new_card_upper_section}
          />
          <Text className={styles.new_card_bottom_section}>
            {"New project"}
          </Text>
        </Grid>
      </Link>
    );
  } else {
    cardContent = (
      <Link
        href={`/project-patients/${project?.projectId}`}
        onClick={() => setProject(project)}
      >
        <Grid height="100%">
          <Text className={styles.project_name}>{project?.projectName}</Text>
          <Text as="p" size="1" className={styles.project_description}>
            {project?.projectDescription}
          </Text>
        </Grid>
      </Link>
    );
  }

  return (
    <Card asChild size="3" variant="surface" className={styles.card}>
      {cardContent}
    </Card>
  );
};
