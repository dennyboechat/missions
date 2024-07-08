"use client";

// Components
import { Container } from "@radix-ui/themes";
import { SideMenuLayout } from "../../components/ui/SideMenuLayout";
import { ProjectMenuItems } from "../../components/ProjectMenuItems";
import { ContentHeader } from "../../components/ContentHeader";
import { PatientPersonalFields } from "../../components/PatientPersonalFields";

// Hooks
import { useState } from "react";
import { useProject } from "../../lib/ProjectContext";

// Styles
import styles from "../../styles/content.module.css";

// Types
import type { PatientPersonalFieldsTypes } from "../../components/PatientPersonalFields/types/PatientPersonalFieldsProps";

const ProjectPatientNew = ({ params }: { params: { id: string } }) => {
  const { project } = useProject();
  const [patientPersonalFields, setPatientPersonalFields] =
    useState<PatientPersonalFieldsTypes>({
      patientPersonalId: "",
      projectId: params.id,
      patientFullName: "",
      isPatientMale: undefined,
      patientDateOfBirth: undefined,
    });

  const projectMenuItems = (
    <ProjectMenuItems projectId={params.id} activeMenuItem="project-patients" />
  );

  return (
    <SideMenuLayout
      menuItems={projectMenuItems}
      header={project?.projectName ?? ""}
    >
      <Container className={styles.content}>
        <ContentHeader text="New patient" />
        <PatientPersonalFields
          patientPersonalFields={patientPersonalFields}
          setPatientPersonalFields={setPatientPersonalFields}
        />
      </Container>
    </SideMenuLayout>
  );
};

export default ProjectPatientNew;
