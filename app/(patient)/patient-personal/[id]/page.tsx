"use client";

// Components
import { Container, Grid, Button, Box, Text, Popover } from "@radix-ui/themes";
import { ContentHeader } from "../../../components/ContentHeader";
import { PatientPersonalFields } from "../../../components/PatientPersonalFields";
import { PopupConfirmation } from "../../../components/ui/PopupConfirmation";

// Styles
import styles from "../../../styles/content.module.css";

// Database
import { deletePatientPersonal } from "../../../database/patient-personal/DeletePatientPersonal";

// Hooks
import { useState, use } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { usePatient } from "../../../lib/PatientContext";
import { PatientPersonalSummary } from "../../../types/PatientPersonalSummary";

// Types
import { PatientPersonalFieldsTypes } from "../../../components/PatientPersonalFields/types/PatientPersonalFieldsProps";

// Utils

// Types
import { actionData } from "../../../types/ActionResult";

const PatientPersonal = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: patientPersonalId } = use(params);
  const router = useRouter();
  const { patient, setPatient } = usePatient();
  const [isDeletingPatient, setIsDeletingPatient] = useState(false);

  // The layout already loaded this patient for the sidebar, so this page reads
  // and writes that same value rather than keeping a second copy. One source
  // of truth: no extra round trip for a row already in memory, the sidebar
  // updates as fields are edited, and there are no two effects syncing to each
  // other -- which is what caused a render loop.
  const patientPersonalFields: PatientPersonalFieldsTypes = patient ?? {
    patientPersonalId: "",
    projectId: "",
    patientFullName: "",
    isPatientMale: undefined,
    patientDateOfBirth: undefined,
  };

  const setPatientPersonalFields: Dispatch<
    SetStateAction<PatientPersonalFieldsTypes>
  > = (update) => {
    const next =
      typeof update === "function" ? update(patientPersonalFields) : update;

    setPatient(next as PatientPersonalSummary);
  };


  if (!patientPersonalFields.patientPersonalId) {
    return null;
  }

  const onDeletePatient = async () => {
    setIsDeletingPatient(true);
    actionData(await deletePatientPersonal({ patientPersonalId }));
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
  );
};

export default PatientPersonal;
