"use client";

// Multivariate Dependencies
import { use } from "react";

// Components
import { PatientSummary } from "../../components/PatientSummary";

const PatientSummaryPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = use(params);
  return <PatientSummary params={resolvedParams} />;
};

export default PatientSummaryPage;
