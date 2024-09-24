"use client";

// Components
import { PatientGeneral } from "../../components/PatientGeneral";

const PatientGeneralPage = ({ params }: { params: { id: string } }) => (
  <PatientGeneral params={params} />
);

export default PatientGeneralPage;
