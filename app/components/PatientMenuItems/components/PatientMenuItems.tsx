"use client";

// Components
import { MenuItem } from "react-pro-sidebar";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Types
import { PatientMenuItemsProps } from "../types/PatientMenuItemsProps";

// Icons
import {
  faNotesMedical,
  faTooth,
  faListCheck,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

export const PatientMenuItems = ({
  patientPersonalId,
  activeMenuItem,
}: PatientMenuItemsProps) => {
  const summaryIcon = <FontAwesomeIcon icon={faListCheck} />;
  const generalIcon = <FontAwesomeIcon icon={faNotesMedical} />;
  const dentistryIcon = <FontAwesomeIcon icon={faTooth} />;
  const personalIcon = <FontAwesomeIcon icon={faUser} />;

  return (
    <>
      <MenuItem
        icon={summaryIcon}
        component={<Link href={`/patient-summary/${patientPersonalId}`} />}
        active={activeMenuItem === "patient-summary"}
      >
        {"Summary"}
      </MenuItem>
      <MenuItem
        icon={generalIcon}
        component={<Link href={`/patient-general/${patientPersonalId}`} />}
        active={activeMenuItem === "patient-general"}
      >
        {"General"}
      </MenuItem>
      <MenuItem
        icon={dentistryIcon}
        component={<Link href={`/patient-dentistry/${patientPersonalId}`} />}
        active={activeMenuItem === "patient-dentistry"}
      >
        {"Dental"}
      </MenuItem>
      <MenuItem
        icon={personalIcon}
        component={<Link href={`/patient-personal/${patientPersonalId}`} />}
        active={activeMenuItem === "patient-personal"}
      >
        {"Personal"}
      </MenuItem>
    </>
  );
};
