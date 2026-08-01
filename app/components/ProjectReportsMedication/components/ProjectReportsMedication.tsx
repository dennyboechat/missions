"use client";

// Components
import {
  ReportPanel,
  ReportPanelList,
  ReportPanelRow,
} from "../../ui/ReportPanel";

// Types
import { ProjectReportsMedicationProps } from "../types/ProjectReportsMedicationProps";
import { ConsolidatedMedication } from "../types/ConsolidatedMedication";

export const ProjectReportsMedication = ({
  medications,
  isLoadingReport,
}: ProjectReportsMedicationProps) => {
  if (!medications && !isLoadingReport) {
    return null;
  }

  let medicationTotalQuantity = 0;
  // Keyed by drug and dose: the same drug at two doses is dispensed separately,
  // so the report keeps them as separate lines.
  const consolidatedMedications = new Map<string, ConsolidatedMedication>();

  medications?.forEach(({ drug, dose, quantity }) => {
    if (!drug) {
      return;
    }

    const amount = Number(quantity ?? 0);
    const key = `${drug} ${dose ?? ""}`;
    const existingMedication = consolidatedMedications.get(key);

    if (existingMedication) {
      existingMedication.quantity += amount;
    } else {
      consolidatedMedications.set(key, {
        drug,
        dose: dose ?? "",
        quantity: amount,
      });
    }

    medicationTotalQuantity += amount;
  });

  // Most dispensed first: with a long list, the lines that matter for restocking
  // are then the ones on screen before any scrolling.
  const sortedMedications = [...consolidatedMedications.values()].sort(
    (a, b) => b.quantity - a.quantity || a.drug.localeCompare(b.drug),
  );

  const highestQuantity = sortedMedications[0]?.quantity ?? 0;

  return (
    <ReportPanel
      title="Prescribed medication"
      total={medicationTotalQuantity}
      subtitle={`${sortedMedications.length} ${
        sortedMedications.length === 1 ? "medication" : "medications"
      }`}
      isLoadingReport={isLoadingReport}
      isEmpty={sortedMedications.length === 0}
      emptyMessage="No medication prescribed in this period."
    >
      <ReportPanelList>
        {sortedMedications.map(({ drug, dose, quantity }) => (
          <ReportPanelRow
            key={`${drug} ${dose}`}
            label={drug}
            detail={dose}
            quantity={quantity}
            share={highestQuantity ? quantity / highestQuantity : 0}
          />
        ))}
      </ReportPanelList>
    </ReportPanel>
  );
};
