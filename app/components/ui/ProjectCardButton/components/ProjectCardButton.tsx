// Components
import { Card, Text, Link } from "@radix-ui/themes";
import { PlusIcon } from "@radix-ui/react-icons";

// Styles
import styles from "../styles/ProjectCardButton.module.css";

// Types
import { ProjectCardButtonProps } from "../types/ProjectCardButtonProps";

export const ProjectCardButton = ({
  isAddNew,
  projectName,
  projectDescription,
}: ProjectCardButtonProps) => (
  <Card asChild size="3" variant="surface">
    {isAddNew ? (
      <Link href="project" className={styles.new_card}>
        <PlusIcon color="black" height="50" width="50" />
        <Text as="p" size="3">
          New project
        </Text>
      </Link>
    ) : (
      <Link href="project/[id]">
        {projectName}
        <Text as="p" size="3">
          {projectDescription}
        </Text>
      </Link>
    )}
  </Card>
);
