"use client";

// Components
import { Text } from "@radix-ui/themes";

// Types
import { Medication } from "../../../types/Medication";

// Styles
import styles from "../styles/PatientSummary.module.css";

/**
 * What was prescribed at one appointment, read-only.
 *
 * A real table rather than a grid of chips: doses and quantities are meant to
 * be read down a column, which is also why they take the mono face.
 */
export const SummaryMedication = ({
  medications,
}: {
  medications: Medication[];
}) => {
  if (medications.length === 0) {
    return <Text className={styles.empty}>{"None prescribed"}</Text>;
  }

  return (
    <table className={styles.medication}>
      <thead>
        <tr>
          <th>{"Drug"}</th>
          <th>{"Dose"}</th>
          <th>{"Quantity"}</th>
          <th>{"Instructions"}</th>
        </tr>
      </thead>
      <tbody>
        {medications.map(({ rowId, drug, dose, quantity, instructions }) => (
          <tr key={rowId}>
            <td>{drug}</td>
            <td className={styles.numeric_cell}>{dose}</td>
            <td className={styles.numeric_cell}>{quantity}</td>
            <td>{instructions}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
