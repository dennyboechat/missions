"use client";

// Multivariate Dependencies
import { useState, useEffect } from "react";

// Components
import { Container, Grid } from "@radix-ui/themes";
import { ContentHeader } from "../../ContentHeader";
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

// Types
import { actionData } from "../../../types/ActionResult";

export const PatientSummary = ({ params }: { params: { id: string } }) => {
  const [patientPersonalSummary, setPatientPersonalSummary] =
    useState<PatientPersonalSummary>();

  const { id: patientPersonalId } = params;

  useEffect(() => {
    const fetchPatientSummary = async () => {
      if (patientPersonalId) {
        const patientPersonalSummaryData = actionData(
          await getPatientSummary({
            patientPersonalId,
          }),
        );

        setPatientPersonalSummary(patientPersonalSummaryData);
      }
    };

    fetchPatientSummary();
  }, [patientPersonalId]);

  if (!patientPersonalSummary) {
    return null;
  }

  const { patientFullName, patientDateOfBirth, isPatientMale } =
    patientPersonalSummary;

  return (
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
  );
};
