"use client";

// Components
import { Container, Button } from "@radix-ui/themes";
import { ContentHeader } from "../../ContentHeader";
import { Icon } from "../../ui/Icon";
import { GeneralAppointment } from "../../GeneralAppointment";

// Styles
import styles from "../../../styles/content.module.css";

// Database
import { getPatientGeneral } from "../../../database/patient-general/GetPatientGeneral";
import { insertPatientGeneral } from "../../../database/patient-general/InsertPatientGeneral";

// Hooks
import { useState, useEffect } from "react";
import { useSaveField } from "../../../lib/useSaveField";

// Types
import { PatientGeneralTypes } from "../../../types/PatientGeneralTypes";

// Utils

// Types
import { actionData } from "../../../types/ActionResult";

export const PatientGeneral = ({ params }: { params: { id: string } }) => {
  const { save } = useSaveField();
  const [patientGeneral, setPatientGeneral] = useState<PatientGeneralTypes[]>();
  const [lastestAppointment, setLastestAppointment] =
    useState<PatientGeneralTypes>();

  const { id: patientPersonalId } = params;

  useEffect(() => {
    const fetchPatientGeneral = async () => {
      if (patientPersonalId) {
        const patientGeneralData = actionData(
          await getPatientGeneral({
            patientPersonalId: patientPersonalId,
          }),
        );
        setPatientGeneral(patientGeneralData);

        if (patientGeneralData) {
          setLastestAppointment(patientGeneralData[0]);
        }
      }
    };

    fetchPatientGeneral();
  }, [patientPersonalId]);

  if (!patientGeneral || !lastestAppointment) {
    return null;
  }

  const updateAppointments = async () => {
    const patientDentistriesData = actionData(
      await getPatientGeneral({
        patientPersonalId: patientPersonalId,
      }),
    );

    setPatientGeneral(patientDentistriesData);

    return patientDentistriesData;
  };

  const onCreateAppointment = async () => {
    const patientGeneralData = await save(() =>
      insertPatientGeneral({ patientPersonalId: patientPersonalId }),
    );

    if (patientGeneralData) {
      const newLastestAppointment = {
        ...lastestAppointment,
        patientGeneralId: patientGeneralData.patientGeneralId,
        appointmentDate: patientGeneralData.appointmentDate,
        appointmentNotes: patientGeneralData.appointmentNotes,
      };

      setLastestAppointment(newLastestAppointment);

      updateAppointments();
    }
  };

  const afterDeleteAppointment = async () => {
    const patientGeneralData = await updateAppointments();

    if (patientGeneralData) {
      const newLastestAppointment = patientGeneralData[0];
      setLastestAppointment(newLastestAppointment);
    }
  };

  // The query LEFT JOINs the appointment onto the patient, so a patient with
  // no general record still comes back as one row with a null appointment id.
  // Counting rows would announce an appointment that does not exist.
  const appointmentCount = patientGeneral.filter(
    ({ patientGeneralId }) => patientGeneralId,
  ).length;

  return (
    <Container className={styles.content}>
      <ContentHeader
        text="General"
        subText={`${appointmentCount} ${
          appointmentCount === 1 ? "appointment" : "appointments"
        } on this mission.`}
        actions={
          <Button onClick={onCreateAppointment}>
            <Icon name="plus" size={17} />
            {"Create appointment"}
          </Button>
        }
      />
      {lastestAppointment.patientGeneralId && (
        <GeneralAppointment
          patientGeneral={patientGeneral}
          setPatientGeneral={setPatientGeneral}
          defaultActiveTab={lastestAppointment.patientGeneralId}
          afterDeleteAppointment={afterDeleteAppointment}
        />
      )}
    </Container>
  );
};
