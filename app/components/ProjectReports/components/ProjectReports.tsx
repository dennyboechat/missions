"use client";

// Components
import { Container, Grid } from "@radix-ui/themes";
import { SideMenuLayout } from "../../ui/SideMenuLayout";
import { ProjectMenuItems } from "../../ProjectMenuItems";
import { ContentHeader } from "../../ContentHeader";
import { ProjectReportsFilter } from "../../ProjectReportsFilter";
import { ProjectReportsAppointments } from "../../ProjectReportsAppointments";
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
import { subtractDaysToDate } from "../../../utils/subtractDaysToDate";
import { getFormattedDate } from "../../../utils/getFormattedDate";

// Database
import { getProjectReportsMedication } from "../../../database/project-reports/GetProjectReportsMedication";
import { getProjectReportsAppointment } from "../../../database/project-reports/GetProjectReportsAppointment";

// Types
import { ProjectReportsMedicationTypes } from "../../../types/ProjectReportsMedicationTypes";
import { ProjectReportsAppointmentTypes } from "../../../types/ProjectReportsAppointmentTypes";

export const ProjectReports = ({ params }: { params: { id: string } }) => {
  const { project } = useProject();
  const currentDate = getCurrentDate();
  const startDateFilter = getFormattedDate(
    subtractDaysToDate({ date: currentDate, days: 14 })
  );
  const [startDate, setStartDate] = useState<string>(startDateFilter);
  const [endDate, setEndDate] = useState<string>(currentDate);
  const [isStartDateInvalid, setIsStartDateInvalid] = useState(false);
  const [isEndDateInvalid, setIsEndDateInvalid] = useState(false);
  const [isLoadingMedicationReport, setIsLoadingMedicationReport] =
    useState(false);
  const [medications, setMedications] = useState<
    ProjectReportsMedicationTypes[] | undefined
  >();
  const [appointments, setAppointments] = useState<
    ProjectReportsAppointmentTypes[] | undefined
  >();
  const [isLoadingAppointmentReport, setIsLoadingAppointmentReport] =
    useState(false);

  const { id: projectId } = params;

  const projectMenuItems = (
    <ProjectMenuItems projectId={projectId} activeMenuItem="project-reports" />
  );

  const onGenerateReports = async () => {
    setIsLoadingMedicationReport(true);
    setIsLoadingAppointmentReport(true);
    const isStartValid = isReportStartDateValid(startDate);
    setIsStartDateInvalid(!isStartValid);

    const isEndValid = isReportEndDateValid(endDate);
    setIsEndDateInvalid(!isEndValid);

    if (isStartValid && isEndValid) {
      const projectReportsMedication = await getProjectReportsMedication({
        projectId,
        startDate,
        endDate,
      });

      setMedications(projectReportsMedication);

      const projectReportsAppointment = await getProjectReportsAppointment({
        projectId,
        startDate,
        endDate,
      });

      setAppointments(projectReportsAppointment);
    }

    setIsLoadingMedicationReport(false);
    setIsLoadingAppointmentReport(false);
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
          <ProjectReportsAppointments
            appointments={appointments}
            isLoadingReport={isLoadingAppointmentReport}
          />
          <ProjectReportsMedication
            medications={medications}
            isLoadingReport={isLoadingMedicationReport}
          />
        </Grid>
      </Container>
    </SideMenuLayout>
  );
};
