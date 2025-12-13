"use client";

// Multivariate Dependencies
import { use } from "react";

// Components
import { PatientGeneral } from "../../components/PatientGeneral";

const PatientGeneralPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = use(params);
  return <PatientGeneral params={resolvedParams} />;
};

export default PatientGeneralPage;
