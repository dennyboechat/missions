"use client";

// Components
import { MenuItem } from "react-pro-sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Types
import { PatientMenuItemsProps } from "../types/PatientMenuItemsProps";

// Icons
import {
  faNotesMedical,
  faTooth,
  faListCheck,
  faUser,
  faChartSimple,
} from "@fortawesome/free-solid-svg-icons";

export const PatientMenuItems = ({
  patientPersonalId,
  activeMenuItem,
}: PatientMenuItemsProps) => {
  const summaryIcon = <FontAwesomeIcon icon={faListCheck} />;
  const generalIcon = <FontAwesomeIcon icon={faNotesMedical} />;
  const dentistryIcon = <FontAwesomeIcon icon={faTooth} />;
  const personalIcon = <FontAwesomeIcon icon={faUser} />;
  const analyticsIcon = <FontAwesomeIcon icon={faChartSimple} />;

  return (
    <>
      <MenuItem
        icon={summaryIcon}
        href={`/patient-summary/${patientPersonalId}`}
        active={activeMenuItem === "patient-summary"}
      >
        {"Summary"}
      </MenuItem>
      <MenuItem
        icon={generalIcon}
        href={`/patient-general/${patientPersonalId}`}
        active={activeMenuItem === "patient-general"}
      >
        {"General"}
      </MenuItem>
      <MenuItem
        icon={dentistryIcon}
        href={`/patient-dentistry/${patientPersonalId}`}
        active={activeMenuItem === "patient-dentistry"}
      >
        {"Dental"}
      </MenuItem>
      <MenuItem
        icon={personalIcon}
        href={`/patient-personal/${patientPersonalId}`}
        active={activeMenuItem === "patient-personal"}
      >
        {"Personal"}
      </MenuItem>
      <MenuItem
        icon={analyticsIcon}
        href={`/patient-analytics/${patientPersonalId}`}
        active={activeMenuItem === "patient-analytics"}
      >
        {"Analytics"}
      </MenuItem>
    </>
  );
};
