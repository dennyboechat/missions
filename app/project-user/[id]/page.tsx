"use client";

// Multivariate Dependencies
import { use } from "react";

// Components
import { ProjectUser } from "../../components/ProjectUser";

const ProjectUserNew = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = use(params);
  return <ProjectUser params={resolvedParams} />;
};

export default ProjectUserNew;
