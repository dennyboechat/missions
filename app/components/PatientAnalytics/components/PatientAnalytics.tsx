"use client";

// Components
import { Container } from "@radix-ui/themes";
import { SideMenuLayout } from "../../ui/SideMenuLayout";
import { PatientMenuItems } from "../../PatientMenuItems";
import { ContentHeader } from "../../ContentHeader";
import { Space } from "../../ui/Space";
import { AiChat } from "../../ui/AiChat";

// Styles
import styles from "../../../styles/content.module.css";

// Hooks
import { useState, useEffect } from "react";

// Types
import { PatientPersonalSummary } from "../../../types/PatientPersonalSummary";
import { PatientGeneralSummary } from "../../../types/PatientGeneralSummary";

// Database
import { getPatientSummary } from "../../../database/patient-summary/GetPatientSummary";
import { getPatientGeneralSummary } from "../../../database/patient-summary/GetPatientGeneralSummary";

// Utils
import { getStringifyPatientGeneralSummary } from "../utils/getStringifyPatientGeneralSummary";
import { getSideMenuSubHeader } from "../../../utils/getSideMenuSubHeader";
import { getSideMenuSubHeaderFooter } from "../../../utils/getSideMenuSubHeaderFooter";

export const PatientAnalytics = ({ params }: { params: { id: string } }) => {
  const [patientPersonalSummary, setPatientPersonalSummary] =
    useState<PatientPersonalSummary>();
  const [patientGeneralSummary, setPatientGeneralSummary] =
    useState<PatientGeneralSummary[]>();

  const { id: patientPersonalId } = params;

  useEffect(() => {
    const fetchPatientSummary = async () => {
      if (patientPersonalId) {
        const patientPersonalSummaryData = await getPatientSummary({
          patientPersonalId,
        });

        setPatientPersonalSummary(patientPersonalSummaryData);

        const patientGeneralSummaryData = await getPatientGeneralSummary({
          patientPersonalId,
        });

        setPatientGeneralSummary(patientGeneralSummaryData);
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
      activeMenuItem="patient-analytics"
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
        <ContentHeader text="Analytics" subText="Use the power of AI to explore information" />
        <Space />
        {patientGeneralSummary && (
          <AiChat
            context={`${getStringifyPatientGeneralSummary(
              patientPersonalSummary,
              patientGeneralSummary[0]
            )}. Return max 150 words`}
          />
        )}
      </Container>
    </SideMenuLayout>
  );
};
