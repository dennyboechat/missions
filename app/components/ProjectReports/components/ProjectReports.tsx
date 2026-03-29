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
import { getCurrentDateTime } from "../../../utils/getCurrentDateTime";
import { subtractDaysToDate } from "../../../utils/subtractDaysToDate";
import { getFormattedDate } from "../../../utils/getFormattedDate";

// Database
import { getProjectReportsMedication } from "../../../database/project-reports/GetProjectReportsMedication";
import { getProjectReportsAppointment } from "../../../database/project-reports/GetProjectReportsAppointment";

// Types
import { ProjectReportsMedicationTypes } from "../../../types/ProjectReportsMedicationTypes";
import { ProjectReportsAppointmentTypes } from "../../../types/ProjectReportsAppointmentTypes";
import { getProjectReportsAllData } from "@/app/database/project-reports/GetProjectReportsAllData";
import { exportToCsv } from "../../../utils/exportToCsv";

export const ProjectReports = ({ params }: { params: { id: string } }) => {
  const { project } = useProject();
  const currentDate = getCurrentDateTime();
  const startDateFilter = getFormattedDate({
    date: subtractDaysToDate({ date: currentDate, days: 14 }),
    format: 'yyyy-MM-dd'
  });
  const [startDate, setStartDate] = useState<string>(startDateFilter);
  const [endDate, setEndDate] = useState<string>(getFormattedDate({date: currentDate, format: 'yyyy-MM-dd'}));
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

  const onDownloadAllData = async () => {
    const isStartValid = isReportStartDateValid(startDate);
    setIsStartDateInvalid(!isStartValid);

    const isEndValid = isReportEndDateValid(endDate);
    setIsEndDateInvalid(!isEndValid);

    if (isStartValid && isEndValid) {
      const allData = await getProjectReportsAllData({
        projectId,
        startDate,
        endDate,
      });

      if (allData && allData.length > 0) {
        exportToCsv({
          data: allData.map((row) => ({
            ...row,
            patientDateOfBirth: row.patientDateOfBirth
              ? getFormattedDate({ date: new Date(row.patientDateOfBirth), format: "yyyy-MM-dd" })
              : "",
            generalAppointmentDate: row.generalAppointmentDate
              ? getFormattedDate({ date: new Date(row.generalAppointmentDate), format: "yyyy-MM-dd" })
              : "",
            dentalAppointmentDate: row.dentalAppointmentDate
              ? getFormattedDate({ date: new Date(row.dentalAppointmentDate), format: "yyyy-MM-dd" })
              : "",
          })),
          headers: [
            { key: "patientFullName", label: "Patient Name" },
            { key: "patientDateOfBirth", label: "Date of Birth" },
            { key: "patientPhoneNumber", label: "Phone Number" },
            { key: "gender", label: "Gender" },
            { key: "generalAppointmentDate", label: "General Appointment Date" },
            { key: "generalNotes", label: "General Notes" },
            { key: "generalPrescribedMedications", label: "General Prescribed Medications" },
            { key: "patientHeight", label: "Height" },
            { key: "patientWeight", label: "Weight" },
            { key: "patientTemperature", label: "Temperature" },
            { key: "patientBloodGlucose", label: "Blood Glucose" },
            { key: "patientPulse", label: "Pulse" },
            { key: "patientOxygenSaturation", label: "Oxygen Saturation" },
            { key: "patientBloodPressureDiastolic", label: "Blood Pressure Diastolic" },
            { key: "dentalAppointmentDate", label: "Dental Appointment Date" },
            { key: "dentalNotes", label: "Dental Notes" },
            { key: "dentalPrescribedMedications", label: "Dental Prescribed Medications" },
            { key: "teethNames", label: "Teeth Names" },
          ],
          filename: `report_${startDate}_${endDate}.csv`,
        });
      }
    }
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
          onDownloadAllData={onDownloadAllData}
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
