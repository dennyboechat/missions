"use client";

// Components
import { Container } from "@radix-ui/themes";
import { ContentHeader } from "../../components/ContentHeader";
import { SideMenuLayout } from "../../components/ui/SideMenuLayout";
import { PatientMenuItems } from "../../components/PatientMenuItems";

// Styles
import styles from "../../styles/content.module.css";

const PatientGeneral = ({ params }: { params: { id: string } }) => {
  const { id: patientPersonalId } = params;

  const patientMenuItems = (
    <PatientMenuItems
      patientPersonalId={patientPersonalId}
      activeMenuItem="patient-general"
    />
  );

  return (
    <SideMenuLayout
      menuItems={patientMenuItems}
      header={"patientFullName"}
      subHeader={"subHeader"}
      isBoldHeader
    >
      <Container className={styles.content}>
        <ContentHeader text="General" />
      </Container>
    </SideMenuLayout>
  );
};

export default PatientGeneral;
