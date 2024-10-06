"use client";

// Components
import { Container } from "@radix-ui/themes";
import { SideMenuLayout } from "../../ui/SideMenuLayout";
import { PatientMenuItems } from "../../PatientMenuItems";
import { ContentHeader } from "../../ContentHeader";
import { Space } from "../../ui/Space";
import { AiChat } from "../../ui/AiChat";
import { WarningContainer } from "../../ui/WarningContainer";

// Styles
import styles from "../../../styles/content.module.css";

// Hooks
import { useState, useEffect } from "react";

// Types
import { PatientPersonalSummary } from "../../../types/PatientPersonalSummary";
import { PatientGeneralSummary } from "../../../types/PatientGeneralSummary";
import { PatientDentalSummary } from "../../../types/PatientDentalSummary";

// Database
import { getPatientSummary } from "../../../database/patient-summary/GetPatientSummary";
import { getPatientGeneralSummary } from "../../../database/patient-summary/GetPatientGeneralSummary";
import { getPatientDentalSummary } from "../../../database/patient-summary/GetPatientDentalSummary";

// Utils
import { getStringifyPatientGeneralSummary } from "../utils/getStringifyPatientGeneralSummary";
import { getSideMenuSubHeader } from "../../../utils/getSideMenuSubHeader";
import { getSideMenuSubHeaderFooter } from "../../../utils/getSideMenuSubHeaderFooter";

export const PatientAnalytics = ({ params }: { params: { id: string } }) => {
  const [patientPersonalSummary, setPatientPersonalSummary] =
    useState<PatientPersonalSummary>();
  const [patientGeneralSummary, setPatientGeneralSummary] =
    useState<PatientGeneralSummary[]>();
  const [patientDentalSummary, setPatientDentalSummary] =
    useState<PatientDentalSummary[]>();

  const { id: patientPersonalId } = params;

  useEffect(() => {
    const fetchPatientSummary = async () => {
      if (patientPersonalId) {
        const patientPersonalSummaryData = await getPatientSummary({
          patientPersonalId,
        });

        setPatientPersonalSummary(patientPersonalSummaryData);

        const patientGeneralSummaryData =
          (await getPatientGeneralSummary({
            patientPersonalId,
          })) ?? [];

        setPatientGeneralSummary(patientGeneralSummaryData);

        const patientDentalSummaryData =
          (await getPatientDentalSummary({
            patientPersonalId,
          })) ?? [];

        setPatientDentalSummary(patientDentalSummaryData);
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

  const showAiChat =
    (patientGeneralSummary && patientGeneralSummary.length > 0) ||
    (patientDentalSummary && patientDentalSummary.length > 0);

  const showWarningMessage =
    patientGeneralSummary &&
    patientGeneralSummary.length === 0 &&
    patientDentalSummary &&
    patientDentalSummary.length === 0;

  return (
    <SideMenuLayout
      menuItems={patientMenuItems}
      header={patientFullName}
      subHeader={subHeader}
      subHeaderFooter={subHeaderFooter}
      isBoldHeader
    >
      <Container className={styles.content}>
        <ContentHeader
          text="Analytics"
          subText="Use the power of AI to explore information"
        />
        <Space />
        {showAiChat && (
          <AiChat
            context={`${getStringifyPatientGeneralSummary(
              patientPersonalSummary,
              patientGeneralSummary,
              patientDentalSummary
            )}. Return max 150 words`}
          />
        )}
        {showWarningMessage && (
          <WarningContainer
            message={
              "Please enter some data in General or Dental to be able to perform analysis."
            }
          />
        )}
      </Container>
    </SideMenuLayout>
  );
};
