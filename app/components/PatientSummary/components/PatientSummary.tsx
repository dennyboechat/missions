"use client";

// Components
import { Container } from "@radix-ui/themes";
import { ContentHeader } from "../../ContentHeader";
import { GeneralSummary } from "./GeneralSummary";
import { DentistrySummary } from "./DentistrySummary";
import { PersonalSummary } from "./PersonalSummary";

// Styles
import contentStyles from "../../../styles/content.module.css";
import styles from "../styles/PatientSummary.module.css";

// Hooks
import { usePatient } from "../../../lib/PatientContext";

// Types
import { PatientPersonalSummary } from "../../../types/PatientPersonalSummary";

export const PatientSummary = ({ params }: { params: { id: string } }) => {
  const { id: patientPersonalId } = params;
  const { patient: patientPersonalSummary } = usePatient();

  return (
    <Container className={contentStyles.content}>
      <ContentHeader
        text="Summary"
        subText="Everything recorded for this patient on this mission."
      />
      <div className={styles.summary_stack}>
        <PersonalSummary patientPersonalSummary={patientPersonalSummary} />
        <GeneralSummary patientPersonalId={patientPersonalId} />
        <DentistrySummary patientPersonalId={patientPersonalId} />
      </div>
    </Container>
  );
};
