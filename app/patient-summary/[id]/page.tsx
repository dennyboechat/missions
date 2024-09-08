"use client";

// Components
import { PatientSummary } from "../../components/PatientSummary";

const PatientSummaryPage = ({ params }: { params: { id: string } }) => (
  <PatientSummary params={params} />
);

export default PatientSummaryPage;
