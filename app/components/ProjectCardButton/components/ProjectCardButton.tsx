"use client";

// Components
import { Skeleton, Text } from "@radix-ui/themes";
import Link from "next/link";
import { Icon } from "../../ui/Icon";

// Styles
import styles from "../styles/ProjectCardButton.module.css";

// Types
import { ProjectCardButtonProps } from "../types/ProjectCardButtonProps";

// Hooks
import { useProject } from "../../../lib/ProjectContext";

// Utils
import { getTimezoneCity } from "../../../utils/getTimezoneLabel";

export const ProjectCardButton = ({
  isLoading,
  isAddNew,
  project,
}: ProjectCardButtonProps) => {
  const { setProject } = useProject();

  if (isLoading) {
    return (
      <div className={`${styles.card} ${styles.loading_card}`}>
        <Skeleton height="17px" width="70%" />
        <Skeleton height="12px" />
      </div>
    );
  }

  // The dashed tile reads as a slot waiting to be filled rather than a mission
  // that already exists, which is why it is the one place the system uses a
  // dashed border.
  if (isAddNew) {
    return (
      <Link href="/project" className={`${styles.card} ${styles.new_card}`}>
        <Icon name="plus" size={26} />
        <Text className={styles.new_card_label}>{"New project"}</Text>
      </Link>
    );
  }

  // The mission's timezone is the only thing the record knows about where it
  // is, so the city half of it stands in for the place: "Pacific/Fiji" is a
  // configuration value, "Fiji" is what the pin is pointing at.
  const location = project?.projectTimezone
    ? getTimezoneCity({ timezone: project.projectTimezone })
    : undefined;

  return (
    <Link
      href={`/project-patients/${project?.projectId}`}
      onClick={() => setProject(project)}
      className={`${styles.card} ${styles.project_card}`}
    >
      <Text className={styles.project_name}>{project?.projectName}</Text>
      <span className={styles.project_footer}>
        <Text as="p" className={styles.project_description}>
          {project?.projectDescription}
        </Text>
        {location && (
          <Text className={styles.project_location}>
            <Icon name="location" size={13} />
            {location}
          </Text>
        )}
      </span>
    </Link>
  );
};
