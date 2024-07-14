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
import { useState, useEffect } from "react";
import { usePopupMessage } from "../../lib/PopupMessage";

// Types
import { PatientDentistryTypes } from "../../types/PatientDentistryTypes";

// Utils
import { getSideMenuSubHeader } from "../../utils/getSideMenuSubHeader";

const PatientDentistry = ({ params }: { params: { id: string } }) => {
  const { setMessage } = usePopupMessage();
  const [patientDentistries, setPatientDentistries] =
    useState<PatientDentistryTypes[]>();
  const [lastestAppointment, setLastestAppointment] =
    useState<PatientDentistryTypes>();

  const { id: patientPersonalId } = params;

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
    isPatientMale: lastestAppointment.isPatientMale,
  });

  const onCreateAppointment = async () => {
    const patientDentistryData = await insertPatientDentistry({
      patientPersonalId: patientPersonalId,
    });

    if (patientDentistryData && setMessage) {
      const newLastestAppointment: PatientDentistryTypes = lastestAppointment;
      newLastestAppointment.patientDentistryId =
        patientDentistryData.patientDentistryId;
      newLastestAppointment.appointmentDate =
        patientDentistryData.appointmentDate;
      newLastestAppointment.appointmentNotes =
        patientDentistryData.appointmentNotes;

      setLastestAppointment(newLastestAppointment);

      setMessage("Saved");

      const patientDentistries = await getPatientDentistries({
        patientPersonalId: patientPersonalId,
      });

      setPatientDentistries(patientDentistries);
    }
  };

  return (
    <SideMenuLayout
      menuItems={patientMenuItems}
      header={lastestAppointment.patientFullName}
      subHeader={subHeader}
      isBoldHeader
    >
      <Container className={styles.content}>
        <ContentHeader text="Dental" />
        <Button onClick={onCreateAppointment}>{"Create appointment"}</Button>
        <Space height={20} />
        {lastestAppointment.patientDentistryId && (
          <DentalAppointment
            patientDentistries={patientDentistries}
            defaultActiveTab={lastestAppointment.patientDentistryId}
          />
        )}
      </Container>
    </SideMenuLayout>
  );
};

export default PatientDentistry;
