"use client";

// Components
import { Box, Text } from "@radix-ui/themes";
import { MedicationTable } from "../../ui/MedicationTable";
import { Space } from "../../ui/Space";

// Types
import { Medication } from "../../../types/Medication";
import { PatientGeneralId } from "../../../types/PatientGeneralTypes";

// Hooks
import { useState, useEffect } from "react";
import { usePopupMessage } from "../../../lib/PopupMessage";

// Utils
import { getNewMedicationRecord } from "../../ui/MedicationTable/utils/getNewMedicationRecord";
import { generateUID } from "../../../utils/generateUID";

// Database
import { getPatientGeneralMedications } from "../../../database/patient-general-medication/GetPatientGeneralMedications";
import { insertPatientGeneralMedication } from "../../../database/patient-general-medication/InsertPatientGeneralMedication";
import { updatePatientGeneralMedication } from "../../../database/patient-general-medication/UpdatePatientGeneralMedication";
import { deletePatientGeneralMedication } from "../../../database/patient-general-medication/DeletePatientGeneralMedication";

export const GeneralAppointmentMedicationPrescribed = ({
  patientGeneralId,
}: {
  patientGeneralId: PatientGeneralId;
}) => {
  const { setMessage } = usePopupMessage();
  const [medications, setMedications] = useState<Medication[]>([]);

  useEffect(() => {
    const updatePatientMedications = async () => {
      if (patientGeneralId) {
        const generalMedications = await getPatientGeneralMedications({
          patientGeneralId,
        });

        if (generalMedications) {
          const retrievedMedications: Medication[] = [];

          generalMedications.map(
            ({
              patientGeneralPrescribedMedicationId,
              drug,
              dose,
              quantity,
              instructions,
            }) => {
              retrievedMedications.push({
                rowId: generateUID(),
                medicationUid: patientGeneralPrescribedMedicationId,
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
            `Error to get patient general medications with id ${patientGeneralId}`
          );
        }
      }
    };

    updatePatientMedications();
  }, [patientGeneralId]);

  const insertMedication = async (
    drug: string,
    updatedMedications: Medication[]
  ) => {
    const insertedMedication = await insertPatientGeneralMedication({
      patientGeneralId,
      medication: {
        drug,
      },
    });

    if (insertedMedication) {
      const lastIndex = updatedMedications.length - 1;
      updatedMedications[lastIndex] = {
        ...updatedMedications[lastIndex],
        drug,
        medicationUid: insertedMedication.patientGeneralPrescribedMedicationId,
      };

      if (setMessage) {
        setMessage("Saved");
      }
    } else {
      console.error("Error to insert drug to prescribed medications.");
    }
  };

  const updateMedication = async (
    medicationUid: string,
    field: "drug" | "dose" | "quantity" | "instructions_usage",
    value?: string | number
  ) => {
    return await updatePatientGeneralMedication({
      patientGeneralPrescribedMedicationId: medicationUid,
      field,
      value,
    });
  };

  const deleteMedication = async (medicationUid: string) => {
    await deletePatientGeneralMedication({
      patientGeneralPrescribedMedicationId: medicationUid,
    });
  };

  return (
    <Box>
      <Text>{"Prescribed medication by the doctor:"}</Text>
      <Space height={3} />
      <MedicationTable
        medications={medications}
        setMedications={setMedications}
        insertMedication={insertMedication}
        updateMedication={updateMedication}
        deleteMedication={deleteMedication}
      />
    </Box>
  );
};
