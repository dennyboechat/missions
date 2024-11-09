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
import { GeneralPatientBloodGlucose } from "../../GeneralPatientBloodGlucose";
import { GeneralPatientPulse } from "../../GeneralPatientPulse";
import { GeneralPatientOxygenSaturation } from "../../GeneralPatientOxygenSaturation";
import { GeneralPatientBloodPressure } from "../../GeneralPatientBloodPressure";
import { GeneralPatientVisionLeft } from "../../GeneralPatientVisionLeft";
import { GeneralPatientVisionRight } from "../../GeneralPatientVisionRight";
import { PatientBodyMassIndex } from "../../PatientBodyMassIndex";
import { GeneralAppointmentReferral } from "./GeneralAppointmentReferral";

// Types
import { GeneralAppointmentContentProps } from "../types/GeneralAppointmentContentProps";

// Hooks
import { useState } from "react";

// Database
import { deletePatientGeneral } from "../../../database/patient-general/DeletePatientGeneral";

// Styles
import styles from "../styles/GeneralAppointment.module.css";

export const GeneralAppointmentContent = ({
  patientGeneral,
  setPatientGeneral,
  afterDeleteAppointment,
}: GeneralAppointmentContentProps) => {
  const [isDeletingAppointment, setIsDeletingAppointment] = useState(false);
  const {
    patientGeneralId,
    patientHeight,
    patientWeight,
    patientTemperature,
    patientBloodGlucose,
    patientPulse,
    patientOxygenSaturation,
    patientBloodPressureSystolic,
    patientBloodPressureDiastolic,
    patientVisionLeftTestedDistance,
    patientVisionLeftNormalDistance,
    patientVisionRightTestedDistance,
    patientVisionRightNormalDistance,
  } = patientGeneral;

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
      <Space height={20} />
      <Grid
        columns={{ initial: "1", sm: "1fr 1fr 80px" }}
        gap="5"
        className={styles.height_weight_panel}
      >
        <GeneralPatientHeight
          patientGeneralId={patientGeneralId}
          patientHeight={patientHeight}
          setPatientGeneral={setPatientGeneral}
        />
        <GeneralPatientWeight
          patientGeneralId={patientGeneralId}
          patientWeight={patientWeight}
          setPatientGeneral={setPatientGeneral}
        />
        <PatientBodyMassIndex weight={patientWeight} height={patientHeight} />
      </Grid>
      <Space height={20} />
      <Grid
        columns={{ initial: "1", sm: "3" }}
        gap="5"
        className={styles.temperature_panel}
      >
        <GeneralPatientTemperature
          patientGeneralId={patientGeneralId}
          patientTemperature={patientTemperature}
        />
        <GeneralPatientPulse
          patientGeneralId={patientGeneralId}
          patientPulse={patientPulse}
        />
        <GeneralPatientOxygenSaturation
          patientGeneralId={patientGeneralId}
          patientOxygenSaturation={patientOxygenSaturation}
        />
      </Grid>
      <Space height={20} />
      <Grid
        columns={{ initial: "1", sm: "2" }}
        gap="5"
        className={styles.blood_panel}
      >
        <GeneralPatientBloodGlucose
          patientGeneralId={patientGeneralId}
          patientBloodGlucose={patientBloodGlucose}
        />
        <GeneralPatientBloodPressure
          patientGeneralId={patientGeneralId}
          patientBloodPressureSystolic={patientBloodPressureSystolic}
          patientBloodPressureDiastolic={patientBloodPressureDiastolic}
        />
      </Grid>
      <Space height={20} />
      <Grid
        columns={{ initial: "1", sm: "2" }}
        gap="5"
        className={styles.vision_panel}
      >
        <GeneralPatientVisionLeft
          patientGeneralId={patientGeneralId}
          patientVisionLeftTestedDistance={patientVisionLeftTestedDistance}
          patientVisionLeftNormalDistance={patientVisionLeftNormalDistance}
        />
        <GeneralPatientVisionRight
          patientGeneralId={patientGeneralId}
          patientVisionRightTestedDistance={patientVisionRightTestedDistance}
          patientVisionRightNormalDistance={patientVisionRightNormalDistance}
        />
      </Grid>
      <Space height={40} />
      <GeneralAppointmentMedicationPrescribed
        patientGeneralId={patientGeneralId}
      />
      <Space height={40} />
      <GeneralAppointmentClinicalNotes
        patientGeneral={patientGeneral}
        setPatientGeneral={setPatientGeneral}
      />
      <Space height={40} />
      <GeneralAppointmentReferral
        patientGeneral={patientGeneral}
        setPatientGeneral={setPatientGeneral}
      />
      <Space height={40} />
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
