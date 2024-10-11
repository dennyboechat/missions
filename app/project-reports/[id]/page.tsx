"use client";

// Components
import { ProjectReports } from "../../components/ProjectReports";

const ProjectReportsPage = ({ params }: { params: { id: string } }) => (
  <ProjectReports params={params} />
);

export default ProjectReportsPage;
