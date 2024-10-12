"use client";

// Components
import { Container, Grid } from "@radix-ui/themes";
import { SideMenuLayout } from "../../ui/SideMenuLayout";
import { ProjectMenuItems } from "../../ProjectMenuItems";
import { ContentHeader } from "../../ContentHeader";
import { ProjectReportsFilter } from "../../ProjectReportsFilter";
import { ProjectReportsMedication } from "../../ProjectReportsMedication";
import { Space } from "../../ui/Space";

// Hooks
import { useProject } from "../../../lib/ProjectContext";
import { useState } from "react";

// Styles
import styles from "../../../styles/content.module.css";

// Utils
import { isReportStartDateValid } from "../utils/isReportStartDateValid";
import { isReportEndDateValid } from "../utils/isReportEndDateValid";
import { getCurrentDate } from "../../../utils/getCurrentDate";

// Database
import { getProjectReports } from "../../../database/project-reports/GetProjectReports";

// Types
import { ProjectReportsTypes } from "../../../types/ProjectReportsTypes";

export const ProjectReports = ({ params }: { params: { id: string } }) => {
  const { project } = useProject();
  const [startDate, setStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>(getCurrentDate());
  const [isStartDateInvalid, setIsStartDateInvalid] = useState(false);
  const [isEndDateInvalid, setIsEndDateInvalid] = useState(false);
  const [isLoadingMedicationReport, setIsLoadingMedicationReport] =
    useState(false);
  const [medications, setMedications] = useState<
    ProjectReportsTypes[] | undefined
  >();

  const { id: projectId } = params;

  const projectMenuItems = (
    <ProjectMenuItems projectId={projectId} activeMenuItem="project-reports" />
  );

  const onGenerateReports = async () => {
    setIsLoadingMedicationReport(true);
    const isStartValid = isReportStartDateValid(startDate);
    setIsStartDateInvalid(!isStartValid);

    const isEndValid = isReportEndDateValid(endDate);
    setIsEndDateInvalid(!isEndValid);

    if (isStartValid && isEndValid) {
      const projectReports = await getProjectReports({
        projectId,
        startDate,
        endDate,
      });

      setMedications(projectReports);
    }

    setIsLoadingMedicationReport(false);
  };

  return (
    <SideMenuLayout
      menuItems={projectMenuItems}
      header={project?.projectName ?? ""}
    >
      <Container className={styles.content}>
        <ContentHeader text="Reports" />
        <Space />
        <ProjectReportsFilter
          startDate={startDate}
          setStartDate={setStartDate}
          isStartDateInvalid={isStartDateInvalid}
          endDate={endDate}
          setEndDate={setEndDate}
          isEndDateInvalid={isEndDateInvalid}
          onGenerateReports={onGenerateReports}
        />
        <Space height={30} />
        <Grid gap="10px" columns={{ sm: "2" }}>
          <ProjectReportsMedication
            medications={medications}
            isLoadingReport={isLoadingMedicationReport}
          />
        </Grid>
      </Container>
    </SideMenuLayout>
  );
};
