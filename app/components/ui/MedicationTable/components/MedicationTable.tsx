"use client";

// Multivariate Dependencies
import { Fragment, useState, useEffect } from "react";

// Components
import { Grid, Text } from "@radix-ui/themes";
import { DrugSelector } from "./DrugSelector";
import { DoseInput } from "./DoseInput";
import { QuantityInput } from "./QuantityInput";
import { InstructionsInput } from "./InstructionsInput";
import { Actions } from "./Actions";

// Types
import { Medication } from "../../../../types/Medication";
import { MedicationTableProps } from "../types/MedicationTableProps";

// Utils
import { getNewMedicationRecord } from "../utils/getNewMedicationRecord";
import { generateUID } from "../../../../utils/generateUID";

// Database
import { getPatientDentistryMedications } from "../../../../database/patient-dentistry-medication/GetPatientDentistryMedications";

export const MedicationTable = ({
  patientDentistryId,
}: MedicationTableProps) => {
  const [medications, setMedications] = useState<Medication[]>([]);

  useEffect(() => {
    const updatePatientMedications = async () => {
      if (patientDentistryId) {
        const dentistryMedications = await getPatientDentistryMedications({
          patientDentistryId,
        });

        if (dentistryMedications) {
          const retrievedMedications: Medication[] = [];

          dentistryMedications.map(
            ({
              patientDentistryPrescribedMedicationId,
              drug,
              dose,
              quantity,
              instructions,
            }) => {
              retrievedMedications.push({
                rowId: generateUID(),
                medicationUid: patientDentistryPrescribedMedicationId,
                drug,
                dose,
                quantity,
                instructions,
              });
            }
          );

          retrievedMedications.push(getNewMedicationRecord());
          setMedications(retrievedMedications);
        } else {
          console.log(
            `Error to get patient dentistry medications with id ${patientDentistryId}`
          );
        }
      }
    };

    updatePatientMedications();
  }, [patientDentistryId]);

  return (
    <Grid columns="30fr 10fr 10fr 45fr 5fr" gap="3">
      <Text weight="medium">{"Drug"}</Text>
      <Text weight="medium">{"Dose"}</Text>
      <Text weight="medium">{"Quantity"}</Text>
      <Text weight="medium">{"Instructions"}</Text>
      <Text>{""}</Text>
      {medications.map(
        ({ rowId, medicationUid, drug, dose, quantity, instructions }) => (
          <Fragment key={rowId}>
            <DrugSelector
              patientDentistryId={patientDentistryId}
              drug={drug}
              medications={medications}
              setMedications={setMedications}
            />
            <DoseInput
              drug={drug}
              dose={dose}
              medicationUid={medicationUid}
              setMedications={setMedications}
            />
            <QuantityInput
              drug={drug}
              quantity={quantity}
              medicationUid={medicationUid}
              setMedications={setMedications}
            />
            <InstructionsInput
              drug={drug}
              instructions={instructions}
              medicationUid={medicationUid}
              setMedications={setMedications}
            />
            <Actions
              drug={drug}
              medicationUid={medicationUid}
              setMedications={setMedications}
            />
          </Fragment>
        )
      )}
    </Grid>
  );
};
