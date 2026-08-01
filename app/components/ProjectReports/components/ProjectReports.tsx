"use client";

// Components
import { Container, Grid } from "@radix-ui/themes";
import { ContentHeader } from "../../ContentHeader";
import { ProjectReportsFilter } from "../../ProjectReportsFilter";
import { ProjectReportsAppointments } from "../../ProjectReportsAppointments";
import { ProjectReportsMedication } from "../../ProjectReportsMedication";
import { Space } from "../../ui/Space";

// Hooks
import { useProject } from "../../../lib/ProjectContext";
import { usePopupMessage } from "../../../lib/PopupMessage";
import { useState, useEffect, useRef } from "react";

// Styles
import styles from "../../../styles/content.module.css";

// Utils
import { isReportStartDateValid } from "../utils/isReportStartDateValid";
import { isReportEndDateValid } from "../utils/isReportEndDateValid";
import { getCurrentDateTime } from "../../../utils/getCurrentDateTime";
import { subtractDaysToDate } from "../../../utils/subtractDaysToDate";
import { subtractDaysFromIsoDate } from "../../../utils/subtractDaysFromIsoDate";
import { getTodayInTimezone } from "../../../utils/getTodayInTimezone";
import { getFormattedDate } from "../../../utils/getFormattedDate";

// Database
import { getProjectReportsMedication } from "../../../database/project-reports/GetProjectReportsMedication";
import { getProjectReportsAppointment } from "../../../database/project-reports/GetProjectReportsAppointment";
import { getProjectTimezone } from "../../../database/project/GetProjectTimezone";

// Types
import { ProjectReportsMedicationTypes } from "../../../types/ProjectReportsMedicationTypes";
import { ProjectReportsAppointmentTypes } from "../../../types/ProjectReportsAppointmentTypes";
import { getProjectReportsAllData } from "@/app/database/project-reports/GetProjectReportsAllData";
import { exportToCsv } from "../../../utils/exportToCsv";

// Types
import { actionData } from "../../../types/ActionResult";
import { PopupMessageType } from "../../../lib/types/PopupMessageContextType";

export const ProjectReports = ({ params }: { params: { id: string } }) => {
  const { project } = useProject();
  const { setMessage, setMessageType } = usePopupMessage();
  const currentDate = getCurrentDateTime();
  const startDateFilter = getFormattedDate({
    date: subtractDaysToDate({ date: currentDate, days: 14 }),
    format: "yyyy-MM-dd",
  });
  const [startDate, setStartDate] = useState<string>(startDateFilter);
  const [endDate, setEndDate] = useState<string>(
    getFormattedDate({ date: currentDate, format: "yyyy-MM-dd" }),
  );
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

  // The browser's today is only a placeholder until the project's own today is
  // known, so a report opened from another continent still defaults to the
  // mission's last 14 days. The ref keeps a late-arriving timezone from
  // overwriting dates the user has already picked.
  const hasAppliedProjectDates = useRef(false);

  useEffect(() => {
    const applyProjectDates = async () => {
      const timeZone = actionData(await getProjectTimezone({ projectId }));

      if (!timeZone || hasAppliedProjectDates.current) {
        return;
      }

      hasAppliedProjectDates.current = true;

      const today = getTodayInTimezone({ timeZone });
      setEndDate(today);
      setStartDate(subtractDaysFromIsoDate({ date: today, days: 14 }));
    };

    applyProjectDates();
  }, [projectId]);

  const onGenerateReports = async () => {
    setIsLoadingMedicationReport(true);
    setIsLoadingAppointmentReport(true);
    const isStartValid = isReportStartDateValid(startDate);
    setIsStartDateInvalid(!isStartValid);

    const isEndValid = isReportEndDateValid(endDate);
    setIsEndDateInvalid(!isEndValid);

    if (isStartValid && isEndValid) {
      const projectReportsMedication = actionData(
        await getProjectReportsMedication({
          projectId,
          startDate,
          endDate,
        }),
      );

      setMedications(projectReportsMedication);

      const projectReportsAppointment = actionData(
        await getProjectReportsAppointment({
          projectId,
          startDate,
          endDate,
        }),
      );

      setAppointments(projectReportsAppointment);
    }

    setIsLoadingMedicationReport(false);
    setIsLoadingAppointmentReport(false);
  };

  const showMessage = (message: string, type: PopupMessageType) => {
    if (setMessage && setMessageType) {
      setMessage(message);
      setMessageType(type);
    }
  };

  const onDownloadAllData = async () => {
    const isStartValid = isReportStartDateValid(startDate);
    setIsStartDateInvalid(!isStartValid);

    const isEndValid = isReportEndDateValid(endDate);
    setIsEndDateInvalid(!isEndValid);

    if (isStartValid && isEndValid) {
      const allData = actionData(
        await getProjectReportsAllData({
          projectId,
          startDate,
          endDate,
        }),
      );

      // Nothing came back at all: the query itself did not get through.
      if (!allData) {
        showMessage("Error to download the data. Please try again.", "error");
        return;
      }

      // A download that produces no file looks broken, so the empty period is
      // spelled out rather than the button doing nothing.
      if (allData.length === 0) {
        showMessage(
          `No data to download between ${startDate} and ${endDate}.`,
          "regular",
        );
        return;
      }

      exportToCsv({
        data: allData.map((row) => ({
          ...row,
          // A plain YYYY-MM-DD date already.
          patientDateOfBirth: row.patientDateOfBirth ?? "",
          // Already YYYY-MM-DD in the project's timezone.
          generalAppointmentDate: row.generalAppointmentDate ?? "",
          dentalAppointmentDate: row.dentalAppointmentDate ?? "",
        })),
        headers: [
          { key: "patientFullName", label: "Patient Name" },
          { key: "patientDateOfBirth", label: "Date of Birth" },
          { key: "patientPhoneNumber", label: "Phone Number" },
          { key: "gender", label: "Gender" },
          {
            key: "generalAppointmentDate",
            label: "General Appointment Date",
          },
          { key: "generalNotes", label: "General Notes" },
          {
            key: "generalPrescribedMedications",
            label: "General Prescribed Medications",
          },
          { key: "patientHeight", label: "Height" },
          { key: "patientWeight", label: "Weight" },
          { key: "patientTemperature", label: "Temperature" },
          { key: "patientBloodGlucose", label: "Blood Glucose" },
          { key: "patientPulse", label: "Pulse" },
          { key: "patientOxygenSaturation", label: "Oxygen Saturation" },
          {
            key: "patientBloodPressureDiastolic",
            label: "Blood Pressure Diastolic",
          },
          { key: "dentalAppointmentDate", label: "Dental Appointment Date" },
          { key: "dentalNotes", label: "Dental Notes" },
          {
            key: "dentalPrescribedMedications",
            label: "Dental Prescribed Medications",
          },
          { key: "teethNames", label: "Teeth Names" },
        ],
        filename: `report_${startDate}_${endDate}.csv`,
      });
    }
  };

  return (
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
  );
};
