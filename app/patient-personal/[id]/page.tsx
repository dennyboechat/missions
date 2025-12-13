"use client";

// Components
import { Container, Grid, Button, Box, Text, Popover } from "@radix-ui/themes";
import { ContentHeader } from "../../components/ContentHeader";
import { SideMenuLayout } from "../../components/ui/SideMenuLayout";
import { PatientMenuItems } from "../../components/PatientMenuItems";
import { PatientPersonalFields } from "../../components/PatientPersonalFields";
import { PopupConfirmation } from "../../components/ui/PopupConfirmation";

// Styles
import styles from "../../styles/content.module.css";

// Database
import { getPatientPersonal } from "../../database/patient-personal/GetPatientPersonal";
import { deletePatientPersonal } from "../../database/patient-personal/DeletePatientPersonal";

// Hooks
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

// Types
import { PatientPersonalFieldsTypes } from "../../components/PatientPersonalFields/types/PatientPersonalFieldsProps";

// Utils
import { getSideMenuSubHeader } from "../../utils/getSideMenuSubHeader";
import { getSideMenuSubHeaderFooter } from "../../utils/getSideMenuSubHeaderFooter";

const PatientPersonal = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: patientPersonalId } = use(params);
  const router = useRouter();
  const [patientPersonalFields, setPatientPersonalFields] =
    useState<PatientPersonalFieldsTypes>({
      patientPersonalId: "",
      projectId: "",
      patientFullName: "",
      isPatientMale: undefined,
      patientDateOfBirth: undefined,
    });
  const [isDeletingPatient, setIsDeletingPatient] = useState(false);

  useEffect(() => {
    const fetchPatientPersonal = async () => {
      if (patientPersonalId) {
        const patientPersonalData = await getPatientPersonal({
          patientPersonalId: patientPersonalId,
        });

        if (patientPersonalData) {
          setPatientPersonalFields(patientPersonalData);
        } else {
          console.error(
            `Could not find patient personal with id ${patientPersonalData}`
          );
        }
      }
    };

    fetchPatientPersonal();
  }, [patientPersonalId]);

  if (!patientPersonalFields.patientPersonalId) {
    return null;
  }

  const patientMenuItems = (
    <PatientMenuItems
      patientPersonalId={patientPersonalId}
      activeMenuItem="patient-personal"
    />
  );

  const subHeader = getSideMenuSubHeader({
    patientDateOfBirth: patientPersonalFields.patientDateOfBirth,
  });

  const subHeaderFooter = getSideMenuSubHeaderFooter({
    isPatientMale: patientPersonalFields.isPatientMale,
  });

  const onDeletePatient = async () => {
    setIsDeletingPatient(true);
    await deletePatientPersonal({ patientPersonalId });
    router.push(`/project-patients/${patientPersonalFields.projectId}`);
  };

  const deletePatientPopupConfirmation = (
    <Box>
      <Text weight="bold">{"Confirm the patient deletion?"}</Text>
      <Text as="p">{"This action cannot be undone."}</Text>
      <Grid columns="2" gapX="10px">
        <Button
          color="red"
          onClick={onDeletePatient}
          disabled={isDeletingPatient}
          variant="outline"
        >
          {"Confirm"}
        </Button>
        <Popover.Close>
          <Button variant="outline" color="gray" disabled={isDeletingPatient}>
            {"Cancel"}
          </Button>
        </Popover.Close>
      </Grid>
    </Box>
  );

  return (
    <SideMenuLayout
      menuItems={patientMenuItems}
      header={patientPersonalFields.patientFullName}
      subHeader={subHeader}
      subHeaderFooter={subHeaderFooter}
      isBoldHeader
    >
      <Container className={styles.content}>
        <ContentHeader text="Personal" />
        <PatientPersonalFields
          patientPersonalFields={patientPersonalFields}
          setPatientPersonalFields={setPatientPersonalFields}
        />
        <Grid width={{ initial: "auto", sm: "150px" }}>
          <PopupConfirmation content={deletePatientPopupConfirmation}>
            <Button color="red" variant="outline">
              {"Delete patient"}
            </Button>
          </PopupConfirmation>
        </Grid>
      </Container>
    </SideMenuLayout>
  );
};

export default PatientPersonal;
