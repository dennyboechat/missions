"use client";

// Components
import { Skeleton, Text } from "@radix-ui/themes";
import { Space } from "../../ui/Space";

// Types
import { ProjectReportsMedicationProps } from "../types/ProjectReportsMedicationProps";
import { ConsolidatedMedication } from "../types/ConsolidatedMedication";

// Styles
import styles from "../../ProjectReports/styles/ProjectReports.module.css";

export const ProjectReportsMedication = ({
  medications,
  isLoadingReport,
}: ProjectReportsMedicationProps) => {
  if (!medications && !isLoadingReport) {
    return null;
  }

  let medicationTotalQuantity = 0;
  const consolidatedMedications: ConsolidatedMedication[] = [];

  medications?.map(({ drug, dose, quantity }, i) => {
    if (drug) {
      const medication = `${drug} ${dose ?? ""}`;

      const existingMedication = consolidatedMedications.find(
        (consolidatedMedication) =>
          consolidatedMedication.medication === medication
      );

      if (existingMedication) {
        existingMedication.quantity += quantity ?? 0;
      } else {
        consolidatedMedications.push({
          medication: medication,
          quantity: quantity ?? 0,
        });
      }

      medicationTotalQuantity += quantity ?? 0;
    }
  });

  return (
    <>
      {isLoadingReport ? (
        <Skeleton height='300px' />
      ) : (
        <div className={styles.container}>
          <div className={styles.container_title}>
            <Text size="5">{"Prescribed medication"}</Text>
            <Text size="7">{medicationTotalQuantity}</Text>
          </div>
          <Space />
          {consolidatedMedications.map(({ medication, quantity }, i) => (
            <>
              <div
                key={i}
                className={`${styles.container_title} ${styles.table_item}`}
              >
                <Text>{medication}</Text>
                <Text>{quantity}</Text>
              </div>
              <Space />
            </>
          ))}
        </div>
      )}
    </>
  );
};
