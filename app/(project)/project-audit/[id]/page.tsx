"use client";

// Multivariate Dependencies
import { use } from "react";

// Components
import { ProjectAudit } from "../../../components/ProjectAudit";

const ProjectAuditPage = ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const resolvedParams = use(params);
  return <ProjectAudit params={resolvedParams} />;
};

export default ProjectAuditPage;
