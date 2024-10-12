"use client";

// Components
import { Skeleton, Text } from "@radix-ui/themes";
import { Space } from "../../ui/Space";

// Types
import { ProjectReportsAppointmentsProps } from "../types/ProjectReportsAppointmentsProps";
import { ProjectReportsAppointmentTypes } from "../../../types/ProjectReportsAppointmentTypes";

// Styles
import styles from "../../ProjectReports/styles/ProjectReports.module.css";

// Utils
import { getFormattedDate } from "../../../utils/getFormattedDate";

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

  appointments?.map((appointment) => {
    const { appointmentType, quantity } = appointment;

    if (appointmentType === "general") {
      generalAppointments.push(appointment);
      appointmentsGeneralQuantity += Number(quantity);
    } else {
      dentalAppointments.push(appointment);
      appointmentsDentalQuantity += Number(quantity);
    }

    appointmentsTotalQuantity += Number(quantity);
  });

  return (
    <>
      {isLoadingReport ? (
        <Skeleton height="300px" />
      ) : (
        <div className={styles.container}>
          <div className={styles.container_title}>
            <Text size="5">{"Appointments"}</Text>
            <Text size="7">{appointmentsTotalQuantity}</Text>
          </div>
          <Space />
          <div className={styles.container_title}>
            <Text size="4">{"General"}</Text>
            <Text size="5">{appointmentsGeneralQuantity}</Text>
          </div>
          {generalAppointments.map(({ appointmentDate, quantity }, i) => (
            <>
              <div
                key={i}
                className={`${styles.container_title} ${styles.table_item}`}
              >
                <Text>{getFormattedDate(appointmentDate)}</Text>
                <Text>{quantity}</Text>
              </div>
              <Space />
            </>
          ))}
          <Space />
          <div className={styles.container_title}>
            <Text size="4">{"Dental"}</Text>
            <Text size="5">{appointmentsDentalQuantity}</Text>
          </div>
          {dentalAppointments.map(({ appointmentDate, quantity }, i) => (
            <>
              <div
                key={i}
                className={`${styles.container_title} ${styles.table_item}`}
              >
                <Text>{getFormattedDate(appointmentDate)}</Text>
                <Text>{quantity}</Text>
              </div>
              <Space />
            </>
          ))}
        </div>
      )}
    </>
  );
};
