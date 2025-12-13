"use client";

// Multivariate Dependencies
import { use } from "react";

// Components
import { PatientAnalytics } from "../../components/PatientAnalytics";

const PatientAnalyticsPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = use(params);
  return <PatientAnalytics params={resolvedParams} />;
};

export default PatientAnalyticsPage;
