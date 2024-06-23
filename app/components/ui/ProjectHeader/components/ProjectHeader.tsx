"use client";

// Components
import { Box, Text } from "@radix-ui/themes";

// Hooks
import { useProject } from "../../../../lib/ProjectContext";

export const ProjectHeader = () => {
  const { project } = useProject();

  return (
    <Box>
      <Text>{project?.projectName}</Text>
    </Box>
  );
};
