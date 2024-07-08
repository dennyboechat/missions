"use client";

// Components
import { MenuItem } from "react-pro-sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Types
import { PatientMenuItemsProps } from "../types/PatientMenuItemsProps";

// Icons
import {
  faTooth,
  faListCheck,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

export const PatientMenuItems = ({
  patientPersonalId,
  activeMenuItem,
}: PatientMenuItemsProps) => {
  const summaryIcon = <FontAwesomeIcon icon={faListCheck} />;
  const dentistryIcon = <FontAwesomeIcon icon={faTooth} />;
  const personalIcon = <FontAwesomeIcon icon={faUser} />;

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
        icon={dentistryIcon}
        href={`/patient-dentistry/${patientPersonalId}`}
        active={activeMenuItem === "patient-dentistry"}
      >
        {"Dentistry"}
      </MenuItem>
      <MenuItem
        icon={personalIcon}
        href={`/patient-personal/${patientPersonalId}`}
        active={activeMenuItem === "patient-personal"}
      >
        {"Personal"}
      </MenuItem>
    </>
  );
};
