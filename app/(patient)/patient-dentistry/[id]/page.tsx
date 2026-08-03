"use client";

// Components
import { Container, Button } from "@radix-ui/themes";
import { ContentHeader } from "../../../components/ContentHeader";
import { Icon } from "../../../components/ui/Icon";
import { DentalAppointment } from "../../../components/DentalAppointment";
import { RemoteUpdateNotice } from "../../../components/ui/RemoteUpdateNotice";
import { Space } from "../../../components/ui/Space";

// Styles
import styles from "../../../styles/content.module.css";

// Database
import { getPatientDentistries } from "../../../database/patient-dentistry/GetPatientDentistries";
import { insertPatientDentistry } from "../../../database/patient-dentistry/InsertPatientDentistry";

// Hooks
import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { usePopupMessage } from "../../../lib/PopupMessage";
import { useSaveField } from "../../../lib/useSaveField";
import { useLiveData } from "../../../lib/useLiveData";

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

  /**
   * Takes a set of appointments, however it arrived: the first load, a save on
   * this screen, or the ten-second refresh.
   *
   * The appointment on screen is kept rather than reset to the newest one. It
   * is the same value either way on a first load, but on a refresh replacing it
   * would throw someone out of the appointment they were reading every ten
   * seconds. It only moves when the appointment it points at is gone, which is
   * another user having deleted it.
   */
  const applyPatientDentistries = useCallback(
    (patientDentistriesData?: PatientDentistryTypes[]) => {
      if (!patientDentistriesData) {
        return;
      }

      setPatientDentistries(patientDentistriesData);

      setLastestAppointment((currentAppointment) => {
        const isCurrentStillPresent = patientDentistriesData.some(
          ({ patientDentistryId }) =>
            patientDentistryId &&
            patientDentistryId === currentAppointment?.patientDentistryId,
        );

        return isCurrentStillPresent
          ? currentAppointment
          : patientDentistriesData[0];
      });
    },
    [],
  );

  useEffect(() => {
    const fetchPatientDentistry = async () => {
      if (patientPersonalId) {
        applyPatientDentistries(
          actionData(
            await getPatientDentistries({
              patientPersonalId: patientPersonalId,
            }),
          ),
        );
      }
    };

    fetchPatientDentistry();
  }, [patientPersonalId, applyPatientDentistries]);

  // Re-read the appointments while the page sits open, so a colleague's
  // charting shows up without anyone reloading. Fields being edited here hold
  // their ground; see useLiveValue and InputTextField.
  const refreshPatientDentistries = useCallback(
    () => getPatientDentistries({ patientPersonalId }),
    [patientPersonalId],
  );

  const { hasRemoteChange, acknowledgeRemoteChange } = useLiveData({
    load: refreshPatientDentistries,
    apply: (result) => applyPatientDentistries(actionData(result)),
    enabled: Boolean(patientPersonalId),
    // Charting is the case this was built for: a tooth turning colour under
    // someone's eyes is worth a line saying why.
    detectChanges: true,
  });

  if (!patientDentistries || !lastestAppointment) {
    return null;
  }

  const updateAppointments = async () => {
    const patientDentistriesData = actionData(
      await getPatientDentistries({
        patientPersonalId: patientPersonalId,
      }),
    );

    applyPatientDentistries(patientDentistriesData);

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

  // The appointment that was open is the one just deleted, so applying the
  // fresh list already moves to the newest remaining one.
  const afterDeleteAppointment = async () => {
    await updateAppointments();
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
      {hasRemoteChange && (
        <>
          <Space />
          <RemoteUpdateNotice onDismiss={acknowledgeRemoteChange} />
        </>
      )}
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
