"use client";

// Components
import { Tabs } from "@radix-ui/themes";

// Types
import { PatientGeneralTypes } from "../../../types/PatientGeneralTypes";

// Utils
import { getLocaleFormattedDate } from "../../../utils/getLocaleFormattedDate";

export const GeneralAppointmentList = ({
  patientGeneral,
}: {
  patientGeneral: PatientGeneralTypes;
}) => {
  const { patientGeneralId, appointmentDate } = patientGeneral;

  const formattedAppointmentDate = getLocaleFormattedDate({
    date: appointmentDate,
  });

  return (
    <Tabs.Trigger key={patientGeneralId} value={patientGeneralId}>
      {formattedAppointmentDate}
    </Tabs.Trigger>
  );
};
