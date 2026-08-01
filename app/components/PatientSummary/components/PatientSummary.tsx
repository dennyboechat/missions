"use client";

// Components
import { Container, Grid } from "@radix-ui/themes";
import { ContentHeader } from "../../ContentHeader";
import { Space } from "../../ui/Space";
import { GeneralSummary } from "./GeneralSummary";
import { DentistrySummary } from "./DentistrySummary";
import { PersonalSummary } from "./PersonalSummary";

// Styles
import styles from "../../../styles/content.module.css";

// Hooks
import { usePatient } from "../../../lib/PatientContext";

// Types
import { PatientPersonalSummary } from "../../../types/PatientPersonalSummary";

export const PatientSummary = ({ params }: { params: { id: string } }) => {
  const { id: patientPersonalId } = params;
  const { patient: patientPersonalSummary } = usePatient();

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
