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
  const personalIcon = <PersonIcon />;
  const dentistryIcon = <FrameIcon />;

  return (
    <>
      <MenuItem
        icon={personalIcon}
        href={`/patient-personal/${patientPersonalId}`}
        active={activeMenuItem === "patient-personal"}
      >
        {"Personal"}
      </MenuItem>
      <MenuItem
        icon={dentistryIcon}
        href={`/patient-dentistry/${patientPersonalId}`}
        active={activeMenuItem === "patient-dentistry"}
      >
        {"Dentistry"}
      </MenuItem>
    </>
  );
};
