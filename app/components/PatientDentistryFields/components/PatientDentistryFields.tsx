"use client";

// Components
import { Grid } from "@radix-ui/themes";

// Types
import { PatientDentistryFieldsProps } from "../types/PatientDentistryFieldsProps";

// Hooks
import { usePopupMessage } from "../../../lib/PopupMessage";

export const PatientDentistryFields = ({
  patientDentistryFields,
  setPatientDentistryFields,
}: PatientDentistryFieldsProps) => {
  const { setMessage } = usePopupMessage();

  return <Grid gap="10px" width={{ xs: "auto", sm: "500px" }}></Grid>;
};
