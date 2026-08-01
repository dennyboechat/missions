"use client";

// Multivariate Dependencies
import { useState, useEffect } from "react";

// Components
import { Container, Grid } from "@radix-ui/themes";
import { ContentHeader } from "../../ContentHeader";
import { SideMenuLayout } from "../../ui/SideMenuLayout";
import { PatientMenuItems } from "../../PatientMenuItems";
import { Space } from "../../ui/Space";
import { GeneralSummary } from "./GeneralSummary";
import { DentistrySummary } from "./DentistrySummary";
import { PersonalSummary } from "./PersonalSummary";

// Styles
import styles from "../../../styles/content.module.css";

// Database
import { getPatientSummary } from "../../../database/patient-summary/GetPatientSummary";

// Types
import { PatientPersonalSummary } from "../../../types/PatientPersonalSummary";

// Utils
import { getSideMenuSubHeader } from "../../../utils/getSideMenuSubHeader";
import { getSideMenuSubHeaderFooter } from "../../../utils/getSideMenuSubHeaderFooter";

// Types
import { actionData } from "../../../types/ActionResult";

export const PatientSummary = ({ params }: { params: { id: string } }) => {
  const [patientPersonalSummary, setPatientPersonalSummary] =
    useState<PatientPersonalSummary>();

  const { id: patientPersonalId } = params;

  useEffect(() => {
    const fetchPatientSummary = async () => {
      if (patientPersonalId) {
        const patientPersonalSummaryData = actionData(await getPatientSummary({
          patientPersonalId,
        }));

        setPatientPersonalSummary(patientPersonalSummaryData);
      }
    };

    fetchPatientSummary();
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

  const { patientFullName, patientDateOfBirth, isPatientMale } =
    patientPersonalSummary;

  const subHeader = getSideMenuSubHeader({
    patientDateOfBirth,
  });

  const subHeaderFooter = getSideMenuSubHeaderFooter({
    isPatientMale,
  });

  return (
    <SideMenuLayout
      menuItems={patientMenuItems}
      header={patientFullName}
      subHeader={subHeader}
      subHeaderFooter={subHeaderFooter}
      isBoldHeader
    >
      <Container className={styles.content}>
        <ContentHeader text="Summary" />
        <Grid>
          <PersonalSummary patientPersonalSummary={patientPersonalSummary} />
          <Space />
          <GeneralSummary patientPersonalId={patientPersonalId} />
          <Space />
          <DentistrySummary patientPersonalId={patientPersonalId} />
          <Space />
        </Grid>
      </Container>
    </SideMenuLayout>
  );
};
