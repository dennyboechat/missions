"use client";

// Components
import { Container, Text, Grid } from "@radix-ui/themes";
import { ContentHeader } from "../../components/ContentHeader";
import { SideMenuLayout } from "../../components/ui/SideMenuLayout";
import { PatientMenuItems } from "../../components/PatientMenuItems";

// Styles
import styles from "../../styles/content.module.css";

// Database
import { getPatientSummary } from "../../database/patient-summary/GetPatientSummary";

// Hooks
import { useState, useEffect } from "react";

// Types
import { PatientPersonalSummary } from "../../types/PatientPersonalSummary";

// Utils
import { getSideMenuSubHeader } from "../../utils/getSideMenuSubHeader";
import { getLocaleFormattedDate } from "../../utils/getLocaleFormattedDate";
import { getAge } from "../../utils/getAge";
import { getGenderLabel } from "../../utils/getGenderLabel";
import { getYearsOldLabel } from "../../utils/getYearsOldLabel";

const PatientSummary = ({ params }: { params: { id: string } }) => {
  const [patientPersonalSummary, setPatientPersonalSummary] =
    useState<PatientPersonalSummary>();
  const { id: patientPersonalId } = params;

  useEffect(() => {
    const fetchProject = async () => {
      if (patientPersonalId) {
        const patientPersonalSummaryData = await getPatientSummary({
          patientPersonalId,
        });
        setPatientPersonalSummary(patientPersonalSummaryData);
      }
    };

    fetchProject();
  }, [patientPersonalId]);

  if (!patientPersonalSummary) {
    return null;
  }

  const patientMenuItems = (
    <PatientMenuItems
      patientPersonalId={patientPersonalId}
      activeMenuItem="patient-summary"
    />
  );

  const subHeader = getSideMenuSubHeader({
    patientDateOfBirth: patientPersonalSummary.patientDateOfBirth,
    isPatientMale: patientPersonalSummary.isPatientMale,
  });

  const patientAge = getAge({
    date: patientPersonalSummary.patientDateOfBirth,
  });

  const patientAgeLabel = getYearsOldLabel({ age: patientAge ?? 0 });

  const formattedDateOfBirth = getLocaleFormattedDate({
    date: patientPersonalSummary.patientDateOfBirth,
  });

  const birthData = `${formattedDateOfBirth} (${patientAgeLabel})`;

  return (
    <SideMenuLayout
      menuItems={patientMenuItems}
      header={patientPersonalSummary.patientFullName}
      subHeader={subHeader}
      isBoldHeader
    >
      <Container className={styles.content}>
        <ContentHeader text="Summary" />
        <Grid>
          <Text size="5">{patientPersonalSummary.patientFullName}</Text>
          <Text>{birthData}</Text>
          <Text>
            {getGenderLabel({
              isPatientMale: patientPersonalSummary.isPatientMale,
            })}
          </Text>
        </Grid>
      </Container>
    </SideMenuLayout>
  );
};

export default PatientSummary;
