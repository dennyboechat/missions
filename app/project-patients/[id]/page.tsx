"use client";

// Components
import { Container, Table, Link } from "@radix-ui/themes";
import { SideMenuLayout } from "../../components/ui/SideMenuLayout";
import { ProjectMenuItems } from "../../components/ProjectMenuItems";
import { ContentHeader } from "../../components/ContentHeader";
import { DataTable } from "../../components/ui/DataTable";

// Styles
import styles from "../../styles/content.module.css";

// Hooks
import { useState, useEffect } from "react";
import { useProject } from "../../lib/ProjectContext";

// Database
import { getPatientPersonals } from "../../database/patient-personal/GetPatientPersonals";

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

  const tableHeader =     <Table.Row>
  <Table.ColumnHeaderCell>{"Full Name"}</Table.ColumnHeaderCell>
  <Table.ColumnHeaderCell>{"Date of Birth"}</Table.ColumnHeaderCell>
  <Table.ColumnHeaderCell>{"Gender"}</Table.ColumnHeaderCell>
</Table.Row>;

  return (
    <SideMenuLayout
      menuItems={projectMenuItems}
      header={project?.projectName ?? ""}
    >
      <Container className={styles.content}>
        <ContentHeader text="Patients" />
        <DataTable tableHeader={tableHeader}>  
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
        </DataTable>
      </Container>
    </SideMenuLayout>
  );
};

export default ProjectPatients;
