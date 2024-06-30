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
import { PatientPersonalTypes } from "../../types/PatientPersonalTypes";

// Utils
import { getAge } from "../../utils/getAge";

const PatientPersonal = ({ params }: { params: { id: string } }) => {
  const [patientPersonalFields, setPatientPersonalFields] =
    useState<PatientPersonalTypes>();

  const { id: patientPersonalId } = params;

  useEffect(() => {
    const fetchPatientPersonal = async () => {
      if (patientPersonalId) {
        const patientPersonalData = await getPatientPersonal({
          patientPersonalId: patientPersonalId,
        });
        setPatientPersonalFields(patientPersonalData);
      }
    };

    fetchPatientPersonal();
  }, [patientPersonalId]);

  if (!patientPersonalFields) {
    return null;
  }

  const patientMenuItems = (
    <PatientMenuItems
      patientPersonalId={patientPersonalId}
      activeMenuItem="patient-personal"
    />
  );

  const patientAge = getAge({
    date: patientPersonalFields.patientDateOfBirth,
  });

  const gender = patientPersonalFields.isPatientMale ? "male" : "female";

  const subHeader = `${patientAge ?? ""}yo ${gender}`;

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
