"use client";

// Components
import { Container, Button } from "@radix-ui/themes";
import { ContentHeader } from "../../components/ContentHeader";
import { SideMenuLayout } from "../../components/ui/SideMenuLayout";
import { Space } from "../../components/ui/Space";
import { PatientMenuItems } from "../../components/PatientMenuItems";
import { DentalAppointment } from "../../components/DentalAppointment";

// Styles
import styles from "../../styles/content.module.css";

// Database
import { getPatientDentistries } from "../../database/patient-dentistry/GetPatientDentistries";
import { insertPatientDentistry } from "../../database/patient-dentistry/InsertPatientDentistry";

// Hooks
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { usePopupMessage } from "../../lib/PopupMessage";

// Types
import { PatientDentistryTypes } from "../../types/PatientDentistryTypes";

// Utils
import { getSideMenuSubHeader } from "../../utils/getSideMenuSubHeader";
import { getSideMenuSubHeaderFooter } from "../../utils/getSideMenuSubHeaderFooter";
import { runWithRetries } from "@/app/utils/runWithRetries";

const PatientDentistry = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: patientPersonalId } = use(params);
  const router = useRouter();
  const { setMessage, setMessageType } = usePopupMessage();
  const [patientDentistries, setPatientDentistries] =
    useState<PatientDentistryTypes[]>();
  const [lastestAppointment, setLastestAppointment] =
    useState<PatientDentistryTypes>();

  useEffect(() => {
    const fetchPatientDentistry = async () => {
      if (patientPersonalId) {
        const patientDentistryData = await getPatientDentistries({
          patientPersonalId: patientPersonalId,
        });
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

  const patientMenuItems = (
    <PatientMenuItems
      patientPersonalId={patientPersonalId}
      activeMenuItem="patient-dentistry"
    />
  );

  const subHeader = getSideMenuSubHeader({
    patientDateOfBirth: lastestAppointment.patientDateOfBirth,
  });

  const subHeaderFooter = getSideMenuSubHeaderFooter({
    isPatientMale: lastestAppointment.isPatientMale,
  });

  const updateAppointments = async () => {
    const patientDentistriesData = await getPatientDentistries({
      patientPersonalId: patientPersonalId,
    });

    setPatientDentistries(patientDentistriesData);

    return patientDentistriesData;
  };

  const onCreateAppointment = async () => {
    const codeToRun = async () => {
      const patientDentistryData = await insertPatientDentistry({
        patientPersonalId: patientPersonalId,
      });

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

    const runSuccess = await runWithRetries(codeToRun);
    if (!runSuccess && setMessage && setMessageType) {
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

  return (
    <SideMenuLayout
      menuItems={patientMenuItems}
      header={lastestAppointment.patientFullName}
      subHeader={subHeader}
      subHeaderFooter={subHeaderFooter}
      isBoldHeader
    >
      <Container className={styles.content}>
        <ContentHeader text="Dental" />
        <Button onClick={onCreateAppointment}>{"Create appointment"}</Button>
        <Space height={20} />
        {lastestAppointment.patientDentistryId && (
          <DentalAppointment
            patientDentistries={patientDentistries}
            setPatientDentistries={setPatientDentistries}
            defaultActiveTab={lastestAppointment.patientDentistryId}
            afterDeleteAppointment={afterDeleteAppointment}
          />
        )}
      </Container>
    </SideMenuLayout>
  );
};

export default PatientDentistry;
