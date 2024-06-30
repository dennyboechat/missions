"use client";

// Components
import { Container } from "@radix-ui/themes";
import { ContentHeader } from "../../components/ui/ContentHeader";
import { SideMenuLayout } from "../../components/ui/SideMenuLayout";
import { ProjectMenuItems } from "../../components/ui/PatientMenuItems";
import { PatientPersonalFields } from "../../components/patientPersonalFields";

// Styles
import styles from "../../styles/content.module.css";

// Database
import { getPatientPersonal } from "../../database/patient-personal/GetPatientPersonal";

// Hooks
import { useState, useEffect } from "react";

// Types
import { PatientPersonal } from "../../types/PatientPersonalTypes";

// Utils
import { getAge } from "../../utils/getAge";

const PatientsPersonal = ({ params }: { params: { id: string } }) => {
  const [patientPersonalFields, setPatientPersonalFields] =
    useState<PatientPersonal>();

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
    <ProjectMenuItems
      patientPersonalId={patientPersonalId}
      activeMenuItem="patients-personal"
    />
  );

  const patientAge = getAge({
    date: patientPersonalFields.patientDateOfBirth,
  });

  const gender = patientPersonalFields.isPatientMale ? "male" : "female";

  const subHeader = `${patientAge ?? ""} yo - ${gender}`;

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

export default PatientsPersonal;
