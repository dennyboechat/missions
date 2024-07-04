"use client";

// Components
import { MenuItem } from "react-pro-sidebar";
import { PersonIcon, FrameIcon } from "@radix-ui/react-icons";

// Types
import { PatientMenuItemsProps } from "../types/PatientMenuItemsProps";

export const PatientMenuItems = ({
  patientPersonalId,
  activeMenuItem,
}: PatientMenuItemsProps) => {
  const summaryIcon = <FrameIcon />;
  const dentistryIcon = <FrameIcon />;
  const personalIcon = <PersonIcon />;

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
