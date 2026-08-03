"use client";

// Components
import { Tabs } from "@radix-ui/themes";

// Types
import { PatientDentistryTypes } from "../../../types/PatientDentistryTypes";

// Hooks
import { useProjectFormats } from "../../../lib/useProjectFormats";

// Utils

export const DentalAppointmentList = ({
  patientDentistry,
}: {
  patientDentistry: PatientDentistryTypes;
}) => {
  const { formatDate } = useProjectFormats();
  const { patientDentistryId, appointmentDate } = patientDentistry;

  const formattedAppointmentDate = formatDate(appointmentDate);

  return (
    <Tabs.Trigger key={patientDentistryId} value={patientDentistryId}>
      {formattedAppointmentDate}
    </Tabs.Trigger>
  );
};
