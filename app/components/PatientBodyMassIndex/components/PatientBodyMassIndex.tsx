"use client";

// Components
import { Text } from "@radix-ui/themes";
import { Icon } from "../../ui/Icon";

// Styles
import fieldStyles from "../../../styles/fields.module.css";
import styles from "../styles/PatientBodyMassIndex.module.css";

// Utils
import { getBodyMassIndex } from "@/app/utils/getBodyMassIndex";

// Hooks
import { useState, useEffect } from "react";

export const PatientBodyMassIndex = ({
  weight,
  height,
}: {
  weight?: number;
  height?: number;
}) => {
  const [bmi, setBmi] = useState<string>('0.00');

  useEffect(() => {
    if (weight && height) {
      const calculatedBmi = getBodyMassIndex(weight, height);
      setBmi(calculatedBmi ?? '0.00');
    } else {
      setBmi("0.00");
    }
  }, [weight, height]);

  return (
    <div className={styles.body_mass_index}>
      <Text className={fieldStyles.field_label}>
        <Icon name="bmi" size={15} />
        {"BMI"}
      </Text>
      <Text className={styles.value}>{bmi}</Text>
    </div>
  );
};
