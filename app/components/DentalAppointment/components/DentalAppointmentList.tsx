"use client";

// Components
import { Tabs } from "@radix-ui/themes";

// Types
import { PatientDentistryTypes } from "../../../types/PatientDentistryTypes";

// Utils
import { getLocaleFormattedDate } from "../../../utils/getLocaleFormattedDate";

export const DentalAppointmentList = ({
  patientDentistry,
}: {
  patientDentistry: PatientDentistryTypes;
}) => {
  const { patientDentistryId, appointmentDate } = patientDentistry;

  const formattedAppointmentDate = getLocaleFormattedDate({
    date: appointmentDate,
  });

  return (
    <Tabs.Trigger key={patientDentistryId} value={patientDentistryId}>
      {formattedAppointmentDate}
    </Tabs.Trigger>
  );
};
