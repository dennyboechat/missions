"use client";

// Components
import { Box, Text } from "@radix-ui/themes";
import { MedicationTable } from "../../ui/MedicationTable";

// Types
import { PatientDentistryId } from "../../../types/PatientDentistryTypes";

export const DentalAppointmentMedicationPrescribed = ({
  patientDentistryId,
}: {
  patientDentistryId: PatientDentistryId;
}) => (
  <Box>
    <Text>{"Prescribed medication"}</Text>
    <MedicationTable patientDentistryId={patientDentistryId} />
  </Box>
);
