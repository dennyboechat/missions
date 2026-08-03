"use client";

// Components
import { Tabs } from "@radix-ui/themes";

// Types
import { PatientGeneralTypes } from "../../../types/PatientGeneralTypes";

// Hooks
import { useProjectFormats } from "../../../lib/useProjectFormats";

// Utils

export const GeneralAppointmentList = ({
  patientGeneral,
}: {
  patientGeneral: PatientGeneralTypes;
}) => {
  const { formatDate } = useProjectFormats();
  const { patientGeneralId, appointmentDate } = patientGeneral;

  const formattedAppointmentDate = formatDate(appointmentDate);

  return (
    <Tabs.Trigger key={patientGeneralId} value={patientGeneralId}>
      {formattedAppointmentDate}
    </Tabs.Trigger>
  );
};
