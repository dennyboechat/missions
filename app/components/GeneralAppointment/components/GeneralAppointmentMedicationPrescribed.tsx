"use client";

// Components
import { Box, Text } from "@radix-ui/themes";
import { MedicationTable } from "../../ui/MedicationTable";
import { Space } from "../../ui/Space";

// Styles
import styles from "../styles/GeneralAppointment.module.css";

// Types
import { Medication } from "../../../types/Medication";
import { GeneralPrescribedMedication } from "../../../types/GeneralPrescribedMedication";
import { PatientGeneralId } from "../../../types/PatientGeneralTypes";
import { databaseRetries } from "../../../types/DatabaseRetries";

// Hooks
import { useState, useEffect, useCallback, useRef } from "react";
import { usePopupMessage } from "../../../lib/PopupMessage";
import { useLiveData } from "../../../lib/useLiveData";

// Utils
import {
  mergeMedicationRows,
  toMedicationRows,
} from "../../ui/MedicationTable/utils/mergeMedicationRows";

// Database
import { getPatientGeneralMedications } from "../../../database/patient-general-medication/GetPatientGeneralMedications";
import { insertPatientGeneralMedication } from "../../../database/patient-general-medication/InsertPatientGeneralMedication";
import { updatePatientGeneralMedication } from "../../../database/patient-general-medication/UpdatePatientGeneralMedication";
import { deletePatientGeneralMedication } from "../../../database/patient-general-medication/DeletePatientGeneralMedication";

// Types
import { actionData } from "../../../types/ActionResult";

export const GeneralAppointmentMedicationPrescribed = ({
  patientGeneralId,
}: {
  patientGeneralId: PatientGeneralId;
}) => {
  const { setMessage, setMessageType } = usePopupMessage();
  const [medications, setMedications] = useState<Medication[]>([]);

  // Whether the cursor is in this table. A refresh that landed while someone was
  // choosing a drug or halfway through an instruction would take the row out from
  // under them -- and would do it to the row whose insert is still in flight,
  // which is the one that cannot be rebuilt from the database yet.
  const tableRef = useRef<HTMLDivElement>(null);

  const isBeingEdited = () => {
    const focused = document.activeElement;

    return Boolean(focused && tableRef.current?.contains(focused));
  };

  // The id is the only thing this table names differently from the dentistry one,
  // so it is renamed here and everything downstream is shared.
  const toRows = (records: GeneralPrescribedMedication[]) =>
    records.map(
      ({
        patientGeneralPrescribedMedicationId,
        drug,
        dose,
        quantity,
        instructions,
      }) => ({
        medicationUid: patientGeneralPrescribedMedicationId,
        drug,
        dose,
        quantity,
        instructions,
      }),
    );

  useEffect(() => {
    const updatePatientMedications = async () => {
      if (patientGeneralId) {
        const generalMedications = actionData(await getPatientGeneralMedications({
          patientGeneralId,
        }));

        if (generalMedications) {
          setMedications(toMedicationRows(toRows(generalMedications)));
        } else {
          console.log(
            `Error to get patient general medications with id ${patientGeneralId}`
          );
        }
      }
    };

    updatePatientMedications();
  }, [patientGeneralId]);

  // The prescription is the one part of an appointment two people are most likely
  // to be in at once -- one examining, one dispensing -- and it used to be read
  // exactly once, when the tab opened. A colleague's prescription never arrived.
  const refreshMedications = useCallback(
    () => getPatientGeneralMedications({ patientGeneralId }),
    [patientGeneralId],
  );

  useLiveData({
    load: refreshMedications,
    apply: (result) => {
      const records = actionData(result);

      if (!records || isBeingEdited()) {
        return;
      }

      setMedications((current) =>
        mergeMedicationRows({ current, incoming: toRows(records) }),
      );
    },
    enabled: Boolean(patientGeneralId),
  });

  const insertMedication = async (
    drug: string,
    updatedMedications: Medication[]
  ) => {
    let attempt = 0;
    let isOnline;

    while (attempt < databaseRetries && !isOnline) {
      isOnline = navigator.onLine;

      if (isOnline) {
        const insertedMedication = actionData(await insertPatientGeneralMedication({
          patientGeneralId,
          medication: {
            drug,
          },
        }));

        if (insertedMedication) {
          const lastIndex = updatedMedications.length - 1;
          updatedMedications[lastIndex] = {
            ...updatedMedications[lastIndex],
            drug,
            medicationUid:
              insertedMedication.patientGeneralPrescribedMedicationId,
          };

          if (setMessage && setMessageType) {
            setMessage("Saved");
            setMessageType("regular");
          }
        } else {
          if (setMessage && setMessageType) {
            setMessage("Error to save. Please try again.");
            setMessageType("error");
          }

          console.error("Error to insert drug to prescribed medications.");
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempt++;
        console.warn(`Attempt to run ${attempt}`);
      }
    }

    if (!isOnline && setMessage && setMessageType) {
      setMessage("Error to save medication. Please try again.");
      setMessageType("error");
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
    return await deletePatientGeneralMedication({
      patientGeneralPrescribedMedicationId: medicationUid,
    });
  };

  return (
    <Box>
      <Text className={styles.section_title}>
        {"Prescribed medication"}
      </Text>
      <Space height={8} />
      {/* The ref is what tells a refresh to wait: everything the user can put a
          cursor in is inside this element. */}
      <div ref={tableRef}>
        <MedicationTable
          medications={medications}
          setMedications={setMedications}
          insertMedication={insertMedication}
          updateMedication={updateMedication}
          deleteMedication={deleteMedication}
        />
      </div>
    </Box>
  );
};
