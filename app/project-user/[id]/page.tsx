"use client";

// Components
import { ProjectUser } from "../../components/ProjectUser";

const ProjectUserNew = ({ params }: { params: { id: string } }) => (
  <ProjectUser params={params} />
);

export default ProjectUserNew;
