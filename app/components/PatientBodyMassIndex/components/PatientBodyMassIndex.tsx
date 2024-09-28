"use client";

// Components
import { Text } from "@radix-ui/themes";
import { Space } from "../../ui/Space";

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
      setBmi(calculatedBmi);
    } else {
      setBmi("0.00");
    }
  }, [weight, height]);

  return (
    <div>
      <div>
        <Text>{"BMI"}</Text>
      </div>
      <Space height={4} />
      <div>
        <Text>{bmi}</Text>
      </div>
      <Space height={30} />
    </div>
  );
};
