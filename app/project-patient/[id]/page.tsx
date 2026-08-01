"use client";

// Components
import { Container, Button } from "@radix-ui/themes";
import { SideMenuLayout } from "../../components/ui/SideMenuLayout";
import { Space } from "../../components/ui/Space";
import { ProjectMenuItems } from "../../components/ProjectMenuItems";
import { ContentHeader } from "../../components/ContentHeader";
import { PatientPersonalFields } from "../../components/PatientPersonalFields";

// Hooks
import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useProject } from "../../lib/ProjectContext";
import { useSaveField } from "../../lib/useSaveField";

// Styles
import styles from "../../styles/content.module.css";

// Types
import { PatientPersonalFieldsTypes } from "../../components/PatientPersonalFields/types/PatientPersonalFieldsProps";

// Database
import { insertPatientPersonal } from "../../database/patient-personal/InsertPatientPersonal";

// Utils
import { isValidPatientFullName } from "../../utils/isValidPatientFullName";


const ProjectPatientNew = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: projectId } = use(params);
  const router = useRouter();
  const { project } = useProject();
  const { save } = useSaveField();
  const [isCreatingPatient, setIsCreatingPatient] = useState(false);
  const [patientPersonalFields, setPatientPersonalFields] =
    useState<PatientPersonalFieldsTypes>({
      patientPersonalId: "",
      projectId: projectId,
      patientFullName: "",
      isPatientMale: undefined,
      patientDateOfBirth: undefined,
    });
  const [isPatientFullNameInvalid, setIsPatientFullNameInvalid] =
    useState(false);
  const [isPatientGenderInvalid, setIsPatientGenderInvalid] = useState(false);
  const [isPatientDateOfBirthInvalid, setIsPatientDateOfBirthInvalid] =
    useState(false);

  const projectMenuItems = (
    <ProjectMenuItems projectId={projectId} activeMenuItem="project-patients" />
  );

  const onConfirmButtonClick = async () => {
    setIsCreatingPatient(true);

    const { patientFullName, isPatientMale, patientDateOfBirth, patientPhoneNumber } =
      patientPersonalFields;

    const isValidFullName = isValidPatientFullName({ patientFullName });
    setIsPatientFullNameInvalid(!isValidFullName);

    const isValidPatientGender = isPatientMale !== undefined;
    setIsPatientGenderInvalid(!isValidPatientGender);

    const isValidDateOfBirth = patientDateOfBirth !== undefined;
    setIsPatientDateOfBirthInvalid(!isValidDateOfBirth);

    if (isValidFullName && isValidPatientGender && isValidDateOfBirth) {
      const insertedPatientPersonal = await save(
        () =>
          insertPatientPersonal({
            projectId,
            patientFullName: patientFullName ?? "",
            isPatientMale: isPatientMale ?? true,
            patientDateOfBirth: patientDateOfBirth ?? new Date(),
            patientPhoneNumber,
          }),
        {
          failureMessages: {
            error: "Error to save patient data. Please try again.",
          },
        }
      );

      // Only leave the form once the patient is actually stored. This used to
      // navigate away regardless, so a failed save silently discarded the
      // entry and left the message behind on a page the user had left.
      if (insertedPatientPersonal) {
        router.push(`/project-patients/${projectId}`);
      } else {
        setIsCreatingPatient(false);
      }
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
        <Space />
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
