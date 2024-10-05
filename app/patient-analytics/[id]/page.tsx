"use client";

// Components
import { PatientAnalytics } from "../../components/PatientAnalytics";

const PatientAnalyticsPage = ({ params }: { params: { id: string } }) => (
  <PatientAnalytics params={params} />
);

export default PatientAnalyticsPage;
