"use client";

// Components
import { Container } from "@radix-ui/themes";
import { ContentHeader } from "../../components/ui/ContentHeader";
import { SideMenuLayout } from "../../components/ui/SideMenuLayout";
import { ProjectMenuItems } from "../../components/ui/PatientMenuItems";

// Styles
import styles from "../../styles/content.module.css";

const PatientsPersonal = ({ params }: { params: { id: string } }) => {
  const { id: patientPersonalId } = params;

  const patientMenuItems = (
    <ProjectMenuItems patientPersonalId={patientPersonalId} activeMenuItem="patients-personal" />
  );

  return (
    <SideMenuLayout
      menuItems={patientMenuItems}
      header={'project?.projectName'}
    >
      <Container className={styles.content}>
        <ContentHeader text="Personal Data" />
      </Container>
    </SideMenuLayout>
  );
};

export default PatientsPersonal;
