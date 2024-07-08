"use client";

// Components
import { Container, Button } from "@radix-ui/themes";
import { SideMenuLayout } from "../../components/ui/SideMenuLayout";
import { ProjectMenuItems } from "../../components/ProjectMenuItems";
import { ContentHeader } from "../../components/ContentHeader";
import { PatientPersonalFields } from "../../components/PatientPersonalFields";

// Hooks
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProject } from "../../lib/ProjectContext";
import { usePopupMessage } from "../../lib/PopupMessage";

// Styles
import styles from "../../styles/content.module.css";

// Types
import type { PatientPersonalFieldsTypes } from "../../components/PatientPersonalFields/types/PatientPersonalFieldsProps";

// Database
import { insertPatientPersonal } from "../../database/patient-personal/InsertPatientPersonal";

// Utils
import { isValidPatientFullName } from "../../utils/isValidPatientFullName";

const ProjectPatientNew = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { project } = useProject();
  const { setMessage } = usePopupMessage();
  const [isCreatingPatient, setIsCreatingPatient] = useState(false);
  const [patientPersonalFields, setPatientPersonalFields] =
    useState<PatientPersonalFieldsTypes>({
      patientPersonalId: "",
      projectId: params.id,
      patientFullName: "",
      isPatientMale: undefined,
      patientDateOfBirth: undefined,
    });
  const [isPatientFullNameInvalid, setIsPatientFullNameInvalid] =
    useState(false);
  const [isPatientGenderInvalid, setIsPatientGenderInvalid] = useState(false);
  const [isPatientDateOfBirthInvalid, setIsPatientDateOfBirthInvalid] =
    useState(false);

  const { id: projectId } = params;

  const projectMenuItems = (
    <ProjectMenuItems projectId={projectId} activeMenuItem="project-patients" />
  );

  const onConfirmButtonClick = async () => {
    setIsCreatingPatient(true);

    const { patientFullName, isPatientMale, patientDateOfBirth } =
      patientPersonalFields;

    const isValidFullName = isValidPatientFullName({ patientFullName });
    setIsPatientFullNameInvalid(!isValidFullName);

    const isValidPatientGender = isPatientMale !== undefined;
    setIsPatientGenderInvalid(!isValidPatientGender);

    const isValidDateOfBirth = patientDateOfBirth !== undefined;
    setIsPatientDateOfBirthInvalid(!isValidDateOfBirth);

    if (isValidFullName && isValidPatientGender && isValidDateOfBirth) {
      await insertPatientPersonal({
        projectId,
        patientFullName: patientFullName ?? "",
        isPatientMale: isPatientMale ?? true,
        patientDateOfBirth: patientDateOfBirth ?? new Date(),
      });

      if (setMessage) {
        setMessage("Saved");
      }

      router.push(`/project-patients/${projectId}`);
    } else {
      setIsCreatingPatient(false);
    }
  };

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
          isPatientFullNameInvalid={isPatientFullNameInvalid}
          isPatientGenderInvalid={isPatientGenderInvalid}
          isPatientDateOfBirthInvalid={isPatientDateOfBirthInvalid}
        />
        <Button
          onClick={onConfirmButtonClick}
          disabled={isCreatingPatient}
          variant="outline"
        >
          {"Confirm"}
        </Button>
      </Container>
    </SideMenuLayout>
  );
};

export default ProjectPatientNew;
