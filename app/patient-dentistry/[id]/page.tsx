"use client";

// Components
import { Container, TabNav } from "@radix-ui/themes";
import { ContentHeader } from "../../components/ContentHeader";
import { SideMenuLayout } from "../../components/ui/SideMenuLayout";
import { PatientMenuItems } from "../../components/PatientMenuItems";
import { TabNavigator } from "../../components/ui/TabNavigator";

// Styles
import styles from "../../styles/content.module.css";

// Database
import { getPatientDentistries } from "../../database/patient-dentistry/GetPatientDentistries";

// Hooks
import { useState, useEffect } from "react";

// Types
import { PatientDentistryTypes } from "../../types/PatientDentistryTypes";

const PatientDentistry = ({ params }: { params: { id: string } }) => {
  const [patientDentistries, setPatientDentistries] =
    useState<PatientDentistryTypes[]>();

  const { id: patientPersonalId } = params;

  useEffect(() => {
    const fetchPatientDentistry = async () => {
      if (patientPersonalId) {
        const patientDentistryData = await getPatientDentistries({
          patientPersonalId: patientPersonalId,
        });
        setPatientDentistries(patientDentistryData);
      }
    };

    fetchPatientDentistry();
  }, [patientPersonalId]);

  if (!patientDentistries) {
    return null;
  }

  const patientMenuItems = (
    <PatientMenuItems
      patientPersonalId={patientPersonalId}
      activeMenuItem="patient-dentistry"
    />
  );

  return (
    <SideMenuLayout
      menuItems={patientMenuItems}
      header={"patientDentistryFields.patientFullName"}
      subHeader={"subHeader"}
      isBoldHeader
    >
      <Container className={styles.content}>
        <ContentHeader text="Dentistry" />
        <TabNavigator>
          {patientDentistries.map(({ patientDentistryId }) => (
            <TabNav.Link key={patientDentistryId} href="#" active>
              
            </TabNav.Link>
          ))}
        </TabNavigator>
      </Container>
    </SideMenuLayout>
  );
};

export default PatientDentistry;
