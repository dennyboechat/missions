"use client";

// Multivariate Dependencies
import { use } from "react";

// Components
import { ProjectReports } from "../../components/ProjectReports";

const ProjectReportsPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = use(params);
  return <ProjectReports params={resolvedParams} />;
};

export default ProjectReportsPage;
