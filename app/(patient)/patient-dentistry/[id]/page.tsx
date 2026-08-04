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
import { getAppointmentCountLabel } from "../../../utils/getAppointmentCountLabel";

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
    // The button is disabled until the appointments are in, so this is only
    // reachable by a click that raced the query. Nothing to build the new
    // appointment from yet, and nothing worth telling anyone about.
    if (!lastestAppointment) {
      return;
    }

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
  //
  // Undefined until the query is back, which is not the same as zero -- see
  // getAppointmentCountLabel.
  const appointmentCount = patientDentistries?.filter(
    ({ patientDentistryId }) => patientDentistryId,
  ).length;

  /* The heading and the action are on screen from the first paint.
   *
   * This used to return null until the appointments arrived, which meant a second
   * of nothing at all after clicking Dental -- and nothing is indistinguishable
   * from a page that failed. None of what is above the appointments comes out of
   * the database: the title is the tab you clicked, and the button does not need
   * to know what it is adding to. Only the figure in the sub-heading and the
   * appointments themselves have to wait, so only they do. */
  return (
    <Container className={styles.content}>
      <ContentHeader
        text="Dental"
        subText={getAppointmentCountLabel({ count: appointmentCount })}
        actions={
          // Disabled rather than hidden: a button that appears a second late is
          // a button someone is already reaching for. It has to exist first and
          // become usable second, not the other way round.
          <Button onClick={onCreateAppointment} disabled={!lastestAppointment}>
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
      {patientDentistries && lastestAppointment?.patientDentistryId && (
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
