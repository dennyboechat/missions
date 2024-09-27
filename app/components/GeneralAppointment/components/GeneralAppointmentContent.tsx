"use client";

// Components
import { Tabs, Box, Text, Grid, Button, Popover } from "@radix-ui/themes";
import { Space } from "../../ui/Space";
import { PopupConfirmation } from "../../ui/PopupConfirmation";
import { GeneralAppointmentClinicalNotes } from "./GeneralAppointmentClinicalNotes";
import { GeneralAppointmentMedicationPrescribed } from "./GeneralAppointmentMedicationPrescribed";
import { GeneralPatientHeight } from "../../GeneralPatientHeight";
import { GeneralPatientWeight } from "../../GeneralPatientWeight";
import { GeneralPatientTemperature } from "../../GeneralPatientTemperature";

// Types
import { GeneralAppointmentContentProps } from "../types/GeneralAppointmentContentProps";

// Hooks
import { useState } from "react";

// Database
import { deletePatientGeneral } from "../../../database/patient-general/DeletePatientGeneral";

export const GeneralAppointmentContent = ({
  patientGeneral,
  setPatientGeneral,
  afterDeleteAppointment,
}: GeneralAppointmentContentProps) => {
  const [isDeletingAppointment, setIsDeletingAppointment] = useState(false);
  const { patientGeneralId, patientHeight, patientWeight, patientTemperature } =
    patientGeneral;

  const onDeleteAppointment = async () => {
    setIsDeletingAppointment(true);

    await deletePatientGeneral({ patientGeneralId });

    if (afterDeleteAppointment) {
      afterDeleteAppointment();
    }

    setIsDeletingAppointment(false);
  };

  const deleteAppointmentPopupConfirmation = (
    <Box>
      <Text weight="bold">{"Confirm the appointment deletion?"}</Text>
      <Text as="p">{"This action cannot be undone."}</Text>
      <Grid columns="2" gapX="10px">
        <Button
          color="red"
          onClick={onDeleteAppointment}
          disabled={isDeletingAppointment}
          variant="outline"
        >
          {"Confirm"}
        </Button>
        <Popover.Close>
          <Button
            variant="outline"
            color="gray"
            disabled={isDeletingAppointment}
          >
            {"Cancel"}
          </Button>
        </Popover.Close>
      </Grid>
    </Box>
  );

  return (
    <Tabs.Content key={patientGeneralId} value={patientGeneralId}>
      <Space height={50} />
      <Grid columns={{ initial: "1", sm: "2" }} gap="2">
        <GeneralPatientHeight
          patientGeneralId={patientGeneralId}
          patientHeight={patientHeight}
        />
        <GeneralPatientWeight
          patientGeneralId={patientGeneralId}
          patientWeight={patientWeight}
        />
      </Grid>
      <Grid columns={{ initial: "1", sm: "2" }} gap="2">
        <GeneralPatientTemperature
          patientGeneralId={patientGeneralId}
          patientTemperature={patientTemperature}
        />
      </Grid>
      <Space height={50} />
      <GeneralAppointmentMedicationPrescribed
        patientGeneralId={patientGeneralId}
      />
      <Space height={50} />
      <GeneralAppointmentClinicalNotes
        patientGeneral={patientGeneral}
        setPatientGeneral={setPatientGeneral}
      />
      <Space height={50} />
      <Grid width={{ initial: "auto", sm: "220px" }}>
        <PopupConfirmation content={deleteAppointmentPopupConfirmation}>
          <Button color="red" variant="outline">
            {"Delete appointment"}
          </Button>
        </PopupConfirmation>
      </Grid>
    </Tabs.Content>
  );
};
