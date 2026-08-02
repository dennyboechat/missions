"use client";

// Components
import { Container, Button } from "@radix-ui/themes";
import { ContentHeader } from "../../../components/ContentHeader";
import { Icon } from "../../../components/ui/Icon";
import { DentalAppointment } from "../../../components/DentalAppointment";

// Styles
import styles from "../../../styles/content.module.css";

// Database
import { getPatientDentistries } from "../../../database/patient-dentistry/GetPatientDentistries";
import { insertPatientDentistry } from "../../../database/patient-dentistry/InsertPatientDentistry";

// Hooks
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { usePopupMessage } from "../../../lib/PopupMessage";
import { useSaveField } from "../../../lib/useSaveField";

// Types
import { PatientDentistryTypes } from "../../../types/PatientDentistryTypes";

// Utils

// Types
import { actionData } from "../../../types/ActionResult";

const PatientDentistry = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: patientPersonalId } = use(params);
  const router = useRouter();
  const { setMessage, setMessageType } = usePopupMessage();
  const { save } = useSaveField();
  const [patientDentistries, setPatientDentistries] =
    useState<PatientDentistryTypes[]>();
  const [lastestAppointment, setLastestAppointment] =
    useState<PatientDentistryTypes>();

  useEffect(() => {
    const fetchPatientDentistry = async () => {
      if (patientPersonalId) {
        const patientDentistryData = actionData(
          await getPatientDentistries({
            patientPersonalId: patientPersonalId,
          }),
        );
        setPatientDentistries(patientDentistryData);

        if (patientDentistryData) {
          setLastestAppointment(patientDentistryData[0]);
        }
      }
    };

    fetchPatientDentistry();
  }, [patientPersonalId]);

  if (!patientDentistries || !lastestAppointment) {
    return null;
  }

  const updateAppointments = async () => {
    const patientDentistriesData = actionData(
      await getPatientDentistries({
        patientPersonalId: patientPersonalId,
      }),
    );

    setPatientDentistries(patientDentistriesData);

    return patientDentistriesData;
  };

  const onCreateAppointment = async () => {
    const patientDentistryData = await save(() =>
      insertPatientDentistry({ patientPersonalId: patientPersonalId }),
    );

    if (patientDentistryData) {
      const newLastestAppointment = {
        ...lastestAppointment,
        patientDentistryId: patientDentistryData.patientDentistryId,
        appointmentDate: patientDentistryData.appointmentDate,
        appointmentNotes: patientDentistryData.appointmentNotes,
      };

      setLastestAppointment(newLastestAppointment);

      if (setMessage && setMessageType) {
        setMessage("Saved");
        setMessageType("regular");
      }

      updateAppointments();
    } else if (setMessage && setMessageType) {
      setMessage("Error to save. Please try again.");
      setMessageType("error");
    }
  };

  const afterDeleteAppointment = async () => {
    const patientDentistriesData = await updateAppointments();

    if (patientDentistriesData) {
      const newLastestAppointment = patientDentistriesData[0];
      setLastestAppointment(newLastestAppointment);
    }
  };

  // The query LEFT JOINs the appointment onto the patient, so a patient with
  // no dental record still comes back as one row with a null appointment id.
  // Counting rows would announce an appointment that does not exist.
  const appointmentCount = patientDentistries.filter(
    ({ patientDentistryId }) => patientDentistryId,
  ).length;

  return (
    <Container className={styles.content}>
      <ContentHeader
        text="Dental"
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
      {lastestAppointment.patientDentistryId && (
        <DentalAppointment
          patientDentistries={patientDentistries}
          setPatientDentistries={setPatientDentistries}
          defaultActiveTab={lastestAppointment.patientDentistryId}
          afterDeleteAppointment={afterDeleteAppointment}
        />
      )}
    </Container>
  );
};

export default PatientDentistry;
