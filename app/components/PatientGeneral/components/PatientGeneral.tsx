"use client";

// Components
import { Container, Button } from "@radix-ui/themes";
import { ContentHeader } from "../../ContentHeader";
import { SideMenuLayout } from "../../ui/SideMenuLayout";
import { Space } from "../..//ui/Space";
import { PatientMenuItems } from "../../PatientMenuItems";
import { GeneralAppointment } from "../../GeneralAppointment";

// Styles
import styles from "../../../styles/content.module.css";

// Database
import { getPatientGeneral } from "../../../database/patient-general/GetPatientGeneral";
import { insertPatientGeneral } from "../../../database/patient-general/InsertPatientGeneral";

// Hooks
import { useState, useEffect } from "react";
import { usePopupMessage } from "../../../lib/PopupMessage";

// Types
import { PatientGeneralTypes } from "../../../types/PatientGeneralTypes";

// Utils
import { getSideMenuSubHeader } from "../../../utils/getSideMenuSubHeader";
import { getSideMenuSubHeaderFooter } from "../../../utils/getSideMenuSubHeaderFooter";

export const PatientGeneral = ({ params }: { params: { id: string } }) => {
  const { setMessage } = usePopupMessage();
  const [patientGeneral, setPatientGeneral] = useState<PatientGeneralTypes[]>();
  const [lastestAppointment, setLastestAppointment] =
    useState<PatientGeneralTypes>();

  const { id: patientPersonalId } = params;

  useEffect(() => {
    const fetchPatientGeneral = async () => {
      if (patientPersonalId) {
        const patientGeneralData = await getPatientGeneral({
          patientPersonalId: patientPersonalId,
        });
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

  const patientMenuItems = (
    <PatientMenuItems
      patientPersonalId={patientPersonalId}
      activeMenuItem="patient-general"
    />
  );

  const subHeader = getSideMenuSubHeader({
    patientDateOfBirth: lastestAppointment.patientDateOfBirth,
  });

  const subHeaderFooter = getSideMenuSubHeaderFooter({
    isPatientMale: lastestAppointment.isPatientMale,
  });

  const updateAppointments = async () => {
    const patientDentistriesData = await getPatientGeneral({
      patientPersonalId: patientPersonalId,
    });

    setPatientGeneral(patientDentistriesData);

    return patientDentistriesData;
  };

  const onCreateAppointment = async () => {
    const patientGeneralData = await insertPatientGeneral({
      patientPersonalId: patientPersonalId,
    });

    if (patientGeneralData && setMessage) {
      const newLastestAppointment = {
        ...lastestAppointment,
        patientGeneralId: patientGeneralData.patientGeneralId,
        appointmentDate: patientGeneralData.appointmentDate,
        appointmentNotes: patientGeneralData.appointmentNotes,
      };

      setLastestAppointment(newLastestAppointment);

      setMessage("Saved");

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

  return (
    <SideMenuLayout
      menuItems={patientMenuItems}
      header={lastestAppointment.patientFullName}
      subHeader={subHeader}
      subHeaderFooter={subHeaderFooter}
      isBoldHeader
    >
      <Container className={styles.content}>
        <ContentHeader text="General" />
        <Button onClick={onCreateAppointment}>{"Create appointment"}</Button>
        <Space height={20} />
        {lastestAppointment.patientGeneralId && (
          <GeneralAppointment
            patientGeneral={patientGeneral}
            setPatientGeneral={setPatientGeneral}
            defaultActiveTab={lastestAppointment.patientGeneralId}
            afterDeleteAppointment={afterDeleteAppointment}
          />
        )}
      </Container>
    </SideMenuLayout>
  );
};
