"use client";

// Components
import { Container, Table, Link, Button } from "@radix-ui/themes";
import { SideMenuLayout } from "../../components/ui/SideMenuLayout";
import { ProjectMenuItems } from "../../components/ProjectMenuItems";
import { ContentHeader } from "../../components/ContentHeader";
import { DataTable } from "../../components/ui/DataTable";
import { Space } from "../../components/ui/Space";

// Styles
import styles from "../../styles/content.module.css";

// Hooks
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProject } from "../../lib/ProjectContext";

// Database
import { getPatientPersonals } from "../../database/patient-personal/GetPatientPersonals";

// Types
import { PatientPersonalTypes } from "../../types/PatientPersonalTypes";

// Utils
import { getFilteredPatientPersonals } from "../../utils/getFilteredPatientPersonals";
import { getLocaleFormattedDate } from "../../utils/getLocaleFormattedDate";
import { getGenderLabel } from "../../utils/getGenderLabel";
import { getAge } from "../../utils/getAge";

const ProjectPatients = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { project } = useProject();
  const [patientPersonals, setPatientPersonals] = useState<
    PatientPersonalTypes[]
  >([]);
  const [searchText, setSearchText] = useState<string | undefined>();

  useEffect(() => {
    const fetchProjects = async () => {
      if (project) {
        const { projectId } = project;
        const projectPersonalsData = await getPatientPersonals({
          projectId: projectId,
        });
        setPatientPersonals(projectPersonalsData ?? []);
      }
    };

    fetchProjects();
  }, [project]);

  const { id: projectId } = params;
  const projectMenuItems = (
    <ProjectMenuItems projectId={projectId} activeMenuItem="project-patients" />
  );

  const tableHeader = (
    <Table.Row>
      <Table.ColumnHeaderCell>{"Full name"}</Table.ColumnHeaderCell>
      <Table.ColumnHeaderCell>{"Date of birth"}</Table.ColumnHeaderCell>
      <Table.ColumnHeaderCell>{"Gender"}</Table.ColumnHeaderCell>
      <Table.ColumnHeaderCell>{"Phone number"}</Table.ColumnHeaderCell>
    </Table.Row>
  );

  const filteredPatientPersonals = getFilteredPatientPersonals({
    patientPersonals,
    filterText: searchText,
  });

  return (
    <SideMenuLayout
      menuItems={projectMenuItems}
      header={project?.projectName ?? ""}
    >
      <Container className={styles.content}>
        <ContentHeader text="Patients" />
        <Button
          onClick={() => {
            router.push(`/project-patient/${projectId}`);
          }}
        >
          {"Add patient"}
        </Button>
        <Space />
        <DataTable
          tableHeader={tableHeader}
          onSearchTextChange={(text) => setSearchText(text)}
          isSearchAutoFocus
          records={filteredPatientPersonals}
        >
          {filteredPatientPersonals.map(
            ({
              patientPersonalId,
              patientFullName,
              patientDateOfBirth,
              isPatientMale,
              patientPhoneNumber,
            }) => (
              <Table.Row key={patientPersonalId}>
                <Table.RowHeaderCell>
                  <Link href={`/patient-summary/${patientPersonalId}`}>
                    {patientFullName}
                  </Link>
                </Table.RowHeaderCell>
                <Table.Cell>
                  {`${getLocaleFormattedDate({
                    date: patientDateOfBirth,
                  })} (${getAge({
                    date: patientDateOfBirth,
                  })}yo)`}
                </Table.Cell>
                <Table.Cell>{getGenderLabel({ isPatientMale })}</Table.Cell>
                <Table.Cell>{patientPhoneNumber}</Table.Cell>
              </Table.Row>
            )
          )}
        </DataTable>
      </Container>
    </SideMenuLayout>
  );
};

export default ProjectPatients;
