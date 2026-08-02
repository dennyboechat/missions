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
import { useState, useEffect, useCallback } from "react";
import { useSaveField } from "../../../lib/useSaveField";
import { useLiveData } from "../../../lib/useLiveData";

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

  /**
   * Takes a set of appointments, however it arrived: the first load, a save on
   * this screen, or the ten-second refresh.
   *
   * The appointment on screen is kept rather than reset to the newest one. It
   * is the same value either way on a first load, but on a refresh replacing it
   * would throw someone out of the appointment they were reading every ten
   * seconds -- and would do it hardest to whoever was reading an older visit.
   * It only moves when the appointment it points at is gone, which is another
   * user having deleted it.
   */
  const applyPatientGeneral = useCallback(
    (patientGeneralData?: PatientGeneralTypes[]) => {
      if (!patientGeneralData) {
        return;
      }

      setPatientGeneral(patientGeneralData);

      setLastestAppointment((currentAppointment) => {
        const isCurrentStillPresent = patientGeneralData.some(
          ({ patientGeneralId }) =>
            patientGeneralId &&
            patientGeneralId === currentAppointment?.patientGeneralId,
        );

        return isCurrentStillPresent
          ? currentAppointment
          : patientGeneralData[0];
      });
    },
    [],
  );

  useEffect(() => {
    const fetchPatientGeneral = async () => {
      if (patientPersonalId) {
        applyPatientGeneral(
          actionData(
            await getPatientGeneral({
              patientPersonalId: patientPersonalId,
            }),
          ),
        );
      }
    };

    fetchPatientGeneral();
  }, [patientPersonalId, applyPatientGeneral]);

  // Two clinicians share a patient -- one taking vitals, one writing notes --
  // so this page re-reads the appointments while it sits open instead of
  // showing whatever was true when it was opened. Fields already being edited
  // here hold their ground; see useLiveValue and InputTextField.
  const refreshPatientGeneral = useCallback(
    () => getPatientGeneral({ patientPersonalId }),
    [patientPersonalId],
  );

  useLiveData({
    load: refreshPatientGeneral,
    apply: (result) => applyPatientGeneral(actionData(result)),
    enabled: Boolean(patientPersonalId),
  });

  if (!patientGeneral || !lastestAppointment) {
    return null;
  }

  const updateAppointments = async () => {
    const patientGeneralData = actionData(
      await getPatientGeneral({
        patientPersonalId: patientPersonalId,
      }),
    );

    applyPatientGeneral(patientGeneralData);

    return patientGeneralData;
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

  // The appointment that was open is the one just deleted, so applying the
  // fresh list already moves to the newest remaining one.
  const afterDeleteAppointment = async () => {
    await updateAppointments();
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
