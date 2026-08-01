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
import { useSaveField } from "../../../lib/useSaveField";

// Types
import { PatientGeneralTypes } from "../../../types/PatientGeneralTypes";

// Utils
import { getSideMenuSubHeader } from "../../../utils/getSideMenuSubHeader";
import { getSideMenuSubHeaderFooter } from "../../../utils/getSideMenuSubHeaderFooter";

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
        const patientGeneralData = actionData(await getPatientGeneral({
          patientPersonalId: patientPersonalId,
        }));
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
    const patientDentistriesData = actionData(await getPatientGeneral({
      patientPersonalId: patientPersonalId,
    }));

    setPatientGeneral(patientDentistriesData);

    return patientDentistriesData;
  };

  const onCreateAppointment = async () => {
    const patientGeneralData = await save(
      () => insertPatientGeneral({ patientPersonalId: patientPersonalId, })
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
