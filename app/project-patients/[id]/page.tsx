"use client";

// Components
import { Container, Table, Link } from "@radix-ui/themes";
import { SideMenuLayout } from "../../components/ui/SideMenuLayout";
import { ProjectMenuItems } from "../../components/ui/ProjectMenuItems";
import { ContentHeader } from "../../components/ui/ContentHeader";

// Styles
import styles from "../../styles/content.module.css";

// Hooks
import { useState, useEffect } from "react";
import { useProject } from "../../lib/ProjectContext";

// Database
import { getPatientPersonals } from "../../database/patient-personal/GetPatientPersonal";

// Types
import { PatientPersonal } from "../../types/PatientPersonalTypes";

const ProjectPatients = ({ params }: { params: { id: string } }) => {
  const { project } = useProject();
  const [projectPersonals, setProjectPersonals] = useState<PatientPersonal[]>(
    []
  );

  useEffect(() => {
    const fetchProjects = async () => {
      if (project) {
        const { projectId } = project;
        const projectPersonalsData = await getPatientPersonals({
          projectId: projectId,
        });
        setProjectPersonals(projectPersonalsData ?? []);
      }
    };

    fetchProjects();
  }, [project]);

  const { id: projectId } = params;
  const projectMenuItems = (
    <ProjectMenuItems projectId={projectId} activeMenuItem="project-patients" />
  );

  return (
    <SideMenuLayout
      menuItems={projectMenuItems}
      header={project?.projectName ?? ""}
    >
      <Container className={styles.content}>
        <ContentHeader text="Patients" />
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>{"Full Name"}</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>{"Date of Birth"}</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>{"Gender"}</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {projectPersonals.map(
              ({
                patientPersonalId,
                patientFullName,
                patientDateOfBirth,
                isPatientMale,
              }) => (
                <Table.Row key={patientPersonalId}>
                  <Table.RowHeaderCell>
                    <Link href={`/patients-personal/${patientPersonalId}`}>
                      {patientFullName}
                    </Link>
                  </Table.RowHeaderCell>
                  <Table.Cell>
                    {new Intl.DateTimeFormat().format(patientDateOfBirth)}
                  </Table.Cell>
                  <Table.Cell>{isPatientMale ? "Male" : "Female"}</Table.Cell>
                </Table.Row>
              )
            )}
          </Table.Body>
        </Table.Root>
      </Container>
    </SideMenuLayout>
  );
};

export default ProjectPatients;
