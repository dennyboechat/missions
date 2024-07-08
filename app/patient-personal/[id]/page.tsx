"use client";

// Components
import { Container } from "@radix-ui/themes";
import { ContentHeader } from "../../components/ContentHeader";
import { SideMenuLayout } from "../../components/ui/SideMenuLayout";
import { PatientMenuItems } from "../../components/PatientMenuItems";
import { PatientPersonalFields } from "../../components/PatientPersonalFields";

// Styles
import styles from "../../styles/content.module.css";

// Database
import { getPatientPersonal } from "../../database/patient-personal/GetPatientPersonal";

// Hooks
import { useState, useEffect } from "react";

// Types
import type { PatientPersonalFieldsTypes } from "../../components/PatientPersonalFields/types/PatientPersonalFieldsProps";

// Utils
import { getSideMenuSubHeader } from "../../utils/getSideMenuSubHeader";

const PatientPersonal = ({ params }: { params: { id: string } }) => {
  const [patientPersonalFields, setPatientPersonalFields] =
    useState<PatientPersonalFieldsTypes>({
      patientPersonalId: "",
      projectId: "",
      patientFullName: "",
      isPatientMale: undefined,
      patientDateOfBirth: undefined,
    });

  const { id: patientPersonalId } = params;

  useEffect(() => {
    const fetchPatientPersonal = async () => {
      if (patientPersonalId) {
        const patientPersonalData = await getPatientPersonal({
          patientPersonalId: patientPersonalId,
        });

        if (patientPersonalData) {
          setPatientPersonalFields(patientPersonalData);
        } else {
          console.error(
            `Could not find patient personal with id ${patientPersonalData}`
          );
        }
      }
    };

    fetchPatientPersonal();
  }, [patientPersonalId]);

  if (!patientPersonalFields.patientPersonalId) {
    return null;
  }

  const patientMenuItems = (
    <PatientMenuItems
      patientPersonalId={patientPersonalId}
      activeMenuItem="patient-personal"
    />
  );

  const subHeader = getSideMenuSubHeader({
    patientDateOfBirth: patientPersonalFields.patientDateOfBirth,
    isPatientMale: patientPersonalFields.isPatientMale,
  });

  return (
    <SideMenuLayout
      menuItems={patientMenuItems}
      header={patientPersonalFields.patientFullName}
      subHeader={subHeader}
      isBoldHeader
    >
      <Container className={styles.content}>
        <ContentHeader text="Personal Data" />
        <PatientPersonalFields
          patientPersonalFields={patientPersonalFields}
          setPatientPersonalFields={setPatientPersonalFields}
        />
      </Container>
    </SideMenuLayout>
  );
};

export default PatientPersonal;
