"use client";

// Components
import {
  ReportPanel,
  ReportPanelRow,
  ReportPanelSection,
} from "../../ui/ReportPanel";

// Types
import { ProjectReportsAppointmentsProps } from "../types/ProjectReportsAppointmentsProps";
import { ProjectReportsAppointmentTypes } from "../../../types/ProjectReportsAppointmentTypes";

// Utils
import { getFormattedIsoDate } from "../../../utils/getFormattedIsoDate";

export const ProjectReportsAppointments = ({
  appointments,
  isLoadingReport,
}: ProjectReportsAppointmentsProps) => {
  if (!appointments && !isLoadingReport) {
    return null;
  }

  let appointmentsTotalQuantity = 0;
  let appointmentsGeneralQuantity = 0;
  let appointmentsDentalQuantity = 0;
  const generalAppointments: ProjectReportsAppointmentTypes[] = [];
  const dentalAppointments: ProjectReportsAppointmentTypes[] = [];
  // The busiest day sets the scale for both groups, so a general and a dental
  // row of the same size read as the same number of appointments.
  let highestQuantity = 0;

  appointments?.forEach((appointment) => {
    const { appointmentType, quantity } = appointment;
    const amount = Number(quantity);

    if (appointmentType === "general") {
      generalAppointments.push(appointment);
      appointmentsGeneralQuantity += amount;
    } else {
      dentalAppointments.push(appointment);
      appointmentsDentalQuantity += amount;
    }

    appointmentsTotalQuantity += amount;
    highestQuantity = Math.max(highestQuantity, amount);
  });

  const appointmentDays = new Set(
    appointments?.map(({ appointmentDate }) => appointmentDate),
  ).size;

  const renderRows = (rows: ProjectReportsAppointmentTypes[]) =>
    rows.map(({ appointmentDate, quantity }) => (
      <ReportPanelRow
        key={appointmentDate}
        label={getFormattedIsoDate({ date: appointmentDate })}
        quantity={Number(quantity)}
        share={highestQuantity ? Number(quantity) / highestQuantity : 0}
      />
    ));

  return (
    <ReportPanel
      title="Appointments"
      total={appointmentsTotalQuantity}
      subtitle={`${appointmentDays} ${appointmentDays === 1 ? "day" : "days"}`}
      isLoadingReport={isLoadingReport}
      isEmpty={appointmentsTotalQuantity === 0}
      emptyMessage="No appointments in this period."
    >
      <ReportPanelSection
        title="General"
        total={appointmentsGeneralQuantity}
        isEmpty={generalAppointments.length === 0}
        emptyMessage="No general appointments."
      >
        {renderRows(generalAppointments)}
      </ReportPanelSection>
      <ReportPanelSection
        title="Dental"
        total={appointmentsDentalQuantity}
        isEmpty={dentalAppointments.length === 0}
        emptyMessage="No dental appointments."
      >
        {renderRows(dentalAppointments)}
      </ReportPanelSection>
    </ReportPanel>
  );
};
