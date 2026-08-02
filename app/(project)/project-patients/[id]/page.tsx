"use client";

// Components
import { Container, Table, Link, Button } from "@radix-ui/themes";
import NextLink from "next/link";
import { ContentHeader } from "../../../components/ContentHeader";
import { DataTable } from "../../../components/ui/DataTable";
import { Icon } from "../../../components/ui/Icon";

// Styles
import styles from "../../../styles/content.module.css";

// Hooks
import { memo, useMemo, useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useProject } from "../../../lib/ProjectContext";

// Database
import { getPatientPersonals } from "../../../database/patient-personal/GetPatientPersonals";

// Types
import { PatientPersonalTypes } from "../../../types/PatientPersonalTypes";

// Utils
import { getFilteredPatientPersonals } from "../../../utils/getFilteredPatientPersonals";
import { getLocaleFormattedDate } from "../../../utils/getLocaleFormattedDate";
import { getGenderLabel } from "../../../utils/getGenderLabel";
import { getAge } from "../../../utils/getAge";

// Types
import { actionData } from "../../../types/ActionResult";

/**
 * A mission can run to hundreds of patients -- this list renders every one, so
 * the table is a few thousand nodes. Memoising the row keeps a state change on
 * the page (the search settling, records arriving) from rebuilding all of them,
 * since a patient's own fields have not changed.
 */
const PatientRow = memo(function PatientRow({
  patientPersonalId,
  patientFullName,
  patientDateOfBirth,
  isPatientMale,
  patientPhoneNumber,
}: PatientPersonalTypes) {
  return (
    <Table.Row>
      <Table.RowHeaderCell>
        <Link asChild>
          <NextLink href={`/patient-summary/${patientPersonalId}`}>
            {patientFullName}
          </NextLink>
        </Link>
      </Table.RowHeaderCell>
      <Table.Cell className="mi-numeric">
        {`${getLocaleFormattedDate({ date: patientDateOfBirth })} (${getAge({
          date: patientDateOfBirth,
        })}yo)`}
      </Table.Cell>
      <Table.Cell>{getGenderLabel({ isPatientMale })}</Table.Cell>
      <Table.Cell className="mi-numeric">{patientPhoneNumber}</Table.Cell>
    </Table.Row>
  );
});

const ProjectPatients = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: projectId } = use(params);
  const router = useRouter();
  const { project } = useProject();
  const [patientPersonals, setPatientPersonals] = useState<
    PatientPersonalTypes[]
  >([]);
  const [searchText, setSearchText] = useState<string | undefined>();
  // The project arrives from context a beat after the route does, so the list
  // stays "loading" until a fetch has actually answered. Otherwise the empty
  // state claims a mission has no patients while its patients are in flight.
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      if (project) {
        const { projectId } = project;
        const projectPersonalsData = actionData(
          await getPatientPersonals({
            projectId: projectId,
          }),
        );
        setPatientPersonals(projectPersonalsData ?? []);
        setIsLoadingPatients(false);
      }
    };

    fetchProjects();
  }, [project]);

  const tableHeader = (
    <Table.Row>
      <Table.ColumnHeaderCell>{"Full name"}</Table.ColumnHeaderCell>
      <Table.ColumnHeaderCell>{"Date of birth"}</Table.ColumnHeaderCell>
      <Table.ColumnHeaderCell>{"Gender"}</Table.ColumnHeaderCell>
      <Table.ColumnHeaderCell>{"Phone number"}</Table.ColumnHeaderCell>
    </Table.Row>
  );

  const filteredPatientPersonals = useMemo(
    () => getFilteredPatientPersonals({ patientPersonals, filterText: searchText }),
    [patientPersonals, searchText],
  );

  return (
    <Container className={styles.content}>
      <ContentHeader
        text="Patients"
        subText={
          project ? `Everyone seen on ${project.projectName}.` : undefined
        }
        actions={
          <Button
            onClick={() => {
              router.push(`/project-patient/${projectId}`);
            }}
          >
            <Icon name="plus" size={17} />
            {"Add patient"}
          </Button>
        }
      />
      <DataTable
        tableHeader={tableHeader}
        onSearchTextChange={(text) => setSearchText(text)}
        isSearchAutoFocus
        searchPlaceholder="Search by name or phone..."
        records={filteredPatientPersonals}
        isLoading={isLoadingPatients}
        noun="patient"
        emptyTitle="No patients yet"
        emptyBody="Patients you register on this mission will appear here."
        emptyAction={
          <Button
            onClick={() => {
              router.push(`/project-patient/${projectId}`);
            }}
          >
            <Icon name="plus" size={17} />
            {"Add the first patient"}
          </Button>
        }
      >
        {filteredPatientPersonals.map((patientPersonal) => (
          <PatientRow
            key={patientPersonal.patientPersonalId}
            {...patientPersonal}
          />
        ))}
      </DataTable>
    </Container>
  );
};

export default ProjectPatients;
